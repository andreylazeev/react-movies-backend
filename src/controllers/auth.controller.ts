import bcrypt from 'bcryptjs'
import { validationResult } from "express-validator"
import jwt from 'jsonwebtoken'
import {Request, Response} from 'express'


import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()
const secret: string = process.env.SECRET!

const generateAccessToken = (id: string) => {
  const payload = {id}
  return jwt.sign(payload, secret!)
}

class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        res.status(400).json(errors)
      }

      const {username, password} = req.body
      const candidate = await prisma.user.findUnique({
        where: {
          username
        }
      })

      if (candidate) {
        return res.status(400).json({message: 'Такой пользователь существует'})
      }

      const hashedPassword = bcrypt.hashSync(password, 5)

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword
        }
      })

      return res.json({message: 'пользователь создан'})

    } catch (e) {
      res.status(400).json({message: "Login error"})
    }
  }

  async login(req: Request, res: Response) {
    try {
      const {username, password} = req.body

      const user = await prisma.user.findUnique({
        where: {
          username
        }
      })

      if(!user) {
        return res.status(400).json({message: "Пользователя не существует"})
      }

      const validPassword = bcrypt.compareSync(password, user.password)

      if(!validPassword) {
        return res.status(400).json({message: "неверный пароль"})
      }

      const token = generateAccessToken(user.id)

      return res.json({token})


    } catch (e) {
      res.status(400).json({message: "Login error"})
    }
  }

}

export default new AuthController()