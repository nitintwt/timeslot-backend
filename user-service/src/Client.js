import {createClient} from 'redis'
import dotenv from 'dotenv'

dotenv.config({
  path:'./.env'
})

// using this client we can interact with our redis server
const client = createClient({
  socket:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT
  }
})

export default client