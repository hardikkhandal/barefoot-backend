import mongoose from "mongoose";

const ItinerarySchema = new mongoose.Schema({
  location: String,
  placeType: String,
  timeAvailable: Number,
  places: [
    {
      name: String,
      visitTime: Number,
      description: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Itinerary", ItinerarySchema);
