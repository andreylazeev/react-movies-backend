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

server.listen(process.env.PORT || 5000, () => console.log('server started'))
