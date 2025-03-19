import haversine from "haversine-distance";

/**
 * Plans an optimal itinerary by finding the shortest path within the user's time limit.
 * @param {Array} places - List of places with lat, lon, and visitTime.
 * @param {Number} timeAvailable - Total available time for visiting places.
 * @returns {Object} Optimized itinerary and total time spent.
 */

export const planOptimalItinerary = (places, timeAvailable) => {
  if (!places || places.length === 0) {
    throw new Error("No places available for itinerary");
  }

  // Create a distance matrix using Haversine formula
  const distanceMatrix = {};
  for (let i = 0; i < places.length; i++) {
    distanceMatrix[places[i].name] = {};
    for (let j = 0; j < places.length; j++) {
      if (i !== j) {
        distanceMatrix[places[i].name][places[j].name] =
          haversine(
            { lat: places[i].latitude, lon: places[i].longitude },
            { lat: places[j].latitude, lon: places[j].longitude }
          ) / 1000; // Convert meters to km
      }
    }
  }

  // Sort places by shortest distance from the first location
  let sortedPlaces = [places[0]];
  let remaining = places.slice(1);
  let totalTime = places[0].visitTime;

  while (remaining.length > 0) {
    let last = sortedPlaces[sortedPlaces.length - 1];

    // Find the nearest place that fits within the remaining time
    let nearest = null;
    let minDistance = Infinity;
    for (let place of remaining) {
      let travelTime = distanceMatrix[last.name][place.name] / 30; // Assuming 30 km/h speed
      if (
        totalTime + travelTime + place.visitTime <= timeAvailable &&
        distanceMatrix[last.name][place.name] < minDistance
      ) {
        nearest = place;
        minDistance = distanceMatrix[last.name][place.name];
      }
    }

    if (!nearest) break; // No more places fit within the time limit

    // Add the nearest place to the itinerary
    sortedPlaces.push(nearest);
    totalTime += minDistance / 30 + nearest.visitTime; // Travel time + visit time
    remaining = remaining.filter((p) => p.name !== nearest.name);
  }

  return { plannedItinerary: sortedPlaces, totalTime };
};
