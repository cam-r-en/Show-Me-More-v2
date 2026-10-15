import { useState, useEffect } from "react";
import { getSpotifyAccessToken } from "../homeAPI.js";
import { searchSpotifyItem } from "./mediaAPI.js";
import { formatDuration, getLastFmCover } from "./utility.js";

const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;

// Load provider-specific details for the selected item, then return one
// display-ready object that the modal can render consistently.
export function useItemDetails(item) {
  const [extraDetails, setExtraDetails] = useState(null);

  useEffect(() => {
    // Prevent an older request from updating state after the item changes or modal closes.
    let isMounted = true;
    if (!item) return;

    const itemName = item.name || item.title;
    const rawType = (item.type || item.mediaType || "").toLowerCase();

    // Infer a type for older or inconsistent items that do not include `type`.
    let resolvedType = rawType;
    if (!resolvedType) {
      if (item.artist || item.album) resolvedType = "album";
      else if (item.background_image || item.added !== undefined || item.slug) resolvedType = "game";
      else if (item.summary || (!item.listeners && !item.playcount)) resolvedType = "genre";
      else resolvedType = "artist";
    }

    // RAWG is the source of detailed game metadata.
    if (resolvedType === "game") {
      const gameSlug = item.slug || itemName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      fetch(`https://api.rawg.io/api/games/${encodeURIComponent(gameSlug)}?key=${RAWG_API_KEY}`)
        .then((res) => res.json())
        .then((game) => {
          if (!isMounted || !game?.id) return;
          setExtraDetails({
            tags: (game.tags || []).map((t) => (typeof t === "string" ? t : t.name)),
            followers: game.added ? `${Number(game.added).toLocaleString()} players` : null,
            bio: game.description_raw ? game.description_raw.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "").trim() : null,
            developers: game.developers?.map((d) => d.name).join(", ") || null,
            esrbRating: game.esrb_rating?.name || null,
            userRating: game.rating ? `${game.rating}/5` : null,
          });
        })
        .catch((err) => console.error("Error fetching game info:", err));
    // Last.fm supplies summaries and tags for music genres.
    } else if (["genre", "tag", "category"].includes(resolvedType)) {
      fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.getinfo&tag=${encodeURIComponent(itemName)}&api_key=${LASTFM_API_KEY}&format=json`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted || !data.tag) return;
          setExtraDetails({
            tags: [data.tag.name || itemName],
            bio: data.tag.wiki?.summary ? data.tag.wiki.summary.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "").trim() : null,
          });
        })
        .catch((err) => console.error("Error fetching tag info:", err));
    // Last.fm album details include tags, play counts, description, and tracks.
    } else if (resolvedType === "album" || resolvedType === "music") {
      const creatorName = item.creator || item.artist || item.subtitle || "";
      fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(creatorName)}&album=${encodeURIComponent(itemName)}&api_key=${LASTFM_API_KEY}&format=json`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted || !data.album) return;
          const album = data.album;
          const rawTracks = Array.isArray(album.tracks?.track) ? album.tracks.track : album.tracks?.track ? [album.tracks.track] : [];
          const totalSeconds = rawTracks.reduce((acc, t) => acc + (Number(t.duration) || 0), 0);

          setExtraDetails({
            tags: (album.tags?.tag || []).map((t) => (typeof t === "string" ? t : t.name)),
            metricsCount: album.playcount ? `${Number(album.playcount).toLocaleString()} scrobbles` : null,
            bio: album.wiki?.summary ? album.wiki.summary.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "").trim() : null,
            itemCount: rawTracks.length ? `${rawTracks.length} tracks` : null,
            length: formatDuration(totalSeconds),
          });
        })
        .catch((err) => console.error("Error fetching album info:", err));
    // Artist cards combine Last.fm biographies/lists with Spotify artwork and links.
    } else if (resolvedType === "artist") {
      const encodedName = encodeURIComponent(itemName);
      const artistReq = (method, limit = null) =>
        fetch(`https://ws.audioscrobbler.com/2.0/?method=${method}&artist=${encodedName}&api_key=${LASTFM_API_KEY}&format=json${limit ? `&limit=${limit}` : ""}`).then((res) => res.json());

      Promise.all([artistReq("artist.getinfo"), artistReq("artist.gettoptracks", 5), artistReq("artist.gettopalbums", 5), getSpotifyAccessToken()])
        .then(async ([infoData, tracksData, albumsData, spotifyToken]) => {
          if (!isMounted || !infoData.artist) return;
          const artist = infoData.artist;

          const topTracks = await Promise.all(
            (tracksData.toptracks?.track || []).slice(0, 5).map(async (track) => {
              const spotifyItem = await searchSpotifyItem("track", track.name, itemName, spotifyToken);
              return {
                name: track.name,
                imageUrl: spotifyItem.imageUrl || getLastFmCover(track.image || track.album?.image),
                spotifyUrl: spotifyItem.url,
              };
            })
          );

          // Keep only Spotify-confirmed multi-track releases in the album list.
          const topAlbums = await Promise.all(
            (albumsData.topalbums?.album || []).slice(0, 5).map(async (album) => {
              const spotifyItem = await searchSpotifyItem("album", album.name, itemName, spotifyToken);
              if (!spotifyItem.matched) return null;
              return {
                name: album.name,
                imageUrl: spotifyItem.imageUrl || getLastFmCover(album.image),
                spotifyUrl: spotifyItem.url,
              };
            })
          ).then((albums) => albums.filter(Boolean));

          setExtraDetails({
            tags: (artist.tags?.tag || artist.toptags?.tag || []).map((t) => (typeof t === "string" ? t : t.name)),
            followers: artist.stats?.listeners ? `${Number(artist.stats.listeners).toLocaleString()} listeners` : null,
            bio: artist.bio?.summary ? artist.bio.summary.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "").trim() : null,
            topTracks,
            topAlbums,
          });
        })
        .catch((err) => console.error("Error fetching artist info:", err));
    }

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  // Preserve fields already on the item while letting fetched values fill in gaps.
  return {
    ...item,
    genres: extraDetails?.tags?.length > 0 ? extraDetails.tags : item.genres,
    tags: extraDetails?.tags?.length > 0 ? extraDetails.tags : item.tags,
    followers: extraDetails?.followers || item.followers,
    metricsCount: extraDetails?.metricsCount || item.metricsCount,
    bio: extraDetails?.bio || item.summary || item.description || item.bio,
    topTracks: extraDetails?.topTracks || [],
    topAlbums: extraDetails?.topAlbums || [],
    itemCount: extraDetails?.itemCount || item.itemCount,
    length: extraDetails?.length || item.length,
    developers: extraDetails?.developers || item.developers || item.developer,
    rating: extraDetails?.userRating || item.rating,
    esrbRating: extraDetails?.esrbRating || item.esrbRating,
  };
}