function calcularPensao() {
  const salario = parseFloat(document.getElementById('salario').value);
  const posto = document.getElementById('posto').value;

  if (isNaN(salario) || posto.trim() === "") {
    document.getElementById('resultado').innerText = "Preencha todos os campos corretamente.";
    return;
  }

  const pensao = salario * 0.5; // Exemplo: 50% do salário
  document.getElementById('resultado').innerText = 
    `Pensão estimada para ${posto}: R$ ${pensao.toFixed(2)}`;
}
