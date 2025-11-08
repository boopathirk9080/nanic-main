// src/types/index.ts
export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  company_code: string;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportProduct {
  id: string;
  user_id: string;
  company_id: string;
  brand_code: string;
  product_name: string;
  category: string | null;
  strip_count: number;
  per_strip_tablet_count: number;
  import_price: number;
  created_at: string;
  updated_at: string;
  companies?: Pick<Company, "company_name" | "company_code">;
}
