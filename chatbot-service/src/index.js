import axios from 'axios'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import {ChromaClient, Collection} from 'chromadb'

dotenv.config()

const openai = new OpenAI()
const chromaClient = new ChromaClient({path:"http://localhost:8000"})
chromaClient.api.getV2Heartbeat()

const WEB_COLLECTION=`WEB_SCRAPED_DATA_COLLECTION`

const scrapeWebpage = async (url)=>{
  const {data}= await axios.get(url)
  const $ = cheerio.load(data)

  const pageHead =$('head').html()
  const pageBody = $('body').html()

  const internalLinks=[]
  const externalLinks=[]

  $('a').each((_,el)=>{
    const link = $(el).attr('href')
    if(link==='/') return
    if(link.startsWith('http')|| link.startsWith('https')){
      externalLinks.push(link)
    } else{
      internalLinks.push(link)
    }
  })

  return {head:pageHead , body:pageBody , internalLinks , externalLinks}
}

const generateVectorEmbeddings = async({text})=>{
  const embedding = await openai.embeddings.create({
    model:'text-embedding-3-small',
    input: text,
    encoding_format:'float'
  })
  return embedding.data[0].embedding
}

const insertIntoDB= async ({embedding , url , head  , body=''})=>{
  const collection = await chromaClient.getOrCreateCollection({
    name:WEB_COLLECTION
  })

  collection.add({
    ids:[url],
    embeddings:[embedding],
    metadatas:[{url , body , head}]
  })

}

const injest = async(url)=>{
  console.log(`injecting${url}`)
  const {head , body , internalLinks}= await scrapeWebpage(url)
  const bodyChunks = chunkText(body , 1000)

  for(const chunk of bodyChunks){
    const bodyEmbedding = await generateVectorEmbeddings({text:chunk})
    await insertIntoDB({embedding:bodyEmbedding , url , head , body:chunk})
  }

  for (const link of internalLinks){
    const _url=`${url}${link}`
    injest(_url)
  }
  console.log("injested" , url)
}

injest("https://www.timeslot.co.in")


function chunkText(text , chunkSize){
  if(!text || chunkSize <=0) return []

  const words = text.split(/\s+/)
  const chunks=[]
  for(let i=0 ; i<words.length ; i+=chunkSize){
    chunks.push(words.slice(i,i+chunkSize).join(' '))
  }
  return chunks
}