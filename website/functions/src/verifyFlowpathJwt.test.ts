/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowpathJwtConfig } from './verifyFlowpathJwt.js';
import { verifyFlowpathJwt } from './verifyFlowpathJwt.js';

vi.mock('jose', () => {
  class JOSEError extends Error {}
  class JWTExpired extends JOSEError {}

  return {
    createRemoteJWKSet: vi.fn(),
    decodeProtectedHeader: vi.fn(),
    errors: {
      JOSEError,
      JWTExpired,
    },
    jwtVerify: vi.fn(),
  };
});

describe('verifyFlowpathJwt', () => {
  const caseId = '500xx0000012345AAA';
  const config: FlowpathJwtConfig = {
    audience: 'https://spillsmap.dev.utah.gov',
    expectedKid: 'FirebaseMapCert',
    issuer: '00D5g000001XoYyEAK',
    jwksUrl: 'https://utahdeqorg--eid.sandbox.my.salesforce.com/id/keys',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify a valid token', async () => {
    const { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } = await import('jose');
    const jwks = Symbol('jwks');
    const payload = { authorizedCaseId: caseId, exp: 123, iat: 122, sub: '005xx0000012345AAA' };

    (createRemoteJWKSet as any).mockReturnValue(jwks);
    (decodeProtectedHeader as any).mockReturnValue({ alg: 'RS256', kid: 'FirebaseMapCert' });
    (jwtVerify as any).mockResolvedValue({ payload });

    await expect(verifyFlowpathJwt('valid-token', caseId, config)).resolves.toEqual(payload);
    expect(createRemoteJWKSet).toHaveBeenCalledWith(new URL(config.jwksUrl));
    expect(jwtVerify).toHaveBeenCalledWith('valid-token', jwks, {
      algorithms: ['RS256'],
      audience: config.audience,
      issuer: config.issuer,
    });
  });

  it('should reject a token with the wrong kid', async () => {
    const { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } = await import('jose');

    (createRemoteJWKSet as any).mockReturnValue(Symbol('jwks'));
    (decodeProtectedHeader as any).mockReturnValue({ alg: 'RS256', kid: 'OtherCert' });

    await expect(verifyFlowpathJwt('invalid-token', caseId, config)).rejects.toThrow(
      'JWT kid must be FirebaseMapCert.',
    );
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it('should reject a token with the wrong audience', async () => {
    const { createRemoteJWKSet, decodeProtectedHeader, errors, jwtVerify } = await import('jose');

    (createRemoteJWKSet as any).mockReturnValue(Symbol('jwks'));
    (decodeProtectedHeader as any).mockReturnValue({ alg: 'RS256', kid: 'FirebaseMapCert' });
    (jwtVerify as any).mockRejectedValue(new errors.JOSEError('unexpected "aud" claim value'));

    await expect(verifyFlowpathJwt('invalid-token', caseId, config)).rejects.toThrow(
      'JWT verification failed: unexpected "aud" claim value',
    );
  });

  it('should reject an expired token', async () => {
    const { createRemoteJWKSet, decodeProtectedHeader, errors, jwtVerify } = await import('jose');

    (createRemoteJWKSet as any).mockReturnValue(Symbol('jwks'));
    (decodeProtectedHeader as any).mockReturnValue({ alg: 'RS256', kid: 'FirebaseMapCert' });
    (jwtVerify as any).mockRejectedValue(
      new errors.JWTExpired('exp claim timestamp check failed', { exp: 123, iat: 122 }),
    );

    await expect(verifyFlowpathJwt('expired-token', caseId, config)).rejects.toThrow('JWT has expired.');
  });

  it('should reject a token authorized for a different case', async () => {
    const { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } = await import('jose');

    (createRemoteJWKSet as any).mockReturnValue(Symbol('jwks'));
    (decodeProtectedHeader as any).mockReturnValue({ alg: 'RS256', kid: 'FirebaseMapCert' });
    (jwtVerify as any).mockResolvedValue({
      payload: { authorizedCaseId: '500xx0000099999AAA', exp: 123, iat: 122 },
    });

    await expect(verifyFlowpathJwt('valid-token', caseId, config)).rejects.toThrow(
      'JWT is not authorized for this case ID.',
    );
  });
});
