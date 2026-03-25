import { createRemoteJWKSet, decodeProtectedHeader, errors, jwtVerify, type JWTPayload } from 'jose';

export type FlowpathJwtConfig = {
  audience: string;
  expectedKid: string;
  issuer: string;
  jwksUrl: string;
};

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let remoteJwksUrl: string | null = null;

function getRemoteJwks(jwksUrl: string) {
  if (!remoteJwks || remoteJwksUrl !== jwksUrl) {
    remoteJwks = createRemoteJWKSet(new URL(jwksUrl));
    remoteJwksUrl = jwksUrl;
  }

  return remoteJwks;
}

export async function verifyFlowpathJwt(token: string, caseId: string, config: FlowpathJwtConfig): Promise<JWTPayload> {
  if (!token) {
    throw new Error('JWT token is required.');
  }

  let protectedHeader;
  try {
    protectedHeader = decodeProtectedHeader(token);
  } catch {
    throw new Error('JWT header is invalid.');
  }

  if (protectedHeader.alg !== 'RS256') {
    throw new Error('JWT must use RS256.');
  }

  if (protectedHeader.kid !== config.expectedKid) {
    throw new Error(`JWT kid must be ${config.expectedKid}.`);
  }

  let payload: JWTPayload;
  try {
    const result = await jwtVerify(token, getRemoteJwks(config.jwksUrl), {
      algorithms: ['RS256'],
      audience: config.audience,
      issuer: config.issuer,
    });

    payload = result.payload;
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      throw new Error('JWT has expired.');
    }

    if (error instanceof errors.JOSEError) {
      throw new Error(`JWT verification failed: ${error.message}`);
    }

    throw error;
  }

  if (payload.authorizedCaseId !== caseId) {
    throw new Error('JWT is not authorized for this case ID.');
  }

  return payload;
}
