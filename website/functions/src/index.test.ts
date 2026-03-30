/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowpathInput } from '../common/shared.js';
import type { FlowpathJwtConfig } from './verifyFlowpathJwt.js';

vi.mock('@arcgis/core/geometry/operators/projectOperator.js', () => ({
  default: {
    execute: vi.fn(),
    isLoaded: vi.fn(() => true),
    load: vi.fn(),
  },
}));

vi.mock('@arcgis/core/geometry/Polyline.js', () => ({
  default: class Polyline {
    constructor(public value?: unknown) {}
    toJSON() {
      return this.value;
    }
  },
}));

vi.mock('@arcgis/core/geometry/SpatialReference.js', () => ({
  default: class SpatialReference {
    constructor(public value?: unknown) {}
  },
}));

vi.mock('firebase-functions', () => ({
  setGlobalOptions: vi.fn(),
}));

vi.mock('firebase-functions/params', () => ({
  defineSecret: vi.fn((name: string) => ({
    value: () => process.env[name] ?? (name === 'AGOL_API_KEY' ? 'test-api-key' : ''),
  })),
  defineString: vi.fn((name: string, options?: { default?: string }) => ({
    value: () => process.env[name] ?? options?.default ?? name,
  })),
}));

vi.mock('firebase-functions/v2', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  setGlobalOptions: vi.fn(),
}));

vi.mock('firebase-functions/v2/https', () => {
  class MockHttpsError extends Error {
    code: string;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'HttpsError';
    }
  }

  return {
    HttpsError: MockHttpsError,
    onCall: vi.fn((_options, handler) => handler),
  };
});

describe('handleGetFlowPath', () => {
  const originalFunctionsEmulator = process.env.FUNCTIONS_EMULATOR;
  const config: FlowpathJwtConfig = {
    audience: 'https://spillsmap.dev.utah.gov',
    expectedKid: 'FirebaseMapCert',
    issuer: '00D5g000001XoYyEAK',
    jwksUrl: 'https://utahdeqorg--eid.sandbox.my.salesforce.com/id/keys',
  };
  const requestData: FlowpathInput = {
    id: '500xx0000012345AAA',
    length: 1,
    token: 'jwt-token',
    utmX: 500000,
    utmY: 4500000,
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.FLOWPATH_JWT_DEV_BYPASS_TOKEN;
    process.env.FUNCTIONS_EMULATOR = originalFunctionsEmulator;
  });

  afterAll(() => {
    process.env.FUNCTIONS_EMULATOR = originalFunctionsEmulator;
  });

  it('should reject a missing token before calling downstream helpers', async () => {
    const { handleGetFlowPath } = await import('./index.js');
    const dependencies = {
      getFeature: vi.fn(),
      tracePath: vi.fn(),
      verifyFlowpathJwt: vi.fn(),
      writeToFeatureService: vi.fn(),
    };

    await expect(handleGetFlowPath({ ...requestData, token: '' }, dependencies as any, config)).rejects.toMatchObject({
      code: 'unauthenticated',
      message: 'A Salesforce JWT token is required.',
    });

    expect(dependencies.verifyFlowpathJwt).not.toHaveBeenCalled();
    expect(dependencies.getFeature).not.toHaveBeenCalled();
    expect(dependencies.tracePath).not.toHaveBeenCalled();
    expect(dependencies.writeToFeatureService).not.toHaveBeenCalled();
  });

  it('should reject an invalid token before calling downstream helpers', async () => {
    const { handleGetFlowPath } = await import('./index.js');
    const dependencies = {
      getFeature: vi.fn(),
      tracePath: vi.fn(),
      verifyFlowpathJwt: vi.fn().mockRejectedValue(new Error('JWT verification failed: unexpected "iss" claim value')),
      writeToFeatureService: vi.fn(),
    };

    await expect(handleGetFlowPath(requestData, dependencies as any, config)).rejects.toMatchObject({
      code: 'permission-denied',
      message: 'JWT verification failed: unexpected "iss" claim value',
    });

    expect(dependencies.verifyFlowpathJwt).toHaveBeenCalledWith(requestData.token, requestData.id, config);
    expect(dependencies.getFeature).not.toHaveBeenCalled();
    expect(dependencies.tracePath).not.toHaveBeenCalled();
    expect(dependencies.writeToFeatureService).not.toHaveBeenCalled();
  });

  it('should allow the configured dev bypass token in the functions emulator', async () => {
    process.env.FUNCTIONS_EMULATOR = 'true';
    process.env.FLOWPATH_JWT_DEV_BYPASS_TOKEN = 'local-test-token';

    const { handleGetFlowPath } = await import('./index.js');
    const existingFeature = {
      attributes: {
        LENGTH: requestData.length,
        OBJECTID: 1,
        UTM_X: requestData.utmX,
        UTM_Y: requestData.utmY,
      },
      geometry: {
        paths: [],
      },
    };
    const dependencies = {
      getFeature: vi.fn().mockResolvedValue(existingFeature),
      tracePath: vi.fn(),
      verifyFlowpathJwt: vi.fn(),
      writeToFeatureService: vi.fn(),
    };

    const result = await handleGetFlowPath({ ...requestData, token: 'local-test-token' }, dependencies as any, config);

    expect(dependencies.verifyFlowpathJwt).not.toHaveBeenCalled();
    expect(dependencies.getFeature).toHaveBeenCalled();
    expect(result).toEqual({
      paths: [],
      spatialReference: { wkid: 3857 },
    });
  });
});
