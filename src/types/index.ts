// File Types
export type FileType = 'pdf' | 'png' | 'jpeg' | 'tiff' | 'psd' | 'webp';

export interface FileInfo {
  name: string;
  size: number;
  type: FileType;
  lastModified: Date;
}

// Font Analysis Types
export interface FontInfo {
  family: string;
  style: string;
  weight: number;
  embedded: boolean;
  subset: boolean;
  encoding: string[];
  source: string;
  isSystemFont: boolean;
}

export interface FontAnalysis {
  fonts: FontInfo[];
  missingFonts: string[];
  embeddedStatus: 'fully' | 'subset' | 'not-embedded';
  typographyScore: number;
  inconsistencies: TypographyIssue[];
}

export interface TypographyIssue {
  page: number;
  element: string;
  issue: string;
  severity: 'warning' | 'error' | 'info';
  recommendation: string;
}

// Image Analysis Types
export interface ImageMetrics {
  width: number;
  height: number;
  dpi: number;
  colorSpace: string;
  bitDepth: number;
  compression: string;
  hasAlpha: boolean;
}

export interface ImageAnalysis {
  metrics: ImageMetrics;
  physicalDimensions: { width: number; height: number; unit: string };
  resolutionStatus: 'excellent' | 'good' | 'acceptable' | 'poor';
  sharpnessScore: number;
  compressionQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
  printSize: { width: string; height: string };
}

// Print Production Types
export interface LayoutAnalysis {
  bleedSize: number;
  trimSize: { width: number; height: number };
  safeZone: { width: number; height: number };
  margins: { top: number; right: number; bottom: number; left: number };
  hasBleed: boolean;
  safeZoneCompliant: boolean;
}

export interface ColorAnalysis {
  colorSpace: string;
  cmykConversionRisk: 'low' | 'medium' | 'high';
  inkCoverage: number;
  richBlackDetected: boolean;
  spotColors: string[];
  profileInfo: string;
}

export interface PrintProductionAnalysis {
  layout: LayoutAnalysis;
  color: ColorAnalysis;
  transparencyLayers: number;
  overprintSettings: string[];
  layerCount: number;
  overallCompliance: boolean;
}

// Issue and Report Types
export type IssueSeverity = 'critical' | 'warning' | 'info' | 'pass';

export interface Issue {
  id: string;
  category: 'fonts' | 'images' | 'layout' | 'color' | 'compliance';
  severity: IssueSeverity;
  title: string;
  description: string;
  page?: number;
  recommendation: string;
  autoFixable: boolean;
}

export interface AnalysisReport {
  fileInfo: FileInfo;
  fontAnalysis: FontAnalysis | null;
  imageAnalysis: ImageAnalysis | null;
  printProductionAnalysis: PrintProductionAnalysis | null;
  issues: Issue[];
  overallScore: number;
  complianceStatus: 'pass' | 'fail' | 'conditional';
  timestamp: Date;
  aiLearnedCorrections: number;
}

// AI Learning Types
export interface LearningData {
  totalAnalyses: number;
  correctionsApplied: number;
  accuracyScore: number;
  lastUpdated: Date;
  learnedPatterns: string[];
}

export interface FeedbackEntry {
  id: string;
  issueId: string;
  correction: string;
  userAccepted: boolean;
  timestamp: Date;
}

// PDF Viewer Types
export interface ViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  fitMode: 'width' | 'page' | 'actual';
  rotation: number;
}

// Context Types
export interface AppState {
  file: File | null;
  fileInfo: FileInfo | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  report: AnalysisReport | null;
  viewerState: ViewerState;
  learningData: LearningData;
  showThumbnails: boolean;
  activeTab: 'overview' | 'issues' | 'fonts' | 'images' | 'compliance';
}

export type AppAction =
  | { type: 'SET_FILE'; payload: { file: File; fileInfo: FileInfo } }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_REPORT'; payload: AnalysisReport }
  | { type: 'SET_VIEWER_STATE'; payload: Partial<ViewerState> }
  | { type: 'SET_LEARNING_DATA'; payload: LearningData }
  | { type: 'SET_SHOW_THUMBNAILS'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'CLEAR_FILE' };

// Font Source Database
export const FONT_SOURCES = {
  google: {
    name: 'Google Fonts',
    license: 'Open Source (Apache 2.0 / OFL)',
    commercialUse: true,
  },
  dafont: {
    name: 'DaFont',
    license: 'Varies by font',
    commercialUse: 'Requires verification',
  },
  fontSquirrel: {
    name: 'Font Squirrel',
    license: 'Commercial approved',
    commercialUse: true,
  },
  '1001fonts': {
    name: '1001 Fonts',
    license: 'Varies by font',
    commercialUse: 'Requires verification',
  },
  adobe: {
    name: 'Adobe Fonts',
    license: 'CC Subscription required',
    commercialUse: 'With subscription',
  },
  befonts: {
    name: 'Befonts',
    license: 'Free for personal use',
    commercialUse: 'Check individual license',
  },
  urban: {
    name: 'Urban Fonts',
    license: 'Mixed',
    commercialUse: 'Varies by font',
  },
  fontspace: {
    name: 'FontSpace',
    license: 'Community uploads',
    commercialUse: 'License filtering available',
  },
  league: {
    name: 'The League of Moveable Type',
    license: 'Open Source (OFL)',
    commercialUse: true,
  },
  velvetyne: {
    name: 'Velvetyne Type Foundry',
    license: 'Open Source',
    commercialUse: true,
  },
} as const;

// Print Standards
export const PRINT_STANDARDS = {
  minimumDPI: 300,
  recommendedDPI: 400,
  maximumInkCoverage: 300,
  recommendedInkCoverage: 240,
  minimumBleed: 0.125,
  recommendedBleed: 0.25,
  safeZonePercentage: 0.125,
} as const;