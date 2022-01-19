import express, { Request, Response } from 'express'
import AuthRouter from './routes/auth.router'
import MovieRouter from './routes/movie.router'
import http from 'http'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(express.json())
app.use('/auth', AuthRouter)
app.use('/api', MovieRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('hello')
})

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

server.listen(5000, () => console.log('server started'))
