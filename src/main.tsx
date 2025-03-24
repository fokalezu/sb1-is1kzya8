import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Hide file paths in error stack traces
if (window.Error && Error.stackTraceLimit) {
  Error.stackTraceLimit = 0;
}

// Override Error.prepareStackTrace to hide file paths
const originalPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = (error, stack) => {
  if (originalPrepareStackTrace) {
    const stackString = originalPrepareStackTrace(error, stack);
    if (typeof stackString === 'string') {
      return stackString.replace(/\(.*?:\d+:\d+\)/g, '(hidden)');
    }
    return stackString;
  }
  return '';
};

// Add loading state while app initializes
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-xl text-gray-600">Se încarcă...</div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingState />}>
      <App />
    </Suspense>
  </StrictMode>
);