import { fetchSpotifyResults } from "../Components/musicResults.js";
import { fetchGameResults } from "../Components/gameResults.js";

export async function fetchResultsByCategory(searchData) {
  switch (searchData.category) {
    case "Music":
      return await fetchSpotifyResults(searchData);
    case "Games":
      return await fetchGameResults(searchData);
    default:
      throw new Error(`Unsupported category: ${searchData.category}`);
  }
}