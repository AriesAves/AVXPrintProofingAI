import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCw, Move } from 'lucide-react';

interface ImageViewerProps {
  file: File | null;
}

export default function ImageViewer({ file }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(400, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(25, prev - 25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const deltaX = e.clientX - rect.left - container.clientWidth / 2;
    const deltaY = e.clientY - rect.top - container.clientHeight / 2;

    setPosition(prev => ({
      x: prev.x + deltaX * 0.1,
      y: prev.y + deltaY * 0.1,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -25 : 25;
    setZoom(prev => Math.min(400, Math.max(25, prev + delta)));
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-navy-charcoal/50 rounded-xl">
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-secondary/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-text-secondary">No image loaded</p>
          <p className="text-text-secondary/60 text-sm mt-2">
            Drop an image file to preview
          </p>
        </div>
      </div>
    );
  }

  const scale = zoom / 100;

  return (
    <div className="flex flex-col h-full bg-deep-charcoal">
      {/* Toolbar */}
      <div className="preview-toolbar mb-3 mx-3 mt-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="toolbar-btn"
            title="Zoom out"
            disabled={zoom <= 25}
          >
            <ZoomOut size={18} />
          </button>

          <select
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="h-7 px-2 bg-navy-charcoal border border-border-slate rounded text-sm
                       focus:border-teal-accent/50 focus:outline-none cursor-pointer"
          >
            <option value={25}>25%</option>
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={150}>150%</option>
            <option value={200}>200%</option>
            <option value={300}>300%</option>
            <option value={400}>400%</option>
          </select>

          <button
            onClick={handleZoomIn}
            className="toolbar-btn"
            title="Zoom in"
            disabled={zoom >= 400}
          >
            <ZoomIn size={18} />
          </button>

          <button
            onClick={handleReset}
            className="toolbar-btn"
            title="Reset view"
          >
            <Move size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-border-slate mx-1" />

        {/* Rotation */}
        <button
          onClick={handleRotate}
          className="toolbar-btn"
          title="Rotate 90 degrees"
        >
          <RotateCw size={18} />
        </button>

        {/* Fullscreen placeholder */}
        <button className="toolbar-btn ml-auto" title="Fullscreen">
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Image Viewer Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Checkerboard background for transparency */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, #1a2332 25%, transparent 25%),
            linear-gradient(-45deg, #1a2332 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1a2332 75%),
            linear-gradient(-45deg, transparent 75%, #1a2332 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }} />

        {/* Centered image container */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <img
            ref={imageRef}
            src={URL.createObjectURL(file)}
            alt={file.name}
            onLoad={handleImageLoad}
            className="max-w-full max-h-full"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
            draggable={false}
          />
        </div>

        {/* Pixel inspection overlay (optional) */}
        {imageRef.current && zoom >= 200 && (
          <div className="absolute bottom-4 left-4 bg-navy-charcoal/90 backdrop-blur-sm rounded-lg p-3 border border-border-slate/50">
            <div className="text-xs text-text-secondary">
              <p>Dimensions: {imageSize.width} × {imageSize.height}</p>
              <p>Zoom: {zoom}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Info Bar */}
      <div className="px-4 py-2 bg-navy-charcoal/50 border-t border-border-slate/50 flex items-center justify-between text-xs text-text-secondary">
        <span>{file.name}</span>
        <span>{imageSize.width > 0 ? `${imageSize.width} × ${imageSize.height} px` : 'Loading...'}</span>
        <span>Zoom: {zoom}% | Rotation: {rotation}°</span>
      </div>
    </div>
  );
}