import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ContentProvider } from './context/ContentContext';
import { CartProvider } from './context/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ContentProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ContentProvider>
  </React.StrictMode>,
);
