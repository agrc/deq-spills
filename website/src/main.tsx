import esriConfig from '@arcgis/core/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import initializeTheme from '@ugrc/esri-theme-toggle';
import { FirebaseAnalyticsProvider, FirebaseAppProvider, FirebaseFunctionsProvider } from '@ugrc/utah-design-system';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DataProvider } from './contexts/DataProvider';
import './index.css';

esriConfig.assetsPath = '/assets';
initializeTheme();

let firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

if (import.meta.env.VITE_FIREBASE_CONFIG) {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseAppProvider config={firebaseConfig}>
      <FirebaseAnalyticsProvider>
        <FirebaseFunctionsProvider>
          <QueryClientProvider client={queryClient}>
            <DataProvider>
              <App />
            </DataProvider>
          </QueryClientProvider>
        </FirebaseFunctionsProvider>
      </FirebaseAnalyticsProvider>
    </FirebaseAppProvider>
  </React.StrictMode>,
);
