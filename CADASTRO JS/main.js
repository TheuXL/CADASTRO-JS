const { ipcRenderer } = require('electron');

const nomeInput = document.getElementById('nome');
const valorInput = document.getElementById('valor');
const cadastrarBtn = document.getElementById('cadastrar');
const produtosTable = document.getElementById('produtosTable');

function cadastrarProduto() {
  const nome = nomeInput.value;
  const valor = valorInput.value;

  const novoProduto = {
    id: Date.now(), 
    nome: nome,
    valor: valor
  };

  ipcRenderer.send('cadastrar-produto', novoProduto);

  nomeInput.value = '';
  valorInput.value = '';
  atualizarTabela(); // Atualiza a tabela após cadastrar
}

function editarProduto(id) {
  ipcRenderer.send('obter-produto', id);

  ipcRenderer.on('produto', (event, produto) => {
    nomeInput.value = produto.nome;
    valorInput.value = produto.valor;

    cadastrarBtn.textContent = 'Editar';
    cadastrarBtn.removeEventListener('click', cadastrarProduto); 
    cadastrarBtn.addEventListener('click', () => {
      const nome = nomeInput.value;
      const valor = valorInput.value;
      const produtoEditado = {
        id: id,
        nome: nome,
        valor: valor
      };

      ipcRenderer.send('editar-produto', produtoEditado);
      
      nomeInput.value = '';
      valorInput.value = '';
      
      cadastrarBtn.textContent = 'Cadastrar';
      cadastrarBtn.removeEventListener('click', editarProduto); 
      cadastrarBtn.addEventListener('click', cadastrarProduto); 
     
      atualizarTabela();
    });
  });
}

function atualizarTabela() {
  ipcRenderer.send('obter-produtos');

  ipcRenderer.on('produtos', (event, produtos) => {
    produtosTable.querySelector('tbody').innerHTML = ''; 
    produtos.forEach(produto => {
      const row = produtosTable.querySelector('tbody').insertRow();
      const nomeCell = row.insertCell();
      const valorCell = row.insertCell();
      const editarCell = row.insertCell();

      nomeCell.textContent = produto.nome;
      valorCell.textContent = produto.valor;

      const editarBtn = document.createElement('button');
      editarBtn.textContent = 'Editar';
      editarBtn.addEventListener('click', () => editarProduto(produto.id)); 
      editarCell.appendChild(editarBtn);
    });
  });
}

// Adicione este listener para receber a lista de produtos atualizada
ipcRenderer.on('produtos', (event, produtos) => {
  atualizarTabela(produtos); 
});

cadastrarBtn.addEventListener('click', cadastrarProduto);

atualizarTabela(); 