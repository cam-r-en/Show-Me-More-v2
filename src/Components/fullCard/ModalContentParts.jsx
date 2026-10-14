import defaultSongCover from "../../../imgs/Default [Songs].png";

// Render the preformatted label/value pairs prepared by the utility module.
export function ModalDetailsList({ details }) {
  return (
    <div className="modal-details">
      {details.map(({ label, value }) => (
        <p key={label}>
          <strong>{label}:</strong> {value}
        </p>
      ))}
    </div>
  );
}

// Artist-only: each title links to Spotify and missing art uses a local placeholder.
export function FeaturedContent({ displayItem }) {
  if (displayItem.type !== "artist" || (displayItem.topTracks.length === 0 && displayItem.topAlbums.length === 0)) {
    return null;
  }

  return (
    <div className="modal-featured-content">
      {[
        { title: "Top Tracks", items: displayItem.topTracks },
        { title: "Top Albums", items: displayItem.topAlbums },
      ].map(({ title, items }) => items.length > 0 && (
        <section key={title}>
          <h4>{title}</h4>
          <ul className="modal-cover-grid">
            {items.map((entry, index) => (
              <li key={entry.spotifyUrl || `${entry.name}-${index}`}>
                <img
                  src={entry.imageUrl || defaultSongCover}
                  alt={`${entry.name} cover`}
                  className={!entry.imageUrl ? "modal-cover-placeholder" : ""}
                />
                <a className="spotify-item-title" href={entry.spotifyUrl} target="_blank" rel="noreferrer">
                  {entry.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// Keep external provider navigation distinct from the app's internal results action.
export function ModalActions({ externalUrl, onNavigate }) {
  return (
    <div className="modal-actions">
      {externalUrl && (
        <a className="modal-external-btn" href={externalUrl} target="_blank" rel="noreferrer">
          See More ↗
        </a>
      )}
      <button className="modal-action-btn" onClick={onNavigate}>
        See Similar Results →
      </button>
    </div>
  );
}