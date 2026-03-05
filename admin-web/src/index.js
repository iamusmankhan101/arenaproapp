import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import App from './App';
import adminTheme from './theme/theme';
import './index.css';

import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={adminTheme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Critical Error</h1><pre>' + e.toString() + '</pre></div>';
  console.error("Critical render error:", e);
}