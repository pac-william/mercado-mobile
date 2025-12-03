// Exporta todos os tipos de navegação
export * from './types';

// Exporta os navegadores
export { HomeStackNavigator } from './stacks/HomeStack';
export { SearchStackNavigator } from './stacks/SearchStack';
export { AIStackNavigator } from './stacks/AIStack';
export { SettingsStackNavigator } from './stacks/SettingsStack';
export { TabNavigator } from './TabNavigator';
export { RootNavigator } from './RootNavigator';

// Exporta configuração de rotas (útil para adicionar novas rotas)
export * from './config';

