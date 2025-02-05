import {Express} from "@types/express";

declare global {
    namespace Express {
        type ExpressImpl = Express;
    }
}