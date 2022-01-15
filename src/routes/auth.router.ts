import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { check } from "express-validator";

const AuthRouter = Router()
AuthRouter.post('/registration', 
[
  check('username', 'поле пользователя пустое').notEmpty(),
  check('password', 'пароль не должен быть короче 6 символов').isLength({min: 6})
], AuthController.registration)
AuthRouter.get('/login', AuthController.login)

export default AuthRouter