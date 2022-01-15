import bcrypt from 'bcryptjs'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()
const secret: string = process.env.SECRET!

const generateAccessToken = (id: string) => {
  const payload = { id }
  return jwt.sign(payload, secret!)
}

class MovieController {
  async writeMovie(req: Request, res: Response) {
    try {
      const { id } = req.body.user
      const { nameRu, length, year, cover, filmId } = req.body

      const movie = await prisma.movie.create({
        data: {
          nameRu,
          year,
          cover,
          length,
          filmId,
          user: { connect: { id } }
        }
      })
      res.json(movie)
    } catch (e) {
      res.status(400).json({ message: e })
    }
  }

  async updateMovie(req: Request, res: Response) {
    try {
      const { nameRu, length, year, cover, filmId } = req.body

      const movie = await prisma.movie.update({
        where: {
          filmId
        },
        data: {
          nameRu,
          length,
          year,
          cover,
          filmId
        }
      })
      res.json(movie)
    } catch (e) {
      res.status(400).json({ message: e })
    }
  }

  async getMovies(req: Request, res: Response) {
    try {
      const { id } = req.body.user
      const userWithMovies = await prisma.user.findUnique({
        where: { id },
        include: { movies: true }
      })
      res.json(userWithMovies)
    } catch (e) {
      res.status(400).json({ message: 'Login error' })
    }
  }
}

export default new MovieController()
