import { verifyAccessToken } from "./token.service.js";

export function authenticate(req, res, next) {
    const authorization = req.get("authorization");

    if (!authorization) {
        return res.status(401).json({
            error: "Authentication token is required"
        });
    }

    const [scheme, token] = authorization.split(" ");

    if (
        scheme?.toLowerCase() !== "bearer" ||
        !token ||
        authorization.split(" ").length !== 2
    ) {
        return res.status(401).json({
            error: "Invalid authentication token"
        });
    }

    try {
        const payload = verifyAccessToken(token);

        if (!payload.sub || typeof payload.sub !== "string") {
            return res.status(401).json({
                error: "Invalid authentication token"
            });
        }

        req.user = {
            id: payload.sub,
            role: payload.role
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired authentication token"
        });
    }
}