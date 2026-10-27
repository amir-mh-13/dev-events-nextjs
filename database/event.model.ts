import mongoose, { Schema, type Model } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
	slug: {
 	 type: String,
 	 trim: true,
	},
    description: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["online", "offline", "hybrid"],
    },
    audience: {
      type: String,
      required: true,
      trim: true,
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (items: string[]) =>
          items.length > 0 &&
          items.every((item) => item.trim().length > 0),
        message: "Agenda must contain non-empty items.",
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (items: string[]) =>
          items.length > 0 &&
          items.every((item) => item.trim().length > 0),
        message: "Tags must contain non-empty items.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create a unique index so two events cannot share the same slug.
eventSchema.index({ slug: 1 }, { unique: true });

function createSlug(title: string): string {
  return title
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Normalize dates to YYYY-MM-DD and times to 24-hour HH:mm.
function normalizeDate(value: string): string {
  const input = value.trim();
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Event date must be a valid date.");
  }

  // Preserve date-only inputs without timezone conversion.
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split("-").map(Number);
    const check = new Date(Date.UTC(year, month - 1, day));

    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day
    ) {
      throw new Error("Event date must be a valid calendar date.");
    }

    return input;
  }

  return date.toISOString().slice(0, 10);
}

function normalizeTime(value: string): string {
  const input = value.trim();
  const match = input.match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  );

  if (!match) {
    throw new Error("Event time must use HH:mm or h:mm AM/PM format.");
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (minutes > 59) {
    throw new Error("Event time contains invalid minutes.");
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      throw new Error("Event time contains invalid hours.");
    }

    hours = hours % 12;

    if (meridiem === "PM") {
      hours += 12;
    }
  } else if (hours > 23) {
    throw new Error("Event time contains invalid hours.");
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Run document-level normalization before saving.
eventSchema.pre("save", function () {
  if (this.isModified("title")) {
    const slug = createSlug(this.title);

    if (!slug) {
      throw new Error("Event title must produce a valid slug.");
    }

    this.slug = slug;
  }

  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
});

// Reuse the compiled model during Next.js development reloads.
const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent> | undefined) ??
  mongoose.model<IEvent>("Event", eventSchema);

export default Event;
