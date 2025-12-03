import { Product } from "../services/productService";
import { SearchResults } from "../components/ui/SearchItens";
import { CartItem } from "../contexts/CartContext";
import { AddressResponseDTO } from "../dtos/addressDTO";

export type HomeStackParamList = {
  HomeMain: undefined;
  SearchMain: { initialResults?: SearchResults } | undefined;
  ProductDetail: { product: Product & { marketName?: string } };
  Cart: undefined;
  Checkout: { marketId?: string; items?: CartItem[] } | undefined;
  MarketDetails: { marketId: string };
  MarketCategoryProducts: {
    marketId: string;
    categoryId?: string;
    categoryName: string;
    marketName: string;
    marketLogo?: string;
  };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { 
    onAddressAdded?: (address: AddressResponseDTO) => void;
    initialData?: {
      name?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  } | undefined;
  EditAddress: { addressId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
};

export type SearchStackParamList = {
  SearchMain: { initialResults?: SearchResults } | undefined;
  ProductDetail: { product: Product & { marketName?: string } };
  Cart: undefined;
  Checkout: { marketId?: string; items?: CartItem[] } | undefined;
  MarketDetails: { marketId: string };
  MarketCategoryProducts: {
    marketId: string;
    categoryId?: string;
    categoryName: string;
    marketName: string;
    marketLogo?: string;
  };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { 
    onAddressAdded?: (address: AddressResponseDTO) => void;
    initialData?: {
      name?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  } | undefined;
  EditAddress: { addressId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProductDetail: { product: Product & { marketName?: string } };
  Cart: undefined;
  Checkout: { marketId?: string; items?: CartItem[] } | undefined;
  PaymentCard: { marketId?: string; items?: CartItem[]; addressId?: string; total?: number };
  PaymentPix: { marketId?: string; items?: CartItem[]; addressId?: string; total?: number };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { 
    onAddressAdded?: (address: AddressResponseDTO) => void;
    initialData?: {
      name?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  } | undefined;
  EditAddress: { addressId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  History: undefined;
  Notifications: undefined;
  SuggestionDetail: { suggestionId: string };
  MarketProducts: { suggestionId: string; marketId: string; products?: Product[] };
  MarketCategoryProducts: {
    marketId: string;
    categoryId?: string;
    categoryName: string;
    marketName: string;
    marketLogo?: string;
  };
};

export type AuthStackParamList = {};

export type AIStackParamList = {
  AIMain: undefined;
  ProductDetail: { product: Product & { marketName?: string } };
  Cart: undefined;
  Checkout: { marketId?: string; items?: CartItem[] } | undefined;
  MarketDetails: { marketId: string };
  MarketCategoryProducts: {
    marketId: string;
    categoryId?: string;
    categoryName: string;
    marketName: string;
    marketLogo?: string;
  };
  EditProfile: undefined;
  AddressesMain: undefined;
  AddAddress: { 
    onAddressAdded?: (address: AddressResponseDTO) => void;
    initialData?: {
      name?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  } | undefined;
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
  | AIStackParamList
  | AuthStackParamList;

