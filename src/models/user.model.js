import mongoose, {Schema} from "mongoose";

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
      index: true    // used with field , which will be used to search the user . optimize the search
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