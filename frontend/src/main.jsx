import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { SearchProvider } from './contexts/SearchContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <WishlistProvider>
              <SearchProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1A1A2E',
                      color: '#F5F5F7',
                      border: '1px solid rgba(200, 169, 126, 0.2)',
                      backdropFilter: 'blur(10px)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#F5F5F7',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#F5F5F7',
                      },
                    },
                  }}
                />
              </SearchProvider>
            </WishlistProvider>
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);