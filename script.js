<>
// 🧭 Navegação entre abas com transição e destaque
function navegar(abaId, botaoClicado) {
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  setTimeout(() => {
    loader.style.display = "none";

    // Esconde todas as abas
    document.querySelectorAll(".aba").forEach((aba) => {
      aba.classList.remove("visivel");
      aba.style.display = "none";
    });

    // Exibe a aba selecionada com efeito de fade-in
    const abaSelecionada = document.getElementById(abaId + "Aba");
    if (abaSelecionada) {
      abaSelecionada.style.display = "block";
      setTimeout(() => {
        abaSelecionada.classList.add("visivel");
      }, 10);
    }

    // Atualiza o título principal
    const tituloPrincipal = document.getElementById("tituloPrincipal");
    switch (abaId) {
      case "menuInicial":
        tituloPrincipal.textContent = "Ferramenta de Concessão de Pensão Militar";
        break;
      case "calculoPensao":
        tituloPrincipal.textContent = "Cálculo e Distribuição da Pensão Militar";
        break;
      case "cadastrorequerentes":
        tituloPrincipal.textContent = "Cadastro dos Requerentes da Pensão Militar";
        break;
      case "documentosWord":
        tituloPrincipal.textContent = "Documentos Obrigatórios da Geração do Direito à Pensão Militar";
        break;
    }

    // Atualiza os botões de navegação
    document.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.style.backgroundColor = "#FFFFFF";
    });

    botaoClicado.classList.add("active");
    botaoClicado.style.backgroundColor = "#D0E3FA";
  }, 400);
}

// 🚀 Executa ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleLinhasBtn");
  const linhas = document.getElementById("linhasCalculo");
  const campoPosto = document.getElementById("campoPosto");
  const darkToggle = document.getElementById("darkModeToggle");
  const darkIcon = darkToggle?.querySelector("i");

  let visivel = false;

  // 🔘 Alternância de exibição das informações de cálculo
  if (toggleBtn && linhas && campoPosto) {
    toggleBtn.addEventListener("click", () => {
      visivel = !visivel;

      linhas.style.display = visivel ? "block" : "none";
      campoPosto.style.display = visivel ? "block" : "none";

      toggleBtn.classList.toggle("exibir", !visivel);
      toggleBtn.classList.toggle("ocultar", visivel);
      toggleBtn.innerHTML = visivel
        ? `<i class="fas fa-eye-slash"></i> Ocultar Informações do Cálculo da Pensão Militar`
        : `<i class="fas fa-eye"></i> Exibir Informações do Cálculo da Pensão Militar`;
    });

    // Inicializa como oculto
    toggleBtn.classList.add("exibir");
    campoPosto.style.display = "none";
  }

  // 🏠 Botão inicial
  const btnMenuInicial = document.getElementById("btnMenuInicial");
  if (btnMenuInicial) {
    btnMenuInicial.addEventListener("click", () => {
      navegar("menuInicial", btnMenuInicial);
    });
  }

  // 🌙 Modo escuro persistente
  const modoSalvo = localStorage.getItem("modoEscuro");
  if (modoSalvo === "ativo") {
    document.body.classList.add("dark-mode");
    if (darkIcon) {
      darkIcon.classList.remove("fa-moon");
      darkIcon.classList.add("fa-sun");
    }
  }

  if (darkToggle && darkIcon) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const modoAtivo = document.body.classList.contains("dark-mode");

      darkIcon.classList.toggle("fa-moon", !modoAtivo);
      darkIcon.classList.toggle("fa-sun", modoAtivo);
      localStorage.setItem("modoEscuro", modoAtivo ? "ativo" : "inativo");
    });
  }

  // 🔄 Restaura campos salvos
  restaurarRequerentes();
});

// ➕ Adiciona um novo bloco de requerente
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

// 💾 Salva dados localmente durante a sessão
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

// 🔄 Restaura campos salvos ao recarregar
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

// 📄 Gera documentos Word com base nos dados dos requerentes
function gerarDocumentosWord() {
  const container = document.getElementById("listaRequerentes");
  const blocos = container.querySelectorAll(".requerente-bloco");

  if (blocos.length === 0) {
    alert("Nenhum requerente cadastrado.");
    return;
  }

  blocos.forEach((bloco, i) => {
    const nome = bloco.querySelector(`#nome${i + 1}`)?.value || "";
    const cpf = bloco.querySelector(`#cpf${i + 1}`)?.value || "";

    if (!nome.trim() || !cpf.trim()) {
      alert(`Requerente ${i + 1} está incompleto. Preencha todos os campos.`);
      return;
    }

    exportarParaWord({ nome, cpf });
  });
}

// 📤 Exporta documento Word com base no modelo
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
