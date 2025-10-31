// Tipos de navegação para todas as stacks
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  MarketDetails: { marketId: string };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string };
};

export type SearchStackParamList = {
  SearchMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  MarketDetails: { marketId: string };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AIStackParamList = {
  AIMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  MarketDetails: { marketId: string };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string };
};

export type TabParamList = {
  HomeStack: undefined;
  SearchStack: undefined;
  AIStack: undefined;
  SettingsStack: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
};

// Tipos auxiliares para navegação
export type NavigationParamList = 
  | HomeStackParamList 
  | SearchStackParamList 
  | SettingsStackParamList 
  | AuthStackParamList;

