import { Router } from "express";
import MovieController from '../controllers/movie.controller';
import { auth } from '../middleware/auth.middleware';

const MovieRouter = Router()
MovieRouter.post('/movie',auth, MovieController.writeMovie)
MovieRouter.post('/movie/update',auth, MovieController.updateMovie)
MovieRouter.get('/movies', auth, MovieController.getMovies)

export default MovieRouter