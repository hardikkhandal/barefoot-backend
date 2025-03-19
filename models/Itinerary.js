// import mongoose from "mongoose";

// const ItinerarySchema = new mongoose.Schema({
//   location: String,
//   placeType: String,
//   timeAvailable: Number,
//   places: [
//     {
//       name: String,
//       visitTime: Number,
//       description: String,
//       longitude: Number,
//       latitude: Number,
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Itinerary", ItinerarySchema);

import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema({
  name: String,
  visitTime: Number,
  description: String,
  latitude: Number, // ✅ Added latitude field
  longitude: Number, // ✅ Added longitude field
});

const ItinerarySchema = new mongoose.Schema({
  location: String,
  placeType: String,
  timeAvailable: Number,
  places: [PlaceSchema], // ✅ Array of enriched places
});

export default mongoose.model("Itinerary", ItinerarySchema);
