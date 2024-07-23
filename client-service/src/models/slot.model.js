import mongoose , {Schema} from "mongoose";

const slotSchema = new Schema(
  {
    creator:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    date:{
      type: String,
      required: true,
      index: true
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
    status:{
      type: String,
      required: 'not booked'
    }
  },
  {
    timestamps: true
  }
)

export const Slot = mongoose.model("Slot" , slotSchema)