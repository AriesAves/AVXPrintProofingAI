import React, { useState } from 'react';
import {
  Brain, TrendingUp, Target, Zap, ChevronDown, ChevronRight,
  ThumbsUp, ThumbsDown, CheckCircle, Clock, BarChart3, Sparkles
} from 'lucide-react';
import { LearningData, FeedbackEntry } from '../types';

interface AILearningPanelProps {
  learningData: LearningData;
  onSubmitFeedback?: (entry: FeedbackEntry) => void;
}

export default function AILearningPanel({ learningData, onSubmitFeedback }: AILearningPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'accuracy'>('overview');
  const [feedbackForm, setFeedbackForm] = useState({ issueId: '', correction: '', accepted: true });

  const getProgressColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-success-green';
    if (accuracy >= 70) return 'text-warning-amber';
    return 'text-error-red';
  };

  const AccuracyBar = ({ value, label }: { value: number; label: string }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className={`text-sm font-bold ${getProgressColor(value)}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-navy-charcoal rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 90 ? 'bg-success-green' : value >= 70 ? 'bg-warning-amber' : 'bg-error-red'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  const PatternCard = ({ pattern }: { pattern: { type: string; count: number; successRate: number } }) => (
    <div className="p-4 bg-navy-charcoal rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{pattern.type}</span>
        <span className="badge badge-success">{pattern.successRate.toFixed(0)}% success</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {pattern.count} occurrences
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 size={12} />
          Tracked
        </span>
      </div>
    </div>
  );

  const handleSubmitFeedback = () => {
    if (feedbackForm.issueId && feedbackForm.correction) {
      const entry: FeedbackEntry = {
        id: `fb-${Date.now()}`,
        issueId: feedbackForm.issueId,
        correction: feedbackForm.correction,
        userAccepted: feedbackForm.accepted,
        timestamp: new Date(),
      };
      onSubmitFeedback?.(entry);
      setFeedbackForm({ issueId: '', correction: '', accepted: true });
    }
  };

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-accent/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">AI Learning System</h3>
          <p className="text-xs text-text-secondary">Continuous improvement enabled</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'overview', label: 'Overview', icon: Target },
          { id: 'patterns', label: 'Patterns', icon: Zap },
          { id: 'accuracy', label: 'Accuracy', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-colors
                       ${activeTab === id
                         ? 'bg-purple-accent/20 text-purple-accent'
                         : 'bg-navy-charcoal text-text-secondary hover:text-text-primary'
                       }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-navy-charcoal rounded-lg text-center">
                <p className="text-2xl font-bold text-teal-accent">{learningData.totalAnalyses}</p>
                <p className="text-xs text-text-secondary">Total Analyses</p>
              </div>
              <div className="p-3 bg-navy-charcoal rounded-lg text-center">
                <p className="text-2xl font-bold text-success-green">{learningData.correctionsApplied}</p>
                <p className="text-xs text-text-secondary">Corrections</p>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="p-3 bg-purple-accent/10 rounded-lg border border-purple-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-accent" />
                <span className="text-sm font-medium text-purple-accent">Learning Progress</span>
              </div>
              <AccuracyBar value={learningData.accuracyScore} label="Overall Accuracy" />
              <p className="text-xs text-text-secondary">
                Last updated: {learningData.lastUpdated.toLocaleString()}
              </p>
            </div>

            {/* Patterns Learned */}
            <div>
              <h4 className="text-xs font-semibold text-text-secondary mb-2">
                Learned Patterns ({learningData.learnedPatterns.length})
              </h4>
              <div className="space-y-2">
                {learningData.learnedPatterns.slice(0, 4).map((pattern, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-navy-charcoal rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-success-green" />
                    <span className="text-sm text-text-primary">{pattern}</span>
                  </div>
                ))}
                {learningData.learnedPatterns.length > 4 && (
                  <p className="text-xs text-text-secondary text-center">
                    +{learningData.learnedPatterns.length - 4} more patterns
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-3">
            <PatternCard pattern={{ type: 'Font Substitution', count: 45, successRate: 92 }} />
            <PatternCard pattern={{ type: 'Color Space Warning', count: 52, successRate: 95 }} />
            <PatternCard pattern={{ type: 'Low Resolution', count: 38, successRate: 87 }} />
            <PatternCard pattern={{ type: 'Ink Overload', count: 29, successRate: 81 }} />

            <button className="w-full btn-secondary text-sm py-2">
              View All Patterns
            </button>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <div className="space-y-4">
            <AccuracyBar value={94.2} label="Font Analysis" />
            <AccuracyBar value={91.8} label="Image Analysis" />
            <AccuracyBar value={89.5} label="Print Analysis" />
            <AccuracyBar value={learningData.accuracyScore} label="Overall System" />

            <div className="p-3 bg-navy-charcoal rounded-lg">
              <h4 className="text-xs font-semibold text-text-secondary mb-2">Improvement Trend</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Week over week</span>
                <span className="text-sm font-bold text-success-green">+2.3%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="mt-4 pt-4 border-t border-border-slate/50">
        <h4 className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          Submit Feedback
        </h4>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Issue ID"
            value={feedbackForm.issueId}
            onChange={(e) => setFeedbackForm(prev => ({ ...prev, issueId: e.target.value }))}
            className="input-field text-sm"
          />

          <textarea
            placeholder="Correction applied..."
            value={feedbackForm.correction}
            onChange={(e) => setFeedbackForm(prev => ({ ...prev, correction: e.target.value }))}
            className="input-field text-sm min-h-[60px] resize-none"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setFeedbackForm(prev => ({ ...prev, accepted: true }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors
                         ${feedbackForm.accepted
                           ? 'bg-success-green/20 text-success-green border border-success-green/30'
                           : 'bg-navy-charcoal text-text-secondary hover:text-text-primary'
                         }`}
            >
              <ThumbsUp size={14} />
              Accept
            </button>
            <button
              onClick={() => setFeedbackForm(prev => ({ ...prev, accepted: false }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors
                         ${!feedbackForm.accepted
                           ? 'bg-error-red/20 text-error-red border border-error-red/30'
                           : 'bg-navy-charcoal text-text-secondary hover:text-text-primary'
                         }`}
            >
              <ThumbsDown size={14} />
              Reject
            </button>
          </div>

          <button onClick={handleSubmitFeedback} className="w-full btn-primary text-sm">
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}