import type { PublicUser } from '../../users/types/public-user.type.js';

export type AuthResult = {
  user: PublicUser;
  refreshToken: string;
  accessToken: string;
  sessionId: number;
};
