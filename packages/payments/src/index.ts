export type Currency = "ZAR" | string;

export type Money = {
  amount: number;
  currency: Currency;
};

export type PaymentStatus =
  | "pending"
  | "requires_action"
  | "authorized"
  | "captured"
  | "partially_refunded"
  | "refunded"
  | "failed"
  | "cancelled";

export type PaymentRecord = {
  reference: string;
  amount: Money;
  status: PaymentStatus;
};

export interface PaymentProvider {
  initialize(input: { amount: Money; idempotencyKey: string }): Promise<PaymentRecord>;
  authorize(reference: string): Promise<PaymentRecord>;
  capture(reference: string): Promise<PaymentRecord>;
  refund(reference: string, amount?: Money): Promise<PaymentRecord>;
  cancel(reference: string): Promise<PaymentRecord>;
  getStatus(reference: string): Promise<PaymentRecord>;
}

export class SandboxPaymentProvider implements PaymentProvider {
  private readonly records = new Map<string, PaymentRecord>();
  private readonly idempotency = new Map<string, string>();

  async initialize(input: { amount: Money; idempotencyKey: string }) {
    const existingRef = this.idempotency.get(input.idempotencyKey);
    if (existingRef) return this.getStatus(existingRef);

    const reference = `pay_sandbox_${crypto.randomUUID()}`;
    const record: PaymentRecord = {
      reference,
      amount: input.amount,
      status: "pending"
    };

    this.records.set(reference, record);
    this.idempotency.set(input.idempotencyKey, reference);
    return record;
  }

  async authorize(reference: string) {
    return this.update(reference, "authorized");
  }

  async capture(reference: string) {
    return this.update(reference, "captured");
  }

  async refund(reference: string, amount?: Money) {
    const current = await this.getStatus(reference);
    return this.update(
      reference,
      amount && amount.amount < current.amount.amount
        ? "partially_refunded"
        : "refunded"
    );
  }

  async cancel(reference: string) {
    return this.update(reference, "cancelled");
  }

  async getStatus(reference: string) {
    const record = this.records.get(reference);
    if (!record) throw new Error("PAYMENT_NOT_FOUND");
    return record;
  }

  private async update(reference: string, status: PaymentStatus) {
    const current = await this.getStatus(reference);
    const next = { ...current, status };
    this.records.set(reference, next);
    return next;
  }
}
