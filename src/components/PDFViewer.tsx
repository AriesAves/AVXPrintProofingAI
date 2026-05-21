import React, { useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Grid3X3,
  RotateCw, SkipBack, SkipForward, LayoutTemplate, Maximize, RotateCcw
} from 'lucide-react';
import { useApp, useViewer } from '../context/AppContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File | null;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewerState, setPage, setZoom, setFitMode, setRotation, setTotalPages } = useViewer();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setTotalPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    setError(`Failed to load PDF: ${err.message}`);
    setLoading(false);
  };

  const goToPrevPage = useCallback(() => {
    setPage(Math.max(1, viewerState.currentPage - 1));
  }, [viewerState.currentPage, setPage]);

  const goToNextPage = useCallback(() => {
    setPage(Math.min(numPages, viewerState.currentPage + 1));
  }, [viewerState.currentPage, numPages, setPage]);

  const goToFirstPage = useCallback(() => setPage(1), [setPage]);
  const goToLastPage = useCallback(() => setPage(numPages), [setPage, numPages]);

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(400, viewerState.zoom + 25));
  }, [viewerState.zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(25, viewerState.zoom - 25));
  }, [viewerState.zoom, setZoom]);

  const handleRotate = useCallback(() => {
    setRotation((viewerState.rotation + 90) % 360);
  }, [viewerState.rotation, setRotation]);

  const handleFitWidth = useCallback(() => {
    setFitMode('width');
    setZoom(100);
  }, [setFitMode, setZoom]);

  const handleFitPage = useCallback(() => {
    setFitMode('page');
    setZoom(100);
  }, [setFitMode, setZoom]);

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      setPage(value);
    }
  };

  const getScale = () => {
    const baseScale = viewerState.zoom / 100;
    if (viewerState.fitMode === 'width' && containerRef.current) {
      return baseScale;
    }
    if (viewerState.fitMode === 'page') {
      return baseScale * 0.9;
    }
    return baseScale;
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-text-secondary">No PDF loaded</p>
          <p className="text-text-secondary/60 text-sm mt-2">
            Drop a PDF file to preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-deep-charcoal">
      {/* Toolbar */}
      <div className="preview-toolbar mb-3 mx-3 mt-3">
        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToFirstPage}
            className="toolbar-btn"
            title="First page"
            disabled={viewerState.currentPage <= 1}
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={goToPrevPage}
            className="toolbar-btn"
            title="Previous page"
            disabled={viewerState.currentPage <= 1}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 px-2 border-x border-border-slate">
            <input
              type="number"
              value={viewerState.currentPage}
              onChange={handlePageInput}
              className="w-12 h-7 text-center bg-navy-charcoal border border-border-slate rounded text-sm
                         focus:border-teal-accent/50 focus:outline-none"
              min={1}
              max={numPages}
            />
            <span className="text-text-secondary text-sm">/ {numPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            className="toolbar-btn"
            title="Next page"
            disabled={viewerState.currentPage >= numPages}
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={goToLastPage}
            className="toolbar-btn"
            title="Last page"
            disabled={viewerState.currentPage >= numPages}
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-border-slate mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="toolbar-btn"
            title="Zoom out"
            disabled={viewerState.zoom <= 25}
          >
            <ZoomOut size={18} />
          </button>

          <select
            value={viewerState.zoom}
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
            disabled={viewerState.zoom >= 400}
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-border-slate mx-1" />

        {/* Fit Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleFitWidth}
            className={`toolbar-btn ${viewerState.fitMode === 'width' ? 'toolbar-btn-active' : ''}`}
            title="Fit width"
          >
            <LayoutTemplate size={18} />
          </button>
          <button
            onClick={handleFitPage}
            className={`toolbar-btn ${viewerState.fitMode === 'page' ? 'toolbar-btn-active' : ''}`}
            title="Fit page"
          >
            <Maximize size={18} />
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

      {/* PDF Viewer Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto px-4 pb-4 scrollbar-thin"
      >
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-error-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-error-red font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary text-sm">Loading PDF...</p>
            </div>
          </div>
        )}

        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex flex-col items-center"
        >
          <Page
            pageNumber={viewerState.currentPage}
            scale={getScale()}
            rotate={viewerState.rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl rounded-lg overflow-hidden"
          />
        </Document>
      </div>

      {/* Page Info Bar */}
      <div className="px-4 py-2 bg-navy-charcoal/50 border-t border-border-slate/50 flex items-center justify-between text-xs text-text-secondary">
        <span>Page {viewerState.currentPage} of {numPages}</span>
        <span>Zoom: {viewerState.zoom}%</span>
        <span>Rotation: {viewerState.rotation}°</span>
      </div>
    </div>
  );
}