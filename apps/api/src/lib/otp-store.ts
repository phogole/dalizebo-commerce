import { randomUUID } from "node:crypto";
import { generateOtp, hashOtp, verifyOtpHash } from "@dalizebo/auth";
import { env } from "../config/env.js";
import { redis } from "./dependencies.js";

const TTL_SECONDS = 5 * 60;
const MAX_ATTEMPTS = 5;

type StoredChallenge = { phone: string; hash: string; attempts: number };

export async function createOtpChallenge(phone: string) {
  const challengeId = randomUUID();
  const otp = generateOtp();
  const record: StoredChallenge = {
    phone,
    hash: hashOtp(otp, challengeId, env.OTP_SECRET),
    attempts: 0,
  };
  await redis.set(
    `otp:${challengeId}`,
    JSON.stringify(record),
    "EX",
    TTL_SECONDS,
  );
  return { challengeId, otp, expiresInSeconds: TTL_SECONDS };
}

export async function verifyOtpChallenge(
  challengeId: string,
  suppliedOtp: string,
) {
  const key = `otp:${challengeId}`;
  const raw = await redis.get(key);
  if (!raw) return { valid: false as const, reason: "expired_or_missing" };
  const record = JSON.parse(raw) as StoredChallenge;
  if (record.attempts >= MAX_ATTEMPTS) {
    await redis.del(key);
    return { valid: false as const, reason: "attempts_exhausted" };
  }
  if (!verifyOtpHash(suppliedOtp, challengeId, env.OTP_SECRET, record.hash)) {
    record.attempts += 1;
    const ttl = await redis.ttl(key);
    if (record.attempts >= MAX_ATTEMPTS) await redis.del(key);
    else await redis.set(key, JSON.stringify(record), "EX", Math.max(ttl, 1));
    return { valid: false as const, reason: "invalid" };
  }
  await redis.del(key);
  return { valid: true as const, phone: record.phone };
}
