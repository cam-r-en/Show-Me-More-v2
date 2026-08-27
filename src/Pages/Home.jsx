import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;

function Home() {
  const [category, setCategory] = useState({
    music: { genres: [], albums: [], artists: [] },
    games: { genres: [], popgames: [], consoles: [] },
  });

  // Get Spotify access token
  const getAccessToken = async () => {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token;
  };

  const customImages = {
    Steam: "https://store.fastly.steamstatic.com/public/shared/images/responsive/steam_share_image.jpg",
    Nintendo:
      "https://i.pinimg.com/736x/f4/17/f2/f417f2197cee8cf7db2120edfb61a617.jpg",
    Playstation:
      "https://static0.srcdn.com/wordpress/wp-content/uploads/2025/08/playstation-logo-shapes.jpg?w=1600&h=1200&fit=crop",
    Action: "https://deadline.com/wp-content/uploads/2022/12/God-of-War.jpg",
    Adventure:
      "https://image.api.playstation.com/vulcan/ap/rnd/202010/2822/1AecTg1xPBgt4dEFi5t2dvgx.png",
    Platformer:
      "https://gamingbolt.com/wp-content/uploads/2010/05/limbo-tp.jpg",
    Shooter:
      "https://store-images.s-microsoft.com/image/apps.27881.13769435894253706.0250f733-83d1-418c-9dda-58cd997dadf4.65846e55-1536-43f2-84a7-64dbc7f3beca?q=90&w=480&h=270",
    Simulation:
      "https://static.wixstatic.com/media/e63761_c02d27e081e14b77b3cd47665106ce38~mv2.png/v1/fill/w_1000,h_563,al_c,q_90,usm_0.66_1.00_0.01/e63761_c02d27e081e14b77b3cd47665106ce38~mv2.png",
    Fighting:
      "https://bleedingcool.com/wp-content/uploads/2018/11/Super-Smash-Bros-Ultimate-Nov-Direct-18-1200x675.jpg",
    Racing: "https://cdn.mos.cms.futurecdn.net/p4fSkPtHLMUz8tDRo248oB.jpg",
    Casual:
      "https://static0.colliderimages.com/wordpress/wp-content/uploads/2024/03/among-us-social-featured.jpg",
    Sports:
      "https://justsaying.asia/wp-content/uploads/2017/06/nba-2k18-feature.jpg",
    "Grand Theft Auto V":
      "https://www.chromethemer.com/download/hd-wallpapers/gta-5-trunk-1920x1080.jpg",
    "Fortnite: Save The World":
      "https://images2.minutemediacdn.com/image/upload/c_crop,w_1280,h_720,x_0,y_0/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/voltaxMediaLibrary/mmsport/esports_illustrated/01jbd16xm5dvta24j9dc.jpg",
    Xbox: "https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/23179404/jbareham_220118_ecl1087_stock_xbox_0002.jpg",
    "Super Mario Odyssey":
      "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/03/super-mario-odyssey-sequel-beanbean-kingdom.jpg?w=1600&h=900&fit=crop",
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const token = await getAccessToken();

        const chosenGenres = [
          "pop",
          "hiphop",
          "rock",
          "rnb",
          "alternative",
          "country",
          "metal",
          "indie",
          "jazz",
          "blues",
        ];
        const chosenArtists = [
          "2YZyLoL8N0Wb9xBt1NhZWg", // Kendrick Lamar
          "5INjqkS1o8h1imAzPqGZBb", // Tame Impala
          "699OTQXzgjhIYAHMy9RyPD", // Playboi Carti
          "2h93pZq0e7k5yf4dywlkpM", // Frank Ocean
          "4V8LLVI7PbaPR0K2TGSxFF", // Tyler, The Creator
          "0Y5tJX1MQlPlqiwlOH1tJY", // Travis Scott
          "1Xyo4u8uXC1ZmMpatF05PJ", // The Weeknd
          "6vWDO969PvNqNYHIOW5v0m", // Beyoncé
          "3fMbdgg4jU18AjLCKBhRSm", // Michael Jackson
          "6qqNVTkY8uBg9cP3Jd7DAH", // Billie Eilish
          "3TVXtAsR1Inumwj472S9r4", // Drake
        ];
        const chosenAlbums = [
          "79dL7FLiJFOO0EoehUHQBv", // Currents
          "2ANVost0y2y52ema1E9xAZ", // Thriller
          "4yP0hdKOZPNshxUOjY0cZj", // After Hours
          "7ycBtnsMtyVbbwTfJwRjSP", // To Pimp a Butterfly
          "20r762YmB5HeofjMCiPMLv", // My Beautiful Dark Twisted Fantasy
          "0bUTHlWbkSQysoM3VsWldT", // Demon Days
          "3mH6qwIy9crq0I9YQbOuDf", // Blonde
          "65U0318qRWetMVniHYrZSx", // The Miseducation of Lauryn Hill
          "2fYhqwDWXjbpjaIJPEfKFw", // thank u, next
          "0S0KGZnfBGSIssfF54WSJh", // when we all fall asleep, where do we go?
        ];

        // Fetch all three types concurrently
        const [genresRes, artistsRes, albumsRes] = await Promise.all([
          Promise.all(
            chosenGenres.map((genre) =>
              fetch(`https://api.spotify.com/v1/browse/categories/${genre}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).then((res) => res.json()),
            ),
          ),
          fetch(
            `https://api.spotify.com/v1/artists?ids=${chosenArtists.join(",")}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ).then((res) => res.json()),
          fetch(
            `https://api.spotify.com/v1/albums?ids=${chosenAlbums.join(",")}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ).then((res) => res.json()),
        ]);

        // --- RAWG ---
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
        const chosenConsoleIds = [4, 18, 1, 7]; // PC, PlayStation, Xbox, Nintendo
        const chosenConsoleNames = [
          "Steam",
          "Playstation",
          "Xbox",
          "Nintendo",
          "iOS",
          "Android",
        ]; // Names for display

        const [genreData, gamesData, consolesData] = await Promise.all([
          Promise.all(
            chosenGameGenres.map((slug) =>
              fetch(
                `https://api.rawg.io/api/genres/${slug}?key=${RAWG_API_KEY}`,
              ).then((res) => res.json()),
            ),
          ),
          Promise.all(
            chosenGames.map((slug) =>
              fetch(
                `https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`,
              ).then((res) => res.json()),
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

        // Map console data with names instead of IDs
        const consolesWithNames = consolesData.map((console, idx) => ({
          ...console,
          name: chosenConsoleNames[idx],
        }));

        setCategory({
          music: {
            genres: genresRes || [],
            artists: artistsRes?.artists || [],
            albums: albumsRes?.albums || [],
          },
          games: {
            genres: genreData || [],
            popular: gamesData || [],
            consoles: consolesWithNames || [],
          },
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="homePage">
      <div className="welcome-tab">
        <h1 className="title">SMM</h1>
        <Link className="formbtn" to="/form">
          Find What You Want
        </Link>
      </div>
      <video className="introVideo" autoPlay loop muted>
        <source src="imgs/SMM.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {Object.entries(category).map(([mainCategory, subcategories]) => (
        <div key={mainCategory} className="categorySection">
          <h2 className="categoryTitle">{mainCategory.toUpperCase()}</h2>

          {Object.entries(subcategories).map(([subCategory, items]) => (
            <div key={subCategory} className="subcategorySection">
              <h3 className="subcategoryTitle">{subCategory.toUpperCase()}</h3>
              <div className="scrollList">
                {items.length > 0 ? (
                  items.map((item, i) => (
                    <Link
                      key={i}
                      to={`/quickresults/${encodeURIComponent(item.name)}`}
                      className="card"
                    >
                      <img
                        src={
                          customImages[item.name] || // Check for custom image first
                          item.icons?.[0]?.url || // Spotify category
                          item.images?.[0]?.url || // Spotify album/artist
                          item.background_image || // RAWG games
                          item.image_background || // RAWG genres/platforms
                          item.image || // Fallback if there's a manually added image
                          "default-image.jpg"
                        }
                        alt={item.name}
                        className="cardImage"
                      />

                      <p className="cardName">{item.name}</p>
                    </Link>
                  ))
                ) : (
                  <p>No items available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Home;
