import express from 'express'
import AuthRouter from './routes/auth.router'
import MovieRouter from './routes/movie.router'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})
app.use(cors())
app.use(express.json())
app.use('/auth', AuthRouter)
app.use('/api', MovieRouter)

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  socket.on('time', async (value: { [key: string]: any }) => {
    console.log('time');
    
    const {nameRu, filmLength, year} = value.response
    const parsedValue = {
      time: parseInt(value.time.toFixed(2)) / 60,
      id: value.id,
      response: value.response,
      userId: value.userId
    }

    const candidate = await prisma.movie.findUnique({
      where: {
        filmId: parsedValue.id
      }
    })
    if (candidate) {
      const movie = await prisma.movie.update({
        where: {
          filmId: parsedValue.id
        },
        data: {
          viewedLength: parsedValue.time,
          updatedAt: Date.now(),
        }
      })
      return
    }
      const movie = await prisma.movie.create({
        data: {
          nameRu, filmLength, year,
          filmId: parseInt(parsedValue.response.kinopoiskId),
          isFavorite: false,
          countries: parsedValue.response.countries.map(
            (country: { [key: string]: any }) => country.country
          ),
          viewedLength: parsedValue.time,
          cover: parsedValue.response.posterUrl,
          coverPreview: parsedValue.response.posterUrlPreview,
          updatedAt: Date.now(),
          user: { connect: { id: parsedValue.userId } }
        }
      })
    socket.emit('update movies')
  })
})

server.listen(5000, () => console.log('server started'))