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
    const placeRegex = /{([^{}]+)}/g;
    let match;
    const extractedPlaces = [];

    while ((match = placeRegex.exec(cleanedResponse)) !== null) {
      let placeEntry = `{${match[1]}}`; // Add curly braces back

      try {
        let placeObj = JSON.parse(placeEntry); // Parse each object separately

        // Validate structure before adding
        if (placeObj.name && placeObj.visitTime && placeObj.description) {
          const { latitude, longitude } = await getCoordinates(placeObj.name);

          extractedPlaces.push({
            name: placeObj.name,
            visitTime: parseInt(placeObj.visitTime, 10),
            description: placeObj.description,
            latitude,
            longitude,
          });
        }
      } catch (err) {
        console.error("Skipping invalid entry:", placeEntry);
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
