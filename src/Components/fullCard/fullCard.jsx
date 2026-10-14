import { useItemDetails } from "./useItemDetails.js";
import { getItemImage, getItemDetails } from "./utility.js";
import { ModalDetailsList, FeaturedContent, ModalActions } from "./ModalContentParts.jsx";
import "./Modal.css";

// The modal stays focused on layout; the hook prepares item data and child
// components render each section so those responsibilities stay separate.
export default function FullCard({
  item,
  customImages,
  externalUrl: providedExternalUrl,
  onClose,
  onNavigate,
}) {
  // Fetches extra provider-specific details and merges them with the original item.
  const displayItem = useItemDetails(item);

  if (!item) return null;

  const imageSrc = getItemImage(displayItem, customImages);
  const details = getItemDetails(displayItem);
  // Prefer an explicitly supplied destination, then URLs included by the item provider.
  const externalUrl =
    providedExternalUrl ||
    displayItem.externalUrl ||
    displayItem.url ||
    displayItem.external_urls?.spotify;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* e.stopPropagation prevents clicks inside the modal card from closing it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <img
          src={imageSrc}
          alt={displayItem.name || displayItem.title}
          className="modal-image"
        />
        
        <h3 className="modal-title">{displayItem.name || displayItem.title}</h3>

        {/* Keep metadata, artist recommendations, and navigation actions in separate sections. */}
        <ModalDetailsList details={details} />
        
        <FeaturedContent displayItem={displayItem} />

        <ModalActions externalUrl={externalUrl} onNavigate={onNavigate} />
      </div>
    </div>
  );
}