export interface Size {
  _id: string;
  name: string;
  code?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  is_deleted?: boolean;
}
