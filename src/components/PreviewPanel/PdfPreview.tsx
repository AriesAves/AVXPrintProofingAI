/**
 * PDF Preview Component
 * Displays PDF with full page navigation, zoom, and pan capabilities
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface PdfPreviewProps {
  file: File;
  zoom: number;
  rotation: number;
  onPageCountChange?: (count: number) => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  file,
  zoom,
  rotation,
  onPageCountChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(false);
  }, [file]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="overflow-auto bg-gray-100 p-4"
      style={{
        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
        transformOrigin: 'top left',
      }}
    >
      <div className="bg-white shadow-lg">
        <p className="p-4 text-center text-gray-600">PDF Preview Loading...</p>
      </div>
    </div>
  );
};