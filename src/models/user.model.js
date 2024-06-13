import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
  {
    fullName:{
      type : String,
      required: true,
      index: true
    },
    email:{
      type : String,
      required: true,
      unique:true,
    },
    paidUser:{
      type:Boolean,
      default: false,
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