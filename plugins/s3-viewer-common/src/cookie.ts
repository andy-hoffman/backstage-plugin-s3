import type { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

// Based on the code in https://github.com/backstage/backstage/blob/master/contrib/docs/tutorials/authenticate-api-requests.md

// Parses supplied JWT token and returns the payload
function parseJwt(token: string): { exp: number } {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
  return JSON.parse(jsonPayload);
}

// Returns milliseconds until the supplied JWT token expires
function msUntilExpiry(token: string): number {
  const payload = parseJwt(token);
  const remaining =
    new Date(payload.exp * 1000).getTime() - new Date().getTime();
  return remaining;
}

// Calls the specified url regularly using an auth token to set a token cookie
// to authorize regular HTTP requests when loading techdocs
export async function setTokenCookie(
  discoveryApi: DiscoveryApi,
  identityApi: IdentityApi,
) {
  const url = `${await discoveryApi.getBaseUrl('s3')}/cookie`;
  const { token } = await identityApi.getCredentials();
  if (!token) {
    return;
  }

  await fetch(url, {
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Call this function again a few minutes before the token expires
  const ms = msUntilExpiry(token) - 4 * 60 * 1000;
  setTimeout(
    () => {
      setTokenCookie(discoveryApi, identityApi);
    },
    ms > 0 ? ms : 10000,
  );
}
