import { FontInfo, FontAnalysis, TypographyIssue } from '../types';

// Common font family patterns
const COMMON_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma',
  'Trebuchet MS', 'Calibri', 'Cambria', 'Garamond', 'Palatino',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
  'Ubuntu', 'Raleway', 'Poppins', 'Nunito', 'Playfair Display', 'Merriweather',
  'Bitter', 'Libre Baskerville', 'Work Sans', 'Rubik', 'Inter', 'DM Sans'
];

// Google Fonts list
const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
  'Ubuntu', 'Raleway', 'Poppins', 'Nunito', 'Playfair Display', 'Merriweather',
  'Bitter', 'Libre Baskerville', 'Work Sans', 'Rubik', 'Inter', 'DM Sans',
  'Fira Sans', 'Crimson Text', 'Cardo', 'Spectral', 'PT Serif', 'PT Sans',
  'Noto Sans', 'Noto Serif', 'Archivo', 'Manrope', 'Space Grotesk', 'Barlow',
  'Karla', 'Rubik', 'Zilla Slab', 'Crimson Pro', 'Literata', 'BioRhyme'
];

// System fonts (common on all platforms)
const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New',
  'Trebuchet MS', 'Comic Sans MS', 'Impact', 'Lucida Console'
];

// Font weight mapping
const FONT_WEIGHTS: Record<string, number> = {
  'thin': 100, 'hairline': 100,
  'extralight': 200, 'ultralight': 200,
  'light': 300,
  'regular': 400, 'normal': 400, 'book': 400,
  'medium': 500,
  'semibold': 600, 'demibold': 600, 'semi': 600,
  'bold': 700,
  'extrabold': 800, 'ultrabold': 800,
  'black': 900, 'heavy': 900, 'fat': 900
};

// Font style mapping
const FONT_STYLES = ['normal', 'italic', 'oblique', 'swiss', 'roman'];

function detectFontSource(fontName: string): string {
  const lowerFont = fontName.toLowerCase();

  if (GOOGLE_FONTS.some(f => lowerFont.includes(f.toLowerCase()))) {
    return 'Google Fonts';
  }
  if (lowerFont.includes('adobe') || lowerFont.includes('source') || lowerFont.includes('myriad')) {
    return 'Adobe Fonts';
  }
  if (lowerFont.includes('league') || lowerFont.includes('alise')) {
    return 'The League of Moveable Type';
  }
  if (SYSTEM_FONTS.some(f => lowerFont.includes(f.toLowerCase()))) {
    return 'System Font';
  }

  return 'Unknown - Verify license';
}

function parseFontStyle(fontName: string): { style: string; weight: number } {
  const lowerFont = fontName.toLowerCase();
  let style = 'normal';
  let weight = 400;

  // Detect style
  if (lowerFont.includes('italic') || lowerFont.includes('oblique') || lowerFont.includes('slanted')) {
    style = 'italic';
  }

  // Detect weight
  for (const [name, val] of Object.entries(FONT_WEIGHTS)) {
    if (lowerFont.includes(name)) {
      weight = val;
      break;
    }
  }

  // Check for condensed/extended
  if (lowerFont.includes('condensed')) {
    style += ' condensed';
  } else if (lowerFont.includes('extended') || lowerFont.includes('wide')) {
    style += ' extended';
  }

  return { style: style.trim(), weight };
}

function extractFontFamily(fontName: string): string {
  // Remove style and weight suffixes
  let family = fontName
    .replace(/\s*(Thin|Light|Regular|Medium|Semibold|Bold|Black|Heavy)\s*/gi, '')
    .replace(/\s*(Italic|Oblique|Slanted|Condensed|Extended|Narrow)\s*/gi, '')
    .replace(/\s*\d{3}\s*/g, '')
    .trim();

  // Capitalize properly
  family = family.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return family || fontName;
}

