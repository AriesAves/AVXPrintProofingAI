/**
 * File Analysis Engine
 * Master orchestrator that coordinates all analyzers for comprehensive print analysis
 */

import type { FileAnalysisResult } from '../types/analysis';
import {
  FontAnalyzer,
  ImageAnalyzer,
  ColorAnalyzer,
  DimensionAnalyzer,
  PrintSpecAnalyzer,
} from './analyzers';
import { IssueLogger } from './issueLogger';

export interface AnalysisEngineOptions {
  includeImages?: boolean;
  includeFonts?: boolean;
  includeColors?: boolean;
  includeDimensions?: boolean;
  includePrintSpecs?: boolean;
  generateIssueLog?: boolean;
}

export class FileAnalysisEngine {
  private fontAnalyzer: FontAnalyzer;
  private imageAnalyzer: ImageAnalyzer;
  private colorAnalyzer: ColorAnalyzer;
  private dimensionAnalyzer: DimensionAnalyzer;
  private printSpecAnalyzer: PrintSpecAnalyzer;
  private issueLogger?: IssueLogger;
  private options: AnalysisEngineOptions;

  constructor(options: AnalysisEngineOptions = {}) {
    this.options = {
      includeImages: true,
      includeFonts: true,
      includeColors: true,
      includeDimensions: true,
      includePrintSpecs: true,
      generateIssueLog: true,
      ...options,
    };

    this.fontAnalyzer = new FontAnalyzer();
    this.imageAnalyzer = new ImageAnalyzer();
    this.colorAnalyzer = new ColorAnalyzer();
    this.dimensionAnalyzer = new DimensionAnalyzer();
    this.printSpecAnalyzer = new PrintSpecAnalyzer();
  }

  /**
   * Analyze a file comprehensively
   */
  async analyzeFile(file: File): Promise<FileAnalysisResult> {
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.issueLogger = new IssueLogger(analysisId, file.name);

    try {
      const startTime = Date.now();

      const result: FileAnalysisResult = {
        fileId: analysisId,
        fileName: file.name,
        fileFormat: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
        analyzedAt: new Date(),
        fonts: { fontsDetected: [], missingFonts: [], fontInconsistencies: [], totalUniqueFonts: 0 },
        images: [],
        dimensions: {
          pageWidth: { value: 0, unit: 'inches' },
          pageHeight: { value: 0, unit: 'inches' },
          bleed: { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, unit: 'inches' },
          trim: { top: 0, right: 0, bottom: 0, left: 0, unit: 'inches' },
          safeZone: { top: 0.375, right: 0.375, bottom: 0.375, left: 0.375, unit: 'inches' },
        },
        colors: {
          colorSpace: 'RGB',
          rgbToCmykRisks: { identified: false, risks: [] },
          inkCoverage: { maximum: 0, average: 0, exceedsLimit: false, limitThreshold: 300 },
          richBlack: { detected: false, percentage: 0, recommendation: '' },
          colorConversionIssues: { gamutWarnings: 0, outOfGamutColors: [] },
        },
        printSpecs: {
          bleedCompliant: true,
          trimCompliant: true,
          marginsCompliant: true,
          safeZoneCompliant: true,
          overprint: { detected: false, areas: [] },
          transparency: { detected: false, count: 0, recommendation: '' },
          layers: { count: 0, hidden: 0, locked: 0, analysis: '' },
          printObjectConsistency: { compliant: true, issues: [] },
        },
        overallQuality: 0,
        readyForProduction: false,
        productionIssueCount: 0,
        complianceScore: 0,
      };

      if (this.options.includeFonts) {
        result.fonts = await this.fontAnalyzer.analyzeFonts(file);
        if (result.fonts.fontInconsistencies.length > 0) {
          this.issueLogger.logIssue('error', 'typography', 'Font Issues Detected', 'One or more fonts are missing or not embedded', {
            recommendations: ['Embed all fonts in the document'],
          });
        }
      }

      if (this.options.includeColors) {
        result.colors = await this.colorAnalyzer.analyzeColors(file);
        if (result.colors.rgbToCmykRisks.identified) {
          this.issueLogger.logIssue('warning', 'color', 'RGB to CMYK Conversion Risk', 'Document is in RGB color space', {
            recommendations: result.colors.rgbToCmykRisks.risks,
          });
        }
      }

      if (this.options.includePrintSpecs) {
        result.printSpecs = await this.printSpecAnalyzer.validatePrintSpecs(file);
        if (!result.printSpecs.bleedCompliant) {
          this.issueLogger.logIssue('warning', 'compliance', 'Bleed Non-Compliant', 'Bleed does not meet print requirements', {
            recommendations: ['Add 0.125 inch bleed to all sides'],
            standardReference: 'ISO 12647-2',
          });
        }
      }

      result.overallQuality = this.calculateOverallQuality(result);
      result.readyForProduction = this.isReadyForProduction(result);
      result.productionIssueCount = this.issueLogger.getIssueCount();
      result.complianceScore = this.calculateComplianceScore(result);

      const endTime = Date.now();
      console.log(`Analysis completed in ${endTime - startTime}ms`);

      return result;
    } catch (error) {
      console.error('File analysis failed:', error);
      throw new Error(`File analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(result: FileAnalysisResult): number {
    let score = 100;

    if (!result.printSpecs.bleedCompliant) score -= 15;
    if (!result.printSpecs.trimCompliant) score -= 10;
    if (!result.printSpecs.marginsCompliant) score -= 5;
    if (result.printSpecs.transparency.detected) score -= 10;
    if (result.colors.rgbToCmykRisks.identified) score -= 10;
    if (result.fonts.missingFonts.length > 0) score -= 15;

    return Math.max(0, score);
  }

  /**
   * Check if file is ready for production
   */
  private isReadyForProduction(result: FileAnalysisResult): boolean {
    const hasErrors = (this.issueLogger?.getIssuesBySeverity('error') || []).length > 0;
    return !hasErrors && result.overallQuality >= 80;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(result: FileAnalysisResult): number {
    let score = 100;

    if (!result.printSpecs.bleedCompliant) score -= 20;
    if (!result.printSpecs.trimCompliant) score -= 15;
    if (!result.printSpecs.marginsCompliant) score -= 10;
    if (!result.printSpecs.safeZoneCompliant) score -= 10;
    if (result.fonts.missingFonts.length > 0) score -= 25;

    return Math.max(0, score);
  }

  /**
   * Get issue logger
   */
  getIssueLogger(): IssueLogger | undefined {
    return this.issueLogger;
  }
}

export const createFileAnalysisEngine = (options?: AnalysisEngineOptions): FileAnalysisEngine => {
  return new FileAnalysisEngine(options);
};