const ZA_MOBILE = /^(\+27|27|0)([6-8][0-9]{8})$/;

export function normalizeSouthAfricanMobile(input: string): string {
  const compact = input.replace(/[\s()-]/g, "");
  const match = compact.match(ZA_MOBILE);

  if (!match) {
    throw new Error("INVALID_ZA_MOBILE");
  }

  return `+27${match[2]}`;
}
