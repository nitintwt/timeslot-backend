import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    fullName:{
      type : String,
      required: true,
    },
    password:{
      type:String
    },
    refreshToken:{
        type:String
    },
    userName:{
      type : String,
      unique: true,
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
    razorpayId:{
      type : String,
      default: null,
    },
    tokens:{
      type:String,
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

// here we care encrypting our password just brfore saving the user data, using pre hook of mongoose
userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();  // if the password is not modified , just direct save the data without encrypting

  this.password = await bcrypt.hash(this.password, 10)
  next()  //function has completed its task and that Mongoose can proceed to the next middleware function or operation in the queue.
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
  return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      username:this.username,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  )
}

export const User = mongoose.model("User" , userSchema)