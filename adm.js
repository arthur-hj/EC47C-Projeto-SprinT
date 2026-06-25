/* ═══════════════════════════════════════════════════════
   adm.js — Painel Administrativo SprinT
   Funcionalidades: cadastro, listagem, exclusão,
   limpeza de campos e pesquisa — via DOM API + Web Storage
════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. REFERÊNCIAS AO DOM
   Captura todos os elementos necessários
   uma única vez, no topo do script.
────────────────────────────────────────── */
const formCadastro    = document.getElementById('formCadastro');
const inputNome       = document.getElementById('inputNome');
const inputEmail      = document.getElementById('inputEmail');
const btnCadastrar    = document.getElementById('btnCadastrar');
const btnLimpar       = document.getElementById('btnLimpar');
const btnExcluirTodos = document.getElementById('btnExcluirTodos');
const inputPesquisa   = document.getElementById('inputPesquisa');
const listaUsuarios   = document.getElementById('listaUsuarios');
const listaVazia      = document.getElementById('listaVazia');

/* ──────────────────────────────────────────
   2. CHAVE ÚNICA DO LOCAL STORAGE
   Todos os registros ficam em um único array
   sob esta chave — critério de avaliação 1.
────────────────────────────────────────── */
const STORAGE_KEY = 'sprint_usuarios';

/* ══════════════════════════════════════════
   3. FUNÇÕES DE ACESSO AO LOCAL STORAGE
══════════════════════════════════════════ */

/**
 * Lê o array de usuários do Local Storage.
 * Retorna array vazio se a chave não existir ainda.
 */
function lerUsuarios() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
}

/**
 * Salva o array inteiro de usuários no Local Storage
 * sob a chave única STORAGE_KEY.
 * @param {Array} usuarios — array atualizado a persistir
 */
function salvarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

/* ══════════════════════════════════════════
   4. RENDERIZAÇÃO DA LISTA
══════════════════════════════════════════ */

/**
 * Gera o HTML de um único item da lista.
 * Recebe o objeto usuário e seu índice no array
 * para que o botão de excluir saiba qual remover.
 * @param {Object} usuario — { nome, email, data }
 * @param {number} indice  — posição no array
 */
function criarItemLista(usuario, indice) {
    const li = document.createElement('li');
    li.classList.add('item-usuario');
    // guarda o índice como atributo para a exclusão individual
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
 * Renderiza a lista completa na tela.
 * Aceita um array opcional para exibir resultados filtrados
 * sem apagar os dados reais do storage.
 * @param {Array|null} filtrado — se passado, renderiza só ele
 */
function renderizarLista(filtrado = null) {
    const usuarios = lerUsuarios();
    // usa o array filtrado se existir, senão usa o completo
    const lista = filtrado !== null ? filtrado : usuarios;

    // limpa a lista atual antes de re-renderizar
    listaUsuarios.innerHTML = '';

    if (lista.length === 0) {
        // exibe o estado vazio e oculta a lista
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

/* ══════════════════════════════════════════
   5. CADASTRAR USUÁRIO
══════════════════════════════════════════ */

/**
 * Formata a data/hora atual no padrão brasileiro.
 * Ex: "25/06/2026 às 14:30"
 */
function formatarData() {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} às ${hora}`;
}

/* Ao submeter o formulário */
formCadastro.addEventListener('submit', function (evento) {
    // impede o comportamento padrão de recarregar a página
    evento.preventDefault();

    const nome  = inputNome.value.trim();
    const email = inputEmail.value.trim();

    // validação básica: nenhum campo pode estar vazio
    if (!nome || !email) {
        alert('Preencha o nome e o e-mail antes de cadastrar.');
        return;
    }

    // monta o objeto do novo usuário
    const novoUsuario = {
        nome:  nome,
        email: email,
        data:  formatarData()
    };

    // lê o array atual, adiciona o novo e salva de volta
    const usuarios = lerUsuarios();
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    // limpa os campos e atualiza a lista na tela
    limparCampos();
    renderizarLista();
});

/* ══════════════════════════════════════════
   6. LIMPAR CAMPOS DO FORMULÁRIO
══════════════════════════════════════════ */

function limparCampos() {
    inputNome.value  = '';
    inputEmail.value = '';
    inputNome.focus(); // devolve o foco ao primeiro campo
}

btnLimpar.addEventListener('click', limparCampos);

/* ══════════════════════════════════════════
   7. EXCLUIR ITEM INDIVIDUAL
   Usa delegação de eventos na <ul> para
   capturar cliques em qualquer botão de excluir,
   mesmo nos itens criados dinamicamente.
══════════════════════════════════════════ */

listaUsuarios.addEventListener('click', function (evento) {
    // sobe na árvore até encontrar o botão de excluir
    const btnExcluir = evento.target.closest('.btn-excluir-item');
    if (!btnExcluir) return; // clique em outro lugar da lista — ignora

    // encontra o <li> pai para pegar o índice
    const item   = btnExcluir.closest('.item-usuario');
    const indice = parseInt(item.dataset.indice, 10);

    const usuarios = lerUsuarios();
    const nome     = usuarios[indice].nome;

    const confirmado = confirm(`Deseja excluir o usuário "${nome}"?`);
    if (!confirmado) return;

    // remove o item pelo índice e salva o array atualizado
    usuarios.splice(indice, 1);
    salvarUsuarios(usuarios);

    // limpa a pesquisa e re-renderiza a lista completa
    inputPesquisa.value = '';
    renderizarLista();
});

/* ══════════════════════════════════════════
   8. EXCLUIR TODOS OS ITENS
══════════════════════════════════════════ */

btnExcluirTodos.addEventListener('click', function () {
    const usuarios = lerUsuarios();

    if (usuarios.length === 0) {
        alert('A lista já está vazia.');
        return;
    }

    const confirmado = confirm('Deseja excluir TODOS os usuários cadastrados? Essa ação não pode ser desfeita.');
    if (!confirmado) return;

    // remove a chave inteira do Local Storage
    localStorage.removeItem(STORAGE_KEY);

    inputPesquisa.value = '';
    renderizarLista();
});

/* ══════════════════════════════════════════
   9. PESQUISA EM TEMPO REAL
   Filtra visualmente pelo nome ou e-mail.
   Não altera o Local Storage — só a exibição.
══════════════════════════════════════════ */

inputPesquisa.addEventListener('input', function () {
    const termo = inputPesquisa.value.trim().toLowerCase();

    // sem texto: exibe tudo
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

/* ══════════════════════════════════════════
   10. INICIALIZAÇÃO
   Renderiza a lista ao carregar a página,
   caso já existam dados salvos.
══════════════════════════════════════════ */
renderizarLista();