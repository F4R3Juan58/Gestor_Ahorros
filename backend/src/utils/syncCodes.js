import crypto from "crypto";

export const createId = () => crypto.randomUUID();
export const createSyncCode = () => crypto.randomBytes(3).toString("hex").slice(0, 5).toUpperCase();
