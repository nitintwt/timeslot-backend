import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import paymentRouter from './routes/payment.routes.js'

const app = express ()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true,
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/payment" , paymentRouter)

app.get("/", (req , res)=>{
  return res.status(200).json({ message: "going good from payment-service" });
})

export {app}