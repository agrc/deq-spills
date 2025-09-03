/* eslint-disable @typescript-eslint/no-explicit-any */
import Polyline from '@arcgis/core/geometry/Polyline.js';
import * as lengthOperator from '@arcgis/core/geometry/operators/lengthOperator.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clipPolylineToLength, tracePath } from './flowpath.js';

// Mock the ArcGIS REST API modules
vi.mock('@esri/arcgis-rest-request', () => ({
  ApiKeyManager: {
    fromKey: vi.fn(),
  },
  Job: {
    submitJob: vi.fn(),
  },
  JOB_STATUSES: {
    Success: 'success',
    Failed: 'failed',
  },
}));

describe('clipPolylineToLength', () => {
  it('should clip a polyline to the specified length', () => {
    const polyline = new Polyline({
      paths: [
        [
          [436279.4269000003, 4407753.802100001],
          [436268.5247999998, 4407631.7545],
          [436322.15330000035, 4407489.6621],
          [436381.93659999967, 4407498.9662],
          [436416.5756000001, 4407474.269300001],
          [436446.46719999984, 4407478.921399999],
          [446446.46719999984, 4408478.921399999],
        ],
      ],
      spatialReference: { wkid: 26912 },
    });

    const desiredLength = 300; // meters
    const clipped = clipPolylineToLength(polyline, desiredLength);
    expect(Math.round(lengthOperator.execute(new Polyline(clipped)))).toEqual(desiredLength);
  });

  it('it should throw an error if the desired length is greater than the polyline length', () => {
    const polyline = new Polyline({
      paths: [
        [
          [436279.4269000003, 4407753.802100001],
          [436268.5247999998, 4407631.7545],
          [436322.15330000035, 4407489.6621],
        ],
      ],
      spatialReference: { wkid: 26912 },
    }); // length = 274 meters

    expect(() => clipPolylineToLength(polyline, 300)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Desired length exceeds polyline length]`,
    );
  });
});

describe('tracePath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully trace a path and return a feature', async () => {
    const { ApiKeyManager, Job } = await import('@esri/arcgis-rest-request');
    const mockAuth = {};
    const mockJobInstance = {
      waitForCompletion: vi.fn(),
      getResult: vi.fn(),
    };
    const mockJobInfo = { status: 'success', messages: [] };
    const mockResult = {
      value: {
        features: [
          {
            geometry: {
              paths: [
                [
                  [500000, 4500000],
                  [500100, 4500100],
                ],
              ],
              spatialReference: { wkid: 26912 },
            },
            attributes: { length: 141.42 },
          },
        ],
      },
    };

    (ApiKeyManager.fromKey as any).mockReturnValue(mockAuth);
    (Job.submitJob as any).mockResolvedValue(mockJobInstance);
    mockJobInstance.waitForCompletion.mockResolvedValue(mockJobInfo);
    mockJobInstance.getResult.mockResolvedValue(mockResult);

    const utmX = 500000;
    const utmY = 4500000;
    const apiKey = 'test-api-key';

    const result = await tracePath(utmX, utmY, apiKey);

    expect(ApiKeyManager.fromKey).toHaveBeenCalledWith(apiKey);
    expect(Job.submitJob).toHaveBeenCalledWith({
      authentication: mockAuth,
      params: {
        InputPoints: {
          displayFieldName: '',
          geometryType: 'esriGeometryPoint',
          spatialReference: {
            wkid: 102100,
            latestWkid: 3857,
          },
          fields: [],
          features: [
            {
              geometry: {
                type: 'point',
                x: utmX,
                y: utmY,
                spatialReference: { wkid: 26912 },
              },
              attributes: {},
            },
          ],
        },
        DataSourceResolution: 'Finest',
        'env:outSR': 26912,
        returnZ: true,
      },
      pollingRate: 1000,
      startMonitoring: true,
      url: 'https://hydro.arcgis.com/arcgis/rest/services/Tools/Hydrology/GPServer/TraceDownstream',
    });
    expect(mockJobInstance.waitForCompletion).toHaveBeenCalled();
    expect(mockJobInstance.getResult).toHaveBeenCalledWith('OutputTraceLine');
    expect(result).toEqual(mockResult.value.features[0]);
  });

  it('should throw an error if the job fails', async () => {
    const { ApiKeyManager, Job } = await import('@esri/arcgis-rest-request');
    const mockAuth = {};
    const mockJobInstance = {
      waitForCompletion: vi.fn(),
    };
    const mockJobInfo = {
      status: 'failed',
      messages: [{ description: 'Job failed due to invalid input' }],
    };

    (ApiKeyManager.fromKey as any).mockReturnValue(mockAuth);
    (Job.submitJob as any).mockResolvedValue(mockJobInstance);
    mockJobInstance.waitForCompletion.mockResolvedValue(mockJobInfo);

    const utmX = 500000;
    const utmY = 4500000;
    const apiKey = 'test-api-key';

    await expect(tracePath(utmX, utmY, apiKey)).rejects.toThrow(
      'Flowpath job failed with status: failed, messages: [{"description":"Job failed due to invalid input"}]',
    );
  });

  it('should throw an error if no features are returned', async () => {
    const { ApiKeyManager, Job } = await import('@esri/arcgis-rest-request');
    const mockAuth = {};
    const mockJobInstance = {
      waitForCompletion: vi.fn(),
      getResult: vi.fn(),
    };
    const mockJobInfo = { status: 'success', messages: [] };
    const mockResult = {
      value: {
        features: [],
      },
    };

    (ApiKeyManager.fromKey as any).mockReturnValue(mockAuth);
    (Job.submitJob as any).mockResolvedValue(mockJobInstance);
    mockJobInstance.waitForCompletion.mockResolvedValue(mockJobInfo);
    mockJobInstance.getResult.mockResolvedValue(mockResult);

    const utmX = 500000;
    const utmY = 4500000;
    const apiKey = 'test-api-key';

    await expect(tracePath(utmX, utmY, apiKey)).rejects.toThrow('No flowpath features returned from the service.');
  });

  it('should throw an error if result value is null or undefined', async () => {
    const { ApiKeyManager, Job } = await import('@esri/arcgis-rest-request');
    const mockAuth = {};
    const mockJobInstance = {
      waitForCompletion: vi.fn(),
      getResult: vi.fn(),
    };
    const mockJobInfo = { status: 'success', messages: [] };
    const mockResult = {
      value: null,
    };

    (ApiKeyManager.fromKey as any).mockReturnValue(mockAuth);
    (Job.submitJob as any).mockResolvedValue(mockJobInstance);
    mockJobInstance.waitForCompletion.mockResolvedValue(mockJobInfo);
    mockJobInstance.getResult.mockResolvedValue(mockResult);

    const utmX = 500000;
    const utmY = 4500000;
    const apiKey = 'test-api-key';

    await expect(tracePath(utmX, utmY, apiKey)).rejects.toThrow('No flowpath features returned from the service.');
  });

  it('should handle job submission errors', async () => {
    const { ApiKeyManager, Job } = await import('@esri/arcgis-rest-request');
    const mockAuth = {};
    const error = new Error('Network error');

    (ApiKeyManager.fromKey as any).mockReturnValue(mockAuth);
    (Job.submitJob as any).mockRejectedValue(error);

    const utmX = 500000;
    const utmY = 4500000;
    const apiKey = 'test-api-key';

    await expect(tracePath(utmX, utmY, apiKey)).rejects.toThrow('Network error');
  });
});
