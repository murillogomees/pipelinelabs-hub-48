
export interface Customer {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  customer_type: 'individual' | 'company';
  created_at?: string;
  updated_at?: string;
}

export interface NewCustomer {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  customer_type: 'individual' | 'company';
}
