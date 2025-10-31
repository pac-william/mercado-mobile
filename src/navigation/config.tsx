import React from 'react';
import { ComponentType } from 'react';

// Imports dos componentes de tela
import Home from '../views/home/index';
import Search from '../views/search/index';
import AISearch from '../views/ai/index';
import ProductDetail from '../views/product/ProductDetail';
import MarketDetailsScreen from '../views/market/index';
import CartScreen from '../views/cart/CartScreen';
import LoginScreen from '../views/auth/LoginScreen';
import RegisterScreen from '../views/auth/RegisterScreen';
import ForgotPasswordScreen from '../views/auth/ForgotPasswordScreen';
import SettingsScreen from '../views/settings/SettingsScreen';
import EditProfileScreen from '../views/profile/EditProfileScreen';
import AddressesScreen from '../views/addresses/index';
import AddEditAddressScreen from '../views/addresses/AddEditAddressScreen';
import OrdersScreen from '../views/orders/OrdersScreen';
import OrderDetailScreen from '../views/orders/OrderDetailScreen';

// Configuração das rotas compartilhadas (rotas que aparecem em múltiplos stacks)
export const sharedRoutes = [
  { name: 'ProductDetail', component: ProductDetail },
  { name: 'Cart', component: CartScreen },
  { name: 'Login', component: LoginScreen },
  { name: 'Register', component: RegisterScreen },
  { name: 'ForgotPassword', component: ForgotPasswordScreen },
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

