import React, { useState } from 'react';
import type { IFileItem } from '../../types';
import { ChevronDown } from 'lucide-react';

interface ImageAlbumProps {
  images: IFileItem[];
  onImageClick: (image: IFileItem) => void;
}

export const ImageAlbum: React.FC<ImageAlbumProps> = ({
  images,
  onImageClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!images.length) return null;

  // Display only the top 3 images in stack view
  const displayImages = isExpanded ? images : images.slice(0, 3);
  const hiddenCount = !isExpanded ? Math.max(0, images.length - 3) : 0;

  return (
    <div className="mt-2 self-center">
      {/* Stack Container */}
      <div
        className={`relative w-44 cursor-pointer ${displayImages.length > 2 ? 'h-58' : displayImages.length > 1 ? 'h-54' : 'h-50'}`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {displayImages.map((image, index) => {
          // Calculate stack offset and rotation
          const offset = index * 12;
          const rotation = (index - Math.floor(displayImages.length / 2)) * 3;

          return (
            <div
              key={image.id}
              className="absolute w-44 h-48 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:z-50 group"
              style={{
                transform: `translateY(${offset}px) rotate(${rotation}deg) ${
                  isExpanded ? 'translateX(0px)' : ''
                }`,
                zIndex: index,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onImageClick(image);
              }}
            >
              <img
                src={image.link}
                alt={image.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

              {/* Image count badge on the first card */}
              {index === 0 && images.length > 1 && !isExpanded && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                  <span>+{hiddenCount}</span>
                  <ChevronDown size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
