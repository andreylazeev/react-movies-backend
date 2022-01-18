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

const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean, lastFn: ReturnType<typeof setTimeout>, lastTime: number
  return function (this: any) {
    const context = this,
      args = arguments
    if (!inThrottle) {
      fn.apply(context, args)
      lastTime = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFn)
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args)
          lastTime = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastTime), 0))
    }
  }
}

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  socket.on(
    'time',
    throttle(async (value: { [key: string]: any }) => {
      const { nameRu, filmLength, year } = value.response
      const parsedValue = {
        time: parseInt(value.time.toFixed(2)) / 60,
        id: value.id,
        response: value.response,
        userId: value.userId,
        uniqueId: value.uniqueId
      }

      let candidate: any = await prisma.movie.findUnique({
        where: {
          id: parsedValue.uniqueId
        }
      }).catch(() => candidate = false)
      if (candidate) {
        try {
          console.log('update on db')

          await prisma.movie.update({
            where: {
              id: parsedValue.uniqueId
            },
            data: {
              viewedLength: parsedValue.time,
              updatedAt: Date.now()
            }
          })
        } catch (e) {
          return
        }
      } else {
        try {
          console.log('add to db')

          await prisma.movie.create({
            data: {
              nameRu,
              filmLength,
              year,
              filmId: parseInt(parsedValue.response.kinopoiskId),
              isFavorite: false,
              countries: parsedValue.response.countries?.map(
                (country: { [key: string]: any }) => country.country
              ),
              viewedLength: parsedValue.time,
              cover: parsedValue.response.posterUrl,
              coverPreview: parsedValue.response.posterUrlPreview,
              updatedAt: Date.now(),
              user: { connect: { id: parsedValue.userId } }
            }
          })
          socket.emit('updateData')
        } catch (e) {
          console.log(e)
        }
      }
    }, 10000)
  )
})

server.listen(5000, () => console.log('server started'))
