/**
 * Type definitions for issue detection and logging
 */

export type IssueSeverity = 'error' | 'warning' | 'info';
export type IssueCategory = 'typography' | 'color' | 'resolution' | 'dimensions' | 'compliance' | 'production' | 'performance';
export type IssueStatus = 'unresolved' | 'acknowledged' | 'resolved' | 'ignored';

export interface IssueLocation {
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  description?: string;
}

export interface IssueFix {
  id: string;
  title: string;
  description: string;
  steps: string[];
  automated: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: number; // minutes
}

export interface PrintIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  details?: Record<string, unknown>;
  location?: IssueLocation;
  
  // Recommendations
  recommendations: string[];
  suggestedFixes?: IssueFix[];
  autoFixAvailable?: boolean;
  
  // Metadata
  detectedAt: Date;
  detectionMethod: string;
  confidence: number; // 0-100
  status: IssueStatus;
  
  // Reference information
  standardReference?: string;
  relatedIssues?: string[];
}

export interface IssueLog {
  analysisId: string;
  fileName: string;
  generatedAt: Date;
  
  issues: PrintIssue[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    infos: number;
    categoryCounts: Record<IssueCategory, number>;
  };
  
  // Pass/fail compliance
  complianceStatus: 'pass' | 'fail' | 'conditional';
  complianceMessage: string;
  
  // Export metadata
  exportFormats?: ('json' | 'csv' | 'pdf' | 'html')[];
  signatures?: {
    approver?: string;
    approvedAt?: Date;
  };
}

export interface IssueFeedback {
  issueId: string;
  analysisId: string;
  userCorrection?: boolean;
  userSolution?: string;
  userNotes?: string;
  accuracy?: number; // 0-100 how accurate was the detection
  feedbackType: 'correction' | 'confirmation' | 'false-positive' | 'false-negative';
  submittedAt: Date;
}

export interface IssueExport {
  format: 'json' | 'csv' | 'pdf' | 'html';
  issues: PrintIssue[];
  metadata: {
    generatedAt: Date;
    fileName: string;
    totalIssues: number;
    complianceStatus: string;
  };
}