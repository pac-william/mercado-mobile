import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export const auth0Domain = 'dev-gk5bz75smosenq24.us.auth0.com';
export const clientId = '5Rhl8bRWw4JKHtexpJUiR7Dqseu4me3G';

const dynamicRedirectUri = AuthSession.makeRedirectUri({ path: 'callback' });
const fixedRedirectUri = 'smart.marketin://auth0';

export const redirectUri = __DEV__ && Platform.OS === 'android' 
  ? dynamicRedirectUri 
  : fixedRedirectUri;

WebBrowser.maybeCompleteAuthSession();

// Discovery document for Auth0
export const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
};

