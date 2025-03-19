import Itinerary from "../models/Itinerary.js";
import fetchTouristPlaces from "../services/groqServices.js";

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

    // Regex to extract each place entry from `{...}`
    // const placeRegex = /{([^{}]+)}/g;
    // let match;
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
        // Uncomment if you want to fetch coordinates (assuming getCoordinates function exists)
        // const { latitude, longitude } = await getCoordinates(place.name);
        // console.log(latitude);

        validPlaces.push({
          name: place.name,
          visitTime: parseInt(place.visitTime, 10),
          description: place.description,
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
      places: uniquePlaces,
    });

    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
};
