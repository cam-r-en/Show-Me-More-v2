const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const publicAssetUrl = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

export const customImages = {
  music: {
    Pop: "imgs/Music/Genres - Pop.png",
    Rock: "imgs/Music/Genres - Rock.png",
    "Hip-Hop": "imgs/Music/Genres - Hip-Hop.png",
    "R&b": "imgs/Music/Genres - R&B.png",
    Alternative: "imgs/Music/Genres - Alternative.png",
    Country: "imgs/Music/Genres - Country.png",
    Metal: "imgs/Music/Genres - Metal.png",
    Indie: "imgs/Music/Genres - Indie.png",
    Jazz: "imgs/Music/Genres - Jazz.png",
    Blues: "imgs/Music/Genres - Blues.png",
  },
  game: {
    Action: "imgs/Games/Genres - Action [G].png",
    Adventure: "imgs/Games/Genres - Adventure [G].png",
    Indie: "imgs/Games/Genres - Indie [G].png",
    Platformer: "imgs/Games/Genres - Platformer [G].png",
    Shooter: "imgs/Games/Genres - Shooter [G].png",
    Simulation: "imgs/Games/Genres - Simulation [G].png",
    Fighting: "imgs/Games/Genres - Fighting [G].png",
    Racing: "imgs/Games/Genres - Racing [G].png",
    Casual: "imgs/Games/Genres - Casual [G].png",
    Sports: "imgs/Games/Genres - Sports [G].png",
  },
  globals: {
    "Kanye West":
      "https://i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2015/6/19/1434708090471/1c912231-6c94-4b10-afa3-8828f5a3ed7f-620x372.jpeg?width=465&dpr=1&s=none&crop=none",
    Steam:
      "https://store.fastly.steamstatic.com/public/shared/images/responsive/steam_share_image.jpg",
    Nintendo:
      "https://i.pinimg.com/736x/f4/17/f2/f417f2197cee8cf7db2120edfb61a617.jpg",
    Playstation:
      "https://static0.srcdn.com/wordpress/wp-content/uploads/2025/08/playstation-logo-shapes.jpg?w=1600&h=1200&fit=crop",
    Xbox: "https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/23179404/jbareham_220118_ecl1087_stock_xbox_0002.jpg",
    "Grand Theft Auto V":
      "https://www.chromethemer.com/download/hd-wallpapers/gta-5-trunk-1920x1080.jpg",
    "Fortnite: Save The World":
      "https://images2.minutemediacdn.com/image/upload/c_crop,w_1280,h_720,x_0,y_0/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/voltaxMediaLibrary/mmsport/esports_illustrated/01jbd16xm5dvta24j9dc.jpg",
    "Super Mario Odyssey":
      "https://media.cnn.com/api/v1/images/stellar/prod/171026154128-super-mario-pic-1.jpg?q=w_1600,h_1600,x_0,y_0,c_fill",
  },
};

const FALLBACK_ARTIST_IMAGE = publicAssetUrl("imgs/Default [Artists].png");
const FALLBACK_ALBUM_IMAGE = publicAssetUrl("imgs/Default [Albums].png");
// Helper: Safely retrieve namespaced custom images
export function getCustomImage(name, mediaType = "music") {
  if (!name) return null;
  const image = customImages[mediaType]?.[name] || customImages.globals?.[name];
  if (!image) return null;
  return image.startsWith("http") ? image : publicAssetUrl(image);
}

// Format genre title: "hip-hop" -> "Hip-Hop", "pop" -> "Pop"
export function formatGenreName(str) {
  if (!str) return "";
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}
export function formatArtistDisplayName(name) {
  if (name?.trim().toLowerCase() === "travi$ scott") return "Travis Scott";
  return name;
}
function normalizeArtistName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Get Spotify Token
export async function getSpotifyAccessToken() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return null;
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token;
  } catch {
    return null;
  }
}

