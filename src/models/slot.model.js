import mongoose , {Schema} from "mongoose";

const slotSchema = new Schema(
  {
    creator:{
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    date:{
      type: String,
      required: true
    },
    startTime:{
      type: String,
      required: true
    },
    endTime:{
      type: String,
      required: true
    },
    paid :{
      type: Boolean,
      default: false,
    },
    price:{
      type: Number,
    },
    booked:{
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true
  }
)

export const Slot = mongoose.model("Slot" , slotSchema)