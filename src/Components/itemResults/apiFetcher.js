import { fetchLastfmResults, fetchMoreGenreResults, getAccessToken } from "./musicResults.js";
import { fetchGameResults } from "./gameResults.js";

export { fetchMoreGenreResults, getAccessToken };

export async function fetchResultsByCategory(searchData) {
  switch (searchData.category) {
    case "Music":
      return await fetchLastfmResults(searchData);
    case "Games":
      return await fetchGameResults(searchData);
    default:
      throw new Error(`Unsupported category: ${searchData.category}`);
  }
}