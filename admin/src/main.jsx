import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import './index.css';
import { NotificationProvider } from './contexts/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AdminAuthProvider>
          <NotificationProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1A1A2E',
                color: '#F5F5F7',
                border: '1px solid rgba(200, 169, 126, 0.2)',
              },
            }}
          />
          </NotificationProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);