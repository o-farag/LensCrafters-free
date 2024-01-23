import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { HomePage } from './pages/homePage';
import { LensFrameSelectionPage } from './pages/lensFrameSelectionPage';
import { VisualizeOptionsPage } from './pages/visualizeOptionsPage';
import { AppStateProvider } from './pages/AppStateContext';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@fontsource/inter';
import { initJeeliz } from './components/tryOnViewer';

if (typeof window !== 'undefined') { 
  initJeeliz();
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "select-lens-frame",
    element: <LensFrameSelectionPage />,
  },
  {
    path: "visualize-options",
    element: <VisualizeOptionsPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
const theme = createTheme({
  primaryColor: 'muteBlue',
  fontFamily: 'Inter, sans-serif',
  fontSizes: {
    xs: '0.5em',
    sm: '0.875em',
    md: '1em',
    lg: '1.5em',
    xl: '1.75em'
  },
  headings: {
    fontFamily: 'Jomolhari',
    sizes: {
      h1: { fontWeight: '300', fontSize: '1.25em' },
      h2: { fontWeight: '200', fontSize: '1.5em' }
    },
  },
  colors: {
    'muteBlue': [
      '#ecf6ff',
      '#dee8f1',
      '#bfcedc',
      '#9cb3c8',
      '#7f9db6',
      '#6c8eac',
      '#6287a8',
      '#507493',
      '#446785',
      '#335a77'
    ]
  }
});

root.render(
  <React.StrictMode>
    <AppStateProvider>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </AppStateProvider>
  </React.StrictMode>
);