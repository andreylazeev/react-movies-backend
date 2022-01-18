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
      const { nameRu, nameEn, countries, nameOriginal, filmLength, viewedLength, year, cover, filmId } = req.body

      const movie = await prisma.movie.create({
        data: {
          nameRu,
          nameEn,
          countries,
          nameOriginal,
          year,
          cover,
          filmLength,
          isFavorite: true,
          updatedAt: Date.now(),
          viewedLength,
          filmId,
          user: { connect: { id } }
        }
      })
      res.json(movie)
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: e })
    }
  }

  async updateMovie(req: Request, res: Response) {
    try {
      const { id, isFavorite } = req.body

      const movie = await prisma.movie.update({
        where: {
          id
        },
        data: {
          isFavorite,
          updatedAt: Date.now(),
        }
      })
      res.json(movie)
    } catch (e) {
      console.log(e);
      
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
      const {password, ...result} = JSON.parse(JSON.stringify(userWithMovies))

      res.json(result)
    } catch (e) {
      res.status(400).json({ message: 'Login error' })
    }
  }
}

export default new MovieController()
