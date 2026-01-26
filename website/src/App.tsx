import { Footer, Header, useFirebaseApp } from '@ugrc/utah-design-system';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Coordinates from './components/Coordinates';
import FlowPath from './components/FlowPath';
import Geocode from './components/Geocode';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import { MapProvider } from './contexts/Map';
import { getFlowPathEnabled, getIsEmbedded, getIsReadOnly } from './utilities/urlParameters';

const version = import.meta.env.PACKAGE_VERSION;

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
};

const links = [
  {
    key: 'DEQ Public Spills Search',
    action: { url: 'https://deqspillsps.deq.utah.gov/s/' },
  },
  {
    key: `Version ${version} changelog`,
    action: { url: `https://github.com/agrc/deq-spills/releases/v${version}` },
  },
];

const isEmbedded = getIsEmbedded();
const isReadOnly = getIsReadOnly();
const flowPathEnabled = getFlowPathEnabled();

export default function App() {
  const app = useFirebaseApp();

  // initialize firebase performance metrics
  useEffect(() => {
    async function initPerformance() {
      const { getPerformance } = await import('firebase/performance');

      return getPerformance(app);
    }
    initPerformance();
  }, [app]);

  return (
    <>
      <main className="flex h-screen flex-col">
        {!isEmbedded ? (
          <Header links={links}>
            <div className="flex h-full grow items-center gap-3">
              <img src="deq_logo.png" alt="DEQ Logo" className="h-12 w-12" />
              <h2 className="font-heading text-3xl font-black text-zinc-600 sm:text-5xl dark:text-zinc-100">
                DEQ Spills
              </h2>
            </div>
          </Header>
        ) : null}
        <section className="relative flex min-h-0 flex-1 overflow-x-hidden">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="flex size-full flex-1">
              <div className="flex size-full flex-col">
                <MapProvider>
                  <MapContainer isEmbedded={isEmbedded} isReadOnly={isReadOnly} flowPathEnabled={flowPathEnabled} />
                  {!isEmbedded || isReadOnly ? null : (
                    <div className="flex flex-wrap gap-2 border-t border-t-slate-300 p-3">
                      <Coordinates />
                      <Geocode />
                      {flowPathEnabled ? <FlowPath /> : null}
                    </div>
                  )}
                </MapProvider>
              </div>
              {!isEmbedded && <Sidebar />}
            </div>
          </ErrorBoundary>
        </section>
      </main>
      {!isEmbedded ? <Footer /> : null}
    </>
  );
}
