import express, {Request, Response} from 'express'
import dotenv from 'dotenv'
dotenv.config()
import router from './controllers/auth'
import errorHandlerMiddleWare from './Middlewares/ErrorHandlerMiddleWare'
import { JobRouter } from './controllers/jobApplication'
import cors from 'cors'
import helmet from "helmet";
import rateLimit from "express-rate-limit";


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: "Too many requests from this IP, please try again later"
});
const app = express()
const PORT = process.env.PORT || 3000

app.use(limiter);
app.use(cors({
  origin: '*', 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(helmet());
app.use(express.json())
app.use('/api/v1/auth', router )
app.use('/api/v1/job', JobRouter )

app.get('/', (req:Request, res:Response) => {
  res.send('job apllication tracker is live....')
})

// app.use(ZodError)
app.use(errorHandlerMiddleWare)


app.listen(PORT, () => {
    console.log(`SERVER IS LISTENING IN PORT: ${PORT}`);
})