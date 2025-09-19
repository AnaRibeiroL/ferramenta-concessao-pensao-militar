//** 🧩 PARTE 1 — FUNÇÃO PARA NAVEGAR ENTRE AS ABAS E MANTER A ABA ATIVA */

function navegar(abaId, botaoClicado) {
  // Salva a aba ativa no armazenamento local (para manter ao recarregar)
  localStorage.setItem("abaAtiva", abaId);

  // Oculta todas as abas e remove a classe 'visivel'
  document.querySelectorAll(".aba").forEach((aba) => {
    aba.classList.remove("visivel");
    aba.style.display = "none";
  });

  // Exibe a aba selecionada e adiciona a classe 'visivel'
  const abaSelecionada = document.getElementById(`${abaId}Aba`);
  if (abaSelecionada) {
    abaSelecionada.style.display = "block";
    abaSelecionada.classList.add("visivel");
  }

  // Remove destaque dos botões do menu
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.style.backgroundColor = "#fff";
  });

  // Destaca o botão clicado
  if (botaoClicado) {
    botaoClicado.classList.add("active");
    botaoClicado.style.backgroundColor = "#D0E3FA";
  }
}

// 🧩 PARTE 2 — FUNÇÃO PARA EXIBIR O MODAL DE CONFIRMAÇÃO
function abrirModal() {
  // Torna o modal visível
  document.getElementById("modalConfirmacao").style.display = "flex";
}

// 🧩 PARTE 3 — FUNÇÃO PARA FECHAR O MODAL DE CONFIRMAÇÃO
function fecharModal() {
  // Oculta o modal
  document.getElementById("modalConfirmacao").style.display = "none";
}

// 🧩 PARTE 4 — FUNÇÃO CHAMADA QUANDO O USUÁRIO CONFIRMA A LIMPEZA
function confirmarLimpeza() {
  // Executa a limpeza dos campos
  limparTodasAsAbas();

  // Fecha o modal
  fecharModal();

  // Exibe mensagem de sucesso
  alert("Todos os dados foram limpos com sucesso!");
}

// 🧩 PARTE 5 — FUNÇÃO PARA LIMPAR DADOS DAS ABAS ESPECIFICADAS
function limparTodasAsAbas() {
  // Lista com os IDs das abas (sem o sufixo 'Aba')
  const abas = ["calculoPensao", "informacaoInstituidor", "cadastrorequerentes"];

  // Percorre cada aba
  abas.forEach((id) => {
    // Monta o ID completo da aba (ex: 'calculoPensaoAba')
    const aba = document.getElementById(`${id}Aba`);

    // Se a aba existir, limpa os campos
    if (aba) {
      const campos = aba.querySelectorAll("input, select, textarea");

      campos.forEach((campo) => {
        // Desmarca checkboxes e radios
        if (campo.type === "checkbox" || campo.type === "radio") {
          campo.checked = false;
        } else {
          // Limpa o valor dos demais campos
          campo.value = "";
        }
      });
    }
  });
}




//** 🧩 PARTE 2 — EXIBIR OU OCULTAR OS CAMPOS FLUTUANTES NA ABA DE CÁLCULO DE PENSÃO */

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleLinhasBtn");
  const linhas = document.getElementById("linhasCalculo");

  let visivel = false;

  if (toggleBtn && linhas) {
    toggleBtn.addEventListener("click", () => {
      visivel = !visivel;
      linhas.style.display = visivel ? "block" : "none";

      toggleBtn.classList.toggle("exibir", !visivel);
      toggleBtn.classList.toggle("ocultar", visivel);
      toggleBtn.innerHTML = visivel
        ? `<i class="fa-solid fa-eye-slash"></i> Ocultar Informações do Cálculo da Pensão Militar`
        : `<i class="fa-solid fa-eye"></i> Exibir Informações do Cálculo da Pensão Militar`;
    });
  }

  //** 🧩 PARTE 3 — CARREGAR LISTA SUSPENSA COM DADOS (EXTERNOS) DA API */

  carregarPostos("postoSelect");
  carregarPostos("proventoSelect");
  carregarPostos("rbghiSelect");

  //** 🧩 PARTE 4 — RESTAURAR ABA ATIVA E DADOS SALVOS */

  const abaSalva = localStorage.getItem("abaAtiva");
  if (abaSalva) {
    const botaoAlvo = document.querySelector(`[data-aba="${abaSalva}"]`);
    if (botaoAlvo) {
      navegar(abaSalva, botaoAlvo);
    }
  }

  restaurarRequerentes();
});

//** 🧩 PARTE 5 — FUNÇÃO: CARREGAR POSTOS DA LISTA SUSPENSA DOS CAMPOS POSTO/GRADUAÇÃO A PARTIR DA PLANILHA GOOGLE */

