export interface Author {
  id: number;
  name: string;
  bio: string | null;
}

export async function getAuthors(db: D1Database): Promise<Author[]> {
  const { results } = await db.prepare("SELECT id, name, bio FROM authors ORDER BY name").all<Author>();
  return results;
}

export async function createAuthor(db: D1Database, name: string, bio?: string): Promise<Author> {
  const row = await db
    .prepare("INSERT INTO authors (name, bio) VALUES (?, ?) RETURNING id, name, bio")
    .bind(name, bio ?? null)
    .first<Author>();
  return row!;
}
