/**
 * Issue Logger Service
 * Manages detection, logging, categorization, and export of print analysis issues
 */

import type { PrintIssue, IssueLog, IssueStatus, IssueSeverity, IssueCategory, IssueExport } from '../types/issues';

export class IssueLogger {
  private issues: Map<string, PrintIssue> = new Map();
  private analysisId: string;
  private fileName: string;

  constructor(analysisId: string, fileName: string) {
    this.analysisId = analysisId;
    this.fileName = fileName;
  }

  /**
   * Log a new issue
   */
  logIssue(
    severity: IssueSeverity,
    category: IssueCategory,
    title: string,
    description: string,
    options?: {
      page?: number;
      details?: Record<string, unknown>;
      recommendations?: string[];
      standardReference?: string;
    }
  ): PrintIssue {
    const issueId = `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const issue: PrintIssue = {
      id: issueId,
      severity,
      category,
      title,
      description,
      details: options?.details,
      location: options?.page ? { page: options.page } : undefined,
      recommendations: options?.recommendations || [],
      detectedAt: new Date(),
      detectionMethod: 'automated',
      confidence: 85,
      status: 'unresolved',
      standardReference: options?.standardReference,
    };

    this.issues.set(issueId, issue);
    return issue;
  }

  /**
   * Get issue by ID
   */
  getIssue(issueId: string): PrintIssue | undefined {
    return this.issues.get(issueId);
  }

  /**
   * Update issue status
   */
  updateIssueStatus(issueId: string, status: IssueStatus): void {
    const issue = this.issues.get(issueId);
    if (issue) {
      issue.status = status;
    }
  }

  /**
   * Get all issues
   */
  getAllIssues(): PrintIssue[] {
    return Array.from(this.issues.values());
  }

  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: IssueSeverity): PrintIssue[] {
    return Array.from(this.issues.values()).filter(issue => issue.severity === severity);
  }

  /**
   * Get issues by category
   */
  getIssuesByCategory(category: IssueCategory): PrintIssue[] {
    return Array.from(this.issues.values()).filter(issue => issue.category === category);
  }

  /**
   * Get issues by page
   */
  getIssuesByPage(page: number): PrintIssue[] {
    return Array.from(this.issues.values()).filter(issue => issue.location?.page === page);
  }

  /**
   * Generate issue log
   */
  generateLog(): IssueLog {
    const allIssues = this.getAllIssues();
    const categoryCounts: Record<IssueCategory, number> = {
      typography: 0,
      color: 0,
      resolution: 0,
      dimensions: 0,
      compliance: 0,
      production: 0,
      performance: 0,
    };

    allIssues.forEach(issue => {
      categoryCounts[issue.category]++;
    });

    const errors = allIssues.filter(i => i.severity === 'error').length;
    const warnings = allIssues.filter(i => i.severity === 'warning').length;
    const infos = allIssues.filter(i => i.severity === 'info').length;

    const complianceStatus = errors === 0 ? 'pass' : warnings > 0 ? 'conditional' : 'fail';

    return {
      analysisId: this.analysisId,
      fileName: this.fileName,
      generatedAt: new Date(),
      issues: allIssues,
      summary: {
        total: allIssues.length,
        errors,
        warnings,
        infos,
        categoryCounts,
      },
      complianceStatus,
      complianceMessage: this.generateComplianceMessage(complianceStatus, errors, warnings),
    };
  }

  /**
   * Generate compliance message
   */
  private generateComplianceMessage(status: string, errors: number, warnings: number): string {
    if (status === 'pass') {
      return 'Document is ready for production';
    } else if (status === 'conditional') {
      return `Document has ${warnings} warning(s) that should be reviewed before production`;
    } else {
      return `Document has ${errors} error(s) that must be resolved before production`;
    }
  }

  /**
   * Export issues as JSON
   */
  exportAsJson(): IssueExport {
    const log = this.generateLog();
    return {
      format: 'json',
      issues: log.issues,
      metadata: {
        generatedAt: log.generatedAt,
        fileName: log.fileName,
        totalIssues: log.summary.total,
        complianceStatus: log.complianceStatus,
      },
    };
  }

  /**
   * Export issues as CSV
   */
  exportAsCSV(): string {
    const allIssues = this.getAllIssues();

    const headers = ['ID', 'Severity', 'Category', 'Title', 'Description', 'Page', 'Status', 'Confidence'];
    const rows = allIssues.map(issue => [
      issue.id,
      issue.severity,
      issue.category,
      issue.title,
      issue.description,
      issue.location?.page || 'N/A',
      issue.status,
      issue.confidence,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Clear all issues
   */
  clear(): void {
    this.issues.clear();
  }

  /**
   * Get issue count
   */
  getIssueCount(): number {
    return this.issues.size;
  }
}

export const createIssueLogger = (analysisId: string, fileName: string): IssueLogger => {
  return new IssueLogger(analysisId, fileName);
};