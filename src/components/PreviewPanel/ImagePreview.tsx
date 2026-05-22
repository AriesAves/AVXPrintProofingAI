/**
 * Image Preview Component
 * Displays images (PNG, JPEG, TIFF, PSD, etc.) with zoom and pan support
 */

import React, { useState, useEffect } from 'react';

export interface ImagePreviewProps {
  file: File;
  zoom: number;
  rotation: number;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  zoom,
  rotation,
}) => {
  const [src, setSrc] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new FileReader();

    reader.onload = (e) => {
      setSrc(e.target?.result as string);
    };

    reader.onerror = () => {
      setError('Failed to load image');
    };

    reader.readAsDataURL(file);
  }, [file]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-auto bg-gray-100 p-4">
      <img
        src={src}
        alt="Preview"
        className="max-h-full max-w-full bg-white shadow-lg"
        style={{
          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
          transformOrigin: 'center',
        }}
      />
    </div>
  );
};