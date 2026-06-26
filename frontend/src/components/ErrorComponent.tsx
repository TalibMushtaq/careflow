import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorComponentProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({ 
  message = "An error occurred while loading data.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl max-w-md mx-auto text-center shadow-soft">
      <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full mb-4">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Data</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-medium text-sm transition shadow-sm"
        >
          <RotateCcw size={16} />
          Retry Request
        </button>
      )}
    </div>
  );
};
