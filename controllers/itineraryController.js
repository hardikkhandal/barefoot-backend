import Itinerary from "../models/Itinerary.js";
import fetchTouristPlaces from "../services/groqServices.js";
import getCoordinates from "../services/getCoordinates.js";
import { planOptimalItinerary } from "../services/calculateOptimalRoute.js";

export const generateItinerary = async (req, res) => {
  try {
    const { location, timeAvailable, placeType } = req.body;

    // Fetch response from Groq API
    let rawResponse = await fetchTouristPlaces(
      location,
      placeType,
      timeAvailable
    );
    if (!rawResponse)
      return res.status(500).json({ error: "Failed to fetch places" });

    console.log("Raw API Response:", rawResponse);

    // Remove unwanted characters (e.g., `json`, ``` blocks, newlines)
    let cleanedResponse = rawResponse
      .replace(/```json|```/g, "") // Remove markdown code block
      .replace(/\n/g, "") // Remove newlines
      .trim();

    let extractedPlaces = [];

    try {
      extractedPlaces = JSON.parse(cleanedResponse);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      return res.status(500).json({ error: "Invalid JSON format in response" });
    }

    // Validate the extracted places
    const validPlaces = [];
    for (const place of extractedPlaces) {
      if (place.name && place.visitTime && place.description) {
        const coordinates = await getCoordinates(place.name);
        if (!coordinates) continue; // Skip places without coordinates

        validPlaces.push({
          name: place.name,
          visitTime: parseInt(place.visitTime, 10),
          description: place.description,
          latitude: coordinates.latitude, // Add latitude
          longitude: coordinates.longitude, // Add longitude
        });
      }
    }

    // Save itinerary in the database
    const itinerary = new Itinerary({
      location,
      placeType,
      timeAvailable,
      places: validPlaces,
    });

    await itinerary.save();
    console.log("Itinery saved in db");

    const optimizedItinerary = planOptimalItinerary(validPlaces, timeAvailable);
    res.json({ itinerary: optimizedItinerary });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
};
