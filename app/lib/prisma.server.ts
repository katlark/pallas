import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { singleton } from "./singleton.server";

const url = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url });
const prisma = singleton(
  "prisma-password-reset-v1",
  () => new PrismaClient({ adapter }),
);

export { prisma };
