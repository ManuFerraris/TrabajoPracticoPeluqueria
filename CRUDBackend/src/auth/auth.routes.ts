import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  validateAccessToken
  } from './auth.controller.js';

export const loginRouter = Router();

loginRouter.get('/validate-reset-token', validateResetToken);
loginRouter.get('/validate-token', validateAccessToken);

loginRouter.post('/login', login); // POST /auth/login 
loginRouter.post('/refresh-token', refreshToken); // POST /auth/refresh-token
loginRouter.post('/logout', logout); // POST /auth/logout

loginRouter.post('/request-password-reset', requestPasswordReset); // POST /auth/request-password-reset
loginRouter.post('/reset-password', resetPassword); // POST /auth/reset-password