import esriConfig from '@arcgis/core/config';
import { Footer, Header, useFirebaseApp } from '@ugrc/utah-design-system';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import MapContainer from './components/MapContainer';

const version = import.meta.env.PACKAGE_VERSION;

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
};

esriConfig.assetsPath = './assets';
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

  const onClick = (event: __esri.ViewImmediateClickEvent) => {
    console.log('click', event);
  };

  return (
    <>
      <main className="flex h-screen flex-col md:gap-2">
        <Header links={links}>
          <div className="flex h-full grow items-center gap-3">
            <img src="deq_logo.png" alt="DEQ Logo" className="h-12 w-12" />
            <h2 className="font-heading text-3xl font-black text-zinc-600 sm:text-5xl dark:text-zinc-100">
              DEQ Spills
            </h2>
          </div>
        </Header>
        <section className="relative flex min-h-0 flex-1 overflow-x-hidden md:mr-2">
          <div className="relative flex flex-1 flex-col rounded border border-b-0 border-zinc-200 dark:border-0 dark:border-zinc-700">
            <div className="relative flex-1 overflow-hidden dark:rounded">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <MapContainer onClick={onClick} />
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
