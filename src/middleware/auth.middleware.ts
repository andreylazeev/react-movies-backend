import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import dotenv from 'dotenv'
import {Request, Response, NextFunction} from 'express'

dotenv.config()
const secret: string = process.env.SECRET!

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {

    const token = req.headers.authorization!.split(' ')[1] // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ message: 'Нет авторизации' })
    }

    const decoded = jwt.verify(token, secret!) as {id: string}
    req.body.user = decoded
    next()

  } catch (e) { 
    res.status(401).json({ message: 'Нет авторизации' })
  }
}