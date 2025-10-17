import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import appRouter from './routers';
import cookie from 'cookie-parser';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet())
app.use(morgan('dev'));

app.use("/api/v1/auth", appRouter);


export default app;