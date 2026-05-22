/**
 * Preview Controls Component
 * Provides zoom, pan, page navigation for the preview panel
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PreviewControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (zoom: number) => void;
  onRotate: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onRotate,
  canZoomIn,
  canZoomOut,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => onPageChange(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-12 text-center"
          />
          <span className="text-sm text-gray-600">/ {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={!canZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-32">
          <Input
            type="number"
            min="10"
            max="400"
            step="10"
            value={zoom}
            onChange={(e) => onZoomChange(Math.min(400, Math.max(10, parseInt(e.target.value) || 100)))}
            className="w-16 text-center text-sm"
          />
          <span className="text-sm text-gray-600">%</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={!canZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Additional Controls */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRotate}
        title="Rotate 90 degrees"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
};