// Função para navegação entre abas do sistema
function navegar(aba) {
  // Oculta todas as abas (adapte se tiver mais abas)
  document.getElementById('calculoPensaoAba').style.display = 'none';
  // Adicione aqui outras abas se necessário, exemplo:
  // document.getElementById('exportarWordAba').style.display = 'none';

  // Mostra a aba selecionada
  if (aba === 'calculoPensao') {
    document.getElementById('calculoPensaoAba').style.display = 'block';
  }
  // Exemplo para outras abas:
  // if (aba === 'exportarWord') {
  //   document.getElementById('exportarWordAba').style.display = 'block';
  // }
}

// Função para mostrar/ocultar as linhas de cálculo na aba de cálculo
document.addEventListener('DOMContentLoaded', function() {
  // Seleciona o botão de mostrar/ocultar linhas
  const toggleBtn = document.getElementById('toggleLinhasBtn');
  // Seleciona o bloco das linhas de cálculo
  const linhas = document.getElementById('linhasCalculo');

  // Garante que as linhas estejam visíveis ao carregar
  if (linhas) {
    linhas.style.display = 'block';
  }

  // Adiciona evento de clique ao botão
  if (toggleBtn && linhas) {
    toggleBtn.onclick = function() {
      if (linhas.style.display === 'none' || linhas.style.display === '') {
        linhas.style.display = 'block';
      } else {
        linhas.style.display = 'none';
      }
    };
  }
