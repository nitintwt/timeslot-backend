import mongoose, {Schema} from "mongoose";
import crypto from 'crypto'



const userSchema = new Schema(
  {
    fullName:{
      type : String,
      required: true,
    },
    userName:{
      type : String,
      unique: true,
      default: null,
      index: true    //optimize the search
    },
    email:{
      type : String,
      required: true,
      unique:true,
      index: true
    },
    paidUser:{
      type:Boolean,
      default: false,
    },
    stripeAccountId:{
      type : String,
      default: null,
    },
    tokens:{
      type: String,  
    },
    slots: [
      {
        type: Schema.Types.ObjectId,
        ref:'Slot'
      }
    ],
    customers:[
      {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
      }
    ]
  },
  {
    timestamps: true
  }
)

userSchema.pre("save" , async (next)=>{
  const cipher = crypto.createCipheriv('aes-256-cbc' , process.env.CRYPTO_KEY , process.env.CRYPTO_IV)
  const encrypted = cipher.update(this.tokens , 'utf-8' , 'hex')
  encrypted += cipher.final('hex')
  this.tokens =encrypted
  next()
})

export const User = mongoose.model("User" , userSchema)