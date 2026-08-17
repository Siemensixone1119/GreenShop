import type { Request } from 'express';
import type { PublicUser } from '../../users/types/public-user.type.js';

export type RequestWithUser = Request & {
  user: PublicUser;
};
