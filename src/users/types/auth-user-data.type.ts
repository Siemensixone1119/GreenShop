import { PublicUser } from './public-user.type.js';

export type AuthUser = PublicUser & {
  passwordHash: string;
};
