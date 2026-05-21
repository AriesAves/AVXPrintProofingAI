import React, { useState, useCallback, useEffect } from 'react';
import { Play, RefreshCw, Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { AppProvider, useApp, useAnalysis } from './context/AppContext';
import FileUploader from './components/FileUploader';
import PDFViewer from './components/PDFViewer';
import ImageViewer from './components/ImageViewer';
import AnalysisReport from './components/AnalysisReport';
import AILearningPanel from './components/AILearningPanel';
import { analyzeFonts } from './analysis/fontAnalyzer';
import { analyzeImage } from './analysis/imageAnalyzer';
import { analyzePrintProduction, performFullComplianceCheck } from './analysis/printAnalyzer';
import { aiLearningSystem } from './analysis/aiLearning';
import { FileType, Issue, AnalysisReport as AnalysisReportType } from './types';

function AppContent() {
  const { state, dispatch } = useApp();
  const { isAnalyzing, progress, setReport, clearFile } = useAnalysis();
  const [analysisStep, setAnalysisStep] = useState('');

  const getFileType = (file: File): FileType => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, FileType> = {
      pdf: 'pdf', png: 'png', jpg: 'jpeg', jpeg: 'jpeg',
      tiff: 'tiff', tif: 'tiff', webp: 'webp', psd: 'psd',
    };
    return typeMap[extension!] || 'pdf';
  };

  const runAnalysis = useCallback(async () => {
    if (!state.file || !state.fileInfo) return;

    dispatch({ type: 'SET_ANALYZING', payload: true });

    const fileType = getFileType(state.file);
    const issues: Issue[] = [];

    try {
      // Step 1: Font Analysis (for PDFs)
      setAnalysisStep('Analyzing fonts...');
      dispatch({ type: 'SET_PROGRESS', payload: 10 });

      let fontAnalysis = null;
      if (fileType === 'pdf') {
        // Simulated font analysis - in production would extract from PDF
        const detectedFonts = [
          'Arial', 'Helvetica', 'Times New Roman', 'Roboto',
          'Open Sans', 'Georgia', 'Verdana', 'Montserrat'
        ];
        fontAnalysis = analyzeFonts(detectedFonts);

        // Add font-related issues
        if (fontAnalysis.missingFonts.length > 0) {
          issues.push({
            id: 'missing-fonts',
            category: 'fonts',
            severity: 'warning',
            title: 'Missing Fonts Detected',
            description: `${fontAnalysis.missingFonts.length} font(s) could not be identified.`,
            recommendation: 'Verify all fonts are embedded or available on the system.',
            autoFixable: false,
          });
        }

        if (fontAnalysis.typographyScore < 70) {
          issues.push({
            id: 'typography-issues',
            category: 'fonts',
            severity: 'info',
            title: 'Typography Inconsistencies',
            description: 'Multiple font styles detected. Consider standardizing for consistency.',
            recommendation: 'Use 2-3 font families maximum for better visual cohesion.',
            autoFixable: false,
          });
        }
      }

      dispatch({ type: 'SET_PROGRESS', payload: 30 });

      // Step 2: Image/Quality Analysis
      setAnalysisStep('Analyzing image quality...');

      let imageAnalysis = null;
      if (fileType !== 'pdf') {
        imageAnalysis = await analyzeImage(state.file);

        // Add image-related issues
        if (imageAnalysis.resolutionStatus === 'poor') {
          issues.push({
            id: 'low-resolution',
            category: 'images',
            severity: 'critical',
            title: 'Low Resolution',
            description: `Image resolution is ${imageAnalysis.metrics.dpi} DPI. Minimum for print is 300 DPI.`,
            recommendation: 'Use a higher resolution source image or accept reduced print quality.',
            autoFixable: false,
          });
        } else if (imageAnalysis.resolutionStatus === 'acceptable') {
          issues.push({
            id: 'acceptable-resolution',
            category: 'images',
            severity: 'warning',
            title: 'Borderline Resolution',
            description: `Image resolution (${imageAnalysis.metrics.dpi} DPI) is acceptable but not optimal.`,
            recommendation: 'Consider using higher resolution if available for better print quality.',
            autoFixable: false,
          });
        }

        if (imageAnalysis.compressionQuality === 'poor') {
          issues.push({
            id: 'compression-quality',
            category: 'images',
            severity: 'info',
            title: 'High Compression',
            description: 'Image compression may affect print quality.',
            recommendation: 'Save in lossless format (PNG, TIFF) for optimal print results.',
            autoFixable: true,
          });
        }
      }

      dispatch({ type: 'SET_PROGRESS', payload: 50 });

      // Step 3: Print Production Analysis
      setAnalysisStep('Analyzing print production parameters...');
      const printAnalysis = analyzePrintProduction(
        fileType,
        612, // Default page width in points
        792  // Default page height in points
      );

      // Add print-related issues
      if (!printAnalysis.layout.hasBleed) {
        issues.push({
          id: 'no-bleed',
          category: 'layout',
          severity: 'critical',
          title: 'Missing Bleed Area',
          description: "Document does not have proper bleed area for print production.",
          recommendation: "Add minimum 3mm (0.125 inch) bleed around all edges.",
          autoFixable: false,
        });
      }

      if (printAnalysis.color.inkCoverage > 300) {
        issues.push({
          id: 'ink-overload',
          category: 'color',
          severity: 'critical',
          title: 'Excessive Ink Coverage',
          description: `Ink coverage is ${printAnalysis.color.inkCoverage.toFixed(0)}%. Maximum recommended is 300%.`,
          recommendation: 'Reduce ink coverage to prevent drying and胶印 issues.',
          autoFixable: false,
        });
      }

      if (printAnalysis.color.richBlackDetected) {
        issues.push({
          id: 'rich-black',
          category: 'color',
          severity: 'info',
          title: 'Rich Black Detected',
          description: 'Document contains rich black which may cause drying issues.',
          recommendation: 'Consider using pure black (K:100) for text and small black areas.',
          autoFixable: true,
        });
      }

      if (printAnalysis.color.cmykConversionRisk === 'high') {
        issues.push({
          id: 'color-space-risk',
          category: 'color',
          severity: 'warning',
          title: 'RGB to CMYK Conversion Risk',
          description: 'Document contains RGB elements that may shift colors in print.',
          recommendation: 'Convert all colors to CMYK and verify appearance before printing.',
          autoFixable: false,
        });
      }

      dispatch({ type: 'SET_PROGRESS', payload: 70 });

      // Step 4: Compliance Check
      setAnalysisStep('Performing compliance check...');
      const { pass, score } = performFullComplianceCheck(printAnalysis);

      // Calculate overall score
      let overallScore = 100;
      issues.forEach(issue => {
        switch (issue.severity) {
          case 'critical':
            overallScore -= 15;
            break;
          case 'warning':
            overallScore -= 8;
            break;
          case 'info':
            overallScore -= 3;
            break;
        }
      });

      // Add font score influence
      if (fontAnalysis) {
        overallScore = (overallScore * 0.7) + (fontAnalysis.typographyScore * 0.3);
      }

      overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

      // Determine compliance status
      let complianceStatus: 'pass' | 'fail' | 'conditional' = 'pass';
      if (!pass) {
        complianceStatus = 'fail';
      } else if (issues.some(i => i.severity === 'warning')) {
        complianceStatus = 'conditional';
      }

      dispatch({ type: 'SET_PROGRESS', payload: 90 });

      // Create final report
      const report: AnalysisReportType = {
        fileInfo: state.fileInfo!,
        fontAnalysis,
        imageAnalysis,
        printProductionAnalysis: printAnalysis,
        issues,
        overallScore,
        complianceStatus,
        timestamp: new Date(),
        aiLearnedCorrections: state.learningData.correctionsApplied,
      };

      // Record analysis for AI learning
      aiLearningSystem.recordAnalysis();

      setReport(report);
      setAnalysisStep('');

    } catch (error) {
      console.error('Analysis failed:', error);
      dispatch({ type: 'SET_ANALYZING', payload: false });
      setAnalysisStep('');
    }
  }, [state.file, state.fileInfo, state.learningData.correctionsApplied, dispatch, setReport]);

  const handleReset = () => {
    clearFile();
    setAnalysisStep('');
  };

  const renderPreview = () => {
    if (!state.file) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" />
            <p className="text-text-secondary">No file selected</p>
            <p className="text-text-secondary/60 text-sm mt-2">
              Upload a file to preview and analyze
            </p>
          </div>
        </div>
      );
    }

    const fileType = getFileType(state.file);

    if (fileType === 'pdf') {
      return <PDFViewer file={state.file} />;
    }

    return <ImageViewer file={state.file} />;
  };

  return (
    <div className="h-screen flex flex-col bg-deep-charcoal bg-noise">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-border-slate/50 bg-navy-charcoal/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-accent to-purple-accent flex items-center justify-center">
            <span className="text-xl font-bold text-deep-charcoal">P</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">PrintProof AI</h1>
            <p className="text-xs text-text-secondary">Professional Print Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {state.file && (
            <>
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="btn-primary flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls & Report */}
        <div className="w-[40%] flex flex-col border-r border-border-slate/50">
          {/* File Uploader */}
          <div className="p-4 border-b border-border-slate/50">
            <FileUploader />
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="p-4 border-b border-border-slate/50">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-teal-accent">{analysisStep}</span>
                  <span className="text-sm text-text-secondary">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Analysis Report or AI Panel */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {state.report ? (
              <AnalysisReport report={state.report} learningData={state.learningData} />
            ) : (
              <AILearningPanel learningData={state.learningData} />
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-[60%] flex flex-col bg-navy-charcoal/30">
          {renderPreview()}
        </div>
      </div>

      {/* Status Bar */}
      <footer className="h-8 px-6 flex items-center justify-between border-t border-border-slate/50 bg-navy-charcoal/80 text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          {state.fileInfo && (
            <>
              <span>{state.fileInfo.name}</span>
              <span>{(state.fileInfo.size / 1024).toFixed(1)} KB</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success-green" />
            AI Learning Active
          </span>
          {state.report && (
            <span>Score: {state.report.overallScore}/100</span>
          )}
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;