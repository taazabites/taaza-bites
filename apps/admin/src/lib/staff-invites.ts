/** Email-slug invite id — used until staff first login claims admins/{uid} */
export function emailInviteId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
}

export type StaffInviteStatus = 'pending' | 'accepted' | 'revoked';

export interface StaffInvite {
  email: string;
  name: string;
  role: string;
  status: StaffInviteStatus;
  createdAt: string;
  createdBy?: string;
  acceptedAt?: string;
  acceptedUid?: string;
}
