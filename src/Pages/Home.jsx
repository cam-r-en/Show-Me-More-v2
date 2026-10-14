import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchHomeContent, customImages } from "../Components/homeAPI.js";
import FullCard from "../Components/fullCard/fullCard.jsx";
import "./Home.css";

/**
 * Local Image Helper:
 * Resolves the best available image URL from various object schemas (Spotify, IGDB, custom maps, etc.) with a fallback.
 */
const getItemImage = (item, customImages = {}) => {
  if (!item) return "default-image.jpg";
  return (
    customImages[item.name] ||
    item.icons?.[0]?.url ||
    item.images?.[0]?.url ||
    item.background_image ||
    item.image_background ||
    item.image ||
    "default-image.jpg"
  );
};

const getHomeSearchState = (item, mainCategory, subcategory) => {
  const name = item?.name || item?.title;
  if (!name) return null;

  if (mainCategory === "music") {
    if (item.type === "genre") {
      return {
        category: "Music",
        subcategory: "genre",
        subfield: "",
        query: [],
        none: [name],
        lengths: [],
      };
    }

    if (item.type === "artist") {
      return {
        category: "Music",
        subcategory: "artists",
        subfield: "Similar Artists",
        query: [name],
        none: [],
        lengths: [],
      };
    }

    if (item.type === "album") {
      return {
        category: "Music",
        subcategory: "albums",
        subfield: "Similar Albums",
        query: [name],
        none: [],
        lengths: ["Doesn't Matter"],
      };
    }
  }

  if (mainCategory === "games") {
    const searchState = {
      category: "Games",
      subcategory: "genre",
      subfield: "",
      query: [],
      genres: [],
      platforms: [],
    };

    if (subcategory === "genres") {
      searchState.genres = [item.slug || name];
    } else if (subcategory === "consoles") {
      searchState.platforms = item.id ? [String(item.id)] : [];
    } else {
      searchState.genres = (item.genres || [])
        .map((genre) => genre.slug)
        .filter(Boolean);
      searchState.platforms = (item.platforms || [])
        .map((platform) => platform.platform?.id)
        .filter(Boolean)
        .map(String);

      if (searchState.genres.length === 0 && searchState.platforms.length === 0) {
        searchState.query = [name];
      }
    }

    return searchState;
  }

  return null;
};

const getHomeItemUrl = (item, mainCategory, subcategory) => {
  if (!item) return null;
  if (item.externalUrl || item.url) return item.externalUrl || item.url;
  if (mainCategory !== "games" || !item.slug) return null;

  const rawgCollection = {
    genres: "genres",
    popular: "games",
    consoles: "platforms",
  }[subcategory];

  return rawgCollection
    ? `https://rawg.io/${rawgCollection}/${encodeURIComponent(item.slug)}`
    : null;
};

/**
 * Manages a horizontal category section (e.g., Music, Games) with
 * interactive subcategory tabs, sliding animations, item grids, and modal popups.
 */
function CategoryBlock({ mainCategory, subcategories, customImages }) {
  const subCategoryNames = Object.keys(subcategories);

  // State for the currently active tab, slide animation direction, and selected card modal
  const [activeTab, setActiveTab] = useState(subCategoryNames[0]);
  const [direction, setDirection] = useState("right");
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();
  const currentItems = subcategories[activeTab] || [];
  const currentIndex = subCategoryNames.indexOf(activeTab);

  // Handler to cycle to the next subcategory tab with a right slide direction
  const handleNext = () => {
    setDirection("right");
    setActiveTab(
      subCategoryNames[(currentIndex + 1) % subCategoryNames.length],
    );
  };
  // Handler to cycle to the previous subcategory tab with a left slide direction
  const handlePrevious = () => {
    setDirection("left");
    setActiveTab(
      subCategoryNames[
        (currentIndex - 1 + subCategoryNames.length) % subCategoryNames.length
      ],
    );
  };

  return (
    <div className="categorySection">
      {/* Main Category Header (e.g., MUSIC, GAMES) */}
      <h2 className="categoryTitle">{mainCategory.toUpperCase()}</h2>

      <div className="subcategoriesWrapper">
        {/* Tab Navigation Bar */}
        <div className="subcategoryTag">
          {currentIndex > 0 && <button onClick={handlePrevious}>{"<"}</button>}
          <span className="subcategoryTitle">{activeTab.toUpperCase()}</span>
          <button className="next-tab-btn" onClick={handleNext}>
            {">"}
          </button>
        </div>

        {/* Subcategory Content Grid with Slide Animation */}
        <div
          className={`subcategorySection slide-${direction}`}
          key={activeTab}
        >
          <div className="displayList">
            {currentItems.length > 0 ? (
              currentItems.map((item, i) => (
                <div
                  key={i}
                  className="card"
                  onClick={() => setSelectedItem(item)} // Opens the FullCard modal on click
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={getItemImage(item, customImages)}
                    alt={item.name}
                    className="cardImage"
                  />
                  <p className="cardName">{item.name}</p>
                </div>
              ))
            ) : (
              <p>No items available</p>
            )}
          </div>
        </div>
      </div>

      {/* Full Card Modal for inspecting clicked items */}
      <FullCard
        item={selectedItem}
        customImages={customImages}
        externalUrl={getHomeItemUrl(selectedItem, mainCategory, activeTab)}
        onClose={() => setSelectedItem(null)}
        onNavigate={() => {
          const searchState = getHomeSearchState(
            selectedItem,
            mainCategory,
            activeTab,
          );
          if (searchState) navigate("/results", { state: searchState });
        }}
      />
    </div>
  );
}

/**
 * Renders the landing page, background video intro,
 * navigation buttons, and dynamically maps out category blocks.
 */
export default function Home() {
  // State storing multi-domain content categories (music, games, etc.)
  const [category, setCategory] = useState({
    music: { genres: [], albums: [], artists: [] },
    games: { genres: [], popular: [], consoles: [] },
  });

  // Fetch initial home screen data when component mounts
  useEffect(() => {
    fetchHomeContent()
      .then((data) => setCategory(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="homePage">
      <div className="welcome-tab">
        <Link className="formbtn" to="/form">
          Show Me More {"->"}
        </Link>
      </div>

      {/* Background Video Intro Section */}
      <div className="video-intro">
        <video className="bg-video" autoPlay loop muted>
          <source src="imgs/SMM.mov" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
        <video className="introVideo" autoPlay loop muted>
          <source src="imgs/SMM.mov" type="video/mp4" />
        </video>
      </div>

      <h2 className="subtext">a little more than what you're looking for...</h2>

      {/* Dynamic Category Blocks Container */}
      <div className="display-container">
        {Object.entries(category).map(
          ([mainCategory, subcategories], index, array) => (
            <React.Fragment key={mainCategory}>
              <CategoryBlock
                mainCategory={mainCategory}
                subcategories={subcategories}
                customImages={customImages}
              />
              {/* Render a divider line between categories, except after the last one */}
              {index < array.length - 1 && (
                <div className="smm-divider-container">
                  <img
                    src="/imgs/Show Me.gif"
                    alt="Divider animation"
                    className="smm-divider"
                  />
                </div>
              )}
            </React.Fragment>
          ),
        )}
      </div>
    </div>
  );
}
