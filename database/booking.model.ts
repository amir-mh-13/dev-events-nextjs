import mongoose, {
  Schema,
  Types,
  type Model,
} from "mongoose";
import Event from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Confirm that the referenced event exists before saving a booking.
bookingSchema.pre("save", async function () {
  const eventExists = await Event.exists({
    _id: this.eventId,
  });

  if (!eventExists) {
    throw new Error("Cannot create a booking for a non-existent event.");
  }
});

// Reuse the compiled model during Next.js development reloads.
const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking> | undefined) ??
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
