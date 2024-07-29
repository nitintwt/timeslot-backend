import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'
import { emailWorker } from './controllers/mail.controller.js'
import { cancelationEmailWorker } from './controllers/mail.controller.js'


// to give env access to every file 
dotenv.config({
  path:'./.env'
})

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 4000 , ()=>{
    console.log(`Server is running at port : ${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.log("MONGODB CONNECTION FAILED !!!" , err)
})