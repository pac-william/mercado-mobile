# Guia de Teste do Banco Offline (SQLite)

Este guia explica como testar a funcionalidade de armazenamento offline do aplicativo.

## 📋 Formas de Testar

### Método 1: Desabilitar Internet no Dispositivo/Emulador

#### **Android Emulador:**
1. Abra o **Android Emulator**
2. Vá em **Settings** (Configurações)
3. Vá em **Network & Internet** ou **Wi-Fi**
4. Desative o Wi-Fi ou ative o **Airplane Mode**

#### **iOS Simulador:**
1. No menu do simulador: **I/O** → **Network** → **Airplane Mode**
2. Ou desative a conexão de rede do seu Mac

#### **Dispositivo Físico:**
1. Desative o Wi-Fi e dados móveis
2. Ou ative o Modo Avião

### Método 2: Simular Erro na API (Recomendado para Desenvolvimento)

Você pode temporariamente modificar o `api.ts` para sempre falhar:

```typescript
// Em src/services/api.ts
api.interceptors.request.use(
  async (config) => {
    // Simular modo offline
    if (config.url?.includes('/orders')) {
      return Promise.reject(new Error('Simulando modo offline'));
    }
    // ... resto do código
  }
);
```

### Método 3: Usar Ferramentas de Debug

Use o console do React Native para verificar os logs:
- `📦 Carregados X pedidos do banco local` - quando carrega do SQLite
- `✅ X pedidos sincronizados da API` - quando sincroniza com o backend
- `⚠️ Falha ao buscar pedidos da API, usando dados locais` - quando cai no fallback offline

## 🧪 Cenários de Teste

### Teste 1: Salvar Pedidos Online
1. **Certifique-se de estar online**
2. Faça login no app
3. Acesse a tela de pedidos
4. Deve carregar pedidos do backend
5. Os pedidos devem ser salvos automaticamente no SQLite

**Verifique no console:**
```
✅ X pedidos sincronizados da API
✅ Pedido salvo localmente: [ID]
```

### Teste 2: Visualizar Pedidos Offline
1. **Certifique-se de ter pedidos salvos** (execute o Teste 1 primeiro)
2. Desative a internet (Método 1)
3. Abra a tela de pedidos
4. Deve aparecer o banner "Modo offline: exibindo pedidos salvos localmente"
5. Os pedidos salvos devem aparecer normalmente

**Verifique no console:**
```
📦 Carregados X pedidos do banco local
⚠️ Falha ao buscar pedidos da API, usando dados locais
📱 Retornando X pedidos salvos localmente
```

### Teste 3: Detalhes do Pedido Offline
1. Com internet **desativada**
2. Abra a tela de pedidos
3. Clique em um pedido
4. Deve abrir a tela de detalhes com os itens
5. As imagens dos produtos podem não carregar (normal offline)

### Teste 4: Sincronização ao Voltar Online
1. Com internet **desativada**, veja os pedidos offline
2. Reative a internet
3. Puxe para atualizar (pull-to-refresh) na tela de pedidos
4. Deve sincronizar com o backend e atualizar os dados locais

## 🔍 Verificar Dados no Banco

### Opção 1: Console Logs
O app já tem logs extensivos. Verifique o console para:
- Quantos pedidos foram salvos
- Quando são carregados do banco local
- Quando sincronizam com a API

### Opção 2: Usar Ferramenta de Debug
Execute o seguinte no console do React Native:

```javascript
// Ver pedidos salvos no banco
import { initDB, getOrders } from './src/domain/order/orderStorage';
const pedidos = await getOrders('SEU_USER_ID');
console.log('Pedidos no banco:', pedidos);
```

### Opção 3: Inspecionar Banco SQLite (Android/iOS)

#### Android (via ADB):
```bash
adb shell
run-as com.yourapp.name
cd databases
sqlite3 app.db
SELECT * FROM orders;
```

#### iOS:
Use o Xcode Database Inspector ou um app como "DB Browser for SQLite" após exportar o banco.

## ✅ Checklist de Teste

- [ ] Pedidos são salvos automaticamente após buscar do backend
- [ ] Pedidos aparecem quando está offline
- [ ] Banner offline aparece quando não há internet
- [ ] Detalhes do pedido abrem offline
- [ ] Itens do pedido são exibidos corretamente offline
- [ ] Sincronização funciona ao voltar online
- [ ] Pull-to-refresh atualiza os dados

## 🐛 Problemas Comuns

### Problema: "Nenhum pedido encontrado" quando offline
**Solução:** Certifique-se de ter pedidos salvos primeiro (acesse a tela online)

### Problema: Pedidos não aparecem
**Solução:** Verifique os logs do console. Pode ser que não haja pedidos salvos ainda.

### Problema: Banco não está sendo criado
**Solução:** Verifique se `expo-sqlite` está instalado e o banco é inicializado na primeira chamada.

## 📝 Notas

- O banco SQLite é criado automaticamente na primeira execução
- Os pedidos são salvos com todos os dados em JSON (`rawData`)
- O sistema é "offline-first": sempre tenta usar dados locais primeiro
- A sincronização acontece automaticamente quando há conexão

