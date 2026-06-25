
'use strict';

const formCadastro    = document.getElementById('formCadastro');
const inputNome       = document.getElementById('inputNome');
const inputEmail      = document.getElementById('inputEmail');
const btnCadastrar    = document.getElementById('btnCadastrar');
const btnLimpar       = document.getElementById('btnLimpar');
const btnExcluirTodos = document.getElementById('btnExcluirTodos');
const inputPesquisa   = document.getElementById('inputPesquisa');
const listaUsuarios   = document.getElementById('listaUsuarios');
const listaVazia      = document.getElementById('listaVazia');

const STORAGE_KEY = 'sprint_usuarios';

function lerUsuarios() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
}

/**
 * @param {Array} usuarios
 */
function salvarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

/**
 * @param {Object} usuario
 * @param {number} indice
 */
function criarItemLista(usuario, indice) {
    const li = document.createElement('li');
    li.classList.add('item-usuario');
    li.dataset.indice = indice;

    li.innerHTML = `
        <div class="item-info">
            <span class="item-nome">${usuario.nome}</span>
            <span class="item-email">${usuario.email}</span>
            <span class="item-data">${usuario.data}</span>
        </div>
        <button class="btn-excluir-item" title="Excluir usuário" aria-label="Excluir ${usuario.nome}">
            <span class="material-symbols-outlined">delete</span>
        </button>
    `;

    return li;
}

/**
 * @param {Array|null} filtrado 
 */
function renderizarLista(filtrado = null) {
    const usuarios = lerUsuarios();

    const lista = filtrado !== null ? filtrado : usuarios;

    listaUsuarios.innerHTML = '';

    if (lista.length === 0) {

        listaVazia.style.display = 'flex';
        listaUsuarios.style.display = 'none';
    } else {
        listaVazia.style.display = 'none';
        listaUsuarios.style.display = 'flex';

        lista.forEach((usuario, indice) => {
            const item = criarItemLista(usuario, indice);
            listaUsuarios.appendChild(item);
        });
    }
}

function formatarData() {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} às ${hora}`;
}

formCadastro.addEventListener('submit', function (evento) {

    evento.preventDefault();

    const nome  = inputNome.value.trim();
    const email = inputEmail.value.trim();

    if (!nome || !email) {
        alert('Preencha o nome e o e-mail antes de cadastrar.');
        return;
    }

    const novoUsuario = {
        nome:  nome,
        email: email,
        data:  formatarData()
    };

    const usuarios = lerUsuarios();
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    limparCampos();
    renderizarLista();
});

function limparCampos() {
    inputNome.value  = '';
    inputEmail.value = '';
    inputNome.focus();
}

btnLimpar.addEventListener('click', limparCampos);

listaUsuarios.addEventListener('click', function (evento) {
    const btnExcluir = evento.target.closest('.btn-excluir-item');
    if (!btnExcluir) return;

    const item   = btnExcluir.closest('.item-usuario');
    const indice = parseInt(item.dataset.indice, 10);

    const usuarios = lerUsuarios();
    const nome     = usuarios[indice].nome;

    const confirmado = confirm(`Deseja excluir o usuário "${nome}"?`);
    if (!confirmado) return;

    usuarios.splice(indice, 1);
    salvarUsuarios(usuarios);

    inputPesquisa.value = '';
    renderizarLista();
});

btnExcluirTodos.addEventListener('click', function () {
    const usuarios = lerUsuarios();

    if (usuarios.length === 0) {
        alert('A lista já está vazia.');
        return;
    }

    const confirmado = confirm('Deseja excluir TODOS os usuários cadastrados? Essa ação não pode ser desfeita.');
    if (!confirmado) return;

    localStorage.removeItem(STORAGE_KEY);

    inputPesquisa.value = '';
    renderizarLista();
});

inputPesquisa.addEventListener('input', function () {
    const termo = inputPesquisa.value.trim().toLowerCase();

    if (!termo) {
        renderizarLista();
        return;
    }

    const usuarios = lerUsuarios();
    const filtrado = usuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );

    renderizarLista(filtrado);
});

renderizarLista();