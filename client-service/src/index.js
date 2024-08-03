import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'
import cluster from 'cluster'
import os from 'os'

// to give env access to every file 
dotenv.config({
  path:'./.env'
})

//const totalCPUs = os.cpus().length

/*The cluster module in Node.js allows you to create multiple instances of your Node.js application that can run on multiple CPU cores.
 This helps improve the performance and reliability of your application by distributing the load across all available CPU cores.*/

// checks if the current process is primary or not
// If it is the primary process, it forks a new worker process for each available CPU core using cluster.fork()
/*if (cluster.isPrimary){
  for (let i =0 ; i< totalCPUs ; i++){
    cluster.fork()
  }
} else {*/
  // worker process / every new instance
  connectDB()
  .then(()=>{
    app.listen(process.env.PORT || 4000 , ()=>{
      console.log(`Server is running at port : ${process.env.PORT}`)
      
    })
  })
  .catch((err)=>{
    console.log("MONGODB CONNECTION FAILED !!!" , err)
  })



