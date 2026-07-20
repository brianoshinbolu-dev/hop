export interface OrgRow {
  id: string
  name: string
  slug: string
  plan: "free" | "starter" | "pro" | "enterprise"
  billing_email: string | null
  paystack_customer_code: string | null
  paystack_subscription_code: string | null
  subscription_status: "active" | "trialing" | "past_due" | "cancelled" | "expired"
  subscription_ends_at: string | null
  dot_number: string | null
  mc_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
  created_at: string | null
  updated_at: string | null
}

export interface InvoiceRow {
  id: string
  org_id: string
  plan: "starter" | "pro" | "enterprise"
  amount: number
  currency: string
  status: "paid" | "failed" | "refunded" | "pending"
  paystack_reference: string | null
  paystack_transaction_id: string | null
  paystack_authorization: Record<string, unknown> | null
  paid_at: string | null
  period_start: string | null
  period_end: string | null
  created_at: string | null
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  org_id: string | null
  role: string | null
  created_at: string | null
  updated_at: string | null
}
