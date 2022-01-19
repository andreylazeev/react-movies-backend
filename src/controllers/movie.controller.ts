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
      const { nameRu, nameEn,coverPreview, isFavorite, nameOriginal, filmLength, viewedLength, year, cover, filmId } = req.body

      const movie = await prisma.movie.create({
        data: {
          nameRu,
          nameEn,
          nameOriginal,
          year,
          cover,
          coverPreview,
          filmLength,
          isFavorite,
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
      const { id, isFavorite, viewedLength } = req.body

      const movie = await prisma.movie.update({
        where: {
          id
        },
        data: {
          isFavorite,
          viewedLength,
          updatedAt: Date.now(),
        }
      })
      res.json(movie)
    } catch (e) {
      console.log(e);
      
      res.status(400).json({ message: e })
    }
  }

  async deleteMovie(req: Request, res: Response) {
    try {
      const { id } = req.params

      const movie = await prisma.movie.delete({
        where: {
          id
        },
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

      res.json({...result, movies: result.movies.reverse()})
    } catch (e) {
      res.status(400).json({ message: 'Login error' })
    }
  }
}

export default new MovieController()
