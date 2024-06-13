import mongoose , {Schema} from "mongoose";

const customerSchema = new Schema(
  {
    customerEmail:{
      tyepe: String,
      required: true
    },
    customerName :{
      type: String,
      required: true,
    },
    slot:{
      tyepe: Schema.Types.ObjectId,
      ref: 'Slot'
    }
  }
)

export const Customer = mongoose.model("Customer" , customerSchema)