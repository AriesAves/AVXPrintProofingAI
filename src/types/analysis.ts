/**
 * Core type definitions for print analysis results
 */

// Font Analysis Types
export interface FontProperty {
  name: string;
  style: 'normal' | 'italic' | 'oblique';
  weight: number;
  size: number;
  embedded: boolean;
  subset: boolean;
  license?: string;
  source?: 'google-fonts' | 'dafont' | 'font-squirrel' | '1001fonts' | 'adobe-fonts' | 'befonts' | 'urban-fonts' | 'fontspace' | 'league-moveable' | 'velvetyne' | 'system' | 'unknown';
  fallback?: string[];
}

export interface FontAnalysisResult {
  fontsDetected: FontProperty[];
  missingFonts: string[];
  fontInconsistencies: {
    page: number;
    issue: string;
    severity: 'warning' | 'error';
  }[];
  totalUniqueFonts: number;
}

// Image Analysis Types
export interface ImageAnalysisResult {
  resolution: {
    width: number;
    height: number;
    unit: 'pixels' | 'inches' | 'mm';
  };
  dpi: number;
  colorSpace: 'RGB' | 'CMYK' | 'Grayscale' | 'Lab' | 'unknown';
  bitDepth: number;
  compression: {
    type: string;
    quality: number; // 0-100
    lossless: boolean;
  };
  sharpness: number; // 0-100
  fileSize: number;
  format: 'PNG' | 'JPEG' | 'TIFF' | 'PSD' | 'PDF' | 'unknown';
}

// Dimension Analysis Types
export interface DimensionAnalysisResult {
  pageWidth: {
    value: number;
    unit: 'inches' | 'mm' | 'points';
  };
  pageHeight: {
    value: number;
    unit: 'inches' | 'mm' | 'points';
  };
  bleed: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'inches' | 'mm' | 'points';
  };
  trim: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'inches' | 'mm' | 'points';
  };
  safeZone: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'inches' | 'mm' | 'points';
  };
}

// Color Analysis Types
export interface ColorAnalysisResult {
  colorSpace: 'RGB' | 'CMYK' | 'Lab' | 'Grayscale' | 'mixed';
  rgbToCmykRisks: {
    identified: boolean;
    risks: string[];
  };
  inkCoverage: {
    maximum: number; // 0-400% (CMYK combined)
    average: number;
    exceedsLimit: boolean;
    limitThreshold: number;
  };
  richBlack: {
    detected: boolean;
    percentage: number;
    recommendation: string;
  };
  colorConversionIssues: {
    gamutWarnings: number;
    outOfGamutColors: Array<{
      color: string;
      suggestion: string;
    }>;
  };
}

// Print Specification Types
export interface PrintSpecValidationResult {
  bleedCompliant: boolean;
  trimCompliant: boolean;
  marginsCompliant: boolean;
  safeZoneCompliant: boolean;
  overprint: {
    detected: boolean;
    areas: Array<{ description: string; page: number }>;
  };
  transparency: {
    detected: boolean;
    count: number;
    recommendation: string;
  };
  layers: {
    count: number;
    hidden: number;
    locked: number;
    analysis: string;
  };
  printObjectConsistency: {
    compliant: boolean;
    issues: string[];
  };
}

// Combined Analysis Result
export interface FileAnalysisResult {
  fileId: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  uploadedAt: Date;
  analyzedAt: Date;
  
  // Individual analysis results
  fonts: FontAnalysisResult;
  images: ImageAnalysisResult[];
  dimensions: DimensionAnalysisResult;
  colors: ColorAnalysisResult;
  printSpecs: PrintSpecValidationResult;
  
  // Overall assessment
  overallQuality: number; // 0-100
  readyForProduction: boolean;
  productionIssueCount: number;
  complianceScore: number; // 0-100
}

// Metadata for learning
export interface AnalysisMetadata {
  analysisId: string;
  modelVersion: string;
  confidenceScores: {
    fonts: number;
    images: number;
    colors: number;
    printSpecs: number;
  };
  processingTime: number; // milliseconds
  executedAt: Date;
}