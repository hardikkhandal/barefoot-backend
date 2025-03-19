// geocode.js

import axios from "axios";

// Function to get coordinates for a given place name
export async function getCoordinates(placeName) {
  const apiKey = "AIzaSyDoUTRvQfrchjjKiMhEPGH7r3eMukndUeA"; // Replace with your actual API key
  const encodedPlaceName = encodeURIComponent(placeName);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedPlaceName}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { data } = response;

    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } else {
      console.error("Geocoding API error:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching geocoding data:", error.message);
    return null;
  }
}
