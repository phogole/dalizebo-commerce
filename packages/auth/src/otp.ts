import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashOtp(otp: string, challengeId: string, secret: string): string {
  return createHash("sha256")
    .update(`${challengeId}:${otp}:${secret}`)
    .digest("hex");
}

export function verifyOtpHash(
  suppliedOtp: string,
  challengeId: string,
  secret: string,
  expectedHash: string
): boolean {
  const actual = Buffer.from(hashOtp(suppliedOtp, challengeId, secret), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
