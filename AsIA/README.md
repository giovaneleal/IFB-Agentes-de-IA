# Consultor Virtual de Primeiros Socorros

Projeto final (EA3) da disciplina Sistemas Inteligentes e Agentes de IA — IFB.
Autores: Camila Souza Anderle, Gustavo Rodrigues, Giovane Alves Leal. Professor: Leandro Vaguetti.

Agente de IA para orientação em primeiros socorros e Suporte Básico de Vida (SBV), com RAG sobre
documentos PDF de SBV (Supabase Vector Store), orquestrado no n8n e exposto por Webhook HTTP POST.
Esta pasta contém a aplicação consumidora (frontend web em HTML/CSS/JS puro).

## Arquitetura

```
Navegador (index.html + script.js)
   │  POST JSON {user_message, session_id}
   ▼
n8n Webhook ─► Edit Fields ─► AI Agent (OpenAI Chat Model + Simple Memory por session_id
                                         + Supabase Vector Store como ferramenta RAG)
                                   ─► Edit Fields1 ─► Respond to Webhook
   ◄─ JSON {status, session_id, response}

Ingestão (manual): GitHub (PDFs) ─► HTTP Request ─► Extract from File ─► Chunk
                   ─► Supabase Vector Store (Embeddings OpenAI)
```

## Como executar

- Online: acesse o link do GitHub Pages informado no arquivo de entrega.
- Local: baixe esta pasta e abra `index.html` no navegador (não precisa de servidor nem instalação).

## Contrato da API

`POST https://n8n.incluc0de.com.br/webhook/e016cd76-6d17-42e2-856b-e54911d36482`
(`Content-Type: application/json`)

Requisição:
```json
{ "user_message": "Uma pessoa desmaiou, o que faço?", "session_id": "sessao-1793137612005" }
```

Resposta:
```json
{ "status": "success", "session_id": "sessao-1793137612005", "response": "1. Verifique a segurança do local..." }
```

## Funcionalidades do frontend

- Chat com histórico por sessão (`session_id` gerado no navegador e reenviado a cada mensagem).
- Atalhos para os casos de uso: sangramento, engasgo, desmaio, queimadura, parada cardíaca/RCP.
- Faixa fixa com os números de emergência 192 / 193 (clicáveis no celular).
- Formatação das respostas (passos numerados, negrito) e mensagem de erro com orientação de ligar 192/193.
- Botão "Nova conversa" que inicia uma nova sessão.

> Esta IA é de apoio e não substitui o atendimento médico profissional.
