/**
 * Type definitions for font detection and management
 */

export type FontSource = 
  | 'google-fonts'
  | 'dafont'
  | 'font-squirrel'
  | '1001fonts'
  | 'adobe-fonts'
  | 'befonts'
  | 'urban-fonts'
  | 'fontspace'
  | 'league-moveable'
  | 'velvetyne'
  | 'system'
  | 'unknown';

export interface FontLibraryEntry {
  id: string;
  name: string;
  family: string;
  variants: FontVariant[];
  categories: string[];
  license: {
    type: string;
    commercial: boolean;
    url?: string;
  };
  source: FontSource;
  downloadUrl?: string;
  previewUrl?: string;
  designer?: string;
  dateAdded?: Date;
}

export interface FontVariant {
  weight: number;
  style: 'normal' | 'italic' | 'oblique';
  width?: 'normal' | 'condensed' | 'expanded';
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface FontCache {
  [fontName: string]: {
    entry: FontLibraryEntry;
    cachedAt: Date;
    source: FontSource;
  };
}

export interface FontDetectionResult {
  detectedFont: string;
  confidence: number; // 0-100
  possibleMatches: FontLibraryEntry[];
  embedded: boolean;
  subset: boolean;
  fallbackSuggestions: string[];
}

export interface GoogleFontMetadata {
  family: string;
  variants: string[];
  category: string;
  version: string;
  lastModified: string;
  files: {
    [variant: string]: string;
  };
}

export interface DaFontMetadata {
  name: string;
  author: string;
  category: string;
  license: string;
  commercial: boolean;
  downloadUrl: string;
  rating: number;
}

export interface FontSquirrelMetadata {
  name: string;
  author: string;
  license: string;
  url: string;
  webfontUrl: string;
  previewUrl: string;
}

export interface FontLibraryIndex {
  googleFonts: GoogleFontMetadata[];
  daFont: DaFontMetadata[];
  fontSquirrel: FontSquirrelMetadata[];
  other: FontLibraryEntry[];
  lastUpdated: Date;
}