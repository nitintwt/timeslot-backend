import mongoose, {Schema} from "mongoose";

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
      default: null,
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

export const User = mongoose.model("User" , userSchema)