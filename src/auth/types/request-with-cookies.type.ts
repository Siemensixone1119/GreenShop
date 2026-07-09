import { Request } from "express";

export type RequestWithCookie = Request & {
    cookies: {
        accessToken?: string;
        refreshToken?: string
        sessionId?: number;
    }
};
