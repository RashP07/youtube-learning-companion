import React from 'react';

const steps = [
  'Extracting transcript...',
  'Analyzing content with AI...',
  'Generating notes & quiz...',
  'Building flashcards...',
  'Almost done...',
];

const Loader = ({ message = 'Analyzing your video...' }) => {
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center px-6">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-brand-50 flex items-center justify-center">
            <span className="text-2xl">🎥</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{message}</h2>

        <p className="text-sm text-gray-500 animate-pulse min-h-[20px]">
          {steps[stepIndex]}
        </p>

        {/* Progress bar */}
        <div className="mt-6 w-64 mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full animate-[progress_18s_linear_forwards]" />
        </div>

        <p className="mt-3 text-xs text-gray-400">This may take 20-40 seconds</p>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 5%; }
          to { width: 95%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
