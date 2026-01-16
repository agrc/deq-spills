# DEQ Spills - AI Coding Agent Instructions

## Project Architecture

This is a **monorepo** with three distinct projects that work together:

1. **`website/`** - Modern React/TypeScript webapp (Firebase hosted, main codebase)
2. **`salesforce/`** - Lightning Web Component that embeds the website via iframe
3. **`legacy/`** - Deprecated Dojo app (no CI, Tanks system only)

### Critical Dual-Context Pattern

The website operates in **two modes** controlled by URL parameters:

- **Standalone Mode** (`embedded=false`): Data passed via URL params, shows full UI with header/footer
- **Embedded Mode** (`embedded=true`): Data synced bidirectionally via `window.postMessage` API with Salesforce iframe, minimal UI

See [DataProvider.tsx](../website/src/contexts/DataProvider.tsx) for the core state management and [spills.js](../salesforce/force-app/main/default/lwc/spills/spills.js) for Salesforce integration.

### Key Data Flow

```
Salesforce LWC (spills.js)
  ↕ postMessage (iframeId + data)
Website (DataProvider.tsx)
  → Updates MapContainer location
  ← Sends location changes back to Salesforce
```

**Important**: The `iframeId` mechanism prevents message crosstalk when multiple instances exist. Messages include `iframeId` to ensure sender/receiver match.

## Development Workflows

### Website (`website/`)

```bash
cd website
pnpm install
pnpm start  # Runs Firebase emulators + Vite dev server concurrently
pnpm test # Vitest tests
pnpm build
```

The `pnpm start` script:

1. Builds Firebase functions in watch mode
2. Starts Firebase emulators (functions only)
3. Starts Vite dev server once functions are ready

**ArcGIS Setup**: Run `pnpm copy:arcgis` after installing deps to copy ArcGIS assets to `public/`.

### Salesforce (`salesforce/`)

Testing in salesforce is mostly manual at the point.

### Deployment

- **Website**: Pushes to `dev`/`main` auto-deploy to staging/production via GitHub Actions
- **Salesforce**: Manual deploys only via `sf project deploy`

## Project-Specific Patterns

### URL Parameters Drive Behavior

[urlParameters.ts](../website/src/utilities/urlParameters.ts) defines critical flags:

- `embedded=true` - Hides header/footer, enables postMessage sync
- `readonly=true` - Disables map location editing
- `flowpath=true` - Enables flow path calculations (see [FlowPath.tsx](../website/src/components/FlowPath.tsx))

Any property from `DataContextType['data']` can be passed as a URL param in standalone mode (e.g., `DD_LAT`, `UTM_X`, `SPILL_NUMBER`).

### Firebase Functions for Heavy Computation

Flow path tracing uses ArcGIS REST API via Firebase function [getFlowPath](../website/functions/src/index.ts) to:

1. Trace downstream path from UTM coordinates
2. Clip to desired length (miles → meters conversion)
3. Project from UTM (26912) → Web Mercator (3857)
4. Return `IPolyline` geometry

Functions require `AGOL_API_KEY` secret in Firebase.

### TypeScript Conventions

- **Shared types**: [functions/common/shared.ts](../website/functions/common/shared.ts) defines types used by both frontend and functions (e.g., `FlowpathInput`, `FLOWPATH_LENGTHS`)
- **Config centralization**: [config.ts](../website/src/config.ts) holds ArcGIS service URLs and constants
- **Hooks for state**: Custom hooks like `useDataProvider`, `useMapView` encapsulate context access

### ArcGIS/Esri Patterns

- Use `@arcgis/core` imports (ESM modules): `import EsriMap from '@arcgis/core/Map'`
- Graphics managed via `@ugrc/utilities/hooks` → `useGraphicManager`
- Map initialization in [MapContainer.tsx](../website/src/components/MapContainer.tsx) sets up MapView, Legend, LayerSelector

### CSP Configuration for Embedding

[firebase.json](../website/firebase.json) defines `frame-ancestors` in CSP headers to allow embedding in specific Salesforce orgs. **Update this when adding new Salesforce environments**.

## Testing Patterns

- **Website**: Vitest with happy-dom, tests adjacent to components (`.test.ts`)
- **Salesforce**: Jest for LWC (`pnpm test:unit`), uses `@salesforce/sfdx-lwc-jest`
- **Manual**: Use [tests/duty-officer.html](../website/tests/duty-officer.html) to simulate postMessage communication locally

## Common Gotchas

1. **Coordinate Systems**: Website primarily uses Web Mercator (3857), but UTM Zone 12N (26912) for precision. Functions handle conversions.
2. **postMessage Security**: Always verify `event.origin` matches expected iframe origin to prevent XSS.
3. **pnpm Workspaces**: This is a pnpm monorepo but projects are **not** linked as workspaces - each has independent `node_modules`.
4. **Firebase Function Builds**: Must compile TypeScript functions before emulator starts (handled by `pnpm start` concurrently setup).
5. **Salesforce Field Mapping**: Field names in [spills.js](../salesforce/force-app/main/default/lwc/spills/spills.js) use Salesforce schema imports (e.g., `Case.Latitude__c` → `DD_LAT` in website).

## Key Files Reference

- [DataProvider.tsx](../website/src/contexts/DataProvider.tsx) - Central state + postMessage orchestration
- [MapContainer.tsx](../website/src/components/MapContainer.tsx) - ArcGIS MapView setup
- [spills.js](../salesforce/force-app/main/default/lwc/spills/spills.js) - Salesforce iframe wrapper
- [config.ts](../website/src/config.ts) - Service URLs and constants
- [functions/src/index.ts](../website/functions/src/index.ts) - Flow path cloud function
