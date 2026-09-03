export type ShippingQuote = {
  service: string;
  provider: string;
  amount: number;
  currency: "ZAR";
  etaMinDays: number;
  etaMaxDays: number;
};

export interface FulfilmentProvider {
  quote(input: unknown): Promise<ShippingQuote[]>;
  createShipment(input: unknown): Promise<{ reference: string }>;
  cancelShipment(reference: string): Promise<void>;
  getTracking(reference: string): Promise<{ status: string }>;
  handleWebhook(payload: unknown): Promise<void>;
}

export class SandboxFulfilmentProvider implements FulfilmentProvider {
  async quote(): Promise<ShippingQuote[]> {
    return [{
      service: "standard",
      provider: "sandbox",
      amount: 8500,
      currency: "ZAR",
      etaMinDays: 2,
      etaMaxDays: 4
    }];
  }

  async createShipment() {
    return { reference: `ship_sandbox_${crypto.randomUUID()}` };
  }

  async cancelShipment() {}

  async getTracking() {
    return { status: "created" };
  }

  async handleWebhook() {}
}
