import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

export const auth0Domain = 'dev-gk5bz75smosenq24.us.auth0.com';
export const clientId = '5Rhl8bRWw4JKHtexpJUiR7Dqseu4me3G';

export const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'com.smart.marketin',
  path: 'auth0',
  native: 'com.smart.marketin://auth0',
});

export const getRedirectUri = () => {
  if (__DEV__) {
    return AuthSession.makeRedirectUri({
      scheme: 'com.smart.marketin',
      path: 'auth0',
    });
  }
  return 'com.smart.marketin://auth0';
};

WebBrowser.maybeCompleteAuthSession();

export const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
};