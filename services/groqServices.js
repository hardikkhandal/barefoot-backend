import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const fetchTouristPlaces = async (
  location,
  placeType,
  timeAvailable
) => {
  try {
    const prompt = `Provide ONLY a valid JSON array (without any explanations or extra text) listing in ${location} for ${placeType} visitors. 
    Each item should have:
    - "name": The place name
    - "visitTime": Average time to visit in hours (rounded to a single number)
    - "description": A short description
    Example Output:
    [
      {"name": "Amber Fort", "visitTime": 2, "description": "A majestic fort with Mughal architecture"},
      {"name": "Hawa Mahal", "visitTime": 1, "description": "A palace with a honeycombed structure for cool breezes"}
    ]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const response = chatCompletion.choices[0]?.message?.content || "";
    return response;
  } catch (error) {
    console.error("Error fetching data from Groq API:", error);
    return null;
  }
};

export default fetchTouristPlaces;
