import prisma from "../../config/prisma.js";

export async function createAuthSession({
    userId,
    tokenHash,
    familyId,
    parentSessionId = null,
    expiresAt,
    client = prisma
}) {
    return client.auth_sessions.create({
        data: {
            user_id: userId,
            token_hash: tokenHash,
            family_id: familyId,
            parent_session_id: parentSessionId,
            expires_at: expiresAt
        }
    });
}

export async function findAuthSessionByTokenHash(tokenHash) {
    return prisma.auth_sessions.findUnique({
        where: {
            token_hash: tokenHash
        },
        include: {
            users: true
        }

    });
}

export async function markAuthSessionUsed(
    sessionId,
    usedAt = new Date(),
    client = prisma
) {
    return client.auth_sessions.update({
        where: {
            id: sessionId
        },
        data: {
            used_at: usedAt
        }
    });
}

export async function revokeAuthSession(
    sessionId,
    revokedAt = new Date()
) {
    return prisma.auth_sessions.update({
        where: {
            id: sessionId
        },
        data: {
            revoked_at: revokedAt
        }
    });
}

export async function revokeAuthSessionFamily(
    familyId,
    revokedAt = new Date()
) {
    return prisma.auth_sessions.updateMany({
        where: {
            family_id: familyId,
            revoked_at: null
        },
        data: {
            revoked_at: revokedAt
        }
    });
}

export async function revokeAllUserSessions(
    userId,
    revokedAt = new Date()
) {
    return prisma.auth_sessions.updateMany({
        where: {
            user_id: userId,
            revoked_at: null
        },
        data: {
            revoked_at: revokedAt
        }
    });
}