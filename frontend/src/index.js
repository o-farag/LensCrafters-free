import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/homePage';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);