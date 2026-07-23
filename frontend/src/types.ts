// Represents a single diary entry record
export interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  owner_id: number;
}

// Credentials structure required for user login
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

// Credentials structure required for registering a new user account
export interface RegisterCredentials {
  email?: string;
  username?: string;
  password: string;
}