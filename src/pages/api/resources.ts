import type { APIRoute } from "astro";
import { getDB, queryResources } from "../../server/db";

export const GET: APIRoute = async (context) => {
  try {
    const db = getDB(context);
    const url = new URL(context.request.url);
    const categoryId = url.searchParams.get("category_id");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.id, 
        r.title, 
        r.created_at,
        rl.file_size, 
        nt.code as source_code,
        nt.name as source_name,
        c.name as category_name,
        rl.share_url
      FROM resources r
      LEFT JOIN resource_links rl ON r.id = rl.resource_id
      LEFT JOIN netdisk_types nt ON rl.type_id = nt.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.status = 1
    `;

    const params: any[] = [];

    if (categoryId && categoryId !== "null" && categoryId !== "undefined") {
      query += ` AND r.category_id = ?`;
      params.push(categoryId);
    }

    query += ` GROUP BY r.id ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const resources = await queryResources(db, query, params);

    return new Response(JSON.stringify(resources), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
