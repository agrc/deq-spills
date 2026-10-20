import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataProvider } from '../contexts/DataProvider';
import useWaterbody from './useWaterbody';

describe('useWaterbody: Basic functionality', () => {
  it('should print to console when UTM coordinates change', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderHook(() => useWaterbody(), { wrapper: DataProvider });
    expect(logSpy).toHaveBeenCalledWith('Waterbody: change detected in UTM');
    logSpy.mockRestore();
  });
});
