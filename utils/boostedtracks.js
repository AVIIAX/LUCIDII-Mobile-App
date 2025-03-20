// Import the necessary Firestore functions and your db instance
import {getFirestore, collection, doc, getDoc } from "firebase/firestore";
const db = getFirestore();
/**
 * Randomly selects a boosted track from Firestore where each track's chance of being picked
 * is weighted by its boost level.
 *
 * Assumes each document in the collection has at least:
 *   - an "id" field (or you can use the document id)
 *   - a "level" field (defaults to 1 if not present)
 *
 * Adjust the collection path as needed.
 *
 * @returns {Promise<string|null>} Returns the selected track id or null if none exist.
 */
export async function getRandomBoostedTrackId() {
  try {
    const boostDocRef = doc(db, "playlists", "boost");
    const docSnap = await getDoc(boostDocRef);

    if (!docSnap.exists()) return null;

    const boostedTracks = docSnap.data(); // Get all boosted tracks

    if (Object.keys(boostedTracks).length === 0) return null;

    // Convert object to an array of { trackId, level }
    const tracks = Object.entries(boostedTracks).map(([trackId, data]) => ({
      trackId, // trackId should be the string ID
      level: data.level || 1, // Default to 1 if no level
    }));

    // Weighted random selection based on level
    const totalWeight = tracks.reduce((sum, track) => sum + track.level, 0);
    let randomValue = Math.random() * totalWeight;

    for (let i = 0; i < tracks.length; i++) {
      randomValue -= tracks[i].level;
      if (randomValue <= 0) {
        return tracks[i].trackId; // Ensure trackId is a string
      }
    }

    return tracks[tracks.length - 1].trackId; // Fallback (should be a string)
  } catch (error) {
    console.error("Error fetching boosted tracks:", error);
    return null;
  }
}
