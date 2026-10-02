export type JwtPayload = {
  sub: string;
  sessionId: string;
  role: string;
  iat?: number;
  exp?: number;
};
