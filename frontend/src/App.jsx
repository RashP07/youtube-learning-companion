import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import VideoDetailsPage from './pages/VideoDetailsPage';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/video/:videoId" element={<VideoDetailsPage />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-100 dark:border-gray-800 py-4 text-center text-sm text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900">
        YouTube Learning Companion &mdash; smart notes &amp; quizzes
      </footer>
    </div>
  );
};

export default App;