function carregarPostos(selectId) {
  fetch(
    "https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=POSTO"
  )
    .then((res) => res.text())
    .then((text) => {
      const json = JSON.parse(
        text
          .replace("/*O_o*/", "")
          .replace("google.visualization.Query.setResponse(", "")
          .slice(0, -2)
      );
      const rows = json.table.rows;
      const select = document.getElementById(selectId);
      if (!select) return;

      rows.forEach((row) => {
        const descricao = row.c[2]?.v;
        if (descricao) {
          const option = document.createElement("option");
          option.value = descricao;
          option.textContent = descricao;
          select.appendChild(option);
        }
      });
    })
    .catch((err) => console.error("Erro ao carregar postos:", err));
}

//** 🧩 PARTE 6 — FUNÇÃO: ADICIONAR UM NOVO BLOCO DE REQUERENTES */

function adicionarRequerente() {
  const container = document.getElementById("listaRequerentes");
  const index = container.children.length + 1;

  const div = document.createElement("div");
  div.className = "requerente-bloco";
  div.innerHTML = `
    <h4>Requerente ${index}</h4>
    <input type="text" id="nome${index}" placeholder="Nome do requerente">
    <input type="text" id="cpf${index}" placeholder="CPF do requerente">
  `;
  container.appendChild(div);

  salvarCampoTemporariamente(`nome${index}`);
  salvarCampoTemporariamente(`cpf${index}`);
}

//** 🧩 PARTE 7 — FUNÇÃO: RESTAURAR CAMPOS SALVOS AO CARREGAR A PÁGINA */

function restaurarRequerentes() {
  const container = document.getElementById("listaRequerentes");
  const camposSalvos = Object.keys(sessionStorage).filter((key) =>
    key.startsWith("nome")
  );

  camposSalvos.forEach((key) => {
    const index = key.replace("nome", "");
    const div = document.createElement("div");
    div.className = "requerente-bloco";
    div.innerHTML = `
      <h4>Requerente ${index}</h4>
      <input type="text" id="nome${index}" placeholder="Nome do requerente">
      <input type="text" id="cpf${index}" placeholder="CPF do requerente">
    `;
    container.appendChild(div);

    salvarCampoTemporariamente(`nome${index}`);
    salvarCampoTemporariamente(`cpf${index}`);
  });
}

//** 🧩 PARTE 8 — FUNÇÃO: SALVAR DADOS LOCALMENTE DURANTE A SESSÃO */

function salvarCampoTemporariamente(campoId) {
  const campo = document.getElementById(campoId);
  if (!campo) return;

  campo.addEventListener("input", () => {
    sessionStorage.setItem(campoId, campo.value);
  });

  const valorSalvo = sessionStorage.getItem(campoId);
  if (valorSalvo) {
    campo.value = valorSalvo;
  }
}

//** 🧩 PARTE 9 — FUNÇÃO: VALIDA OS CAMPOS ANTES DE GERAR OS DOCUMENTOS */

function validarCamposRequerentes() {
  const blocos = document.querySelectorAll(".requerente-bloco");
  let todosValidos = true;

  blocos.forEach((bloco, i) => {
    const nome = bloco.querySelector(`#nome${i + 1}`)?.value.trim();
    const cpf = bloco.querySelector(`#cpf${i + 1}`)?.value.trim();

    if (!nome || !cpf) {
      alert(
        `⚠️ Requerente ${i + 1} está incompleto. Preencha todos os campos.`
      );
      todosValidos = false;
    }
  });

  return todosValidos;
}

//** 🧩 PARTE 10 — FUNÇÃO: GERAR DOCUMENTOS WORD COM BASE NOS DADOS */

function gerarDocumentosWord() {
  if (!validarCamposRequerentes()) return;

  const container = document.getElementById("listaRequerentes");
  const blocos = container.querySelectorAll(".requerente-bloco");

  blocos.forEach((bloco, i) => {
    const nome = bloco.querySelector(`#nome${i + 1}`)?.value || "";
    const cpf = bloco.querySelector(`#cpf${i + 1}`)?.value || "";

    exportarParaWord({ nome, cpf });
  });
}

//** 🧩 PARTE 11 — FUNÇÃO: EXPORTAR DOCUMENTOS WORD COM BASE NOS MODELOS DEFINIDOS PELA DAP */

function exportarParaWord(requerente) {
  fetch("modelo-parecer.docx")
    .then((res) => res.arrayBuffer())
    .then((content) => {
      const zip = new PizZip(content);
      const doc = new window.docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        nome: requerente.nome,
        cpf: requerente.cpf,
        data: new Date().toLocaleDateString("pt-BR"),
      });

      const nomeArquivo = requerente.nome
        .replace(/\s+/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, `Parecer_${nomeArquivo}.docx`);
    })
    .catch((error) => {
      console.error("Erro ao gerar documento:", error);
      alert("Ocorreu um erro ao gerar o documento Word.");
    });
}
