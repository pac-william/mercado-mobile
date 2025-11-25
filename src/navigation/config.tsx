import React, { ComponentType } from 'react';
import AddEditAddressScreen from '../views/addresses/AddEditAddressScreen';
import AddressesScreen from '../views/addresses/index';
import AISearch from '../views/ai/index';
import CartScreen from '../views/cart/CartScreen';
import CheckoutScreen from '../views/checkout/CheckoutScreen';
import HistoryScreen from '../views/history/index';
import SuggestionDetailScreen from '../views/history/SuggestionDetailScreen';
import MarketProductsScreen from '../views/history/MarketProductsScreen';
import NotificationsScreen from '../views/notifications/index';
import Home from '../views/home/index';
import MarketDetailsScreen from '../views/market/index';
import MarketCategoryProductsScreen from '../views/market/CategoryProductsScreen';
import OrderDetailScreen from '../views/orders/OrderDetailScreen';
import OrdersScreen from '../views/orders/OrdersScreen';
import ProductDetail from '../views/product/ProductDetail';
import EditProfileScreen from '../views/profile/EditProfileScreen';
import Search from '../views/search/index';
import SettingsScreen from '../views/settings/SettingsScreen';

export const sharedRoutes = [
  { name: 'ProductDetail', component: ProductDetail },
  { name: 'Cart', component: CartScreen },
  { name: 'Checkout', component: CheckoutScreen },
  { name: 'EditProfile', component: EditProfileScreen },
  { name: 'AddressesMain', component: AddressesScreen },
  { name: 'AddAddress', component: AddEditAddressScreen },
  { name: 'EditAddress', component: AddEditAddressScreen },
  { name: 'History', component: HistoryScreen },
  { name: 'Notifications', component: NotificationsScreen },
  { name: 'SuggestionDetail', component: SuggestionDetailScreen },
  { name: 'MarketProducts', component: MarketProductsScreen },
  { name: 'MarketCategoryProducts', component: MarketCategoryProductsScreen },
] as const;

export const homeStackRoutes = [
  { name: 'HomeMain', component: Home },
  { name: 'SearchMain', component: Search },
  ...sharedRoutes,
  { name: 'MarketDetails', component: MarketDetailsScreen },
] as const;

export const searchStackRoutes = [
  { name: 'SearchMain', component: Search },
  ...sharedRoutes,
  { name: 'MarketDetails', component: MarketDetailsScreen },
] as const;

export const aiStackRoutes = [
  { name: 'AIMain', component: AISearch },
  ...sharedRoutes,
  { name: 'MarketDetails', component: MarketDetailsScreen },
] as const;

export const settingsStackRoutes = [
  { name: 'SettingsMain', component: SettingsScreen },
  ...sharedRoutes,
  { name: 'Orders', component: OrdersScreen },
  { name: 'OrderDetail', component: OrderDetailScreen },
] as const;

export type RouteConfig = {
  name: string;
  component: ComponentType<any>;
  options?: any;
};

export const createStackRoutes = (routes: readonly RouteConfig[]) => {
  return routes.map(route => ({
    key: route.name,
    name: route.name as string,
    component: route.component as React.ComponentType<any>,
    options: route.options || {},
  }));
};

