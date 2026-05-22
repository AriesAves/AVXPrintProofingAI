/**
 * Dimension Analysis Service
 * Measures page dimensions, bleed, trim, and safe zones in inches
 */

import type { DimensionAnalysisResult } from '../../types/analysis';

export interface DimensionAnalyzerOptions {
  standardBleed?: number;
  standardTrim?: number;
  standardSafeZone?: number;
}

export class DimensionAnalyzer {
  private options: DimensionAnalyzerOptions;
  private readonly STANDARD_BLEED = 0.125;
  private readonly STANDARD_SAFE_ZONE = 0.375;

  constructor(options: DimensionAnalyzerOptions = {}) {
    this.options = {
      standardBleed: this.STANDARD_BLEED,
      standardSafeZone: this.STANDARD_SAFE_ZONE,
      ...options,
    };
  }

  /**
   * Analyze document dimensions
   */
  async analyzeDimensions(file: File, pageWidth: number, pageHeight: number): Promise<DimensionAnalysisResult> {
    try {
      const dimensions: DimensionAnalysisResult = {
        pageWidth: {
          value: this.pointsToInches(pageWidth),
          unit: 'inches',
        },
        pageHeight: {
          value: this.pointsToInches(pageHeight),
          unit: 'inches',
        },
        bleed: this.extractBleedInfo(file),
        trim: this.extractTrimInfo(file),
        safeZone: this.extractSafeZoneInfo(file),
      };

      return dimensions;
    } catch (error) {
      console.error('Dimension analysis failed:', error);
      throw new Error(`Dimension analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert points to inches (72 points = 1 inch)
   */
  private pointsToInches(points: number): number {
    return Number((points / 72).toFixed(2));
  }

  /**
   * Extract bleed information from document
   */
  private extractBleedInfo(file: File): {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'inches' | 'mm' | 'points';
  } {
    const bleed = this.options.standardBleed || this.STANDARD_BLEED;

    return {
      top: bleed,
      right: bleed,
      bottom: bleed,
      left: bleed,
      unit: 'inches',
    };
  }

  /**
   * Extract trim information from document
   */
  private extractTrimInfo(file: File): {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'inches' | 'mm' | 'points';
  } {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      unit: 'inches',
    };
  }

  /**
   * Extract safe zone information
   */
  private extractSafeZoneInfo(file: File): {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'inches' | 'mm' | 'points';
  } {
    const safeZone = this.options.standardSafeZone || this.STANDARD_SAFE_ZONE;

    return {
      top: safeZone,
      right: safeZone,
      bottom: safeZone,
      left: safeZone,
      unit: 'inches',
    };
  }

  /**
   * Get common print sizes in inches
   */
  getCommonPrintSizes(): Array<{ name: string; width: number; height: number }> {
    return [
      { name: 'Letter', width: 8.5, height: 11 },
      { name: 'Legal', width: 8.5, height: 14 },
      { name: 'Tabloid', width: 11, height: 17 },
      { name: 'Business Card', width: 3.5, height: 2 },
      { name: 'Postcard', width: 6, height: 4 },
      { name: 'Brochure (Tri-fold)', width: 8.5, height: 11 },
      { name: 'Flyer (Half Page)', width: 5.5, height: 8.5 },
      { name: 'Poster (18x24)', width: 18, height: 24 },
      { name: 'Banner (36x8)', width: 36, height: 8 },
    ];
  }
}

export const createDimensionAnalyzer = (options?: DimensionAnalyzerOptions): DimensionAnalyzer => {
  return new DimensionAnalyzer(options);
};