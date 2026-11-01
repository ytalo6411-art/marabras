# Login com Google — configuração necessária

O **código está pronto e testado**. O que falta é configuração externa, que exige
acesso ao Google Cloud e ao painel do Supabase. Nenhuma credencial foi inventada.

Estado atual verificado no projeto `tazszwllacwqccfjnglk`:

```
external_google_enabled: false
external_google_client_id: null
external_google_secret: null
```

Enquanto isso estiver assim, o botão mostra uma mensagem clara em português e o
login por e-mail/senha continua funcionando. **Não removemos essa mensagem** —
ela só deve sair depois que o fluxo estiver configurado e testado de verdade.

---

## 1. Google Cloud Console

1. Acesse <https://console.cloud.google.com/> e crie (ou selecione) um projeto.
2. **APIs e serviços → Tela de permissão OAuth**
   - Tipo: **Externo**.
   - Nome do app: `ATHLETIX`.
   - E-mail de suporte e e-mail do desenvolvedor: os seus.
   - Escopos: apenas `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
     O código pede somente `email profile` — não solicite escopos extras.
   - Adicione os domínios autorizados: `vercel.app` e `supabase.co`
     (ou seu domínio próprio, se houver).
3. **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Nome: `ATHLETIX Web`.
   - **URIs de redirecionamento autorizados** — cole exatamente a URL de callback
     do Supabase (Project Settings → Authentication → URL de callback):

     ```
     https://tazszwllacwqccfjnglk.supabase.co/auth/v1/callback
     ```

   > Atenção: esta é a URL do **Supabase**, não a do app. O Google redireciona
   > para o Supabase, que por sua vez redireciona para o ATHLETIX.

4. Guarde o **Client ID** e o **Client Secret**.

## 2. Supabase — provedor Google

Painel do projeto → **Authentication → Providers → Google**:

1. Ative **Enable Sign in with Google**.
2. Cole o **Client ID** e o **Client Secret** do passo anterior.
3. Salve.

Ou via API de gerenciamento (substitua pelos valores reais):

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/tazszwllacwqccfjnglk/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_google_enabled": true,
    "external_google_client_id": "<CLIENT_ID>",
    "external_google_secret": "<CLIENT_SECRET>"
  }'
```

O `client_secret` fica **somente no Supabase**. Ele nunca vai para o frontend,
para o repositório ou para variáveis `VITE_*`.

## 3. Supabase — URLs de retorno

**Authentication → URL Configuration**:

- **Site URL**: `https://athletix-lilac.vercel.app`
- **Redirect URLs** (allowlist) — adicione:

  ```
  https://athletix-lilac.vercel.app/**
  http://localhost:5173/**
  ```

Se for usar previews da Vercel, adicione também o padrão de preview. O código usa
`window.location.origin` como `redirectTo`, então cada preview volta para si
mesmo — mas **o domínio precisa estar nesta allowlist**, senão o Supabase recusa.

Revise e remova os domínios legados que não são mais usados
(`marabas.vercel.app`, `projeto-maramba.vercel.app`) para reduzir a superfície.

## 4. Variáveis de ambiente

Nenhuma variável nova é necessária para o Google. As já existentes bastam:

| Variável | Onde | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel (pública) | URL do projeto |
| `VITE_SUPABASE_ANON_KEY` | Vercel (pública) | chave publishable/anon |
| `VITE_APP_URL` | Vercel (pública) | fallback de `redirectTo` em build/SSR |

Client ID e Secret do Google ficam **apenas** no Supabase Auth.

## 5. Vincular Google a uma conta existente

O projeto usa `security_manual_linking_enabled: false`. Com isso, o Supabase
vincula automaticamente quando o e-mail do Google **já está verificado** e é
igual ao da conta existente. Isso é o comportamento seguro.

- **Não ative** vinculação manual sem implementar confirmação explícita: isso
  permitiria associar identidades sem prova de posse.
- Se o provedor devolver `validation_failed` (conta já existe com outro método),
  o app mostra: *"Já existe uma conta com este e-mail. Entre com e-mail e senha
  e vincule o Google nas configurações."*

## 6. Como testar depois de configurar

1. Abra `/app/login` e clique em **Entrar com Google**.
2. Escolha a conta → o app deve voltar **autenticado** em `/app`.
3. Recarregue a página: a sessão deve persistir.
4. Clique em **Sair** e entre de novo: sem loop de redirecionamento.
5. **Cancelamento**: na tela de consentimento, clique em voltar/cancelar. O app
   deve mostrar a mensagem de cancelamento e permanecer no login.
6. **Conta existente**: entre com e-mail/senha, saia e entre com Google usando o
   mesmo e-mail verificado. Deve cair na mesma conta, sem duplicar usuário.
7. Confirme no Supabase em **Authentication → Users** que não foi criado usuário
   duplicado e que `identities` tem os dois provedores.

Só depois desses passos a mensagem de "Google indisponível" deixará de aparecer
— ela é derivada de `/auth/v1/settings`, não de uma flag manual.

## O que já está implementado no código

- `signInWithGoogle()` consulta `/auth/v1/settings` antes de redirecionar, para
  o usuário nunca cair numa página JSON crua de erro do Supabase.
- Escopos mínimos (`email profile`), `prompt=select_account`.
- `redirectTo` usa a origem atual (preview volta para preview).
- `consumeOAuthCallbackError()` lê erros na query **e** no fragmento, traduz para
  português, não expõe a descrição crua do provedor e limpa a URL para o erro não
  reaparecer em reloads. Coberto por 7 testes.
- Sessão, expiração e logout são do Supabase Auth; o logout é global com fallback
  local e limpa caches/rascunhos pessoais.
- Nenhuma flag de desenvolvimento permite autenticação falsa em produção.
