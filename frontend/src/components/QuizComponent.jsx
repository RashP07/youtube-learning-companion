import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const QuizComponent = ({ quiz = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  if (!quiz.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No quiz questions available.</p>
      </div>
    );
  }

  const question = quiz[currentIndex];
  const totalQuestions = quiz.length;
  const correctCount = Object.values(answers).filter(Boolean).length;

  const handleSelect = (letter) => {
    if (selected) return; // already answered
    const isCorrect = letter === question.answer;
    setSelected(letter);
    setShowExplanation(true);
    setAnswers((prev) => ({ ...prev, [currentIndex]: isCorrect }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(answers[currentIndex + 1] !== undefined ? /* restore */ null : null);
      setShowExplanation(false);
      // If already answered, restore selection
      const nextQ = quiz[currentIndex + 1];
      if (answers[currentIndex + 1] !== undefined) {
        // find which letter was selected — we'd need to store the letter
      }
    } else {
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setAnswers({});
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((correctCount / totalQuestions) * 100);
    const grade = pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good job!' : '📚 Keep studying!';

    return (
      <div className="text-center py-10 animate-[fadeIn_0.4s_ease-out]">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📖'}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{grade}</h3>
        <p className="text-gray-600 mb-1">
          You answered{' '}
          <span className="font-bold text-brand-600">{correctCount}</span> out of{' '}
          <span className="font-bold">{totalQuestions}</span> correctly
        </p>
        <p className="text-3xl font-bold text-brand-600 mb-8">{pct}%</p>

        {/* Score bar */}
        <div className="w-48 mx-auto h-3 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>

        <button onClick={handleReset} className="btn-primary">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const getOptionClass = (letter) => {
    if (!selected) {
      return 'border-gray-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer';
    }
    if (letter === question.answer) {
      return 'border-green-400 bg-green-50 text-green-800';
    }
    if (letter === selected && letter !== question.answer) {
      return 'border-red-400 bg-red-50 text-red-800';
    }
    return 'border-gray-100 text-gray-400 cursor-default';
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-sm text-gray-500">
          {correctCount} correct so far
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-600 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="card p-5 mb-4">
        <p className="text-gray-900 font-medium text-base leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5 mb-5">
        {(question.options || []).map((opt, i) => {
          const letter = OPTION_LETTERS[i];
          return (
            <button
              key={i}
              onClick={() => handleSelect(letter)}
              disabled={!!selected}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${getOptionClass(letter)}`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                selected && letter === question.answer
                  ? 'border-green-500 bg-green-500 text-white'
                  : selected && letter === selected && letter !== question.answer
                  ? 'border-red-400 bg-red-400 text-white'
                  : 'border-current'
              }`}>
                {letter}
              </span>
              <span className="text-sm leading-relaxed">{opt}</span>
              {selected && letter === question.answer && (
                <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
              )}
              {selected && letter === selected && letter !== question.answer && (
                <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className={`p-4 rounded-xl text-sm mb-5 animate-[slideUp_0.3s_ease-out] ${
          selected === question.answer
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          <p className="font-semibold mb-1">
            {selected === question.answer ? '✅ Correct!' : `❌ The correct answer is ${question.answer}`}
          </p>
          <p>{question.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs text-gray-400">
          {Object.keys(answers).length} answered
        </span>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="btn-primary disabled:opacity-40"
        >
          {currentIndex === totalQuestions - 1 ? 'See Results' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;
