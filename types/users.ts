export interface User {
  id: number;
  email: string;
  phone: string;
  auth_type: string;
  name: string;
  gender: "male" | "female" | "prefer_not_to_say";
  location_id: number | null;
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  premium_expires_at: string | null;
  profile_completion_percentage: number;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface UsersResponse {
  data: User[];
  pagination: UserPagination;
}
