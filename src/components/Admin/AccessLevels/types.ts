
export interface AccessLevel {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Record<string, boolean>;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccessLevelWithCount extends AccessLevel {
  _count?: {
    users: number;
  };
}
