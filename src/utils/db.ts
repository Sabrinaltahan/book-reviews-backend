import { promises as fs } from "fs";
import path from "path";

export type DbUser = {
  id: string;
  email: string;
  passwordHash: string;
};

export type DbReview = {
  id: string;
  objectId: string; // book id from Google Books
  userId: string;
  text: string;
  rating: number;
  createdAt: string;
};

export type DbSchema = {
  users: DbUser[];
  reviews: DbReview[];
};

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

export async function readDb(): Promise<DbSchema> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbSchema;
}

export async function writeDb(data: DbSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}