export function analyzeFonts(fonts: string[]): FontAnalysis {
  const analyzedFonts: FontInfo[] = [];
  const missingFonts: string[] = [];
  const inconsistencies: TypographyIssue[] = [];

  const fontSizes = new Set<number>();
  const fontFamilies = new Set<string>();

  fonts.forEach((fontName, index) => {
    if (!fontName || fontName.trim() === '') {
      missingFonts.push(`Font ${index + 1}`);
      return;
    }

    const { style, weight } = parseFontStyle(fontName);
    const family = extractFontFamily(fontName);

    fontFamilies.add(family);
    fontSizes.add(weight);

    const isSystemFont = SYSTEM_FONTS.some(f =>
      family.toLowerCase().includes(f.toLowerCase())
    );

    analyzedFonts.push({
      family,
      style,
      weight,
      embedded: !isSystemFont,
      subset: !isSystemFont && Math.random() > 0.3, // Simulated
      encoding: ['Unicode', 'WinAnsi', 'MacRoman'],
      source: detectFontSource(family),
      isSystemFont,
    });
  });

  // Check for typography inconsistencies
  if (fontFamilies.size > 5) {
    inconsistencies.push({
      page: 1,
      element: 'Multiple Font Families',
      issue: `Document uses ${fontFamilies.size} different font families. Consider consolidating for consistency.`,
      severity: 'warning',
      recommendation: 'Limit to 2-3 font families for better visual cohesion and faster rendering.',
    });
  }

  if (fontSizes.size > 7) {
    inconsistencies.push({
      page: 1,
      element: 'Font Weights',
      issue: `Document contains ${fontSizes.size} different font weights. This may affect visual hierarchy.`,
      severity: 'info',
      recommendation: 'Stick to 3-4 font weights for clearer hierarchy (e.g., Regular, Medium, Bold).',
    });
  }

  // Check for missing fonts
  const commonFontsMissing = fonts.filter(f =>
    COMMON_FONTS.some(cf => f.toLowerCase().includes(cf.toLowerCase()))
  );

  if (commonFontsMissing.length === 0 && fonts.length > 0) {
    inconsistencies.push({
      page: 1,
      element: 'Non-standard Fonts',
      issue: 'Document uses non-standard fonts that may not be available on all systems.',
      severity: 'warning',
      recommendation: 'Consider subsetting embedded fonts or converting text to outlines for guaranteed rendering.',
    });
  }

  // Calculate typography score
  let typographyScore = 100;

  // Deduct for missing fonts
  typographyScore -= missingFonts.length * 5;

  // Deduct for inconsistencies
  typographyScore -= inconsistencies.filter(i => i.severity === 'error').length * 10;
  typographyScore -= inconsistencies.filter(i => i.severity === 'warning').length * 5;

  // Check embedded status
  const embeddedCount = analyzedFonts.filter(f => f.embedded).length;
  const embeddedStatus = embeddedCount === analyzedFonts.length
    ? 'fully'
    : embeddedCount > 0
      ? 'subset'
      : 'not-embedded';

  return {
    fonts: analyzedFonts,
    missingFonts,
    embeddedStatus,
    typographyScore: Math.max(0, typographyScore),
    inconsistencies,
  };
}

export function generateFontReport(fontAnalysis: FontAnalysis): string {
  let report = '# Font Analysis Report\n\n';

  report += `## Summary\n`;
  report += `- Total Fonts: ${fontAnalysis.fonts.length}\n`;
  report += `- Missing Fonts: ${fontAnalysis.missingFonts.length}\n`;
  report += `- Typography Score: ${fontAnalysis.typographyScore}/100\n`;
  report += `- Embedding Status: ${fontAnalysis.embeddedStatus}\n\n`;

  if (fontAnalysis.fonts.length > 0) {
    report += `## Font Inventory\n`;
    report += `| Family | Style | Weight | Source | Embedded |\n`;
    report += `|--------|-------|--------|--------|----------|\n`;

    fontAnalysis.fonts.forEach(font => {
      report += `| ${font.family} | ${font.style} | ${font.weight} | ${font.source} | ${font.embedded ? 'Yes' : 'No'} |\n`;
    });
    report += '\n';
  }

  if (fontAnalysis.inconsistencies.length > 0) {
    report += `## Typography Issues\n`;
    fontAnalysis.inconsistencies.forEach(issue => {
      report += `### ${issue.element} (Page ${issue.page})\n`;
      report += `- **Severity:** ${issue.severity}\n`;
      report += `- **Issue:** ${issue.issue}\n`;
      report += `- **Recommendation:** ${issue.recommendation}\n\n`;
    });
  }

  return report;
}

// Font license verification helper
export function checkFontLicense(fontName: string): {
  source: string;
  license: string;
  commercialUse: boolean;
  requiresVerification: boolean;
} {
  const source = detectFontSource(fontName);

  const licenses: Record<string, { license: string; commercialUse: boolean; requiresVerification: boolean }> = {
    'Google Fonts': {
      license: 'Apache 2.0 / SIL Open Font License',
      commercialUse: true,
      requiresVerification: false
    },
    'Adobe Fonts': {
      license: 'Adobe CC Subscription',
      commercialUse: true,
      requiresVerification: true
    },
    'The League of Moveable Type': {
      license: 'SIL Open Font License',
      commercialUse: true,
      requiresVerification: false
    },
    'System Font': {
      license: 'System bundled',
      commercialUse: true,
      requiresVerification: false
    },
  };

  return {
    source,
    ...licenses[source] || { license: 'Verify per font', commercialUse: false, requiresVerification: true },
  };
}