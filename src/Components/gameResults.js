const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;

export async function fetchGameResults(searchData) {
  const query = encodeURIComponent(
    Array.isArray(searchData.query)
      ? searchData.query.join(" ")
      : searchData.query || ""
  );

  const rawResponse = await fetch(
    `https://api.rawg.io/api/games?search=${query}&key=${RAWG_API_KEY}`
  );

  if (!rawResponse.ok) {
    throw new Error(`RAWG API error: ${rawResponse.statusText}`);
  }

  const data = await rawResponse.json();

  return (data.results || []).map((game) => ({
    id: game.id.toString(),
    title: game.name,
    subtitle: game.metacritic ? `Metacritic: ${game.metacritic}` : "No Rating",
    genres: game.genres?.length
      ? `Genre: ${game.genres.map((g) => g.name).join(", ")}`
      : "Genre: N/A",
    platforms: game.platforms?.length
      ? game.platforms.map((p) => p.platform.name).join(", ")
      : null,
    imageUrl: game.background_image,
    externalUrl: `https://rawg.io/games/${game.slug}`,
  }));
}