import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  fetchResultsByCategory,
  getAccessToken,
  fetchMoreGenreResults,
} from "../Components/itemResults/apiFetcher.js";
import FullCard from "../Components/fullCard/fullCard.jsx";
import "./Results.css";

const PAGE_SIZE = 30; // Number of items fetched per "Load More" click

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState({}); // Loading state per group
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Current offsets and exhausted status for each group
  const [groupOffsets, setGroupOffsets] = useState({});
  const [exhaustedGroups, setExhaustedGroups] = useState({});

  useEffect(() => {
    const searchData = location.state || {};

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchResultsByCategory(searchData);
        setResults(data || []);

        // Initialize offsets based on how many items were initially returned per group 
        // (since your initial fetch pulls 2 pages / 20 items, we start the offset there)
        const initialOffsets = {};
        (data || []).forEach((group, index) => {
          initialOffsets[index] = group.items?.length || 100;
        });
        setGroupOffsets(initialOffsets);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [location.state]);

  if (loading) return <div>Loading results...</div>;
  if (error) return <div>Error: {error}</div>;

  const isGrouped =
    Array.isArray(results) && results[0]?.subgenreName !== undefined;

  // Handle fetching more items
  const handleLoadMore = async (groupIndex, groupName) => {
    // Fallback to 100 if offset hasn't been set yet
    const currentOffset = groupOffsets[groupIndex] ?? 100;
    if (loadingMore[groupIndex]) return; // Prevent concurrent double-clicks

    setLoadingMore((prev) => ({ ...prev, [groupIndex]: true }));

    try {
      const token = await getAccessToken();
      const moreItems = await fetchMoreGenreResults(
        groupName,
        token,
        "artist",
        currentOffset,
        PAGE_SIZE,
      );

      if (moreItems.length === 0) {
        setExhaustedGroups((prev) => ({ ...prev, [groupIndex]: true }));
      } else {
        setResults((prevResults) => {
          const newResults = [...prevResults];
          const currentGroupItems = newResults[groupIndex].items;

          // Create a Set of existing item IDs to prevent duplicates
          const existingIds = new Set(currentGroupItems.map((item) => item.id));
          const uniqueNewItems = moreItems.filter(
            (item) => !existingIds.has(item.id),
          );

          // If no unique items are left, mark as exhausted
          if (uniqueNewItems.length === 0) {
            setExhaustedGroups((prev) => ({ ...prev, [groupIndex]: true }));
            return prevResults;
          }

          newResults[groupIndex].items = [
            ...currentGroupItems,
            ...uniqueNewItems,
          ];
          return newResults;
        });

        // Increment offset by the new PAGE_SIZE batch count
        setGroupOffsets((prev) => ({
          ...prev,
          [groupIndex]: currentOffset + PAGE_SIZE,
        }));
      }
    } catch (err) {
      console.error("Failed to load more items:", err);
    } finally {
      setLoadingMore((prev) => ({ ...prev, [groupIndex]: false }));
    }
  };

  const formatItemForModal = (item) => {
    if (!item) return null;
    return {
      ...item,
      name: item.name || item.title,
      image: item.imageUrl || item.image,
      followers:
        item.followers ||
        (item.listeners ? `${item.listeners} listeners` : null),
      subtitle: item.subtitle,
      matchScore: item.matchScore,
    };
  };

  return (
    <div className="results-page">
      <div className="r-top">
        <h2 className="r-title">Let's See...</h2>
        <Link to="/form" className="form-button">
          {"<-"} Let's Try Something Different
        </Link>
      </div>

      {/* Grouped Subgenres */}
      {results.length === 0 ? (<p className="no-results"> No results found. </p>)
      : isGrouped ? (
        results.map((group, groupIndex) => {
          const groupKey = group.subgenreName || groupIndex;
          const isExhausted = exhaustedGroups[groupIndex];
          const isLoadingMore = loadingMore[groupIndex];

          return (
            <div key={groupKey} className="subgenre-group">
              <h3 className="r-sub">{group.subgenreName.toUpperCase()}</h3>

              <div className="r-card-grid">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={item.id || itemIndex}
                    className="r-card"
                    onClick={() => setSelectedItem(item)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} />
                    )}
                    <div className="r-card-content">
                      <h4>{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Load More / Out of Results Button */}
              <div className="toggle-btn-container">
                {isExhausted ? (
                  <p className="exhausted-text">
                    End of the line!
                  </p>
                ) : (
                  <button
                    className="toggle-more-btn"
                    onClick={() =>
                      handleLoadMore(groupIndex, group.subgenreName)
                    }
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Loading more..." : "Load More Results ↓"}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        /* Flat Item List fallback */
        <div className="r-card-grid">
          {results.map((item, index) => (
            <div
              key={item.id || index}
              className="r-card"
              onClick={() => setSelectedItem(item)}
              style={{ cursor: "pointer" }}
            >
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
              <h4>{item.title}</h4>
              {item.subtitle && (
                <p className="card-subtitle">{item.subtitle}</p>
              )}
              {item.followers && (
                <p className="card-followers">👥 {item.followers} followers</p>
              )}
            </div>
          ))}
        </div>
      )}

      <FullCard
        item={formatItemForModal(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onNavigate={() => {
          if (!selectedItem) return;

          const itemName = selectedItem.name || selectedItem.title;
          if (!itemName) return;

          if (
            location.state?.category === "Games" ||
            selectedItem.type === "game"
          ) {
            navigate("/results", {
              state: {
                category: "Games",
                subcategory: "genre",
                subfield: "",
                query: [itemName],
                genres: [],
                platforms: [],
              },
            });
            return;
          }

          if (selectedItem.type === "album") {
            navigate("/results", {
              state: {
                category: "Music",
                subcategory: "albums",
                subfield: "Similar Albums",
                query: [itemName],
                none: [],
                lengths: ["Doesn't Matter"],
              },
            });
            return;
          }

          navigate("/results", {
            state: {
              category: "Music",
              subcategory: "artists",
              subfield: "Similar Artists",
              query: [itemName],
              none: [],
              lengths: [],
            },
          });
        }}
      />
    </div>
  );
}