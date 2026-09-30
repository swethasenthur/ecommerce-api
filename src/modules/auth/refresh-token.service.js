import {
    createHash,
    randomBytes
} from "node:crypto";

const REFRESH_TOKEN_BYTES = 64;

export function createRawRefreshToken() {
    return randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

export function hashRefreshToken(token) {
    return createHash("sha256")
        .update(token, "utf8")
        .digest("hex");
}

export function createTokenFamilyId() {
    return randomBytes(16).toString("hex");
}