// Fetch Deezer Artist Image
async function fetchDeezerArtistImage(artistName) {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`,
    );
    const data = await res.json();
    const normalizedName = normalizeArtistName(artistName);
    const artist = data.data?.find(
      (candidate) => normalizeArtistName(candidate.name) === normalizedName,
    );
    return (
      artist?.picture_xl ||
      artist?.picture_big ||
      artist?.picture_medium ||
      null
    );
  } catch {
    return null;
  }
}

// Fetch Spotify Artist Image
async function fetchSpotifyArtistImage(artistName, token) {
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    const normalizedName = normalizeArtistName(artistName);
    const artist = data.artists?.items?.find(
      (candidate) => normalizeArtistName(candidate.name) === normalizedName,
    );
    return artist?.images?.[0]?.url || null;
  } catch {
    return null;
  }
}
// Master Artist Image Resolver
export async function resolveArtistImage(artistName, spotifyToken) {
  if (!artistName) return FALLBACK_ARTIST_IMAGE;

  const custom = getCustomImage(artistName, "music");
  if (custom) return custom;

  const deezerImg = await fetchDeezerArtistImage(artistName);
  if (deezerImg) return deezerImg;

  const spotifyImg = await fetchSpotifyArtistImage(artistName, spotifyToken);
  if (spotifyImg) return spotifyImg;

  return FALLBACK_ARTIST_IMAGE;
}

function getBestImage(images, fallbackUrl = "") {
  if (!Array.isArray(images)) return fallbackUrl;
  const found =
    images.find((img) => img.size === "extralarge")?.["#text"] ||
    images.find((img) => img.size === "mega")?.["#text"] ||
    images.find((img) => img.size === "large")?.["#text"] ||
    images.find((img) => img.size === "medium")?.["#text"];

  if (
    found &&
    found.trim() !== "" &&
    !found.includes("2a96cbd8b46e442fc41c2b86b821562f")
  ) {
    return found;
  }
  return fallbackUrl;
}

function createHomeItem(
  id,
  name,
  type,
  rawImageUrl,
  fallbackUrl,
  extraProps = {},
) {
  const finalImage =
    rawImageUrl &&
    rawImageUrl.trim() !== "" &&
    !rawImageUrl.includes("2a96cbd8b46e442fc41c2b86b821562f")
      ? rawImageUrl
      : fallbackUrl;

  return {
    id,
    name,
    title: name,
    type,
    imageUrl: finalImage,
    image: finalImage,
    images: [{ url: finalImage }],
    icons: [{ url: finalImage }],
    ...extraProps,
  };
}

export async function fetchHomeContent() {
  const spotifyToken = await getSpotifyAccessToken();

  const chosenGenres = [
    "pop",
    "hip-hop",
    "rock",
    "r&b",
    "alternative",
    "country",
    "metal",
    "indie",
    "jazz",
    "blues",
  ];
  const chosenArtists = [
    "Kendrick Lamar",
    "Drake",
    "Eminem",
    "Kanye West",
    "The Weeknd",
    "Radiohead",
    "Frank Ocean",
    "Tyler, The Creator",
    "Travis Scott",
    "Michael Jackson",
  ];
  const chosenAlbums = [
    { artist: "Kendrick Lamar", album: "To Pimp a Butterfly" },
    { artist: "Kanye West", album: "My Beautiful Dark Twisted Fantasy" },
    { artist: "Radiohead", album: "OK Computer" },
    { artist: "Frank Ocean", album: "Blonde" },
    { artist: "Tyler, The Creator", album: "IGOR" },
    { artist: "The Weeknd", album: "After Hours" },
    { artist: "Marvin Gaye", album: "What's Going On" },
    { artist: "Travis Scott", album: "ASTROWORLD" },
    { artist: "Eminem", album: "The Marshall Mathers LP" },
    { artist: "Michael Jackson", album: "Thriller" },
  ];

  const chosenGameGenres = [
    "action",
    "adventure",
    "platformer",
    "shooter",
    "simulation",
    "fighting",
    "racing",
    "casual",
    "indie",
    "sports",
  ];
  const chosenGames = [
    "grand-theft-auto-v",
    "call-of-duty",
    "the-last-of-us",
    "minecraft",
    "marvels-spider-man",
    "super-mario-odyssey",
    "resident-evil-4",
    "borderlands-2",
    "the-legend-of-zelda-breath-of-the-wild",
    "fortnite",
  ];
  const chosenConsoleIds = [4, 18, 1, 7];
  const chosenConsoleNames = [
    "Steam",
    "Playstation",
    "Xbox",
    "Nintendo",
    "iOS",
    "Android",
  ];

  const [genresData, artistsData, albumsData] = await Promise.all([
    Promise.all(
      chosenGenres.map(async (genre) => {
        const tagRes = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=tag.getinfo&tag=${encodeURIComponent(genre)}&api_key=${LASTFM_API_KEY}&format=json`,
        ).then((r) => r.json());
        const tag = tagRes.tag || {};
        const formattedName = formatGenreName(genre);
        const customImg = getCustomImage(formattedName, "music");

        return createHomeItem(
          tag.name || genre,
          formattedName,
          "genre",
          customImg,
          FALLBACK_ALBUM_IMAGE,
          {
            summary: tag.wiki?.summary || "",
            url: tag.url || "",
          },
        );
      }),
    ),
    Promise.all(
      chosenArtists.map(async (artistName) => {
        const [lastFmRes, resolvedImg] = await Promise.all([
          fetch(
            `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`,
          ).then((r) => r.json()),
          resolveArtistImage(artistName, spotifyToken),
        ]);
        const artist = lastFmRes.artist || {};
        const artistImage = getBestImage(artist.image, resolvedImg);
        const displayName = formatArtistDisplayName(artist.name || artistName);

        return createHomeItem(
          artist.mbid || artist.name || artistName,
          displayName,
          "artist",
          artistImage,
          FALLBACK_ARTIST_IMAGE,
          {
            listeners: artist.stats?.listeners
              ? Number(artist.stats.listeners).toLocaleString()
              : null,
            playcount: artist.stats?.playcount
              ? Number(artist.stats.playcount).toLocaleString()
              : null,
            externalUrl: artist.url || "",
            bio: artist.bio?.summary || "",
          },
        );
      }),
    ),
    Promise.all(
      chosenAlbums.map(async ({ artist, album }) => {
        const res = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${LASTFM_API_KEY}&format=json`,
        );
        const data = await res.json();
        const albumData = data.album || {};
        const rawImg = getBestImage(albumData.image);
        const fallback = getCustomImage(album, "music") || FALLBACK_ALBUM_IMAGE;

        return createHomeItem(
          albumData.mbid || `${album}-${artist}`,
          albumData.name || album,
          "album",
          rawImg,
          fallback,
          {
            artist:
              typeof albumData.artist === "string" ? albumData.artist : artist,
            externalUrl: albumData.url || "",
            playcount: albumData.playcount
              ? Number(albumData.playcount).toLocaleString()
              : null,
            listeners: albumData.listeners
              ? Number(albumData.listeners).toLocaleString()
              : null,
          },
        );
      }),
    ),
  ]);

  const [rawGameGenres, rawGamesData, consolesData] = await Promise.all([
    Promise.all(
      chosenGameGenres.map((slug) =>
        fetch(
          `https://api.rawg.io/api/genres/${slug}?key=${RAWG_API_KEY}`,
        ).then((res) => res.json()),
      ),
    ),
    Promise.all(
      chosenGames.map((slug) =>
        fetch(`https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`).then(
          (res) => res.json(),
        ),
      ),
    ),
    Promise.all(
      chosenConsoleIds.map((id) =>
        fetch(
          `https://api.rawg.io/api/platforms/${id}?key=${RAWG_API_KEY}`,
        ).then((res) => res.json()),
      ),
    ),
  ]);

  // Format Game Genres
  const gameGenreData = rawGameGenres.map((genre) => {
    const formattedName = genre.name || formatGenreName(genre.slug);
    const customImg = getCustomImage(formattedName, "game");

    return {
      ...genre,
      name: formattedName,
      image_background:
        customImg || genre.image_background || FALLBACK_ALBUM_IMAGE,
      imageUrl: customImg || genre.image_background || FALLBACK_ALBUM_IMAGE,
    };
  });

  // Format Games (Checks globals first for GTA V, Mario, Fortnite, etc.)
  const gamesData = rawGamesData.map((game) => {
    const customImg =
      getCustomImage(game.name, "globals") || getCustomImage(game.name, "game");
    // Extract Developers
    const developersList =
      game.developers?.map((d) => d.name).join(", ") || null;
    // Extract Platforms
    const platformsList =
      game.platforms?.map((p) => p.platform.name).join(", ") || null;
    const esrbRatingName = game.esrb_rating?.name || null;

    const rawDesc = game.description_raw || game.description || "";

    const englishDesc = rawDesc.split(
      /(?:Español|Spanish|Versión en español|Traducción)[:\s*-]+/i,
    )[0];

    const cleanBio = englishDesc
      ? englishDesc.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "").trim()
      : null;

    return {
      ...game,
      type: "game",
      slug: game.slug || game.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      background_image:
        customImg || game.background_image || FALLBACK_ALBUM_IMAGE,
      imageUrl: customImg || game.background_image || FALLBACK_ALBUM_IMAGE,
      description: cleanBio,
      about: cleanBio,
      developers: developersList,
      esrbRating: esrbRatingName,
      platforms: platformsList,
    };
  });

  // Format Consoles
  const consolesWithNames = consolesData.map((console, idx) => {
    const consoleName = chosenConsoleNames[idx];
    const customImg = getCustomImage(consoleName, "globals");

    return {
      ...console,
      name: consoleName,
      image_background:
        customImg || console.image_background || FALLBACK_ALBUM_IMAGE,
      imageUrl: customImg || console.image_background || FALLBACK_ALBUM_IMAGE,
    };
  });

  return {
    music: {
      genres: genresData || [],
      artists: artistsData || [],
      albums: albumsData || [],
    },
    games: {
      genres: gameGenreData || [],
      popular: gamesData || [],
      consoles: consolesWithNames || [],
    },
  };
}
