import type { APIRoute } from "astro";
import { getDB, queryResources } from "../../server/db";

export const GET: APIRoute = async (context) => {
  try {
    const db = getDB(context);
    
    // Example query: Get all resources
    // Replace 'resources' with your actual table name
    // const results = await queryResources(db, "SELECT * FROM resources LIMIT 10");
    
    // For demonstration, returning a message since table structure is unknown
    return new Response(
      JSON.stringify({
        message: "D1 Database connection successful",
        // data: results
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
