import { Request } from "express"
import { PublicUser } from "../../users/types/public-user.type.js"

export type RequestWithUser = Request & {
    user: PublicUser
}