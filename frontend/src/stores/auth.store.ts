import { atom } from 'jotai';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authAtom = atom<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
});

export const isAuthenticatedAtom = atom(
  (get) => get(authAtom).isAuthenticated
);

export const userAtom = atom(
  (get) => get(authAtom).user
);

export const tokenAtom = atom(
  (get) => get(authAtom).token
);
