import React, { ComponentType } from 'react';

// Imports dos componentes de tela
import AddEditAddressScreen from '../views/addresses/AddEditAddressScreen';
import AddressesScreen from '../views/addresses/index';
import AISearch from '../views/ai/index';
import CartScreen from '../views/cart/CartScreen';
import CheckoutScreen from '../views/checkout/CheckoutScreen';
import Home from '../views/home/index';
import MarketDetailsScreen from '../views/market/index';
import OrderDetailScreen from '../views/orders/OrderDetailScreen';
import OrdersScreen from '../views/orders/OrdersScreen';
import ProductDetail from '../views/product/ProductDetail';
import EditProfileScreen from '../views/profile/EditProfileScreen';
import Search from '../views/search/index';
import SettingsScreen from '../views/settings/SettingsScreen';

// Configuração das rotas compartilhadas (rotas que aparecem em múltiplos stacks)
export const sharedRoutes = [
  { name: 'ProductDetail', component: ProductDetail },
  { name: 'Cart', component: CartScreen },
  { name: 'Checkout', component: CheckoutScreen },
  { name: 'EditProfile', component: EditProfileScreen },
  { name: 'AddressesMain', component: AddressesScreen },
  { name: 'AddAddress', component: AddEditAddressScreen },
  { name: 'EditAddress', component: AddEditAddressScreen },
] as const;

// Configuração das rotas do HomeStack
export const homeStackRoutes = [
  { name: 'HomeMain', component: Home },
  ...sharedRoutes,
  { name: 'MarketDetails', component: MarketDetailsScreen },
] as const;

// Configuração das rotas do SearchStack
export const searchStackRoutes = [
  { name: 'SearchMain', component: Search },
  ...sharedRoutes,
  { name: 'MarketDetails', component: MarketDetailsScreen },
] as const;

// Configuração das rotas do AIStack (tela específica para pesquisa com IA)
export const aiStackRoutes = [
  { name: 'AIMain', component: AISearch },
  ...sharedRoutes,
  { name: 'MarketDetails', component: MarketDetailsScreen },
] as const;

// Configuração das rotas do SettingsStack
export const settingsStackRoutes = [
  { name: 'SettingsMain', component: SettingsScreen },
  ...sharedRoutes,
  { name: 'Orders', component: OrdersScreen },
  { name: 'OrderDetail', component: OrderDetailScreen },
] as const;

// Tipo para uma rota
export type RouteConfig = {
  name: string;
  component: ComponentType<any>;
  options?: any;
};

// Helper para criar rotas de um stack
export const createStackRoutes = (routes: readonly RouteConfig[]) => {
  return routes.map(route => ({
    key: route.name,
    name: route.name as string,
    component: route.component as React.ComponentType<any>,
    options: route.options || {},
  }));
};

