// Last.fm's default image is a generic placeholder, so treat it as missing art.
export const getLastFmCover = (images) => {
  if (!Array.isArray(images)) return "";
  const cover =
    images.find((image) => image.size === "extralarge")?.["#text"] ||
    images.find((image) => image.size === "large")?.["#text"] ||
    images.find((image) => image.size === "medium")?.["#text"] ||
    "";
  return cover && !cover.includes("2a96cbd8b46e442fc41c2b86b821562f")
    ? cover
    : "";
};

// Ignore punctuation and letter case when comparing provider search results.
export const normalizeMusicName = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

// Support image fields used by the different APIs, in a preferred fallback order.
export const getItemImage = (item, customImages = {}) => {
  if (!item) return "default-image.jpg";
  return (
    customImages[item.name] ||
    item.imageUrl ||
    item.image ||
    item.coverUrl ||
    item.posterUrl ||
    item.icons?.[0]?.url ||
    item.images?.[0]?.url ||
    item.background_image ||
    item.image_background ||
    "default-image.jpg"
  );
};

// Convert seconds to a compact duration for display in the modal.
export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds)) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours > 0) {
    return `${hours} hr ${remainingMins} min`;
  }
  return `${minutes} mins`;
};

// Turn provider HTML into readable text, optionally keep album summaries to
// their first paragraph, and shorten long descriptions without cutting a word.
export const toPlainText = (value, firstParagraph = false) => {
  if (!value) return "";
  let source = String(value);
  if (firstParagraph) {
    const paragraph = source.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    source = paragraph?.[1] || source.split(/\n\s*\n/)[0];
  }
  const markup = source.replace(/<\/(p|div|li)>/gi, " ");
  const parsed = new DOMParser().parseFromString(markup, "text/html");
  const plainText = (parsed.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/(?:\.\s*){2,}$/, ".");

  const maxLength = 400;
  if (plainText.length <= maxLength) return plainText;

  const excerpt = plainText.slice(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(" ");
  const wordBoundary = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;
  return `${excerpt.slice(0, wordBoundary).trimEnd().replace(/[.,!?;:]+$/, "")}...`;
};

// Build a consistent list of modal details from the fields each provider returns.
export const getItemDetails = (item) => {
  if (!item) return [];
  const details = [];
  const seenLabels = new Set();

  const addDetail = (label, value) => {
    const key = label.toLowerCase();
    if (value !== undefined && value !== null && value !== "" && !seenLabels.has(key)) {
      seenLabels.add(key);
      details.push({ label, value });
    }
  };

  // Normalize provider-specific creator fields to one human-readable label.
  const creator = item.creator || item.author || item.developers || item.developer || item.director || item.artist;
  if (creator) {
    const creatorLabel = item.author ? "Author" : item.developers || item.developer ? "Developer" : item.director ? "Director" : "Creator";
    addDetail(creatorLabel, creator);
  }

  // Genre cards already identify their own genre in the title, so don't repeat it.
  const activeGenres = item.genres?.length > 0 ? item.genres : item.tags;
  const isGenreItem = ["genre", "tag", "category"].includes((item.type || "").toLowerCase());
  if (!isGenreItem && Array.isArray(activeGenres) && activeGenres.length > 0) {
    const genreList = activeGenres.map((g) => (typeof g === "string" ? g : g.name)).join(", ");
    addDetail("Genres", genreList);
  } else if (!isGenreItem && item.genre) {
    addDetail("Genres", item.genre);
  }

  if (item.releaseDate || item.year || item.released) {
    addDetail("Released", item.releaseDate || item.year || item.released);
  }

  // Use the most relevant available score, rather than showing multiple score types.
  if (item.rating) {
    addDetail("Rating", item.rating);
  } else if (item.matchScore) {
    addDetail("Similarity Match", item.matchScore);
  } else if (item.popularity !== undefined && item.popularity !== null) {
    const cleanNum = String(item.popularity).replace(/(\/100)+$/g, "");
    addDetail("Popularity", `${cleanNum}/100`);
  }
  if (item.esrbRating) {
    addDetail("ESRB Rating", item.esrbRating);
  }

  if (item.followers) addDetail("Followers", item.followers);
  if (item.metricsCount) addDetail("Engagement", item.metricsCount);

  if (item.itemCount) {
    addDetail(item.type === "book" ? "Pages" : item.type === "game" ? "Levels / Modes" : "Length", item.itemCount);
  }
  if (item.length) addDetail("Duration", item.length);

  // A match score may also be present in subtitle; skip that fallback to avoid duplication.
  if (item.subtitle && !item.matchScore && !seenLabels.has("creator") && !seenLabels.has("author") && !seenLabels.has("developer")) {
    addDetail("Artist", item.subtitle);
  }

  // Descriptions are plain text and album summaries are limited to their first paragraph.
  if (item.bio || item.description || item.about) {
    addDetail("Description", toPlainText(item.bio || item.description || item.about || item.summary, item.type === "album"));
  }

  return details;
};