export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  auth0Id?: string;
  birthDate?: string | Date;
  gender?: string;
  role?: 'CUSTOMER' | 'MARKET_ADMIN';
  marketId?: string;
  market?: {
    id: string;
    name: string;
    address: string;
    profilePicture?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

