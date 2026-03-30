import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = [];

function dispatchMessage(origin: string, data: object) {
  window.dispatchEvent(new MessageEvent('message', { data, origin }));
}

async function renderDataProvider(search = '?embedded=true') {
  vi.resetModules();
  window.history.replaceState({}, '', search);

  const { DataProvider, EMBEDDED_MESSAGE_TYPES } = await import('./DataProvider');
  const { default: useData } = await import('../hooks/useDataProvider');

  let contextValue: {
    requestFlowpathToken: () => Promise<string>;
  };

  function Bridge() {
    contextValue = useData();

    return null;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ container, root });

  await act(async () => {
    root.render(
      <DataProvider>
        <Bridge />
      </DataProvider>,
    );
  });

  return {
    context: () => contextValue,
    EMBEDDED_MESSAGE_TYPES,
  };
}

afterEach(async () => {
  while (mountedRoots.length > 0) {
    const mountedRoot = mountedRoots.pop();

    if (!mountedRoot) {
      continue;
    }

    await act(async () => {
      mountedRoot.root.unmount();
    });
    mountedRoot.container.remove();
  }

  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('DataProvider', () => {
  it('requests a flowpath token and resolves only for the captured origin', async () => {
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined);
    const { EMBEDDED_MESSAGE_TYPES, context } = await renderDataProvider();

    await act(async () => {
      dispatchMessage('https://salesforce.example', {
        data: {
          ID: '500000000000001',
          UTM_X: '420304',
          UTM_Y: '4511432',
        },
        iframeId: 'iframe-1',
        type: EMBEDDED_MESSAGE_TYPES.DATA_SYNC,
      });
    });

    postMessage.mockClear();

    let resolvedToken: string | undefined;
    const requestPromise = context()
      .requestFlowpathToken()
      .then((token) => {
        resolvedToken = token;

        return token;
      });

    expect(postMessage).toHaveBeenCalledTimes(1);
    const [requestMessage, targetOrigin] = postMessage.mock.calls[0]!;

    expect(targetOrigin).toBe('https://salesforce.example');
    expect(requestMessage).toMatchObject({
      iframeId: 'iframe-1',
      type: EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_REQUEST,
    });

    await act(async () => {
      dispatchMessage('https://wrong.example', {
        iframeId: 'iframe-1',
        requestId: requestMessage.requestId,
        token: 'wrong-token',
        type: EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_RESPONSE,
      });
    });

    expect(resolvedToken).toBeUndefined();

    await act(async () => {
      dispatchMessage('https://salesforce.example', {
        iframeId: 'iframe-1',
        requestId: requestMessage.requestId,
        token: 'jwt-token',
        type: EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_RESPONSE,
      });
    });

    await expect(requestPromise).resolves.toBe('jwt-token');
  });

  it('rejects when Salesforce returns a token error', async () => {
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined);
    const { EMBEDDED_MESSAGE_TYPES, context } = await renderDataProvider();

    await act(async () => {
      dispatchMessage('https://salesforce.example', {
        data: {
          ID: '500000000000001',
          UTM_X: '420304',
          UTM_Y: '4511432',
        },
        iframeId: 'iframe-1',
        type: EMBEDDED_MESSAGE_TYPES.DATA_SYNC,
      });
    });

    postMessage.mockClear();

    const requestPromise = context().requestFlowpathToken();
    const rejection = expect(requestPromise).rejects.toThrow('Token unavailable');
    const [requestMessage] = postMessage.mock.calls[0]!;

    await act(async () => {
      dispatchMessage('https://salesforce.example', {
        error: 'Token unavailable',
        iframeId: 'iframe-1',
        requestId: requestMessage.requestId,
        type: EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_ERROR,
      });
    });

    await rejection;
  });

  it('rejects token requests outside embedded mode', async () => {
    const { context } = await renderDataProvider('/');

    await expect(context().requestFlowpathToken()).rejects.toThrow(
      'Flow path token requests are only available in embedded mode.',
    );
  });
});
