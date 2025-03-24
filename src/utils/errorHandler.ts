/**
 * Custom error handler to hide file paths in error messages
 */

// Original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
  debug: console.debug
};

// Function to sanitize error messages and stack traces
const sanitizeErrorMessage = (message: string): string => {
  if (typeof message !== 'string') return message;
  
  // Remove file paths from stack traces
  return message.replace(/\(.*?:\d+:\d+\)/g, '(hidden)')
    .replace(/at .*? \(/g, 'at (')
    .replace(/webpack:\/\/\/.+?(?=:)/g, 'app')
    .replace(/https?:\/\/[^/]+\/[^:]+(?=:)/g, 'app');
};

// Override console methods
export const setupErrorHandling = (): void => {
  // Override console methods
  console.error = function(...args) {
    const sanitizedArgs = args.map(arg => {
      if (arg instanceof Error) {
        const error = new Error(sanitizeErrorMessage(arg.message));
        error.name = arg.name;
        if (arg.stack) {
          error.stack = sanitizeErrorMessage(arg.stack);
        }
        return error;
      } else if (typeof arg === 'string') {
        return sanitizeErrorMessage(arg);
      }
      return arg;
    });
    
    originalConsole.error.apply(console, sanitizedArgs);
  };
  
  console.warn = function(...args) {
    const sanitizedArgs = args.map(arg => 
      typeof arg === 'string' ? sanitizeErrorMessage(arg) : arg
    );
    originalConsole.warn.apply(console, sanitizedArgs);
  };
  
  // Set error event listener
  window.addEventListener('error', (event) => {
    if (event.error && event.error.stack) {
      event.error.stack = sanitizeErrorMessage(event.error.stack);
    }
    if (event.message) {
      event.preventDefault();
      console.error(sanitizeErrorMessage(event.message));
    }
  }, true);
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.stack) {
      event.reason.stack = sanitizeErrorMessage(event.reason.stack);
    }
  });
  
  // Set global error handler
  window.onerror = function(message, source, lineno, colno, error) {
    if (error && error.stack) {
      error.stack = sanitizeErrorMessage(error.stack);
    }
    console.error(sanitizeErrorMessage(message as string));
    return true; // Prevents the default browser error handling
  };
};