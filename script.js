/* 🌐 JAVA SCRIPT: SIGPeM – SISTEMA INTEGRADO DE GESTÃO DE PENSÃO MILITAR - EXÉRCITO BRASILEIRO

╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                               ║
║   🎖️  SIGPEM-EB – SISTEMA INTEGRADO DE GESTÃO DE PENSÃO - EXÉRCITO BRASILEIRO                                
║                                                                                                   
║   📄 Arquivo: Java Script (Arquivo com as funcionalidades)                                           
║   👩‍💻 Desenvolvido por: 3º Sgt Ana Cristina - DAP (Diretoria de Assistência ao Pessoal)            
║   📅 Versão: 1.0 - ATUALIZADO COM FUNCIONALIDADES ABA 2                                         
║   📝 Descrição: Sistema web para auxiliar no cálculo da pensão e na composição das
║      documentações geradoras de direito no processo de pensão militar              
║                                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|                                  🌐 JAVA SCRIPT: SIGPen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
*/

/* ========================================================================
🧩 SEÇÃO 1: VARIÁVEIS GLOBAIS E CONFIGURAÇÕES DO SISTEMA
========================================================================= */

// 🧩 Estado geral do sistema - Centraliza todos os dados da aplicação
let estadoAtual = {
  abaAtiva: 'menuInicial', // Controla qual aba está visível atualmente
  instituidor: {}, // Armazena dados do militar falecido (instituidor da pensão)
  requerentes: [], // Array com todos os requerentes da pensão
  calculo: {}, // Dados do cálculo da pensão militar
  contracheque: {}, // Dados do contracheque gerado
  contadorRequerentes: 0, // Contador para gerar IDs únicos de requerentes
};

// 🧩 Mapeamento de títulOs dinâmicos do cabeçalho conforme especificação (Está apenas o nome do sistema)
const TITULOS_CABECALHO = {
  menuInicial: 'SIGPEM-EB – Sistema Integrado de Gestão de Pensão Militar do Exército Brasileiro',
  cadastroInstituidor: 'SIGPEM-EB – Sistema Integrado de Gestão de Pensão Militar do Exército Brasileiro',
  cadastroRequerentes: 'SIGPEM-EB – Sistema Integrado de Gestão de Pensão Militar do Exército Brasileiro',
  calculoPensao: 'SIGPEM-EB – Sistema Integrado de Gestão de Pensão Militar do Exército Brasileiro',
};

// 🧩 Configurações gerais do sistema
const configuracoesSistema = {
  intervalAutoSave: 30000, // Salvar automaticamente a cada 30 segundos
  tempoNotificacao: 5000, // Notificações visíveis por 5 segundos
  versaoSistema: '2.0', // Versão atual do sistema
  validacao: {
    cpfObrigatorio: true, // CPF é campo obrigatório
    telefoneObrigatorio: false, // Telefone é opcional
    enderecoObrigatorio: false, // Endereço é opcional
  },
};

// 🧩 Variável para controlar qual aba será limpa (usado no modal de confirmação)
let abaParaLimpar = null;

/* ========================================================================
🧩 SEÇÃO 2: URLs DAS APIs - GOOGLE SHEETS
========================================================================= */

// URL base da planilha Google Sheets
const BASE_PLANILHA_URL =
  'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=';

// URLs específicas para cada aba da planilha
const APIS = {
  POSTO: BASE_PLANILHA_URL + 'POSTO', // Postos e graduações militares
  ARMA: BASE_PLANILHA_URL + 'ARMA', // Armas e serviços
  TIPO_REFORMA: BASE_PLANILHA_URL + 'TIPO_REFORMA', // )
  CONDICAO_MILITAR: BASE_PLANILHA_URL + 'CONDICAO_MILITAR', // Condição do militar (ativo, inativo, etc)
  CONTRIBUICAO_PENSAO: BASE_PLANILHA_URL + 'CONT_PENS_MIL_PERC', // Percentuais de contribuição (10,5% e 1,5%)
  ADC_HABILITACAO: BASE_PLANILHA_URL + 'ADC_HABILITACAO', // Adicional de habilitação
  ADC_PERMANENCIA: BASE_PLANILHA_URL + 'ADC_PERMANENCIA', // Adicional de permanência
  ADC_C_ORG: BASE_PLANILHA_URL + 'ADC_C_ORG', // Adicional de compensação Orgânica
  SVPR: BASE_PLANILHA_URL + 'SVPR', // Seções de Veteranos e Pensionistas Regionais
  ORGAO: BASE_PLANILHA_URL + 'ORGAO', // Órgãos com SVP
  CONDICAO_REQUERENTE: BASE_PLANILHA_URL + 'CONDICAO_REQUERENTE', // Condição dos requerentes
};

/* ========================================================================
🧩 SEÇÃO 3: ARRAYS PARA ARMAZENAR DADOS DAS APIS
========================================================================= */

// Arrays globais que armazenarão os dados carregados das APIs
let dadosPostos = []; // Postos e graduações
let postosAcima = []; // Um ou Dois Postos e graduações contribuídos pelo instituidor
let armaServico = []; // Armas e serviços
let condicaoInstituidor = []; // Condições do militar
let contribuicaoPensaoInstituidor = []; // Percentuais de contribuição
let adcHabilitacao = []; // Adicional de habilitação
let svpR = []; // SVPs Regionais
let svpOrgao = []; // Órgãos com SVP
let condicaoRequerente = []; // Condições dos requerentes
let tipoReforma = []; // Tipos de reforma
let adcPermanencia = []; // Adicional de permanência
let adcCompensacaoOrg = []; // Adicional de compensação Orgânica

/* =============================================================================
🧩 SEÇÃO 3.1: DETALHAMENTO COMENTADO DAS ARRAYS PARA ARMAZENAR DADOS DAS APIS
============================================================================== */

/*
🔗 let dadosPostos = []; // Postos e graduações: aba tabela POSTO: estrutura da tabela da API planilha Google Sheets para buscar postos/graduações
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=POSTO'
ID | COD | PG DESCRIÇÃO | PG SIGLA | PG UM POSTO ACIMA | PG DOIS POSTOS ACIMA | SOLDO (ANO 2024) | SOLDO (ANO 2025) | SOLDO (ANO 2026) | ADC_C_DISP_MIL | ADC_MIL | 
0    1        2             3              4                      5                    6                  7                 8                  9            10
 */

/*
🔗 let armaServico = []; // Armas e serviços: aba tabela ARMA: estrutura da tabela da API planilha Google Sheets para buscar da Arma/Serviço
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=ARMA'
ID | COD | DESCRIÇÃO | 
0     1        2       

 */

/*
🔗 let condicaoInstituidor = []; // Condições do militar: aba tabela CONDICAO_MILITAR: estrutura da tabela da API planilha Google Sheets para buscar da condição do militar
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=CONDICAO_MILITAR'
ID | COD | CONDIÇÃO DO MILITAR | 
0     1        2       
 */

/*
🔗 let contribuicaoPensaoInstituidor = []; // Percentuais de contribuição: aba tabela CONT_PENS_MIL_PERC: estrutura da tabela da API planilha Google Sheets para buscar a Contribuição para a Pensão Militar
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=CONT_PENS_MIL_PERC'
ID | COD | CONTRIBUIÇÃO | 
0     1        2       
 */

/*
🔗 let adcHabilitacao = []; // Adicional de habilitação: aba tabela ADC_HABILITACAO: estrutura da tabela da API planilha Google Sheets para buscar o Adicional de Habilitação
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=ADC_HABILITACAO'
ID | COD | TIPO	| PERCENTUAL (ANO 2019) | PERCENTUAL (ANO 2020) | PERCENTUAL (ANO 2021) | PERCENTUAL (ANO 2022) | PERCENTUAL (ANO 2023) | 
0     1     2              3                         4                        5                      6                      7       
 */

/*
🔗 let svpR = []; // SVPs Regionais: aba tabela SVPR: estrutura da tabela da API planilha Google Sheets para buscar as SVP Regionais
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=SVPR'
ID | CODOM | TIPO | NOME | NOME PARECER | NOME TPM | SIGLA | SIGLA PARECER | DESCRIÇÃO PARECER |	CIDADE | NOME UF | RM DE VINCULAÇÃO |
0      1      2      3          4             5        6          7                   8            9           10             11      
 */

/*
🔗 let svpOrgao = []; // Órgãos com SVP: aba tabela ORGAO: estrutura da tabela da API planilha Google Sheets para buscar os Órgãos com SVP
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=ORGAO'
ID |	CODOM | TIPO | NOME | SIGLA | CIDADE | NOME UF | SIGLA UF | RM DE VINCULAÇÃO |
0       1      2      3      4        5        6          7             8                     
 */

/*
🔗 let condicaoRequerente = []; // Condições dos requerentes: aba tabela CONDICAO_REQUERENTE: estrutura da tabela da API planilha Google Sheets para buscar a Condição dos Requerentes
'https://docs.google.com/spreadsheets/d/1aoNkeVqj2mJQVKsJyrf29QexwbEPq2jStxZO8hsT_Xo/gviz/tq?tqx=out:json&sheet=CONDICAO_REQUERENTE'
ID | COD | CONDIÇÃO REQUERENTE |
0     1           2                    
 */

/* ========================================================================
🧩 SEÇÃO 4: INICIALIZAÇÃO DO SISTEMA
========================================================================= */

/**
 * 🎯 Função principal de inicialização
 * Executa quando o DOM estiver completamente carregado
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('🎯 Sistema de Pensão Militar Inicializado - Versão 2.0');

  // Configurar sistema de navegação entre abas
  configurarNavegacao();

  // Carregar todos os dados das APIs em paralelo
  carregarTodasAPIs();

  // Configurar eventos para armazenamento automático
  configurarArmazenamentoAutomatico();

  // Restaurar dados salvos anteriormente (se existirem)
  restaurarDadosSalvos();

  // Configurar modais de confirmação e sucesso
  configurarModais();

  // Configurar responsividade da interface
  configurarResponsividade();

  // Configurar botões de toggle (exibir/ocultar seções)
  configurarToggleinformacoesInstituidor();
  configurarToggleCalculo();
  configurartogglecadastroInstituidor();

  // Configurar labels flutuantes para todos os campos
  configurarLabelsFlutantes();

  // 🔥 IMPORTANTE: Inicializar máscaras de CPF ANTES dos labels flutuantes
  inicializarMascarasCPF();
  inicializarMascarasIdentidade();
  inicializarMascarasPrecCP();
  inicializarMascarasDataEB();

  // 🔥 Verificar campos preenchidos após aplicar máscaras
  verificarCamposPreenchidos();

  // Mostrar notificação de boas-vindas se for primeira visita
  setTimeout(() => {
    if (!localStorage.getItem('pensaoMilitar_visitado')) {
      mostrarNotificacao('Bem-vindo ao Sistema de Pensão Militar!', 'info');
      localStorage.setItem('pensaoMilitar_visitado', 'true');
    }
  }, 2000);

  // Inicializar sistema de auto-save após 5 segundos
  setTimeout(() => {
    inicializarAutoSave();
  }, 5000);

  console.log('✅ Sistema totalmente carregado e operacional!');
});

/**
 * 🎯 Verifica campos preenchidos e ajusta labels flutuantes
 */
function verificarCamposPreenchidos() {
  const inputs = document.querySelectorAll(
    '.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea'
  );

  inputs.forEach((input) => {
    // Se o campo tem valor, adiciona classe 'filled'
    if (input.value && input.value.trim() !== '') {
      input.classList.add('filled');
    }

    // Monitora mudanças no campo
    input.addEventListener('input', function () {
      if (this.value && this.value.trim() !== '') {
        this.classList.add('filled');
      } else {
        this.classList.remove('filled');
      }
    });

    // Monitora foco
    input.addEventListener('focus', function () {
      this.classList.add('filled');
    });

    // Monitora perda de foco
    input.addEventListener('blur', function () {
      if (!this.value || this.value.trim() === '') {
        this.classList.remove('filled');
      }
    });
  });
}

/* =============================================================================
🧩 SEÇÃO 5: SISTEMA DE CARREGAMENTO DE DADOS - TABELA POSTO 
Carregar os dados dos postos da planilha Google Sheets e Dado Local (offline)
============================================================================== */

/**
 * 📊 Carregar dados dos postos/graduações da API
 *
 * Descrição:
 * Faz requisição para Google Sheets e popula os selects HTML com os dados
 * dos postos e graduações militares. Em caso de falha, utiliza dados locais
 * (fallback) para garantir funcionamento offline.
 *
 * Fluxo de execução:
 * 1. Exibe notificação de carregamento
 * 2. Faz requisição HTTP para API do Google Sheets
 * 3. Processa resposta em formato JSONP
 * 4. Extrai e estrutura os dados dos postos/graduações
 * 5. Popula os elementos select do formulário
 * 6. Em caso de erro, carrega dados locais de fallback
 *
 * @throws {Error} Em caso de falha na requisição HTTP
 */
function carregardadosPostos() {
  console.log('📊 Iniciando carregamento dos dados dos postos/graduação...');
  mostrarNotificacao('Carregando dados dos postos/graduações...', 'info');

  // Fazer requisição HTTP para a API do Google Sheets
  fetch(APIS.POSTO)
    .then((res) => {
      // Verificar se a resposta HTTP foi bem-sucedida (status 200-299)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text(); // Converter resposta para texto (formato JSONP do Google Sheets)
    })
    .then((text) => {
      console.log('📡 Resposta da API POSTO recebida');

      // Processar formato JSONP do Google Sheets
      // Remove os wrappers do JSONP: /*O_o*/ e google.visualization.Query.setResponse(...)
      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      // Extrair linhas de dados da tabela retornada pela API
      const rows = json.table.rows;
      dadosPostos = []; // Limpar array global para novos dados

      // Processar cada linha retornada pela API
      rows.forEach((row, index) => {
        // Extrair valores de cada coluna da planilha
        // Estrutura: row.c[índice]?.v (c = cells, v = value)
        const id = row.c[0]?.v; // Coluna A: ID (Identificador Sequenciado)
        const codigo = row.c[1]?.v; // Coluna B: COD (código do posto CPEx)
        const descricao = row.c[2]?.v; // Coluna C: PG DESCRIÇÃO (nome completo) ← USADA PARA CATEGORIA
        const sigla = row.c[3]?.v; // Coluna D: PG SIGLA (abreviação)
        const umpostoacima = row.c[4]?.v; // Coluna E: PG UM POSTO ACIMA (NÃO usada para categoria)
        const doispostosacima = row.c[5]?.v; // Coluna F: PG DOIS POSTOS ACIMA (NÃO usada para categoria)
        const soldo2024 = row.c[6]?.v; // Coluna G: SOLDO (ANO 2024)
        const soldo2025 = row.c[7]?.v; // Coluna H: SOLDO (ANO 2025)
        const soldo2026 = row.c[8]?.v; // Coluna I: SOLDO (ANO 2026)
        const ADC_C_DISP_MIL = row.c[9]?.v; // Coluna J: ADC_C_DISP_MIL (Adicional Compensação)
        const ADC_MIL = row.c[10]?.v; // Coluna K: ADC_MIL (Adicional Militar)

        // Verificar se existe descrição válida antes de adicionar ao array
        // Evita adicionar linhas vazias ou inválidas da planilha
        if (descricao && typeof descricao === 'string') {
          // 🔥 IMPORTANTE: A categoria é determinada APENAS pela coluna DESCRIÇÃO
          const categoria = determinarCategoria(descricao);

          dadosPostos.push({
            id: id || index + 1, // ID sequencial (usar índice se não vier da API)
            codigo: codigo ? String(codigo).trim() : '', // Código do posto (string limpa)
            posto: descricao.trim(), // Nome completo do posto/graduação
            sigla: sigla ? sigla.trim() : '', // Sigla (ex: Gen Bda, Cel, ST)
            umpostoacima: umpostoacima ? umpostoacima.trim() : '', // UM posto acima
            doispostosacima: doispostosacima ? doispostosacima.trim() : '', // DOIS postos acima
            soldo2024: soldo2024 ? String(soldo2024).trim() : '', // Soldo ano 2024
            soldo2025: soldo2025 ? String(soldo2025).trim() : '', // Soldo ano 2025
            soldo2026: soldo2026 ? String(soldo2026).trim() : '', // Soldo ano 2026
            ADC_C_DISP_MIL: ADC_C_DISP_MIL ? String(ADC_C_DISP_MIL).trim() : '', // % Adicional Compensação
            ADC_MIL: ADC_MIL ? String(ADC_MIL).trim() : '', // % Adicional Militar
            categoria: categoria, // "Posto" ou "Graduação" ← baseado APENAS em 'descricao'
          });
        }
      });

      console.log(`✅ ${dadosPostos.length} postos carregados da API com sucesso`);

      // Popular os elementos <select> HTML com os dados carregados
      popularSelectsPostos();

      // Exibe notificação de sucesso após 1 segundo
      // (delay para não sobrepor a notificação anterior de "Carregando...")
      setTimeout(() => {
        mostrarNotificacao(`${dadosPostos.length} postos/graduações carregados!`, 'sucesso');
      }, 1000);
    })
    .catch((err) => {
      // Captura qualquer erro durante o processo de carregamento da API
      // Possíveis erros: falha de rede, timeout, CORS, API indisponível, etc.
      console.warn('⚠️ Erro ao carregar dados da API POSTO, usando fallback:', err);

      // Em caso de erro, usar dados de fallback (offline)
      // Garante funcionamento mesmo sem conexão com internet
      dadosPostos = obterFallbackPostos(); // Carregar dados locais estáticos
      popularSelectsPostos(); // Popular selects com dados offline

      // Notificar usuário sobre uso de dados offline
      mostrarNotificacao('Dados offline carregados. Verifique sua conexão.', 'info');
    });
}

/**
 * 🏷️ Determinar categoria do posto/graduação
 *
 * Descrição:
 * Classifica um posto militar como "Posto" (oficiais) ou "Graduação" (praças).
 * A classificação segue a hierarquia militar brasileira onde:
 * - POSTOS: Oficiais (de Aspirante até General)
 * - GRADUAÇÕES: Praças (de Soldado até Subtenente), Alunos e Cadetes
 *
 * ⚠️ IMPORTANTE: A categoria é definida APENAS pela coluna DESCRIÇÃO (descricao)
 * As colunas "UM POSTO ACIMA" e "DOIS POSTOS ACIMA" NÃO são usadas para categorização
 *
 * Hierarquia completa:
 * POSTOS: Gen Ex → Gen Div → Gen Bda → Cel → TC → Maj → Cap → 1º Ten → 2º Ten → Asp Of
 * GRADUAÇÕES: ST → 1º Sgt → 2º Sgt → 3º Sgt → Cb → Sd → Cadetes → Alunos
 *
 * @param {string} descricao - Nome completo do posto/graduação (coluna DESCRIÇÃO)
 * @returns {string} "Posto" (oficiais) ou "Graduação" (praças/alunos/cadetes)
 */
function determinarCategoria(descricao) {
  // Validação de entrada
  if (!descricao || typeof descricao !== 'string') {
    console.warn('⚠️ Descrição inválida:', descricao);
    return 'Graduação';
  }

  // Converter para maiúsculas e remover espaços extras
  const desc = descricao.trim().toUpperCase();

  // ═══════════════════════════════════════════════════════════════════
  // LISTA COMPLETA DE POSTOS (OFICIAIS)
  // ═══════════════════════════════════════════════════════════════════
  const postos = [
    'GENERAL DE EXÉRCITO NA INATIVIDADE',
    'GENERAL DE EXÉRCITO',
    'GENERAL DE DIVISÃO',
    'GENERAL DE BRIGADA',
    'CORONEL',
    'TENENTE-CORONEL',
    'MAJOR',
    'CAPITÃO',
    'PRIMEIRO-TENENTE',
    'SEGUNDO-TENENTE',
    'ASPIRANTE-A-OFICIAL',
    'ASPIRANTE',
  ];

  // ═══════════════════════════════════════════════════════════════════
  // LISTA COMPLETA DE GRADUAÇÕES (PRAÇAS, CADETES E ALUNOS)
  // ═══════════════════════════════════════════════════════════════════
  const graduacoes = [
    // PRAÇAS - SUBOFICIAIS E SARGENTOS
    'SUBTENENTE',
    'PRIMEIRO-SARGENTO',
    'SEGUNDO-SARGENTO',
    'TERCEIRO-SARGENTO',
    // PRAÇAS - CABOS E SOLDADOS
    'CABO',
    'SOLDADO',
    'TAIFEIRO',
    // CADETES
    'CADETE',
    // ALUNOS
    'ALUNO',
  ];

  // ═══════════════════════════════════════════════════════════════════
  // VERIFICAÇÃO DE POSTOS (tem prioridade sobre graduações)
  // ═══════════════════════════════════════════════════════════════════
  for (const posto of postos) {
    if (desc === posto || desc.startsWith(posto)) {
      console.log(`✅ POSTO identificado: "${descricao}" → Categoria: Posto`);
      return 'Posto';
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // VERIFICAÇÃO DE GRADUAÇÕES
  // ═══════════════════════════════════════════════════════════════════
  for (const grad of graduacoes) {
    if (desc.includes(grad)) {
      console.log(`✅ GRADUAÇÃO identificada: "${descricao}" → Categoria: Graduação`);
      return 'Graduação';
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // CASO NÃO ENCONTRE: LOG DE AVISO E RETORNA GRADUAÇÃO POR PADRÃO
  // ═══════════════════════════════════════════════════════════════════
  console.warn(`⚠️ Categoria não identificada para: "${descricao}" → Usando padrão: Graduação`);
  return 'Graduação';
}

/**
 * 📋 Popular selects de postos/graduações
 *
 * Descrição:
 * Insere opções nos elementos <select> HTML organizadas por categoria.
 * Cria uma estrutura hierárquica visual com:
 * - Placeholder inicial
 * - Cabeçalhos de categoria (▼ POSTOS / ▼ GRADUAÇÕES)
 * - Separadores visuais entre categorias
 * - Opções ordenadas alfabeticamente dentro de cada categoria
 *
 * IDs dos selects processados:
 * - postoRealInstituidor: Posto do instituidor da pensão
 * - postoReal: Posto atual do militar
 * - postoProventos: Posto para cálculo de proventos
 * - postoRBGHI: Posto para cálculo de RBGHI
 *
 * Estrutura de cada option:
 * - value: Nome completo do posto
 * - data-categoria: "Posto" ou "Graduação"
 * - data-codigo: Código CPEx
 * - data-sigla: Abreviação
 * - data-umpostoacima: Posto superior (para pensão)
 * - data-doispostosacima: Dois postos acima (para pensão)
 * - data-soldo2024/2025/2026: Valores dos soldos
 * - data-ADC_C_DISP_MIL: Percentual adicional compensação
 * - data-ADC_MIL: Percentual adicional militar
 */
function popularSelectsPostos() {
  // IDs dos elementos <select> que serão populados com os dados
  const selects = [
    'postoRealInstituidor',
    'postoReal',
    'postoProventos',
    'postoRBGHI',
    'postoCalculoProventos',
    'postoCalculoRBGHI',
  ];
  let selectsPopulados = 0; // Contador para log de sucesso

  // Processar cada select individualmente
  selects.forEach((selectId) => {
    const select = document.getElementById(selectId);

    // Verificar se o elemento existe no DOM antes de processar
    if (select) {
      // Preservar o texto do placeholder original se existir
      const placeholderExistente = select.querySelector('option[value=""]:first-child');
      const placeholderText = placeholderExistente ? placeholderExistente.textContent : '';

      // Limpar completamente o conteúdo do select
      select.innerHTML = '';

      // Criar e adicionar opção placeholder (opção vazia padrão)
      const placeholderOption = document.createElement('option');
      placeholderOption.value = ''; // Valor vazio
      placeholderOption.disabled = false; // Permite selecionar para limpar escolha
      placeholderOption.selected = true; // Selecionado por padrão
      placeholderOption.textContent = placeholderText; // Texto do placeholder
      select.appendChild(placeholderOption);

      // Ordenar dados por categoria e alfabeticamente
      // Primeiro agrupa por categoria (Postos aparecem antes de Graduações)
      // Depois ordena alfabeticamente dentro de cada categoria
      const postosOrdenados = [...dadosPostos].sort((a, b) => {
        // Primeiro critério: categoria
        if (a.categoria !== b.categoria) {
          return a.categoria === 'Posto' ? -1 : 1; // Postos primeiro, Graduações depois
        }
        // Segundo critério: ordem alfabética (considera acentuação)
        return a.posto.localeCompare(b.posto);
      });

      let categoriaAtual = ''; // Controle para detectar mudança de categoria

      // Inserir opções com separadores e cabeçalhos de categoria
      postosOrdenados.forEach((item) => {
        // 🔥 CORREÇÃO: Usar item.categoria em vez de posto.categoria
        // Detectar mudança de categoria e adicionar elementos visuais
        if (item.categoria !== categoriaAtual) {
          // Adicionar separador visual se não for a primeira categoria
          if (categoriaAtual !== '') {
            const separador = document.createElement('option');
            separador.disabled = true; // Não selecionável
            separador.textContent = '─────────────────────'; // Linha visual
            select.appendChild(separador);
          }

          // Adicionar cabeçalho da categoria
          const cabecalho = document.createElement('option');
          cabecalho.disabled = true; // Não selecionável
          // 🔥 CORREÇÃO: Usar item.categoria em vez de posto.categoria
          cabecalho.textContent = item.categoria === 'Posto' ? '▼ POSTOS' : '▼ GRADUAÇÕES';
          cabecalho.style.fontWeight = 'bold'; // Destaque visual
          cabecalho.style.backgroundColor = '#f0f0f0'; // Fundo cinza claro
          cabecalho.style.color = '#333'; // Texto escuro
          select.appendChild(cabecalho);

          categoriaAtual = item.categoria; // Atualizar categoria atual
        }

        // Criar option do posto/graduação com todos os dados
        const option = document.createElement('option');
        option.value = item.posto; // Valor usado em formulários
        option.textContent = item.posto; // Texto visível para o usuário

        // Adicionar todos os dados como atributos data-* para acesso via JavaScript
        option.setAttribute('data-id', item.id || ''); // ID sequencial
        option.setAttribute('data-categoria', item.categoria); // Categoria (Posto ou Graduação)
        option.setAttribute('data-codigo', item.codigo || ''); // Código CPEx
        option.setAttribute('data-sigla', item.sigla || ''); // Sigla (ex: Gen Bda)
        option.setAttribute('data-umpostoacima', item.umpostoacima || ''); // UM posto acima
        option.setAttribute('data-doispostosacima', item.doispostosacima || ''); // DOIS postos acima
        option.setAttribute('data-soldo2024', item.soldo2024 || ''); // Soldo 2024
        option.setAttribute('data-soldo2025', item.soldo2025 || ''); // Soldo 2025
        option.setAttribute('data-soldo2026', item.soldo2026 || ''); // Soldo ano 2026
        option.setAttribute('data-ADC_C_DISP_MIL', item.ADC_C_DISP_MIL || ''); // % Adicional Compensação
        option.setAttribute('data-ADC_MIL', item.ADC_MIL || ''); // % Adicional Militar

        select.appendChild(option);
      });

      selectsPopulados++;
      console.log(`✅ Select ${selectId} populado com ${dadosPostos.length} opções`);
    } else {
      console.warn(`⚠️ Select #${selectId} não encontrado no DOM`);
    }
  });

  console.log(`📋 ${selectsPopulados} de ${selects.length} selects de postos populados com sucesso`);
}

/**
 * 📦 Dados de fallback para postos (offline)
 *
 * Descrição:
 * Retorna array com dados locais estáticos de postos e graduações.
 * Utilizado como backup quando a API do Google Sheets falha ou está indisponível.
 * Garante funcionamento offline da aplicação.
 *
 * Estrutura dos dados:
 * - Todos os postos e graduações do Exército Brasileiro
 * - Valores de soldo para os anos 2024, 2025 e 2026
 * - Percentuais de adicionais (ADC_C_DISP_MIL e ADC_MIL)
 * - Hierarquia de postos superiores (para cálculo de pensão militar)
 *
 * Categorias incluídas:
 * 1. POSTOS (Oficiais): General até Aspirante-a-Oficial
 * 2. ALUNOS E CADETES: Instituições militares de formação
 * 3. GRADUAÇÕES (Praças): Subtenente até Soldado
 *
 * @returns {Array<Object>} Array com objetos contendo dados completos de cada posto/graduação
 */
function obterFallbackPostos() {
  return [
    // ===================================================================
    // CATEGORIA 1: POSTOS (OFICIAIS)
    // Hierarquia: General de Exército → Aspirante-a-Oficial
    // Características: Recebem ADC_C_DISP_MIL e ADC_MIL
    // ===================================================================

    {
      id: 1,
      codigo: '01',
      descricao: 'General de Exército na Inatividade',
      sigla: 'Gen Ex Inat',
      umpostoacima: 'General de Exército na inatividade',
      doispostosacima: 'General de Exército na inatividade',
      soldo2024: 'R$ 14.030,00',
      soldo2025: 'R$ 14.661,00',
      soldo2026: 'R$ 15.321,00',
      ADC_C_DISP_MIL: '41%',
      ADC_MIL: '28%',
      categoria: 'Posto',
    },

    {
      id: 2,
      codigo: '02',
      descricao: 'General de Exército',
      sigla: 'Gen Ex',
      umpostoacima: 'General de Exército na inatividade',
      doispostosacima: 'General de Exército na inatividade',
      soldo2024: 'R$ 13.471,00',
      soldo2025: 'R$ 14.077,00',
      soldo2026: 'R$ 14.711,00',
      ADC_C_DISP_MIL: '41%',
      ADC_MIL: '28%',
      categoria: 'Posto',
    },

    {
      id: 3,
      codigo: '03',
      descricao: 'General de Divisão',
      sigla: 'Gen Div',
      umpostoacima: 'General de Exército',
      doispostosacima: 'General de Exército na inatividade',
      soldo2024: 'R$ 13.471,00',
      soldo2025: 'R$ 14.077,00',
      soldo2026: 'R$ 14.711,00',
      ADC_C_DISP_MIL: '41%',
      ADC_MIL: '28%',
      categoria: 'Posto',
    },

    {
      id: 4,
      codigo: '04',
      descricao: 'General de Brigada',
      sigla: 'Gen Bda',
      umpostoacima: 'General de Divisão',
      doispostosacima: 'General de Exército',
      soldo2024: 'R$ 12.490,00',
      soldo2025: 'R$ 13.052,00',
      soldo2026: 'R$ 13.639,00',
      ADC_C_DISP_MIL: '35%',
      ADC_MIL: '28%',
      categoria: 'Posto',
    },

    {
      id: 5,
      codigo: '05',
      descricao: 'Coronel',
      sigla: 'Cel',
      umpostoacima: 'General de Brigada',
      doispostosacima: 'General de Divisão',
      soldo2024: 'R$ 11.451,00',
      soldo2025: 'R$ 11.966,00',
      soldo2026: 'R$ 12.505,00',
      ADC_C_DISP_MIL: '32%',
      ADC_MIL: '25%',
      categoria: 'Posto',
    },

    {
      id: 6,
      codigo: '06',
      descricao: 'Tenente-Coronel',
      sigla: 'TC',
      umpostoacima: 'Coronel',
      doispostosacima: 'General de Brigada',
      soldo2024: 'R$ 11.250,00',
      soldo2025: 'R$ 11.756,00',
      soldo2026: 'R$ 12.285,00',
      ADC_C_DISP_MIL: '26%',
      ADC_MIL: '25%',
      categoria: 'Posto',
    },

    {
      id: 7,
      codigo: '07',
      descricao: 'Major',
      sigla: 'Maj',
      umpostoacima: 'Tenente-Coronel',
      doispostosacima: 'Coronel',
      soldo2024: 'R$ 11.088,00',
      soldo2025: 'R$ 11.587,00',
      soldo2026: 'R$ 12.108,00',
      ADC_C_DISP_MIL: '20%',
      ADC_MIL: '25%',
      categoria: 'Posto',
    },

    {
      id: 8,
      codigo: '08',
      descricao: 'Capitão',
      sigla: 'Cap',
      umpostoacima: 'Major',
      doispostosacima: 'Tenente-Coronel',
      soldo2024: 'R$ 9.135,00',
      soldo2025: 'R$ 9.546,00',
      soldo2026: 'R$ 9.976,00',
      ADC_C_DISP_MIL: '12%',
      ADC_MIL: '22%',
      categoria: 'Posto',
    },

    {
      id: 9,
      codigo: '08',
      descricao: 'Capitão QAO',
      sigla: 'Cap QAO',
      umpostoacima: 'Major',
      doispostosacima: 'Tenente-Coronel',
      soldo2024: 'R$ 9.135,00',
      soldo2025: 'R$ 9.546,00',
      soldo2026: 'R$ 9.976,00',
      ADC_C_DISP_MIL: '32%',
      ADC_MIL: '22%',
      categoria: 'Posto',
    },

    {
      id: 10,
      codigo: '09',
      descricao: 'Primeiro-Tenente',
      sigla: '1° Ten',
      umpostoacima: 'Capitão',
      doispostosacima: 'Major',
      soldo2024: 'R$ 8.245,00',
      soldo2025: 'R$ 8.616,00',
      soldo2026: 'R$ 9.004,00',
      ADC_C_DISP_MIL: '6%',
      ADC_MIL: '19%',
      categoria: 'Posto',
    },

    {
      id: 11,
      codigo: '09',
      descricao: 'Primeiro-Tenente QAO',
      sigla: '1° Ten QAO',
      umpostoacima: 'Capitão',
      doispostosacima: 'Major',
      soldo2024: 'R$ 8.245,00',
      soldo2025: 'R$ 8.616,00',
      soldo2026: 'R$ 9.004,00',
      ADC_C_DISP_MIL: '32%',
      ADC_MIL: '19%',
      categoria: 'Posto',
    },

    {
      id: 12,
      codigo: '10',
      descricao: 'Segundo-Tenente',
      sigla: '2° Ten',
      umpostoacima: 'Primeiro-Tenente',
      doispostosacima: 'Capitão',
      soldo2024: 'R$ 7.490,00',
      soldo2025: 'R$ 7.827,00',
      soldo2026: 'R$ 8.179,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '19%',
      categoria: 'Posto',
    },

    {
      id: 13,
      codigo: '10',
      descricao: 'Segundo-Tenente QAO',
      sigla: '2° Ten QAO',
      umpostoacima: 'Primeiro-Tenente',
      doispostosacima: 'Capitão',
      soldo2024: 'R$ 7.490,00',
      soldo2025: 'R$ 7.827,00',
      soldo2026: 'R$ 8.179,00',
      ADC_C_DISP_MIL: '32%',
      ADC_MIL: '19%',
      categoria: 'Posto',
    },

    {
      id: 14,
      codigo: '11',
      descricao: 'Aspirante-a-Oficial',
      sigla: 'Asp Of',
      umpostoacima: 'Aspirante-a-Oficial',
      doispostosacima: 'Aspirante-a-Oficial',
      soldo2024: 'R$ 7.315,00',
      soldo2025: 'R$ 7.644,00',
      soldo2026: 'R$ 7.988,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '19%',
      categoria: 'Posto',
    },

    // ===================================================================
    // CATEGORIA 2: CADETES E ALUNOS
    // Instituições: AMAN, EsPCEx, IME, CPOR, NPOR, EsFS
    // Características: Soldo reduzido, percentuais menores de adicionais
    // ===================================================================

    {
      id: 15,
      codigo: '12',
      descricao: 'Cadete Último Ano',
      sigla: 'Cad Ult Ano',
      umpostoacima: 'Cadete Último Ano',
      doispostosacima: 'Cadete Último Ano',
      soldo2024: 'R$ 1.630,00',
      soldo2025: 'R$ 1.703,00',
      soldo2026: 'R$ 1.780,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '19%',
      categoria: 'Graduação',
    },

    {
      id: 16,
      codigo: '13',
      descricao: 'Cadete de 3º Ano',
      sigla: 'Cad 3º Ano',
      umpostoacima: 'Cadete de 3º Ano',
      doispostosacima: 'Cadete de 3º Ano',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '19%',
      categoria: 'Graduação',
    },

    {
      id: 17,
      codigo: '13',
      descricao: 'Cadete de 2º Ano',
      sigla: 'Cad 2º Ano',
      umpostoacima: 'Cadete de 2º Ano',
      doispostosacima: 'Cadete de 2º Ano',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '19%',
      categoria: 'Graduação',
    },

    {
      id: 18,
      codigo: '13',
      descricao: 'Cadete de 1º Ano',
      sigla: 'Cad 1º Ano',
      umpostoacima: 'Cadete de 1º Ano',
      doispostosacima: 'Cadete de 1º Ano',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '19%',
      categoria: 'Graduação',
    },

    {
      id: 19,
      codigo: '14',
      descricao: 'Aluno CPOR',
      sigla: 'Al CPOR',
      umpostoacima: 'Aluno CPOR',
      doispostosacima: 'Aluno CPOR',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '0%',
      ADC_MIL: '19%',
      categoria: 'Graduação',
    },

    {
      id: 20,
      codigo: '14',
      descricao: 'Aluno NPOR',
      sigla: 'Al NPOR',
      umpostoacima: 'Aluno NPOR',
      doispostosacima: 'Aluno NPOR',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '0%',
      ADC_MIL: '19%',
      categoria: 'Graduação',
    },

    {
      id: 21,
      codigo: '14',
      descricao: 'Aluno IME 2º Ano',
      sigla: 'Al IME 2º Ano',
      umpostoacima: 'Aluno IME 2º Ano',
      doispostosacima: 'Aluno IME 2º Ano',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '0%',
      ADC_MIL: '0%',
      categoria: 'Graduação',
    },

    {
      id: 22,
      codigo: '14',
      descricao: 'Aluno IME 1º Ano',
      sigla: 'Al IME 1º Ano',
      umpostoacima: 'Aluno IME 1º Ano',
      doispostosacima: 'Aluno IME 1º Ano',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '0%',
      ADC_MIL: '0%',
      categoria: 'Graduação',
    },

    {
      id: 23,
      codigo: '14',
      descricao: 'Aluno IME',
      sigla: 'Al IME',
      umpostoacima: 'Aluno IME',
      doispostosacima: 'Aluno IME',
      soldo2024: 'R$ 1.334,00',
      soldo2025: 'R$ 1.394,00',
      soldo2026: 'R$ 1.457,00',
      ADC_C_DISP_MIL: '0%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 24,
      codigo: '15',
      descricao: 'Aluno de Escola de Formação de Sargentos',
      sigla: 'Al EsFS',
      umpostoacima: 'Aluno de Escola de Formação de Sargentos',
      doispostosacima: 'Aluno de Escola de Formação de Sargentos',
      soldo2024: 'R$ 1.199,00',
      soldo2025: 'R$ 1.253,00',
      soldo2026: 'R$ 1.309,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 25,
      codigo: '16',
      descricao: 'Aluno de Escola Preparatória de Cadetes Último Ano',
      sigla: 'Al EsPCEx Ult Ano',
      umpostoacima: 'Aluno de Escola Preparatória de Cadetes Último Ano',
      doispostosacima: 'Aluno de Escola Preparatória de Cadetes Último Ano',
      soldo2024: 'R$ 1.199,00',
      soldo2025: 'R$ 1.253,00',
      soldo2026: 'R$ 1.309,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 26,
      codigo: '16',
      descricao: 'Aluno de Escola Preparatória de Cadetes 3º Ano',
      sigla: 'Al EsPCEx 3º Ano',
      umpostoacima: 'Aluno de Escola Preparatória de Cadetes 3º Ano',
      doispostosacima: 'Aluno de Escola Preparatória de Cadetes 3º Ano',
      soldo2024: 'R$ 1.185,00',
      soldo2025: 'R$ 1.238,00',
      soldo2026: 'R$ 1.294,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 27,
      codigo: '16',
      descricao: 'Aluno de Escola Preparatória de Cadetes 2º Ano',
      sigla: 'Al EsPCEx 2º Ano',
      umpostoacima: 'Aluno de Escola Preparatória de Cadetes 2º Ano',
      doispostosacima: 'Aluno de Escola Preparatória de Cadetes 2º Ano',
      soldo2024: 'R$ 1.185,00',
      soldo2025: 'R$ 1.238,00',
      soldo2026: 'R$ 1.294,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 28,
      codigo: '16',
      descricao: 'Aluno de Escola Preparatória de Cadetes 1º Ano',
      sigla: 'Al EsPCEx 1º Ano',
      umpostoacima: 'Aluno de Escola Preparatória de Cadetes 1º Ano',
      doispostosacima: 'Aluno de Escola Preparatória de Cadetes 1º Ano',
      soldo2024: 'R$ 1.185,00',
      soldo2025: 'R$ 1.238,00',
      soldo2026: 'R$ 1.294,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    // ===================================================================
    // CATEGORIA 3: GRADUAÇÕES (PRAÇAS)
    // Hierarquia: Subtenente → Soldado
    // Características: Valores progressivos de soldo e adicionais
    // ===================================================================
    {
      id: 29,
      codigo: '18',
      descricao: 'Subtenente',
      sigla: 'ST',
      umpostoacima: 'Segundo-Tenente',
      doispostosacima: 'Primeiro-Tenente',
      soldo2024: 'R$ 6.169,00',
      soldo2025: 'R$ 6.447,00',
      soldo2026: 'R$ 6.737,00',
      ADC_C_DISP_MIL: '32%',
      ADC_MIL: '116%',
      categoria: 'Graduação',
    },

    {
      id: 30,
      codigo: '19',
      descricao: 'Primeiro-Sargento',
      sigla: '1º Sgt',
      umpostoacima: 'Subtenente',
      doispostosacima: 'Segundo-Tenente',
      soldo2024: 'R$ 5.483,00',
      soldo2025: 'R$ 5.730,00',
      soldo2026: 'R$ 5.988,00',
      ADC_C_DISP_MIL: '20%',
      ADC_MIL: '16%',
      categoria: 'Graduação',
    },

    {
      id: 31,
      codigo: '20',
      descricao: 'Segundo-Sargento',
      sigla: '2º Sgt',
      umpostoacima: 'Primeiro-Sargento',
      doispostosacima: 'Subtenente',
      soldo2024: 'R$ 4.770,00',
      soldo2025: 'R$ 4.985,00',
      soldo2026: 'R$ 5.209,00',
      ADC_C_DISP_MIL: '12%',
      ADC_MIL: '16%',
      categoria: 'Graduação',
    },

    {
      id: 32,
      codigo: '20',
      descricao: 'Segundo-Sargento QE',
      sigla: '2º Sgt QE',
      umpostoacima: 'Primeiro-Sargento',
      doispostosacima: 'Subtenente',
      soldo2024: 'R$ 4.770,00',
      soldo2025: 'R$ 4.985,00',
      soldo2026: 'R$ 5.209,00',
      ADC_C_DISP_MIL: '26%',
      ADC_MIL: '16%',
      categoria: 'Graduação',
    },

    {
      id: 33,
      codigo: '21',
      descricao: 'Terceiro-Sargento',
      sigla: '3º Sgt',
      umpostoacima: 'Segundo-Sargento',
      doispostosacima: 'Primeiro-Sargento',
      soldo2024: 'R$ 3.825,00',
      soldo2025: 'R$ 3.997,00',
      soldo2026: 'R$ 4.177,00',
      ADC_C_DISP_MIL: '6%',
      ADC_MIL: '16%',
      categoria: 'Graduação',
    },

    {
      id: 34,
      codigo: '21',
      descricao: 'Terceiro-Sargento QE',
      sigla: '3º Sgt QE',
      umpostoacima: 'Segundo-Sargento',
      doispostosacima: 'Primeiro-Sargento',
      soldo2024: 'R$ 3.825,00',
      soldo2025: 'R$ 3.997,00',
      soldo2026: 'R$ 4.177,00',
      ADC_C_DISP_MIL: '16%',
      ADC_MIL: '16%',
      categoria: 'Graduação',
    },

    {
      id: 35,
      codigo: '22',
      descricao: 'Cabo Engajado',
      sigla: 'Cb Eng',
      umpostoacima: 'Cabo Engajado',
      doispostosacima: 'Cabo Engajado',
      soldo2024: 'R$ 2.627,00',
      soldo2025: 'R$ 2.745,00',
      soldo2026: 'R$ 2.869,00',
      ADC_C_DISP_MIL: '6%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 36,
      codigo: '23',
      descricao: 'Cabo Não Engajado (EV)',
      sigla: 'Cb N Eng',
      umpostoacima: 'Cabo Não Engajado (EV)',
      doispostosacima: 'Cabo Não Engajado (EV)',
      soldo2024: 'R$ 1.078,00',
      soldo2025: 'R$ 1.127,00',
      soldo2026: 'R$ 1.177,00',
      ADC_C_DISP_MIL: '6%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 37,
      codigo: '24',
      descricao: 'Soldado Paraquedista Engajado',
      sigla: 'Sd Pqdt',
      umpostoacima: 'Soldado Paraquedista Engajado',
      doispostosacima: 'Soldado Paraquedista Engajado',
      soldo2024: 'R$ 1.926,00',
      soldo2025: 'R$ 2.013,00',
      soldo2026: 'R$ 2.103,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 38,
      codigo: '25',
      descricao: 'Soldado Clarim/Corneteiro Engajado',
      sigla: 'Sd Cl Eng',
      umpostoacima: 'Soldado Clarim/Corneteiro Engajado',
      doispostosacima: 'Soldado Clarim/Corneteiro Engajado',
      soldo2024: 'R$ 1.765,00',
      soldo2025: 'R$ 1.844,00',
      soldo2026: 'R$ 1.927,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 39,
      codigo: '26',
      descricao: 'Soldado Clarim/Corneteiro EV',
      sigla: 'Sd Cl EV',
      umpostoacima: 'Soldado Clarim/Corneteiro EV',
      doispostosacima: 'Soldado Clarim/Corneteiro EV',
      soldo2024: 'R$ 1.078,00',
      soldo2025: 'R$ 1.127,00',
      soldo2026: 'R$ 1.177,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 40,
      codigo: '27',
      descricao: 'Soldado do Exército Engajado Qualificado',
      sigla: 'Sd Ex Eng',
      umpostoacima: 'Soldado do Exército Engajado Qualificado',
      doispostosacima: 'Soldado do Exército Engajado Qualificado',
      soldo2024: 'R$ 1.765,00',
      soldo2025: 'R$ 1.844,00',
      soldo2026: 'R$ 1.927,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 41,
      codigo: '28',
      descricao: 'Soldado Recruta (Efetivo Variável)',
      sigla: 'Sd EV',
      umpostoacima: 'Soldado Recruta (Efetivo Variável)',
      doispostosacima: 'Soldado Recruta (Efetivo Variável)',
      soldo2024: 'R$ 1.078,00',
      soldo2025: 'R$ 1.127,00',
      soldo2026: 'R$ 1.177,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 42,
      codigo: '29',
      descricao: 'Taifeiro-Mor',
      sigla: 'Taif Mor',
      umpostoacima: 'Taifeiro-Mor',
      doispostosacima: 'Taifeiro-Mor',
      soldo2024: 'R$ 2.627,00',
      soldo2025: 'R$ 2.745,00',
      soldo2026: 'R$ 2.869,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 43,
      codigo: '30',
      descricao: 'Taifeiro de Primeira Classe',
      sigla: 'Taif 1ª Cl',
      umpostoacima: 'Taifeiro de Primeira Classe',
      doispostosacima: 'Taifeiro de Primeira Classe',
      soldo2024: 'R$ 2.325,00',
      soldo2025: 'R$ 2.430,00',
      soldo2026: 'R$ 2.539,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 44,
      codigo: '31',
      descricao: 'Taifeiro de Segunda Classe',
      sigla: 'Taif 2ª Cl',
      umpostoacima: 'Taifeiro de Segunda Classe',
      doispostosacima: 'Taifeiro de Segunda Classe',
      soldo2024: 'R$ 2.210,00',
      soldo2025: 'R$ 2.309,00',
      soldo2026: 'R$ 2.413,00',
      ADC_C_DISP_MIL: '5%',
      ADC_MIL: '13%',
      categoria: 'Graduação',
    },

    {
      id: 45,
      codigo: '32',
      descricao: 'Soldado Engajado Não Especialista',
      sigla: 'Sd Eng N Esp',
      umpostoacima: 'Soldado Engajado Não Especialista',
      doispostosacima: 'Soldado Engajado Não Especialista',
      soldo2024: 'R$ 1.765,00',
      soldo2025: 'R$ 1.844,00',
      soldo2026: 'R$ 1.927,00',
      ADC_C_DISP_MIL: '0%',
      ADC_MIL: '0%',
      categoria: 'Graduação',
    },
  ];
}

/* ========================================================================
🧩 SEÇÃO 6: SISTEMA DE CARREGAMENTO - ARMAS E SERVIÇOS
========================================================================= */

/**
 * 📊 Carregar dados das Armas/Quadros/Serviços da API
 *
 * Descrição:
 * Faz requisição para Google Sheets e popula os selects HTML com os dados
 * das Armas do Instituidor. Em caso de falha, utiliza dados locais
 * (fallback) para garantir funcionamento offline.
 *
 * Fluxo de execução:
 * 1. Exibe notificação de carregamento
 * 2. Faz requisição HTTP para API do Google Sheets
 * 3. Processa resposta em formato JSONP
 * 4. Extrai e estrutura os dados das armas/quadros/serviços
 * 5. Popula os elementos select do formulário
 * 6. Em caso de erro, carrega dados locais de fallback
 *
 * @throws {Error} Em caso de falha na requisição HTTP
 */
function carregarDadosArmas() {
  console.log('📊 Iniciando carregamento das armas/serviços...');
  mostrarNotificacao('Carregando dados das armas/serviços...', 'info');

  // Fazer requisição HTTP para a API do Google Sheets
  fetch(APIS.ARMA)
    .then((res) => {
      // Verificar se a resposta HTTP foi bem-sucedida (status 200-299)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text(); // Converter resposta para texto (formato JSONP do Google Sheets)
    })

    .then((text) => {
      console.log('📡 Resposta da API ARMA recebida');

      // Processar formato JSONP do Google Sheets
      // Remove os wrappers do JSONP: /*O_o*/ e google.visualization.Query.setResponse(...)
      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      // Extrair linhas de dados da tabela retornada pela API
      const rows = json.table.rows;
      armaServico = []; // Limpar array global para novos dados

      // Processar cada linha retornada pela API
      rows.forEach((row, index) => {
        // Extrair valores de cada coluna da planilha
        // Estrutura: row.c[índice]?.v (c = cells, v = value)
        const id = row.c[0]?.v; // Coluna A: ID (Identificador Sequenciado)
        const codigo = row.c[1]?.v; // Coluna B: COD (código da Arma/Quadro/Serviço CPEx)
        const descricao = row.c[2]?.v; // Coluna C: DESCRIÇÃO (nome completo)

        // Verificar se existe descrição válida antes de adicionar ao array
        // Evita adicionar linhas vazias ou inválidas da planilha
        if (descricao && typeof descricao === 'string') {
          armaServico.push({
            id: id || index + 1, // ID sequencial (usar índice se não vier da API)
            codigo: codigo ? String(codigo).trim() : '', // Código da Arma/Quadro/Serviço (string limpa)
            descricao: descricao.trim(), // Nome completo da Arma/Quadro/Serviço
            categoria: determinarCategoriaArma(descricao), // Determinar se é Arma, Quadro ou Serviço
          });
        }
      });

      console.log(`✅ ${armaServico.length} armas/serviços carregados da API`);

      // Popular os elementos <select> HTML com os dados carregados
      popularSelectsArmas();

      // Exibe notificação de sucesso após 1 segundo
      // (delay para não sobrepor a notificação anterior de "Carregando...")
      setTimeout(() => {
        mostrarNotificacao(`${armaServico.length} armas/serviços carregados!`, 'sucesso');
      }, 1000);
    })

    .catch((err) => {
      // Captura qualquer erro durante o processo de carregamento da API
      // Possíveis erros: falha de rede, timeout, CORS, API indisponível, etc.
      console.warn('⚠️ Erro ao carregar API ARMA, usando fallback:', err);

      // Em caso de erro, usar dados de fallback (offline)
      // Garante funcionamento mesmo sem conexão com internet
      armaServico = obterFallbackArmas(); // Carregar dados locais estáticos
      popularSelectsArmas(); // Popular selects com dados offline

      // Notificar usuário sobre uso de dados offline
      mostrarNotificacao('Dados offline de armas/serviços carregados.', 'info');
    });
}

/**
 * 🏷️ Determinar categoria da Arma/Quadro/Serviço
 *
 * Descrição:
 * Analisa a descrição recebida e classifica em uma das três categorias:
 * - ARMA: militares ligados diretamente às atividades de combate
 * - QUADRO: funções administrativas, técnicas ou auxiliares
 * - SERVIÇO: áreas de apoio técnico e especializado (saúde, capelania, etc)
 *
 * @param {string} descricao - Nome completo da Arma/Quadro/Serviço
 * @returns {string} "Arma", "Quadro" ou "Serviço"
 */
function determinarCategoriaArma(descricao) {
  // Converter para maiúsculas para comparação case-insensitive
  const desc = descricao.toUpperCase();

  // Array com todas as ARMAS reconhecidas pelo CPEx (Centro de Pagamento do Exército)
  // Arma: militares ligados diretamente às atividades de combate e operações militares
  // Incluem Infantaria, Cavalaria, Artilharia, Engenharia e Comunicações
  const armas = [
    'OFICIAL GENERAL',
    'ALUNO DA ESPCEX',
    'CADETE DA AMAN',
    'OFICIAL DE CARREIRA DA AMAN',
    'ALUNO DO CPOR',
    'ALUNO DO NPOR',
    'OFICIAL TEMPORÁRIO',
    '(OFICIAIS) - NÃO ENQUADRADO',
    'PRAÇA DE GRADUAÇÃO IGUAL OU SUPERIOR A 3º SARGENTO DE CARREIRA',
    'ALUNO DE CFS',
    'PRAÇA DE GRADUAÇÃO INFERIOR A 3º SARGENTO',
    '(PRAÇAS) - NÃO ENQUADRADO',
  ];

  // Array com todos os QUADROS reconhecidos pelo CPEx
  // QUADRO: grupos específicos de militares com funções administrativas, técnicas ou auxiliares
  // Não estão diretamente ligados às armas de combate
  const quadros = [
    'OFICIAL DE CARREIRA DO QEM', // Quadro de Engenheiros Militares
    'ALUNO DO IME',
    'OFICIAL DE CARREIRA DO QAO', // Quadro Auxiliar de Oficiais
    'OFICIAL DE CARREIRA DO QCO', // Quadro Complementar de Oficiais
    'PRAÇA DA GRADUAÇÃO 3º SARGENTO TEMPORÁRIO',
    'PRAÇA TEMPORÁRIA (3º SGT EBST)',
    'CB ESPECIALISTA TEMPORÁRIO (EBCT)',
    'PRAÇA 2º SARGENTO DO QUADRO ESPECIAL (QE)',
    'PRAÇA 3º SARGENTO DO QUADRO ESPECIAL (QE)',
  ];

  // Array com todos os SERVIÇOS reconhecidos pelo CPEx
  // SERVIÇO: áreas de apoio técnico e especializado
  const servicos = [
    'OFICIAL DE CARREIRA DE SAÚDE (ESSEX)',
    'PRAÇA DE GRADUAÇÃO IGUAL OU SUPERIOR A 3º SARGENTO DE CARREIRA DE SAÚDE',
    'ALUNO DE CFS DE SAÚDE',
    'OFICIAL CAPELÃO',
    'TAIFEIRO',
  ];

  // Verificar se corresponde a alguma ARMA
  // Usa some() com includes() para permitir correspondência parcial
  if (armas.some((arma) => desc.includes(arma))) {
    return 'Arma';
  }

  // Verificar se corresponde a algum QUADRO
  if (quadros.some((quadro) => desc.includes(quadro))) {
    return 'Quadro';
  }

  // Verificar se corresponde a algum SERVIÇO
  if (servicos.some((servico) => desc.includes(servico))) {
    return 'Serviço';
  }

  // Para todos os outros casos não listados explicitamente
  // Por padrão, considera como "Serviço" (categoria mais abrangente)
  return 'Serviço';
}

/**
 * 📋 Popular selects de armas/quadro/serviços
 *
 * Descrição:
 * Insere opções nos elementos <select> HTML organizadas por categoria
 * com separadores visuais e cabeçalhos para melhor usabilidade
 */
function popularSelectsArmas() {
  // IDs dos selects que serão populados
  const selects = ['armaServicoInstituidor'];
  let selectsPopulados = 0;

  selects.forEach((selectId) => {
    const select = document.getElementById(selectId);

    if (select) {
      // Preservar placeholder existente
      const placeholderExistente = select.querySelector('option[value=""]:first-child');
      const placeholderText = placeholderExistente
        ? placeholderExistente.textContent
        : 'Selecione a arma/quadro/serviço';

      // Limpar select
      select.innerHTML = '';

      // Criar opção placeholder
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.disabled = false; // Permite selecionar para limpar
      placeholderOption.selected = true;
      placeholderOption.textContent = placeholderText;
      select.appendChild(placeholderOption);

      // Ordenar dados por categoria (Arma > Quadro > Serviço) e alfabeticamente
      const armasOrdenadas = armaServico.sort((a, b) => {
        // Define ordem de prioridade das categorias
        const ordemCategoria = { Arma: 1, Quadro: 2, Serviço: 3 };
        const ordemA = ordemCategoria[a.categoria] || 4;
        const ordemB = ordemCategoria[b.categoria] || 4;

        // Primeiro critério: categoria
        if (ordemA !== ordemB) {
          return ordemA - ordemB;
        }

        // Segundo critério: ordem alfabética dentro da mesma categoria
        return a.descricao.localeCompare(b.descricao);
      });

      let categoriaAtual = '';

      // Inserir opções com separadores visuais
      armasOrdenadas.forEach((item) => {
        // Adicionar cabeçalho ao mudar de categoria
        if (item.categoria !== categoriaAtual) {
          if (categoriaAtual !== '') {
            // Separador visual entre categorias
            const separador = document.createElement('option');
            separador.disabled = true;
            separador.textContent = '─────────────────────';
            select.appendChild(separador);
          }

          // Cabeçalho da categoria
          const cabecalho = document.createElement('option');
          cabecalho.disabled = true;
          cabecalho.textContent = `▼ ${item.categoria.toUpperCase()}`;
          cabecalho.style.fontWeight = 'bold';
          select.appendChild(cabecalho);

          categoriaAtual = item.categoria;
        }

        // Criar opção da Arma/Quadro/Serviço
        const option = document.createElement('option');
        option.value = item.descricao;
        option.textContent = item.descricao;
        option.setAttribute('data-id', item.id);
        option.setAttribute('data-codigo', item.codigo || '');
        option.setAttribute('data-categoria', item.categoria);
        select.appendChild(option);
      });

      selectsPopulados++;
      console.log(`✅ Select ${selectId} populado com ${armaServico.length} opções`);
    } else {
      console.warn(`⚠️ Select não encontrado: ${selectId}`);
    }
  });

  console.log(`📋 ${selectsPopulados} select(s) de armas populado(s)`);
}

/**
 * 📦 Dados de fallback para Armas/Quadro/Serviços (offline)
 *
 * Descrição:
 * Retorna array com dados locais caso API falhe.
 * Garante funcionamento offline do sistema.
 *
 * @returns {Array} Array com objetos contendo id, codigo, descricao e categoria
 */
function obterFallbackArmas() {
  return [
    // ===================================================================
    // CATEGORIA: ARMA
    // Militares ligados diretamente às atividades de combate
    // ===================================================================
    { id: 1, codigo: '05', descricao: 'Oficial General', categoria: 'Arma' },
    { id: 2, codigo: '10', descricao: 'Aluno da EsPCEx', categoria: 'Arma' },
    { id: 3, codigo: '10', descricao: 'Cadete da AMAN', categoria: 'Arma' },
    { id: 4, codigo: '10', descricao: 'Oficial de Carreira da AMAN', categoria: 'Arma' },
    { id: 11, codigo: '45', descricao: 'Aluno do CPOR', categoria: 'Arma' },
    { id: 12, codigo: '45', descricao: 'Aluno do NPOR', categoria: 'Arma' },
    { id: 13, codigo: '50', descricao: 'Oficial Temporário', categoria: 'Arma' },
    { id: 14, codigo: '55', descricao: '(Oficiais) - Não enquadrado nas demais situações', categoria: 'Arma' },
    {
      id: 15,
      codigo: '65',
      descricao: 'Praça de Graduação igual ou superior a 3º Sargento de Carreira',
      categoria: 'Arma',
    },
    { id: 16, codigo: '65', descricao: 'Aluno de CFS', categoria: 'Arma' },
    {
      id: 17,
      codigo: '70',
      descricao: 'Praça de Graduação igual ou superior a 3º Sargento de Carreira',
      categoria: 'Arma',
    },
    {
      id: 25,
      codigo: '85',
      descricao: 'Praça de Graduação inferior a 3º Sargento, exceto Taifeiro',
      categoria: 'Arma',
    },
    { id: 28, codigo: '90', descricao: '(Praças) - Não enquadrado nas situações acima', categoria: 'Arma' },

    // ===================================================================
    // CATEGORIA: QUADRO
    // Funções administrativas, técnicas ou auxiliares
    // ===================================================================
    { id: 5, codigo: '15', descricao: 'Oficial de Carreira do QEM', categoria: 'Quadro' },
    { id: 6, codigo: '15', descricao: 'Aluno do IME', categoria: 'Quadro' },
    { id: 8, codigo: '30', descricao: 'Oficial de Carreira do QAO', categoria: 'Quadro' },
    { id: 9, codigo: '35', descricao: 'Oficial de Carreira do QCO', categoria: 'Quadro' },
    { id: 20, codigo: '75', descricao: 'Praça da Graduação 3º Sargento Temporário', categoria: 'Quadro' },
    { id: 21, codigo: '76', descricao: 'Praça Temporária (3º Sgt EBST)', categoria: 'Quadro' },
    { id: 22, codigo: '79', descricao: 'Cb Especialista Temporário (EBCT)', categoria: 'Quadro' },
    { id: 26, codigo: '86', descricao: 'Praça 2º Sargento do Quadro Especial (QE)', categoria: 'Quadro' },
    { id: 27, codigo: '86', descricao: 'Praça 3º Sargento do Quadro Especial (QE)', categoria: 'Quadro' },

    // ===================================================================
    // CATEGORIA: SERVIÇO
    // Áreas de apoio técnico e especializado
    // ===================================================================
    { id: 7, codigo: '20', descricao: 'Oficial de Carreira de Saúde (EsSEx)', categoria: 'Serviço' },
    { id: 10, codigo: '40', descricao: 'Oficial Capelão', categoria: 'Serviço' },
    {
      id: 18,
      codigo: '70',
      descricao: 'Praça de Graduação igual ou superior a 3º Sargento de Carreira de saúde',
      categoria: 'Serviço',
    },
    { id: 19, codigo: '70', descricao: 'Aluno de CFS de saúde', categoria: 'Serviço' },
    { id: 23, codigo: '80', descricao: 'Taifeiro Mor, 1ª classe', categoria: 'Serviço' },
    { id: 24, codigo: '80', descricao: 'Taifeiro Mor, 2ª classe', categoria: 'Serviço' },
  ];
}

/* ========================================================================
🧩 SEÇÃO 7: SISTEMA DE CARREGAMENTO - CONDIÇÃO DO MILITAR
========================================================================= */

/**
 * 📊 Carregar dados da condição do militar
 *
 * Descrição:
 * Faz requisição para Google Sheets e popula os selects HTML com os dados
 * dos postos e graduações militares. Em caso de falha, utiliza dados locais
 * (fallback) para garantir funcionamento offline.
 *
 * Fluxo de execução:
 * 1. Exibe notificação de carregamento
 * 2. Faz requisição HTTP para API do Google Sheets
 * 3. Processa resposta em formato JSONP
 * 4. Extrai e estrutura os dados da condição do militar (instituidor da pensão)
 * 5. Popula os elementos select do formulário
 * 6. Em caso de erro, carrega dados locais de fallback
 *
 * @throws {Error} Em caso de falha na requisição HTTP
 */

function carregarCondicaoMilitar() {
  console.log('📊 Iniciando carregamento da condição do militar...');

  // Fazer requisição HTTP para a API do Google Sheets
  fetch(APIS.CONDICAO_MILITAR)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      console.log('📡 Resposta da API CONDICAO_MILITAR recebida');
      // Verificar se a resposta HTTP foi bem-sucedida (status 200-299)
      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      const rows = json.table.rows;
      condicaoInstituidor = [];

      rows.forEach((row, index) => {
        const codigo = row.c[1]?.v; // Coluna COD (índice 1)
        const condicao = row.c[2]?.v; // Coluna CONDIÇÃO DO MILITAR (índice 2)

        if (condicao && typeof condicao === 'string') {
          condicaoInstituidor.push({
            id: index + 1,
            codigo: codigo ? String(codigo).trim() : '',
            condicao: condicao.trim(),
          });
        }
      });

      console.log(`✅ ${condicaoInstituidor.length} condições do militar carregadas`);
      popularSelectCondicaoMilitar();
    })
    .catch((err) => {
      console.warn('⚠️ Erro ao carregar API CONDICAO_MILITAR, usando fallback:', err);
      condicaoInstituidor = obterFallbackCondicaoMilitar();
      popularSelectCondicaoMilitar();
    });
}

/**
 * 📋 Popular select de condição do militar
 */
function popularSelectCondicaoMilitar() {
  const select = document.getElementById('condicaoMilitar');

  if (select) {
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = false;
    placeholder.selected = true;
    placeholder.textContent = '';
    select.appendChild(placeholder);

    condicaoInstituidor.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.condicao;
      option.textContent = item.condicao;
      option.setAttribute('data-codigo', item.codigo);
      select.appendChild(option);
    });

    console.log('✅ Select de condição do militar populado');
  }
}

/**
 * 📦 Dados de fallback para condição do militar
 */
function obterFallbackCondicaoMilitar() {
  return [
    { id: 1, codigo: '0', condicao: 'militar da Ativa' },
    { id: 2, codigo: '1', condicao: 'militar da Reserva Remunerada' },
    { id: 3, codigo: '2', condicao: 'militar Reformado' },
    { id: 4, codigo: '2', condicao: 'militar Reformado por Decisão Judicial' },
    { id: 5, codigo: '4', condicao: 'militar Reformado por Idade Limite' },
    { id: 6, codigo: '8', condicao: 'militar Anistiado Político' },
  ];
}

/* ========================================================================
🧩 SEÇÃO 8: SISTEMA DE CARREGAMENTO - CONTRIBUIÇÃO PENSÃO MILITAR
========================================================================= */

/**
 * 📊 Carregar dados de contribuição para pensão militar
 */
function carregarContribuicaoPensao() {
  console.log('📊 Iniciando carregamento da contribuição pensão militar...');

  fetch(APIS.CONTRIBUICAO_PENSAO)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      console.log('📡 Resposta da API CONTRIBUICAO_PENSAO recebida');

      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      const rows = json.table.rows;
      contribuicaoPensaoInstituidor = [];

      rows.forEach((row, index) => {
        const codigo = row.c[1]?.v; // Coluna COD (índice 1)
        const contribuicao = row.c[2]?.v; // Coluna CONTRIBUIÇÃO (índice 2)

        if (contribuicao && typeof contribuicao === 'string') {
          contribuicaoPensaoInstituidor.push({
            id: index + 1,
            codigo: codigo ? String(codigo).trim() : '',
            contribuicao: contribuicao.trim(),
          });
        }
      });

      console.log(`✅ ${contribuicaoPensaoInstituidor.length} tipos de contribuição carregados`);
      popularSelectContribuicaoPensao();
    })
    .catch((err) => {
      console.warn('⚠️ Erro ao carregar API CONTRIBUICAO_PENSAO, usando fallback:', err);
      contribuicaoPensaoInstituidor = obterFallbackContribuicaoPensao();
      popularSelectContribuicaoPensao();
    });
}

/**
 * 📋 Popular select de contribuição pensão militar
 */
function popularSelectContribuicaoPensao() {
  const select = document.getElementById('contribuicaoPensao');

  if (select) {
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = false;
    placeholder.selected = true;
    placeholder.textContent = '';
    select.appendChild(placeholder);

    contribuicaoPensaoInstituidor.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.contribuicao;
      option.textContent = item.contribuicao;
      option.setAttribute('data-codigo', item.codigo);
      select.appendChild(option);
    });

    console.log('✅ Select de contribuição pensão populado');
  }
}

/**
 * 📦 Dados de fallback para contribuição pensão
 */
function obterFallbackContribuicaoPensao() {
  return [
    { id: 1, codigo: '1', contribuicao: '10,5% - Contribuição Integral' },
    { id: 2, codigo: '2', contribuicao: '1,5% - Contribuição Reduzida' },
    { id: 3, codigo: '3', contribuicao: 'Não contribui' },
  ];
}

/* ========================================================================
🧩 SEÇÃO 9: SISTEMA DE CARREGAMENTO - ADICIONAL DE HABILITAÇÃO
========================================================================= */

/**
 * 📊 Carregar dados do adicional de habilitação
 */
function carregarAdcHabilitacao() {
  console.log('📊 Iniciando carregamento do adicional de habilitação...');

  fetch(APIS.ADC_HABILITACAO)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      console.log('📡 Resposta da API ADC_HABILITACAO recebida');

      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      const rows = json.table.rows;
      adcHabilitacao = [];

      rows.forEach((row, index) => {
        const codigo = row.c[1]?.v; // Coluna COD (índice 1)
        const tipo = row.c[2]?.v; // Coluna TIPO (índice 2)
        const percentual2023 = row.c[7]?.v; // Coluna PERCENTUAL (ANO 2023) (índice 7)

        if (tipo && typeof tipo === 'string') {
          adcHabilitacao.push({
            id: index + 1,
            codigo: codigo ? String(codigo).trim() : '',
            tipo: tipo.trim(),
            percentual: percentual2023 ? parseFloat(percentual2023) : 0,
          });
        }
      });

      console.log(`✅ ${adcHabilitacao.length} tipos de adicional de habilitação carregados`);
      popularSelectAdcHabilitacao();
    })
    .catch((err) => {
      console.warn('⚠️ Erro ao carregar API ADC_HABILITACAO, usando fallback:', err);
      adcHabilitacao = obterFallbackAdcHabilitacao();
      popularSelectAdcHabilitacao();
    });
}

/**
 * 📋 Popular select de adicional de habilitação
 */
function popularSelectAdcHabilitacao() {
  const select = document.getElementById('adicionalHabilitacao');

  if (select) {
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = false;
    placeholder.selected = true;
    placeholder.textContent = 'Selecione o adicional de habilitação';
    select.appendChild(placeholder);

    adcHabilitacao.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.percentual;
      option.textContent = `${item.tipo} - ${item.percentual}%`;
      option.setAttribute('data-codigo', item.codigo);
      select.appendChild(option);
    });

    console.log('✅ Select de adicional de habilitação populado');
  }
}

/**
 * 📦 Dados de fallback para adicional de habilitação
 */
function obterFallbackAdcHabilitacao() {
  return [
    { id: 1, codigo: '1', tipo: 'Nível Superior', percentual: 30 },
    { id: 2, codigo: '2', tipo: 'Pós-Graduação', percentual: 15 },
    { id: 3, codigo: '3', tipo: 'Mestrado', percentual: 52 },
    { id: 4, codigo: '4', tipo: 'Doutorado', percentual: 75 },
  ];
}

/* ========================================================================
🧩 SEÇÃO 10: SISTEMA DE CARREGAMENTO - SVP REGIONAIS
========================================================================= */

/**
 * 📊 Carregar dados das SVP Regionais
 */
function carregarSVPR() {
  console.log('📊 Iniciando carregamento das SVP Regionais...');

  fetch(APIS.SVPR)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      console.log('📡 Resposta da API SVPR recebida');

      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      const rows = json.table.rows;
      svpR = [];

      rows.forEach((row, index) => {
        const codom = row.c[1]?.v; // Coluna CODOM (índice 1)
        const tipo = row.c[2]?.v; // Coluna TIPO (índice 2)
        const nome = row.c[3]?.v; // Coluna NOME (índice 3)
        const sigla = row.c[6]?.v; // Coluna SIGLA (índice 6)
        const cidade = row.c[9]?.v; // Coluna CIDADE (índice 9)
        const nomeUF = row.c[10]?.v; // Coluna NOME UF (índice 10)

        if (nome && typeof nome === 'string') {
          svpR.push({
            id: index + 1,
            codom: codom ? String(codom).trim() : '',
            tipo: tipo ? tipo.trim() : '',
            nome: nome.trim(),
            sigla: sigla ? sigla.trim() : '',
            cidade: cidade ? cidade.trim() : '',
            uf: nomeUF ? nomeUF.trim() : '',
          });
        }
      });

      console.log(`✅ ${svpR.length} SVP Regionais carregadas`);
      popularSelectSVPR();
    })
    .catch((err) => {
      console.warn('⚠️ Erro ao carregar API SVPR, usando fallback:', err);
      svpR = obterFallbackSVPR();
      popularSelectSVPR();
    });
}

/**
 * 📋 Popular select de SVP Regionais
 */
function popularSelectSVPR() {
  const select = document.getElementById('svpRegional');

  if (select) {
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = false;
    placeholder.selected = true;
    placeholder.textContent = 'Selecione a SVP Regional';
    select.appendChild(placeholder);

    // Agrupar por UF
    const svprPorUF = {};
    svpR.forEach((item) => {
      if (!svprPorUF[item.uf]) {
        svprPorUF[item.uf] = [];
      }
      svprPorUF[item.uf].push(item);
    });

    // Ordenar UFs alfabeticamente
    const ufsOrdenadas = Object.keys(svprPorUF).sort();

    ufsOrdenadas.forEach((uf) => {
      // Cabeçalho da UF
      const cabecalho = document.createElement('option');
      cabecalho.disabled = true;
      cabecalho.textContent = `▼ ${uf}`;
      cabecalho.style.fontWeight = 'bold';
      select.appendChild(cabecalho);

      // SVPs da UF
      svprPorUF[uf].forEach((item) => {
        const option = document.createElement('option');
        option.value = item.sigla;
        option.textContent = `${item.sigla} - ${item.cidade}`;
        option.setAttribute('data-codom', item.codom);
        option.setAttribute('data-nome', item.nome);
        select.appendChild(option);
      });
    });

    console.log('✅ Select de SVP Regionais populado');
  }
}

/**
 * 📦 Dados de fallback para SVP Regionais
 */
function obterFallbackSVPR() {
  return [
    {
      id: 1,
      codom: '1',
      tipo: 'SVP',
      nome: 'Seção de Veteranos e Pensionistas de Brasília',
      sigla: 'SVP/1ªRM',
      cidade: 'Brasília',
      uf: 'Distrito Federal',
    },
    {
      id: 2,
      codom: '2',
      tipo: 'SVP',
      nome: 'Seção de Veteranos e Pensionistas de São Paulo',
      sigla: 'SVP/2ªRM',
      cidade: 'São Paulo',
      uf: 'São Paulo',
    },
    {
      id: 3,
      codom: '3',
      tipo: 'SVP',
      nome: 'Seção de Veteranos e Pensionistas do Rio de Janeiro',
      sigla: 'SVP/3ªRM',
      cidade: 'Rio de Janeiro',
      uf: 'Rio de Janeiro',
    },
  ];
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|  🧩 SEÇÃO 11: SISTEMA DE CARREGAMENTO DE DADOS - ÓRGÃOS
|  Carregar os dados dos orgaos da planilha Google Sheets e Dado Local (offline)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * 📊 Carregar dados dos orgaos/SVPR e SVPGu da API
 *
 * Descrição:
 * Faz requisição para Google Sheets e popula os selects HTML com os dados
 * dos Órgãos e SVP Regionais e SVPGu Guarnição. Em caso de falha, utiliza dados locais
 * (fallback) para garantir funcionamento offline.
 *
 * Fluxo de execução:
 * 1. Exibe notificação de carregamento
 * 2. Faz requisição HTTP para API do Google Sheets
 * 3. Processa resposta em formato JSONP
 * 4. Extrai e estrutura os dados dos órgaos
 * 5. Popula os elementos select do formulário
 * 6. Em caso de erro, carrega dados locais de fallback
 *
 * @throws {Error} Em caso de falha na requisição HTTP
 */

/**
 * 📊 Carregar dados dos orgaos da API
 */

function carregarDadosOrgao() {
  console.log('📊 Iniciando carregamento de orgaos...');
  mostrarNotificacao('Carregando dados dos orgaos...', 'info');

  // Fazer requisição HTTP para a API do Google Sheets
  fetch(APIS.ORGAO)
    .then((res) => {
      // Verificar se a resposta HTTP foi bem-sucedida (status 200-299)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text(); // Converter resposta para texto (formato JSONP do Google Sheets)
    })
    .then((text) => {
      console.log('📡 Resposta da API ORGAO recebida');

      // Processar formato JSONP do Google Sheets
      // Remove os wrappers do JSONP: /*O_o*/ e google.visualization.Query.setResponse(...)
      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      // Extrair linhas de dados da tabela retornada pela API
      const rows = json.table.rows;
      dadosOrgao = []; // Limpar array global para novos dados

      // Processar cada linha retornada pela API
      rows.forEach((row, index) => {
        // Extrair valores de cada coluna da planilha
        // Estrutura: row.c[índice]?.v (c = cells, v = value)
        const id = row.c[0]?.v; // Coluna A: ID (Identificador Sequenciado)
        const codom = row.c[1]?.v; // Coluna B: COD (codom do Órgão)
        const categoria = row.c[2]?.v; // Coluna C: CATEGORIA (SVPR ou SVPGu)
        const nome = row.c[3]?.v; // Coluna D: NOME COMPLETO do Órgão
        const sigla = row.c[4]?.v; // Coluna E: SIGLA (abreviatura do nome do Órgão)
        const cidade = row.c[5]?.v; // Coluna F: CIDADE (cidade do Órgão)
        const nomeUF = row.c[6]?.v; // Coluna G: NOME COMPLETO da UF
        const siglaUF = row.c[7]?.v; // Coluna H: UF (sigla da UF)
        const rmdevinculacao = row.c[8]?.v; // Coluna I: REGIÃO MILITAR (vinculação RM)

        // Verificar se existe descrição válida antes de adicionar ao array
        // Evita adicionar linhas vazias ou inválidas da planilha
        if (nome && typeof nome === 'string') {
          dadosOrgao.push({
            id: id || index + 1, // ID sequencial (usar índice se não vier da API)
            codom: codom ? String(codom).trim() : '',
            categoria: categoria ? categoria.trim() : '',
            nome: nome.trim(),
            sigla: sigla ? sigla.trim() : '',
            cidade: cidade ? cidade.trim() : '',
            nomeUF: nomeUF ? nomeUF.trim() : '',
            siglaUF: siglaUF ? siglaUF.trim() : '', // Sigla da UF
            rmdevinculacao: rmdevinculacao ? rmdevinculacao.trim() : '', // Região Militar
          });
        }
      });

      console.log(`✅ ${dadosOrgao.length} Órgãos carregados da API com sucesso`);

      // Popular os elementos <select> HTML com os dados carregados
      popularSelectsOrgao();

      // Exibe notificação de sucesso após 1 segundo
      // (delay para não sobrepor a notificação anterior de "Carregando...")
      setTimeout(() => {
        mostrarNotificacao(`${dadosOrgao.length} Órgãos carregados!`, 'sucesso');
      }, 1000);
    })
    .catch((err) => {
      // Captura qualquer erro durante o processo de carregamento da API
      // Possíveis erros: falha de rede, timeout, CORS, API indisponível, etc.
      console.warn('⚠️ Erro ao carregar dados da API ÓRGÃO, usando fallback:', err);

      // Em caso de erro, usar dados de fallback (offline)
      // Garante funcionamento mesmo sem conexão com internet
      dadosOrgao = obterFallbackOrgao(); // Carregar dados locais estáticos
      popularSelectsOrgao(); // Popular selects com dados offline

      // Notificar usuário sobre uso de dados offline
      mostrarNotificacao('Dados offline carregados. Verifique sua conexão.', 'info');
    });
}

/**
 * 🏷️ Determinar categoria dos Órgãos
 *
 * Descrição:
 * Classifica um órgão militar como "SVPR" (SVP Regionais) ou "SVPGu" (SVP de Guarnições).
 * A classificação segue a hierarquia militar brasileira onde:
 * - SVPR: SVP Regionais
 * - SVPGu: SVP de Guarnições
 *
 * Hierarquia completa:
 * SVPR: COMANDO DA 1ª REGIÃO MILITAR → COMANDO DA 2ª REGIÃO MILITAR → COMANDO DA 3ª REGIÃO MILITAR → COMANDO DA 4ª REGIÃO MILITAR → COMANDO DA 5ª REGIÃO MILITAR → COMANDO DA 6ª REGIÃO MILITAR → COMANDO DA 7ª REGIÃO MILITAR → COMANDO DA 8ª REGIÃO MILITAR → COMANDO DA 9ª REGIÃO MILITAR → COMANDO DA 10ª REGIÃO MILITAR → COMANDO DA 11ª REGIÃO MILITAR → COMANDO DA 12ª REGIÃO MILITAR
 * SVPGU: Todas as outros órgão exceto SVPR
 *
 * @param {string} orgao - Nome completo do orgao a ser classificado
 * @returns {string} "SVPR" (Regiões Militares) ou "SVPGu" (Guarnição Militar)
 */
function determinarCategoria(orgao) {
  // Converter para maiúsculas para comparação case-insensitive
  const orgaoUpper = orgao.toUpperCase();

  // Array com todos os SVPR (Regiões Militares) reconhecidos
  // Ordenados do mais alto (General de Exército) ao mais baixo (Aspirante-a-Oficial)
  const svpr = [
    'COMANDO DA 1ª REGIÃO MILITAR', // Maior
    'COMANDO DA 2ª REGIÃO MILITAR', //
    'COMANDO DA 3ª REGIÃO MILITAR', //
    'COMANDO DA 4ª REGIÃO MILITAR', //
    'COMANDO DA 5ª REGIÃO MILITAR', //
    'COMANDO DA 6ª REGIÃO MILITAR', //
    'COMANDO DA 7ª REGIÃO MILITAR', //
    'COMANDO DA 8ª REGIÃO MILITAR', //
    'COMANDO DA 9ª REGIÃO MILITAR', //
    'COMANDO DA 10ª REGIÃO MILITAR', //
    'COMANDO DA 11ª REGIÃO MILITAR', //
    'COMANDO DA 12ª REGIÃO MILITAR', // Menor
  ];

  // Array com todas algumas Guarnições reconhecidas
  const svpgu = [
    // GUARNIÇÕES RECONHECIDAS
    '1º ESQUADRÃO DE CAVALARIA LEVE', //
    '9ª BATERIA DE ARTILHARIA ANTIAÉREA (ESCOLA)', //
    '2ª COMPANHIA DE INFANTARIA', //
    '32º BATALHÃO DE INFANTARIA LEVE-MONTANHA', //
    '38º BATALHÃO DE INFANTARIA', //
    'ACADEMIA MILITAR DAS AGULHAS NEGRAS', //
  ];

  // Verificar se o orgao corresponde a alguma SVPR reconhecida
  // Usa some() com includes() para permitir variações no nome
  if (svpr.some((svpr) => orgaoUpper.includes(svpr))) {
    return 'SVPR';
  }

  // Verificar se corresponde a alguma graduação específica da lista
  if (svpgu.some((svpgu) => orgaoUpper.includes(svpgu))) {
    return 'SVPGu';
  }

  // Para todos os outros casos não listados explicitamente
  // Por padrão, considera como "Graduação"
  return 'SVPGu';
}
/**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| SISTEMA 11.1: POPULAR SELECTS ORGAO (SVP VINCULAÇÃO, SVPR, SVPGU)                 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
*/

/**
 * 📋 Popular selects popularSelectOrgao com as SVPR e SVPGU
 *
 * Descrição:
 * Insere opções nos elementos <select> HTML organizadas por categoria.
 * Cria uma estrutura hierárquica visual com:
 * - Placeholder inicial
 * - Cabeçalhos de categoria (▼ SVPR / ▼ SVPGU)
 * - Separadores visuais entre categorias
 * - Opções ordenadas alfabeticamente dentro de cada categoria
 *
 * IDs dos selects processados:
 * - SVPR/SVPGu de vinculação
 *
 * Estrutura de cada option:
 * - value:
 *
 */

function popularSelectOrgao() {
  // IDs dos elementos <select> que serão populados com os dados da tabela órgão
  const selects = ['svpVinculacao', 'svpOrgao', 'orgaoSVPR', 'orgaoSVPGu'];
  let selectsPopulados = 0; // Contador para log de sucesso

  // Processar cada select individualmente
  selects.forEach((selectId) => {
    const select = document.getElementById(selectId);

    // Verificar se o elemento existe no DOM antes de processar
    if (select) {
      // Preservar o texto do placeholder original se existir
      const placeholderExistente = select.querySelector('option[value=""]:first-child');
      const placeholderText = placeholderExistente ? placeholderExistente.textContent : 'Selecione o SVPR/SVPGu';

      // Limpar completamente o conteúdo do select
      select.innerHTML = '';

      // Criar e adicionar opção placeholder (opção vazia padrão)
      const placeholderOption = document.createElement('option');
      placeholderOption.value = ''; // Valor vazio
      placeholderOption.disabled = false; // Permite selecionar para limpar escolha
      placeholderOption.selected = true; // Selecionado por padrão
      placeholderOption.textContent = placeholderText; // Texto do placeholder
      select.appendChild(placeholderOption);

      // Ordenar dados por categoria e alfabeticamente
      // Primeiro agrupa por categoria (SVPR aparecem antes das SVPGu)
      // Depois ordena alfabeticamente dentro de cada categoria
      const orgaoOrdenados = dadosOrgao.sort((a, b) => {
        // Primeiro critério: categoria
        if (a.categoria !== b.categoria) {
          return a.categoria === 'SVPR' ? -1 : 1; // SVPR primeiro, SVPGu depois
        }
        // Segundo critério: ordem alfabética (considera acentuação)
        return a.orgao.localeCompare(b.orgao);
      });

      let categoriaAtual = ''; // Controle para detectar mudança de categoria

      // Inserir opções com separadores e cabeçalhos de categoria
      orgaoOrdenados.forEach((orgao) => {
        // Detectar mudança de categoria e adicionar elementos visuais
        if (orgao.categoria !== categoriaAtual) {
          // Adicionar separador visual se não for a primeira categoria
          if (categoriaAtual !== '') {
            const separador = document.createElement('option');
            separador.disabled = true; // Não selecionável
            separador.textContent = '─────────────────────'; // Linha visual
            select.appendChild(separador);
          }

          // Adicionar cabeçalho da categoria
          const cabecalho = document.createElement('option');
          cabecalho.disabled = true; // Não selecionável
          cabecalho.textContent = orgao.categoria === 'Órgãos' ? '▼ SVPR' : '▼ SVPGu';
          cabecalho.style.fontWeight = 'bold'; // Destaque visual
          select.appendChild(cabecalho);

          categoriaAtual = orgao.categoria; // Atualizar categoria atual
        }

        // Criar option do posto/graduação com todos os dados
        const option = document.createElement('option');
        option.value = orgao.orgao; // Valor usado em formulários
        option.textContent = orgao.orgao; // Texto visível para o usuário

        // Adicionar todos os dados como atributos data-* para acesso via JavaScript
        option.setAttribute('data-id', orgao.id || ''); // ID sequencia
        option.setAttribute('data-categoria', orgao.categoria); // Categoria (SVPR ou SVPGu)
        option.setAttribute('data-codom', orgao.codom || ''); // Codom
        option.setAttribute('data-nome', orgao.nome || ''); // Nome Completo do Órgão
        option.setAttribute('data-sigla', orgao.sigla || ''); // Sigla do Órgão
        option.setAttribute('data-cidade', orgao.cidade || ''); // Cidade do Órgão
        option.setAttribute('data-nomeUF', orgao.nomeUF || ''); // Nome Completo da UF do Órgão
        option.setAttribute('data-siglaUF', orgao.siglaUF || ''); // Sigla da UF do Órgão
        option.setAttribute('data-rmdevinculacao', orgao.rmdevinculacao || ''); // Sigla da RM de Vinculação

        select.appendChild(option);
      });

      selectsPopulados++;
      console.log(`✅ Select ${selectId} populado com ${dadosOrgao.length} opções`);
    } else {
      console.warn(`⚠️ Select #${selectId} não encontrado no DOM`);
    }
  });

  console.log(`📋 ${selectsPopulados} de ${selects.length} selects de postos populados com sucesso`);
}

/**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| SISTEMA 11.2: POPULAR SELECTS DADOS DE FALBACK (SVP VINCULAÇÃO, SVPR, SVPGU)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
*/
/**
 * 📦 Dados de fallback para órgãos
 */
function obterFallbackOrgaos() {
  return [
    {
      id: 1,
      codom: '023176',
      categoria: 'SVPR',
      nome: 'COMANDO DA 1ª REGIÃO MILITAR',
      sigla: 'CMDO 1ª RM',
      cidade: 'RIO DE JANEIRO',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 2,
      codom: '049916',
      categoria: 'SVPGu',
      nome: '1º ESQUADRÃO DE CAVALARIA LEVE',
      sigla: '1º ESQD C L',
      cidade: 'VALENÇA',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 3,
      codom: '013094',
      categoria: 'SVPGu',
      nome: '9ª BATERIA DE ARTILHARIA ANTIAÉREA (ESCOLA)',
      sigla: '9ª BIA AAAE (ES)',
      cidade: 'MACAÉ',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 4,
      codom: '036236',
      categoria: 'SVPGu',
      nome: '2ª COMPANHIA DE INFANTARIA',
      sigla: '2ª CIA INF',
      cidade: 'CAMPOS DOS GOYTACAZES',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 5,
      codom: '008474',
      categoria: 'SVPGu',
      nome: '32º BATALHÃO DE INFANTARIA LEVE-MONTANHA',
      sigla: '32º BIL-MTH',
      cidade: 'PETRÓPOLIS',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 6,
      codom: '006106',
      categoria: 'SVPGu',
      nome: '38º BATALHÃO DE INFANTARIA',
      sigla: '38º BI',
      cidade: 'VILA VELHA',
      nomeUF: 'ESPÍRITO SANTO',
      siglaUF: 'ES',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 7,
      codom: '000109',
      categoria: 'SVPGu',
      nome: 'ACADEMIA MILITAR DAS AGULHAS NEGRAS',
      sigla: 'AMAN',
      cidade: 'RESENDE',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 8,
      codom: '021113',
      categoria: 'SVPGu',
      nome: 'COMANDO DA ARTILHARIA DIVISIONÁRIA DA 1ª DIVISÃO DE EXÉRCITO',
      sigla: 'CMDO AD/1',
      cidade: 'NITERÓI',
      nomeUF: 'RIO DE JANEIRO',
      siglaUF: 'RJ',
      rmdevinculacao: '1ª RM',
    },
    {
      id: 9,
      codom: '023572',
      categoria: 'SVPR',
      nome: 'COMANDO DA 2ª REGIÃO MILITAR',
      sigla: 'CMDO 2ª RM',
      cidade: 'SÃO PAULO',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 10,
      codom: '024729',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 11ª BRIGADA DE INFANTARIA MECANIZADA',
      sigla: 'CMDO 11ª BDA INF MEC',
      cidade: 'CAMPINAS',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 11,
      codom: '030874',
      categoria: 'SVPGu',
      nome: 'COMPANHIA DE COMANDO DA 12ª BRIGADA DE INFANTARIA LEVE (AEROMÓVEL)',
      sigla: 'CIA C 12ª BDA INF L (AMV)',
      cidade: 'CAÇAPAVA',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 12,
      codom: '001115',
      categoria: 'SVPGu',
      nome: 'BASE DE AVIAÇÃO DE TAUBATÉ',
      sigla: 'BA AV TAUBATÉ',
      cidade: 'TAUBATÉ',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 13,
      codom: '001461',
      categoria: 'SVPGu',
      nome: 'BASE DE APOIO REGIONAL DE RIBEIRÃO PRETO',
      sigla: 'B AP R RIBEIRÃO PRETO',
      cidade: 'RIBEIRÃO PRETO',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 14,
      codom: '001479',
      categoria: 'SVPGu',
      nome: 'BASE DE APOIO REGIONAL DE BAURU',
      sigla: 'B AP R BAURU',
      cidade: 'BAURU',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 15,
      codom: '001453',
      categoria: 'SVPGu',
      nome: 'BASE DE APOIO REGIONAL DE SOROCABA',
      sigla: 'B AP R SOROCABA',
      cidade: 'SOROCABA',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 16,
      codom: '007286',
      categoria: 'SVPGu',
      nome: '2º BATALHÃO DE INFANTARIA LEVE',
      sigla: '2º BIL',
      cidade: 'SÃO VICENTE',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 17,
      codom: '007260',
      categoria: 'SVPGu',
      nome: '5º BATALHÃO DE INFANTARIA LEVE',
      sigla: '5º BIL',
      cidade: 'LORENA',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 18,
      codom: '007427',
      categoria: 'SVPGu',
      nome: '37º BATALHÃO DE INFANTARIA MECANIZADO',
      sigla: '37º BI MEC',
      cidade: 'LINS',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 19,
      codom: '070722',
      categoria: 'SVPGu',
      nome: '13º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '13º RC MEC',
      cidade: 'PIRASSUNUNGA',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 20,
      codom: '055590',
      categoria: 'SVPGu',
      nome: '2º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '2º GAC',
      cidade: 'ITU',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 21,
      codom: '056002',
      categoria: 'SVPGu',
      nome: '12º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '12º GAC',
      cidade: 'JUNDIAÍ',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 22,
      codom: '002501',
      categoria: 'SVPGu',
      nome: '2º BATALHÃO DE ENGENHARIA DE COMBATE',
      sigla: '2º BE CMB',
      cidade: 'PINDAMONHANGABA',
      nomeUF: 'SÃO PAULO',
      siglaUF: 'SP',
      rmdevinculacao: '2ª RM',
    },
    {
      id: 23,
      codom: '023879',
      categoria: 'SVPR',
      nome: 'COMANDO DA 3ª REGIÃO MILITAR',
      sigla: 'CMDO 3ª RM',
      cidade: 'PORTO ALEGRE',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 24,
      codom: '022806',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 1ª BRIGADA DE CAVALARIA MECANIZADA',
      sigla: 'CMDO 1ª BDA C MEC',
      cidade: 'SANTIAGO',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 25,
      codom: '001388',
      categoria: 'SVPGu',
      nome: 'BASE ADMINISTRATIVA DA GUARNIÇÃO DE SANTA MARIA',
      sigla: 'B ADM GU SM',
      cidade: 'SANTA MARIA',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 26,
      codom: '002022',
      categoria: 'SVPGu',
      nome: '1º BATALHÃO DE COMUNICAÇÕES',
      sigla: '1º B COM',
      cidade: 'SANTO ÂNGELO',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 27,
      codom: '006718',
      categoria: 'SVPGu',
      nome: '7º BATALHÃO DE INFANTARIA BLINDADO',
      sigla: '7º BIB',
      cidade: 'SANTA CRUZ DO SUL',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 28,
      codom: '024505',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 8ª BRIGADA DE INFANTARIA MOTORIZADA',
      sigla: 'CMDO 8ª BDA INF MTZ',
      cidade: 'PELOTAS',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 29,
      codom: '069005',
      categoria: 'SVPGu',
      nome: '4º REGIMENTO DE CARROS DE COMBATE',
      sigla: '4º RCC',
      cidade: 'ROSÁRIO DO SUL',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 30,
      codom: '069708',
      categoria: 'SVPGu',
      nome: '4º REGIMENTO DE CAVALARIA BLINDADO',
      sigla: '4º RCB',
      cidade: 'SÃO LUIZ GONZAGA',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 31,
      codom: '069906',
      categoria: 'SVPGu',
      nome: '9º REGIMENTO DE CAVALARIA BLINDADO',
      sigla: '9º RCB',
      cidade: 'SÃO GABRIEL',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 32,
      codom: '070201',
      categoria: 'SVPGu',
      nome: '1º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '1º RC MEC',
      cidade: 'ITAQUI',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 33,
      codom: '070300',
      categoria: 'SVPGu',
      nome: '2º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '2º RC MEC',
      cidade: 'SÃO BORJA',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 34,
      codom: '070458',
      categoria: 'SVPGu',
      nome: '5º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '5º RC MEC',
      cidade: 'QUARAÍ',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 35,
      codom: '070508',
      categoria: 'SVPGu',
      nome: '7º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '7º RC MEC',
      cidade: 'SANTANA DO LIVRAMENTO',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 36,
      codom: '023200',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 2ª BRIGADA DE CAVALARIA MECANIZADA',
      sigla: 'CMDO 2ª BDA C MEC',
      cidade: 'URUGUAIANA',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 37,
      codom: '070714',
      categoria: 'SVPGu',
      nome: '12º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '12º RC MEC',
      cidade: 'JAGUARÃO',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 38,
      codom: '071035',
      categoria: 'SVPGu',
      nome: '19º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '19º RC MEC',
      cidade: 'SANTA ROSA',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 39,
      codom: '055509',
      categoria: 'SVPGu',
      nome: '3º GRUPO DE ARTILHARIA ANTIAÉREA',
      sigla: '3º GAAAE',
      cidade: 'CAXIAS DO SUL',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 40,
      codom: '055707',
      categoria: 'SVPGu',
      nome: '6º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '6º GAC',
      cidade: 'RIO GRANDE',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 41,
      codom: '057208',
      categoria: 'SVPGu',
      nome: '27º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '27º GAC',
      cidade: 'IJUÍ',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 42,
      codom: '021303',
      categoria: 'SVPGu',
      nome: 'COMANDO DA ARTILHARIA DIVISIONÁRIA DA 3ª DIVISÃO DE EXÉRCITO',
      sigla: 'CMDO AD/3',
      cidade: 'CRUZ ALTA',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 43,
      codom: '002600',
      categoria: 'SVPGu',
      nome: '3º BATALHÃO DE ENGENHARIA DE COMBATE',
      sigla: '3º BE CMB',
      cidade: 'CACHOEIRA DO SUL',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 44,
      codom: '004234',
      categoria: 'SVPGu',
      nome: '12º BATALHÃO DE ENGENHARIA DE COMBATE BLINDADO',
      sigla: '12º BE CMB BLD',
      cidade: 'ALEGRETE',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 45,
      codom: '034876',
      categoria: 'SVPGu',
      nome: '3ª COMPANHIA DE ENGENHARIA DE COMBATE MECANIZADA',
      sigla: '3ª CIA E CMB MEC',
      cidade: 'DOM PEDRITO',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 46,
      codom: '002055',
      categoria: 'SVPGu',
      nome: '6º BATALHÃO DE COMUNICAÇÕES',
      sigla: '6º B COM',
      cidade: 'BENTO GONÇALVES',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 47,
      codom: '023606',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 3ª BRIGADA DE CAVALARIA MECANIZADA',
      sigla: 'CMDO 3ª BDA C MEC',
      cidade: 'BAGÉ',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 48,
      codom: '008003',
      categoria: 'SVPGu',
      nome: '19º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: '19º BI MTZ',
      cidade: 'SÃO LEOPOLDO',
      nomeUF: 'RIO GRANDE DO SUL',
      siglaUF: 'RS',
      rmdevinculacao: '3ª RM',
    },
    {
      id: 49,
      codom: '024927',
      categoria: 'SVPR',
      nome: 'COMANDO DA 4ª REGIÃO MILITAR',
      sigla: 'CMDO 4ª RM',
      cidade: 'BELO HORIZONTE',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 50,
      codom: '024778',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 4ª BRIGADA DE INFANTARIA LEVE-MONTANHA',
      sigla: 'CMDO 4ª BDA INF L-MTH',
      cidade: 'JUIZ DE FORA',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 51,
      codom: '049502',
      categoria: 'SVPGu',
      nome: 'ESCOLA DE SARGENTOS DAS ARMAS',
      sigla: 'ESA',
      cidade: 'TRÊS CORAÇÕES',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 52,
      codom: '056200',
      categoria: 'SVPGu',
      nome: '14º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '14º GAC',
      cidade: 'POUSO ALEGRE',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 53,
      codom: '002709',
      categoria: 'SVPGu',
      nome: '4º BATALHÃO DE ENGENHARIA DE COMBATE',
      sigla: '4º BE CMB',
      cidade: 'ITAJUBÁ',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 54,
      codom: '007229',
      categoria: 'SVPGu',
      nome: '11º BATALHÃO DE INFANTARIA DE MONTANHA',
      sigla: '11º BI MTH',
      cidade: 'SÃO JOÃO DEL-REI',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 55,
      codom: '006213',
      categoria: 'SVPGu',
      nome: '55º BATALHÃO DE INFANTARIA',
      sigla: '55º BI',
      cidade: 'MONTES CLAROS',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '4ª RM',
    },
    {
      id: 56,
      codom: '024992',
      categoria: 'SVPR',
      nome: 'COMANDO DA 5ª REGIÃO MILITAR',
      sigla: 'CMDO 5ª RM',
      cidade: 'CURITIBA',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 57,
      codom: '069104',
      categoria: 'SVPGu',
      nome: '5º REGIMENTO DE CARROS DE COMBATE',
      sigla: '5º RCC',
      cidade: 'RIO NEGRO',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 58,
      codom: '070813',
      categoria: 'SVPGu',
      nome: '14º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '14º RC MEC',
      cidade: 'SÃO MIGUEL DO OESTE',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 59,
      codom: '004184',
      categoria: 'SVPGu',
      nome: '5º BATALHÃO DE ENGENHARIA DE COMBATE BLINDADO',
      sigla: '5º BE CMB BLD',
      cidade: 'PORTO UNIÃO',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 60,
      codom: '004416',
      categoria: 'SVPGu',
      nome: '1º BATALHÃO FERROVIÁRIO',
      sigla: '1º B FV',
      cidade: 'LAGES',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 61,
      codom: '005801',
      categoria: 'SVPGu',
      nome: '23º BATALHÃO DE INFANTARIA',
      sigla: '23º BI',
      cidade: 'BLUMENAU',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 62,
      codom: '006403',
      categoria: 'SVPGu',
      nome: '62º BATALHÃO DE INFANTARIA',
      sigla: '62º BI',
      cidade: 'JOINVILLE',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 63,
      codom: '006809',
      categoria: 'SVPGu',
      nome: '13º BATALHÃO DE INFANTARIA BLINDADO',
      sigla: '13º BIB',
      cidade: 'PONTA GROSSA',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 64,
      codom: '008318',
      categoria: 'SVPGu',
      nome: '30° BATALHÃO DE INFANTARIA MECANIZADO',
      sigla: '30º BI MEC',
      cidade: 'APUCARANA',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 65,
      codom: '008524',
      categoria: 'SVPGu',
      nome: '34° BATALHÃO DE INFANTARIA MECANIZADO',
      sigla: '34º BI MEC',
      cidade: 'FOZ DO IGUAÇU',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 66,
      codom: '030940',
      categoria: 'SVPGu',
      nome: 'COMPANHIA DE COMANDO DA 14ª BRIGADA DE INFANTARIA MOTORIZADA',
      sigla: 'CIA C 14ª BDA INF MTZ',
      cidade: 'FLORIANÓPOLIS',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 67,
      codom: '031013',
      categoria: 'SVPGu',
      nome: 'COMPANHIA DE COMANDO DA 15ª BRIGADA DE INFANTARIA MECANIZADA',
      sigla: 'CIA C 15ª BDA INF MEC',
      cidade: 'CASCAVEL',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 68,
      codom: '034934',
      categoria: 'SVPGu',
      nome: '15ª COMPANHIA DE ENGENHARIA DE COMBATE MECANIZADA',
      sigla: '15ª CIA E CMB MEC',
      cidade: 'PALMAS',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 69,
      codom: '036467',
      categoria: 'SVPGu',
      nome: '14ª COMPANHIA DE ENGENHARIA DE COMBATE',
      sigla: '14ª CIA E CMB',
      cidade: 'TUBARÃO',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 70,
      codom: '050385',
      categoria: 'SVPGu',
      nome: '16º ESQUADRÃO DE CAVALARIA MECANIZADO',
      sigla: '16º ESQD C MEC',
      cidade: 'FRANCISCO BELTRÃO',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 71,
      codom: '036731',
      categoria: 'SVPGu',
      nome: '15ª COMPANHIA DE INFANTARIA MOTORIZADA',
      sigla: '15ª CIA INF MTZ',
      cidade: 'GUAÍRA',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 72,
      codom: '056309',
      categoria: 'SVPGu',
      nome: '15º GRUPO DE ARTILHARIA DE CAMPANHA AUTOPROPULSADO',
      sigla: '15º GAC AP',
      cidade: 'LAPA',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 73,
      codom: '057109',
      categoria: 'SVPGu',
      nome: '26º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '26º GAC',
      cidade: 'GUARAPUAVA',
      nomeUF: 'PARANÁ',
      siglaUF: 'PR',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 74,
      codom: '057315',
      categoria: 'SVPGu',
      nome: '28º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '28º GAC',
      cidade: 'CRICIÚMA',
      nomeUF: 'SANTA CATARINA',
      siglaUF: 'SC',
      rmdevinculacao: '5ª RM',
    },
    {
      id: 75,
      codom: '024372',
      categoria: 'SVPR',
      nome: 'COMANDO DA 6ª REGIÃO MILITAR',
      sigla: 'CMDO 6ª RM',
      cidade: 'SALVADOR',
      nomeUF: 'BAHIA',
      siglaUF: 'BA',
      rmdevinculacao: '6ª RM',
    },
    {
      id: 76,
      codom: '003608',
      categoria: 'SVPGu',
      nome: '4º BATALHÃO DE ENGENHARIA DE CONSTRUÇÃO',
      sigla: '4º BEC',
      cidade: 'BARREIRAS',
      nomeUF: 'BAHIA',
      siglaUF: 'BA',
      rmdevinculacao: '6ª RM',
    },
    {
      id: 77,
      codom: '006007',
      categoria: 'SVPGu',
      nome: '35º BATALHÃO DE INFANTARIA',
      sigla: '35º BI',
      cidade: 'FEIRA DE SANTANA',
      nomeUF: 'BAHIA',
      siglaUF: 'BA',
      rmdevinculacao: '6ª RM',
    },
    {
      id: 78,
      codom: '001800',
      categoria: 'SVPGu',
      nome: '28º BATALHÃO DE CAÇADORES',
      sigla: '28º BC',
      cidade: 'ARACAJU',
      nomeUF: 'SERGIPE',
      siglaUF: 'SE',
      rmdevinculacao: '6ª RM',
    },
    {
      id: 79,
      codom: '036202',
      categoria: 'SVPGu',
      nome: '1ª COMPANHIA DE INFANTARIA',
      sigla: '1ª CIA INF',
      cidade: 'PAULO AFONSO',
      nomeUF: 'BAHIA',
      siglaUF: 'BA',
      rmdevinculacao: '6ª RM',
    },
    {
      id: 80,
      codom: '025098',
      categoria: 'SVPR',
      nome: 'COMANDO DA 7ª REGIÃO MILITAR',
      sigla: 'CMDO 7ª RM',
      cidade: 'RECIFE',
      nomeUF: 'PERNAMBUCO',
      siglaUF: 'PE',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 81,
      codom: '009209',
      categoria: 'SVPGu',
      nome: '59º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: '59º BI MTZ',
      cidade: 'MACEIÓ',
      nomeUF: 'ALAGOAS',
      siglaUF: 'AL',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 82,
      codom: '001412',
      categoria: 'SVPGu',
      nome: 'BASE ADMINISTRATIVA DA GUARNIÇÃO DE JOÃO PESSOA',
      sigla: 'B ADM GU JOÃO PESSOA',
      cidade: 'JOÃO PESSOA',
      nomeUF: 'PARAÍBA',
      siglaUF: 'PB',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 83,
      codom: '001420',
      categoria: 'SVPGu',
      nome: 'BASE ADMINISTRATIVA DA GUARNIÇÃO DE NATAL',
      sigla: 'B ADM GU NATAL',
      cidade: 'NATAL',
      nomeUF: 'RIO GRANDE DO NORTE',
      siglaUF: 'RN',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 84,
      codom: '008417',
      categoria: 'SVPGu',
      nome: '31º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: '31º BI MTZ',
      cidade: 'CAMPINA GRANDE',
      nomeUF: 'PARAÍBA',
      siglaUF: 'PB',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 85,
      codom: '009407',
      categoria: 'SVPGu',
      nome: '71º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: '71º BI MTZ',
      cidade: 'GARANHUNS',
      nomeUF: 'PERNAMBUCO',
      siglaUF: 'PE',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 86,
      codom: '009423',
      categoria: 'SVPGu',
      nome: '72º BATALHÃO DE INFANTARIA DE CAATINGA',
      sigla: '72º BI CAAT',
      cidade: 'PETROLINA',
      nomeUF: 'PERNAMBUCO',
      siglaUF: 'PE',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 87,
      codom: '003319',
      categoria: 'SVPGu',
      nome: '1º BATALHÃO DE ENGENHARIA DE CONSTRUÇÃO',
      sigla: '1º BEC',
      cidade: 'CAICÓ',
      nomeUF: 'RIO GRANDE DO NORTE',
      siglaUF: 'RN',
      rmdevinculacao: '7ª RM',
    },
    {
      id: 88,
      codom: '025148',
      categoria: 'SVPR',
      nome: 'COMANDO DA 8ª REGIÃO MILITAR',
      sigla: 'CMDO 8ª RM',
      cidade: 'BELÉM',
      nomeUF: 'PARÁ',
      siglaUF: 'PA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 89,
      codom: '010207',
      categoria: 'SVPGu',
      nome: '50º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: '50º BIS',
      cidade: 'IMPERATRIZ',
      nomeUF: 'MARANHÃO',
      siglaUF: 'MA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 90,
      codom: '010306',
      categoria: 'SVPGu',
      nome: '51º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: '51º BIS',
      cidade: 'ALTAMIRA',
      nomeUF: 'PARÁ',
      siglaUF: 'PA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 91,
      codom: '024885',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 23ª BRIGADA DE INFANTARIA DE SELVA',
      sigla: 'CMDO 23ª BDA INF SL',
      cidade: 'MARABÁ',
      nomeUF: 'PARÁ',
      siglaUF: 'PA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 92,
      codom: '010504',
      categoria: 'SVPGu',
      nome: '53º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: '53º BIS',
      cidade: 'ITAITUBA',
      nomeUF: 'PARÁ',
      siglaUF: 'PA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 93,
      codom: '004002',
      categoria: 'SVPGu',
      nome: '8º BATALHÃO DE ENGENHARIA DE CONSTRUÇÃO',
      sigla: '8º BEC',
      cidade: 'SANTARÉM',
      nomeUF: 'PARÁ',
      siglaUF: 'PA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 94,
      codom: '024646',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 22ª BRIGADA DE INFANTARIA DE SELVA',
      sigla: 'CMDO 22ª BDA INF SL',
      cidade: 'MACAPÁ',
      nomeUF: 'AMAPÁ',
      siglaUF: 'AP',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 95,
      codom: '010199',
      categoria: 'SVPGu',
      nome: '24º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: '24º BIS',
      cidade: 'SÃO LUÍS',
      nomeUF: 'MARANHÃO',
      siglaUF: 'MA',
      rmdevinculacao: '8ª RM',
    },
    {
      id: 96,
      codom: '025213',
      categoria: 'SVPR',
      nome: 'COMANDO DA 9ª REGIÃO MILITAR',
      sigla: 'CMDO 9ª RM',
      cidade: 'CAMPO GRANDE',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 97,
      codom: '023887',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 4ª BRIGADA DE CAVALARIA MECANIZADA',
      sigla: 'CMDO 4ª BDA C MEC',
      cidade: 'DOURADOS',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 98,
      codom: '024836',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 13ª BRIGADA DE INFANTARIA MOTORIZADA',
      sigla: 'CMDO 13ª BDA INF MTZ',
      cidade: 'CUIABÁ',
      nomeUF: 'MATO GROSSO',
      siglaUF: 'MT',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 99,
      codom: '024349',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 18ª BRIGADA DE INFANTARIA DE PANTANAL',
      sigla: 'CMDO 18ª BDA INF PANTANAL',
      cidade: 'CORUMBÁ',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 100,
      codom: '070649',
      categoria: 'SVPGu',
      nome: '10º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '10º RC MEC',
      cidade: 'BELA VISTA',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 101,
      codom: '070672',
      categoria: 'SVPGu',
      nome: '11º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '11º RC MEC',
      cidade: 'PONTA PORÃ',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 102,
      codom: '071019',
      categoria: 'SVPGu',
      nome: '17º REGIMENTO DE CAVALARIA MECANIZADO',
      sigla: '17º RC MEC',
      cidade: 'AMAMBAÍ',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 103,
      codom: '055822',
      categoria: 'SVPGu',
      nome: '9º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '9º GAC',
      cidade: 'NIOAQUE',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 104,
      codom: '056523',
      categoria: 'SVPGu',
      nome: '18º GRUPO DE ARTILHARIA DE CAMPANHA',
      sigla: '18º GAC',
      cidade: 'RONDONÓPOLIS',
      nomeUF: 'MATO GROSSO',
      siglaUF: 'MT',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 105,
      codom: '003103',
      categoria: 'SVPGu',
      nome: '9º BATALHÃO DE ENGENHARIA DE COMBATE',
      sigla: '9º BE CMB',
      cidade: 'AQUIDAUANA',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 106,
      codom: '021923',
      categoria: 'SVPGu',
      nome: 'COMANDO DE FRONTEIRA JAURU/66º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: 'C FRON JAURU/66º BI MTZ',
      cidade: 'CÁCERES',
      nomeUF: 'MATO GROSSO',
      siglaUF: 'MT',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 107,
      codom: '006163',
      categoria: 'SVPGu',
      nome: '47º BATALHÃO DE INFANTARIA',
      sigla: '47º BI',
      cidade: 'COXIM',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 108,
      codom: '009183',
      categoria: 'SVPGu',
      nome: '58º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: '58º BI MTZ',
      cidade: 'ARAGARÇAS',
      nomeUF: 'GOIÁS',
      siglaUF: 'GO',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 109,
      codom: '035303',
      categoria: 'SVPGu',
      nome: '2ª COMPANHIA DE FRONTEIRA',
      sigla: '2ª CIA FRON',
      cidade: 'PORTO MURTINHO',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 110,
      codom: '013292',
      categoria: 'SVPGu',
      nome: '3ª BATERIA DE ARTILHARIA ANTIAÉREA',
      sigla: '3ª BIA AAAE',
      cidade: 'TRÊS LAGOAS',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 111,
      codom: '034884',
      categoria: 'SVPGu',
      nome: '4ª COMPANHIA DE ENGENHARIA DE COMBATE MECANIZADA',
      sigla: '4ª CIA E CMB MEC',
      cidade: 'JARDIM',
      nomeUF: 'MATO GROSSO DO SUL',
      siglaUF: 'MS',
      rmdevinculacao: '9ª RM',
    },
    {
      id: 112,
      codom: '024679',
      categoria: 'SVPR',
      nome: 'COMANDO DA 10ª REGIÃO MILITAR',
      sigla: 'CMDO 10ª RM',
      cidade: 'FORTALEZA',
      nomeUF: 'CEARÁ',
      siglaUF: 'CE',
      rmdevinculacao: '10ª RM',
    },
    {
      id: 113,
      codom: '001701',
      categoria: 'SVPGu',
      nome: '25º BATALHÃO DE CAÇADORES',
      sigla: '25º BC',
      cidade: 'TERESINA',
      nomeUF: 'PIAUÍ',
      siglaUF: 'PI',
      rmdevinculacao: '10ª RM',
    },
    {
      id: 114,
      codom: '003509',
      categoria: 'SVPGu',
      nome: '3º BATALHÃO DE ENGENHARIA DE CONSTRUÇÃO',
      sigla: '3º BEC',
      cidade: 'PICOS',
      nomeUF: 'PIAUÍ',
      siglaUF: 'PI',
      rmdevinculacao: '10ª RM',
    },
    {
      id: 115,
      codom: '022772',
      categoria: 'SVPR',
      nome: 'COMANDO DA 11ª REGIÃO MILITAR',
      sigla: 'CMDO 11ª RM',
      cidade: 'BRASÍLIA',
      nomeUF: 'DISTRITO FEDERAL',
      siglaUF: 'DF',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 116,
      codom: '001347',
      categoria: 'SVPGu',
      nome: 'BASE ADMINISTRATIVA DO COMANDO DE OPERAÇÕES ESPECIAIS',
      sigla: 'BA ADM CMDO OP ESP',
      cidade: 'GOIÂNIA',
      nomeUF: 'GOIÁS',
      siglaUF: 'GO',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 117,
      codom: '008532',
      categoria: 'SVPGu',
      nome: '36º BATALHÃO DE INFANTARIA MECANIZADO',
      sigla: '36º BI MEC',
      cidade: 'UBERLÂNDIA',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 118,
      codom: '008912',
      categoria: 'SVPGu',
      nome: '41º BATALHÃO DE INFANTARIA MOTORIZADO',
      sigla: '41º BI MTZ',
      cidade: 'JATAÍ',
      nomeUF: 'GOIÁS',
      siglaUF: 'GO',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 119,
      codom: '034637',
      categoria: 'SVPGu',
      nome: '23ª COMPANHIA DE ENGENHARIA DE COMBATE',
      sigla: '23ª CIA E CMB',
      cidade: 'IPAMERI',
      nomeUF: 'GOIÁS',
      siglaUF: 'GO',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 120,
      codom: '004515',
      categoria: 'SVPGu',
      nome: '2º BATALHÃO FERROVIÁRIO',
      sigla: '2º B FV',
      cidade: 'ARAGUARI',
      nomeUF: 'MINAS GERAIS',
      siglaUF: 'MG',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 121,
      codom: '005793',
      categoria: 'SVPGu',
      nome: '22º BATALHÃO DE INFANTARIA',
      sigla: '22º BI',
      cidade: 'PALMAS',
      nomeUF: 'TOCANTINS',
      siglaUF: 'TO',
      rmdevinculacao: '11ª RM',
    },
    {
      id: 122,
      codom: '025239',
      categoria: 'SVPR',
      nome: 'COMANDO DA 12ª REGIÃO MILITAR',
      sigla: 'CMDO 12ª RM',
      cidade: 'MANAUS',
      nomeUF: 'AMAZONAS',
      siglaUF: 'AM',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 123,
      codom: '024752',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 2 BRIGADA DE INFANTARIA DE SELVA',
      sigla: 'CMDO 2ª BDA INF SL',
      cidade: 'SÃO GABRIEL DA CACHOEIRA',
      nomeUF: 'AMAZONAS',
      siglaUF: 'AM',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 124,
      codom: '021873',
      categoria: 'SVPGu',
      nome: 'COMANDO DE FRONTEIRA SOLIMÕES/8º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: 'C FRON SOLIMÕES/8º BIS',
      cidade: 'TABATINGA',
      nomeUF: 'AMAZONAS',
      siglaUF: 'AM',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 125,
      codom: '024844',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 16ª BRIGADA DE INFANTARIA DE SELVA',
      sigla: 'CMDO 16ª BDA INF SL',
      cidade: 'TEFÉ',
      nomeUF: 'AMAZONAS',
      siglaUF: 'AM',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 126,
      codom: '021824',
      categoria: 'SVPGu',
      nome: 'COMANDO DE FRONTEIRA ACRE/4º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: 'C FRON ACRE/4º BIS',
      cidade: 'RIO BRANCO',
      nomeUF: 'ACRE',
      siglaUF: 'AC',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 127,
      codom: '021899',
      categoria: 'SVPGu',
      nome: 'COMANDO DE FRONTEIRA JURUÁ / 61º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: 'C FRON JURUÁ/61º BIS',
      cidade: 'CRUZEIRO DO SUL',
      nomeUF: 'ACRE',
      siglaUF: 'AC',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 128,
      codom: '021840',
      categoria: 'SVPGu',
      nome: 'COMANDO DE FRONTEIRA RONDÔNIA/6º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: 'C FRON RONDÔNIA/6º BIS',
      cidade: 'GUAJARÁ-MIRIM',
      nomeUF: 'RONDÔNIA',
      siglaUF: 'RO',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 129,
      codom: '024893',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 17ª BRIGADA DE INFANTARIA DE SELVA',
      sigla: 'CMDO 17ª BDA INF SL',
      cidade: 'PORTO VELHO',
      nomeUF: 'RONDÔNIA',
      siglaUF: 'RO',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 130,
      codom: '024745',
      categoria: 'SVPGu',
      nome: 'COMANDO DA 1ª BRIGADA DE INFANTARIA DE SELVA',
      sigla: 'CMDO 1ª BDA INF SL',
      cidade: 'BOA VISTA',
      nomeUF: 'RORAIMA',
      siglaUF: 'RR',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 131,
      codom: '010603',
      categoria: 'SVPGu',
      nome: '54º BATALHÃO DE INFANTARIA DE SELVA',
      sigla: '54º BIS',
      cidade: 'HUMAITÁ',
      nomeUF: 'AMAZONAS',
      siglaUF: 'AM',
      rmdevinculacao: '12ª RM',
    },
    {
      id: 132,
      codom: '045385',
      categoria: 'DIRETORIA',
      nome: 'DIRETORIA DE ASSISTÊNCIA AO PESSOAL',
      sigla: 'DAP',
      cidade: 'BRASÍLIA',
      nomeUF: 'BRASÍLIA',
      siglaUF: 'DF',
      rmdevinculacao: 'DAP',
    },
  ];
}

/* ========================================================================
🧩 SEÇÃO 12: SISTEMA DE CARREGAMENTO - CONDIÇÃO DOS REQUERENTES
========================================================================= */

/**
 * 📊 Carregar dados da condição dos requerentes
 */
function carregarCondicaoRequerente() {
  console.log('📊 Iniciando carregamento da condição dos requerentes...');

  fetch(APIS.CONDICAO_REQUERENTE)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      console.log('📡 Resposta da API CONDICAO_REQUERENTE recebida');

      const json = JSON.parse(
        text.replace('/*O_o*/', '').replace('google.visualization.Query.setResponse(', '').slice(0, -2)
      );

      const rows = json.table.rows;
      condicaoRequerente = [];

      rows.forEach((row, index) => {
        const codigo = row.c[1]?.v; // Coluna COD (índice 1)
        const condicao = row.c[2]?.v; // Coluna CONDIÇÃO REQUERENTE (índice 2)

        if (condicao && typeof condicao === 'string') {
          condicaoRequerente.push({
            id: index + 1,
            codigo: codigo ? String(codigo).trim() : '',
            condicao: condicao.trim(),
          });
        }
      });

      console.log(`✅ ${condicaoRequerente.length} condições de requerentes carregadas`);
      // Nota: Esta função será chamada dinamicamente ao adicionar requerentes
    })
    .catch((err) => {
      console.warn('⚠️ Erro ao carregar API CONDICAO_REQUERENTE, usando fallback:', err);
      condicaoRequerente = obterFallbackCondicaoRequerente();
    });
}

/**
 * 📦 Dados de fallback para condição dos requerentes
 */
function obterFallbackCondicaoRequerente() {
  return [
    { id: 1, codigo: '1', condicao: 'Cônjuge' },
    { id: 2, codigo: '2', condicao: 'Ex-cônjuge com pensão alimentícia' },
    { id: 3, codigo: '3', condicao: 'Companheiro(a)' },
    { id: 4, codigo: '4', condicao: 'Filho(a) menor de 21 anos' },
    { id: 5, codigo: '5', condicao: 'Filho(a) inválido(a)' },
    { id: 6, codigo: '6', condicao: 'Filho(a) estudante até 24 anos' },
    { id: 7, codigo: '7', condicao: 'Pai' },
    { id: 8, codigo: '8', condicao: 'Mãe' },
  ];
}

/* ========================================================================
🧩 SEÇÃO 13: CARREGAMENTO SIMULTÂNEO DE TODAS AS APIS
========================================================================= */

/**
 * 🚀 Carregar todas as APIs simultaneamente
 * Usa Promise.all para carregar tudo em paralelo
 */
function carregarTodasAPIs() {
  console.log('🚀 Iniciando carregamento de todas as APIs simultaneamente...');

  // Executar todas as funções de carregamento em paralelo
  Promise.all([
    new Promise((resolve) => {
      carregardadosPostos();
      resolve();
    }),
    new Promise((resolve) => {
      carregarDadosArmas();
      resolve();
    }),
    new Promise((resolve) => {
      carregarCondicaoMilitar();
      resolve();
    }),
    new Promise((resolve) => {
      carregarContribuicaoPensao();
      resolve();
    }),
    new Promise((resolve) => {
      carregarAdcHabilitacao();
      resolve();
    }),
    new Promise((resolve) => {
      carregarSVPR();
      resolve();
    }),
    new Promise((resolve) => {
      carregarOrgaos();
      resolve();
    }),
    new Promise((resolve) => {
      carregarCondicaoRequerente();
      resolve();
    }),
  ]).then(() => {
    console.log('✅ Todas as APIs foram carregadas com sucesso!');
  });
}

/* ========================================================================
🧩 SEÇÃO 14: SISTEMA DE NAVEGAÇÃO ENTRE ABAS
========================================================================= */

/**
 * 🧭 Navegar para uma aba específica
 * Controla a troca de abas e atualização do título dinâmico
 * @param {string} abaId - ID da aba para navegar
 */
function navegarPara(abaId) {
  console.log(`🧭 Navegando para aba: ${abaId}`);

  // Validar se a aba existe
  if (!TITULOS_CABECALHO[abaId]) {
    console.error(`❌ Aba inválida: ${abaId}`);
    return;
  }

  // Atualizar estado do sistema
  estadoAtual.abaAtiva = abaId;

  // Salvar aba ativa no localStorage para persistência
  localStorage.setItem('pensaoMilitar_abaAtiva', abaId);

  // Ocultar todas as abas
  document.querySelectorAll('.aba').forEach((aba) => {
    aba.classList.remove('visivel');
    aba.style.display = 'none';
  });

  // Mostrar aba selecionada
  const abaSelecionada = document.getElementById(`${abaId}Aba`);
  if (abaSelecionada) {
    abaSelecionada.style.display = 'block';
    abaSelecionada.classList.add('visivel');
  } else {
    console.error(`❌ Elemento da aba não encontrado: ${abaId}Aba`);
    return;
  }

  // Atualizar título dinâmico do cabeçalho
  atualizarTituloDinamico(abaId);

  // Fechar todos os dropdowns abertos
  fecharTodosDropdowns();

  // Scroll suave para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });

  console.log(`✅ Navegação concluída para: ${abaId}`);
}

/**
 * 🏷️ Atualizar título dinâmico do cabeçalho
 * Implementa transição suave conforme especificação
 * @param {string} abaId - ID da aba para obter o título
 */
function atualizarTituloDinamico(abaId) {
  const tituloPrincipal = document.getElementById('tituloPrincipal');
  const novoTitulo = TITULOS_CABECALHO[abaId] || 'Ferramenta de Concessão da Pensão Militar';

  if (!tituloPrincipal) {
    console.error('❌ Elemento tituloPrincipal não encontrado');
    return;
  }

  // Transição suave com fade
  tituloPrincipal.style.opacity = '0.5';

  setTimeout(() => {
    tituloPrincipal.textContent = novoTitulo;
    tituloPrincipal.style.opacity = '1';
    console.log(`🏷️ Título dinâmico atualizado: "${novoTitulo}"`);
  }, 150);
}

/**
 * 🔧 Configurar navegação inicial do sistema
 * Restaura a última aba ativa ou vai para menu inicial
 */
function configurarNavegacao() {
  // Tentar restaurar aba ativa salva
  const abaSalva = localStorage.getItem('pensaoMilitar_abaAtiva');

  if (abaSalva && TITULOS_CABECALHO[abaSalva]) {
    navegarPara(abaSalva);
    console.log(`🔄 Aba restaurada: ${abaSalva}`);
  } else {
    navegarPara('menuInicial');
    console.log('🏠 Navegação iniciada no menu inicial');
  }
}

/* ========================================================================
🧩 SEÇÃO 15: SISTEMA DE MENU SUSPENSO (DROPDOWNS)
========================================================================= */

/**
 * 📋 Alterna (toggle) a exibição de um dropdown menu
 * @param {string} dropdownId - ID do dropdown que será alternado
 */
function toggleDropdown(dropdownId) {
  console.log(`📋 Toggle dropdown: ${dropdownId}`);

  // Fecha todos os outros dropdowns abertos
  document.querySelectorAll('.dropdown-menu').forEach((menu) => {
    if (menu.id !== dropdownId) {
      menu.classList.remove('show');

      // Remove a classe 'active' do botão pai
      const botaoPai = menu.parentElement;
      if (botaoPai && botaoPai.classList.contains('dropdown-btn')) {
        botaoPai.classList.remove('active');
      }
    }
  });

  // Seleciona o dropdown atual pelo ID
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) {
    console.error(`❌ Dropdown não encontrado: ${dropdownId}`);
    return;
  }

  // Obtém o botão pai do dropdown
  const botao = dropdown.parentElement;

  // Alterna a visibilidade do dropdown atual
  dropdown.classList.toggle('show');

  // Alterna o estado visual do botão pai
  if (botao && botao.classList.contains('dropdown-btn')) {
    botao.classList.toggle('active');
  }

  // Loga o estado final do dropdown
  const isVisible = dropdown.classList.contains('show');
  console.log(`📋 Dropdown ${dropdownId} ${isVisible ? 'aberto' : 'fechado'}`);
}

/**
 * ❌ Fecha todos os dropdowns abertos
 */
function fecharTodosDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach((menu) => {
    menu.classList.remove('show');

    // Remove a classe 'active' do botão pai
    const botaoPai = menu.parentElement;
    if (botaoPai && botaoPai.classList.contains('dropdown-btn')) {
      botaoPai.classList.remove('active');
    }
  });

  console.log('❌ Todos os dropdowns fechados');
}

// Fecha dropdowns ao clicar fora de qualquer botão
document.addEventListener('click', function (event) {
  if (!event.target.closest('.dropdown-btn')) {
    fecharTodosDropdowns();
  }
});

/* ========================================================================
✨ SEÇÃO 16: SISTEMA DE LABELS FLUTUANTES
========================================================================= */

/**
 * ✨ Controla a flutuação de labels para todos os campos
 * Aplica a classe 'has-value' quando o campo possui valor
 * @param {HTMLElement} element - Elemento do campo
 */
function handleLabelFloat(element) {
  if (!element) return;

  // Para inputs e textareas: verifica se tem valor não vazio
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    if (element.value && element.value.toString().trim() !== '') {
      element.classList.add('has-value');
    } else {
      element.classList.remove('has-value');
    }
  }

  // Para selects: verifica se tem opção selecionada diferente de vazio
  if (element.tagName === 'SELECT') {
    if (element.value && element.value !== '') {
      element.classList.add('has-value');
    } else {
      element.classList.remove('has-value');
    }
  }
}

/**
 * 🔧 Configurar labels flutuantes para todos os campos
 */
function configurarLabelsFlutantes() {
  // Selecionar TODOS os campos dentro de .campo-flutuante
  const allFields = document.querySelectorAll(
    '.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea'
  );

  allFields.forEach((field) => {
    // Event listeners para mudanças no campo
    field.addEventListener('input', () => handleLabelFloat(field));
    field.addEventListener('change', () => handleLabelFloat(field));
    field.addEventListener('blur', () => handleLabelFloat(field));
    field.addEventListener('focus', () => {
      // Ao focar, sempre adiciona has-value para subir o label
      field.classList.add('has-value');
    });

    // Para selects, monitora quando são populados dinamicamente
    if (field.tagName.toLowerCase() === 'select') {
      const observer = new MutationObserver(() => {
        handleLabelFloat(field);
      });
      observer.observe(field, { childList: true, subtree: true });

      // Event listener específico para mudança de opção
      field.addEventListener('mousedown', () => {
        field.classList.add('has-value');
      });
    }

    // Verifica estado inicial
    handleLabelFloat(field);
  });

  console.log(`✅ Labels flutuantes configurados para ${allFields.length} campos`);
}

/**
 * 🔄 Reinicializar labels flutuantes (para campos adicionados dinamicamente)
 */
window.reinitFloatingLabels = function () {
  const newFields = document.querySelectorAll(
    '.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea'
  );

  newFields.forEach((field) => {
    // Remove listeners existentes para evitar duplicação
    const newField = field.cloneNode(true);
    field.parentNode.replaceChild(newField, field);

    // Adiciona eventos ao novo campo
    newField.addEventListener('input', () => handleLabelFloat(newField));
    newField.addEventListener('change', () => handleLabelFloat(newField));
    newField.addEventListener('blur', () => handleLabelFloat(newField));
    newField.addEventListener('focus', () => {
      newField.classList.add('has-value');
    });

    if (newField.tagName.toLowerCase() === 'select') {
      const observer = new MutationObserver(() => {
        handleLabelFloat(newField);
      });
      observer.observe(newField, { childList: true, subtree: true });

      newField.addEventListener('mousedown', () => {
        newField.classList.add('has-value');
      });
    }

    // Verifica estado atual
    handleLabelFloat(newField);
  });

  console.log('🔄 Labels flutuantes reinicializados');
};

/* ========================================================================
🧩 SEÇÃO 17: SISTEMA DE FORMATAÇÃO DE CPF
========================================================================= */

/**
 * Formata um valor como CPF (000.000.000-00)
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatarCPF(value) {
  // Remove tudo que não é dígito
  value = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  value = value.substring(0, 11);

  // Aplica a máscara
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  return value;
}

/**
 * Aplica máscara de CPF em todos os campos com atributo data-cpf
 */
function inicializarMascarasCPF() {
  // Seleciona todos os inputs que devem ter máscara de CPF
  const camposCPF = document.querySelectorAll('input[data-cpf], input[id*="cpf"], input[id*="Cpf"], input[id*="CPF"]');

  camposCPF.forEach((campo) => {
    // Adiciona o evento de input
    campo.addEventListener('input', function (e) {
      const valorFormatado = formatarCPF(e.target.value);
      e.target.value = valorFormatado;

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante
      handleLabelFloat(e.target);
    });

    // Formata o valor inicial se existir
    if (campo.value) {
      campo.value = formatarCPF(campo.value);
      // 🔥 IMPORTANTE: Atualiza o label após formatar valor inicial
      handleLabelFloat(campo);
    }
  });

  console.log(`✅ Máscaras de CPF aplicadas em ${camposCPF.length} campos`);
}

/**
 * Aplica máscara de CPF em um campo específico
 * @param {string} idCampo - ID do campo a ser formatado
 */
function aplicarMascaraCPF(idCampo) {
  const campo = document.getElementById(idCampo);

  if (campo) {
    campo.addEventListener('input', function (e) {
      const valorFormatado = formatarCPF(e.target.value);
      e.target.value = valorFormatado;

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante
      handleLabelFloat(e.target);
    });

    // Formata o valor inicial se existir
    if (campo.value) {
      campo.value = formatarCPF(campo.value);
      // 🔥 IMPORTANTE: Atualiza o label após formatar valor inicial
      handleLabelFloat(campo);
    }
  }
}

/**
 * Remove a formatação do CPF, deixando apenas os números
 * @param {string} cpfFormatado - CPF formatado
 * @returns {string} - Apenas os dígitos
 */
function removerFormatacaoCPF(cpfFormatado) {
  return cpfFormatado.replace(/\D/g, '');
}

/**
 * Valida se o CPF é válido
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarCPF(cpf) {
  cpf = removerFormatacaoCPF(cpf);

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Inicializa as máscaras quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarMascarasCPF);

// Observa mudanças no DOM para aplicar máscara em campos adicionados dinamicamente
const observadorCPF = new MutationObserver(() => {
  inicializarMascarasCPF();
});

observadorCPF.observe(document.body, {
  childList: true,
  subtree: true,
});

/* ========================================================================
🧩 SEÇÃO 18: SISTEMA DE FORMATAÇÃO DE IDENTIDADE DO EB (EB000000000-0)
========================================================================= */

/**
 * Formata um valor como Identidade (EB000000000-0)
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatarIdentidade(value) {
  // Remove tudo que não é letra ou dígito
  value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Garante que começa com "EB"
  if (!value.startsWith('EB')) {
    if (value.startsWith('E')) {
      value = 'EB' + value.substring(1);
    } else if (value.startsWith('B')) {
      value = 'EB' + value.substring(1);
    } else if (value.length > 0 && !/^[EB]/.test(value)) {
      value = 'EB' + value;
    } else if (value.length === 0) {
      value = '';
    }
  }

  // Remove letras após "EB"
  if (value.length > 2) {
    const prefixo = value.substring(0, 2);
    const numeros = value.substring(2).replace(/[^0-9]/g, '');
    value = prefixo + numeros;
  }

  // Limita a 12 caracteres mais o hífen (EB + 9 dígitos + hífen + 1 dígito)
  value = value.substring(0, 13);

  // Aplica a máscara EB000000000-0
  if (value.length > 11) {
    value = value.replace(/^(EB\d{9})(\d{1})$/, '$1-$2');
  }

  return value;
}

/**
 * Aplica máscara de Identidade em todos os campos com atributo data-identidade
 */
function inicializarMascarasIdentidade() {
  // Seleciona todos os inputs que devem ter máscara de Identidade
  const camposIdentidade = document.querySelectorAll(
    'input[data-identidade], input[id*="identidade"], input[id*="Identidade"], input[id*="IDENTIDADE"]'
  );

  camposIdentidade.forEach((campo) => {
    // Define o placeholder se não existir
    if (!campo.placeholder) {
      campo.placeholder = 'EB000000000-0';
    }

    // Adiciona o evento de input
    campo.addEventListener('input', function (e) {
      const cursorPos = e.target.selectionStart;
      const valorAnterior = e.target.value;
      const valorFormatado = formatarIdentidade(e.target.value);

      e.target.value = valorFormatado;

      // Ajusta a posição do cursor
      let novaPosicao = cursorPos;
      if (valorFormatado.length > valorAnterior.length) {
        novaPosicao = cursorPos + (valorFormatado.length - valorAnterior.length);
      }
      e.target.setSelectionRange(novaPosicao, novaPosicao);

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante (se existir)
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Adiciona evento de focus para garantir prefixo "EB"
    campo.addEventListener('focus', function (e) {
      if (e.target.value === '') {
        e.target.value = 'EB';
      }
    });

    // Adiciona evento de blur para limpar se só tiver "EB"
    campo.addEventListener('blur', function (e) {
      if (e.target.value === 'EB') {
        e.target.value = '';
        if (typeof handleLabelFloat === 'function') {
          handleLabelFloat(e.target);
        }
      }
    });

    // Formata o valor inicial se existir
    if (campo.value) {
      campo.value = formatarIdentidade(campo.value);
      // 🔥 IMPORTANTE: Atualiza o label após formatar valor inicial
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  });

  console.log(`✅ Máscaras de Identidade aplicadas em ${camposIdentidade.length} campos`);
}

/**
 * Aplica máscara de Identidade em um campo específico
 * @param {string} idCampo - ID do campo a ser formatado
 */
function aplicarMascaraIdentidade(idCampo) {
  const campo = document.getElementById(idCampo);

  if (campo) {
    // Define o placeholder
    campo.placeholder = 'EB000000000-0';

    campo.addEventListener('input', function (e) {
      const valorFormatado = formatarIdentidade(e.target.value);
      e.target.value = valorFormatado;

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    campo.addEventListener('focus', function (e) {
      if (e.target.value === '') {
        e.target.value = 'EB';
      }
    });

    campo.addEventListener('blur', function (e) {
      if (e.target.value === 'EB') {
        e.target.value = '';
        if (typeof handleLabelFloat === 'function') {
          handleLabelFloat(e.target);
        }
      }
    });

    // Formata o valor inicial se existir
    if (campo.value) {
      campo.value = formatarIdentidade(campo.value);
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  }
}

/**
 * Remove a formatação da Identidade, deixando apenas letras e números
 * @param {string} identidadeFormatada - Identidade formatada
 * @returns {string} - Apenas letras e números
 */
function removerFormatacaoIdentidade(identidadeFormatada) {
  return identidadeFormatada.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Valida se a Identidade está no formato correto
 * @param {string} identidade - Identidade a ser validada
 * @returns {boolean} - true se válido, false se inválido
 */
function validarIdentidade(identidade) {
  const identidadeLimpa = removerFormatacaoIdentidade(identidade);

  // Verifica se começa com "EB"
  if (!identidadeLimpa.startsWith('EB')) return false;

  // Verifica se tem exatamente 12 caracteres (EB + 10 dígitos)
  if (identidadeLimpa.length !== 12) return false;

  // Verifica se após "EB" só tem dígitos
  const numeros = identidadeLimpa.substring(2);
  if (!/^\d{10}$/.test(numeros)) return false;

  return true;
}

/**
 * Calcula e retorna o dígito verificador (exemplo simples)
 * @param {string} identidade - Identidade sem o dígito verificador
 * @returns {string} - Dígito verificador
 */
function calcularDigitoVerificador(identidade) {
  const identidadeLimpa = removerFormatacaoIdentidade(identidade);
  const numeros = identidadeLimpa.substring(2, 11); // Pega 9 dígitos após EB

  let soma = 0;
  for (let i = 0; i < numeros.length; i++) {
    soma += parseInt(numeros.charAt(i)) * (10 - i);
  }

  const resto = soma % 11;
  const digito = resto < 2 ? 0 : 11 - resto;

  return digito.toString();
}

// Inicializa as máscaras quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarMascarasIdentidade);

// Observa mudanças no DOM para aplicar máscara em campos adicionados dinamicamente
const observadorIdentidade = new MutationObserver(() => {
  inicializarMascarasIdentidade();
});

observadorIdentidade.observe(document.body, {
  childList: true,
  subtree: true,
});

/* ========================================================================
📋 INSTRUÇÕES DE USO:
========================================================================= 

1. Para usar em um input HTML, adicione o atributo data-identidade:
  <input type="text" data-identidade placeholder="EB000000000-0">

2. Ou use IDs com a palavra "identidade":
  <input type="text" id="numeroIdentidade">

3. Para aplicar manualmente em um campo específico:
  aplicarMascaraIdentidade('meuCampoId');

4. Para validar uma identidade:
  if (validarIdentidade('EB123456789-0')) {
    console.log('Identidade válida!');
  }

5. Para remover formatação:
  const identidadeLimpa = removerFormatacaoIdentidade('EB123456789-0');
   // Retorna: 'EB1234567890'

========================================================================= */

/* ========================================================================
🧩 SEÇÃO 19: SISTEMA DE FORMATAÇÃO DE PREC/CP (000000000)
========================================================================= */

/**
 * Formata um valor como PREC/CP (9 dígitos numéricos)
 * Remove qualquer caractere que não seja dígito e limita a 9 caracteres
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado contendo apenas dígitos (máximo 9)
 */
function formatarPrecCP(value) {
  // Remove tudo que não é dígito (letras, espaços, pontos, hífens, etc)
  value = value.replace(/\D/g, '');

  // Limita a exatamente 9 dígitos
  value = value.substring(0, 9);

  // Retorna o valor formatado (apenas números)
  return value;
}

/**
 * Aplica máscara de PREC/CP em todos os campos com atributo data-prec
 * Busca automaticamente por campos que contenham:
 * - Atributo data-prec
 * - ID contendo "prec" (case-insensitive)
 */
function inicializarMascarasPrecCP() {
  // Seleciona todos os inputs que devem ter máscara de PREC/CP
  // Busca por: data-prec, id com "prec", "Prec" ou "PREC"
  const camposPrecCP = document.querySelectorAll(
    'input[data-prec], input[id*="prec"], input[id*="Prec"], input[id*="PREC"]'
  );

  // Itera sobre cada campo encontrado
  camposPrecCP.forEach((campo) => {
    // Define o placeholder padrão se não existir
    if (!campo.placeholder) {
      campo.placeholder = '000000000';
    }

    // Define o maxlength se não existir
    if (!campo.maxLength || campo.maxLength === -1) {
      campo.maxLength = 9;
    }

    // Adiciona o evento de input para formatação em tempo real
    // Este evento dispara sempre que o usuário digita algo no campo
    campo.addEventListener('input', function (e) {
      // Salva a posição atual do cursor
      const cursorPos = e.target.selectionStart;

      // Salva o valor anterior para comparação
      const valorAnterior = e.target.value;

      // Aplica a formatação
      const valorFormatado = formatarPrecCP(e.target.value);

      // Atualiza o valor do campo
      e.target.value = valorFormatado;

      // Ajusta a posição do cursor após formatação
      // Isso evita que o cursor pule para o final do campo
      let novaPosicao = cursorPos;
      if (valorFormatado.length > valorAnterior.length) {
        novaPosicao = cursorPos + (valorFormatado.length - valorAnterior.length);
      }
      e.target.setSelectionRange(novaPosicao, novaPosicao);

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante (se a função existir)
      // Verifica se a função handleLabelFloat está definida antes de chamá-la
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Adiciona validação para aceitar apenas números ao colar
    // Previne que o usuário cole texto ou caracteres especiais
    campo.addEventListener('paste', function (e) {
      // Previne o comportamento padrão de colar
      e.preventDefault();

      // Obtém o texto colado da área de transferência
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');

      // Formata o texto colado
      const valorFormatado = formatarPrecCP(pastedText);

      // Insere o valor formatado no campo
      e.target.value = valorFormatado;

      // Atualiza o label flutuante se a função existir
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Formata o valor inicial se o campo já tiver algum valor
    // Útil quando o formulário é preenchido automaticamente
    if (campo.value) {
      campo.value = formatarPrecCP(campo.value);

      // 🔥 IMPORTANTE: Atualiza o label após formatar valor inicial
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  });

  // Log de confirmação no console para debug
  console.log(`✅ Máscaras de PREC/CP aplicadas em ${camposPrecCP.length} campos`);
}

/**
 * Aplica máscara de PREC/CP em um campo específico através do ID
 * Útil para aplicar a máscara manualmente em campos específicos
 * @param {string} idCampo - ID do campo a ser formatado
 */
function aplicarMascaraPrecCP(idCampo) {
  // Busca o campo pelo ID fornecido
  const campo = document.getElementById(idCampo);

  // Verifica se o campo existe no DOM
  if (campo) {
    // Define o placeholder padrão
    campo.placeholder = '000000000';

    // Define o maxlength
    campo.maxLength = 9;

    // Adiciona o evento de input para formatação
    campo.addEventListener('input', function (e) {
      const valorFormatado = formatarPrecCP(e.target.value);
      e.target.value = valorFormatado;

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Adiciona validação ao colar
    campo.addEventListener('paste', function (e) {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      const valorFormatado = formatarPrecCP(pastedText);
      e.target.value = valorFormatado;

      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Formata o valor inicial se existir
    if (campo.value) {
      campo.value = formatarPrecCP(campo.value);

      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  } else {
    // Exibe aviso no console se o campo não for encontrado
    console.warn(`⚠️ Campo com ID "${idCampo}" não encontrado`);
  }
}

/**
 * Valida se o PREC/CP está no formato correto
 * Verifica se contém exatamente 9 dígitos numéricos
 * @param {string} precCP - PREC/CP a ser validado
 * @returns {boolean} - true se válido (9 dígitos), false se inválido
 */
function validarPrecCP(precCP) {
  // Remove caracteres não numéricos
  const precCPLimpo = formatarPrecCP(precCP);

  // Verifica se tem exatamente 9 dígitos
  if (precCPLimpo.length !== 9) {
    return false;
  }

  // Verifica se contém apenas dígitos
  if (!/^\d{9}$/.test(precCPLimpo)) {
    return false;
  }

  // Validação aprovada
  return true;
}

/**
 * Retorna apenas os dígitos do PREC/CP (remove formatação se houver)
 * Útil para envio de dados ao servidor
 * @param {string} precCPFormatado - PREC/CP que pode conter caracteres não numéricos
 * @returns {string} - Apenas os 9 dígitos numéricos
 */
function obterDigitosPrecCP(precCPFormatado) {
  // Remove tudo que não é dígito e retorna
  return precCPFormatado.replace(/\D/g, '').substring(0, 9);
}

// ========================================================================
// 🚀 INICIALIZAÇÃO AUTOMÁTICA
// ========================================================================

// Inicializa as máscaras quando o DOM estiver completamente carregado
// Garante que todos os elementos HTML estejam disponíveis antes de aplicar as máscaras
document.addEventListener('DOMContentLoaded', inicializarMascarasPrecCP);

// Observa mudanças no DOM para aplicar máscara em campos adicionados dinamicamente
// Útil quando campos são criados via JavaScript após o carregamento da página
const observadorPrecCP = new MutationObserver(() => {
  inicializarMascarasPrecCP();
});

// Configura o observador para monitorar:
// - childList: true => Monitora adição/remoção de elementos
// - subtree: true => Monitora mudanças em toda a árvore DOM
observadorPrecCP.observe(document.body, {
  childList: true,
  subtree: true,
});

/* ========================================================================
📋 INSTRUÇÕES DE USO:
========================================================================= 

1. USANDO ATRIBUTO DATA-PREC (Recomendado):
  <input type="text" data-prec placeholder="000000000">

2. USANDO ID COM "PREC" NO NOME:
  <input type="text" id="precInstituidor">
  <input type="text" id="numeroPrecCP">

3. APLICAÇÃO MANUAL EM CAMPO ESPECÍFICO:
  aplicarMascaraPrecCP('meuCampoId');

4. VALIDAÇÃO DE PREC/CP:
  if (validarPrecCP('123456789')) {
  console.log('✅ PREC/CP válido!');
  } else {
    console.log('❌ PREC/CP inválido!');
  }

5. OBTER APENAS OS DÍGITOS (para envio ao servidor):
  const precCPLimpo = obterDigitosPrecCP(campo.value);
   // Exemplo: se campo.value = "123-456-789"
   // Retorna: "123456789"

6. EXEMPLO COMPLETO DE VALIDAÇÃO NO SUBMIT:
  form.addEventListener('submit', function(e) {
    const precCP = document.getElementById('precInstituidor').value;
    
    if (!validarPrecCP(precCP)) {
      e.preventDefault();
      alert('Por favor, informe um PREC/CP válido (9 dígitos)');
      return;
    }
    
     // Obter valor limpo para envio
    const precCPLimpo = obterDigitosPrecCP(precCP);
    console.log('PREC/CP a ser enviado:', precCPLimpo);
  });

========================================================================= */

/* ========================================================================
✨ SEÇÃO 20: SISTEMA DE FORMATAÇÃO DE DATA PADRÃO EB
========================================================================= */

/**
 * Objeto com os nomes dos meses abreviados em português (padrão EB)
 * Usado para conversão de números de mês para abreviações
 */
const MESES_EB = {
  1: 'JAN',
  2: 'FEV',
  3: 'MAR',
  4: 'ABR',
  5: 'MAIO',
  6: 'JUN',
  7: 'JUL',
  8: 'AGO',
  9: 'SET',
  10: 'OUT',
  11: 'NOV',
  12: 'DEZ',
};

/**
 * Objeto reverso para converter abreviação de mês em número
 * Usado na conversão de texto para data
 */
const MESES_EB_REVERSO = {
  JAN: 1,
  FEV: 2,
  MAR: 3,
  ABR: 4,
  MAIO: 5,
  JUN: 6,
  JUL: 7,
  AGO: 8,
  SET: 9,
  OUT: 10,
  NOV: 11,
  DEZ: 12,
};

/**
 * Formata uma data no padrão EB
 * REGRAS DE FORMATAÇÃO:
 * - Ano >= 2000: DD MMM YY (Ex: 12 JAN 25)
 * - Ano < 2000: DD MMM YYYY (Ex: 12 JAN 1995)
 * - Dia = 01: D° MMM YY ou D° MMM YYYY (Ex: 1° JAN 25 ou 1° JAN 1995)
 *
 * @param {string} value - Valor a ser formatado (DD/MM/YYYY ou DDMMYYYY)
 * @returns {string} - Valor formatado no padrão EB
 */
function formatarDataEB(value) {
  // Remove tudo que não é dígito
  let numeros = value.replace(/\D/g, '');

  // Limita a 8 dígitos (DDMMYYYY)
  numeros = numeros.substring(0, 8);

  // Se não tiver pelo menos 4 dígitos, retorna com barras parciais
  if (numeros.length < 4) {
    if (numeros.length >= 3) {
      return numeros.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    } else if (numeros.length >= 2) {
      return numeros.replace(/(\d{2})/, '$1/');
    }
    return numeros;
  }

  // Extrai dia, mês e ano
  let dia = parseInt(numeros.substring(0, 2));
  let mes = parseInt(numeros.substring(2, 4));
  let ano = numeros.substring(4);

  // Validação básica de dia e mês
  if (dia > 31) dia = 31;
  if (dia < 1) dia = 1;
  if (mes > 12) mes = 12;
  if (mes < 1) mes = 1;

  // Se ainda não tiver ano completo, retorna formato parcial
  if (ano.length < 4) {
    const diaFormatado = dia.toString().padStart(2, '0');
    const mesFormatado = mes.toString().padStart(2, '0');
    return `${diaFormatado}/${mesFormatado}${ano ? '/' + ano : ''}`;
  }

  // Ano completo (4 dígitos)
  ano = parseInt(ano);

  // Valida ano (entre 1900 e 2099)
  if (ano < 1900) ano = 1900;
  if (ano > 2099) ano = 2099;

  // Obtém o nome do mês
  const nomeMes = MESES_EB[mes];

  // Formata o dia com ordinal se for dia 1
  let diaFormatado;
  if (dia === 1) {
    diaFormatado = '1°';
  } else {
    diaFormatado = dia.toString();
  }

  // Formata o ano conforme o padrão EB
  let anoFormatado;
  if (ano >= 2000) {
    // Ano >= 2000: usa apenas 2 dígitos (YY)
    anoFormatado = ano.toString().substring(2);
  } else {
    // Ano < 2000: usa 4 dígitos (YYYY)
    anoFormatado = ano.toString();
  }

  // Retorna a data formatada no padrão EB
  return `${diaFormatado} ${nomeMes} ${anoFormatado}`;
}

/**
 * Converte data no formato EB para formato ISO (YYYY-MM-DD)
 * Útil para envio ao servidor ou manipulação com objetos Date
 *
 * @param {string} dataEB - Data no formato EB (ex: "12 JAN 25" ou "1° JAN 1995")
 * @returns {string|null} - Data no formato ISO (YYYY-MM-DD) ou null se inválida
 */
function converterDataEBParaISO(dataEB) {
  // Remove caracteres extras e divide a string
  const partes = dataEB.trim().toUpperCase().replace(/°/g, '').split(/\s+/);

  if (partes.length !== 3) return null;

  const dia = parseInt(partes[0]);
  const mesNome = partes[1];
  const ano = partes[2];

  // Valida o mês
  const mes = MESES_EB_REVERSO[mesNome];
  if (!mes) return null;

  // Determina o ano completo
  let anoCompleto;
  if (ano.length === 2) {
    // Ano com 2 dígitos: assume >= 2000
    anoCompleto = 2000 + parseInt(ano);
  } else {
    anoCompleto = parseInt(ano);
  }

  // Valida a data
  if (dia < 1 || dia > 31) return null;
  if (anoCompleto < 1900 || anoCompleto > 2099) return null;

  // Formata para ISO (YYYY-MM-DD)
  const mesFormatado = mes.toString().padStart(2, '0');
  const diaFormatado = dia.toString().padStart(2, '0');

  return `${anoCompleto}-${mesFormatado}-${diaFormatado}`;
}

/**
 * Valida se uma data no formato EB é válida
 * Verifica formato, valores de dia/mês/ano e se a data existe no calendário
 *
 * @param {string} dataEB - Data no formato EB
 * @returns {boolean} - true se válida, false se inválida
 */
function validarDataEB(dataEB) {
  // Converte para ISO
  const dataISO = converterDataEBParaISO(dataEB);
  if (!dataISO) return false;

  // Cria objeto Date e valida
  const data = new Date(dataISO);

  // Verifica se a data é válida
  if (isNaN(data.getTime())) return false;

  // Verifica se os componentes correspondem (evita datas como 31 FEV)
  const [ano, mes, dia] = dataISO.split('-').map((n) => parseInt(n));

  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

/**
 * Aplica máscara de Data EB em todos os campos com atributo data-padrao
 * Busca automaticamente por campos que contenham:
 * - Atributo data-padrao
 * - ID contendo "data" (case-insensitive)
 */
function inicializarMascarasDataEB() {
  // Seleciona todos os inputs que devem ter máscara de Data EB
  const camposDataEB = document.querySelectorAll(
    'input[data-padrao], input[id*="data"], input[id*="Data"], input[id*="DATA"]'
  );

  // Itera sobre cada campo encontrado
  camposDataEB.forEach((campo) => {
    // Define o placeholder padrão se não existir
    if (!campo.placeholder) {
      campo.placeholder = 'DD/MM/AAAA';
    }

    // Variável para armazenar o estado de formatação
    let emFormatacaoFinal = false;

    // Adiciona o evento de input para formatação em tempo real
    campo.addEventListener('input', function (e) {
      // Se já está em formatação final, não processa
      if (emFormatacaoFinal) return;

      const valorAtual = e.target.value;

      // Se o valor parece estar no formato final EB (contém letras)
      // não tenta reformatar
      if (/[A-Z]{3}/.test(valorAtual)) {
        return;
      }

      // Aplica formatação progressiva
      const valorFormatado = formatarDataEB(valorAtual);
      e.target.value = valorFormatado;

      // 🔥 IMPORTANTE: Dispara a atualização do label flutuante
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Evento de blur: aplica formatação final quando o usuário sai do campo
    campo.addEventListener('blur', function (e) {
      const valor = e.target.value;

      // Se já está formatado ou vazio, não faz nada
      if (!valor || /[A-Z]{3}/.test(valor)) {
        return;
      }

      // Remove tudo que não é dígito
      const numeros = valor.replace(/\D/g, '');

      // Se tiver 8 dígitos, aplica formatação final
      if (numeros.length === 8) {
        emFormatacaoFinal = true;
        e.target.value = formatarDataEB(numeros);
        emFormatacaoFinal = false;

        // Valida a data
        if (!validarDataEB(e.target.value)) {
          e.target.setCustomValidity('Data inválida');
        } else {
          e.target.setCustomValidity('');
        }

        // Atualiza o label
        if (typeof handleLabelFloat === 'function') {
          handleLabelFloat(e.target);
        }
      }
    });

    // Evento de focus: se estiver no formato EB, converte para DD/MM/YYYY para edição
    campo.addEventListener('focus', function (e) {
      const valor = e.target.value;

      // Se está no formato EB (contém letras), converte para formato editável
      if (/[A-Z]{3}/.test(valor)) {
        const dataISO = converterDataEBParaISO(valor);
        if (dataISO) {
          const [ano, mes, dia] = dataISO.split('-');
          e.target.value = `${dia}/${mes}/${ano}`;
        }
      }
    });

    // Adiciona validação ao colar
    campo.addEventListener('paste', function (e) {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');

      // Tenta formatar o texto colado
      const valorFormatado = formatarDataEB(pastedText);
      e.target.value = valorFormatado;

      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    // Formata o valor inicial se existir
    if (campo.value) {
      // Se já está no formato EB, mantém
      if (!/[A-Z]{3}/.test(campo.value)) {
        campo.value = formatarDataEB(campo.value);
      }

      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  });

  console.log(`✅ Máscaras de Data EB aplicadas em ${camposDataEB.length} campos`);
}

/**
 * Aplica máscara de Data EB em um campo específico através do ID
 *
 * @param {string} idCampo - ID do campo a ser formatado
 */
function aplicarMascaraDataEB(idCampo) {
  const campo = document.getElementById(idCampo);

  if (campo) {
    campo.placeholder = 'DD/MM/AAAA';

    let emFormatacaoFinal = false;

    campo.addEventListener('input', function (e) {
      if (emFormatacaoFinal) return;

      const valorAtual = e.target.value;
      if (/[A-Z]{3}/.test(valorAtual)) return;

      const valorFormatado = formatarDataEB(valorAtual);
      e.target.value = valorFormatado;

      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    campo.addEventListener('blur', function (e) {
      const valor = e.target.value;
      if (!valor || /[A-Z]{3}/.test(valor)) return;

      const numeros = valor.replace(/\D/g, '');
      if (numeros.length === 8) {
        emFormatacaoFinal = true;
        e.target.value = formatarDataEB(numeros);
        emFormatacaoFinal = false;

        if (!validarDataEB(e.target.value)) {
          e.target.setCustomValidity('Data inválida');
        } else {
          e.target.setCustomValidity('');
        }

        if (typeof handleLabelFloat === 'function') {
          handleLabelFloat(e.target);
        }
      }
    });

    campo.addEventListener('focus', function (e) {
      const valor = e.target.value;
      if (/[A-Z]{3}/.test(valor)) {
        const dataISO = converterDataEBParaISO(valor);
        if (dataISO) {
          const [ano, mes, dia] = dataISO.split('-');
          e.target.value = `${dia}/${mes}/${ano}`;
        }
      }
    });

    campo.addEventListener('paste', function (e) {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      const valorFormatado = formatarDataEB(pastedText);
      e.target.value = valorFormatado;

      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    if (campo.value) {
      if (!/[A-Z]{3}/.test(campo.value)) {
        campo.value = formatarDataEB(campo.value);
      }
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  } else {
    console.warn(`⚠️ Campo com ID "${idCampo}" não encontrado`);
  }
}

// ========================================================================
// 🚀 INICIALIZAÇÃO AUTOMÁTICA
// ========================================================================

// Inicializa as máscaras quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', inicializarMascarasDataEB);

// Observa mudanças no DOM para aplicar máscara em campos adicionados dinamicamente
const observadorDataEB = new MutationObserver(() => {
  inicializarMascarasDataEB();
});

observadorDataEB.observe(document.body, {
  childList: true,
  subtree: true,
});

/* ========================================================================
📋 INSTRUÇÕES DE USO:
========================================================================= 

1. USANDO ATRIBUTO DATA-PADRAO (Recomendado):
<input type="text" data-padrao placeholder="DD/MM/AAAA">

2. USANDO ID COM "DATA" NO NOME:
<input type="text" id="datapracaInstituidor">
<input type="text" id="dataNascimento">

3. APLICAÇÃO MANUAL EM CAMPO ESPECÍFICO:
aplicarMascaraDataEB('meuCampoId');

4. VALIDAÇÃO DE DATA:
if (validarDataEB('12 JAN 25')) {
console.log('✅ Data válida!');
}

5. CONVERSÃO PARA ISO (para envio ao servidor):
const dataISO = converterDataEBParaISO('12 JAN 25');
   // Retorna: "2025-01-12"

6. EXEMPLOS DE FORMATAÇÃO:
- 12/01/2025 → "12 JAN 25"
- 01/01/2025 → "1° JAN 25"
- 12/01/1995 → "12 JAN 1995"
- 01/01/1995 → "1° JAN 1995"

7. COMPORTAMENTO DURANTE EDIÇÃO:
- Durante digitação: mostra DD/MM/AAAA
- Ao sair do campo (blur): converte para formato EB
- Ao focar novamente: volta para DD/MM/AAAA para facilitar edição

/* ========================================================================
✨ FIM DO SISTEMA DE FORMATAÇÃO DE DATA PADRÃO EB
========================================================================= */

/* ========================================================================
💾 SEÇÃO 21: SISTEMA DE ARMAZENAMENTO AUTOMÁTICO
========================================================================= */

/**
 * 🔧 Configurar armazenamento automático para todos os campos
 * Salva dados automaticamente quando houver mudanças
 */
function configurarArmazenamentoAutomatico() {
  console.log('💾 Configurando armazenamento automático...');

  // === CAMPOS DO INSTITUIDOR ===
  const camposInstituidor = [
    'nomeInstituidor',
    'postoRealInstituidor',
    'armaServicoInstituidor',
    'condicaoMilitar',
    'dataFalecimento',
    'tipoObito',
    'svpRegional',
    'orgaoSVP',
  ];

  camposInstituidor.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      // Salvar ao digitar (input) e ao mudar (change)
      campo.addEventListener('input', () => {
        salvarInstituidor();
        console.log(`💾 Campo ${campoId} salvo automaticamente`);
      });
      campo.addEventListener('change', () => {
        salvarInstituidor();
        console.log(`💾 Campo ${campoId} salvo automaticamente (change)`);
      });
    }
  });

  // === CAMPOS DO CÁLCULO ===
  const camposCalculo = [
    'postoReal',
    'postoProventos',
    'postoRBGHI',
    'acordao631',
    'acordao2225',
    'contribuicaoPensao',
    'soldoGenBda',
    'adicionalTempo',
    'adicionalCompensacao',
    'adicionalMilitar',
    'adicionalHabilitacao',
    'adicionalOrganica',
    'adicionalPermanencia',
  ];

  camposCalculo.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.addEventListener('input', () => {
        salvarCalculo();
        atualizarContracheque(); // Atualizar contracheque em tempo real
        console.log(`💾 Campo de cálculo ${campoId} salvo automaticamente`);
      });
      campo.addEventListener('change', () => {
        salvarCalculo();
        atualizarContracheque();
        console.log(`💾 Campo de cálculo ${campoId} salvo automaticamente (change)`);
      });
    }
  });

  console.log(`✅ Armazenamento automático configurado para ${camposInstituidor.length + camposCalculo.length} campos`);
}

/**
 * 🔄 Restaurar todos os dados salvos
 * Carrega dados do localStorage ao iniciar o sistema
 */
function restaurarDadosSalvos() {
  console.log('🔄 Iniciando restauração de dados salvos...');

  try {
    restaurarInstituidor();
    restaurarRequerentes();
    restaurarCalculo();
    console.log('✅ Restauração de dados concluída');
  } catch (error) {
    console.error('❌ Erro durante restauração:', error);
  }
}

/**
 * 🔄 Restaurar dados do instituidor
 */
function restaurarInstituidor() {
  try {
    const dadosSalvos = localStorage.getItem('pensaoMilitar_instituidor');
    if (dadosSalvos) {
      estadoAtual.instituidor = JSON.parse(dadosSalvos);

      // Preencher campos com dados salvos
      Object.keys(estadoAtual.instituidor).forEach((campo) => {
        const elemento = document.getElementById(campo);
        if (elemento && estadoAtual.instituidor[campo]) {
          elemento.value = estadoAtual.instituidor[campo];
          handleLabelFloat(elemento); // Ativar label flutuante
        }
      });

      console.log(`🔄 ${Object.keys(estadoAtual.instituidor).length} campos do instituidor restaurados`);
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar dados do instituidor:', error);
  }
}

/**
 * 🔄 Restaurar dados dos requerentes
 */
function restaurarRequerentes() {
  try {
    const dadosSalvos = localStorage.getItem('pensaoMilitar_requerentes');
    if (dadosSalvos) {
      estadoAtual.requerentes = JSON.parse(dadosSalvos);
      estadoAtual.contadorRequerentes = Math.max(...estadoAtual.requerentes.map((r) => r.id), 0);

      // Recriar a interface dos requerentes
      renderizarRequerentes();

      console.log(`🔄 ${estadoAtual.requerentes.length} requerentes restaurados`);
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar dados dos requerentes:', error);
  }
}

/**
 * 🔄 Restaurar dados do cálculo
 */
function restaurarCalculo() {
  try {
    const dadosSalvos = localStorage.getItem('pensaoMilitar_calculo');
    if (dadosSalvos) {
      estadoAtual.calculo = JSON.parse(dadosSalvos);

      // Preencher campos com dados salvos
      Object.keys(estadoAtual.calculo).forEach((campo) => {
        const elemento = document.getElementById(campo);
        if (elemento && estadoAtual.calculo[campo]) {
          elemento.value = estadoAtual.calculo[campo];
          handleLabelFloat(elemento); // Ativar label flutuante
        }
      });

      // Atualizar contracheque com dados restaurados
      atualizarContracheque();

      console.log(`🔄 ${Object.keys(estadoAtual.calculo).length} campos do cálculo restaurados`);
    }

    // Restaurar dados do contracheque
    const contraquequeSalvo = localStorage.getItem('pensaoMilitar_contracheque');
    if (contraquequeSalvo) {
      estadoAtual.contracheque = JSON.parse(contraquequeSalvo);
      console.log('🔄 Contracheque restaurado');
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar dados do cálculo:', error);
  }
}

/* ========================================================================
💾 SEÇÃO 22: FUNÇÕES DE SALVAMENTO DOS DADOS
========================================================================= */

/**
 * 💾 Salvar dados completos do instituidor (ABA 2)
 */
function salvarcadastroInstituidor() {
  console.log('💾 Salvando dados completos do instituidor...');

  // === CAMPOS CADASTRAIS ===
  const camposCadastrais = [
    'nomeInstituidor',
    'postoRealInstituidor',
    'condicaoMilitar',
    'cpfInstituidor',
    'identidadeInstituidor',
    'precInstituidor',
    'dataPracaInstituidor',
    'armaServicoInstituidor',
    'cursoInstituidor',
    'dataFalecimentoInstituidor',
    'certidaoObito',
    'dataLavraturaCertidaoInstituidor',
    'livroObito',
    'folhaObito',
  ];

  // === CAMPOS TEMPOS DE SERVIÇO ===
  const camposTemposServico = [
    'tempoEfetivoServico',
    'tempoServicoPublico',
    'tempoServicoPrivado',
    'tempoServicoAcademico',
    'tempoAlunoOFR',
    'tempoGuarnicaoEspecial',
    'tempoLENaoGozada',
    'tempoServicoNaoComputado',
    'tempoServicoTotal',
    'tempoServicoProventos',
  ];

  // === CAMPOS RESERVA REMUNERADA ===
  const camposReserva = [
    'dataPassagemReserva',
    'tipoReserva',
    'atoPortariaReserva',
    'douReserva',
    'dataPublicacaoDOUReserva',
    'postoProventos',
  ];

  // === CAMPOS REFORMA ===
  const camposReforma = [
    'dataReforma',
    'motivoReforma',
    'atoPortariaReforma',
    'douReforma',
    'dataPublicacaoDOUReforma',
    'postoReforma',
    'svpVinculacao',
  ];

  // === CAMPOS RBGHI ===
  const camposRBGHI = ['atoPortariaRBGHI', 'douRBGHI', 'dataPublicacaoDOURBGHI', 'postoRBGHI'];

  // === PROCESSAR TODOS OS CAMPOS ===
  let camposSalvos = 0;
  const todosCampos = [...camposCadastrais, ...camposTemposServico, ...camposReserva, ...camposReforma, ...camposRBGHI];

  todosCampos.forEach((campoId) => {
    const elemento = document.getElementById(campoId);
    if (elemento) {
      let valor = elemento.value;

      // Aplicar formatação específica para nomes (maiúsculas)
      if (campoId.includes('nome') || campoId.includes('Nome')) {
        if (valor) {
          valor = valor.toUpperCase();
          elemento.value = valor;
        }
      }

      // Salvar no estado
      estadoAtual.instituidor[campoId] = valor;
      camposSalvos++;
    }
  });

  // === SALVAR NO LOCALSTORAGE ===
  localStorage.setItem('pensaoMilitar_instituidor', JSON.stringify(estadoAtual.instituidor));

  console.log(`✅ ${camposSalvos} campos do instituidor salvos com sucesso`);
  mostrarNotificacao(`Dados do Instituidor salvos! (${camposSalvos} campos)`, 'sucesso');
}

/**
 * 💾 Salvar dados dos requerentes no localStorage
 */
function salvarRequerentes() {
  console.log('💾 Salvando dados dos requerentes...');

  // Salvar no localStorage
  localStorage.setItem('pensaoMilitar_requerentes', JSON.stringify(estadoAtual.requerentes));

  console.log(`✅ ${estadoAtual.requerentes.length} requerentes salvos com sucesso`);
}

/**
 * 💾 Salvar dados do cálculo no localStorage
 */
function salvarCalculo() {
  console.log('💾 Salvando dados do cálculo...');

  // Lista de campos do cálculo
  const campos = [
    'postoReal',
    'postoProventos',
    'postoRBGHI',
    'acordao631',
    'acordao2225',
    'contribuicaoPensao',
    'soldoGenBda',
    'adicionalTempo',
    'adicionalCompensacao',
    'adicionalMilitar',
    'adicionalHabilitacao',
    'adicionalOrganica',
    'adicionalPermanencia',
  ];

  campos.forEach((campoId) => {
    const elemento = document.getElementById(campoId);
    if (elemento) {
      estadoAtual.calculo[campoId] = elemento.value;
    }
  });

  // Salvar no localStorage
  localStorage.setItem('pensaoMilitar_calculo', JSON.stringify(estadoAtual.calculo));

  console.log('✅ Dados do cálculo salvos com sucesso');
}

/**
 * 💾 Salvar dados do contracheque no localStorage
 */
function salvarContracheque() {
  // Salvar no localStorage
  localStorage.setItem('pensaoMilitar_contracheque', JSON.stringify(estadoAtual.contracheque));
  console.log('✅ Contracheque salvo automaticamente');
}

/* =========================================================================
🧩 SEÇÃO 23: SISTEMA DE REQUERENTES DINÂMICO - VERSÃO COMPLETA
========================================================================= */

/* =========================================================================
📌 VARIÁVEIS GLOBAIS E ESTADO
========================================================================= */

let estadoAtualEstado = {
  requerentes: [],
  contadorRequerentes: 0,
};

let contadorProcessos = 0;
let contadorPensionistas = 0;
let contadorRenuncias = 0;
let contadorCotasReserva = 0;
let contadorRemuneracoes = {};
let contadorCotasIncorporadas = {};

/* =========================================================================
📌 SEÇÃO 23.1: TOGGLES PRINCIPAIS
========================================================================= */

/**
 * 🔄 Toggle: Informações Gerais Sobre o Processo
 */
function toggleInformacoesGerais() {
  const container = document.getElementById('containerInformacoesGerais');
  const icon = document.getElementById('toggleInformacoesGeraisIcon');

  if (container && icon) {
    container.classList.toggle('hidden');
    icon.className = container.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

/**
 * 🔄 Toggle: Cadastro de Requerentes
 */
function toggleCadastroRequerentes() {
  const container = document.getElementById('containerCadastroRequerentes');
  const icon = document.getElementById('toggleCadastroRequerentesIcon');

  if (container && icon) {
    container.classList.toggle('hidden');
    icon.className = container.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

/* =========================================================================
📂 ADICIONAR PROCESSO
========================================================================= */

function adicionarProcesso() {
  console.log('➕ Adicionando processo...');

  const novoId = ++contadorProcessos;
  const container = document.getElementById('listaProcessos');

  if (!container) {
    console.error('❌ Container de processos não encontrado');
    return;
  }

  const html = criarHtmlProcesso(novoId);
  container.insertAdjacentHTML('beforeend', html);

  inicializarMascarasNUP();
  window.reinitFloatingLabels?.();

  console.log(`✅ Processo ${novoId} adicionado`);
  mostrarNotificacao('Processo adicionado com sucesso!', 'sucesso');
}

function removerProcesso(id) {
  if (!confirm('Tem certeza que deseja remover este processo?')) return;

  const elemento = document.getElementById(`processo-${id}`);
  if (elemento) {
    elemento.remove();
    console.log(`✅ Processo ${id} removido`);
    mostrarNotificacao('Processo removido!', 'sucesso');
  }
}

function toggleProcesso(id) {
  const grid = document.getElementById(`gridProcesso-${id}`);
  const icon = document.getElementById(`iconProcesso-${id}`);

  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function criarHtmlProcesso(id) {
  return `
    <div id="processo-${id}" style="background: white; border-radius: 12px; padding: 20px; 
    margin-bottom: 15px; box-shadow: 0 2px 8px rgba(44, 104, 188, 0.1); border-left: 4px solid #2c68bc;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
          <i class="fas fa-folder-open" style="color: #2c68bc;"></i>
          Processo Digital ${id}
        </h4>
        <button type="button" onclick="removerProcesso(${id})" 
                style="background: #e74c3c; color: white; border: none; border-radius: 6px; 
                padding: 6px 12px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;">
          <i class="fas fa-trash-alt"></i> Remover
        </button>
      </div>

      <button onclick="toggleProcesso(${id})" 
              style="width: 100%; padding: 10px; background: #2c68bc; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span><i class="fas fa-list-check"></i> Dados do Processo</span>
        <i id="iconProcesso-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridProcesso-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px;">
        
        <div class="campo-flutuante">
          <select id="tipoProcesso-${id}" required>
            <option value="" selected hidden></option>
            <option value="Habilitação Inicial à Pensão Militar">Habilitação Inicial à Pensão Militar</option>
            <option value="Reversão da Pensão Militar">Reversão da Pensão Militar</option>
            <option value="Transferência de Cota-parte">Transferência de Cota-parte</option>
            <option value="Habilitação de Pensão Graciosa">Habilitação de Pensão Graciosa</option>
            <option value="Habilitação Inicial à Pensão Militar e Transferência de Cota-parte">Habilitação Inicial à Pensão Militar e Transferência de Cota-parte</option>
            <option value="Reversão da Pensão Militar e Transferência de Cota-parte">Reversão da Pensão Militar e Transferência de Cota-parte</option>
          </select>
          <label for="tipoProcesso-${id}">Tipo de Processo</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="numeroNUP-${id}" data-nup maxlength="22" 
                 placeholder=" " required autocomplete="off">
          <label for="numeroNUP-${id}">Número do NUP</label>
        </div>

      </div>
    </div>
  `;
}

/**
 * 🔢 Formatar NUP (65476.017052/2025-31)
 */
function formatarNUP(valor) {
  valor = valor.replace(/\D/g, '');
  if (valor.length > 20) valor = valor.slice(0, 20);
  if (valor.length <= 5) return valor;
  if (valor.length <= 11) return valor.slice(0, 5) + '.' + valor.slice(5);
  if (valor.length <= 15) return valor.slice(0, 5) + '.' + valor.slice(5, 11) + '/' + valor.slice(11);
  return valor.slice(0, 5) + '.' + valor.slice(5, 11) + '/' + valor.slice(11, 15) + '-' + valor.slice(15, 17);
}

/* =========================================================================
📂 ADICIONAR PENSIONISTA FALECIDA
========================================================================= */

function adicionarPensionista() {
  console.log('➕ Adicionando pensionista falecida...');

  const novoId = ++contadorPensionistas;
  const container = document.getElementById('listaPensionistas');

  if (!container) {
    console.error('❌ Container de pensionistas não encontrado');
    return;
  }

  const html = criarHtmlPensionista(novoId);
  container.insertAdjacentHTML('beforeend', html);

  inicializarMascarasCPF();
  inicializarMascarasPrecCP();
  inicializarMascarasDataEB();
  inicializarMascarasCertidaoObito();
  window.reinitFloatingLabels?.();

  popularSelectSVPVinculacao(`svpPensionista-${novoId}`);

  console.log(`✅ Pensionista ${novoId} adicionada`);
  mostrarNotificacao('Pensionista adicionada com sucesso!', 'sucesso');
}

function removerPensionista(id) {
  if (!confirm('Tem certeza que deseja remover esta pensionista?')) return;

  const elemento = document.getElementById(`pensionista-${id}`);
  if (elemento) {
    elemento.remove();
    console.log(`✅ Pensionista ${id} removida`);
    mostrarNotificacao('Pensionista removida!', 'sucesso');
  }
}

function togglePensionista(id) {
  const grid = document.getElementById(`gridPensionista-${id}`);
  const icon = document.getElementById(`iconPensionista-${id}`);

  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function criarHtmlPensionista(id) {
  return `
    <div id="pensionista-${id}" style="background: white; border-radius: 12px; padding: 20px; 
    margin-bottom: 15px; box-shadow: 0 2px 8px rgba(44, 104, 188, 0.1); border-left: 4px solid #5a6c7d;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
          <i class="fas fa-user-times" style="color: #5a6c7d;"></i>
          Pensionista Falecida ${id}
        </h4>
        <button type="button" onclick="removerPensionista(${id})" 
                style="background: #e74c3c; color: white; border: none; border-radius: 6px; 
                padding: 6px 12px; cursor: pointer; font-size: 0.85rem;">
          <i class="fas fa-trash-alt"></i> Remover
        </button>
      </div>

      <button onclick="togglePensionista(${id})" 
              style="width: 100%; padding: 10px; background: #5a6c7d; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span><i class="fas fa-info-circle"></i> Informações da Pensionista</span>
        <i id="iconPensionista-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridPensionista-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px;">
        
        <div class="campo-flutuante">
          <input type="text" id="nomePensionista-${id}" required autocomplete="off" 
                 placeholder=" " oninput="converterParaMaiusculas(this)">
          <label for="nomePensionista-${id}">Nome da Pensionista Falecida</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="precPensionista-${id}" data-prec maxlength="9" 
                 placeholder=" " required autocomplete="off">
          <label for="precPensionista-${id}">Prec/CP</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="cpfPensionista-${id}" data-cpf maxlength="14" 
                 placeholder=" " required autocomplete="off">
          <label for="cpfPensionista-${id}">CPF</label>
        </div>

        <div class="campo-flutuante">
          <select id="svpPensionista-${id}" required>
            <option value="" selected hidden></option>
          </select>
          <label for="svpPensionista-${id}">SVP de Vinculação</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataObitoPensionista-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataObitoPensionista-${id}">Data do Óbito</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="certidaoPensionista-${id}" data-certidao-obito 
                 maxlength="40" placeholder=" " required autocomplete="off">
          <label for="certidaoPensionista-${id}">Número da Certidão de Óbito</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataLavraturaPensionista-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataLavraturaPensionista-${id}">Data de Lavratura</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="orgaoExpeditorPensionista-${id}" required autocomplete="off" 
                 placeholder=" ">
          <label for="orgaoExpeditorPensionista-${id}">Órgão Expeditor</label>
        </div>

      </div>
    </div>
  `;
}

/* =========================================================================
📂 ADICIONAR RENÚNCIA
========================================================================= */

function adicionarRenuncia() {
  console.log('➕ Adicionando renúncia...');

  const novoId = ++contadorRenuncias;
  const container = document.getElementById('listaRenuncias');

  if (!container) {
    console.error('❌ Container de renúncias não encontrado');
    return;
  }

  const html = criarHtmlRenuncia(novoId);
  container.insertAdjacentHTML('beforeend', html);

  inicializarMascarasCPF();
  inicializarMascarasDataEB();
  inicializarMascarasCertidaoObito();
  window.reinitFloatingLabels?.();

  popularSelectCondicaoRequerente(`condicaoRenuncia-${novoId}`);

  console.log(`✅ Renúncia ${novoId} adicionada`);
  mostrarNotificacao('Renúncia adicionada com sucesso!', 'sucesso');
}

function removerRenuncia(id) {
  if (!confirm('Tem certeza que deseja remover esta renúncia?')) return;

  const elemento = document.getElementById(`renuncia-${id}`);
  if (elemento) {
    elemento.remove();
    console.log(`✅ Renúncia ${id} removida`);
    mostrarNotificacao('Renúncia removida!', 'sucesso');
  }
}

function toggleRenuncia(id) {
  const grid = document.getElementById(`gridRenuncia-${id}`);
  const icon = document.getElementById(`iconRenuncia-${id}`);

  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function criarHtmlRenuncia(id) {
  return `
    <div id="renuncia-${id}" style="background: white; border-radius: 12px; padding: 20px; 
    margin-bottom: 15px; box-shadow: 0 2px 8px rgba(44, 104, 188, 0.1); border-left: 4px solid #7d8a96;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
          <i class="fas fa-user-slash" style="color: #7d8a96;"></i>
          Renúncia ${id}
        </h4>
        <button type="button" onclick="removerRenuncia(${id})" 
                style="background: #e74c3c; color: white; border: none; border-radius: 6px; 
                padding: 6px 12px; cursor: pointer; font-size: 0.85rem;">
          <i class="fas fa-trash-alt"></i> Remover
        </button>
      </div>

      <button onclick="toggleRenuncia(${id})" 
              style="width: 100%; padding: 10px; background: #7d8a96; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span><i class="fas fa-info-circle"></i> Informações da Renúncia</span>
        <i id="iconRenuncia-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridRenuncia-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px;">
        
        <div class="campo-flutuante">
          <input type="text" id="nomeRenuncia-${id}" required autocomplete="off" 
                 placeholder=" " oninput="converterParaMaiusculas(this)">
          <label for="nomeRenuncia-${id}">Nome da Beneficiária</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="cpfRenuncia-${id}" data-cpf maxlength="14" 
                 placeholder=" " required autocomplete="off">
          <label for="cpfRenuncia-${id}">CPF</label>
        </div>

        <div class="campo-flutuante">
          <select id="condicaoRenuncia-${id}" required>
            <option value="" selected hidden></option>
          </select>
          <label for="condicaoRenuncia-${id}">Condição de Vínculo</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataRenuncia-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataRenuncia-${id}">Data da Renúncia</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="certidaoRenuncia-${id}" data-certidao-obito 
                 maxlength="40" placeholder=" " required autocomplete="off">
          <label for="certidaoRenuncia-${id}">Nº Certidão Pública</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataLavraturaRenuncia-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataLavraturaRenuncia-${id}">Data de Lavratura</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="orgaoExpeditorRenuncia-${id}" required autocomplete="off" 
                 placeholder=" ">
          <label for="orgaoExpeditorRenuncia-${id}">Órgão Expeditor</label>
        </div>

      </div>
    </div>
  `;
}

/* =========================================================================
📂 ADICIONAR COTA RESERVA
========================================================================= */

function adicionarCotaReserva() {
  console.log('➕ Adicionando cota reserva...');

  const novoId = ++contadorCotasReserva;
  const container = document.getElementById('listaCotasReserva');

  if (!container) {
    console.error('❌ Container de cotas reserva não encontrado');
    return;
  }

  const html = criarHtmlCotaReserva(novoId);
  container.insertAdjacentHTML('beforeend', html);

  inicializarMascarasCPF();
  inicializarMascarasDataEB();
  window.reinitFloatingLabels?.();

  popularSelectCondicaoRequerente(`condicaoCotaReserva-${novoId}`);

  console.log(`✅ Cota Reserva ${novoId} adicionada`);
  mostrarNotificacao('Cota Reserva adicionada com sucesso!', 'sucesso');
}

function removerCotaReserva(id) {
  if (!confirm('Tem certeza que deseja remover esta cota reserva?')) return;

  const elemento = document.getElementById(`cotaReserva-${id}`);
  if (elemento) {
    elemento.remove();
    console.log(`✅ Cota Reserva ${id} removida`);
    mostrarNotificacao('Cota Reserva removida!', 'sucesso');
  }
}

function toggleCotaReserva(id) {
  const grid = document.getElementById(`gridCotaReserva-${id}`);
  const icon = document.getElementById(`iconCotaReserva-${id}`);

  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function criarHtmlCotaReserva(id) {
  return `
    <div id="cotaReserva-${id}" style="background: white; border-radius: 12px; padding: 20px; 
    margin-bottom: 15px; box-shadow: 0 2px 8px rgba(44, 104, 188, 0.1); border-left: 4px solid #9aa5b1;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
          <i class="fas fa-user-clock" style="color: #9aa5b1;"></i>
          Cota Reserva ${id}
        </h4>
        <button type="button" onclick="removerCotaReserva(${id})" 
                style="background: #e74c3c; color: white; border: none; border-radius: 6px; 
                padding: 6px 12px; cursor: pointer; font-size: 0.85rem;">
          <i class="fas fa-trash-alt"></i> Remover
        </button>
      </div>

      <button onclick="toggleCotaReserva(${id})" 
              style="width: 100%; padding: 10px; background: #9aa5b1; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span><i class="fas fa-info-circle"></i> Informações da Cota</span>
        <i id="iconCotaReserva-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridCotaReserva-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px;">
        
        <div class="campo-flutuante">
          <input type="text" id="nomeCotaReserva-${id}" required autocomplete="off" 
                 placeholder=" " oninput="converterParaMaiusculas(this)">
          <label for="nomeCotaReserva-${id}">Nome da Beneficiária</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="cpfCotaReserva-${id}" data-cpf maxlength="14" 
                 placeholder=" " autocomplete="off">
          <label for="cpfCotaReserva-${id}">CPF (opcional)</label>
        </div>

        <div class="campo-flutuante">
          <select id="condicaoCotaReserva-${id}" required>
            <option value="" selected hidden></option>
          </select>
          <label for="condicaoCotaReserva-${id}">Condição de Vínculo</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataLimiteCotaReserva-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataLimiteCotaReserva-${id}">Data Limite de Reserva</label>
        </div>

      </div>
    </div>
  `;
}

/* =========================================================================
📌 SEÇÃO 23.2: ADICIONAR REQUERENTE
========================================================================= */

function adicionarRequerente() {
  console.log('➕ Adicionando requerente...');

  const novoId = ++estadoAtual.contadorRequerentes;
  const novoRequerente = {
    id: novoId,
    nomeRequerente: '',
    estadoCivil: '',
    sexo: '',
    cpfRequerente: '',
    numeroRG: '',
    orgaoExpeditorRG: '',
    precCP: '',
    dataNascimento: '',
    naturalidade: '',
    invalidez: '',
    parentesco: '',
    svpVinculacao: '',
    tipoPensao: '',
    dataInicioPensao: '',
    condicaoPensao: '',
    dataLimitePensao: '',
    percentualCota: '',
    percentualExtenso: '',
    valorAtualCota: '',
    valorExtenso: '',
    fusex: '',
    exerciciosAnteriores: '',
    banco: '',
    agenciaBancaria: '',
    numeroConta: '',
    remuneracoes: [],
    cotasIncorporadas: [],
  };

  estadoAtual.requerentes.push(novoRequerente);
  renderizarRequerentes();

  console.log(`✅ Requerente ${novoId} adicionado`);
  mostrarNotificacao('Requerente adicionado com sucesso!', 'sucesso');

  setTimeout(() => {
    const elemento = document.getElementById(`requerente-${novoId}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);
}

function renderizarRequerentes() {
  const lista = document.getElementById('listaRequerentes');
  if (!lista) return;

  lista.innerHTML = '';

  if (estadoAtual.requerentes.length === 0) {
    lista.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #95a5a6;">
        <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
        <p style="font-size: 1.1rem;">Nenhum requerente cadastrado.</p>
      </div>
    `;
    return;
  }

  estadoAtual.requerentes.forEach((req, idx) => {
    const html = criarHtmlRequerente(req.id, idx + 1);
    lista.insertAdjacentHTML('beforeend', html);
    configurarEventosRequerente(req.id);
  });

  window.reinitFloatingLabels?.();
}

function criarHtmlRequerente(id, numero) {
  return `
    <div id="requerente-${id}" style="background: white; border-radius: 12px; padding: 25px; 
    margin-bottom: 20px; box-shadow: 0 2px 12px rgba(44, 104, 188, 0.15); border-left: 5px solid #2c68bc;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; 
      padding-bottom: 15px; border-bottom: 2px solid #ecf0f1;">
        <h3 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 10px; font-size: 1.25rem;">
          <i class="fas fa-user-circle" style="color: #2c68bc;"></i>
          Requerente ${numero}
        </h3>
        <div style="display: flex; gap: 10px;">
          <button type="button" onclick="exportarTPM(${id})" 
                  style="background: #2c68bc; color: white; border: none; border-radius: 6px; 
                  padding: 8px 14px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.3s;">
            <i class="fas fa-file-word"></i> Exportar TPM
          </button>
          <button type="button" onclick="removerRequerente(${id})" 
                  style="background: #e74c3c; color: white; border: none; border-radius: 6px; 
                  padding: 8px 14px; cursor: pointer; font-size: 0.9rem;">
            <i class="fas fa-trash-alt"></i> Remover
          </button>
        </div>
      </div>

      <!-- Toggle 1: Informações do Requerente -->
      <button onclick="toggleInfoRequerente(${id})" 
              style="width: 100%; padding: 12px; background: #2c68bc; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span><i class="fas fa-id-card"></i> Informações do Requerente</span>
        <i id="iconInfoReq-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridInfoReq-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px; margin-bottom: 15px;">
        
        <div class="campo-flutuante">
          <input type="text" id="nomeRequerente-${id}" required autocomplete="off" 
                 placeholder=" " oninput="converterParaMaiusculas(this)">
          <label for="nomeRequerente-${id}">Nome da Beneficiária</label>
        </div>

        <div class="campo-flutuante">
          <select id="estadoCivil-${id}" required>
            <option value="" selected hidden></option>
            <option value="solteira">Solteira(o)</option>
            <option value="casada">Casada(o)</option>
            <option value="separada">Separada(o) Judicialmente</option>
            <option value="desquitada">Desquitada(o) Judicialmente</option>
            <option value="viuva">Viúva(o)</option>
            <option value="divorciada">Divorciada(o)</option>
          </select>
          <label for="estadoCivil-${id}">Estado Civil</label>
        </div>

        <div class="campo-flutuante">
          <select id="sexo-${id}" required>
            <option value="" selected hidden></option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
          </select>
          <label for="sexo-${id}">Sexo</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="cpfRequerente-${id}" data-cpf maxlength="14" 
                 placeholder=" " required autocomplete="off">
          <label for="cpfRequerente-${id}">CPF</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="numeroRG-${id}" required autocomplete="off" placeholder=" ">
          <label for="numeroRG-${id}">Número do RG</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="orgaoExpeditorRG-${id}" required autocomplete="off" placeholder=" ">
          <label for="orgaoExpeditorRG-${id}">Órgão Expeditor do RG</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="precCP-${id}" data-prec maxlength="9" 
                 placeholder=" " required autocomplete="off">
          <label for="precCP-${id}">Prec/CP</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataNascimento-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataNascimento-${id}">Data de Nascimento</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="naturalidade-${id}" required autocomplete="off" placeholder=" ">
          <label for="naturalidade-${id}">Naturalidade</label>
        </div>

        <div class="campo-flutuante">
          <select id="invalidez-${id}" required>
            <option value="" selected hidden></option>
            <option value="nao-invalida">Não é inválida(o)</option>
            <option value="invalida">É inválida(o)</option>
          </select>
          <label for="invalidez-${id}">Invalidez</label>
        </div>

        <div class="campo-flutuante">
          <select id="parentesco-${id}" required>
            <option value="" selected hidden></option>
          </select>
          <label for="parentesco-${id}">Parentesco (condição)</label>
        </div>

      </div>

      <!-- Toggle 2: Dados da Pensão -->
      <button onclick="togglePensaoRequerente(${id})" 
              style="width: 100%; padding: 12px; background: #2c68bc; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span><i class="fas fa-money-check-alt"></i> Dados da Pensão Militar</span>
        <i id="iconPensaoReq-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridPensaoReq-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px; margin-bottom: 15px;">
        
        <div class="campo-flutuante">
          <select id="svpVinculacao-${id}" required>
            <option value="" selected hidden></option>
          </select>
          <label for="svpVinculacao-${id}">SVP(UA) de Vinculação</label>
        </div>

        <div class="campo-flutuante">
          <select id="tipoPensao-${id}" required>
            <option value="" selected hidden></option>
            <option value="habilitacao-condicional">Habilitação Condicional</option>
            <option value="pensao-inicial">Pensão Inicial</option>
            <option value="reversao">Reversão da Pensão</option>
            <option value="transferencia">Transferência de Cota-parte</option>
            <option value="melhoria">Melhoria da Pensão</option>
            <option value="judicial">Pensão Judicial</option>
          </select>
          <label for="tipoPensao-${id}">Tipo de Pensão</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataInicioPensao-${id}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataInicioPensao-${id}">Data Início da Pensão</label>
        </div>

        <div class="campo-flutuante">
          <select id="condicaoPensao-${id}" required onchange="toggleDataLimite(${id})">
            <option value="" selected hidden></option>
            <option value="tempo-determinado">Por tempo determinado</option>
            <option value="indeterminada">Indeterminada</option>
          </select>
          <label for="condicaoPensao-${id}">Condição da Pensão</label>
        </div>

        <div class="campo-flutuante" id="containerDataLimite-${id}" style="display: none;">
          <input type="text" id="dataLimitePensao-${id}" data-padrao 
                 placeholder=" " maxlength="15" autocomplete="off">
          <label for="dataLimitePensao-${id}">Data Limite da Pensão</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="percentualCota-${id}" placeholder=" " required autocomplete="off" 
                 oninput="formatarPercentual(this); gerarPercentualExtenso(${id})">
          <label for="percentualCota-${id}">Percentual da Cota-parte (%)</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="percentualExtenso-${id}" readonly 
                 style="background-color: #ecf0f1;" placeholder=" ">
          <label for="percentualExtenso-${id}">Percentual (extenso)</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="valorAtualCota-${id}" placeholder=" " required autocomplete="off" 
                 oninput="formatarMoedaBR(this); gerarValorExtenso(${id})">
          <label for="valorAtualCota-${id}">Valor Atual da Cota-parte</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="valorExtenso-${id}" readonly 
                 style="background-color: #ecf0f1;" placeholder=" ">
          <label for="valorExtenso-${id}">Valor (extenso)</label>
        </div>

        <div class="campo-flutuante">
          <select id="fusex-${id}" required>
            <option value="" selected hidden></option>
            <option value="nao-descontar">Não descontar FUSEx</option>
            <option value="descontar">Descontar FUSEx</option>
          </select>
          <label for="fusex-${id}">FUSEx</label>
        </div>

        <div class="campo-flutuante">
          <select id="exerciciosAnteriores-${id}" required>
            <option value="" selected hidden></option>
            <option value="possui">Possui Exercício Anterior</option>
            <option value="nao-possui">Não Possui</option>
          </select>
          <label for="exerciciosAnteriores-${id}">Exercícios Anteriores</label>
        </div>

      </div>

      <!-- Toggle 3: Dados Bancários -->
      <button onclick="toggleBancoRequerente(${id})" 
              style="width: 100%; padding: 12px; background: #2c68bc; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span><i class="fas fa-university"></i> Dados Bancários</span>
        <i id="iconBancoReq-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridBancoReq-${id}" class="hidden" style="display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 15px; margin-bottom: 15px;">
        
        <div class="campo-flutuante">
          <select id="banco-${id}" required>
            <option value="" selected hidden></option>
            <option value="001">001 - Banco do Brasil</option>
            <option value="104">104 - Caixa Econômica</option>
            <option value="033">033 - Santander</option>
            <option value="237">237 - Bradesco</option>
            <option value="341">341 - Itaú</option>
            <option value="041">041 - Banrisul</option>
            <option value="756">756 - Sicoob</option>
          </select>
          <label for="banco-${id}">Banco</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="agenciaBancaria-${id}" required autocomplete="off" placeholder=" ">
          <label for="agenciaBancaria-${id}">Agência</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="numeroConta-${id}" required autocomplete="off" 
                 placeholder=" " maxlength="14" oninput="formatarContaBancaria(this)">
          <label for="numeroConta-${id}">Número da Conta</label>
        </div>

      </div>

      <!-- Toggle 4: Remuneração de Outros Cofres -->
      <button onclick="toggleRemuneracaoRequerente(${id})" 
              style="width: 100%; padding: 12px; background: #2c68bc; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span><i class="fas fa-dollar-sign"></i> Remuneração de Outros Cofres</span>
        <i id="iconRemuneracaoReq-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridRemuneracaoReq-${id}" class="hidden" style="margin-bottom: 15px;">
        
        <div style="margin-bottom: 15px;">
          <button onclick="adicionarRemuneracao(${id})" 
                  style="background: #27ae60; color: white; border: none; padding: 10px 18px; 
                  border-radius: 6px; font-weight: 600; cursor: pointer;">
            <i class="fas fa-plus"></i> Adicionar Remuneração
          </button>
        </div>

        <div id="listaRemuneracoes-${id}"></div>

      </div>

      <!-- Toggle 5: Cotas Incorporadas -->
      <button onclick="toggleCotaIncorporadaRequerente(${id})" 
              style="width: 100%; padding: 12px; background: #2c68bc; color: white; 
              border: none; border-radius: 8px; font-weight: 600; cursor: pointer; 
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span><i class="fas fa-users"></i> Cotas Incorporadas</span>
        <i id="iconCotaIncReq-${id}" class="fas fa-chevron-down"></i>
      </button>

      <div id="gridCotaIncReq-${id}" class="hidden" style="margin-bottom: 15px;">
        
        <div style="margin-bottom: 15px;">
          <button onclick="adicionarCotaIncorporada(${id})" 
                  style="background: #27ae60; color: white; border: none; padding: 10px 18px; 
                  border-radius: 6px; font-weight: 600; cursor: pointer;">
            <i class="fas fa-plus"></i> Adicionar Cota Incorporada
          </button>
        </div>

        <div id="listaCotasIncorporadas-${id}"></div>

      </div>

    </div>
  `;
}

/**
 * 🔤 Formatar primeira letra maiúscula de cada palavra
 */
function formatarPrimeiraLetraMaiuscula(elemento) {
  let valor = elemento.value;
  elemento.value = valor.replace(/\b\w/g, (l) => l.toUpperCase());
}

/* =========================================================================
🔄 FUNÇÕES TOGGLE
========================================================================= */

function toggleInfoRequerente(id) {
  const grid = document.getElementById(`gridInfoReq-${id}`);
  const icon = document.getElementById(`iconInfoReq-${id}`);
  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function togglePensaoRequerente(id) {
  const grid = document.getElementById(`gridPensaoReq-${id}`);
  const icon = document.getElementById(`iconPensaoReq-${id}`);
  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function toggleBancoRequerente(id) {
  const grid = document.getElementById(`gridBancoReq-${id}`);
  const icon = document.getElementById(`iconBancoReq-${id}`);
  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function toggleRemuneracaoRequerente(id) {
  const grid = document.getElementById(`gridRemuneracaoReq-${id}`);
  const icon = document.getElementById(`iconRemuneracaoReq-${id}`);
  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function toggleCotaIncorporadaRequerente(id) {
  const grid = document.getElementById(`gridCotaIncReq-${id}`);
  const icon = document.getElementById(`iconCotaIncReq-${id}`);
  if (grid && icon) {
    grid.classList.toggle('hidden');
    icon.className = grid.classList.contains('hidden') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
}

function toggleDataLimite(id) {
  const select = document.getElementById(`condicaoPensao-${id}`);
  const container = document.getElementById(`containerDataLimite-${id}`);
  if (select && container) {
    container.style.display = select.value === 'tempo-determinado' ? 'block' : 'none';
  }
}

/* =========================================================================
💰 FORMATAÇÃO E CONVERSÃO
=======================================================================

/**
 * 🏦 Formatar número de NUP (Número Único de Protocolo)
 * Formato: 00000.000000/0000-00
 */
function formatarNUP(elemento) {
  let valor = elemento.value.replace(/\D/g, '');

  // Limita a 17 dígitos
  valor = valor.substring(0, 17);

  // Aplica a máscara: 00000.000000/0000-00
  if (valor.length > 0) {
    valor = valor.replace(/(\d{5})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{5})\.(\d{6})(\d)/, '$1.$2/$3');
    valor = valor.replace(/(\d{5})\.(\d{6})\/(\d{4})(\d)/, '$1.$2/$3-$4');
  }

  elemento.value = valor;
}

/**
 * 🔧 Inicializar máscaras de NUP
 */
function inicializarMascarasNUP() {
  const camposNUP = document.querySelectorAll('input[data-nup], input[id*="nup"], input[id*="Nup"], input[id*="NUP"]');

  camposNUP.forEach((campo) => {
    campo.placeholder = '00000.000000/0000-00';
    campo.maxLength = 21;

    campo.addEventListener('input', function (e) {
      formatarNUP(e.target);
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(e.target);
      }
    });

    if (campo.value) {
      formatarNUP(campo);
      if (typeof handleLabelFloat === 'function') {
        handleLabelFloat(campo);
      }
    }
  });

  console.log(`✅ Máscaras de NUP aplicadas em ${camposNUP.length} campos`);
}

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', inicializarMascarasNUP);

// Observar mudanças no DOM
const observadorNUP = new MutationObserver(() => {
  inicializarMascarasNUP();
});

observadorNUP.observe(document.body, {
  childList: true,
  subtree: true,
});

/**
 * 💰 Formatar percentual (00,00%)
 */
function formatarPercentual(elemento) {
  let valor = elemento.value.replace(/\D/g, '');

  if (valor.length === 0) {
    elemento.value = '';
    return;
  }

  valor = valor.padStart(3, '0');
  const inteiro = valor.slice(0, -2);
  const decimal = valor.slice(-2);

  elemento.value = `${inteiro},${decimal}`;
}

/**
 * 📝 Gerar percentual por extenso
 */
function gerarPercentualExtenso(requerenteId) {
  const percentual = document.getElementById(`percentualCota-${requerenteId}`).value;
  const campoExtenso = document.getElementById(`percentualExtenso-${requerenteId}`);

  if (!percentual || !campoExtenso) return;

  const valor = parseFloat(percentual.replace(',', '.'));
  if (isNaN(valor)) {
    campoExtenso.value = '';
    return;
  }

  campoExtenso.value = numeroParaExtenso(valor) + ' por cento';
}

/**
 * 💵 Formatar moeda brasileira (R$ 0.000,00)
 */
function formatarMoedaBR(elemento) {
  let valor = elemento.value.replace(/\D/g, '');

  if (valor.length === 0) {
    elemento.value = '';
    return;
  }

  valor = valor.padStart(3, '0');
  const centavos = valor.slice(-2);
  const reais = valor.slice(0, -2);

  const reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  elemento.value = `R$ ${reaisFormatado},${centavos}`;
}

/**
 * 📝 Gerar valor por extenso
 */
function gerarValorExtenso(requerenteId) {
  const valorCampo = document.getElementById(`valorAtualCota-${requerenteId}`).value;
  const campoExtenso = document.getElementById(`valorExtenso-${requerenteId}`);

  if (!valorCampo || !campoExtenso) return;

  const valor = parseFloat(valorCampo.replace(/[R$\s.]/g, '').replace(',', '.'));
  if (isNaN(valor)) {
    campoExtenso.value = '';
    return;
  }

  campoExtenso.value = valorPorExtenso(valor);
}

/**
 * 🔢 Converter número para extenso (simplificado)
 */
function numeroParaExtenso(numero) {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const especiais = [
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
  ];

  const inteiro = Math.floor(numero);
  const decimal = Math.round((numero - inteiro) * 100);

  let resultado = '';

  // Parte inteira
  if (inteiro >= 10 && inteiro < 20) {
    resultado = especiais[inteiro - 10];
  } else {
    const dez = Math.floor(inteiro / 10);
    const uni = inteiro % 10;
    resultado = dezenas[dez];
    if (uni > 0) {
      resultado += (dez > 0 ? ' e ' : '') + unidades[uni];
    }
  }

  // Parte decimal
  if (decimal > 0) {
    resultado += ' vírgula ';
    if (decimal >= 10 && decimal < 20) {
      resultado += especiais[decimal - 10];
    } else {
      const dez = Math.floor(decimal / 10);
      const uni = decimal % 10;
      resultado += dezenas[dez];
      if (uni > 0) {
        resultado += (dez > 0 ? ' e ' : '') + unidades[uni];
      }
    }
  }

  return resultado || 'zero';
}

/**
 * 💵 Converter valor monetário para extenso
 */
function valorPorExtenso(valor) {
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  let resultado = numeroParaExtenso(reais);
  resultado += reais === 1 ? ' real' : ' reais';

  if (centavos > 0) {
    resultado += ' e ' + numeroParaExtenso(centavos);
    resultado += centavos === 1 ? ' centavo' : ' centavos';
  }

  return resultado;
}

function formatarContaBancaria(el) {
  let valor = el.value.replace(/\D/g, '').substring(0, 13);
  if (valor.length > 12) {
    valor = valor.replace(/(\d{12})(\d)/, '$1-$2');
  }
  el.value = valor;
}

/* =========================================================================
➕ ADICIONAR REMUNERAÇÃO
========================================================================= */

function adicionarRemuneracao(reqId) {
  if (!contadorRemuneracoes[reqId]) contadorRemuneracoes[reqId] = 0;
  const novoId = ++contadorRemuneracoes[reqId];
  const container = document.getElementById(`listaRemuneracoes-${reqId}`);
  if (!container) return;

  const html = `
    <div id="remuneracao-${reqId}-${novoId}" style="background: #f8f9fa; border-radius: 8px; 
    padding: 15px; margin-bottom: 12px; border-left: 3px solid #27ae60;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h5 style="margin: 0; color: #2c3e50; font-size: 0.95rem;">
          <i class="fas fa-file-invoice-dollar"></i> Remuneração ${novoId}
        </h5>
        <button onclick="removerRemuneracao(${reqId}, ${novoId})" 
                style="background: #e74c3c; color: white; border: none; border-radius: 4px; 
                padding: 4px 10px; cursor: pointer; font-size: 0.85rem;">
          <i class="fas fa-times"></i> Remover
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        
        <div class="campo-flutuante">
          <input type="text" id="nomeOrgaoRem-${reqId}-${novoId}" required autocomplete="off" placeholder=" ">
          <label for="nomeOrgaoRem-${reqId}-${novoId}">Nome do Órgão</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="cargoRem-${reqId}-${novoId}" required autocomplete="off" placeholder=" ">
          <label for="cargoRem-${reqId}-${novoId}">Cargo/Função</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="valorRem-${reqId}-${novoId}" placeholder=" " 
                 required autocomplete="off" oninput="formatarMoedaBR(this)">
          <label for="valorRem-${reqId}-${novoId}">Remuneração Bruta</label>
        </div>

        <div class="campo-flutuante">
          <input type="month" id="mesRefRem-${reqId}-${novoId}" required autocomplete="off" placeholder=" ">
          <label for="mesRefRem-${reqId}-${novoId}">Mês de Referência</label>
        </div>

      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
  window.reinitFloatingLabels?.();
}

function removerRemuneracao(reqId, remId) {
  const el = document.getElementById(`remuneracao-${reqId}-${remId}`);
  if (el) el.remove();
}

/* =========================================================================
➕ ADICIONAR COTA INCORPORADA
========================================================================= */

function adicionarCotaIncorporada(reqId) {
  if (!contadorCotasIncorporadas[reqId]) contadorCotasIncorporadas[reqId] = 0;
  const novoId = ++contadorCotasIncorporadas[reqId];
  const container = document.getElementById(`listaCotasIncorporadas-${reqId}`);
  if (!container) return;

  const html = `
    <div id="cotaInc-${reqId}-${novoId}" style="background: #f8f9fa; border-radius: 8px; 
    padding: 15px; margin-bottom: 12px; border-left: 3px solid #8e44ad;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h5 style="margin: 0; color: #2c3e50; font-size: 0.95rem;">
          <i class="fas fa-child"></i> Filha(o) ${novoId}
        </h5>
        <button onclick="removerCotaIncorporada(${reqId}, ${novoId})" 
                style="background: #e74c3c; color: white; border: none; border-radius: 4px; 
                padding: 4px 10px; cursor: pointer; font-size: 0.85rem;">
          <i class="fas fa-times"></i> Remover
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        
        <div class="campo-flutuante">
          <input type="text" id="nomeFilhoCota-${reqId}-${novoId}" required autocomplete="off" 
                 placeholder=" " oninput="converterParaMaiusculas(this)">
          <label for="nomeFilhoCota-${reqId}-${novoId}">Nome do Filha(o)</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="cpfFilhoCota-${reqId}-${novoId}" data-cpf maxlength="14" 
                 placeholder=" " required autocomplete="off">
          <label for="cpfFilhoCota-${reqId}-${novoId}">CPF</label>
        </div>

        <div class="campo-flutuante">
          <input type="text" id="dataNascFilhoCota-${reqId}-${novoId}" data-padrao 
                 placeholder=" " maxlength="15" required autocomplete="off">
          <label for="dataNascFilhoCota-${reqId}-${novoId}">Data de Nascimento</label>
        </div>

        <div class="campo-flutuante">
          <select id="condicaoFilhoCota-${reqId}-${novoId}" required>
            <option value="" selected hidden></option>
          </select>
          <label for="condicaoFilhoCota-${reqId}-${novoId}">Condição de Vínculo</label>
        </div>

      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
  inicializarMascarasCPF();
  inicializarMascarasDataEB();
  window.reinitFloatingLabels?.();
  popularSelectCondicaoRequerente(`condicaoFilhoCota-${reqId}-${novoId}`);
}

function removerCotaIncorporada(reqId, cotaId) {
  const el = document.getElementById(`cotaInc-${reqId}-${cotaId}`);
  if (el) el.remove();
}

/* =========================================================================
🗑️ REMOVER REQUERENTE
========================================================================= */

function removerRequerente(id) {
  if (!confirm('Tem certeza que deseja remover este requerente?')) return;
  estadoAtual.requerentes = estadoAtual.requerentes.filter((r) => r.id !== id);
  renderizarRequerentes();
  salvarRequerentes();
  mostrarNotificacao('Requerente removido!', 'sucesso');
}

/* =========================================================================
🔧 CONFIGURAR EVENTOS
========================================================================= */

function configurarEventosRequerente(id) {
  const campos = [
    'nomeRequerente',
    'estadoCivil',
    'sexo',
    'cpfRequerente',
    'numeroRG',
    'orgaoExpeditorRG',
    'precCP',
    'dataNascimento',
    'naturalidade',
    'invalidez',
    'parentesco',
    'svpVinculacao',
    'tipoPensao',
    'dataInicioPensao',
    'condicaoPensao',
    'dataLimitePensao',
    'percentualCota',
    'valorAtualCota',
    'fusex',
    'exerciciosAnteriores',
    'banco',
    'agenciaBancaria',
    'numeroConta',
  ];

  campos.forEach((campo) => {
    const el = document.getElementById(`${campo}-${id}`);
    if (el) {
      el.addEventListener('input', (e) => atualizarRequerente(id, campo, e.target.value));
      el.addEventListener('change', (e) => atualizarRequerente(id, campo, e.target.value));
    }
  });

  popularSelectCondicaoRequerente(`parentesco-${id}`);
  popularSelectSVPVinculacao(`svpVinculacao-${id}`);
}

function atualizarRequerente(id, campo, valor) {
  const req = estadoAtual.requerentes.find((r) => r.id === id);
  if (req) {
    req[campo] = valor;
    salvarRequerentes();
  }
}

/* =========================================================================
💾 SALVAR E RESTAURAR
========================================================================= */

function salvarRequerentes() {
  console.log('💾 Salvando requerentes...');

  estadoAtual.requerentes.forEach((req) => {
    // Coletar remunerações
    req.remuneracoes = [];
    const listaRem = document.getElementById(`listaRemuneracoes-${req.id}`);
    if (listaRem) {
      const rems = listaRem.querySelectorAll('[id^="remuneracao-"]');
      rems.forEach((remDiv) => {
        const remId = remDiv.id.split('-')[2];
        const nomeOrgao = document.getElementById(`nomeOrgaoRem-${req.id}-${remId}`)?.value || '';
        const cargo = document.getElementById(`cargoRem-${req.id}-${remId}`)?.value || '';
        const valor = document.getElementById(`valorRem-${req.id}-${remId}`)?.value || '';
        const mesRef = document.getElementById(`mesRefRem-${req.id}-${remId}`)?.value || '';
        if (nomeOrgao || cargo || valor) {
          req.remuneracoes.push({ nomeOrgao, cargo, valor, mesRef });
        }
      });
    }

    // Coletar cotas incorporadas
    req.cotasIncorporadas = [];
    const listaCota = document.getElementById(`listaCotasIncorporadas-${req.id}`);
    if (listaCota) {
      const cotas = listaCota.querySelectorAll('[id^="cotaInc-"]');
      cotas.forEach((cotaDiv) => {
        const cotaId = cotaDiv.id.split('-')[2];
        const nome = document.getElementById(`nomeFilhoCota-${req.id}-${cotaId}`)?.value || '';
        const cpf = document.getElementById(`cpfFilhoCota-${req.id}-${cotaId}`)?.value || '';
        const dataNasc = document.getElementById(`dataNascFilhoCota-${req.id}-${cotaId}`)?.value || '';
        const condicao = document.getElementById(`condicaoFilhoCota-${req.id}-${cotaId}`)?.value || '';
        if (nome || cpf) {
          req.cotasIncorporadas.push({ nome, cpf, dataNasc, condicao });
        }
      });
    }
  });

  localStorage.setItem('pensaoMilitar_requerentes', JSON.stringify(estadoAtual.requerentes));
  console.log(`✅ ${estadoAtual.requerentes.length} requerentes salvos`);
}

function restaurarRequerentes() {
  try {
    const dados = localStorage.getItem('pensaoMilitar_requerentes');
    if (dados) {
      estadoAtual.requerentes = JSON.parse(dados);
      estadoAtual.contadorRequerentes = Math.max(...estadoAtual.requerentes.map((r) => r.id), 0);
      renderizarRequerentes();

      estadoAtual.requerentes.forEach((req) => {
        if (req.remuneracoes?.length > 0) {
          req.remuneracoes.forEach((rem, idx) => {
            adicionarRemuneracao(req.id);
            setTimeout(() => {
              const remId = idx + 1;
              document.getElementById(`nomeOrgaoRem-${req.id}-${remId}`).value = rem.nomeOrgao || '';
              document.getElementById(`cargoRem-${req.id}-${remId}`).value = rem.cargo || '';
              document.getElementById(`valorRem-${req.id}-${remId}`).value = rem.valor || '';
              document.getElementById(`mesRefRem-${req.id}-${remId}`).value = rem.mesRef || '';
            }, 100);
          });
        }

        if (req.cotasIncorporadas?.length > 0) {
          req.cotasIncorporadas.forEach((cota, idx) => {
            adicionarCotaIncorporada(req.id);
            setTimeout(() => {
              const cotaId = idx + 1;
              document.getElementById(`nomeFilhoCota-${req.id}-${cotaId}`).value = cota.nome || '';
              document.getElementById(`cpfFilhoCota-${req.id}-${cotaId}`).value = cota.cpf || '';
              document.getElementById(`dataNascFilhoCota-${req.id}-${cotaId}`).value = cota.dataNasc || '';
              document.getElementById(`condicaoFilhoCota-${req.id}-${cotaId}`).value = cota.condicao || '';
            }, 100);
          });
        }
      });

      console.log(`🔄 ${estadoAtual.requerentes.length} requerentes restaurados`);
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar requerentes:', error);
  }
}

/* =========================================================================
📋 POPULAR SELECTS
========================================================================= */

function popularSelectCondicaoRequerente(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  if (typeof condicaoRequerente === 'undefined' || condicaoRequerente.length === 0) {
    setTimeout(() => popularSelectCondicaoRequerente(selectId), 500);
    return;
  }

  select.innerHTML = '<option value="" selected hidden></option>';
  condicaoRequerente.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.condicao;
    opt.textContent = item.condicao;
    opt.setAttribute('data-codigo', item.codigo);
    select.appendChild(opt);
  });
}

function popularSelectSVPVinculacao(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  if (typeof dadosOrgao === 'undefined' || !dadosOrgao || dadosOrgao.length === 0) {
    setTimeout(() => popularSelectSVPVinculacao(selectId), 500);
    return;
  }

  select.innerHTML = '<option value="" selected hidden></option>';

  const ordenados = [...dadosOrgao].sort((a, b) => {
    if (a.categoria !== b.categoria) {
      return a.categoria === 'SVPR' ? -1 : 1;
    }
    return a.nome.localeCompare(b.nome);
  });

  let catAtual = '';
  ordenados.forEach((orgao) => {
    if (orgao.categoria !== catAtual) {
      if (catAtual !== '') {
        const sep = document.createElement('option');
        sep.disabled = true;
        sep.textContent = '─────────────────────';
        select.appendChild(sep);
      }

      const header = document.createElement('option');
      header.disabled = true;
      header.textContent = `▼ ${orgao.categoria}`;
      header.style.fontWeight = 'bold';
      select.appendChild(header);

      catAtual = orgao.categoria;
    }

    const opt = document.createElement('option');
    opt.value = orgao.sigla;
    opt.textContent = `${orgao.sigla} - ${orgao.cidade}`;
    opt.setAttribute('data-codom', orgao.codom || '');
    opt.setAttribute('data-nome', orgao.nome || '');
    select.appendChild(opt);
  });
}

/* =========================================================================
🎯 INICIALIZAÇÃO
========================================================================= */

document.addEventListener('DOMContentLoaded', function () {
  console.log('🎯 Inicializando SEÇÃO 23: Sistema de Requerentes');

  // Iniciar com containers ocultos
  ['containerInformacoesGerais', 'containerCadastroRequerentes'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Popular selects após carregamento das APIs
  setTimeout(() => {
    document.querySelectorAll('[id^="svpPensionista-"]').forEach((s) => popularSelectSVPVinculacao(s.id));
    document.querySelectorAll('[id^="condicaoRenuncia-"]').forEach((s) => popularSelectCondicaoRequerente(s.id));
    document.querySelectorAll('[id^="condicaoCotaReserva-"]').forEach((s) => popularSelectCondicaoRequerente(s.id));
  }, 1500);

  // Restaurar requerentes salvos
  restaurarRequerentes();

  console.log('✅ SEÇÃO 23 inicializada com sucesso');
});

/* =========================================================================
🏁 FIM DA SEÇÃO 23
========================================================================= */ /* 
/* ═══════════════════════════════════════════════════════════════════════
   📄 SISTEMA COMPLETO DE EXPORTAÇÃO TPM PARA WORD (.DOCX)
   Desenvolvido para SIGPEM-EB - Exército Brasileiro
   Versão: 3.0 - Exportação Real em DOCX
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * 🎯 Função Principal de Exportação do TPM
 * @param {number} requerenteId - ID do requerente para exportar
 */
async function exportarTPM(requerenteId) {
  console.log(`📄 Iniciando exportação TPM para requerente ${requerenteId}`);

  try {
    // 1️⃣ COLETAR DADOS (com valores padrão automáticos)
    const dados = coletarDadosRequerente(requerenteId);

    // 2️⃣ PREENCHER CAMPOS VAZIOS (não bloqueia mais)
    const dadosCompletos = preencherCamposVazios(dados);

    // 3️⃣ VALIDAR SE HÁ DADOS MÍNIMOS (apenas aviso, não bloqueia)
    verificarDadosMinimos(dadosCompletos);

    // 4️⃣ GERAR DOCUMENTO WORD (.DOCX REAL)
    await gerarDocumentoWordTPM(dadosCompletos);

    // 5️⃣ REGISTRAR EXPORTAÇÃO
    registrarExportacao(dadosCompletos.nomeRequerente, `TPM_${requerenteId}`, 'Sucesso');

    // 6️⃣ CONFIRMAR SUCESSO
    mostrarModalSucesso(`✅ TPM exportado com sucesso!`);
    console.log(`✅ Exportação concluída: TPM_${dadosCompletos.nomeRequerente}`);
  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    mostrarNotificacao(`❌ Erro ao exportar: ${error.message}`, 'erro');
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   📊 COLETA DE DADOS COM VALORES PADRÃO AUTOMÁTICOS
   ═══════════════════════════════════════════════════════════════════════ */

function coletarDadosRequerente(id) {
  console.log(`📊 Coletando dados do requerente ${id}`);

  const requerente = estadoAtual.requerentes?.find((r) => r.id === id);

  const obterValor = (campoId, fallback, padrao = '') => {
    const elemento = document.getElementById(campoId);
    if (elemento?.value && elemento.value.trim() !== '') {
      return elemento.value.trim();
    }
    if (fallback && typeof fallback === 'string' && fallback.trim() !== '') {
      return fallback.trim();
    }
    return padrao;
  };

  const dados = {
    nomeRequerente: obterValor(`nomeRequerente-${id}`, requerente?.nomeRequerente),
    cpf: obterValor(`cpfRequerente-${id}`, requerente?.cpfRequerente),
    rg: obterValor(`numeroRG-${id}`, requerente?.numeroRG),
    orgaoRG: obterValor(`orgaoExpeditorRG-${id}`, requerente?.orgaoExpeditorRG),
    precCP: obterValor(`precCP-${id}`, requerente?.precCP),
    dataNascimento: obterValor(`dataNascimento-${id}`, requerente?.dataNascimento),
    naturalidade: obterValor(`naturalidade-${id}`, requerente?.naturalidade),
    estadoCivil: obterValor(`estadoCivil-${id}`, requerente?.estadoCivil),
    sexo: obterValor(`sexo-${id}`, requerente?.sexo),
    invalidez: obterValor(`invalidez-${id}`, requerente?.invalidez),
    parentesco: obterValor(`parentesco-${id}`, requerente?.parentesco),
    svp: obterValor(`svpVinculacao-${id}`, requerente?.svpVinculacao),
    tipoPensao: obterValor(`tipoPensao-${id}`, requerente?.tipoPensao),
    dataInicio: obterValor(`dataInicioPensao-${id}`, requerente?.dataInicioPensao),
    condicao: obterValor(`condicaoPensao-${id}`, requerente?.condicaoPensao),
    dataLimite: obterValor(`dataLimitePensao-${id}`, requerente?.dataLimitePensao, ''),
    percentual: obterValor(`percentualCota-${id}`, requerente?.percentualCota),
    percentualExtenso: obterValor(`percentualExtenso-${id}`, requerente?.percentualExtenso),
    valorCota: obterValor(`valorAtualCota-${id}`, requerente?.valorAtualCota),
    valorExtenso: obterValor(`valorExtenso-${id}`, requerente?.valorExtenso),
    fusex: obterValor(`fusex-${id}`, requerente?.fusex),
    exerciciosAnteriores: obterValor(`exerciciosAnteriores-${id}`, requerente?.exerciciosAnteriores),
    banco: obterValor(`banco-${id}`, requerente?.banco),
    agencia: obterValor(`agenciaBancaria-${id}`, requerente?.agenciaBancaria),
    conta: obterValor(`numeroConta-${id}`, requerente?.numeroConta),
    nomeInstituidor: obterValor('nomeInstituidor', estadoAtual.instituidor?.nomeInstituidor),
    postoInstituidor: obterValor('postoRealInstituidor', estadoAtual.instituidor?.postoRealInstituidor),
    dataObito: obterValor('dataFalecimentoInstituidor', estadoAtual.instituidor?.dataFalecimentoInstituidor),
    cpfInstituidor: obterValor('cpfInstituidor', estadoAtual.instituidor?.cpfInstituidor),
    identidadeInstituidor: obterValor('identidadeInstituidor', estadoAtual.instituidor?.identidadeInstituidor),
    precInstituidor: obterValor('precInstituidor', estadoAtual.instituidor?.precInstituidor),
    remuneracoes: coletarRemuneracoes(id),
    cotasIncorporadas: coletarCotasIncorporadas(id),
    soldo: estadoAtual.contracheque?.soldo || 0,
    adicionalTempo: estadoAtual.contracheque?.adicionalTempo || 0,
    adicionalCompensacao: estadoAtual.contracheque?.adicionalCompensacao || 0,
    adicionalMilitar: estadoAtual.contracheque?.adicionalMilitar || 0,
    adicionalHabilitacao: estadoAtual.contracheque?.adicionalHabilitacao || 0,
    adicionalOrganica: estadoAtual.contracheque?.adicionalOrganica || 0,
    adicionalPermanencia: estadoAtual.contracheque?.adicionalPermanencia || 0,
    valorTotalPensao: estadoAtual.contracheque?.valorTotal || 0,
  };

  console.log('✅ Dados coletados:', dados);
  return dados;
}

/* ═══════════════════════════════════════════════════════════════════════
   🔧 PREENCHER CAMPOS VAZIOS
   ═══════════════════════════════════════════════════════════════════════ */

function preencherCamposVazios(dados) {
  console.log('🔧 Preenchendo campos vazios...');
  const dadosCompletos = { ...dados };

  const camposTexto = [
    'nomeRequerente',
    'cpf',
    'rg',
    'orgaoRG',
    'precCP',
    'dataNascimento',
    'naturalidade',
    'estadoCivil',
    'sexo',
    'invalidez',
    'parentesco',
    'svp',
    'tipoPensao',
    'dataInicio',
    'condicao',
    'percentual',
    'percentualExtenso',
    'valorCota',
    'valorExtenso',
    'fusex',
    'exerciciosAnteriores',
    'banco',
    'agencia',
    'conta',
    'nomeInstituidor',
    'postoInstituidor',
    'dataObito',
    'cpfInstituidor',
    'identidadeInstituidor',
    'precInstituidor',
  ];

  camposTexto.forEach((campo) => {
    if (!dadosCompletos[campo] || dadosCompletos[campo].trim() === '') {
      dadosCompletos[campo] = 'NÃO INFORMADO';
    }
  });

  dadosCompletos.dataLimite = dadosCompletos.dataLimite || '';
  dadosCompletos.remuneracoes = dadosCompletos.remuneracoes || [];
  dadosCompletos.cotasIncorporadas = dadosCompletos.cotasIncorporadas || [];

  console.log('✅ Campos preenchidos');
  return dadosCompletos;
}

/* ═══════════════════════════════════════════════════════════════════════
   ⚠️ VERIFICAR DADOS MÍNIMOS
   ═══════════════════════════════════════════════════════════════════════ */

function verificarDadosMinimos(dados) {
  const temDadosReais = Object.values(dados).some((valor) => {
    if (typeof valor === 'string') {
      return valor !== 'NÃO INFORMADO' && valor.trim() !== '';
    }
    if (Array.isArray(valor)) return valor.length > 0;
    return valor !== 0 && valor !== null && valor !== undefined;
  });

  if (!temDadosReais) {
    console.warn('⚠️ Nenhum dado real preenchido');
    alert(
      '⚠️ AVISO: O documento será gerado com "NÃO INFORMADO" em vários campos.\n\nRecomenda-se preencher os dados básicos.'
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   📄 GERAR DOCUMENTO WORD (.DOCX)
   ═══════════════════════════════════════════════════════════════════════ */

async function gerarDocumentoWordTPM(dados) {
  console.log('📄 Gerando documento Word (.docx)...');

  try {
    // Verifica se as bibliotecas estão carregadas
    if (!window.PizZip || !window.docxtemplater) {
      throw new Error('Bibliotecas de geração de DOCX não carregadas');
    }

    const templateUrl = 'docs/TPM_Template.docx';

    let templateBlob;
    try {
      const response = await fetch(templateUrl);
      if (!response.ok) throw new Error(`Template não encontrado: ${templateUrl}`);
      templateBlob = await response.blob();
    } catch (error) {
      console.warn('⚠️ Template não encontrado, usando fallback HTML');
      await gerarDocumentoHTMLTPM(dados);
      return;
    }

    const arrayBuffer = await templateBlob.arrayBuffer();
    const zip = new window.PizZip(arrayBuffer);

    const doc = new window.docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const dadosTemplate = prepararDadosParaTemplate(dados);
    doc.setData(dadosTemplate);
    doc.render();

    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const nomeArquivo = gerarNomeArquivo(dados.nomeRequerente);

    // Download usando FileSaver.js
    if (window.saveAs) {
      window.saveAs(blob, nomeArquivo);
    } else {
      // Fallback manual
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    console.log(`✅ Documento gerado: ${nomeArquivo}`);
  } catch (error) {
    console.error('❌ Erro ao gerar DOCX:', error);
    console.warn('⚠️ Usando fallback HTML...');
    await gerarDocumentoHTMLTPM(dados);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   🔧 PREPARAR DADOS PARA TEMPLATE
   ═══════════════════════════════════════════════════════════════════════ */

function prepararDadosParaTemplate(dados) {
  const hoje = new Date();
  const dataAtual = hoje.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    numeroTPM: gerarNumeroTPM(),
    dataEmissao: dataAtual,
    dataAtual: dataAtual,
    nomeRequerente: dados.nomeRequerente,
    cpf: dados.cpf,
    rg: dados.rg,
    orgaoRG: dados.orgaoRG,
    rgCompleto:
      dados.rg !== 'NÃO INFORMADO' && dados.orgaoRG !== 'NÃO INFORMADO' ? `${dados.rg} - ${dados.orgaoRG}` : dados.rg,
    precCP: dados.precCP,
    dataNascimento: dados.dataNascimento,
    naturalidade: dados.naturalidade,
    estadoCivil: formatarEstadoCivil(dados.estadoCivil),
    sexo: formatarSexo(dados.sexo),
    invalidez: formatarInvalidez(dados.invalidez),
    parentesco: dados.parentesco,
    nomeInstituidor: dados.nomeInstituidor,
    postoInstituidor: dados.postoInstituidor,
    cpfInstituidor: dados.cpfInstituidor,
    identidadeInstituidor: dados.identidadeInstituidor,
    precInstituidor: dados.precInstituidor,
    dataObito: dados.dataObito,
    svp: dados.svp,
    tipoPensao: formatarTipoPensao(dados.tipoPensao),
    dataInicio: dados.dataInicio,
    condicao: formatarCondicaoPensao(dados.condicao),
    dataLimite: dados.dataLimite,
    temDataLimite: dados.dataLimite !== '',
    percentual: dados.percentual,
    percentualExtenso: dados.percentualExtenso,
    valorCota: dados.valorCota,
    valorExtenso: dados.valorExtenso,
    fusex: formatarFUSEx(dados.fusex),
    exerciciosAnteriores: formatarExerciciosAnteriores(dados.exerciciosAnteriores),
    banco: dados.banco,
    agencia: dados.agencia,
    conta: dados.conta,
    remuneracoes: dados.remuneracoes.map((rem, idx) => ({
      numero: idx + 1,
      orgao: rem.orgao || 'NÃO INFORMADO',
      cargo: rem.cargo || 'NÃO INFORMADO',
      valor: rem.valor || 'R$ 0,00',
      mesRef: formatarMesReferencia(rem.mesRef),
    })),
    temRemuneracoes: dados.remuneracoes.length > 0,
    cotasIncorporadas: dados.cotasIncorporadas.map((cota, idx) => ({
      numero: idx + 1,
      nome: cota.nome || 'NÃO INFORMADO',
      cpf: cota.cpf || 'NÃO INFORMADO',
      dataNasc: cota.dataNasc || 'NÃO INFORMADO',
      condicao: cota.condicao || 'NÃO INFORMADO',
    })),
    temCotasIncorporadas: dados.cotasIncorporadas.length > 0,
    soldo: formatarMoedaDocumento(dados.soldo),
    adicionalTempo: dados.adicionalTempo.toFixed(2),
    adicionalTempoValor: formatarMoedaDocumento((dados.soldo * dados.adicionalTempo) / 100),
    adicionalCompensacao: dados.adicionalCompensacao.toFixed(2),
    adicionalCompensacaoValor: formatarMoedaDocumento((dados.soldo * dados.adicionalCompensacao) / 100),
    adicionalMilitar: dados.adicionalMilitar.toFixed(2),
    adicionalMilitarValor: formatarMoedaDocumento((dados.soldo * dados.adicionalMilitar) / 100),
    adicionalHabilitacao: dados.adicionalHabilitacao.toFixed(2),
    adicionalHabilitacaoValor: formatarMoedaDocumento((dados.soldo * dados.adicionalHabilitacao) / 100),
    adicionalOrganica: dados.adicionalOrganica.toFixed(2),
    adicionalOrganicaValor: formatarMoedaDocumento((dados.soldo * dados.adicionalOrganica) / 100),
    adicionalPermanencia: dados.adicionalPermanencia.toFixed(2),
    adicionalPermanenciaValor: formatarMoedaDocumento((dados.soldo * dados.adicionalPermanencia) / 100),
    valorTotalPensao: formatarMoedaDocumento(dados.valorTotalPensao),
    temAdicionalTempo: dados.adicionalTempo > 0,
    temAdicionalCompensacao: dados.adicionalCompensacao > 0,
    temAdicionalMilitar: dados.adicionalMilitar > 0,
    temAdicionalHabilitacao: dados.adicionalHabilitacao > 0,
    temAdicionalOrganica: dados.adicionalOrganica > 0,
    temAdicionalPermanencia: dados.adicionalPermanencia > 0,
    temCalculo: dados.soldo > 0,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   📄 FALLBACK: GERAR HTML
   ═══════════════════════════════════════════════════════════════════════ */

async function gerarDocumentoHTMLTPM(dados) {
  console.log('📄 Gerando documento HTML...');

  const html = gerarHTMLTPM(dados);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const nomeArquivo = gerarNomeArquivo(dados.nomeRequerente).replace('.docx', '.doc');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
  console.log(`✅ HTML gerado: ${nomeArquivo}`);
}

function gerarHTMLTPM(dados) {
  const dt = prepararDadosParaTemplate(dados);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TÍTULO DE PENSÃO MILITAR DE HABILITAÇÃO INICIAL Nº ${dt.numeroTPM}</title>
  <style>
    body { font-family: Arial; margin: 40px; font-size: 12pt; }
    h1 { text-align: center; font-size: 16pt; margin-bottom: 5px; }
    h3 { text-align: center; font-size: 12pt; margin-top: 0; margin-bottom: 20px; font-weight: normal; }
    h2 { font-size: 14pt; margin-top: 20px; border-bottom: 1px solid #000; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    td { padding: 5px; vertical-align: top; }
    .label { font-weight: bold; width: 40%; }
    .secao { margin-top: 20px; page-break-inside: avoid; }
  </style>
</head>
<body>
  <h1>TÍTULO DE PENSÃO MILITAR DE HABILITAÇÃO INICIAL Nº ${dt.numeroTPM}</h1>
  <h3>(Lei nº 3.765/1960)</h3>
  <p><strong>Data de Emissão:</strong> ${dt.dataEmissao}</p>
  <div class="secao">
  <p style="text-align: justify;">
    O Chefe da Seção do Serviço de Veteranos e Pensionistas da ${
      dt.regiaoMilitar
    }ª Região Militar, no uso das atribuições que foram conferidas, e em cumprimento ao art. 22 do regulamento da Lei de Pensões Militares, regulada pelo Decreto nº 10.742, de 5 JUL 21, e considerando o despacho concessório do Comandante da ${
    dt.regiaoMilitar
  }ª Região Militar, constante do Parecer nº: ${dt.numeroParecer} – Pens/Mil-SVP/${
    dt.regiaoMilitar
  }, do Processo nº NUP: ${dt.numeroProcesso} – SVP-Digital, publicado no Aditamento SVP ${
    dt.numeroSVP
  } ao Boletim Regional de Acesso Restrito nº ${dt.numeroBoletim}, de ${dt.diaBoletim} de ${dt.mesBoletim} de ${
    dt.anoBoletim
  }, <strong>DECLARA que:</strong>
  </p>
  <ol style="text-align: justify;">
    <li>
      a(o) beneficiária <strong>${dt.nomeRequerente}</strong>, Identidade nº ${dt.rg}, CPF nº ${
    dt.cpf
  }, natural da cidade ${dt.naturalidade}, nascida(o) em ${dt.dataNascimento}, na condição de ${
    dt.condicao
  }, faz jus à Pensão Militar, de que trata a ${dt.amparoLegal}, instituída por ${dt.nomeInstituidor}, ${
    dt.postoInstituidor
  }, militar da ${dt.situacaoInstituidor}, PREC-CP nº ${dt.precInstituidor}, Identidade nº ${
    dt.identidadeInstituidor
  }, CPF nº ${dt.cpfInstituidor}, falecido em ${dt.dataObito}, conforme Certidão de Óbito nº ${
    dt.numeroObito
  }, lavrada em ${dt.dataObito}, expedida pelo ${dt.cartorioObito};
    </li>
    <li>
      a pensão ora concedida à beneficiária corresponde à Cota-Parte de ${dt.percentual}% (${
    dt.percentualExtenso
  }), com base na remuneração correspondente ao posto/graduação de ${
    dt.postoBaseCalculo
  }, com efeitos financeiros a contar de ${dt.dataInicio}, com o prazo ${
    dt.prazoPensao
  }. A pensão foi calculada com base na tabela de vencimentos da MP nº 2.215-10/2001, alterada pela Lei nº 13.954, de 16 DEZ 19.
    </li>
  </ol>
</div>
  <div class="secao">
    <h2>I - DADOS DA BENEFICIÁRIA</h2>
    <table>
      <tr><td class="label">Nome:</td><td>${dt.nomeRequerente}</td></tr>
      <tr><td class="label">CPF:</td><td>${dt.cpf}</td></tr>
      <tr><td class="label">RG:</td><td>${dt.rgCompleto}</td></tr>
      <tr><td class="label">PREC/CP:</td><td>${dt.precCP}</td></tr>
      <tr><td class="label">Data de Nascimento:</td><td>${dt.dataNascimento}</td></tr>
      <tr><td class="label">Naturalidade:</td><td>${dt.naturalidade}</td></tr>
      <tr><td class="label">Estado Civil:</td><td>${dt.estadoCivil}</td></tr>
      <tr><td class="label">Sexo:</td><td>${dt.sexo}</td></tr>
      <tr><td class="label">Invalidez:</td><td>${dt.invalidez}</td></tr>
      <tr><td class="label">Parentesco:</td><td>${dt.parentesco}</td></tr>
    </table>
  </div>

    <div class="secao">
  <h2>I – DADOS DO INSTITUIDOR DA PENSÃO</h2>
  <table>
    <tr><td class="label">Nome:</td><td>${dt.nomeInstituidor}</td></tr>
    <tr><td class="label">Posto/Graduação:</td><td>${dt.postoInstituidor}</td></tr>
    <tr><td class="label">CPF:</td><td>${dt.cpfInstituidor}</td></tr>
    <tr><td class="label">Identidade:</td><td>${dt.identidadeInstituidor}</td></tr>
    <tr><td class="label">PREC/CP:</td><td>${dt.precInstituidor}</td></tr>
    <tr><td class="label">Data de Praça:</td><td>${dt.dataPraca}</td></tr>
    <tr><td class="label">Data da Inatividade:</td><td>${dt.dataInatividade}</td></tr>
    <tr><td class="label">Data do Óbito:</td><td>${dt.dataObito}</td></tr>
    <tr><td class="label">Tempo de Efetivo Serviço:</td><td>${dt.tempoEfetivoServico}</td></tr>
    <tr><td class="label">Tempo para Proventos:</td><td>${dt.tempoProventos}</td></tr>
    <tr><td class="label">Tempo para Inatividade:</td><td>${dt.tempoInatividade}</td></tr>
    <tr><td class="label">Licença Especial não gozada:</td><td>${dt.licencaEspecial}</td></tr>
    <tr><td class="label">Férias não gozadas:</td><td>${dt.feriasNaoGozadas}</td></tr>
    <tr><td class="label">Tipo de Reforma:</td><td>${dt.tipoReforma}</td></tr>
    <tr><td class="label">Base Legal da Reforma:</td><td>${dt.baseLegalReforma}</td></tr>
    <tr><td class="label">Contribuição para pensão militar:</td><td>${dt.contribuicaoPensao}</td></tr>
    <tr><td class="label">Assistência Médica:</td><td>${dt.assistenciaMedica}</td></tr>
  </table>
</div>

<div class="secao">
  <h2>II – CÁLCULO INTEGRAL DA PENSÃO (100%)</h2>
  <table border="1">
    <tr>
      <th>ESPECIFICAÇÕES</th>
      <th>PERCENTUAL %</th>
      <th>VALOR R$</th>
    </tr>
    <tr>
      <td>Soldo</td>
      <td>${dt.percentualSoldo}</td>
      <td>${dt.valorSoldo}</td>
    </tr>
    <tr>
      <td>Adicional de Tempo de Serviço</td>
      <td>${dt.percentualTempo}</td>
      <td>${dt.valorTempo}</td>
    </tr>
    <tr>
      <td>Adicional de Compensação por Disponibilidade Militar</td>
      <td>${dt.percentualDisponibilidade}</td>
      <td>${dt.valorDisponibilidade}</td>
    </tr>
    <tr>
      <td>Adicional Militar</td>
      <td>${dt.percentualMilitar}</td>
      <td>${dt.valorMilitar}</td>
    </tr>
    <tr>
      <td>Adicional de Habilitação</td>
      <td>${dt.percentualHabilitacao}</td>
      <td>${dt.valorHabilitacao}</td>
    </tr>
    <tr>
      <td>Adicional de Compensação Orgânica</td>
      <td>${dt.percentualOrganica}</td>
      <td>${dt.valorOrganica}</td>
    </tr>
    <tr>
      <td>Adicional de Permanência</td>
      <td>${dt.percentualPermanencia}</td>
      <td>${dt.valorPermanencia}</td>
    </tr>
    <tr>
      <td><strong>VALOR TOTAL DA PENSÃO MILITAR</strong></td>
      <td colspan="2"><strong>${dt.valorTotalPensao}</strong></td>
    </tr>
  </table>
</div>


  <div class="secao">
    <h2>III - DADOS DA PENSÃO</h2>
    <table>
      <tr><td class="label">SVP:</td><td>${dt.svp}</td></tr>
      <tr><td class="label">Tipo de Pensão:</td><td>${dt.tipoPensao}</td></tr>
      <tr><td class="label">Data de Início:</td><td>${dt.dataInicio}</td></tr>
      <tr><td class="label">Condição:</td><td>${dt.condicao}</td></tr>
      ${dt.temDataLimite ? `<tr><td class="label">Data Limite:</td><td>${dt.dataLimite}</td></tr>` : ''}
      <tr><td class="label">Percentual:</td><td>${dt.percentual}% (${dt.percentualExtenso})</td></tr>
      <tr><td class="label">Valor da Cota:</td><td>${dt.valorCota} (${dt.valorExtenso})</td></tr>
      <tr><td class="label">FUSEx:</td><td>${dt.fusex}</td></tr>
      <tr><td class="label">Exercícios Anteriores:</td><td>${dt.exerciciosAnteriores}</td></tr>
    </table>
  </div>

  <div class="secao">
    <h2>IV - DADOS BANCÁRIOS</h2>
    <table>
      <tr><td class="label">Banco:</td><td>${dt.banco}</td></tr>
      <tr><td class="label">Agência:</td><td>${dt.agencia}</td></tr>
      <tr><td class="label">Conta:</td><td>${dt.conta}</td></tr>
    </table>
  </div>

  ${
    dt.temRemuneracoes
      ? `
  <div class="secao">
    <h2>V - REMUNERAÇÕES</h2>
    <table border="1">
      <tr><th>#</th><th>Órgão</th><th>Cargo</th><th>Valor</th><th>Mês Ref.</th></tr>
      ${dt.remuneracoes
        .map(
          (r) => `
        <tr><td>${r.numero}</td><td>${r.orgao}</td><td>${r.cargo}</td><td>${r.valor}</td><td>${r.mesRef}</td></tr>
      `
        )
        .join('')}
    </table>
  </div>`
      : ''
  }

  ${
    dt.temCotasIncorporadas
      ? `
  <div class="secao">
    <h2>VI - COTAS INCORPORADAS</h2>
    <table border="1">
      <tr><th>#</th><th>Nome</th><th>CPF</th><th>Data Nasc.</th><th>Condição</th></tr>
      ${dt.cotasIncorporadas
        .map(
          (c) => `
        <tr><td>${c.numero}</td><td>${c.nome}</td><td>${c.cpf}</td><td>${c.dataNasc}</td><td>${c.condicao}</td></tr>
      `
        )
        .join('')}
    </table>
  </div>`
      : ''
  }

  ${
    dt.temCalculo
      ? `
  <div class="secao">
    <h2>VII - COMPOSIÇÃO DO CÁLCULO</h2>
    <table>
      <tr><td class="label">Soldo:</td><td>${dt.soldo}</td></tr>
      ${
        dt.temAdicionalTempo
          ? `<tr><td class="label">Adicional de Tempo (${dt.adicionalTempo}%):</td><td>${dt.adicionalTempoValor}</td></tr>`
          : ''
      }
      ${
        dt.temAdicionalCompensacao
          ? `<tr><td class="label">Adicional de Compensação (${dt.adicionalCompensacao}%):</td><td>${dt.adicionalCompensacaoValor}</td></tr>`
          : ''
      }
      ${
        dt.temAdicionalMilitar
          ? `<tr><td class="label">Adicional Militar (${dt.adicionalMilitar}%):</td><td>${dt.adicionalMilitarValor}</td></tr>`
          : ''
      }
      ${
        dt.temAdicionalHabilitacao
          ? `<tr><td class="label">Adicional de Habilitação (${dt.adicionalHabilitacao}%):</td><td>${dt.adicionalHabilitacaoValor}</td></tr>`
          : ''
      }
      ${
        dt.temAdicionalOrganica
          ? `<tr><td class="label">Adicional Orgânica (${dt.adicionalOrganica}%):</td><td>${dt.adicionalOrganicaValor}</td></tr>`
          : ''
      }
      ${
        dt.temAdicionalPermanencia
          ? `<tr><td class="label">Adicional de Permanência (${dt.adicionalPermanencia}%):</td><td>${dt.adicionalPermanenciaValor}</td></tr>`
          : ''
      }
      <tr><td class="label"><strong>VALOR TOTAL DA PENSÃO:</strong></td><td><strong>${
        dt.valorTotalPensao
      }</strong></td></tr>
    </table>
  </div>`
      : ''
  }
      <div class="secao">
  <h2>V – OBSERVAÇÕES ADICIONAIS</h2>
  <p style="text-align: justify;">
    ${dt.observacoesAdicionais || 'Campo não preenchido'}
  </p>
</div>
<div class="secao" style="margin-top: 60px;">
  <p style="text-align: center;"><strong>${dt.cidade}/${dt.uf}, ${dt.dataAtual}</strong></p>

  <div style="margin-top: 40px; text-align: center;">
    <p>_______________________________________</p>
    <p>${dt.nomeComandante1} – ${dt.postoComandante1}</p>
    <p>Analista – Pens/Mil-SVP ${dt.regiaoMilitar}ª Região Militar</p>
    <p>Assinado e Datado Eletronicamente Por Meio do SVP-DIGITAL</p>
  </div>

  <div style="margin-top: 40px; text-align: center;">
    <p>_______________________________________</p>
    <p>${dt.nomeComandante2} – ${dt.postoComandante2}</p>
    <p>Revisor – Pens/Mil-SVP ${dt.regiaoMilitar}ª Região Militar</p>
    <p>Assinado e Datado Eletronicamente Por Meio do SVP-DIGITAL</p>
  </div>

  <div style="margin-top: 40px; text-align: center;">
    <p>_______________________________________</p>
    <p>${dt.nomeComandante3} – ${dt.postoComandante3}</p>
    <p>Chefe da SAP/SVP ${dt.regiaoMilitar}ª Região Militar</p>
    <p>Assinado e Datado Eletronicamente Por Meio do SVP-DIGITAL</p>
  </div>

  <div style="margin-top: 40px; text-align: center;">
    <p>_______________________________________</p>
    <p>${dt.nomeComandante4} – ${dt.postoComandante4}</p>
    <p>Chefe da SVP ${dt.regiaoMilitar}ª Região Militar</p>
    <p>Assinado e Datado Eletronicamente Por Meio do SVP-DIGITAL</p>
  </div>
</div>
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   🔧 FUNÇÕES AUXILIARES
   ═══════════════════════════════════════════════════════════════════════ */

function coletarRemuneracoes(requerenteId) {
  const remuneracoes = [];
  const container = document.getElementById(`listaRemuneracoes-${requerenteId}`);
  if (!container) return remuneracoes;

  container.querySelectorAll('[id^="remuneracao-"]').forEach((div) => {
    const remId = div.id.split('-')[2];
    const orgao = document.getElementById(`nomeOrgaoRem-${requerenteId}-${remId}`)?.value || '';
    const cargo = document.getElementById(`cargoRem-${requerenteId}-${remId}`)?.value || '';
    const valor = document.getElementById(`valorRem-${requerenteId}-${remId}`)?.value || '';
    const mesRef = document.getElementById(`mesRefRem-${requerenteId}-${remId}`)?.value || '';

    if (orgao || cargo || valor) {
      remuneracoes.push({ orgao, cargo, valor, mesRef });
    }
  });

  return remuneracoes;
}

function coletarCotasIncorporadas(requerenteId) {
  const cotas = [];
  const container = document.getElementById(`listaCotasIncorporadas-${requerenteId}`);
  if (!container) return cotas;

  container.querySelectorAll('[id^="cotaInc-"]').forEach((div) => {
    const cotaId = div.id.split('-')[2];
    const nome = document.getElementById(`nomeFilhoCota-${requerenteId}-${cotaId}`)?.value || '';
    const cpf = document.getElementById(`cpfFilhoCota-${requerenteId}-${cotaId}`)?.value || '';
    const dataNasc = document.getElementById(`dataNascFilhoCota-${requerenteId}-${cotaId}`)?.value || '';
    const condicao = document.getElementById(`condicaoFilhoCota-${requerenteId}-${cotaId}`)?.value || '';

    if (nome || cpf) {
      cotas.push({ nome, cpf, dataNasc, condicao });
    }
  });

  return cotas;
}

function gerarNomeArquivo(nomeRequerente) {
  const hoje = new Date();
  const dataArquivo = hoje.toISOString().split('T')[0];
  const nomeFormatado = (nomeRequerente !== 'NÃO INFORMADO' ? nomeRequerente : 'Requerente')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
  return `TPM_${nomeFormatado}_${dataArquivo}.docx`;
}

function gerarNumeroTPM() {
  const ano = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${random}/${ano}`;
}

function formatarEstadoCivil(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const estados = {
    solteira: 'Solteira(o)',
    casada: 'Casada(o)',
    separada: 'Separada(o) Judicialmente',
    desquitada: 'Desquitada(o) Judicialmente',
    viuva: 'Viúva(o)',
    divorciada: 'Divorciada(o)',
  };
  return estados[valor] || valor;
}

function formatarSexo(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const sexos = { feminino: 'Feminino', masculino: 'Masculino' };
  return sexos[valor] || valor;
}

function formatarInvalidez(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const invalidez = {
    'nao-invalida': 'Não é inválida(o)',
    invalida: 'É inválida(o)',
  };
  return invalidez[valor] || valor;
}

function formatarTipoPensao(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const tipos = {
    'habilitacao-condicional': 'Habilitação Condicional',
    'pensao-inicial': 'Pensão Inicial',
    reversao: 'Reversão da Pensão',
    transferencia: 'Transferência de Cota-parte',
    melhoria: 'Melhoria da Pensão',
    judicial: 'Pensão Judicial',
  };
  return tipos[valor] || valor;
}

function formatarCondicaoPensao(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const condicoes = {
    'tempo-determinado': 'Por Tempo Determinado',
    indeterminada: 'Indeterminada',
  };
  return condicoes[valor] || valor;
}

function formatarFUSEx(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const fusex = {
    'nao-descontar': 'Não descontar FUSEx',
    descontar: 'Descontar FUSEx',
  };
  return fusex[valor] || valor;
}

function formatarExerciciosAnteriores(valor) {
  if (valor === 'NÃO INFORMADO') return valor;
  const exercicios = {
    possui: 'Possui Exercício Anterior',
    'nao-possui': 'Não Possui',
  };
  return exercicios[valor] || valor;
}

function formatarMoedaDocumento(valor) {
  if (!valor || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarMesReferencia(valor) {
  if (!valor) return 'Não informado';
  try {
    const [ano, mes] = valor.split('-');
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  } catch {
    return valor;
  }
}

function registrarExportacao(nomeRequerente, nomeArquivo, status) {
  try {
    const historico = JSON.parse(localStorage.getItem('historicoExportacoes') || '[]');
    const novaExportacao = {
      id: Date.now(),
      data: new Date().toISOString(),
      requerente: nomeRequerente,
      arquivo: nomeArquivo,
      status: status,
      tipo: 'TPM',
    };
    historico.unshift(novaExportacao);

    // Manter apenas últimas 100 exportações
    if (historico.length > 100) {
      historico.splice(100);
    }

    localStorage.setItem('historicoExportacoes', JSON.stringify(historico));
    console.log('✅ Exportação registrada no histórico');
  } catch (error) {
    console.error('❌ Erro ao registrar exportação:', error);
  }
}

function mostrarModalSucesso(mensagem) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: mensagem,
      confirmButtonText: 'OK',
      confirmButtonColor: '#28a745',
    });
  } else {
    alert(mensagem);
  }
}

function mostrarNotificacao(mensagem, tipo) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: tipo === 'erro' ? 'error' : 'info',
      title: tipo === 'erro' ? 'Erro' : 'Informação',
      text: mensagem,
      confirmButtonText: 'OK',
    });
  } else {
    alert(mensagem);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   🔧 CARREGAMENTO DE BIBLIOTECAS NECESSÁRIAS
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Carregar bibliotecas necessárias para exportação DOCX
 * Adicione estas tags <script> no seu HTML:
 *
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/pizzip/3.1.6/pizzip.min.js"></script>
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/docxtemplater/3.42.3/docxtemplater.min.js"></script>
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
 */

function verificarBibliotecas() {
  const bibliotecas = {
    PizZip: window.PizZip,
    docxtemplater: window.docxtemplater,
    FileSaver: window.saveAs,
  };

  const faltando = Object.entries(bibliotecas)
    .filter(([nome, lib]) => !lib)
    .map(([nome]) => nome);

  if (faltando.length > 0) {
    console.warn(`⚠️ Bibliotecas faltando: ${faltando.join(', ')}`);
    console.warn('📦 Adicione as seguintes tags no HTML:');
    console.warn('<script src="https://cdnjs.cloudflare.com/ajax/libs/pizzip/3.1.6/pizzip.min.js"></script>');
    console.warn(
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/docxtemplater/3.42.3/docxtemplater.min.js"></script>'
    );
    console.warn('<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>');
    return false;
  }

  console.log('✅ Todas as bibliotecas carregadas');
  return true;
}

/* ═══════════════════════════════════════════════════════════════════════
   📋 INSTRUÇÕES PARA CRIAR O TEMPLATE WORD
   ═══════════════════════════════════════════════════════════════════════

   1. Crie um arquivo Word chamado "TPM_Template.docx"
   2. Salve-o na pasta "docs/" do seu projeto
   3. Use as seguintes variáveis no template (entre chaves duplas):

   CABEÇALHO:
   {{numeroTPM}} - Número do TPM
   {{dataEmissao}} - Data de emissão

   DADOS DA BENEFICIÁRIA:
   {{nomeRequerente}}, {{cpf}}, {{rgCompleto}}, {{precCP}}
   {{dataNascimento}}, {{naturalidade}}, {{estadoCivil}}
   {{sexo}}, {{invalidez}}, {{parentesco}}

   DADOS DO INSTITUIDOR:
   {{nomeInstituidor}}, {{postoInstituidor}}, {{cpfInstituidor}}
   {{identidadeInstituidor}}, {{precInstituidor}}, {{dataObito}}

   DADOS DA PENSÃO:
   {{svp}}, {{tipoPensao}}, {{dataInicio}}, {{condicao}}
   {{percentual}}, {{percentualExtenso}}
   {{valorCota}}, {{valorExtenso}}
   {{fusex}}, {{exerciciosAnteriores}}

   DADOS BANCÁRIOS:
   {{banco}}, {{agencia}}, {{conta}}

   LOOPS (para listas):
   {#remuneracoes}
     {{numero}} - {{orgao}} - {{cargo}} - {{valor}} - {{mesRef}}
   {/remuneracoes}

   {#cotasIncorporadas}
     {{numero}} - {{nome}} - {{cpf}} - {{dataNasc}} - {{condicao}}
   {/cotasIncorporadas}

   CÁLCULOS (condicionais):
   {#temCalculo}
     Soldo: {{soldo}}
     {#temAdicionalTempo}Adicional Tempo: {{adicionalTempoValor}}{/temAdicionalTempo}
     Total: {{valorTotalPensao}}
   {/temCalculo}

   CONDICIONAIS:
   {#temDataLimite}Data Limite: {{dataLimite}}{/temDataLimite}
   {#temRemuneracoes}...[lista]...{/temRemuneracoes}
   {#temCotasIncorporadas}...[lista]...{/temCotasIncorporadas}

   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   🚀 EXEMPLO DE USO
   ═══════════════════════════════════════════════════════════════════════

   // HTML Button:
   <button onclick="exportarTPM(123)">Exportar TPM</button>

   // Ou via código:
   exportarTPM(requerenteId);

   ═══════════════════════════════════════════════════════════════════════ */

// Verificar bibliotecas ao carregar o script
console.log('📄 Sistema de Exportação TPM carregado');
verificarBibliotecas();

/* ═══════════════════════════════════════════════════════════════════════
   📦 EXPORTAR FUNÇÕES (se usar módulos)
   ═══════════════════════════════════════════════════════════════════════ */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exportarTPM,
    verificarBibliotecas,
    gerarDocumentoWordTPM,
    prepararDadosParaTemplate,
  };
}
/* ═══════════════════════════════════════════════════════════════════════
   FIM DA SEÇÃO 24: EXPORTAR
   ═══════════════════════════════════════════════════════════════════════ */

/* ========================================================================
🧮 SEÇÃO 25: SISTEMA DE CÁLCULO DA PENSÃO MILITAR
========================================================================= */

/**
 * 💰 Calcular e atualizar o contracheque da pensão militar
 */
function atualizarContracheque() {
  // Captura dos valores dos campos
  const soldo = parseFloat(document.getElementById('soldo')?.value) || 0;
  const adicionalTempo = parseFloat(document.getElementById('adicionalTempo')?.value) || 0;
  const adicionalCompensacao = parseFloat(document.getElementById('adicionalCompensacao')?.value) || 0;
  const adicionalMilitar = parseFloat(document.getElementById('adicionalMilitar')?.value) || 0;
  const adicionalHabilitacao = parseFloat(document.getElementById('adicionalHabilitacao')?.value) || 0;
  const adicionalOrganica = parseFloat(document.getElementById('adicionalOrganica')?.value) || 0;
  const adicionalPermanencia = parseFloat(document.getElementById('adicionalPermanencia')?.value) || 0;
  const postoReal = document.getElementById('postoReal')?.value || 'Não informado';
  const postoPensao = document.getElementById('postoProventos')?.value || 'Não informado';

  // Cálculos dos valores
  const valorTempo = soldo * (adicionalTempo / 100);
  const valorCompensacao = soldo * (adicionalCompensacao / 100);
  const valorMilitar = soldo * (adicionalMilitar / 100);
  const valorHabilitacao = soldo * (adicionalHabilitacao / 100);
  const valorOrganica = soldo * (adicionalOrganica / 100);
  const valorPermanencia = soldo * (adicionalPermanencia / 100);

  const valorTotal =
    soldo + valorTempo + valorCompensacao + valorMilitar + valorHabilitacao + valorOrganica + valorPermanencia;

  // Armazenar dados do contracheque no estado
  estadoAtual.contracheque = {
    postoReal,
    postoPensao,
    soldo,
    adicionalTempo,
    valorTempo,
    adicionalCompensacao,
    valorCompensacao,
    adicionalMilitar,
    valorMilitar,
    adicionalHabilitacao,
    valorHabilitacao,
    adicionalOrganica,
    valorOrganica,
    adicionalPermanencia,
    valorPermanencia,
    valorTotal,
  };

  // Salvar contracheque
  salvarContracheque();

  // Geração do HTML do contracheque
  const contrachequeHtml = `
    <div class="posto-info">
      <div class="posto-item">
        <span class="posto-label">Posto/Graduação Real:</span>
        <span class="posto-value">${postoReal}</span>
      </div>
      <div class="posto-item">
        <span class="posto-label">Posto/Graduação da Pensão Militar:</span>
        <span class="posto-value">${postoPensao}</span>
      </div>
    </div>

    <table class="contracheque-tabela">
      <thead>
        <tr>
          <th>DESCRIÇÃO</th>
          <th>PERCENTUAL (%)</th>
          <th>RECEITAS (R$)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="descricao-cell">Soldo ou cotas do soldo do P/G Gen Bda</td>
          <td class="percentual-cell">100,00%</td>
          <td class="valor-cell">R$ ${formatarMoeda(soldoGenBda)}</td>
        </tr>
        <tr>
          <td class="descricao-cell">Adicional de Tempo de serviço</td>
          <td class="percentual-cell">${adicionalTempo.toFixed(0)}%</td>
          <td class="valor-cell">R$ ${formatarMoeda(valorTempo)}</td>
        </tr>
        <tr>
          <td class="descricao-cell adicional-compensacao">Adicional de Compensação por Disponibilidade Militar</td>
          <td class="percentual-cell">${adicionalCompensacao.toFixed(0)}%</td>
          <td class="valor-cell">R$ ${formatarMoeda(valorCompensacao)}</td>
        </tr>
        <tr>
          <td class="descricao-cell">Adicional Militar</td>
          <td class="percentual-cell">${adicionalMilitar.toFixed(0)}%</td>
          <td class="valor-cell">R$ ${formatarMoeda(valorMilitar)}</td>
        </tr>
        <tr>
          <td class="descricao-cell">Adicional de Habilitação</td>
          <td class="percentual-cell">${adicionalHabilitacao.toFixed(0)}%</td>
          <td class="valor-cell">R$ ${formatarMoeda(valorHabilitacao)}</td>
        </tr>
        <tr>
          <td class="descricao-cell">Adicional de Compensação Orgânica</td>
          <td class="percentual-cell">${adicionalOrganica.toFixed(0)}%</td>
          <td class="valor-cell">R$ ${formatarMoeda(valorOrganica)}</td>
        </tr>
        <tr>
          <td class="descricao-cell">Adicional de Permanência</td>
          <td class="percentual-cell">${adicionalPermanencia.toFixed(0)}%</td>
          <td class="valor-cell">R$ ${formatarMoeda(valorPermanencia)}</td>
        </tr>
        <tr class="total-row">
          <td><strong>VALOR TOTAL DA PENSÃO MILITAR</strong></td>
          <td></td>
          <td><strong>R$ ${formatarMoeda(valorTotal)}</strong></td>
        </tr>
      </tbody>
    </table>
  `;

  // Atualização do DOM
  const contrachequeConteudo = document.getElementById('contrachequeConteudo');
  if (contrachequeConteudo) {
    contrachequeConteudo.innerHTML = contrachequeHtml;
  }

  console.log('💰 Contracheque atualizado');
}

/**
 * 💱 Formatar valores em moeda brasileira
 * @param {number} valor - Valor a ser formatado
 * @returns {string} - Valor formatado (ex: 1.234,56)
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * ===================================================================================
 * 🔄 SEÇÃO 25: SISTEMA DE TOGGLES ( ORGANIZADO E COMPLETO)
 * ===================================================================================
 * Esta função oculta/mostra o GRID de campos E o título da seção
 * Mantém visível apenas o botão de toggle
 * ===================================================================================
 */

/**
|
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|    FUNÇÕES ALTERNAR VISISBILIDADE TODOS OS TOGGLES
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|
|
/**
 * Função para alternar visibilidade do grid de campos e título
 * @description Oculta/mostra o grid com os campos de formulário E o título da seção
 * @description O botão de toggle permanece sempre visível
 */
/**
 * 🔧 Configurar todos os toggles do sistema
 */
function configurarTodosToggles() {
  console.log('🔧 Configurando todos os toggles do sistema...');

  // Configurar cada toggle individual
  configurartogglecadastroInstituidor();
  configurartoggleTemposServico();
  configurartoggleReservaRemunerada();
  configurartoggleReforma();
  configurartoggleRBGHI();
  configurartoggleinformacoesInstituidor();
  configurartoggleCalculo();

  console.log('✅ Todos os toggles configurados');
}

/**
|
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|    TOGGLES ABA 2
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|
|
/**
 * 🔄 TOGGLE 1: Informações Cadastrais do Instituidor
 */
function togglecadastroInstituidor() {
  const container = document.getElementById('cadastroInstituidorContainer');
  const botao = document.getElementById('togglecadastroInstituidorBtn');
  const icon = document.getElementById('togglecadastroInstituidorIcon');
  const text = document.getElementById('togglecadastroInstituidorText');

  if (!container || !botao) {
    console.error('❌ Elementos togglecadastroInstituidor não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Cadastro do Instituidor';
    console.log('🙈 Cadastro do Instituidor ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Cadastro do Instituidor';
    console.log('👁️ Cadastro do Instituidor exibido');
  }
}

function configurarTogglecadastroInstituidor() {
  const container = document.getElementById('cadastroInstituidorContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle Cadastro Instituidor configurado');
  }
}

/**
 * 🔄 TOGGLE 2: Tempos de Serviço do Instituidor
 */
function toggleTemposServico() {
  const container = document.getElementById('TemposServicoContainer');
  const botao = document.getElementById('toggleTemposServicoBtn');
  const icon = document.getElementById('toggleTemposServicoIcon');
  const text = document.getElementById('toggleTemposServicoText');

  if (!container || !botao) {
    console.error('❌ Elementos toggleTemposServico não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Tempos Servico';
    console.log('🙈 Tempos Servico ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Tempos Servico';
    console.log('👁️ TemposServico exibido');
  }
}

function configurarToggleTemposServico() {
  const container = document.getElementById('TemposServicoContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle Tempos Servico configurado');
  }
}

/**
 * 🔄 TOGGLE 3: Reserva Remunerada
 */
function toggleReservaRemunerada() {
  const container = document.getElementById('ReservaRemuneradaContainer');
  const botao = document.getElementById('toggleReservaRemuneradaBtn');
  const icon = document.getElementById('toggleReservaRemuneradaIcon');
  const text = document.getElementById('toggleReservaRemuneradaText');

  if (!container || !botao) {
    console.error('❌ Elementos toggleReservaRemunerada não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Informações Reserva Remunerada';
    console.log('🙈 Tempos Servico ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Informações Reserva Remunerada';
    console.log('👁️ ReservaRemunerada exibido');
  }
}

function configurarToggleReservaRemunerada() {
  const container = document.getElementById('ReservaRemuneradaContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle Reserva Remunerada configurado');
  }
}

/**
 * 🔄 TOGGLE 4: Reforma
 */
function toggleReforma() {
  const container = document.getElementById('ReformaContainer');
  const botao = document.getElementById('toggleReformaBtn');
  const icon = document.getElementById('toggleReformaIcon');
  const text = document.getElementById('toggleReformaText');

  if (!container || !botao) {
    console.error('❌ Elementos toggleReforma não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Informações da Reforma';
    console.log('🙈 Tempos Reforma ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Informações da Reforma';
    console.log('👁️ Reforma exibido');
  }
}

function configurarToggleReforma() {
  const container = document.getElementById('ReformaContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle Reforma configurado');
  }
}

/**
 * 🔄 TOGGLE 5: RBGHI
 */
function toggleRBGHI() {
  const container = document.getElementById('RBGHIContainer');
  const botao = document.getElementById('toggleRBGHIBtn');
  const icon = document.getElementById('toggleRBGHIIcon');
  const text = document.getElementById('toggleRBGHIText');

  if (!container || !botao) {
    console.error('❌ Elementos toggleRBGHI não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Informações da RBGHI';
    console.log('🙈 Tempos Reforma ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Informações da RBGHI';
    console.log('👁️ RBGHI exibido');
  }
}

function configurarToggleRBGHI() {
  const container = document.getElementById('RBGHIContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle RBGHI configurado');
  }
}

/**
|
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|    TOGGLES ABA 4
|   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|
|
*/
/**
 * 🔄 TOGGLE 1: Informações Cadastrais do Instituidor
 */
function toggleinformacoesInstituidor() {
  const container = document.getElementById('informacoesInstituidorContainer');
  const botao = document.getElementById('toggleinformacoesInstituidorBtn');
  const icon = document.getElementById('toggleinformacoesInstituidorIcon');
  const text = document.getElementById('toggleinformacoesInstituidorText');

  if (!container || !botao) {
    console.error('❌ Elementos toggleinformacoesInstituidor não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Informações do Instituidor';
    console.log('🙈 Informações do Instituidor ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Informações do Instituidor';
    console.log('👁️ Informações do Instituidor exibido');
  }
}

function configurartoggleinformacoesInstituidor() {
  const container = document.getElementById('informacoesInstituidorContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle Cadastro Instituidor configurado');
  }
}

/**
 * 🔄 TOGGLE 2: Cálculo da Pensão Militar
 */
function toggleCalculo() {
  const container = document.getElementById('calculoContainer');
  const botao = document.getElementById('toggleCalculoBtn');
  const icon = document.getElementById('toggleCalculoIcon');
  const text = document.getElementById('toggleCalculoText');

  if (!container || !botao) {
    console.error('❌ Elementos toggleCalculo não encontrados');
    return;
  }

  const isVisible = !container.classList.contains('hidden');

  if (isVisible) {
    container.classList.add('hidden');
    if (icon) icon.className = 'fas fa-chevron-down';
    if (text) text.textContent = 'Exibir Informações do Calculo';
    console.log('🙈 Informações do Calculo ocultado');
  } else {
    container.classList.remove('hidden');
    if (icon) icon.className = 'fas fa-chevron-up';
    if (text) text.textContent = 'Ocultar Informações do Calculo';
    console.log('👁️ Informações do Calculo exibido');
  }
}

function configurartoggleCalculo() {
  const container = document.getElementById('calculoContainer');
  if (container) {
    container.classList.add('hidden');
    console.log('🔧 Toggle Calculo configurado');
  }
}

/* ========================================================================
🧹 SEÇÃO 26: SISTEMA DE LIMPEZA SELETIVA
========================================================================= */

/**
 * 🧹 Limpar dados de aba específica
 * @param {string} abaId - ID da aba para limpar
 */
function limparAba(abaId) {
  console.log(`🧹 Solicitação de limpeza da aba: ${abaId}`);

  abaParaLimpar = abaId;

  const modal = document.getElementById('modalConfirmacao');
  const titulo = document.getElementById('modalTitulo');
  const mensagem = document.getElementById('modalMensagem');

  if (!modal || !titulo || !mensagem) {
    console.error('❌ Elementos do modal não encontrados');
    return;
  }

  // Configurações específicas por aba
  const configuracoes = {
    cadastroInstituidor: {
      titulo: 'Limpar Cadastro do Instituidor',
      mensagem: 'Tem certeza que deseja limpar todos os dados do Instituidor? Esta ação não pode ser desfeita.',
    },
    cadastroRequerentes: {
      titulo: 'Limpar Cadastro dos Requerentes',
      mensagem: 'Tem certeza que deseja limpar todos os dados dos Requerentes? Esta ação não pode ser desfeita.',
    },
    calculoPensao: {
      titulo: 'Limpar Cálculo da Pensão',
      mensagem: 'Tem certeza que deseja limpar todos os dados do Cálculo da Pensão? Esta ação não pode ser desfeita.',
    },
  };

  const config = configuracoes[abaId];
  if (!config) {
    console.error(`❌ Configuração não encontrada para aba: ${abaId}`);
    return;
  }

  titulo.textContent = config.titulo;
  mensagem.textContent = config.mensagem;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  console.log(`🪟 Modal de confirmação aberto para: ${abaId}`);
  fecharTodosDropdowns();
}

/**
 * ✅ Confirmar e executar limpeza da aba
 */
function confirmarLimpeza() {
  if (!abaParaLimpar) {
    console.error('❌ Nenhuma aba selecionada para limpeza');
    fecharModal();
    return;
  }

  console.log(`✅ Confirmada limpeza da aba: ${abaParaLimpar}`);

  switch (abaParaLimpar) {
    case 'cadastroInstituidor':
      limparDadosInstituidor();
      break;
    case 'cadastroRequerentes':
      limparDadosRequerentes();
      break;
    case 'calculoPensao':
      limparDadosCalculo();
      break;
    default:
      console.error(`❌ Aba inválida para limpeza: ${abaParaLimpar}`);
  }

  fecharModal();
  abaParaLimpar = null;
  mostrarModalSucesso('Dados da aba limpos com sucesso!');
}

/**
 * 🧹 Limpar dados específicos do instituidor
 */
function limparDadosInstituidor() {
  console.log('🧹 Executando limpeza dos dados do instituidor');

  estadoAtual.instituidor = {};

  const campos = [
    'nomeInstituidor',
    'postoRealInstituidor',
    'armaServicoInstituidor',
    'condicaoMilitar',
    'dataFalecimento',
    'tipoObito',
    'svpRegional',
    'orgaoSVP',
  ];
  let camposLimpos = 0;

  campos.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.value = '';
      campo.classList.remove('valid');
      campo.classList.remove('has-value');
      camposLimpos++;
    }
  });

  localStorage.removeItem('pensaoMilitar_instituidor');
  console.log(`✅ ${camposLimpos} campos do instituidor limpos`);
}

/**
 * 🧹 Limpar dados específicos dos requerentes
 */
function limparDadosRequerentes() {
  console.log('🧹 Executando limpeza dos dados dos requerentes');

  const quantidadeRequerentes = estadoAtual.requerentes.length;

  estadoAtual.requerentes = [];
  estadoAtual.contadorRequerentes = 0;

  const lista = document.getElementById('listaRequerentes');
  if (lista) {
    lista.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6b7280; font-style: italic;">
        <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
        <p style="font-size: 1.1rem;">Nenhum requerente cadastrado ainda.</p>
        <p>Clique em "Adicionar Requerente" para começar.</p>
      </div>
    `;
  }

  localStorage.removeItem('pensaoMilitar_requerentes');

  console.log(`✅ ${quantidadeRequerentes} requerentes removidos`);
}

/**
 * 🧹 Limpar dados específicos do cálculo
 */
function limparDadosCalculo() {
  console.log('🧹 Executando limpeza dos dados do cálculo');

  estadoAtual.calculo = {};
  estadoAtual.contracheque = {};

  const campos = [
    'postoReal',
    'postoProventos',
    'postoRBGHI',
    'acordao631',
    'acordao2225',
    'contribuicaoPensao',
    'soldoGenBda',
    'adicionalTempo',
    'adicionalCompensacao',
    'adicionalMilitar',
    'adicionalHabilitacao',
    'adicionalOrganica',
    'adicionalPermanencia',
  ];
  let camposLimpos = 0;

  campos.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.value = '';
      campo.classList.remove('valid');
      campo.classList.remove('has-value');
      camposLimpos++;
    }
  });

  const contracheque = document.getElementById('contrachequeConteudo');
  if (contracheque) {
    contracheque.innerHTML = `
      <i class="fas fa-info-circle"></i>
      Você ainda não preencheu as informações do cálculo!
    `;
    contracheque.className = 'mensagem-vazia';
  }

  localStorage.removeItem('pensaoMilitar_calculo');
  localStorage.removeItem('pensaoMilitar_contracheque');
  console.log(`✅ ${camposLimpos} campos do cálculo limpos`);
}

/* ========================================================================
📄 SEÇÃO 27: SISTEMA DE DOCUMENTOS
========================================================================= */

/**
 * 👁️ Visualizar documento no navegador
 * @param {string} tipoDoc - Tipo do documento para visualização
 */
function visualizarDocumento(tipoDoc) {
  console.log(`👁️ Solicitação de visualização: ${tipoDoc}`);

  if (!validarDadosParaDocumento()) {
    mostrarNotificacao('Preencha os dados necessários antes de visualizar o documento.', 'erro');
    return;
  }

  const nomeDoc = obterNomeDocumento(tipoDoc);
  mostrarNotificacao(`Preparando ${nomeDoc} para visualização...`, 'info');

  setTimeout(() => {
    mostrarNotificacao(`${nomeDoc} aberto para conferência e impressão.`, 'sucesso');
    console.log(`✅ Documento visualizado: ${nomeDoc}`);
  }, 2000);

  fecharTodosDropdowns();
}

/**
 * 📄 Gerar documento Word para download
 * @param {string} tipoDoc - Tipo do documento para geração
 */
function gerarDocumento(tipoDoc) {
  console.log(`📄 Solicitação de geração: ${tipoDoc}`);

  if (!validarDadosParaDocumento()) {
    mostrarNotificacao('Preencha os dados necessários antes de gerar o documento.', 'erro');
    return;
  }

  const nomeDoc = obterNomeDocumento(tipoDoc);
  mostrarNotificacao(`Gerando ${nomeDoc}...`, 'info');

  setTimeout(() => {
    mostrarModalSucesso(`${nomeDoc} gerado com sucesso! Download iniciado automaticamente.`);
    console.log(`✅ Documento gerado: ${nomeDoc}`);
  }, 3000);

  fecharTodosDropdowns();
}

/**
 * 📋 Obter nome amigável do documento
 * @param {string} tipoDoc - Tipo do documento
 * @returns {string} Nome amigável do documento
 */
function obterNomeDocumento(tipoDoc) {
  const nomes = {
    'parecer-hi': 'Parecer HI',
    'parecer-reversao': 'Parecer Reversão',
    'parecer-tcp': 'Parecer TCP',
    'parecer-reversao-tcp': 'Parecer Reversão/TCP',
    'titulo-pensao': 'Título de Pensão Militar (TPM)',
    'apostila-alteracao': 'Apostila de Alteração (AATPM)',
    'nota-bi': 'Nota BI',
    'informacao-requerimento': 'Informação de Requerimento',
  };

  return nomes[tipoDoc] || 'Documento';
}

/**
 * ✅ Validar se há dados suficientes para gerar documento
 * @returns {boolean} True se há dados suficientes
 */
function validarDadosParaDocumento() {
  const temInstituidor =
    estadoAtual.instituidor &&
    estadoAtual.instituidor.nomeInstituidor &&
    estadoAtual.instituidor.nomeInstituidor.trim() !== '';

  const temRequerentes = estadoAtual.requerentes && estadoAtual.requerentes.length > 0;
  const temCalculo = estadoAtual.calculo && Object.keys(estadoAtual.calculo).length > 0;

  console.log(`📋 Validação - Instituidor: ${temInstituidor}, Requerentes: ${temRequerentes}, Cálculo: ${temCalculo}`);

  return temInstituidor || temRequerentes || temCalculo;
}

/* ========================================================================
🪟 SEÇÃO 28: SISTEMA DE MODAIS
========================================================================= */

/**
 * 🔧 Configurar modais
 */
function configurarModais() {
  console.log('🪟 Configurando modais...');

  // Fechar modal ao clicar fora dele
  window.addEventListener('click', function (event) {
    const modalConfirmacao = document.getElementById('modalConfirmacao');
    const modalSucesso = document.getElementById('modalSucesso');

    if (event.target === modalConfirmacao) {
      fecharModal();
    }

    if (event.target === modalSucesso) {
      fecharModalSucesso();
    }
  });

  // Fechar modal com tecla ESC
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      fecharModal();
      fecharModalSucesso();
    }
  });

  console.log('✅ Modais configurados');
}

/**
 * ❌ Fechar modal de confirmação
 */
function fecharModal() {
  const modal = document.getElementById('modalConfirmacao');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    abaParaLimpar = null;
    console.log('❌ Modal de confirmação fechado');
  }
}

/**
 * ✅ Mostrar modal de sucesso
 * @param {string} mensagem - Mensagem a ser exibida
 */
function mostrarModalSucesso(mensagem) {
  const modal = document.getElementById('modalSucesso');
  const mensagemElemento = document.getElementById('mensagemSucesso');

  if (modal && mensagemElemento) {
    mensagemElemento.textContent = mensagem;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log(`✅ Modal de sucesso exibido: ${mensagem}`);
  }
}

/**
 * ❌ Fechar modal de sucesso
 */
function fecharModalSucesso() {
  const modal = document.getElementById('modalSucesso');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    console.log('❌ Modal de sucesso fechado');
  }
}

/* ========================================================================
🔔 SEÇÃO 29: SISTEMA DE NOTIFICAÇÕES
========================================================================= */

/**
 * 🔔 Mostrar notificação
 * @param {string} mensagem - Mensagem da notificação
 * @param {string} tipo - Tipo: 'sucesso', 'erro', 'info'
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
  // Remover notificação existente
  const notificacaoExistente = document.querySelector('.notificacao');
  if (notificacaoExistente) {
    notificacaoExistente.remove();
  }

  // Criar nova notificação
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao ${tipo}`;

  // Definir ícone baseado no tipo
  const icones = {
    sucesso: 'fas fa-check-circle',
    erro: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
  };

  notificacao.innerHTML = `
    <i class="${icones[tipo] || icones.info}"></i>
    <span>${mensagem}</span>
  `;

  // Adicionar ao documento
  document.body.appendChild(notificacao);

  // Mostrar com animação
  setTimeout(() => {
    notificacao.classList.add('show');
  }, 100);

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (notificacao.classList.contains('show')) {
      notificacao.classList.remove('show');
      setTimeout(() => {
        if (notificacao.parentNode) {
          notificacao.remove();
        }
      }, 400);
    }
  }, configuracoesSistema.tempoNotificacao);

  console.log(`🔔 Notificação exibida (${tipo}): ${mensagem}`);
}

/* ========================================================================
📱 SEÇÃO 30: SISTEMA DE RESPONSIVIDADE
========================================================================= */

/**
 * 📱 Configurar responsividade
 */
function configurarResponsividade() {
  console.log('📱 Configurando responsividade...');

  // Ajustar interface baseado no tamanho da tela
  function ajustarInterface() {
    const isMobile = window.innerWidth <= 768;

    // Ajustar navegação em mobile
    if (isMobile) {
      document.body.classList.add('mobile-layout');
    } else {
      document.body.classList.remove('mobile-layout');
    }
  }

  // Executar ao carregar e redimensionar
  ajustarInterface();
  window.addEventListener('resize', ajustarInterface);

  console.log('✅ Responsividade configurada');
}

/* ========================================================================
🔧 SEÇÃO 31: FUNÇÕES UTILITÁRIAS
========================================================================= */

/**
 * 📞 Formatar telefone
 * @param {string} telefone - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
function formatarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, '');

  if (numeros.length <= 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  } else {
    return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
}

/**
 * 🆔 Formatar CPF
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado
 */
function formatarCPF(cpf) {
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '');
}

/**
 * 📅 Formatar data para exibição
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {string} Data formatada DD/MM/YYYY
 */
function formatarData(data) {
  if (!data) return '';

  try {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error('❌ Erro ao formatar data:', error);
    return data;
  }
}

/**
 * 🧮 Calcular idade baseada na data de nascimento
 * @param {string} dataNascimento - Data no formato YYYY-MM-DD
 * @returns {number} Idade em anos
 */
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 0;

  try {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  } catch (error) {
    console.error('❌ Erro ao calcular idade:', error);
    return 0;
  }
}

/* ============================================================================
✨ FUNÇÃO DE FORMATAÇÃO: formatarCertidaoObito
📌 Objetivo: Aplicar máscara automática no formato da certidão de óbito
📌 Formato final: 123456 01 55 2024 1 00001 123 1234567-12
========================================================================  */

// 📌 Declaração da função que recebe o valor digitado como parâmetro
function formatarCertidaoObito(valor) {
  // 📌 LIMPEZA: Remove todos os caracteres que NÃO são dígitos (0-9)
  // 📌 /\D/g: expressão regular que seleciona tudo que não é dígito
  // 📌 'g': flag global para substituir todas as ocorrências
  // 📌 Resultado: apenas números permanecem na string
  valor = valor.replace(/\D/g, '');

  // 📌 ETAPA 1: Formata os primeiros 6 dígitos (código da serventia)
  // 📌 (\d{6}): captura exatamente 6 dígitos e armazena no grupo $1
  // 📌 (\d): captura o próximo dígito e armazena no grupo $2
  // 📌 '$1 $2': substitui adicionando um espaço entre os grupos
  // 📌 Exemplo: 123456789 → 123456 7
  valor = valor.replace(/(\d{6})(\d)/, '$1 $2');

  // 📌 ETAPA 2: Formata o dia (2 dígitos)
  // 📌 (\d{6}) (\d{2}): mantém os 6 primeiros + espaço + captura 2 dígitos
  // 📌 (\d): captura o próximo dígito
  // 📌 Adiciona espaço após o dia
  // 📌 Exemplo: 123456 789 → 123456 78 9
  valor = valor.replace(/(\d{6}) (\d{2})(\d)/, '$1 $2 $3');

  // 📌 ETAPA 3: Formata o mês (2 dígitos)
  // 📌 (\d{6}) (\d{2}) (\d{2}): mantém serventia + dia + captura mês
  // 📌 (\d): captura o próximo dígito
  // 📌 Adiciona espaço após o mês
  // 📌 Exemplo: 123456 01 559 → 123456 01 55 9
  valor = valor.replace(/(\d{6}) (\d{2}) (\d{2})(\d)/, '$1 $2 $3 $4');

  // 📌 ETAPA 4: Formata o ano (4 dígitos)
  // 📌 (\d{6}) (\d{2}) (\d{2}) (\d{4}): mantém serventia + dia + mês + captura ano
  // 📌 (\d): captura o próximo dígito
  // 📌 Adiciona espaço após o ano
  // 📌 Exemplo: 123456 01 55 20241 → 123456 01 55 2024 1
  valor = valor.replace(/(\d{6}) (\d{2}) (\d{2}) (\d{4})(\d)/, '$1 $2 $3 $4 $5');

  // 📌 ETAPA 5: Formata o tipo do livro (1 dígito)
  // 📌 (\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}): mantém campos anteriores + tipo
  // 📌 (\d): captura o próximo dígito
  // 📌 Adiciona espaço após o tipo
  // 📌 Exemplo: 123456 01 55 2024 10 → 123456 01 55 2024 1 0
  valor = valor.replace(/(\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1})(\d)/, '$1 $2 $3 $4 $5 $6');

  // 📌 ETAPA 6: Formata o número da folha (5 dígitos)
  // 📌 (\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}) (\d{5}): mantém campos + captura folha
  // 📌 (\d): captura o próximo dígito
  // 📌 Adiciona espaço após a folha
  // 📌 Exemplo: 123456 01 55 2024 1 00001123 → 123456 01 55 2024 1 00001 1
  valor = valor.replace(/(\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}) (\d{5})(\d)/, '$1 $2 $3 $4 $5 $6 $7');

  // 📌 ETAPA 7: Formata o número do livro (3 dígitos)
  // 📌 (\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}) (\d{5}) (\d{3}): campos + livro
  // 📌 (\d): captura o próximo dígito
  // 📌 Adiciona espaço após o livro
  // 📌 Exemplo: 123456 01 55 2024 1 00001 1231 → 123456 01 55 2024 1 00001 123 1
  valor = valor.replace(/(\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}) (\d{5}) (\d{3})(\d)/, '$1 $2 $3 $4 $5 $6 $7 $8');

  // 📌 ETAPA 8: Formata o número do registro (7 dígitos) e dígitos verificadores (2 dígitos)
  // 📌 (\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}) (\d{5}) (\d{3}) (\d{7}): todos os campos
  // 📌 (\d): captura os dígitos verificadores
  // 📌 '$1 $2 $3 $4 $5 $6 $7 $8-$9': adiciona hífen antes dos dígitos verificadores
  // 📌 Exemplo final: 123456 01 55 2024 1 00001 123 1234567-12
  valor = valor.replace(
    /(\d{6}) (\d{2}) (\d{2}) (\d{4}) (\d{1}) (\d{5}) (\d{3}) (\d{7})(\d)/,
    '$1 $2 $3 $4 $5 $6 $7 $8-$9'
  );

  // 📌 RETORNO: devolve o valor formatado para ser exibido no input
  return valor;
}

// ============================================================================
// 📌 EVENT LISTENER: Aguarda o carregamento completo do DOM
// 📌 DOMContentLoaded: evento disparado quando todo o HTML foi carregado
// ============================================================================

// 📌 addEventListener: registra um ouvinte de evento no documento
// 📌 'DOMContentLoaded': nome do evento que aguarda o carregamento do DOM
// 📌 function() {...}: função anônima executada quando o evento ocorre
document.addEventListener('DOMContentLoaded', function () {
  // 📌 SELEÇÃO DO CAMPO: busca o input que possui o atributo data-certidao-obito
  // 📌 querySelector: retorna o primeiro elemento que corresponde ao seletor CSS
  // 📌 '[data-certidao-obito]': seletor de atributo que encontra elementos com este atributo
  // 📌 Resultado armazenado na constante 'campoCertidao'
  const campoCertidao = document.querySelector('[data-certidao-obito]');

  // 📌 VERIFICAÇÃO: confirma se o elemento foi encontrado no DOM
  // 📌 if (campoCertidao): executa o bloco apenas se o campo existir na página
  // 📌 Previne erros caso o campo não esteja presente
  if (campoCertidao) {
    // 📌 EVENTO INPUT: detecta qualquer alteração no valor do campo
    // 📌 addEventListener: adiciona um ouvinte de evento ao campo
    // 📌 'input': evento disparado sempre que o usuário digita, cola ou modifica o valor
    // 📌 function(e) {...}: função que recebe o objeto do evento como parâmetro 'e'
    campoCertidao.addEventListener('input', function (e) {
      // 📌 APLICAÇÃO DA MÁSCARA: atualiza o valor do campo com a formatação
      // 📌 e.target: referência ao elemento que disparou o evento (o input)
      // 📌 e.target.value: valor atual digitado no campo
      // 📌 formatarCertidaoObito(): chama a função de formatação
      // 📌 O resultado formatado substitui o valor do campo em tempo real
      e.target.value = formatarCertidaoObito(e.target.value);
    }); // 📌 Fim do addEventListener de 'input'
  } // 📌 Fim da verificação if (campoCertidao)
}); // 📌 Fim do addEventListener de 'DOMContentLoaded'

/* =========================================================================
✨ FIM DA FUNÇÃO DE FORMATAÇÃO: formatarCertidaoObito
========================================================================  */

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 32: SISTEMA DE FORMATAÇÃO DE TEMPO MILITAR
Formato: 6 dígitos → 00 anos 00 meses 00 dias
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

/* ======================
FUNÇÃO PRINCIPAL - Formata entrada de 6 dígitos
====================== */
function formatarTempo(elemento) {
  let valor = elemento.value;
  let numeros = valor.replace(/\D/g, '');

  // Limita a exatamente 6 dígitos
  numeros = numeros.substring(0, 6);

  let formatado = '';

  if (numeros.length > 0) {
    // Adiciona anos (2 primeiros dígitos)
    formatado += numeros.substring(0, 2);

    if (numeros.length >= 2) {
      const anos = numeros.substring(0, 2);
      formatado += ' ano' + (anos !== '01' ? 's' : '');
    }

    // Adiciona meses (dígitos 3 e 4)
    if (numeros.length >= 3) {
      formatado += ' ' + numeros.substring(2, 4);
    }

    if (numeros.length >= 4) {
      const meses = numeros.substring(2, 4);
      formatado += meses !== '01' ? ' meses' : ' mês';
    }

    // Adiciona dias (dígitos 5 e 6)
    if (numeros.length >= 5) {
      formatado += ' ' + numeros.substring(4, 6);
    }

    if (numeros.length >= 6) {
      const dias = numeros.substring(4, 6);
      formatado += ' dia' + (dias !== '01' ? 's' : '');
    }
  }

  elemento.value = formatado;

  // Salva automaticamente
  if (elemento.id) {
    salvarTempoAutomaticamente(elemento.id, formatado);
  }
}

/* ======================
FUNÇÃO: Extrai números do tempo formatado
====================== */
function extrairNumerosDoTempo(tempoFormatado) {
  if (!tempoFormatado) return '';
  return tempoFormatado.replace(/\D/g, '');
}

/* ======================
FUNÇÃO: Valida o tempo digitado
====================== */
function validarTempo(tempo) {
  if (!tempo) return false;

  const numeros = tempo.replace(/\D/g, '');

  // Precisa ter pelo menos 2 dígitos (anos)
  if (numeros.length < 2) return false;

  // Se tem meses, valida (00-12)
  if (numeros.length >= 4) {
    const mes = parseInt(numeros.substring(2, 4));
    if (mes > 12) return false;
  }

  // Se tem dias, valida (00-31)
  if (numeros.length >= 6) {
    const dia = parseInt(numeros.substring(4, 6));
    if (dia > 31) return false;
  }

  return true;
}

/* ======================
FUNÇÃO: Converte tempo formatado em objeto
====================== */
function parseaTempo(tempoFormatado) {
  const numeros = tempoFormatado.replace(/\D/g, '');

  const anos = numeros.length >= 2 ? parseInt(numeros.substring(0, 2)) : 0;
  const meses = numeros.length >= 4 ? parseInt(numeros.substring(2, 4)) : 0;
  const dias = numeros.length >= 6 ? parseInt(numeros.substring(4, 6)) : 0;

  return {
    anos: anos,
    meses: meses,
    dias: dias,
    totalDias: calcularTotalDias(anos, meses, dias),
  };
}

/* ======================
FUNÇÃO: Calcula total de dias
====================== */
function calcularTotalDias(anos, meses, dias) {
  return anos * 365 + meses * 30 + dias;
}

/* ======================
FUNÇÃO: Salva dados no navegador
====================== */
function salvarTempoAutomaticamente(campoId, valor) {
  const camposTempoMilitrares = [
    'tempoEfetivoServico',
    'tempoServicoPublico',
    'tempoServicoPrivado',
    'tempoServicoAcademico',
    'tempoAlunoOFR',
    'tempoGuarnicaoEspecial',
    'tempoLENaoGozada',
    'tempoServicoNaoComputado',
    'tempoServicoTotal',
    'tempoServicoProventos',
  ];

  if (!camposTempoMilitrares.includes(campoId)) return;

  const temposAtualizado = JSON.parse(localStorage.getItem('pensaoMilitar_tempos') || '{}');
  temposAtualizado[campoId] = valor;
  localStorage.setItem('pensaoMilitar_tempos', JSON.stringify(temposAtualizado));

  console.log(`Tempo salvo: ${campoId} = ${valor}`);
}

/* ======================
FUNÇÃO: Restaura dados salvos
====================== */
function restaurarCamposDeTempos() {
  try {
    const temposSalvos = localStorage.getItem('pensaoMilitar_tempos');
    if (!temposSalvos) return;

    const tempos = JSON.parse(temposSalvos);

    Object.keys(tempos).forEach((campoId) => {
      const elemento = document.getElementById(campoId);
      if (elemento) {
        elemento.value = tempos[campoId];
      }
    });

    console.log(`Tempos recuperados: ${Object.keys(tempos).length} campos`);
  } catch (error) {
    console.error('Erro ao recuperar tempos:', error);
  }
}

/* ======================
FUNÇÃO: Configura eventos dos campos
====================== */
function configurarCamposDeTempos() {
  const camposTempoMilitrares = [
    'tempoEfetivoServico',
    'tempoServicoPublico',
    'tempoServicoPrivado',
    'tempoServicoAcademico',
    'tempoAlunoOFR',
    'tempoGuarnicaoEspecial',
    'tempoLENaoGozada',
    'tempoServicoNaoComputado',
    'tempoServicoTotal',
    'tempoServicoProventos',
  ];

  camposTempoMilitrares.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      // Adiciona placeholder para orientar usuário
      campo.placeholder = 'Digite: anos + meses + dias (ex: 010215)';

      // Evento de digitação - formata em tempo real
      campo.addEventListener('input', function (e) {
        formatarTempo(this);
      });

      // Evento ao sair do campo - valida
      campo.addEventListener('blur', function (e) {
        if (!validarTempo(this.value) && this.value.trim() !== '') {
          this.style.borderColor = '#10b981';
          mostrarNotificacao(
            'Tempo inválido. Digite anos + meses + dias (ex: 010215 = 01 anos 02 meses 15 dias)',
            'erro'
          );
        } else if (this.value.trim() !== '') {
          this.style.borderColor = '#10b981';
        }
      });

      // Evento ao focar no campo - seleciona tudo
      campo.addEventListener('focus', function (e) {
        this.select();
      });
    }
  });

  console.log('✓ Campos de tempo configurados (digitação livre)');
}

/* ======================
FUNÇÃO: Valida todos os campos
====================== */
function validarTodosCamposDeTempos() {
  const camposTempoMilitrares = [
    'tempoEfetivoServico',
    'tempoServicoPublico',
    'tempoServicoPrivado',
    'tempoServicoAcademico',
    'tempoAlunoOFR',
    'tempoGuarnicaoEspecial',
    'tempoLENaoGozada',
    'tempoServicoNaoComputado',
    'tempoServicoTotal',
    'tempoServicoProventos',
  ];

  let todosValidos = true;

  camposTempoMilitrares.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo && campo.value.trim() !== '') {
      if (!validarTempo(campo.value)) {
        campo.style.borderColor = '#ef4444';
        todosValidos = false;
      } else {
        campo.style.borderColor = '#10b981';
      }
    }
  });

  return todosValidos;
}

/* ======================
FUNÇÃO: Limpa todos os campos
====================== */
function limparCamposDeTempos() {
  const camposTempoMilitrares = [
    'tempoEfetivoServico',
    'tempoServicoPublico',
    'tempoServicoPrivado',
    'tempoServicoAcademico',
    'tempoAlunoOFR',
    'tempoGuarnicaoEspecial',
    'tempoLENaoGozada',
    'tempoServicoNaoComputado',
    'tempoServicoTotal',
    'tempoServicoProventos',
  ];

  camposTempoMilitrares.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.value = '';
      campo.style.borderColor = '';
    }
  });

  localStorage.removeItem('pensaoMilitar_tempos');
  console.log('✓ Campos de tempo limpos');
}

/* ======================
FUNÇÃO: Gera relatório completo
====================== */
function gerarRelatorioTemposDeServico() {
  const tempos = {
    'Tempo de Efetivo Serviço': parseaTempo(document.getElementById('tempoEfetivoServico')?.value || ''),
    'Tempo de Serviço Público': parseaTempo(document.getElementById('tempoServicoPublico')?.value || ''),
    'Tempo de Serviço Privado': parseaTempo(document.getElementById('tempoServicoPrivado')?.value || ''),
    'Tempo de Serviço Acadêmico': parseaTempo(document.getElementById('tempoServicoAcademico')?.value || ''),
    'Tempo de Aluno OFR': parseaTempo(document.getElementById('tempoAlunoOFR')?.value || ''),
    'Tempo de Guarnição Especial': parseaTempo(document.getElementById('tempoGuarnicaoEspecial')?.value || ''),
    'Tempo de LE não gozada': parseaTempo(document.getElementById('tempoLENaoGozada')?.value || ''),
    'Tempo de Serviço não computado': parseaTempo(document.getElementById('tempoServicoNaoComputado')?.value || ''),
    'Tempo de Serviço Total': parseaTempo(document.getElementById('tempoServicoTotal')?.value || ''),
    'Tempo de Serviço para Proventos': parseaTempo(document.getElementById('tempoServicoProventos')?.value || ''),
  };

  let relatorio = 'RELATÓRIO DE TEMPOS DE SERVIÇO\n';
  relatorio += '='.repeat(50) + '\n\n';

  let totalDiasGeral = 0;

  Object.keys(tempos).forEach((tipo) => {
    const tempo = tempos[tipo];
    if (tempo.totalDias > 0) {
      relatorio += `${tipo}:\n`;
      relatorio += `  Anos: ${tempo.anos}\n`;
      relatorio += `  Meses: ${tempo.meses}\n`;
      relatorio += `  Dias: ${tempo.dias}\n`;
      relatorio += `  Total de dias: ${tempo.totalDias}\n\n`;
      totalDiasGeral += tempo.totalDias;
    }
  });

  relatorio += '='.repeat(50) + '\n';
  relatorio += `TOTAL GERAL: ${totalDiasGeral} dias\n`;
  const anosTotal = Math.floor(totalDiasGeral / 365);
  const mesesTotal = Math.floor((totalDiasGeral % 365) / 30);
  const diasTotal = totalDiasGeral % 30;
  relatorio += `Equivalente a: ${anosTotal} anos, ${mesesTotal} meses e ${diasTotal} dias`;

  return relatorio;
}

/* ======================
FUNÇÃO: Mostra notificação (requer implementação)
====================== */
function mostrarNotificacao(mensagem, tipo) {
  console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
  // Implementar conforme sistema de notificações do seu aplicativo
}

/* ======================
INICIALIZAÇÃO
====================== */
document.addEventListener('DOMContentLoaded', function () {
  configurarCamposDeTempos();
  restaurarCamposDeTempos();

  console.log('✓ Sistema de tempo militar pronto (digitação em tempo real)');
});

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 34: SISTEMA DE CONVERSÃO AUTOMÁTICA PARA MAIÚSCULAS
Converte texto digitado para MAIÚSCULAS em tempo real
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

/* ======================
FUNÇÃO PRINCIPAL - Converte para maiúsculas
====================== */
function converterParaMaiusculas(elemento) {
  // Pega a posição atual do cursor
  const posicaoCursor = elemento.selectionStart;

  // Converte o texto para maiúsculas
  const textoMaiusculo = elemento.value.toUpperCase();

  // Atualiza o valor do campo
  elemento.value = textoMaiusculo;

  // Restaura a posição do cursor
  elemento.setSelectionRange(posicaoCursor, posicaoCursor);

  // Salva automaticamente (se necessário)
  if (elemento.id) {
    salvarCampoAutomaticamente(elemento.id, textoMaiusculo);
  }
}

/* ======================
FUNÇÃO: Verifica valor e converte para maiúsculas
Mantém compatibilidade com a função verificarValor existente
====================== */
function verificarValor(elemento) {
  converterParaMaiusculas(elemento);

  // Atualiza a label flutuante se necessário
  atualizarLabelFlutuante(elemento);
}

/* ======================
FUNÇÃO: Atualiza estado da label flutuante
====================== */
function atualizarLabelFlutuante(elemento) {
  const label = elemento.nextElementSibling;

  if (elemento.value.trim() !== '') {
    if (label && label.tagName === 'LABEL') {
      label.classList.add('ativo');
    }
  } else {
    if (label && label.tagName === 'LABEL') {
      label.classList.remove('ativo');
    }
  }
}

/* ======================
FUNÇÃO: Salva dados no navegador
====================== */
function salvarCampoAutomaticamente(campoId, valor) {
  try {
    const dadosSalvos = JSON.parse(localStorage.getItem('pensaoMilitar_dados') || '{}');
    dadosSalvos[campoId] = valor;
    localStorage.setItem('pensaoMilitar_dados', JSON.stringify(dadosSalvos));
    console.log(`Campo salvo: ${campoId} = ${valor}`);
  } catch (error) {
    console.error('Erro ao salvar campo:', error);
  }
}

/* ======================
FUNÇÃO: Restaura dados salvos
====================== */
function restaurarCamposMaiusculos() {
  try {
    const dadosSalvos = localStorage.getItem('pensaoMilitar_dados');
    if (!dadosSalvos) return;

    const dados = JSON.parse(dadosSalvos);

    // Lista de campos que devem ser em maiúsculas
    const camposMaiusculos = [
      'nomeInstituidor',
      'nomeRequerente',
      'nomeRepresentanteLegal',
      'nomeMae',
      'nomePai',
      // Adicione outros campos conforme necessário
    ];

    camposMaiusculos.forEach((campoId) => {
      if (dados[campoId]) {
        const elemento = document.getElementById(campoId);
        if (elemento) {
          elemento.value = dados[campoId];
          atualizarLabelFlutuante(elemento);
        }
      }
    });

    console.log('✓ Campos restaurados');
  } catch (error) {
    console.error('Erro ao restaurar campos:', error);
  }
}

/* ======================
FUNÇÃO: Configura campos para maiúsculas automáticas
====================== */
function configurarCamposMaiusculos() {
  // Lista de campos que devem converter para maiúsculas
  const camposMaiusculos = [
    'nomeInstituidor',
    'nomePensionista',
    'nomeRepresentanteLegal',
    'nomeMae',
    'nomePai',
    // Adicione outros campos conforme necessário
  ];

  camposMaiusculos.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      // Evento de digitação - converte em tempo real
      campo.addEventListener('input', function (e) {
        converterParaMaiusculas(this);
      });

      // Evento de colar texto - também converte
      campo.addEventListener('paste', function (e) {
        setTimeout(() => {
          converterParaMaiusculas(this);
        }, 10);
      });

      // Evento ao perder foco - garante conversão
      campo.addEventListener('blur', function (e) {
        converterParaMaiusculas(this);
      });

      console.log(`✓ Campo configurado: ${campoId}`);
    }
  });

  console.log('✓ Sistema de maiúsculas ativado');
}

/* ======================
FUNÇÃO: Limpa campos específicos
====================== */
function limparCamposMaiusculos() {
  const camposMaiusculos = ['nomeInstituidor', 'nomePensionista', 'nomeRepresentanteLegal', 'nomeMae', 'nomePai'];

  camposMaiusculos.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.value = '';
      atualizarLabelFlutuante(campo);
    }
  });

  // Remove do localStorage
  try {
    const dadosSalvos = JSON.parse(localStorage.getItem('pensaoMilitar_dados') || '{}');
    camposMaiusculos.forEach((campoId) => {
      delete dadosSalvos[campoId];
    });
    localStorage.setItem('pensaoMilitar_dados', JSON.stringify(dadosSalvos));
  } catch (error) {
    console.error('Erro ao limpar campos:', error);
  }

  console.log('✓ Campos de maiúsculas limpos');
}

/* ======================
FUNÇÃO: Validação de nomes
====================== */
function validarNome(nome) {
  if (!nome || nome.trim() === '') return false;

  // Remove espaços extras
  nome = nome.trim();

  // Deve ter pelo menos 2 caracteres
  if (nome.length < 2) return false;

  // Deve conter pelo menos uma letra
  if (!/[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/.test(nome)) return false;

  return true;
}

/* ======================
FUNÇÃO: Formata nome próprio (opcional)
Converte para maiúsculas mantendo formato de nome
====================== */
function formatarNomeProprio(texto) {
  // Converte tudo para maiúsculas
  return texto.toUpperCase();

  // Se preferir formato "Título" (primeira letra maiúscula):
  // return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/* ======================
INICIALIZAÇÃO
====================== */
document.addEventListener('DOMContentLoaded', function () {
  configurarCamposMaiusculos();
  restaurarCamposMaiusculos();

  console.log('✓ Sistema de conversão para maiúsculas pronto');
});

/* ======================
EXEMPLO DE USO NO HTML:
======================

<div class="campo-flutuante">
    <input type="text" 
           id="nomeInstituidor" 
           name="nomeInstituidor" 
           required 
           autocomplete="off"
           placeholder=" " 
           oninput="verificarValor(this)">
    <label for="nomeInstituidor">Nome do Instituidor</label>
</div>

NOTA: A função verificarValor(this) já está incluída e funcionará
automaticamente com a conversão para maiúsculas.
====================== */

/* ========================================================================
📊 SEÇÃO 32: SISTEMA DE BACKUP E RESTORE
========================================================================= */

/**
 * 📤 Exportar todos os dados para backup
 * @returns {Object} Objeto com todos os dados
 */
function exportarDados() {
  const backup = {
    versao: configuracoesSistema.versaoSistema,
    timestamp: new Date().toISOString(),
    instituidor: estadoAtual.instituidor,
    requerentes: estadoAtual.requerentes,
    calculo: estadoAtual.calculo,
    contracheque: estadoAtual.contracheque,
    contadorRequerentes: estadoAtual.contadorRequerentes,
    abaAtiva: estadoAtual.abaAtiva,
  };

  console.log('📤 Dados exportados para backup');
  return backup;
}

/**
 * 📥 Importar dados de backup
 * @param {Object} backup - Objeto com dados de backup
 * @returns {boolean} Sucesso da operação
 */
function importarDados(backup) {
  try {
    if (!backup || backup.versao !== configuracoesSistema.versaoSistema) {
      console.error('❌ Backup inválido ou versão incompatível');
      return false;
    }

    // Restaurar estado
    estadoAtual.instituidor = backup.instituidor || {};
    estadoAtual.requerentes = backup.requerentes || [];
    estadoAtual.calculo = backup.calculo || {};
    estadoAtual.contracheque = backup.contracheque || {};
    estadoAtual.contadorRequerentes = backup.contadorRequerentes || 0;
    estadoAtual.abaAtiva = backup.abaAtiva || 'menuInicial';

    // Salvar no localStorage
    localStorage.setItem('pensaoMilitar_instituidor', JSON.stringify(estadoAtual.instituidor));
    localStorage.setItem('pensaoMilitar_requerentes', JSON.stringify(estadoAtual.requerentes));
    localStorage.setItem('pensaoMilitar_calculo', JSON.stringify(estadoAtual.calculo));
    localStorage.setItem('pensaoMilitar_contracheque', JSON.stringify(estadoAtual.contracheque));
    localStorage.setItem('pensaoMilitar_abaAtiva', estadoAtual.abaAtiva);

    // Recarregar interface
    location.reload();

    console.log('📥 Dados importados com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
    return false;
  }
}

/**
 * 💾 Salvar backup automaticamente
 */
function salvarBackupAutomatico() {
  const backup = exportarDados();
  localStorage.setItem('pensaoMilitar_backup_auto', JSON.stringify(backup));
  console.log('💾 Backup automático salvo');
}

/**
 * 🔄 Inicializar auto-save
 */
function inicializarAutoSave() {
  setInterval(() => {
    if (
      Object.keys(estadoAtual.instituidor).length > 0 ||
      estadoAtual.requerentes.length > 0 ||
      Object.keys(estadoAtual.calculo).length > 0
    ) {
      salvarBackupAutomatico();
    }
  }, configuracoesSistema.intervalAutoSave);

  console.log(`🔄 Auto-save iniciado (intervalo: ${configuracoesSistema.intervalAutoSave}ms)`);
}

/* ========================================================================
🏁 FINALIZAÇÃO - TOGGLE DO CÁLCULO
========================================================================= */

/**
 * 🔧 Configurar toggle do cálculo da pensão militar
 */
function configurarToggleCalculo() {
  const botao = document.getElementById('toggleCalculoBtn');
  const container = document.getElementById('calculoContainer');
  const icon = document.getElementById('toggleCalculoIcon');
  const text = document.getElementById('toggleCalculoText');

  if (botao && container) {
    // Garantir que começa oculto
    container.classList.add('hidden');

    // Configuração inicial do botão
    if (icon && text) {
      icon.className = 'fas fa-eye';
      text.textContent = 'Exibir Cálculo da Pensão Militar';
    }

    console.log('🔧 Toggle de Cálculo da Pensão configurado');
  }
}

/* ========================================================================
🚀 SEÇÃO 33: INICIALIZAÇÃO DO SISTEMA (ATUALIZADA)
========================================================================= */

/**
 * 🎯 Função principal de inicialização
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('🎯 Sistema de Pensão Militar Inicializado - Versão 2.0');

  // Configurar sistema de navegação entre abas
  configurarNavegacao();

  // Carregar todos os dados das APIs em paralelo
  carregarTodasAPIs();

  // Popular campo SVP/SGPGu após carregar órgãos
  setTimeout(() => {
    popularSelectSVPVinculacao();
  }, 2000);

  // Configurar eventos para armazenamento automático
  configurarArmazenamentoAutomatico();

  // Restaurar dados salvos anteriormente
  restaurarDadosSalvos();

  // Configurar modais de confirmação e sucesso
  configurarModais();

  // Configurar responsividade da interface
  configurarResponsividade();

  // === CONFIGURAR TODOS OS TOGGLES ===
  configurarTodosToggles();

  // === CONFIGURAR LABELS FLUTUANTES ===
  configurarLabelsFlutantes();

  // === INICIALIZAR MÁSCARAS ===
  inicializarMascarasCPF();
  inicializarMascarasIdentidade();
  inicializarMascarasPrecCP();
  inicializarMascarasDataEB();

  // Verificar campos preenchidos após aplicar máscaras
  verificarCamposPreenchidos();

  // Notificação de boas-vindas
  setTimeout(() => {
    if (!localStorage.getItem('pensaoMilitar_visitado')) {
      mostrarNotificacao('Bem-vindo ao Sistema de Pensão Militar!', 'info');
      localStorage.setItem('pensaoMilitar_visitado', 'true');
    }
  }, 2000);

  // Inicializar auto-save após 5 segundos
  setTimeout(() => {
    inicializarAutoSave();
  }, 5000);

  console.log('✅ Sistema totalmente carregado e operacional!');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   🚀 SEÇÃO 35: SISTEMA AVANÇADO DE PERSISTÊNCIA DE DADOS
   
   📌 Funcionalidades:
   ✅ Salvamento automático em tempo real (debounce 500ms)
   ✅ Persistência após crashes/recarregamentos
   ✅ Limpeza automática após 12 horas de inatividade
   ✅ Sistema de versionamento de dados
   ✅ Compressão LZString para economia de espaço
   ✅ Backup em IndexedDB + LocalStorage
   ✅ Sincronização com botões "Limpar Aba"
   ✅ Indicador visual de status de salvamento
   ✅ Logs detalhados para debug
   
   👩‍💻 Desenvolvido por: 3º Sgt Ana Cristina - DAP
   📅 Versão: 3.0 - Sistema de Persistência Avançado
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📦 CONFIGURAÇÕES GLOBAIS DO SISTEMA DE PERSISTÊNCIA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const PERSISTENCIA_CONFIG = {
  // ⏱️ Tempo máximo de inatividade antes da limpeza automática (12 horas em milissegundos)
  TEMPO_EXPIRACAO: 12 * 60 * 60 * 1000, // 12 horas

  // ⚡ Intervalo de debounce para salvamento (evita salvar a cada tecla)
  DEBOUNCE_DELAY: 500, // 500ms

  // 🔄 Intervalo de verificação de expiração (verifica a cada 5 minutos)
  INTERVALO_VERIFICACAO: 5 * 60 * 1000, // 5 minutos

  // 💾 Prefixo das chaves no localStorage
  PREFIXO_STORAGE: 'sigpem_v3_',

  // 📊 Nome do banco IndexedDB
  NOME_INDEXEDDB: 'SIGPEM_DB',
  VERSAO_INDEXEDDB: 3,

  // 🗂️ Stores do IndexedDB
  STORE_DADOS: 'dados_formulario',
  STORE_HISTORICO: 'historico_alteracoes',
  STORE_BACKUP: 'backup_completo',

  // 🎯 Limite de histórico (últimas N versões)
  LIMITE_HISTORICO: 20,

  // ⚠️ Tamanho máximo de dados (5MB por padrão do localStorage)
  TAMANHO_MAXIMO: 5 * 1024 * 1024, // 5MB

  // 🔐 Chave de encriptação (opcional - usar em produção)
  CHAVE_ENCRIPTACAO: 'SIGPEM-EB-2025',
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🎯 CLASSE PRINCIPAL - GERENCIADOR DE PERSISTÊNCIA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

class GerenciadorPersistencia {
  constructor() {
    this.db = null; // Conexão com IndexedDB
    this.timeoutsSalvamento = new Map(); // Controle de debounce por campo
    this.ultimoSalvamento = null; // Timestamp do último salvamento
    this.statusSalvamento = 'sincronizado'; // Status: 'salvando', 'sincronizado', 'erro'
    this.observadorMutacoes = null; // Observer para detectar mudanças no DOM
    this.intervalVerificacao = null; // Intervalo de verificação de expiração
    this.historicoAlteracoes = []; // Cache do histórico de alterações
    this.camposMonitorados = new Set(); // Set de campos sendo monitorados
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🚀 INICIALIZAÇÃO DO SISTEMA
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async inicializar() {
    try {
      console.log('🚀 Iniciando Sistema de Persistência Avançado v3.0...');

      // 1️⃣ Conectar ao IndexedDB
      await this.conectarIndexedDB();

      // 2️⃣ Verificar e limpar dados expirados
      await this.verificarExpiracao();

      // 3️⃣ Restaurar dados salvos
      await this.restaurarDadosSalvos();

      // 4️⃣ Configurar monitoramento de campos
      this.configurarMonitoramentoCampos();

      // 5️⃣ Configurar observer de mutações (para campos dinâmicos)
      this.configurarObserverMutacoes();

      // 6️⃣ Iniciar verificação periódica de expiração
      this.iniciarVerificacaoPeriodica();

      // 7️⃣ Configurar eventos de visibilidade da página
      this.configurarEventosVisibilidade();

      // 8️⃣ Configurar salvamento antes de sair da página
      this.configurarSalvamentoAntesSair();

      // 9️⃣ Exibir indicador de status
      this.criarIndicadorStatus();

      console.log('✅ Sistema de Persistência inicializado com sucesso!');
      this.atualizarStatusVisual('sincronizado');

      return true;
    } catch (erro) {
      console.error('❌ Erro ao inicializar Sistema de Persistência:', erro);
      this.atualizarStatusVisual('erro');
      return false;
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 CONEXÃO COM INDEXEDDB
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  conectarIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('⚠️ IndexedDB não disponível, usando apenas localStorage');
        resolve(null);
        return;
      }

      const requisicao = indexedDB.open(PERSISTENCIA_CONFIG.NOME_INDEXEDDB, PERSISTENCIA_CONFIG.VERSAO_INDEXEDDB);

      requisicao.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB');
        reject(requisicao.error);
      };

      requisicao.onsuccess = () => {
        this.db = requisicao.result;
        console.log('✅ Conexão com IndexedDB estabelecida');
        resolve(this.db);
      };

      requisicao.onupgradeneeded = (evento) => {
        const db = evento.target.result;

        // Store principal de dados
        if (!db.objectStoreNames.contains(PERSISTENCIA_CONFIG.STORE_DADOS)) {
          const storeDados = db.createObjectStore(PERSISTENCIA_CONFIG.STORE_DADOS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          storeDados.createIndex('timestamp', 'timestamp', { unique: false });
          storeDados.createIndex('aba', 'aba', { unique: false });
        }

        // Store de histórico
        if (!db.objectStoreNames.contains(PERSISTENCIA_CONFIG.STORE_HISTORICO)) {
          const storeHistorico = db.createObjectStore(PERSISTENCIA_CONFIG.STORE_HISTORICO, {
            keyPath: 'id',
            autoIncrement: true,
          });
          storeHistorico.createIndex('timestamp', 'timestamp', { unique: false });
          storeHistorico.createIndex('campoId', 'campoId', { unique: false });
        }

        // Store de backup completo
        if (!db.objectStoreNames.contains(PERSISTENCIA_CONFIG.STORE_BACKUP)) {
          const storeBackup = db.createObjectStore(PERSISTENCIA_CONFIG.STORE_BACKUP, {
            keyPath: 'id',
            autoIncrement: true,
          });
          storeBackup.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('🔧 Estrutura do IndexedDB criada/atualizada');
      };
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🔍 MONITORAMENTO DE CAMPOS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  configurarMonitoramentoCampos() {
    console.log('🔍 Configurando monitoramento de campos...');

    // Seleciona TODOS os campos flutuantes (inputs, selects, textareas)
    const campos = document.querySelectorAll(
      '.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea'
    );

    let camposConfigurados = 0;

    campos.forEach((campo) => {
      // Ignora campos sem ID ou já monitorados
      if (!campo.id || this.camposMonitorados.has(campo.id)) return;

      // Marca como monitorado
      this.camposMonitorados.add(campo.id);

      // Evento INPUT - dispara enquanto digita (com debounce)
      campo.addEventListener('input', (e) => {
        this.salvarCampoComDebounce(e.target);
      });

      // Evento CHANGE - dispara ao perder foco ou mudar valor
      campo.addEventListener('change', (e) => {
        this.salvarCampoImediato(e.target);
      });

      // Evento BLUR - dispara ao perder o foco (força salvamento)
      campo.addEventListener('blur', (e) => {
        this.salvarCampoImediato(e.target);
      });

      camposConfigurados++;
    });

    console.log(`✅ ${camposConfigurados} campos configurados para monitoramento automático`);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     👀 OBSERVER DE MUTAÇÕES (para campos adicionados dinamicamente)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  configurarObserverMutacoes() {
    this.observadorMutacoes = new MutationObserver((mutacoes) => {
      let novoscamposAdicionados = false;

      mutacoes.forEach((mutacao) => {
        if (mutacao.type === 'childList' && mutacao.addedNodes.length > 0) {
          mutacao.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Verifica se o nó adicionado é um campo flutuante ou contém campos
              const campos = node.querySelectorAll
                ? node.querySelectorAll('.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea')
                : [];

              if (campos.length > 0) {
                novoscamposAdicionados = true;
              }

              // Verifica se o próprio nó é um campo
              if (
                node.matches &&
                node.matches('.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea')
              ) {
                novoscamposAdicionados = true;
              }
            }
          });
        }
      });

      // Reconfigura monitoramento se novos campos foram adicionados
      if (novoscamposAdicionados) {
        console.log('🔄 Novos campos detectados, reconfigurando monitoramento...');
        this.configurarMonitoramentoCampos();
      }
    });

    // Observa mudanças em todo o body
    this.observadorMutacoes.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('👀 Observer de mutações configurado');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAMENTO COM DEBOUNCE (evita salvar a cada tecla)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  salvarCampoComDebounce(campo) {
    if (!campo || !campo.id) return;

    // Cancela timeout anterior deste campo
    if (this.timeoutsSalvamento.has(campo.id)) {
      clearTimeout(this.timeoutsSalvamento.get(campo.id));
    }

    // Atualiza status visual
    this.atualizarStatusVisual('salvando');

    // Cria novo timeout
    const timeout = setTimeout(() => {
      this.salvarCampo(campo);
      this.timeoutsSalvamento.delete(campo.id);
    }, PERSISTENCIA_CONFIG.DEBOUNCE_DELAY);

    this.timeoutsSalvamento.set(campo.id, timeout);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ⚡ SALVAMENTO IMEDIATO (sem debounce)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  salvarCampoImediato(campo) {
    if (!campo || !campo.id) return;

    // Cancela timeout pendente se existir
    if (this.timeoutsSalvamento.has(campo.id)) {
      clearTimeout(this.timeoutsSalvamento.get(campo.id));
      this.timeoutsSalvamento.delete(campo.id);
    }

    this.salvarCampo(campo);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAMENTO DO CAMPO (lógica principal)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async salvarCampo(campo) {
    try {
      const dadoCampo = {
        id: campo.id,
        valor: campo.value,
        tipo: campo.tagName.toLowerCase(),
        aba: estadoAtual.abaAtiva || 'desconhecida',
        timestamp: Date.now(),
        nome: campo.name || campo.id,
      };

      // Salva em localStorage (rápido e síncrono)
      this.salvarLocalStorage(dadoCampo);

      // Salva em IndexedDB (assíncrono, mais robusto)
      if (this.db) {
        await this.salvarIndexedDB(dadoCampo);
      }

      // Atualiza timestamp do último salvamento
      this.ultimoSalvamento = Date.now();
      this.salvarTimestampAtividade();

      // Atualiza status visual
      this.atualizarStatusVisual('sincronizado');

      console.log(
        `💾 Campo salvo: ${campo.id} = "${campo.value.substring(0, 50)}${campo.value.length > 50 ? '...' : ''}"`
      );
    } catch (erro) {
      console.error(`❌ Erro ao salvar campo ${campo.id}:`, erro);
      this.atualizarStatusVisual('erro');
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAMENTO EM LOCALSTORAGE
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  salvarLocalStorage(dadoCampo) {
    try {
      const chave = `${PERSISTENCIA_CONFIG.PREFIXO_STORAGE}${dadoCampo.aba}_${dadoCampo.id}`;

      // Serializa e comprime dados (se disponível)
      let dadosSerializados = JSON.stringify(dadoCampo);

      // Tenta comprimir com LZString (se disponível)
      if (typeof LZString !== 'undefined') {
        dadosSerializados = LZString.compress(dadosSerializados);
      }

      localStorage.setItem(chave, dadosSerializados);
    } catch (erro) {
      console.error('❌ Erro ao salvar em localStorage:', erro);

      // Se erro de quota excedida, tenta limpar dados antigos
      if (erro.name === 'QuotaExceededError') {
        this.limparDadosAntigos();
      }
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAMENTO EM INDEXEDDB
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  salvarIndexedDB(dadoCampo) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      try {
        const transacao = this.db.transaction([PERSISTENCIA_CONFIG.STORE_DADOS], 'readwrite');
        const store = transacao.objectStore(PERSISTENCIA_CONFIG.STORE_DADOS);

        // Busca registro existente para atualizar ou criar novo
        const requisicao = store.put(dadoCampo);

        requisicao.onsuccess = () => resolve(requisicao.result);
        requisicao.onerror = () => reject(requisicao.error);
      } catch (erro) {
        reject(erro);
      }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🔄 RESTAURAÇÃO DE DADOS SALVOS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async restaurarDadosSalvos() {
    try {
      console.log('🔄 Restaurando dados salvos...');

      let camposRestaurados = 0;

      // 1️⃣ Restaura de IndexedDB (mais confiável)
      if (this.db) {
        const dadosIndexedDB = await this.carregarIndexedDB();
        camposRestaurados += this.aplicarDadosNoCampos(dadosIndexedDB);
      }

      // 2️⃣ Restaura de localStorage (backup/complemento)
      const dadosLocalStorage = this.carregarLocalStorage();
      camposRestaurados += this.aplicarDadosNoCampos(dadosLocalStorage);

      console.log(`✅ ${camposRestaurados} campos restaurados com sucesso`);

      // Força atualização das labels flutuantes
      if (typeof window.reinitFloatingLabels === 'function') {
        window.reinitFloatingLabels();
      }
    } catch (erro) {
      console.error('❌ Erro ao restaurar dados:', erro);
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     📥 CARREGAMENTO DE INDEXEDDB
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  carregarIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }

      try {
        const transacao = this.db.transaction([PERSISTENCIA_CONFIG.STORE_DADOS], 'readonly');
        const store = transacao.objectStore(PERSISTENCIA_CONFIG.STORE_DADOS);
        const requisicao = store.getAll();

        requisicao.onsuccess = () => resolve(requisicao.result || []);
        requisicao.onerror = () => reject(requisicao.error);
      } catch (erro) {
        reject(erro);
      }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     📥 CARREGAMENTO DE LOCALSTORAGE
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  carregarLocalStorage() {
    const dados = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);

        if (chave && chave.startsWith(PERSISTENCIA_CONFIG.PREFIXO_STORAGE)) {
          let valor = localStorage.getItem(chave);

          // Tenta descomprimir se LZString disponível
          if (typeof LZString !== 'undefined' && valor) {
            try {
              valor = LZString.decompress(valor);
            } catch (e) {
              // Se falhar, assume que não está comprimido
            }
          }

          if (valor) {
            const dadoCampo = JSON.parse(valor);
            dados.push(dadoCampo);
          }
        }
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar localStorage:', erro);
    }

    return dados;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ✍️ APLICAR DADOS NOS CAMPOS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  aplicarDadosNoCampos(dados) {
    let camposRestaurados = 0;

    dados.forEach((dadoCampo) => {
      const campo = document.getElementById(dadoCampo.id);

      if (campo && dadoCampo.valor) {
        // Evita sobrescrever campos já preenchidos manualmente
        if (!campo.value || campo.value.trim() === '') {
          campo.value = dadoCampo.valor;
          camposRestaurados++;

          // Atualiza label flutuante
          if (typeof handleLabelFloat === 'function') {
            handleLabelFloat(campo);
          }

          // Marca campo como preenchido
          campo.classList.add('has-value', 'filled');

          // Dispara evento de input para atualizar outras dependências
          campo.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    return camposRestaurados;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ⏰ VERIFICAÇÃO DE EXPIRAÇÃO (12 HORAS)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async verificarExpiracao() {
    try {
      const chaveTimestamp = `${PERSISTENCIA_CONFIG.PREFIXO_STORAGE}ultimo_acesso`;
      const ultimoAcesso = localStorage.getItem(chaveTimestamp);

      if (!ultimoAcesso) {
        // Primeira vez usando o sistema
        this.salvarTimestampAtividade();
        console.log('🆕 Primeira utilização detectada');
        return;
      }

      const timestampAnterior = parseInt(ultimoAcesso);
      const tempoDecorrido = Date.now() - timestampAnterior;

      console.log(`⏱️ Tempo desde último acesso: ${this.formatarTempo(tempoDecorrido)}`);

      // Se passou mais de 12 horas, limpa os dados
      if (tempoDecorrido > PERSISTENCIA_CONFIG.TEMPO_EXPIRACAO) {
        console.warn('⚠️ Dados expirados (12h+), limpando automaticamente...');
        await this.limparTodosDados();
        mostrarNotificacao(
          '⏰ Os dados salvos expiraram após 12 horas de inatividade e foram limpos automaticamente.',
          'info'
        );
      } else {
        // Atualiza timestamp
        this.salvarTimestampAtividade();
        const tempoRestante = PERSISTENCIA_CONFIG.TEMPO_EXPIRACAO - tempoDecorrido;
        console.log(`✅ Dados válidos. Expiram em: ${this.formatarTempo(tempoRestante)}`);
      }
    } catch (erro) {
      console.error('❌ Erro ao verificar expiração:', erro);
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAR TIMESTAMP DE ATIVIDADE
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  salvarTimestampAtividade() {
    const chave = `${PERSISTENCIA_CONFIG.PREFIXO_STORAGE}ultimo_acesso`;
    localStorage.setItem(chave, Date.now().toString());
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🔁 VERIFICAÇÃO PERIÓDICA
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  iniciarVerificacaoPeriodica() {
    this.intervalVerificacao = setInterval(() => {
      this.verificarExpiracao();
    }, PERSISTENCIA_CONFIG.INTERVALO_VERIFICACAO);

    console.log(
      `🔁 Verificação periódica iniciada (a cada ${PERSISTENCIA_CONFIG.INTERVALO_VERIFICACAO / 60000} minutos)`
    );
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🧹 LIMPEZA DE DADOS POR ABA
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async limparDadosAba(abaId) {
    try {
      console.log(`🧹 Limpando dados da aba: ${abaId}`);
      let camposLimpos = 0;

      // 1️⃣ Limpa de localStorage
      const chavesParaRemover = [];
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && chave.includes(`${PERSISTENCIA_CONFIG.PREFIXO_STORAGE}${abaId}_`)) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach((chave) => {
        localStorage.removeItem(chave);
        camposLimpos++;
      });

      // 2️⃣ Limpa de IndexedDB
      if (this.db) {
        const dadosIndexedDB = await this.carregarIndexedDB();
        const transacao = this.db.transaction([PERSISTENCIA_CONFIG.STORE_DADOS], 'readwrite');
        const store = transacao.objectStore(PERSISTENCIA_CONFIG.STORE_DADOS);

        dadosIndexedDB.forEach((dado) => {
          if (dado.aba === abaId) {
            store.delete(dado.id);
            camposLimpos++;
          }
        });
      }

      console.log(`✅ ${camposLimpos} campos limpos da aba ${abaId}`);
      mostrarNotificacao(`Dados da aba limpos com sucesso! (${camposLimpos} campos)`, 'sucesso');

      return camposLimpos;
    } catch (erro) {
      console.error(`❌ Erro ao limpar dados da aba ${abaId}:`, erro);
      return 0;
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🧹 LIMPEZA TOTAL DE DADOS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async limparTodosDados() {
    try {
      console.log('🧹 Limpando TODOS os dados salvos...');
      let camposLimpos = 0;

      // 1️⃣ Limpa localStorage
      const chavesParaRemover = [];
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && chave.startsWith(PERSISTENCIA_CONFIG.PREFIXO_STORAGE)) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach((chave) => {
        localStorage.removeItem(chave);
        camposLimpos++;
      });

      // 2️⃣ Limpa IndexedDB
      if (this.db) {
        const transacao = this.db.transaction(
          [PERSISTENCIA_CONFIG.STORE_DADOS, PERSISTENCIA_CONFIG.STORE_HISTORICO, PERSISTENCIA_CONFIG.STORE_BACKUP],
          'readwrite'
        );

        transacao.objectStore(PERSISTENCIA_CONFIG.STORE_DADOS).clear();
        transacao.objectStore(PERSISTENCIA_CONFIG.STORE_HISTORICO).clear();
        transacao.objectStore(PERSISTENCIA_CONFIG.STORE_BACKUP).clear();
      }

      console.log(`✅ ${camposLimpos} campos limpos do localStorage + IndexedDB limpo`);
      mostrarNotificacao('Todos os dados foram limpos com sucesso!', 'sucesso');

      return camposLimpos;
    } catch (erro) {
      console.error('❌ Erro ao limpar todos os dados:', erro);
      return 0;
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🧹 LIMPEZA DE DADOS ANTIGOS (quando atinge limite de espaço)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  limparDadosAntigos() {
    console.warn('⚠️ Limite de espaço atingido, removendo dados mais antigos...');

    const chaves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(PERSISTENCIA_CONFIG.PREFIXO_STORAGE)) {
        try {
          let valor = localStorage.getItem(chave);

          // Tenta descomprimir
          if (typeof LZString !== 'undefined' && valor) {
            try {
              valor = LZString.decompress(valor);
            } catch (e) {}
          }

          const dado = JSON.parse(valor);
          chaves.push({ chave, timestamp: dado.timestamp || 0 });
        } catch (e) {
          // Remove chaves corrompidas
          localStorage.removeItem(chave);
        }
      }
    }

    // Ordena por timestamp (mais antigos primeiro)
    chaves.sort((a, b) => a.timestamp - b.timestamp);

    // Remove os 20% mais antigos
    const quantidadeRemover = Math.ceil(chaves.length * 0.2);
    for (let i = 0; i < quantidadeRemover; i++) {
      localStorage.removeItem(chaves[i].chave);
    }

    console.log(`✅ ${quantidadeRemover} registros antigos removidos`);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     👁️ INDICADOR VISUAL DE STATUS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  criarIndicadorStatus() {
    // Remove indicador existente (se houver)
    const indicadorExistente = document.getElementById('indicador-persistencia');
    if (indicadorExistente) {
      indicadorExistente.remove();
    }

    // Cria novo indicador
    const indicador = document.createElement('div');
    indicador.id = 'indicador-persistencia';
    indicador.className = 'indicador-persistencia sincronizado';
    indicador.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Sincronizado</span>
    `;

    document.body.appendChild(indicador);
    console.log('👁️ Indicador de status criado');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🎨 ATUALIZAR STATUS VISUAL
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  atualizarStatusVisual(status) {
    this.statusSalvamento = status;

    const indicador = document.getElementById('indicador-persistencia');
    if (!indicador) return;

    // Remove classes anteriores
    indicador.className = 'indicador-persistencia';

    switch (status) {
      case 'salvando':
        indicador.classList.add('salvando');
        indicador.innerHTML = `
          <i class="fas fa-spinner fa-spin"></i>
          <span>Salvando...</span>
        `;
        break;

      case 'sincronizado':
        indicador.classList.add('sincronizado');
        indicador.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <span>Sincronizado</span>
        `;
        break;

      case 'erro':
        indicador.classList.add('erro');
        indicador.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <span>Erro ao salvar</span>
        `;
        break;
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🌐 EVENTOS DE VISIBILIDADE DA PÁGINA
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  configurarEventosVisibilidade() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Página ficou oculta - força salvamento
        console.log('👁️ Página oculta, salvando dados...');
        this.salvarBackupCompleto();
      } else {
        // Página voltou a ser visível - verifica expiração
        console.log('👁️ Página visível, verificando expiração...');
        this.verificarExpiracao();
      }
    });

    console.log('🌐 Eventos de visibilidade configurados');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAMENTO ANTES DE SAIR DA PÁGINA
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  configurarSalvamentoAntesSair() {
    window.addEventListener('beforeunload', (e) => {
      console.log('🚪 Usuário saindo da página, salvando dados...');
      this.salvarBackupCompleto();

      // Atualiza timestamp de atividade
      this.salvarTimestampAtividade();
    });

    console.log('🚪 Salvamento antes de sair configurado');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     💾 SALVAR BACKUP COMPLETO
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  salvarBackupCompleto() {
    try {
      const backup = {
        timestamp: Date.now(),
        versao: configuracoesSistema.versaoSistema,
        estadoAtual: estadoAtual,
        dadosFormulario: this.coletarTodosDadosFormulario(),
      };

      // Salva em localStorage
      const chave = `${PERSISTENCIA_CONFIG.PREFIXO_STORAGE}backup_completo`;
      let dadosSerializados = JSON.stringify(backup);

      if (typeof LZString !== 'undefined') {
        dadosSerializados = LZString.compress(dadosSerializados);
      }

      localStorage.setItem(chave, dadosSerializados);

      // Salva em IndexedDB (se disponível)
      if (this.db) {
        const transacao = this.db.transaction([PERSISTENCIA_CONFIG.STORE_BACKUP], 'readwrite');
        const store = transacao.objectStore(PERSISTENCIA_CONFIG.STORE_BACKUP);
        store.add(backup);
      }

      console.log('💾 Backup completo salvo');
    } catch (erro) {
      console.error('❌ Erro ao salvar backup completo:', erro);
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     📊 COLETAR TODOS OS DADOS DO FORMULÁRIO
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  coletarTodosDadosFormulario() {
    const dados = {};

    const campos = document.querySelectorAll(
      '.campo-flutuante input, .campo-flutuante select, .campo-flutuante textarea'
    );

    campos.forEach((campo) => {
      if (campo.id && campo.value) {
        dados[campo.id] = {
          valor: campo.value,
          tipo: campo.tagName.toLowerCase(),
          nome: campo.name || campo.id,
        };
      }
    });

    return dados;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🕐 FORMATAÇÃO DE TEMPO
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  formatarTempo(milissegundos) {
    const segundos = Math.floor(milissegundos / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);

    if (horas > 0) {
      const min = minutos % 60;
      return `${horas}h ${min}min`;
    } else if (minutos > 0) {
      const seg = segundos % 60;
      return `${minutos}min ${seg}s`;
    } else {
      return `${segundos}s`;
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     📊 ESTATÍSTICAS DO SISTEMA
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  async obterEstatisticas() {
    try {
      const estatisticas = {
        camposMonitorados: this.camposMonitorados.size,
        ultimoSalvamento: this.ultimoSalvamento ? new Date(this.ultimoSalvamento).toLocaleString('pt-BR') : 'Nunca',
        statusAtual: this.statusSalvamento,
        dadosLocalStorage: 0,
        dadosIndexedDB: 0,
        tamanhoLocalStorage: 0,
      };

      // Conta dados em localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && chave.startsWith(PERSISTENCIA_CONFIG.PREFIXO_STORAGE)) {
          estatisticas.dadosLocalStorage++;
          const valor = localStorage.getItem(chave);
          estatisticas.tamanhoLocalStorage += valor ? valor.length : 0;
        }
      }

      // Conta dados em IndexedDB
      if (this.db) {
        const dados = await this.carregarIndexedDB();
        estatisticas.dadosIndexedDB = dados.length;
      }

      // Converte tamanho para KB/MB
      if (estatisticas.tamanhoLocalStorage > 1024 * 1024) {
        estatisticas.tamanhoFormatado = `${(estatisticas.tamanhoLocalStorage / (1024 * 1024)).toFixed(2)} MB`;
      } else if (estatisticas.tamanhoLocalStorage > 1024) {
        estatisticas.tamanhoFormatado = `${(estatisticas.tamanhoLocalStorage / 1024).toFixed(2)} KB`;
      } else {
        estatisticas.tamanhoFormatado = `${estatisticas.tamanhoLocalStorage} bytes`;
      }

      return estatisticas;
    } catch (erro) {
      console.error('❌ Erro ao obter estatísticas:', erro);
      return null;
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🔧 DESTRUIR SISTEMA (cleanup)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  destruir() {
    // Cancela todos os timeouts pendentes
    this.timeoutsSalvamento.forEach((timeout) => clearTimeout(timeout));
    this.timeoutsSalvamento.clear();

    // Para o observador de mutações
    if (this.observadorMutacoes) {
      this.observadorMutacoes.disconnect();
    }

    // Para verificação periódica
    if (this.intervalVerificacao) {
      clearInterval(this.intervalVerificacao);
    }

    // Fecha conexão IndexedDB
    if (this.db) {
      this.db.close();
    }

    console.log('🔧 Sistema de Persistência destruído');
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🌍 INSTÂNCIA GLOBAL DO GERENCIADOR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let gerenciadorPersistencia = null;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔧 INTEGRAÇÃO COM BOTÕES "LIMPAR ABA"
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// Modifica a função confirmarLimpeza existente
const confirmarLimpezaOriginal = window.confirmarLimpeza;

window.confirmarLimpeza = async function () {
  if (!abaParaLimpar) {
    console.error('❌ Nenhuma aba selecionada para limpeza');
    fecharModal();
    return;
  }

  console.log(`✅ Confirmada limpeza da aba: ${abaParaLimpar}`);

  // Limpa dados persistidos
  if (gerenciadorPersistencia) {
    await gerenciadorPersistencia.limparDadosAba(abaParaLimpar);
  }

  // Executa limpeza original
  switch (abaParaLimpar) {
    case 'cadastroInstituidor':
      limparDadosInstituidor();
      break;
    case 'cadastroRequerentes':
      limparDadosRequerentes();
      break;
    case 'calculoPensao':
      limparDadosCalculo();
      break;
    default:
      console.error(`❌ Aba inválida para limpeza: ${abaParaLimpar}`);
  }

  fecharModal();
  abaParaLimpar = null;
  mostrarModalSucesso('Dados da aba limpos com sucesso!');
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 FUNÇÕES AUXILIARES GLOBAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/**
📊 Exibir estatísticas do sistema de persistência
*/
async function exibirEstatisticasPersistencia() {
  if (!gerenciadorPersistencia) {
    console.warn('⚠️ Sistema de persistência não inicializado');
    return;
  }

  const stats = await gerenciadorPersistencia.obterEstatisticas();
  if (!stats) {
    console.error('❌ Erro ao obter estatísticas');
    return;
  }

  console.group('📊 Estatísticas do Sistema de Persistência');
  console.log(`📝 Campos monitorados: ${stats.camposMonitorados}`);
  console.log(`💾 Dados em localStorage: ${stats.dadosLocalStorage}`);
  console.log(`💿 Dados em IndexedDB: ${stats.dadosIndexedDB}`);
  console.log(`📦 Tamanho total: ${stats.tamanhoFormatado}`);
  console.log(`⏰ Último salvamento: ${stats.ultimoSalvamento}`);
  console.log(`🔄 Status: ${stats.statusAtual}`);
  console.groupEnd();
  return stats;
}

/**

🧹 Limpar todos os dados persistidos (função global)
*/
async function limparTodosDadosPersistidos() {
  if (!gerenciadorPersistencia) {
    console.warn('⚠️ Sistema de persistência não inicializado');
    return;
  }

  if (!confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados salvos. Deseja continuar?')) {
    return;
  }
  await gerenciadorPersistencia.limparTodosDados();
  location.reload();
}
/**

💾 Forçar salvamento manual
*/
function forcarSalvamentoManual() {
  if (!gerenciadorPersistencia) {
    console.warn('⚠️ Sistema de persistência não inicializado');
    return;
  }

  gerenciadorPersistencia.salvarBackupCompleto();
  mostrarNotificacao('✅ Dados salvos manualmente com sucesso!', 'sucesso');
}
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 INICIALIZAÇÃO AUTOMÁTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// Adiciona ao DOMContentLoaded existente
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 Inicializando Sistema de Persistência Avançado...');
  // Cria instância global
  gerenciadorPersistencia = new GerenciadorPersistencia();
  // Inicializa o sistema
  const sucesso = await gerenciadorPersistencia.inicializar();
  if (sucesso) {
    console.log('✅ Sistema de Persistência operacional!');
    // Exibe estatísticas após 3 segundos
    setTimeout(() => {
      exibirEstatisticasPersistencia();
    }, 3000);
  } else {
    console.error('❌ Falha ao inicializar Sistema de Persistência');
  }
});
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CSS DO INDICADOR DE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const estiloIndicador = document.createElement('style');
estiloIndicador.textContent = `
.indicador-persistencia {
position: fixed;
bottom: 20px;
right: 20px;
background: white;
padding: 12px 20px;
border-radius: 25px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
display: flex;
align-items: center;
gap: 10px;
font-size: 14px;
font-weight: 500;
z-index: 9999;
transition: all 0.3s ease;
opacity: 0;
transform: translateY(20px);
}
.indicador-persistencia.show {
opacity: 1;
transform: translateY(0);
}
.indicador-persistencia i {
font-size: 16px;
}
/* Status: Salvando */
.indicador-persistencia.salvando {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
animation: pulse 1.5s ease-in-out infinite;
}
.indicador-persistencia.salvando i {
color: white;
}
/* Status: Sincronizado */
.indicador-persistencia.sincronizado {
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
color: white;
}
.indicador-persistencia.sincronizado i {
color: white;
}
/* Status: Erro */
.indicador-persistencia.erro {
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
color: white;
}
.indicador-persistencia.erro i {
color: white;
}
/* Animação de pulse */
@keyframes pulse {
0%, 100% {
transform: scale(1);
}
50% {
transform: scale(1.05);
}
}
/* Responsividade */
@media (max-width: 768px) {
.indicador-persistencia {
bottom: 10px;
right: 10px;
padding: 10px 16px;
font-size: 12px;
}
.indicador-persistencia i {
  font-size: 14px;
}
}
/* Esconde após 3 segundos quando sincronizado */
.indicador-persistencia.sincronizado.auto-hide {
animation: fadeOut 0.5s ease 3s forwards;
}
@keyframes fadeOut {
to {
opacity: 0;
transform: translateY(20px);
}
}
`;
document.head.appendChild(estiloIndicador);
// Mostra indicador após carregamento
setTimeout(() => {
  const indicador = document.getElementById('indicador-persistencia');
  if (indicador) {
    indicador.classList.add('show');
  }
}, 500);
// Flag de controle para ativar/desativar logs
const modoDebug = true;

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
📋 FUNÇÕES DE LOG DO SISTEMA
═══════════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Exibe o log de inicialização do sistema de persistência
 */
function exibirLogSistemaPersistencia() {
  if (!modoDebug) return;

  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                               ║
║  💾 SISTEMA DE PERSISTÊNCIA AVANÇADO v3.0 CARREGADO                                           ║
║                                                                                               ║
║  ✅ Funcionalidades Implementadas:                                                            ║
║  • Salvamento automático em tempo real (debounce 500ms)                                       ║
║  • Persistência após crashes/recarregamentos                                                  ║
║  • Limpeza automática após 12 horas                                                           ║
║  • Sistema de versionamento                                                                   ║
║  • Compressão LZString (economia de espaço)                                                   ║
║  • Backup duplo (IndexedDB + localStorage)                                                    ║
║  • Sincronização com botões "Limpar Aba"                                                      ║
║  • Indicador visual de status                                                                 ║
║  • Observer de mutações para campos dinâmicos                                                 ║
║  • Salvamento antes de sair da página                                                         ║
║  • Verificação periódica de expiração                                                         ║
║  • Logs detalhados para debug                                                                 ║
║                                                                                               ║
║  📊 Comandos úteis no console:                                                                ║
║  • exibirEstatisticasPersistencia() - Ver estatísticas                                        ║
║  • limparTodosDadosPersistidos() - Limpar tudo                                                ║
║  • forcarSalvamentoManual() - Salvar manualmente                                              ║
║                                                                                               ║
║  👩‍💻 Desenvolvido por: 3º Sgt Ana Cristina - DAP                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
`);
}

/**
 * Exibe o log de finalização do sistema de pensão militar
 */
function exibirLogFinalizacaoSistema() {
  if (!modoDebug) return;

  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║ SISTEMA DE CONCESSÃO DE PENSÃO MILITAR v2.0                                           ║
║                                                                                       ║
║  📋 Funcionalidades Implementadas:                                                    ║
║  ✅ Navegação dinâmica entre abas                                                     ║
║  ✅ Sistema de labels flutuantes COMPLETO (inputs e selects)                          ║
║  ✅ Cadastro dinâmico de requerentes                                                  ║
║  ✅ Cálculo automático da pensão                                                      ║
║  ✅ Sistema de notificações                                                           ║
║  ✅ Modais de confirmação                                                             ║
║  ✅ Armazenamento automático completo                                                 ║
║  ✅ Sistema de backup/restore                                                         ║
║  ✅ Responsividade completa                                                           ║
║  ✅ Formatação automática de dados                                                    ║
║  ✅ Carregamento de todas as APIs                                                     ║
║  ✅ 7 Toggles organizados e funcionais                                                ║
║  ✅ Campo SVP/SGPGu populado com API ÓRGÃO                                            ║
║                                                                                       ║
║  👩‍💻 Desenvolvido por: 3º Sgt Ana Cristina - DAP                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
🔧 USO DAS FUNÇÕES DE LOG
═══════════════════════════════════════════════════════════════════════════════════════════════ */

// Chamada das funções (pode ser feita em qualquer ponto do sistema)
exibirLogSistemaPersistencia();
exibirLogFinalizacaoSistema();
