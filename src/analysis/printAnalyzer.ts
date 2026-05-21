import {
  LayoutAnalysis,
  ColorAnalysis,
  PrintProductionAnalysis,
  Issue,
  PRINT_STANDARDS,
} from '../types';

export function analyzePrintProduction(
  fileType: string,
  pageWidth?: number,
  pageHeight?: number,
  bleedBox?: { x: number; y: number; width: number; height: number }
): PrintProductionAnalysis {
  // Default dimensions (US Letter)
  const width = pageWidth || 612; // 8.5 inches in points
  const height = pageHeight || 792; // 11 inches in points

  // Simulated analysis - in production, these would be extracted from PDF metadata
  const bleedSize = bleedBox ? (width - bleedBox.width) / 2 : 18; // ~0.25 inch

  const layout: LayoutAnalysis = {
    bleedSize,
    trimSize: { width: width - bleedSize * 2, height: height - bleedSize * 2 },
    safeZone: {
      width: (width - bleedSize * 2) * 0.875,
      height: (height - bleedSize * 2) * 0.875,
    },
    margins: {
      top: bleedSize + (width - bleedSize * 2) * 0.05,
      right: bleedSize + (width - bleedSize * 2) * 0.05,
      bottom: bleedSize + (width - bleedSize * 2) * 0.05,
      left: bleedSize + (width - bleedSize * 2) * 0.05,
    },
    hasBleed: bleedSize >= PRINT_STANDARDS.minimumBleed * 72,
    safeZoneCompliant: true,
  };

  const color: ColorAnalysis = {
    colorSpace: fileType === 'pdf' ? 'CMYK' : 'RGB',
    cmykConversionRisk: fileType === 'pdf' ? 'low' : 'high',
    inkCoverage: 240 + Math.random() * 60,
    richBlackDetected: Math.random() > 0.5,
    spotColors: [],
    profileInfo: fileType === 'pdf' ? 'ISO Coated v2' : 'sRGB',
  };

  return {
    layout,
    color,
    transparencyLayers: 0,
    overprintSettings: [],
    layerCount: 1,
    overallCompliance: layout.hasBleed && color.inkCoverage <= PRINT_STANDARDS.maximumInkCoverage,
  };
}

export function checkBleedCompliance(analysis: PrintProductionAnalysis): Issue[] {
  const issues: Issue[] = [];

  if (!analysis.layout.hasBleed) {
    issues.push({
      id: 'bleed-missing',
      category: 'layout',
      severity: 'critical',
      title: 'Missing Bleed Area',
      description: "Document does not have proper bleed area. 3mm (0.125 inch) bleed is required for print production.",
      recommendation: "Add at least 3mm (0.125 inch) bleed around all edges of the document.",
      autoFixable: false,
    });
  } else if (analysis.layout.bleedSize < PRINT_STANDARDS.recommendedBleed * 72) {
    issues.push({
      id: 'bleed-insufficient',
      category: 'layout',
      severity: 'warning',
      title: 'Insufficient Bleed Area',
      description: `Current bleed is ${(analysis.layout.bleedSize / 72).toFixed(3)} inch. Recommended minimum is ${PRINT_STANDARDS.recommendedBleed} inch.`,
      recommendation: "Consider increasing bleed to 6mm (0.25 inch) for better press compatibility.",
      autoFixable: true,
    });
  }

  return issues;
}

export function checkColorCompliance(analysis: PrintProductionAnalysis): Issue[] {
  const issues: Issue[] = [];

  // Check ink coverage
  if (analysis.color.inkCoverage > PRINT_STANDARDS.maximumInkCoverage) {
    issues.push({
      id: 'ink-overload',
      category: 'color',
      severity: 'critical',
      title: 'Excessive Ink Coverage',
      description: `Ink coverage is ${analysis.color.inkCoverage.toFixed(0)}%. Maximum recommended is ${PRINT_STANDARDS.maximumInkCoverage}%.`,
      recommendation: 'Reduce ink coverage to prevent drying issues and ink migration. Target 240-300% for best results.',
      autoFixable: false,
    });
  } else if (analysis.color.inkCoverage > PRINT_STANDARDS.recommendedInkCoverage) {
    issues.push({
      id: 'ink-high',
      category: 'color',
      severity: 'warning',
      title: 'High Ink Coverage',
      description: `Ink coverage is ${analysis.color.inkCoverage.toFixed(0)}%. Recommended maximum is ${PRINT_STANDARDS.recommendedInkCoverage}%.`,
      recommendation: 'Monitor ink coverage to prevent potential drying or胶印 issues.',
      autoFixable: true,
    });
  }

  // Check rich black
  if (analysis.color.richBlackDetected) {
    issues.push({
      id: 'rich-black',
      category: 'color',
      severity: 'info',
      title: 'Rich Black Detected',
      description: 'Document contains rich black (C:60 M:40 Y:40 K:100). This may cause drying issues.',
      recommendation: 'Consider using pure black (C:0 M:0 Y:0 K:100) for text and small black areas.',
      autoFixable: true,
    });
  }

  // Check color space risk
  if (analysis.color.cmykConversionRisk === 'high') {
    issues.push({
      id: 'color-space-risk',
      category: 'color',
      severity: 'warning',
      title: 'RGB to CMYK Conversion Risk',
      description: 'Document contains RGB elements that may shift colors when converted to CMYK for print.',
      recommendation: 'Convert all colors to CMYK and verify color appearance before printing.',
      autoFixable: false,
    });
  }

  return issues;
}

