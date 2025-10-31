import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

const domain = 'dev-gk5bz75smosenq24.us.auth0.com';
const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '';

if (!clientId) {
  console.warn('AUTH0_CLIENT_ID não configurado. Configure EXPO_PUBLIC_AUTH0_CLIENT_ID no arquivo .env');
}

WebBrowser.maybeCompleteAuthSession();

export const auth0Config = {
  domain,
  clientId,
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'smart.marketin',
    path: 'auth0',
  }),
  discovery: {
    authorizationEndpoint: `https://${domain}/authorize`,
    tokenEndpoint: `https://${domain}/oauth/token`,
    revocationEndpoint: `https://${domain}/oauth/revoke`,
  },
};

export const useProxy = false;

