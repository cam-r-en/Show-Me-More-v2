import { normalizeMusicName } from "./utility.js";

// Search Spotify for a title/artist pair; return artwork and a direct URL only
// when the provider confirms an exact title and artist match.
export const searchSpotifyItem = async (type, name, artistName, token) => {
  const fallbackUrl = `https://open.spotify.com/search/${encodeURIComponent(`${name}${artistName}`)}`;
  if (!token) return { matched: false, url: fallbackUrl, imageUrl: "" };

  try {
    const params = new URLSearchParams({
      q: `${type}:${name} artist:${artistName}`,
      type,
      limit: "10",
    });
    const response = await fetch(
      `https://api.spotify.com/v1/search?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return { matched: false, url: fallbackUrl, imageUrl: "" };

    const data = await response.json();
    // Spotify uses separate result collections for tracks and albums.
    const collection = type === "track" ? data.tracks : data.albums;
    const match = collection?.items?.find(
      (candidate) =>
        normalizeMusicName(candidate.name) === normalizeMusicName(name) &&
        (type !== "album" || candidate.total_tracks > 1) &&
        candidate.artists?.some(
          (artist) => normalizeMusicName(artist.name) === normalizeMusicName(artistName),
        ),
    );
    if (!match) return { matched: false, url: fallbackUrl, imageUrl: "" };

    // Track covers come from their parent album; album covers are on the album itself.
    return {
      matched: true,
      url: match.external_urls?.spotify || fallbackUrl,
      imageUrl: (type === "track" ? match.album?.images?.[0]?.url : match.images?.[0]?.url) || "",
    };
  } catch {
    return { matched: false, url: fallbackUrl, imageUrl: "" };
  }
};