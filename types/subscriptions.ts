import { User } from "./users";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  duration_type: string;
  duration_value: number;
  price: string;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  payment_transaction_id: number | null;
  plan_type: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled";
  auto_renew: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  users: User;
  subscription_plans: SubscriptionPlan;
}

export interface SubscriptionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}
