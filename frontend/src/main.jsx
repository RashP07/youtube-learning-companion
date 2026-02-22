import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            borderRadius: '10px',
            border: '1px solid #374151',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#F9FAFB' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#F9FAFB' } },
        }}
      />
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
