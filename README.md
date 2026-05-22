# AVXPrintProofingAI

A professional AI-powered tool for analyzing PDF and image files with comprehensive print production validation, font analysis, and continuous learning capabilities. Features a split-panel interface with live preview on the right side.

## Features

### 📄 File Preview & Navigation
- **Full PDF support** with unrestricted page access
- **Image format support** (PNG, JPEG, TIFF, PSD, etc.)
- **Zoom controls** (50% - 400%)
- **Page navigation** with keyboard and UI controls
- **Rotation** support (90° increments)
- **High-resolution preview** for detailed inspection

### 🔍 Comprehensive Analysis

#### Font Detection & Validation
- Detects embedded and missing fonts
- Identifies font properties (style, weight, size)
- Cross-references with major font libraries:
  - Google Fonts
  - DaFont
  - Font Squirrel
  - 1001 Fonts
  - Adobe Fonts
  - Befonts
  - Urban Fonts
  - FontSpace
  - The League of Moveable Type
  - Velvetyne Type Foundry
- Detects typography inconsistencies

#### Image Analysis
- Resolution and DPI checking
- Color space detection
- Compression quality assessment
- Sharpness calculation
- File size analysis

#### Print Specification Validation
- Bleed verification
- Trim size validation
- Safe zone checking
- Margin compliance
- Overprint detection
- Transparency handling
- Layer analysis
- Print object consistency

#### Color Management
- RGB to CMYK conversion risk assessment
- Ink coverage calculation
- Rich black (4-color black) detection
- Color gamut analysis
- Out-of-gamut color identification

#### Dimension Checking
- Page width/height measurement (in inches)
- Bleed, trim, and safe zone detection
- Common print size database
- Dimension consistency validation

### 📊 Issue Detection & Reporting
- **Categorized issues** (typography, color, resolution, dimensions, compliance, production)
- **Severity levels** (error, warning, info)
- **Intelligent recommendations** with actionable steps
- **Page-specific references** for easy navigation
- **Export functionality** (JSON, CSV, PDF, HTML)
- **Compliance scoring** and pass/fail determination

### 🤖 AI/ML Capabilities
- **Continuous learning** from production feedback
- **Model refinement** based on corrections
- **Improved detection accuracy** over time
- **Smart recommendations** that adapt to workflows
- **Feedback collection** for accuracy improvement

## Project Structure

```
src/
├── components/
│   ├── PreviewPanel/          # PDF/Image preview components
│   │   ├── PreviewPanel.tsx
│   │   ├── PreviewControls.tsx
│   │   ├── PdfPreview.tsx
│   │   └── ImagePreview.tsx
│   └── index.ts
├── services/
│   ├── analyzers/             # Analysis engines
│   │   ├── fontAnalyzer.ts
│   │   ├── imageAnalyzer.ts
│   │   ├── colorAnalyzer.ts
│   │   ├── dimensionAnalyzer.ts
│   │   ├── printSpecAnalyzer.ts
│   │   └── index.ts
│   ├── fileAnalysisEngine.ts  # Master orchestrator
│   ├── issueLogger.ts         # Issue logging & export
│   └── index.ts
├── types/
│   ├── analysis.ts            # Analysis result types
│   ├── issues.ts              # Issue types
│   ├── fonts.ts               # Font types
│   ├── prepress.ts            # Print standard types
│   └── index.ts
└── App.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Production Build

```bash
pnpm build:prod
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **UI Components**: Radix UI + Tailwind CSS
- **PDF Handling**: pdfjs-dist + react-pdf
- **Layout**: react-resizable-panels
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Testing**: Playwright

## API Reference

### File Analysis

```typescript
import { createFileAnalysisEngine } from '@/services';

const engine = createFileAnalysisEngine({
  includeFonts: true,
  includeColors: true,
  includeDimensions: true,
  includePrintSpecs: true,
  generateIssueLog: true,
});

const result = await engine.analyzeFile(file);
console.log(result.readyForProduction);
console.log(result.complianceScore);
```

### Issue Logging

```typescript
import { createIssueLogger } from '@/services';

const logger = createIssueLogger('analysis-123', 'document.pdf');

logger.logIssue(
  'error',
  'typography',
  'Missing Font',
  'Font "Helvetica" is not embedded',
  {
    page: 1,
    recommendations: ['Embed all fonts before printing'],
  }
);

const log = logger.generateLog();
const csv = logger.exportAsCSV();
```

## Supported File Formats

### PDF
- Full page navigation
- Unrestricted access
- Metadata extraction
- Font and color space detection

### Images
- PNG (24-bit, 32-bit)
- JPEG (progressive, baseline)
- TIFF (lossless, LZW compressed)
- PSD (Adobe Photoshop)

## Print Standards Support

- ISO 12647-2 (Graphic technology and photography — Colour prints and proofs)
- GWG (Ghent Workgroup) specifications
- PDF/X standards
- CMYK/RGB color management

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feat/feature-name`)
2. Commit changes (`git commit -am 'Add new feature'`)
3. Push to branch (`git push origin feat/feature-name`)
4. Submit a Pull Request

## Roadmap

- [ ] Advanced OCR text detection
- [ ] Automated font substitution
- [ ] Batch file processing
- [ ] Integration with print production systems
- [ ] Real-time collaboration features
- [ ] Mobile app support
- [ ] REST API for integration

## License

MIT

## Support

For issues and questions, please open a GitHub Issue or contact support.

---

**Last Updated**: May 22, 2026  
**Version**: 0.0.0