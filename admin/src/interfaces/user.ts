export default interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  phone_number: string;
  avatar_url: string;
  address: string;
  token_divice: string;
  created_date: Date;
}
