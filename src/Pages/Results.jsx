import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { fetchResultsByCategory } from "../Components/apiFetcher.js";
import "./Results.css";

export default function Results() {
  const location = useLocation();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchData = location.state || {};

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchResultsByCategory(searchData);
        setResults(data || []);
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

  // Check if data is a grouped subgenre array (e.g. Genre search)
  const isGrouped =
    Array.isArray(results) && results[0]?.subgenreName !== undefined;

  return (
    <div className="results-container">
      <h2>Results</h2>
      <Link to="/form"> Back to Form </Link>

      {/* 1. RENDER GROUPED SUBGENRES (Genre / Something New) */}
      {isGrouped ? (
        results.map((group, groupIndex) => (
          // Outer key on the subgenre container
          <div
            key={group.subgenreName || groupIndex}
            className="subgenre-group"
          >
            <h3>{group.subgenreName.toUpperCase()}</h3>

            <div className="card-grid">
              {group.items.map((item, itemIndex) => (
                // Inner key on the item card
                <div key={item.id || itemIndex} className="card">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} />
                  )}
                  <div className="card-content">
                    <h4>{item.title}</h4>
                    <p>{item.subtitle}</p>
                  </div>
                  {item.externalUrl && (
                    <a href={item.externalUrl} target="_blank" rel="noreferrer">
                      View on Spotify
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        /* 2. RENDER FLAT ITEM LIST (Similar Artists / RAWG Games) */
        <div className="card-grid">
          {results.map((item, index) => (
            // Key on the flat item card
            <div key={item.id || index} className="card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
              {item.externalUrl && (
                <a href={item.externalUrl} target="_blank" rel="noreferrer">
                  View Link
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
