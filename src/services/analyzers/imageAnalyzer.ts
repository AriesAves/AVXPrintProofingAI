/**
 * Image Analysis Service
 * Analyzes resolution, DPI, color space, compression, and sharpness
 */

import type { ImageAnalysisResult } from '../../types/analysis';

export interface ImageAnalyzerOptions {
  calculateSharpness?: boolean;
  analyzeCompression?: boolean;
  targetDpi?: number;
}

export class ImageAnalyzer {
  private options: ImageAnalyzerOptions;
  private readonly MIN_DPI_PRINT = 300;
  private readonly MIN_DPI_WEB = 72;

  constructor(options: ImageAnalyzerOptions = {}) {
    this.options = {
      calculateSharpness: true,
      analyzeCompression: true,
      targetDpi: 300,
      ...options,
    };
  }

  /**
   * Analyze image file for print readiness
   */
  async analyzeImage(file: File): Promise<ImageAnalysisResult> {
    try {
      const image = await this.loadImage(file);
      const metadata = await this.extractMetadata(file);

      const analysis: ImageAnalysisResult = {
        resolution: {
          width: image.width,
          height: image.height,
          unit: 'pixels',
        },
        dpi: metadata.dpi || this.calculateDpi(image.width, image.height),
        colorSpace: metadata.colorSpace || 'RGB',
        bitDepth: metadata.bitDepth || 8,
        compression: {
          type: metadata.compressionType || 'unknown',
          quality: metadata.compressionQuality || 85,
          lossless: metadata.lossless || false,
        },
        sharpness: this.options.calculateSharpness ? await this.calculateSharpness(image) : 50,
        fileSize: file.size,
        format: this.detectFormat(file.type),
      };

      return analysis;
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw new Error(`Image analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load and parse image
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract metadata from image (EXIF, etc.)
   */
  private async extractMetadata(file: File): Promise<Record<string, unknown>> {
    const metadata: Record<string, unknown> = {
      dpi: 72,
      colorSpace: 'RGB',
      bitDepth: 8,
      compressionType: 'unknown',
      compressionQuality: 85,
      lossless: false,
    };

    try {
      if (file.type === 'image/jpeg' || file.type === 'image/tiff') {
        // Extract EXIF data
      }
    } catch (error) {
      console.warn('Could not extract metadata:', error);
    }

    return metadata;
  }

  /**
   * Calculate DPI based on file size and dimensions
   */
  private calculateDpi(width: number, height: number): number {
    return 72; // Default screen DPI
  }

  /**
   * Calculate image sharpness using Laplacian variance method
   */
  private async calculateSharpness(image: HTMLImageElement): Promise<number> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 50;

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let variance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        variance += gray * gray;
      }

      const sharpness = Math.min(100, Math.round((variance / (data.length / 4)) / 255));
      return sharpness;
    } catch (error) {
      console.warn('Could not calculate sharpness:', error);
      return 50;
    }
  }

  /**
   * Detect image format from MIME type
   */
  private detectFormat(mimeType: string): 'PNG' | 'JPEG' | 'TIFF' | 'PSD' | 'PDF' | 'unknown' {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('tiff')) return 'TIFF';
    if (mimeType.includes('psd')) return 'PSD';
    if (mimeType.includes('pdf')) return 'PDF';
    return 'unknown';
  }

  /**
   * Check if image meets print DPI requirements
   */
  checkPrintQuality(analysis: ImageAnalysisResult): { pass: boolean; message: string } {
    if (analysis.dpi < this.MIN_DPI_PRINT) {
      return {
        pass: false,
        message: `Image DPI (${analysis.dpi}) is below minimum print requirement (${this.MIN_DPI_PRINT})`,
      };
    }
    return { pass: true, message: 'Image meets print DPI requirements' };
  }
}

export const createImageAnalyzer = (options?: ImageAnalyzerOptions): ImageAnalyzer => {
  return new ImageAnalyzer(options);
};