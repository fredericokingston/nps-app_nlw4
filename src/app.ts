import expres, { NextFunction } from 'express';
import { Request, Response} from 'express';
import 'express-async-errors';
import { AppError } from "../src/errors/AppError";
import createConnection from './database';
import { router } from './routes';

createConnection();
const app = expres();

app.use(expres.json());
app.use(router);

app.use( 
    (err: Error, request: Request, response: Response, _next: NextFunction) => {

        if (err instanceof AppError ) {
            return response.status(err.statusCode).json({
                message: err.message
            });            
        }

        return response.status(500).json({
            status: "Error",
            message: `Internal server error ${err.message}`
        });
    }
);

export { app };