/**
 * Type definitions for prepress validation and print standards
 */

export interface PrintStandards {
  name: string;
  organization: string;
  version: string;
  
  // Bleed specifications
  bleedRequirement: {
    standard: number;
    unit: 'inches' | 'mm';
    minimum: number;
    recommended: number;
  };
  
  // Resolution requirements
  imageResolution: {
    minimum: number;
    recommended: number;
    unit: 'dpi' | 'ppi';
  };
  
  // Color requirements
  colorRequirements: {
    requiredColorSpace: 'CMYK' | 'RGB' | 'both';
    maxInkCoverage: number;
    cmykComposition?: {
      cyan: number;
      magenta: number;
      yellow: number;
      black: number;
    };
  };
  
  // Font requirements
  fontRequirements: {
    outlineRequired: boolean;
    minimumSize: number;
    embeddingRequired: boolean;
  };
}

export interface BleedConfiguration {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'inches' | 'mm' | 'points';
  standard: 'PRINT' | 'WEB' | 'CUSTOM';
}

export interface TrimConfiguration {
  width: number;
  height: number;
  unit: 'inches' | 'mm' | 'points';
  bleedAllowance: BleedConfiguration;
}

export interface SafeZoneConfiguration {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'inches' | 'mm' | 'points';
  description: string;
}

export interface PreflightReport {
  documentName: string;
  generatedAt: Date;
  standards: PrintStandards[];
  
  checks: PreflightCheck[];
  
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    readyForProduction: boolean;
  };
  
  recommendations: string[];
  corrections: PreflightCorrection[];
}

export interface PreflightCheck {
  id: string;
  name: string;
  standard: string;
  status: 'pass' | 'fail' | 'warning' | 'skipped';
  message: string;
  details?: Record<string, unknown>;
  correctable: boolean;
}

export interface PreflightCorrection {
  checkId: string;
  title: string;
  description: string;
  method: 'automatic' | 'manual';
  steps?: string[];
  estimatedTime?: number; // minutes
  risk?: 'low' | 'medium' | 'high';
}

export interface ProductionProfile {
  name: string;
  description: string;
  standards: PrintStandards[];
  bleedConfig: BleedConfiguration;
  trimConfig: TrimConfiguration;
  safeZoneConfig: SafeZoneConfiguration;
  colorMode: 'CMYK' | 'RGB' | 'Grayscale';
  minResolution: number;
  maxFileSizeMB: number;
  allowedFormats: string[];
  createdAt: Date;
}