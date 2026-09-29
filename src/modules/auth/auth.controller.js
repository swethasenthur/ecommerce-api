import {
  getCurrentUser,
  loginUser,
  registerUser
} from "./auth.service.js";
export async function register(req, res, next) {
  try {
    const user = await registerUser({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });

    return res.status(201).json({
      data: user
    });
  } catch (error) {
    return next(error);
  }
}
export async function login(req, res, next) {
  try {
    const result = await loginUser({
      email: req.body.email,
      password: req.body.password
    });

    return res.status(200).json({
      data: result
    });
  } catch (error) {
    return next(error);
  }
}
export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      data: user
    });
  } catch (error) {
    return next(error);
  }
}