import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

const Flashcard = ({ card, index, total }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full cursor-pointer select-none"
      style={{ perspective: '1000px', height: '220px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`flashcard-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="flashcard-front w-full h-full rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 p-6 flex flex-col items-center justify-center text-white shadow-lg">
          <p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-3">
            Question {index + 1} of {total}
          </p>
          <p className="text-lg font-semibold text-center leading-relaxed">
            {card.front}
          </p>
          <p className="text-xs opacity-60 mt-4">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div className="flashcard-back w-full h-full rounded-2xl bg-white dark:bg-gray-800 border-2 border-brand-200 dark:border-brand-700 p-6 flex flex-col items-center justify-center shadow-lg">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-500 dark:text-brand-400 mb-3">
            Answer
          </p>
          <p className="text-base text-gray-800 dark:text-gray-100 text-center leading-relaxed font-medium">
            {card.back}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Click to flip back</p>
        </div>
      </div>
    </div>
  );
};

const FlashcardDeck = ({ flashcards = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState(flashcards);
  const [key, setKey] = useState(0); // force remount on shuffle/navigation

  if (!flashcards.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No flashcards available.</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setKey((k) => k + 1);
  };

  const handleNext = () => {
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
    setKey((k) => k + 1);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setKey((k) => k + 1);
  };

  const handleReset = () => {
    setCards(flashcards);
    setCurrentIndex(0);
    setKey((k) => k + 1);
  };

  const card = cards[currentIndex];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {cards.length} flashcards
        </p>
        <div className="flex gap-2">
          <button onClick={handleShuffle} className="btn-secondary text-xs py-1.5">
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle
          </button>
          <button onClick={handleReset} className="btn-secondary text-xs py-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Card */}
      <Flashcard key={key} card={card} index={currentIndex} total={cards.length} />

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {cards.slice(0, Math.min(cards.length, 10)).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setKey((k) => k + 1); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-brand-600 w-4' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
          {cards.length > 10 && <span className="text-xs text-gray-400 dark:text-gray-500">...</span>}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="btn-secondary disabled:opacity-40"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        Card {currentIndex + 1} of {cards.length}
      </p>
    </div>
  );
};

export default FlashcardDeck;
