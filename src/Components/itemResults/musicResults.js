import {
  resolveArtistImage,
  getSpotifyAccessToken,
  formatGenreName,
  formatArtistDisplayName,
} from "../homeAPI.js";

const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
// Fallback tag mapping for broad discovery categories ("Something New")
const LASTFM_TAG_SEEDS = {
  hiphop: "hip-hop",
  pop: "pop",
  rock: "rock",
  jazz: "jazz",
  metal: "metal",
  country: "country",
  rnb: "r&b",
  blues: "blues",
};

export async function getAccessToken() {
  return await getSpotifyAccessToken();
}
function normalizeKey(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Formats a raw Last.fm artist object into a standardized structure.
 * Fetches higher quality images from Spotify if Last.fm's image is missing or a placeholder.
 */
async function formatLastFmArtist(item, tag = null, spotifyToken = null) {
  const artistName = item.name;
  const displayName = formatArtistDisplayName(artistName);
  const resolvedImg = await resolveArtistImage(displayName, spotifyToken);

  const images = item.image || [];
  const rawLastFmImg =
    images.find((img) => img.size === "extralarge")?.["#text"] ||
    images.find((img) => img.size === "large")?.["#text"] ||
    images.find((img) => img.size === "medium")?.["#text"] ||
    "";

  const hasLastFmImage =
    rawLastFmImg &&
    rawLastFmImg.trim() !== "" &&
    !rawLastFmImg.includes("2a96cbd8b46e442fc41c2b86b821562f");
  const finalImage =
    displayName !== artistName
      ? resolvedImg
      : hasLastFmImage
        ? rawLastFmImg
        : resolvedImg;

  const listenerCount = item.listeners
    ? Number(item.listeners).toLocaleString()
    : null;

  const itemTags = tag
    ? [formatGenreName(tag)]
    : Array.isArray(item.tags?.tag)
      ? item.tags.tag.map((t) => formatGenreName(t.name))
      : [];

  return {
    id: item.mbid || item.name,
    name: displayName,
    title: displayName,
    type: "artist",
    genres: itemTags,
    tags: itemTags,
    followers: listenerCount ? `${listenerCount} listeners` : null,
    listeners: listenerCount,
    matchScore: item.match ? `${Math.round(item.match * 100)}%` : null,
    subtitle: item.match
      ? `Match: ${Math.round(item.match * 100)}%`
      : listenerCount
        ? `${listenerCount} listeners`
        : "",
    imageUrl: finalImage,
    image: finalImage,
    images: [{ url: finalImage }],
    icons: [{ url: finalImage }],
    externalUrl: item.url,
  };
}

/**
 * Formats a raw Last.fm album object into a standardized structure.
 */
function formatLastFmAlbum(item, tag = null) {
  const images = item.image || [];
  const imageUrl =
    images.find((img) => img.size === "extralarge")?.["#text"] ||
    images.find((img) => img.size === "large")?.["#text"] ||
    images.find((img) => img.size === "medium")?.["#text"] ||
    "";

  const artistName =
    typeof item.artist === "object"
      ? item.artist.name
      : item.artist || "Unknown Artist";

  const itemTags = tag ? [formatGenreName(tag)] : [];

  let trackCount = null;
  if (item.tracks && item.tracks.track) {
    const rawTracks = item.tracks.track;
    trackCount = Array.isArray(rawTracks) ? rawTracks.length : 1;
  }

  return {
    id: item.mbid || `${item.name}-${artistName}`,
    title: item.name,
    name: item.name,
    type: "album",
    genres: itemTags,
    tags: itemTags,
    subtitle: artistName,
    trackCount: trackCount,
    imageUrl: imageUrl || "",
    image: imageUrl || "",
    images: [{ url: imageUrl || "" }],
    externalUrl: item.url,
    popularity: item.playcount ? Number(item.playcount) : null,
  };
}

/**
 * Helper: Parses track range strings like "5-10 Songs" into { min, max } objects.
 */
function parseTrackRange(rangeStr) {
  if (!rangeStr || rangeStr === "Doesn't Matter") return null;
  const match = rangeStr.match(/(\d+)-(\d+)/);
  if (match) {
    return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
  }
  return null;
}
/**
 * Helper: Fetches exact track count for an album via album.getinfo.
 */
async function getEnrichedAlbumTrackCount(artistName, albumName) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(
      artistName
    )}&album=${encodeURIComponent(albumName)}&api_key=${LASTFM_API_KEY}&format=json`;

    const res = await fetch(url);
    const data = await res.json();
    const album = data.album;

    if (!album || !album.tracks || !album.tracks.track) return null;

    const rawTracks = Array.isArray(album.tracks.track)
      ? album.tracks.track
      : [album.tracks.track];

    return rawTracks.length;
  } catch {
    return null;
  }
}

/**
 * Fetches top artists for Last.fm tags supporting starting page and page count ranges.
 */
async function fetchTagArtists(tagsRaw, spotifyToken, startPage = 1, numPages = 1, limit = 50) {
  return await Promise.all(
    tagsRaw.map(async (tagName) => {
      const pageNumbers = Array.from({ length: numPages }, (_, i) => startPage + i);

      const pageResults = await Promise.all(
        pageNumbers.map(async (page) => {
          const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${encodeURIComponent(
            tagName
          )}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}&page=${page}`;

          const res = await fetch(url);
          const data = await res.json();
          return data.topartists?.artist || [];
        })
      );

      const rawItems = pageResults.flat();

      const formattedItems = await Promise.all(
        rawItems.map((item) => formatLastFmArtist(item, tagName, spotifyToken))
      );

      return {
        subgenreName: formatGenreName(tagName),
        items: formattedItems,
      };
    })
  );
}
/**
 * Fetches top albums for Last.fm tags supporting start page, page count ranges, and track filtering.
 */
