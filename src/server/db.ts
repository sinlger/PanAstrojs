import type { APIContext } from "astro";

export const getDB = (context: APIContext) => {
  if (context.locals.runtime?.env?.panastro) {
    return context.locals.runtime.env.panastro;
  }
  throw new Error("D1 Database 'panastro' not found in context.");
};

export const queryResources = async (
  db: D1Database,
  query: string,
  params: any[] = []
) => {
  try {
    const stmt = db.prepare(query).bind(...params);
    const { results } = await stmt.all();
    return results;
  } catch (error) {
    console.error("Database query failed:", error);
    return [];
  }
};
