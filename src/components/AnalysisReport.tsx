import React from 'react';
import {
  FileText, Type, Image, Layers, Palette, CheckCircle, AlertTriangle,
  AlertCircle, Download, ChevronRight, Brain, TrendingUp, Sparkles
} from 'lucide-react';
import { AnalysisReport as AnalysisReportType, LearningData } from '../types';
import IssueList from './IssueList';

interface AnalysisReportProps {
  report: AnalysisReportType;
  learningData: LearningData;
}

export default function AnalysisReport({ report, learningData }: AnalysisReportProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success-green';
    if (score >= 60) return 'text-warning-amber';
    return 'text-error-red';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return 'from-success-green/20 to-success-green/5';
    if (score >= 60) return 'from-warning-amber/20 to-warning-amber/5';
    return 'from-error-red/20 to-error-red/5';
  };

  const getComplianceIcon = () => {
    switch (report.complianceStatus) {
      case 'pass':
        return <CheckCircle className="w-8 h-8 text-success-green" />;
      case 'conditional':
        return <AlertTriangle className="w-8 h-8 text-warning-amber" />;
      case 'fail':
        return <AlertCircle className="w-8 h-8 text-error-red" />;
    }
  };

  const getComplianceText = () => {
    switch (report.complianceStatus) {
      case 'pass':
        return { text: 'Print Ready', color: 'text-success-green' };
      case 'conditional':
        return { text: 'Conditional Pass', color: 'text-warning-amber' };
      case 'fail':
        return { text: 'Not Ready', color: 'text-error-red' };
    }
  };

  const ScoreRing = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 42;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getStrokeColor = () => {
      if (score >= 80) return '#22c55e';
      if (score >= 60) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="score-ring">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="#1a2332"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-slate/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-accent" />
              Analysis Report
            </h2>
            <p className="text-sm text-text-secondary mt-1">{report.fileInfo.name}</p>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Score Section */}
      <div className="p-4 border-b border-border-slate/50 bg-gradient-to-r from-navy-charcoal to-slate-panel/50">
        <div className="flex items-center gap-6">
          <ScoreRing score={report.overallScore} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getComplianceIcon()}
              <span className={`text-xl font-bold ${getComplianceText().color}`}>
                {getComplianceText().text}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {report.issues.length} issue{report.issues.length !== 1 ? 's' : ''} detected
              {report.complianceStatus === 'pass' ? ' - Ready for production' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* AI Learning Status */}
      <div className="p-4 border-b border-border-slate/50">
        <div className="flex items-center gap-4 p-3 bg-purple-accent/10 rounded-lg border border-purple-accent/20">
          <Brain className="w-6 h-6 text-purple-accent" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-accent">AI Learning Active</span>
              <span className="text-sm text-text-secondary">
                {learningData.accuracyScore.toFixed(1)}% accuracy
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-navy-charcoal rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-accent to-teal-accent rounded-full transition-all duration-500"
                  style={{ width: `${learningData.accuracyScore}%` }}
                />
              </div>
              <Sparkles className="w-4 h-4 text-purple-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border-slate/50 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'fonts', label: 'Fonts', icon: Type },
          { id: 'images', label: 'Images', icon: Image },
          { id: 'layout', label: 'Layout', icon: Layers },
          { id: 'color', label: 'Color', icon: Palette },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap
                       ${id === 'overview'
                         ? 'bg-teal-accent/20 text-teal-accent'
                         : 'text-text-secondary hover:bg-slate-panel hover:text-text-primary'
                       }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* Font Analysis */}
        {report.fontAnalysis && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-accent" />
              Font Analysis
            </h3>
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-accent">{report.fontAnalysis.fonts.length}</p>
                  <p className="text-xs text-text-secondary">Fonts Used</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning-amber">{report.fontAnalysis.missingFonts.length}</p>
                  <p className="text-xs text-text-secondary">Missing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-green">{report.fontAnalysis.typographyScore}</p>
                  <p className="text-xs text-text-secondary">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-accent capitalize">
                    {report.fontAnalysis.embeddedStatus}
                  </p>
                  <p className="text-xs text-text-secondary">Embedded</p>
                </div>
              </div>

              {report.fontAnalysis.fonts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-text-secondary mb-2">Font Inventory</h4>
                  <div className="space-y-2">
                    {report.fontAnalysis.fonts.slice(0, 5).map((font, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-navy-charcoal rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{font.family}</p>
                          <p className="text-xs text-text-secondary">{font.source}</p>
                        </div>
                        <span className={`badge ${font.embedded ? 'badge-success' : 'badge-warning'}`}>
                          {font.embedded ? 'Embedded' : 'Not Embedded'}
                        </span>
                      </div>
                    ))}
                    {report.fontAnalysis.fonts.length > 5 && (
                      <p className="text-xs text-text-secondary text-center">
                        +{report.fontAnalysis.fonts.length - 5} more fonts
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Analysis */}
        {report.imageAnalysis && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-teal-accent" />
              Image Quality
            </h3>
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-accent">
                    {report.imageAnalysis.metrics.dpi}
                  </p>
                  <p className="text-xs text-text-secondary">DPI</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-accent">
                    {report.imageAnalysis.metrics.width}×{report.imageAnalysis.metrics.height}
                  </p>
                  <p className="text-xs text-text-secondary">Resolution</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-green">
                    {report.imageAnalysis.sharpnessScore}
                  </p>
                  <p className="text-xs text-text-secondary">Sharpness</p>
                </div>
                <div className="text-center">
                  <span className={`badge ${
                    report.imageAnalysis.resolutionStatus === 'excellent' || report.imageAnalysis.resolutionStatus === 'good'
                      ? 'badge-success'
                      : report.imageAnalysis.resolutionStatus === 'acceptable'
                        ? 'badge-warning'
                        : 'badge-error'
                  }`}>
                    {report.imageAnalysis.resolutionStatus}
                  </span>
                  <p className="text-xs text-text-secondary mt-1">Status</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-charcoal rounded-lg">
                <span className="text-sm text-text-secondary">Print Size</span>
                <span className="text-sm font-medium">
                  {report.imageAnalysis.printSize.width} × {report.imageAnalysis.printSize.height}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Print Production Analysis */}
        {report.printProductionAnalysis && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-warning-amber" />
              Print Production
            </h3>
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-navy-charcoal rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Bleed</p>
                  <p className="text-lg font-bold text-success-green">
                    {report.printProductionAnalysis.layout.hasBleed ? 'Present' : 'Missing'}
                  </p>
                </div>
                <div className="p-3 bg-navy-charcoal rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Safe Zone</p>
                  <p className="text-lg font-bold text-success-green">
                    {report.printProductionAnalysis.layout.safeZoneCompliant ? 'Compliant' : 'Warning'}
                  </p>
                </div>
                <div className="p-3 bg-navy-charcoal rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Ink Coverage</p>
                  <p className="text-lg font-bold text-warning-amber">
                    {report.printProductionAnalysis.color.inkCoverage.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-navy-charcoal rounded-lg">
                <span className="text-sm text-text-secondary">Color Space</span>
                <span className="badge badge-info">
                  {report.printProductionAnalysis.color.colorSpace}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Issues List */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error-red" />
            Issues ({report.issues.length})
          </h3>
          <IssueList issues={report.issues} />
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-accent" />
            AI Recommendations
          </h3>
          <div className="glass-card p-4 space-y-3">
            {report.issues.slice(0, 3).map((issue) => (
              <div
                key={issue.id}
                className="p-3 bg-navy-charcoal rounded-lg flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-purple-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-purple-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">{issue.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{issue.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-slate/50 bg-navy-charcoal/50">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Analyzed: {report.timestamp.toLocaleString()}</span>
          <span>Learning data: {learningData.correctionsApplied} corrections applied</span>
        </div>
      </div>
    </div>
  );
}