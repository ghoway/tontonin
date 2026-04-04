'use client';

import { useState, createContext, useContext, ReactNode } from 'react';

interface ErrorContextType {
  showError: (message: string) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showError = (message: string) => {
    setError(message);
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
    setTimeout(() => setError(null), 300);
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      {isOpen && error && (
        <ErrorModal message={error} onClose={hideError} />
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

function ErrorModal({ message, onClose }: ErrorModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-sm w-full border border-zinc-800 animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Pemberitahuan
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-zinc-200 text-center leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
