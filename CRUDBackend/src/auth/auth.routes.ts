import { Router } from "express";
import { login, refreshToken, logout } from './auth.controller.js';

export const loginRouter = Router();

loginRouter.post('/login', login); // POST /auth/login
loginRouter.post('/refresh-token', refreshToken); // POST /auth/refresh-token
loginRouter.post('/logout', logout); // POST /auth/logout