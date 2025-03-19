import axios from "axios";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_API_KEY"; // Add your API key here

const getCoordinates = async (placeName) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: placeName,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const { results } = response.data;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return { latitude: null, longitude: null };
  }
};

export default getCoordinates;
