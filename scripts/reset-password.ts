import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { users } from "../src/db/schema";

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: pnpm db:reset-password <email> <new-password>");
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const passwordHash = hashSync(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.email, email));

  console.log(`Password reset for ${email}`);
}

resetPassword().catch((err) => {
  console.error("Failed to reset password:", err);
  process.exit(1);
});
