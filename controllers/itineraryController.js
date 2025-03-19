import Itinerary from "../models/Itinerary.js";
import fetchTouristPlaces from "../services/groqServices.js";
import getCoordinates from "../services/getCoordinates.js";

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
        console.log(`${place.name} has ${coordinates.latitude}`);
        if (!coordinates) {
          console.warn(`Skipping ${place.name} due to missing coordinates`);
          continue;
        }

        validPlaces.push({
          name: place.name,
          visitTime: parseInt(place.visitTime, 10),
          description: place.description,
          latitude: coordinates.latitude, // Add latitude
          longitude: coordinates.longitude, // Add longitude
        });
      } else {
        console.warn("Skipping invalid place:", place);
      }
    }

    // Remove duplicate places based on 'name'
    const uniquePlaces = [];
    const placeSet = new Set();
    for (const place of extractedPlaces) {
      if (!placeSet.has(place.name)) {
        placeSet.add(place.name);
        uniquePlaces.push(place);
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
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
};
