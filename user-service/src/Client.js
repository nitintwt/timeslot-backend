import {createClient} from 'redis'

// using this client we can interact with our redis server
const client = createClient({
  socket:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT
  }
})

export default client