export const USER_ROLES = Object.freeze({
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN"
});

export const USER_STATUSES = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED"
});

export const AUTH_ERRORS = Object.freeze({
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_INACTIVE: "Account is not active",
  TOKEN_REQUIRED: "Authentication token is required",
  TOKEN_INVALID: "Invalid or expired authentication token",
  FORBIDDEN: "You do not have permission to perform this action"
});