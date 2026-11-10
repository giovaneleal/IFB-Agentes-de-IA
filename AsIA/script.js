const WEBHOOK_URL = "https://n8n.incluc0de.com.br/webhook/e016cd76-6d17-42e2-856b-e54911d36482";

const mensagens = document.getElementById("mensagens");
const form = document.getElementById("form");
const texto = document.getElementById("texto");
const enviar = document.getElementById("enviar");

// Sessão: mantém o histórico do agente (Simple Memory no n8n) enquanto a aba estiver aberta
function obterSessao(nova) {
  let id = null;
  try { if (!nova) id = sessionStorage.getItem("session_id"); } catch (e) {}
  if (!id) {
    id = "sessao-" + Date.now();
    try { sessionStorage.setItem("session_id", id); } catch (e) {}
  }
  return id;
}
let sessionId = obterSessao(false);

function escapar(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Converte o texto do agente (markdown simples: **negrito**, listas) em HTML seguro
function formatar(txt) {
  const linhas = escapar(txt).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").split("\n");
  let html = "", lista = null;
  for (const l of linhas) {
    const num = l.match(/^\s*(\d+)[.)]\s+(.*)/), bul = l.match(/^\s*[-*•]\s+(.*)/);
    const tipo = num ? "ol" : bul ? "ul" : null;
    if (tipo !== lista) {
      if (lista) html += "</" + lista + ">";
      if (tipo) html += "<" + tipo + ">";
      lista = tipo;
    }
    // value preserva a numeração do agente quando sub-itens interrompem a lista
    if (num) html += '<li value="' + num[1] + '">' + num[2] + "</li>";
    else if (bul) html += "<li>" + bul[1] + "</li>";
    else if (l.trim()) html += "<p>" + l + "</p>";
  }
  if (lista) html += "</" + lista + ">";
  return html;
}

function adicionar(classe, html) {
  const div = document.createElement("div");
  div.className = "msg " + classe;
  div.innerHTML = html;
  mensagens.appendChild(div);
  mensagens.scrollTop = mensagens.scrollHeight;
  return div;
}

function boasVindas() {
  mensagens.innerHTML = "";
  adicionar("bot", "Olá! 👋 Sou o <strong>Consultor Virtual de Primeiros Socorros</strong> 🚑, e estou aqui para orientar você em <strong>primeiros socorros e Suporte Básico de Vida</strong>. " +
    "Descreva a situação (ex.: sangramento, engasgo, desmaio, queimadura) e eu oriento você passo a passo.<br><br>" +
    "<strong>Em caso de emergência, ligue imediatamente para 192 (SAMU) ou 193 (Bombeiros).</strong>");
}

async function perguntar(msg) {
  adicionar("user", escapar(msg));
  const aguardando = adicionar("bot digitando", "Analisando a situação...");
  enviar.disabled = true;
  try {
    const r = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_message: msg, session_id: sessionId })
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const dados = await r.json();
    if (dados.status !== "success" || !dados.response) throw new Error("resposta inválida");
    if (dados.session_id) sessionId = dados.session_id;
    aguardando.className = "msg bot";
    aguardando.innerHTML = formatar(dados.response);
  } catch (e) {
    aguardando.className = "msg erro";
    aguardando.innerHTML = "Não foi possível falar com o assistente agora (" + escapar(e.message) +
      "). <strong>Se for uma emergência, ligue 192 ou 193.</strong>";
  } finally {
    enviar.disabled = false;
    mensagens.scrollTop = mensagens.scrollHeight;
    texto.focus();
  }
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const msg = texto.value.trim();
  if (!msg || enviar.disabled) return;
  texto.value = "";
  perguntar(msg);
});

document.querySelectorAll("#atalhos button").forEach((b) =>
  b.addEventListener("click", () => { if (!enviar.disabled) perguntar(b.dataset.msg); })
);

document.getElementById("nova").addEventListener("click", () => {
  sessionId = obterSessao(true);
  boasVindas();
});

boasVindas();