async function fetchTagAlbumsWithFilters(tagsRaw, lengthsFilter, startPage = 1, numPages = 1, limit = 50) {
  const trackConstraint = parseTrackRange(lengthsFilter?.[0]);

  return await Promise.all(
    tagsRaw.map(async (tagName) => {
      const pageNumbers = Array.from({ length: numPages }, (_, i) => startPage + i);

      const pageResults = await Promise.all(
        pageNumbers.map(async (page) => {
          const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=${encodeURIComponent(
            tagName
          )}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}&page=${page}`;

          const res = await fetch(url);
          const data = await res.json();
          return data.albums?.album || [];
        })
      );

      const rawItems = pageResults.flat();
      let formattedItems = rawItems.map((item) => formatLastFmAlbum(item, tagName));

      if (trackConstraint) {
        const checkedItems = await Promise.all(
          formattedItems.map(async (album) => {
            const exactCount = await getEnrichedAlbumTrackCount(album.subtitle, album.name);
            if (exactCount !== null) {
              album.trackCount = exactCount;
            }
            return album;
          })
        );

        formattedItems = checkedItems.filter((album) => {
          if (!album.trackCount) return true;
          return (
            album.trackCount >= trackConstraint.min &&
            album.trackCount <= trackConstraint.max
          );
        });
      }

      return {
        subgenreName: formatGenreName(tagName),
        items: formattedItems,
      };
    })
  );
}

export async function fetchMoreGenreResults(
  genreName,
  searchType = "artist",
  offset = 50,
  limit = 20,
) {
  const page = Math.floor(offset / limit) + 1;
  const spotifyToken = await getSpotifyAccessToken();
  const rawGenre = genreName.toLowerCase();

  if (searchType === "album") {
    const results = await fetchTagAlbumsWithFilters([rawGenre], [], page, 1, limit);
    return results[0]?.items || [];
  } else {
    const results = await fetchTagArtists(
      [rawGenre],
      spotifyToken,
      page,
      1,
      limit,
    );
    return results[0]?.items || [];
  }
}

export async function fetchLastfmResults(formData) {
  const spotifyToken = await getSpotifyAccessToken();
  const subcategory = (formData.subcategory || "").toLowerCase();
  const subfield = formData.subfield;

  // ROUTE 1: Genres (Fetches 2 pages / 100 artists starting from page 1)
  if (subcategory.includes("genre")) {
    if (!formData.none || formData.none.length === 0) return [];
    return await fetchTagArtists(formData.none, spotifyToken, 1, 1, 30);
  }

  // ROUTE 2: Artists
  if (subcategory.includes("artist")) {
    if (subfield === "Similar Artists") {
      let artistNames = [];
      if (Array.isArray(formData.query)) {
        artistNames = formData.query.map((name) => name.trim()).filter(Boolean);
      } else if (typeof formData.query === "string") {
        artistNames = [formData.query.trim()].filter(Boolean);
      }

      if (artistNames.length === 0) return [];

      const targetArtists = artistNames.slice(0, 5);

      const artistGroupPromises = targetArtists.map(async (name) => {
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(
          name
        )}&api_key=${LASTFM_API_KEY}&format=json&limit=50`;

        const res = await fetch(url);
        const data = await res.json();
        const similarList = data.similarartists?.artist || [];

        if (similarList.length === 0) return null;

        const nameLower = name.toLowerCase();
        const seenNames = new Set([nameLower]);

        const uniqueItems = [];
        for (const sim of similarList) {
          const simNameLower = sim.name.toLowerCase();
          if (seenNames.has(simNameLower) || simNameLower.includes(nameLower))
            continue;

          seenNames.add(simNameLower);
          uniqueItems.push(sim);
        }

        const formattedItems = await Promise.all(
          uniqueItems.map((sim) => formatLastFmArtist(sim, null, spotifyToken))
        );

        return {
          subgenreName: `Similar to: ${name}`,
          items: formattedItems,
        };
      });

      const resolvedGroups = await Promise.all(artistGroupPromises);
      return resolvedGroups.filter(Boolean);
    }

    if (subfield === "Something New") {
      if (!formData.none || formData.none.length === 0) return [];
      const normalizedKey = normalizeKey(formData.none[0]);
      const tag = LASTFM_TAG_SEEDS[normalizedKey] || formData.none[0];

      return await fetchTagArtists([tag], spotifyToken, 1, 1, 30);
    }
  }

  // ROUTE 3: Albums
  if (subcategory.includes("album")) {
    if (subfield === "Similar Albums") {
      let albumNames = [];
      if (Array.isArray(formData.query)) {
        albumNames = formData.query.map((name) => name.trim()).filter(Boolean);
      } else if (typeof formData.query === "string") {
        albumNames = [formData.query.trim()].filter(Boolean);
      }

      if (albumNames.length === 0) return [];

      const targetAlbums = albumNames.slice(0, 5);
      const trackConstraint = parseTrackRange(formData.lengths?.[0]);

      const albumGroupPromises = targetAlbums.map(async (queryName) => {
        const searchUrl = `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
          queryName
        )}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const matchedAlbum = searchData.results?.albummatches?.album?.[0];

        if (!matchedAlbum) return null;

        const artistName = matchedAlbum.artist;
        const albumName = matchedAlbum.name;

        const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(
          artistName
        )}&album=${encodeURIComponent(albumName)}&api_key=${LASTFM_API_KEY}&format=json`;

        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();
        const rawTags = infoData.album?.tags?.tag || [];

        const primaryTag =
          Array.isArray(rawTags) && rawTags.length > 0 ? rawTags[0].name : null;

        let rawItems = [];
        if (primaryTag) {
          const tagUrl = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=${encodeURIComponent(
            primaryTag
          )}&api_key=${LASTFM_API_KEY}&format=json&limit=50`;
          const tagRes = await fetch(tagUrl);
          const tagData = await tagRes.json();
          rawItems = tagData.albums?.album || [];
        } else {
          const artistUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(
            artistName
          )}&api_key=${LASTFM_API_KEY}&format=json&limit=50`;
          const artistRes = await fetch(artistUrl);
          const artistData = await artistRes.json();
          rawItems = artistData.topalbums?.album || [];
        }

        if (rawItems.length === 0) return null;

        const nameLower = albumName.toLowerCase();
        const seenNames = new Set([nameLower]);

        let uniqueItems = [];
        for (const sim of rawItems) {
          const simNameLower = sim.name.toLowerCase();
          if (seenNames.has(simNameLower)) continue;

          seenNames.add(simNameLower);
          uniqueItems.push(sim);
        }

        let formattedItems = uniqueItems.map((sim) =>
          formatLastFmAlbum(sim, primaryTag)
        );

        if (trackConstraint) {
          const checkedItems = await Promise.all(
            formattedItems.map(async (album) => {
              const exactCount = await getEnrichedAlbumTrackCount(album.subtitle, album.name);
              if (exactCount !== null) album.trackCount = exactCount;
              return album;
            })
          );

          formattedItems = checkedItems.filter((album) => {
            if (!album.trackCount) return true;
            return (
              album.trackCount >= trackConstraint.min &&
              album.trackCount <= trackConstraint.max
            );
          });
        }

        return {
          subgenreName: `Similar to: ${albumName} (${artistName})`,
          items: formattedItems,
        };
      });

      const resolvedGroups = await Promise.all(albumGroupPromises);
      return resolvedGroups.filter(Boolean);
    }

    if (subfield === "Something New") {
      if (!formData.none || formData.none.length === 0) return [];
      // Fetches 2 pages / 100 albums starting from page 1
      return await fetchTagAlbumsWithFilters(formData.none, formData.lengths, 1, 1, 30);
    }
  }

  return [];
}

export { fetchLastfmResults as fetchResultsByCategory };