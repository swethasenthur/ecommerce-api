import prisma from "../../config/prisma.js";
import {
    createHash,
    randomBytes,
    randomUUID
} from "node:crypto";
import {
    createAuthSession,
    findAuthSessionByTokenHash,
    markAuthSessionUsed,
    revokeAuthSessionFamily,
    revokeAuthSession
} from "./auth-sessions.repository.js";

import { createAccessToken } from "./token.service.js";

const REFRESH_TOKEN_BYTES = 64;

function createInvalidRefreshTokenError() {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    error.code = "INVALID_REFRESH_TOKEN";
    return error;
}

export function createRawRefreshToken() {
    return randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

export function hashRefreshToken(token) {
    return createHash("sha256")
        .update(token, "utf8")
        .digest("hex");
}

export function createTokenFamilyId() {
    return randomUUID();
}
const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(
    process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30
);

export async function createRefreshSession({
    userId,
    familyId = createTokenFamilyId()
}) {
    const rawRefreshToken = createRawRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setUTCDate(
        expiresAt.getUTCDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS
    );

    const session = await createAuthSession({
        userId,
        tokenHash,
        familyId,
        parentSessionId: null,
        expiresAt
    });

    return {
        refreshToken: rawRefreshToken,
        session
    };

}
export async function rotateRefreshToken(rawRefreshToken) {
    if (
        typeof rawRefreshToken !== "string" ||
        rawRefreshToken.length === 0
    ) {
        throw createInvalidRefreshTokenError();
    }
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const session = await findAuthSessionByTokenHash(tokenHash);

    if (!session) {
        throw createInvalidRefreshTokenError();
    }
    const now = new Date();

    if (
        session.revoked_at ||
        session.expires_at <= now
    ) {
        throw createInvalidRefreshTokenError();

    }

    if (session.used_at) {
        await revokeAuthSessionFamily(session.family_id);
        throw createInvalidRefreshTokenError();
    }

    const user = session.users;

    if (!user || user.status !== "ACTIVE") {
        throw createInvalidRefreshTokenError();
    }

    const replacementRawToken = createRawRefreshToken();
    const replacementTokenHash = hashRefreshToken(
        replacementRawToken
    );

    const replacementExpiresAt = new Date();
    replacementExpiresAt.setUTCDate(
        replacementExpiresAt.getUTCDate() +
        REFRESH_TOKEN_EXPIRES_IN_DAYS
    );
    const accessToken = createAccessToken(user);

    await prisma.$transaction(async (tx) => {
        await markAuthSessionUsed(session.id, now, tx);

        await createAuthSession({
            userId: user.id,
            tokenHash: replacementTokenHash,
            familyId: session.family_id,
            parentSessionId: session.id,
            expiresAt: replacementExpiresAt,
            client: tx
        });
    });
    return {
        accessToken,
        refreshToken: replacementRawToken,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
    };
}
export async function revokeRefreshToken(rawRefreshToken) {
    if (
        typeof rawRefreshToken !== "string" ||
        rawRefreshToken.length === 0
    ) {
        return;
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);

    const session = await findAuthSessionByTokenHash(tokenHash);

    if (!session || session.revoked_at) {
        return;
    }

    await revokeAuthSession(session.id);
}
