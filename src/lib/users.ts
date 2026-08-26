export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: "admin" | "editor";
}

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: "admin" | "editor";
}

function mapRow(row: UserRow): User {
  return { id: row.id, email: row.email, passwordHash: row.password_hash, role: row.role };
}

export async function countUsers(db: D1Database): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();
  return row?.count ?? 0;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = await db
    .prepare("SELECT id, email, password_hash, role FROM users WHERE email = ?")
    .bind(email)
    .first<UserRow>();
  return row ? mapRow(row) : null;
}

export async function createUser(
  db: D1Database,
  email: string,
  passwordHash: string,
  role: "admin" | "editor" = "admin"
): Promise<User> {
  const row = await db
    .prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?) RETURNING id, email, password_hash, role")
    .bind(email, passwordHash, role)
    .first<UserRow>();
  return mapRow(row!);
}
