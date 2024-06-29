import mongoose , {Schema} from "mongoose";

const customerSchema = new Schema(
  {
    customerEmail:{
      type: String,
      required: true
    },
    customerName :{
      type: String,
      required: true,
    },
    reasonForMeet:{
      type: String,
    },
    slot:{
      type: Schema.Types.ObjectId,
      ref: 'Slot'
    },
  },
  {
    timestamps: true,
  }
)

export const Customer = mongoose.model("Customer" , customerSchema)