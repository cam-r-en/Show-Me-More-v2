const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

// Recommendation API genre seeds (must match Spotify's allowed seeds)
const SPOTIFY_GENRE_SEEDS = {
  hiphop: ["hip-hop", "rap"],
  pop: ["pop", "dance", "synth-pop"],
  rock: ["rock", "alt-rock", "hard-rock"],
  jazz: ["jazz"],
  metal: ["metal", "heavy-metal"],
  country: ["country"],
  rnb: ["r-n-b", "soul"],
  blues: ["blues"],
};

const genreSearchTerms = {
  hiphop: ["rap", "hip-hop"],
  pop: ["pop"],
  rock: ["rock"],
  jazz: ["jazz"],
  metal: ["metal"],
  country: ["country"],
  rnb: ["r&b", "rnb"],
  blues: ["blues"],
};

// Formats raw Spotify objects into standardized UI cards
function formatSpotifyItem(item) {
  return {
    id: item.id,
    title: item.name,
    subtitle: item.artists
      ? item.artists.map((a) => a.name).join(", ")
      : item.genres?.length
        ? item.genres.join(", ")
        : item.type,
    imageUrl: item.images?.[0]?.url || item.album?.images?.[0]?.url || "",
    externalUrl: item.external_urls?.spotify,
  };
}

function normalizeKey(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Retrieves bearer access token via Client Credentials flow
export async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || "Spotify authentication failed");
  }
  return data.access_token;
}

// Algorithmic recommendations fetcher
async function fetchRecommendations({
  token,
  seedGenres = [],
  seedArtists = [],
  limit = 12,
  targetPopularity,
}) {
  const params = new URLSearchParams({ limit: limit.toString() });

  if (seedGenres.length > 0)
    params.append("seed_genres", seedGenres.slice(0, 5).join(","));
  if (seedArtists.length > 0)
    params.append("seed_artists", seedArtists.slice(0, 5).join(","));
  if (targetPopularity !== undefined)
    params.append("target_popularity", targetPopularity.toString());

  const res = await fetch(
    `https://api.spotify.com/v1/recommendations?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data.tracks || []).map(formatSpotifyItem);
}

// Broad genre searches produce more recognizable results than narrow subgenre filters.
async function fetchSubgenreResults(
  mainGenresRaw,
  token,
  searchType = "artist",
) {
  const genreGroups = mainGenresRaw.flatMap((mainGenreRaw) => {
    const normalizedKey = normalizeKey(mainGenreRaw);
    const terms = genreSearchTerms[normalizedKey];
    return terms ? [{ name: mainGenreRaw, terms }] : [];
  });

  return await Promise.all(genreGroups.map(async ({ name, terms }) => {
    const termResults = await Promise.all(
      terms.map(async (term) => {
        const searchUrl =
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}` +
          `&type=${searchType}&limit=50`;
        const res = await fetch(searchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || "Spotify search failed");
        }
        return data[`${searchType}s`]?.items || [];
      }),
    );

    const uniqueItems = new Map(
      termResults.flat().map((item) => [item.id, item]),
    );
    const rawItems = [...uniqueItems.values()]
      .sort((first, second) => (second.popularity || 0) - (first.popularity || 0));

    return {
      subgenreName: name,
      items: rawItems.map(formatSpotifyItem),
    };
  }));
}

// Main API Router function
export async function fetchSpotifyResults(formData) {
  const token = await getAccessToken();
  const subcategory = (formData.subcategory || "").toLowerCase();
  const subfield = formData.subfield;

  // 1. Genre Exploration (Returns subgenre groups)
  if (subcategory.includes("genre")) {
    if (!formData.none || formData.none.length === 0) return [];
    return await fetchSubgenreResults(formData.none, token, "artist");
  }

  // 2. Artist Searches
  if (subcategory.includes("artist")) {
    if (subfield === "Similar Artists") {
      const searchTerm = Array.isArray(formData.query)
        ? formData.query.join(" ")
        : formData.query || "";

      if (!searchTerm) return [];

      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=artist&limit=1`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const searchData = await searchRes.json();
      const primaryArtist = searchData.artists?.items?.[0];

      if (!primaryArtist) return [];

      return await fetchRecommendations({
        token,
        seedArtists: [primaryArtist.id],
        limit: 12,
        targetPopularity: 70,
      });
    }

    if (subfield === "Something New") {
      if (!formData.none || formData.none.length === 0) return [];
      const normalizedKey = normalizeKey(formData.none[0]);
      const seeds = SPOTIFY_GENRE_SEEDS[normalizedKey] || ["pop"];

      return await fetchRecommendations({
        token,
        seedGenres: seeds,
        limit: 12,
        targetPopularity: 45,
      });
    }
  }

  // 3. Album Searches
  if (subcategory.includes("album")) {
    if (subfield === "Something New") {
      if (!formData.none || formData.none.length === 0) return [];
      return await fetchSubgenreResults(formData.none, token, "album");
    }
  }

  return [];
}
