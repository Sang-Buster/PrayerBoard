import { sql } from "@vercel/postgres";

// Auto-migrate: ensure is_pinned column exists
let migrated = false;
async function ensurePinnedColumn() {
  if (migrated) return;
  try {
    await sql`ALTER TABLE prayers ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`;
  } catch {
    // Column already exists or table doesn't exist yet
  }
  migrated = true;
}

export interface Prayer {
  id: number;
  name: string;
  request: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  created_at: string;
}

export interface PaginatedPrayers {
  prayers: Prayer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  anonymousPercentage: number;
  dailyCounts: { date: string; count: number }[];
}

export async function insertPrayer(
  name: string,
  request: string,
  isAnonymous: boolean
): Promise<void> {
  await sql`
    INSERT INTO prayers (name, request, is_anonymous)
    VALUES (${isAnonymous ? "Anonymous" : name}, ${request}, ${isAnonymous})
  `;
}

export async function getPrayers(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedPrayers> {
  await ensurePinnedColumn();
  const offset = (page - 1) * limit;

  let prayersResult;
  let countResult;

  if (search && search.trim()) {
    const pattern = `%${search.trim()}%`;
    [prayersResult, countResult] = await Promise.all([
      sql`SELECT * FROM prayers WHERE name ILIKE ${pattern} OR request ILIKE ${pattern} ORDER BY is_pinned DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) as total FROM prayers WHERE name ILIKE ${pattern} OR request ILIKE ${pattern}`,
    ]);
  } else {
    [prayersResult, countResult] = await Promise.all([
      sql`SELECT * FROM prayers ORDER BY is_pinned DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) as total FROM prayers`,
    ]);
  }

  const total = parseInt(countResult.rows[0].total, 10);

  return {
    prayers: prayersResult.rows as Prayer[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStats(): Promise<Stats> {
  const [totalResult, todayResult, weekResult, anonResult, dailyResult] =
    await Promise.all([
      sql`SELECT COUNT(*) as total FROM prayers`,
      sql`SELECT COUNT(*) as count FROM prayers WHERE created_at >= CURRENT_DATE`,
      sql`SELECT COUNT(*) as count FROM prayers WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      sql`SELECT 
            COUNT(*) FILTER (WHERE is_anonymous = true) as anonymous_count,
            COUNT(*) as total_count
          FROM prayers`,
      sql`SELECT 
            DATE(created_at) as date, 
            COUNT(*) as count 
          FROM prayers 
          GROUP BY DATE(created_at) 
          ORDER BY date ASC`,
    ]);

  const total = parseInt(totalResult.rows[0].total, 10);
  const today = parseInt(todayResult.rows[0].count, 10);
  const thisWeek = parseInt(weekResult.rows[0].count, 10);
  const anonCount = parseInt(anonResult.rows[0].anonymous_count, 10);
  const totalCount = parseInt(anonResult.rows[0].total_count, 10);
  const anonymousPercentage =
    totalCount > 0 ? Math.round((anonCount / totalCount) * 100) : 0;

  // Build daily counts from all available data
  const dailyCounts: { date: string; count: number }[] = [];
  if (dailyResult.rows.length > 0) {
    const firstDate = new Date(dailyResult.rows[0].date);
    const now = new Date();
    const startDate = new Date(firstDate);
    startDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = diffDays; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = dailyResult.rows.find(
        (r) => new Date(r.date).toISOString().split("T")[0] === dateStr
      );
      dailyCounts.push({
        date: dateStr,
        count: found ? parseInt(found.count, 10) : 0,
      });
    }
  }

  return { total, today, thisWeek, anonymousPercentage, dailyCounts };
}

export async function updatePrayer(
  id: number,
  request: string
): Promise<void> {
  await sql`
    UPDATE prayers SET request = ${request} WHERE id = ${id}
  `;
}

export async function togglePinPrayer(id: number, pinned: boolean): Promise<void> {
  await ensurePinnedColumn();
  await sql`
    UPDATE prayers SET is_pinned = ${pinned} WHERE id = ${id}
  `;
}

export async function getAllPrayersForExport(): Promise<Prayer[]> {
  await ensurePinnedColumn();
  const result = await sql`SELECT * FROM prayers ORDER BY created_at DESC`;
  return result.rows as Prayer[];
}

export async function setupDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS prayers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) DEFAULT 'Anonymous',
      request TEXT NOT NULL,
      is_anonymous BOOLEAN DEFAULT false,
      is_pinned BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at DESC)
  `;
  // Add is_pinned column if it doesn't exist (migration for existing DBs)
  try {
    await sql`ALTER TABLE prayers ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`;
  } catch {
    // Column may already exist
  }
}
