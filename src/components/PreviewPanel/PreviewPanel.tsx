/**
 * Main Preview Panel Component
 * Orchestrates file preview with controls for zoom, page navigation, and pan
 */

import React, { useState, useCallback } from 'react';
import { PdfPreview } from './PdfPreview';
import { ImagePreview } from './ImagePreview';
import { PreviewControls } from './PreviewControls';

export interface PreviewPanelProps {
  file: File | null;
  className?: string;
}

const ZOOM_MIN = 50;
const ZOOM_MAX = 400;
const ZOOM_STEP = 10;

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ file, className = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isPdf = file?.type === 'application/pdf';
  const isImage = file?.type.startsWith('image/');

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX)));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  if (!file) {
    return (
      <div className={`flex h-full items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500">No file selected for preview</p>
          <p className="text-sm text-gray-400">Upload a PDF or image file to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col bg-gray-50 ${className}`}>
      <PreviewControls
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPageChange={handlePageChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomChange={handleZoomChange}
        onRotate={handleRotate}
        canZoomIn={zoom < ZOOM_MAX}
        canZoomOut={zoom > ZOOM_MIN}
      />

      <div className="flex-1 overflow-auto">
        {isPdf && (
          <PdfPreview
            file={file}
            zoom={zoom}
            rotation={rotation}
            onPageCountChange={setTotalPages}
          />
        )}

        {isImage && (
          <ImagePreview
            file={file}
            zoom={zoom}
            rotation={rotation}
          />
        )}

        {!isPdf && !isImage && (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Unsupported file format</p>
          </div>
        )}
      </div>
    </div>
  );
};