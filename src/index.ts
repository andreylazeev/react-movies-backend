import express from 'express'
import AuthRouter from './routes/auth.router'
import MovieRouter from './routes/movie.router';
import cors from 'cors'
const app = express()
app.use(cors())
app.use(express.json())
app.use('/auth',AuthRouter)
app.use('/api',MovieRouter)
app.listen(5000, () => console.log('server started'))