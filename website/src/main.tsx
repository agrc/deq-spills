import { FirebaseAnalyticsProvider, FirebaseAppProvider } from '@ugrc/utah-design-system';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MapProvider } from './contexts/MapProvider';
import './index.css';

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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseAppProvider config={firebaseConfig}>
      <FirebaseAnalyticsProvider>
        <MapProvider>
          <App />
        </MapProvider>
      </FirebaseAnalyticsProvider>
    </FirebaseAppProvider>
  </React.StrictMode>,
);
