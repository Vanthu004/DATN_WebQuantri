export interface Color {
  _id: string;
  name: string;
  code?: string;
  hex_code?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  is_deleted?: boolean;
}
