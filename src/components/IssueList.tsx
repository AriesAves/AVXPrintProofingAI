import React, { useState } from 'react';
import {
  AlertCircle, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronRight,
  FileText, Type, Image, Layers, Palette
} from 'lucide-react';
import { Issue, IssueSeverity } from '../types';

interface IssueListProps {
  issues: Issue[];
}

export default function IssueList({ issues }: IssueListProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleIssue = (id: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSeverityIcon = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-error-red" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-amber" />;
      case 'info':
        return <Info className="w-5 h-5 text-purple-accent" />;
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-success-green" />;
    }
  };

  const getSeverityClass = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical':
        return 'severity-critical';
      case 'warning':
        return 'severity-warning';
      case 'info':
        return 'severity-info';
      case 'pass':
        return 'severity-pass';
    }
  };

  const getCategoryIcon = (category: Issue['category']) => {
    switch (category) {
      case 'fonts':
        return <Type className="w-4 h-4" />;
      case 'images':
        return <Image className="w-4 h-4" />;
      case 'layout':
        return <Layers className="w-4 h-4" />;
      case 'color':
        return <Palette className="w-4 h-4" />;
      case 'compliance':
        return <FileText className="w-4 h-4" />;
    }
  };

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<Issue['category'], Issue[]>);

  const severityOrder: Record<IssueSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    pass: 3,
  };

  const sortedIssues = [...issues].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="w-12 h-12 text-success-green mb-4" />
        <h3 className="text-lg font-semibold text-success-green">All Checks Passed</h3>
        <p className="text-text-secondary mt-2">No issues detected in this file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 p-3 bg-navy-charcoal rounded-lg">
        {[
          { severity: 'critical' as IssueSeverity, count: issues.filter(i => i.severity === 'critical').length },
          { severity: 'warning' as IssueSeverity, count: issues.filter(i => i.severity === 'warning').length },
          { severity: 'info' as IssueSeverity, count: issues.filter(i => i.severity === 'info').length },
        ].map(({ severity, count }) => count > 0 && (
          <div key={severity} className="flex items-center gap-2">
            {getSeverityIcon(severity)}
            <span className="text-sm font-medium">{count}</span>
          </div>
        ))}
      </div>

      {/* Issue Cards */}
      <div className="space-y-2">
        {sortedIssues.map((issue) => (
          <div
            key={issue.id}
            className={`rounded-lg overflow-hidden transition-all duration-200 ${getSeverityClass(issue.severity)}`}
          >
            <button
              onClick={() => toggleIssue(issue.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
            >
              {getSeverityIcon(issue.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(issue.category)}
                  <span className="font-medium">{issue.title}</span>
                </div>
                <p className="text-sm text-text-secondary/80 mt-1 line-clamp-2">
                  {issue.description}
                </p>
              </div>
              {issue.page && (
                <span className="text-xs text-text-secondary bg-navy-charcoal/50 px-2 py-1 rounded">
                  Page {issue.page}
                </span>
              )}
              {expandedIssues.has(issue.id) ? (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            {expandedIssues.has(issue.id) && (
              <div className="px-4 pb-4 pt-0 border-t border-white/10">
                <div className="mt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-1">Recommendation</h4>
                    <p className="text-sm">{issue.recommendation}</p>
                  </div>
                  {issue.autoFixable && (
                    <div className="flex items-center gap-2 text-sm text-success-green">
                      <CheckCircle className="w-4 h-4" />
                      <span>This issue can be automatically fixed</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}