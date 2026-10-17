import postgres from "postgres";

// Un solo grupo de conexiones por proceso. prepare: false es necesario con el
// "Transaction pooler" de Supabase (puerto 6543), que usa Vercel.
const global = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  global.sql ??
  postgres(process.env.DATABASE_URL ?? "", {
    prepare: false,
    max: 5,
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== "production") global.sql = sql;
