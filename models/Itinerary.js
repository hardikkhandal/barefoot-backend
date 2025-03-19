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
      latitude: Number, // Added for route optimization
      longitude: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Itinerary", ItinerarySchema);
