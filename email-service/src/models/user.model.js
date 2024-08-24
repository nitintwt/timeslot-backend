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