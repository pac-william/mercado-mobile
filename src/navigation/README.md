# Sistema de Navegação

Este diretório contém toda a estrutura de navegação do app, organizada de forma modular e fácil de manter.

## 📁 Estrutura

```
src/navigation/
├── types.ts              # Tipos TypeScript para todas as rotas
├── config.tsx            # Configuração centralizada de rotas e componentes
├── TabNavigator.tsx      # Navegador de tabs (bottom tabs)
├── RootNavigator.tsx     # Navegador raiz com lógica de autenticação
├── stacks/
│   ├── HomeStack.tsx     # Stack do Home
│   ├── SearchStack.tsx   # Stack da Busca
│   └── SettingsStack.tsx # Stack de Configurações
└── index.ts              # Exports principais
```

## 🚀 Como adicionar uma nova rota

### Passo 1: Adicionar o tipo no `types.ts`

```typescript
export type SettingsStackParamList = {
  // ... rotas existentes
  NovaRota: undefined; // ou { param1: string; param2: number }
};
```

### Passo 2: Adicionar o componente no `config.tsx`

```typescript
import NovaTela from '../views/nova/NovaTela';

// Adicione nas rotas compartilhadas (se aparecer em múltiplos stacks)
export const sharedRoutes = [
  // ... rotas existentes
  { name: 'NovaRota', component: NovaTela },
];

// OU adicione em um stack específico
export const settingsStackRoutes = [
  { name: 'SettingsMain', component: SettingsScreen },
  ...sharedRoutes,
  { name: 'NovaRota', component: NovaTela }, // Apenas no SettingsStack
];
```

### Passo 3: Usar a navegação

```typescript
import { useNavigation } from '@react-navigation/native';
import { SettingsStackParamList } from '../../navigation';

const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();

// Navegar
navigation.navigate('NovaRota');
// Ou com parâmetros
navigation.navigate('NovaRota', { param1: 'valor' });
```

## 📝 Exemplos

### Adicionar rota compartilhada

Se a rota deve aparecer em todos os stacks:

1. Adicione em `sharedRoutes` no `config.tsx`
2. O sistema automaticamente adiciona em todos os stacks

### Adicionar rota específica

Se a rota só deve aparecer em um stack:

1. Adicione o tipo no stack específico em `types.ts`
2. Adicione a rota no array correspondente no `config.tsx` (ex: `settingsStackRoutes`)

### Rotas com parâmetros

```typescript
// types.ts
export type SettingsStackParamList = {
  DetalhesPedido: { orderId: string };
};

// config.tsx
import DetalhesPedidoScreen from '../views/orders/DetalhesPedidoScreen';
export const settingsStackRoutes = [
  // ...
  { name: 'DetalhesPedido', component: DetalhesPedidoScreen },
];

// Uso
navigation.navigate('DetalhesPedido', { orderId: '123' });
```

## 🎯 Vantagens desta estrutura

- ✅ **Organização**: Todo código de navegação em um só lugar
- ✅ **Manutenção fácil**: Adicionar novas rotas é simples
- ✅ **Type-safe**: TypeScript garante que as rotas existem
- ✅ **DRY**: Rotas compartilhadas definidas uma vez
- ✅ **Escalável**: Fácil adicionar novos stacks ou rotas

## 🔍 Onde encontrar o que você precisa

- **Tipos de navegação**: `src/navigation/types.ts`
- **Componentes de telas**: `src/navigation/config.tsx`
- **Navegação em componentes**: Use `useNavigation()` com os tipos importados

