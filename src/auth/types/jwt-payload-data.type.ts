export type JwtPayload = {
    sub: number;
    sessionId: number;
    role: string;
    iat?: number;
    exp?: number;
}