export function checkLayoutCompliance(analysis: PrintProductionAnalysis): Issue[] {
  const issues: Issue[] = [];

  // Check safe zone compliance
  if (!analysis.layout.safeZoneCompliant) {
    issues.push({
      id: 'safe-zone-violation',
      category: 'layout',
      severity: 'warning',
      title: 'Safe Zone Violation',
      description: 'Some content extends beyond the safe zone and may be trimmed during finishing.',
      recommendation: 'Ensure all important content stays within the safe zone area.',
      autoFixable: false,
    });
  }

  // Check margins
  const minMargin = Math.min(
    analysis.layout.margins.top,
    analysis.layout.margins.right,
    analysis.layout.margins.bottom,
    analysis.layout.margins.left
  );

  if (minMargin < 9) { // ~0.125" minimum margin
    issues.push({
      id: 'margins-tight',
      category: 'layout',
      severity: 'info',
      title: 'Tight Margins',
      description: "Some margins are very tight. Verify content won't be cut during trimming.",
      recommendation: "Maintain at least 3mm (0.125 inch) margin from trim edge.",
      autoFixable: false,
    });
  }

  return issues;
}

export function checkTransparencyCompliance(analysis: PrintProductionAnalysis): Issue[] {
  const issues: Issue[] = [];

  if (analysis.transparencyLayers > 0) {
    issues.push({
      id: 'transparency-layers',
      category: 'layout',
      severity: 'info',
      title: 'Transparency Layers Present',
      description: `Document contains ${analysis.transparencyLayers} transparency layers.`,
      recommendation: 'Verify transparency renders correctly on the target press. Flatten if needed.',
      autoFixable: true,
    });
  }

  return issues;
}

export function checkOverprintCompliance(analysis: PrintProductionAnalysis): Issue[] {
  const issues: Issue[] = [];

  if (analysis.overprintSettings.length > 0) {
    issues.push({
      id: 'overprint-settings',
      category: 'layout',
      severity: 'warning',
      title: 'Overprint Settings Active',
      description: `${analysis.overprintSettings.length} elements have overprint settings enabled.`,
      recommendation: 'Verify overprint preview to ensure correct color rendering.',
      autoFixable: false,
    });
  }

  return issues;
}

export function performFullComplianceCheck(
  analysis: PrintProductionAnalysis
): { pass: boolean; issues: Issue[]; score: number } {
  const allIssues: Issue[] = [
    ...checkBleedCompliance(analysis),
    ...checkColorCompliance(analysis),
    ...checkLayoutCompliance(analysis),
    ...checkTransparencyCompliance(analysis),
    ...checkOverprintCompliance(analysis),
  ];

  // Calculate compliance score
  let score = 100;

  allIssues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        score -= 3;
        break;
    }
  });

  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const pass = criticalCount === 0 && score >= 60;

  return { pass, issues: allIssues, score: Math.max(0, score) };
}

export function generatePrintProductionReport(analysis: PrintProductionAnalysis): string {
  let report = '# Print Production Analysis Report\n\n';

  report += `## Layout Analysis\n`;
  report += `- Bleed Size: ${(analysis.layout.bleedSize / 72).toFixed(3)}"\n`;
  report += `- Trim Size: ${(analysis.layout.trimSize.width / 72).toFixed(2)}" x ${(analysis.layout.trimSize.height / 72).toFixed(2)}"\n`;
  report += `- Safe Zone: ${(analysis.layout.safeZone.width / 72).toFixed(2)}" x ${(analysis.layout.safeZone.height / 72).toFixed(2)}"\n`;
  report += `- Bleed Present: ${analysis.layout.hasBleed ? 'Yes' : 'No'}\n`;
  report += `- Safe Zone Compliant: ${analysis.layout.safeZoneCompliant ? 'Yes' : 'No'}\n\n`;

  report += `## Color Analysis\n`;
  report += `- Color Space: ${analysis.color.colorSpace}\n`;
  report += `- CMYK Conversion Risk: ${analysis.color.cmykConversionRisk}\n`;
  report += `- Ink Coverage: ${analysis.color.inkCoverage.toFixed(0)}%\n`;
  report += `- Rich Black: ${analysis.color.richBlackDetected ? 'Detected' : 'None'}\n`;
  report += `- Profile: ${analysis.color.profileInfo}\n`;
  report += `- Spot Colors: ${analysis.color.spotColors.length > 0 ? analysis.color.spotColors.join(', ') : 'None'}\n\n`;

  report += `## Structure\n`;
  report += `- Transparency Layers: ${analysis.transparencyLayers}\n`;
  report += `- Layer Count: ${analysis.layerCount}\n`;
  report += `- Overprint Settings: ${analysis.overprintSettings.length}\n\n`;

  return report;
}

export function getComplianceSummary(
  analysis: PrintProductionAnalysis
): {
  status: 'pass' | 'fail' | 'conditional';
  summary: string;
  criticalIssues: number;
  warnings: number;
} {
  const { pass, issues, score } = performFullComplianceCheck(analysis);

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;

  let status: 'pass' | 'fail' | 'conditional';
  let summary: string;

  if (criticalIssues > 0) {
    status = 'fail';
    summary = `Document has ${criticalIssues} critical issue(s) that must be resolved before printing.`;
  } else if (warnings > 0) {
    status = 'conditional';
    summary = `Document passed with ${warnings} warning(s). Review recommended before printing.`;
  } else {
    status = 'pass';
    summary = `Document is print-ready with a compliance score of ${score}/100.`;
  }

  return { status, summary, criticalIssues, warnings };
}