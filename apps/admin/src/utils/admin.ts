import { User } from '../types';

export function getAdminEmail(user: User | null | undefined): string {
  if (user && user.email) {
    return user.email;
  }
  return 'admin@taazabites.com';
}
