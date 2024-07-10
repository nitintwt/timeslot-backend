import mongoose , {Schema} from "mongoose";

const slotSchema = new Schema(
  {
    creator:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    date:{
      type: Date,
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