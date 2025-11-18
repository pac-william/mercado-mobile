import { Product } from "../services/productService";
import { SearchResults } from "../components/ui/SearchItens";

export type HomeStackParamList = {
  HomeMain: undefined;
  SearchMain: { initialResults?: SearchResults } | undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Checkout: undefined;
  MarketDetails: { marketId: string };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { onAddressAdded?: (address: any) => void } | undefined;
  EditAddress: { addressId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
};

export type SearchStackParamList = {
  SearchMain: { initialResults?: SearchResults } | undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Checkout: undefined;
  MarketDetails: { marketId: string };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { onAddressAdded?: (address: any) => void } | undefined;
  EditAddress: { addressId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Checkout: undefined;
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { onAddressAdded?: (address: any) => void } | undefined;
  EditAddress: { addressId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
};

export type AuthStackParamList = {};

export type AIStackParamList = {
  AIMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Checkout: undefined;
  MarketDetails: { marketId: string };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { onAddressAdded?: (address: any) => void } | undefined;
  EditAddress: { addressId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
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

export type NavigationParamList = 
  | HomeStackParamList 
  | SearchStackParamList 
  | SettingsStackParamList 
  | AuthStackParamList;

