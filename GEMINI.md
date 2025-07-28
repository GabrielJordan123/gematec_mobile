# Projeto: Gematec Mobile App

Aplicativo desenvolvido em React Native com gerenciamento de rotas via React Navigation e armazenamento persistente usando AsyncStorage.

## 🔐 Funcionalidade: "Manter-me conectado"

### Objetivo
Permitir que o usuário permaneça logado mesmo após fechar e reabrir o app, se ele tiver marcado a caixa "Manter-me conectado".

### Fluxo atual de autenticação

1. Após login:
   - O token `sliding_token` é salvo no AsyncStorage.
   - A preferência `keep_logged_in` é salva como `"true"` ou `"false"` (string).
2. Ao abrir o app:
   - `App.tsx` verifica o valor de `keep_logged_in` e decide se deve manter ou remover o token.
   - Mas **o redirecionamento ainda envia o usuário para a tela `LoginScreen`, mesmo se estiver autenticado.**

### Problema conhecido
Mesmo com `sliding_token` salvo e `keep_logged_in: "true"`, o app **sempre inicia na tela de Login**, ignorando a persistência da sessão.

## 🧠 Estrutura relevante

- `App.tsx`: Ponto de entrada do app. Contém `useEffect` que verifica `keep_logged_in`.
- `AppRouter.tsx`: Define as rotas. Começa com `initialRouteName="LoginScreen"`.
- `LoginScreen.tsx`: Faz login e salva token + preferência no AsyncStorage.
- `UserContext.tsx`: Armazena dados do usuário como `clientId`, `username`, etc.

## ✅ Objetivo

Implementar uma lógica de verificação no início da aplicação que:

- Leia o `sliding_token` e `keep_logged_in` no `App.tsx` **ou** em um contexto de autenticação.
- Se ambos forem válidos, **pule a LoginScreen e vá direto para `HomeScreen`** (`DrawerNavigator`).
- Caso contrário, mantenha o fluxo atual de redirecionar para Login.



