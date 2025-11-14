// ==========================================================
(async function () {
  const openBtn = document.getElementById('btnOpenNewPost');
  const modal = document.getElementById('newPostModal');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('newPostForm');
  const firstField = document.getElementById('postTitle');

  if (!openBtn || !modal) return;

  function openModal() {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (firstField) firstField.focus();
    document.addEventListener('keydown', onKeyDown);
  }

  function closeModal() {
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    openBtn.focus();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  openBtn.addEventListener('click', openModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const userId = localStorage.getItem("user");
      formData.append("user_id", userId);

      const res = await fetch("http://localhost:3000/api/recipes", {
        method: "POST",
        body: formData
      });
      const result = await res.json(); // Adicionei 'await' aqui
      console.log(result);

      closeModal();
      renderRecipes(); // ATUALIZA A LISTA APÓS ADICIONAR
    });
  }
})();
// FIM DA LÓGICA DO MODAL DE "NOVA RECEITA"
// ==========================================================


// ==========================================================
// NOVO: LÓGICA DO MODAL DE "DETALHES DA RECEITA"
// ==========================================================

// 1. Pegar os elementos do novo modal
const detailsModal = document.getElementById('recipeDetailsModal');
const detailsBackdrop = document.getElementById('detailsModalBackdrop');
const detailsCloseBtn = document.getElementById('closeDetailsModal');

// Elementos de conteúdo do modal
const modalTitle = document.getElementById('modalRecipeTitle');
const modalImage = document.getElementById('modalRecipeImage');
const modalText = document.getElementById('modalRecipeText');

// 2. Funções para abrir/fechar o modal de DETALHES
function openDetailsModal() {
  detailsModal.classList.remove('modal-hidden');
  detailsModal.classList.add('modal-visible');
  detailsModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  detailsCloseBtn.focus(); // Foca no botão de fechar
}

function closeDetailsModal() {
  detailsModal.classList.remove('modal-visible');
  detailsModal.classList.add('modal-hidden');
  detailsModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

// 3. Adiciona os eventos para fechar o modal
detailsBackdrop.addEventListener('click', closeDetailsModal);
detailsCloseBtn.addEventListener('click', closeDetailsModal);
document.addEventListener('keydown', (e) => {
  // Fecha o modal de detalhes com 'Escape' se estiver visível
  if (e.key === 'Escape' && detailsModal.classList.contains('modal-visible')) {
    closeDetailsModal();
  }
});

/**
 * Pega os dados da receita e os exibe no modal de detalhes
 * @param {object} recipe - O objeto da receita (com title, text, image_url)
 */
function showRecipeDetails(recipe) {
  modalTitle.textContent = recipe.title;
  modalText.textContent = recipe.text;

  if (recipe.image_url) {
    modalImage.src = `http://localhost:3000/uploads/${recipe.image_url}`;
    modalImage.style.display = 'block'; // Mostra a imagem
    modalImage.alt = recipe.title;
  } else {
    modalImage.style.display = 'none'; // Esconde se não houver imagem
  }

  openDetailsModal(); // Abre o modal preenchido
}

// (Em receitas.js)

// SUBSTITUA sua função createRecipeCard por esta:
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe';

  // 1. Adicionar a Imagem (se existir)
  if (recipe.image_url) {
    const img = document.createElement('img');
    img.className = 'recipe-image-preview'; // Nova classe para estilizar
    img.src = `http://localhost:3000/uploads/${recipe.image_url}`;
    img.alt = recipe.title;
    card.appendChild(img); // Adiciona a imagem no topo do card
  }

  // 2. Adicionar o Título
  const title = document.createElement('h2');
  title.textContent = recipe.title;
  card.appendChild(title);

  // 3. Adicionar o Evento de Clique
  card.addEventListener('click', () => {
    showRecipeDetails(recipe);
  });

  return card;
}

// ==========================================================
// FUNÇÃO renderRecipes() ATUALIZADA
// ==========================================================
const renderRecipes = async () => {
  const postsGrid = document.querySelector("#postsGrid");
  if (!postsGrid) return; // Segurança

  // Limpa o grid antes de adicionar novos itens
  postsGrid.innerHTML = '';

  try {
    const res = await fetch("http://localhost:3000/api/recipes");
    if (!res.ok) throw new Error('Falha ao carregar receitas');

    const data = await res.json();

    if (data.result && data.result.length > 0) {
      data.result.forEach((recipe) => {
        const recipeCard = createRecipeCard(recipe);
        postsGrid.appendChild(recipeCard);
      });
    } else {
      postsGrid.innerHTML = '<p style="color: #fff;">Nenhuma receita postada ainda.</p>';
    }
  } catch (error) {
    console.error('Erro ao renderizar receitas:', error);
    postsGrid.innerHTML = '<p style="color: #fdd;">Erro ao carregar receitas. Tente novamente.</p>';
  }
}

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================
renderRecipes();