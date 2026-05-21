import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Image, File, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FileInfo, FileType } from '../types';

const SUPPORTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'image/webp',
];

const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.tif', '.webp', '.psd'];

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useApp();

  const getFileType = (file: File): FileType => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, FileType> = {
      pdf: 'pdf',
      png: 'png',
      jpg: 'jpeg',
      jpeg: 'jpeg',
      tiff: 'tiff',
      tif: 'tiff',
      webp: 'webp',
      psd: 'psd',
    };
    return typeMap[extension!] || 'pdf';
  };

  const validateFile = (file: File): boolean => {
    // Check MIME type
    const isValidMime = SUPPORTED_TYPES.includes(file.type);

    // Check extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExt = SUPPORTED_EXTENSIONS.includes(ext);

    if (!isValidMime && !isValidExt) {
      setError('Unsupported file type. Please upload PDF, PNG, JPEG, TIFF, WebP, or PSD files.');
      return false;
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 100MB limit.');
      return false;
    }

    setError(null);
    return true;
  };

  const processFile = useCallback((file: File) => {
    if (!validateFile(file)) return;

    const fileInfo: FileInfo = {
      name: file.name,
      size: file.size,
      type: getFileType(file),
      lastModified: new Date(file.lastModified),
    };

    dispatch({
      type: 'SET_FILE',
      payload: { file, fileInfo },
    });
  }, [dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_FILE' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-error-red" />;
      case 'png':
      case 'jpeg':
      case 'tiff':
      case 'webp':
        return <Image className="w-8 h-8 text-purple-accent" />;
      default:
        return <File className="w-8 h-8 text-teal-accent" />;
    }
  };

  if (state.file && state.fileInfo) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-navy-charcoal rounded-lg">
            {getFileIcon(state.fileInfo.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate" title={state.fileInfo.name}>
              {state.fileInfo.name}
            </p>
            <p className="text-sm text-text-secondary">
              {formatFileSize(state.fileInfo.size)} • {state.fileInfo.type.toUpperCase()}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-slate-panel rounded-lg transition-colors"
            title="Remove file"
          >
            <X size={18} className="text-text-secondary hover:text-error-red" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.webp,.psd"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                        transition-all duration-300 ${isDragging
                          ? 'bg-teal-accent/20 scale-110'
                          : 'bg-slate-panel'}`}>
          <Upload
            className={`w-8 h-8 transition-colors ${
              isDragging ? 'text-teal-accent' : 'text-text-secondary'
            }`}
          />
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {isDragging ? 'Drop your file here' : 'Upload File'}
        </h3>

        <p className="text-text-secondary mb-4">
          Drag and drop or click to browse
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {['PDF', 'PNG', 'JPEG', 'TIFF', 'PSD'].map((type) => (
            <span
              key={type}
              className="px-2 py-1 bg-navy-charcoal rounded text-xs text-text-secondary"
            >
              {type}
            </span>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-error-red/10 border border-error-red/30 rounded-lg">
            <p className="text-sm text-error-red">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}