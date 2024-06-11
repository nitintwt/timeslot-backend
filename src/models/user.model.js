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
    }
  },
  {
    timestamps: true
  }
)

export const User = mongoose.model("User" , userSchema)