export type PaymentIntent = {
  id: string;
  amountCents: number;
  currency: "brl";
  status: "requires_provider";
};

export interface PaymentProvider {
  createPaymentIntent(amountCents: number, reservationId: number): Promise<PaymentIntent>;
}

export class UnconfiguredPaymentProvider implements PaymentProvider {
  async createPaymentIntent(_amountCents: number, _reservationId: number): Promise<PaymentIntent> {
    throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
  }
}

export function getPaymentProvider(): PaymentProvider {
  // Stripe or another PSP can implement this interface without coupling booking
  // logic to a provider. Never mark a reservation paid from the client.
  return new UnconfiguredPaymentProvider();
}
