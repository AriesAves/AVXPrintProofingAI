import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, ViewerState, LearningData } from '../types';

const initialLearningData: LearningData = {
  totalAnalyses: 0,
  correctionsApplied: 0,
  accuracyScore: 0,
  lastUpdated: new Date(),
  learnedPatterns: [],
};

const initialViewerState: ViewerState = {
  currentPage: 1,
  totalPages: 0,
  zoom: 100,
  fitMode: 'width',
  rotation: 0,
};

const initialState: AppState = {
  file: null,
  fileInfo: null,
  isAnalyzing: false,
  analysisProgress: 0,
  report: null,
  viewerState: initialViewerState,
  learningData: initialLearningData,
  showThumbnails: false,
  activeTab: 'overview',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILE':
      return {
        ...state,
        file: action.payload.file,
        fileInfo: action.payload.fileInfo,
        report: null,
        viewerState: { ...initialViewerState },
      };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_PROGRESS':
      return { ...state, analysisProgress: action.payload };
    case 'SET_REPORT':
      return {
        ...state,
        report: action.payload,
        isAnalyzing: false,
        analysisProgress: 100,
      };
    case 'SET_VIEWER_STATE':
      return {
        ...state,
        viewerState: { ...state.viewerState, ...action.payload },
      };
    case 'SET_LEARNING_DATA':
      return { ...state, learningData: action.payload };
    case 'SET_SHOW_THUMBNAILS':
      return { ...state, showThumbnails: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'CLEAR_FILE':
      return {
        ...initialState,
        learningData: state.learningData,
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useViewer() {
  const { state, dispatch } = useApp();
  return {
    viewerState: state.viewerState,
    setPage: (page: number) => dispatch({ type: 'SET_VIEWER_STATE', payload: { currentPage: page } }),
    setZoom: (zoom: number) => dispatch({ type: 'SET_VIEWER_STATE', payload: { zoom } }),
    setFitMode: (fitMode: ViewerState['fitMode']) => dispatch({ type: 'SET_VIEWER_STATE', payload: { fitMode } }),
    setRotation: (rotation: number) => dispatch({ type: 'SET_VIEWER_STATE', payload: { rotation } }),
    setTotalPages: (totalPages: number) => dispatch({ type: 'SET_VIEWER_STATE', payload: { totalPages } }),
  };
}

export function useAnalysis() {
  const { state, dispatch } = useApp();
  return {
    isAnalyzing: state.isAnalyzing,
    progress: state.analysisProgress,
    report: state.report,
    startAnalysis: () => dispatch({ type: 'SET_ANALYZING', payload: true }),
    setProgress: (progress: number) => dispatch({ type: 'SET_PROGRESS', payload: progress }),
    setReport: (report: any) => dispatch({ type: 'SET_REPORT', payload: report }),
    clearFile: () => dispatch({ type: 'CLEAR_FILE' }),
  };
}