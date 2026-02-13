import { createHash, randomBytes } from "node:crypto";

import type { PasswordResetToken, User } from "../../generated/prisma/client";
import { prisma } from "~/lib/prisma.server";

const RESET_TOKEN_BYTES = 32;
const DEFAULT_EXPIRY_MINUTES = 60;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken({
  userId,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}: {
  userId: User["id"];
  expiresInMinutes?: number;
}) {
  const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return null;

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return null;
  }

  await prisma.passwordResetToken.delete({ where: { id: record.id } });
  return record;
}

export async function deleteExpiredPasswordResetTokens() {
  return prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

export type { PasswordResetToken };
