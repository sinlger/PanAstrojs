import type { APIRoute } from "astro";
import { getDB, runQuery, queryResources } from "@/server/db";

export const POST: APIRoute = async (context) => {
  try {
    const db = getDB(context);
    const body = await context.request.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid format: messages array missing" }), {
        status: 400,
      });
    }

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Pre-fetch dictionaries to minimize DB calls
    const existingTags = await queryResources(db, "SELECT * FROM tags");
    const tagMap = new Map(existingTags.map((t: any) => [t.name, t.id]));

    const existingNetdiskTypes = await queryResources(db, "SELECT * FROM netdisk_types");
    const netdiskMap = new Map(existingNetdiskTypes.map((t: any) => [t.code, t.id]));
    
    // Helper to get or create tag
    const getOrCreateTagId = async (tagName: string) => {
      if (tagMap.has(tagName)) return tagMap.get(tagName);
      try {
        const result = await runQuery(db, "INSERT INTO tags (name) VALUES (?)", [tagName]);
        // D1 run() returns meta info. We need to fetch the ID or rely on success.
        // Since we can't easily get the LastInsertId reliably across all drivers without a generic way,
        // we'll re-query. Or use the result.meta.last_row_id if available (D1 specific).
        // Let's re-query to be safe and portable-ish.
        const [newTag] = await queryResources(db, "SELECT id FROM tags WHERE name = ?", [tagName]);
        if (newTag) {
          tagMap.set(tagName, newTag.id);
          return newTag.id;
        }
      } catch (e) {
        // Ignore unique constraint errors, just query again
        const [existing] = await queryResources(db, "SELECT id FROM tags WHERE name = ?", [tagName]);
        if (existing) {
          tagMap.set(tagName, existing.id);
          return existing.id;
        }
      }
      return null;
    };

    // Helper to identify netdisk type
    const identifyNetdiskType = (url: string) => {
      if (url.includes("alipan.com") || url.includes("aliyundrive.com")) return "aliyun";
      if (url.includes("pan.quark.cn")) return "quark";
      if (url.includes("pan.baidu.com")) return "baidu";
      if (url.includes("115.com")) return "115";
      if (url.includes("cloud.189.cn")) return "189";
      // Add more as needed
      return "other"; // You might want to handle 'other' or default
    };

    // Helper to parse file size from text
    const parseFileSize = (text: string): number => {
      // Matches "大小：12.5GB", "Size: 100MB", etc.
      const match = text.match(/(?:大小|Size)[：:]\s*([\d.]+)\s*([KMGT]?B?)/i);
      if (!match) return 0;

      const num = parseFloat(match[1]);
      const unit = match[2].toUpperCase();

      let multiplier = 1;
      if (unit.startsWith("K")) multiplier = 1024;
      else if (unit.startsWith("M")) multiplier = 1024 * 1024;
      else if (unit.startsWith("G")) multiplier = 1024 * 1024 * 1024;
      else if (unit.startsWith("T")) multiplier = 1024 * 1024 * 1024 * 1024;

      return Math.floor(num * multiplier);
    };

    // Helper to clean content (remove ads, specific patterns)
    const cleanContent = (text: string): string => {
      let cleaned = text;
      
      // Remove ad lines
      const adPatterns = [
        /国内影视频道.*(\n|$)/g,
        /国外影视频道.*(\n|$)/g,
        /@Aliyun_4K_Movies/g,
        /@Netdisk_Movies/g,
        /频道：.*(\n|$)/g,
        /关注.*(\n|$)/g,
        // Remove lines that are just dashes or typical ad separators if needed
        /-{3,}/g
      ];

      for (const pattern of adPatterns) {
        cleaned = cleaned.replace(pattern, "");
      }

      // Remove empty lines resulting from deletions
      return cleaned.replace(/\n{3,}/g, "\n\n").trim();
    };

    for (const msg of messages) {
      // Basic validation
      if (!msg.text || (typeof msg.text !== 'string' && !Array.isArray(msg.text))) {
        skippedCount++;
        continue;
      }

      try {
        // 1. Parse Message Content
        let rawText = "";
        let title = "";
        let links: { url: string; code: string }[] = [];
        let tags: string[] = [];
        
        // Handle the mixed structure of "text"
        const entities = Array.isArray(msg.text) ? msg.text : [{ type: 'plain', text: msg.text }];
        
        for (const entity of entities) {
          const content = typeof entity === 'string' ? entity : entity.text;
          const type = typeof entity === 'string' ? 'plain' : entity.type;

          // Skip ad entities if they are purely links/mentions to ad channels
          if (type === 'mention' && (content.includes('Aliyun_4K_Movies') || content.includes('Netdisk_Movies'))) {
             continue;
          }

          rawText += content;

          if (type === 'bold' && !title) {
            title = content.trim(); // Assume first bold is title
          }
          
          if (type === 'link') {
            const url = content.trim();
             // Clean up markdown link syntax if present e.g. `url`
            const cleanUrl = url.replace(/`/g, "").trim();
            const code = identifyNetdiskType(cleanUrl);
            if (code !== 'other') {
                links.push({ url: cleanUrl, code });
            }
          }

          if (type === 'hashtag') {
            tags.push(content.replace('#', '').trim());
          }
        }
        
        // Fallback for title: First line of text
        if (!title) {
          title = rawText.split('\n')[0].substring(0, 100).trim();
        }

        // If no links found, skip (not a resource post)
        if (links.length === 0) {
           skippedCount++;
           continue;
        }

        // 2. Insert or Update Resource
        // Clean rawText for description
        const description = cleanContent(rawText);
        
        // Parse file size from rawText
        const fileSize = parseFileSize(rawText);

        // Get category from frontend classification or null
        const categoryId = msg._categoryId || null;

        let resourceId: number;

        // Check if resource exists by Telegram Message ID
        const existingRes = await queryResources(db, "SELECT id FROM resources WHERE tg_msg_id = ? LIMIT 1", [msg.id]);

        if (existingRes.length > 0) {
            // UPDATE existing
            resourceId = existingRes[0].id;
            
            await runQuery(db, 
                "UPDATE resources SET title = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [title, description, categoryId, resourceId]
            );

            // Clean up old links and tags to replace with new parsed data
            await runQuery(db, "DELETE FROM resource_links WHERE resource_id = ?", [resourceId]);
            await runQuery(db, "DELETE FROM resource_tag_refs WHERE resource_id = ?", [resourceId]);
            
        } else {
            // INSERT new
            const resInsert = await runQuery(db, 
              "INSERT INTO resources (title, description, category_id, status, tg_msg_id) VALUES (?, ?, ?, 1, ?)",
              [title, description, categoryId, msg.id]
            );
            
            if (resInsert.meta && resInsert.meta.last_row_id) {
                resourceId = resInsert.meta.last_row_id;
            } else {
                const [r] = await queryResources(db, "SELECT MAX(id) as id FROM resources");
                resourceId = r.id;
            }
        }

        // 3. Insert Links
        for (const link of links) {
          let typeId = netdiskMap.get(link.code);
          if (!typeId) {
             // If code exists but not in map (shouldn't happen if we pre-fetched), or need to create
             // For now skip if unknown type, or maybe default to 'other' if we had it
             continue; 
          }
          
          await runQuery(db,
            "INSERT INTO resource_links (resource_id, type_id, share_url, sharer_name, is_valid, file_size) VALUES (?, ?, ?, ?, 1, ?)",
            [resourceId, typeId, link.url, msg.from || "Telegram", fileSize]
          );
        }

        // 4. Insert Tags and Refs
        for (const tagName of tags) {
          const tagId = await getOrCreateTagId(tagName);
          if (tagId) {
            await runQuery(db, 
              "INSERT OR IGNORE INTO resource_tag_refs (resource_id, tag_id) VALUES (?, ?)",
              [resourceId, tagId]
            );
          }
        }

        importedCount++;

      } catch (err: any) {
        errorCount++;
        errors.push(`Msg ${msg.id}: ${err.message}`);
        console.error(err);
      }
    }

    return new Response(JSON.stringify({
      importedCount,
      skippedCount,
      errorCount,
      errors
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
