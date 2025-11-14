document.addEventListener('DOMContentLoaded', () => {

    // Pegar o ID do usuário logado
    const userId = localStorage.getItem("user");

    // Elementos do Modo de Visualização
    const viewMode = document.getElementById('view-mode');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const btnShowEdit = document.getElementById('btn-show-edit');
    const btnDelete = document.getElementById('btn-delete');

    // Elementos do Modo de Edição
    const editMode = document.getElementById('edit-mode');
    const editUsername = document.getElementById('edit-username');
    const editEmail = document.getElementById('edit-email');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const formMessage = document.getElementById('formMessage');

    // Se não tem usuário, não devia estar aqui.
    if (!userId) {
        alert("Você precisa estar logado para ver seu perfil.");
        window.location.href = 'index.html'; // Ou sua página de login
        return;
    }

    /**
     * 1. FUNÇÃO DE CARREGAR OS DADOS DO PERFIL
     */
    const loadProfile = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/profile/${userId}`);
            if (!res.ok) {
                throw new Error("Usuário não encontrado.");
            }
            const { data } = await res.json();

            // Preenche o modo de visualização
            profileUsername.textContent = data.username;
            profileEmail.textContent = data.email;

            // Preenche o formulário de edição (para quando for aberto)
            editUsername.value = data.username;
            editEmail.value = data.email;

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            viewMode.innerHTML = `<p style="color: red;">Erro ao carregar perfil. Tente novamente.</p>`;
        }
    };

    /**
     * 2. TROCA ENTRE MODOS (Visualizar / Editar)
     */
    function showEditMode() {
        viewMode.classList.add('modal-hidden');
        editMode.classList.remove('modal-hidden');
        formMessage.textContent = ''; // Limpa mensagens de erro
    }

    function showViewMode() {
        editMode.classList.add('modal-hidden');
        viewMode.classList.remove('modal-hidden');
    }

    // Eventos dos botões de troca
    btnShowEdit.addEventListener('click', showEditMode);
    btnCancelEdit.addEventListener('click', showViewMode);

    /**
     * 3. LÓGICA DE ATUALIZAR (SUBMIT DO FORM)
     */
    editMode.addEventListener('submit', async (e) => {
        e.preventDefault();
        formMessage.textContent = 'Salvando...';

        // (Validação de senhas - pulamos por enquanto,
        // a rota do backend só está atualizando user e email)

        const updatedData = {
            username: editUsername.value,
            email: editEmail.value,
            // (Lógica de senha viria aqui)
        };

        try {
            const res = await fetch(`http://localhost:3000/api/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) {
                throw new Error('Falha ao salvar.');
            }

            const { data } = await res.json();
            formMessage.textContent = 'Perfil salvo com sucesso!';

            // Atualiza os dados na tela de visualização
            profileUsername.textContent = data.username;
            profileEmail.textContent = data.email;

            // Volta para o modo de visualização
            setTimeout(showViewMode, 1000);

        } catch (error) {
            formMessage.textContent = 'Erro ao salvar. Tente novamente.';
        }
    });

    /**
     * 4. LÓGICA DE DELETAR CONTA
     */
    btnDelete.addEventListener('click', async () => {
        const confirm1 = confirm("TEM CERTEZA? Esta ação é permanente.");
        if (!confirm1) return;

        const confirm2 = confirm("Sério. Todos os seus dados e receitas serão apagados. Continuar?");
        if (!confirm2) return;

        try {
            btnDelete.textContent = 'Deletando...';
            const res = await fetch(`http://localhost:3000/api/profile/${userId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Falha ao deletar.');
            }

            alert('Sua conta foi deletada com sucesso.');
            localStorage.removeItem("user"); // Faz o "logout"
            window.location.href = 'index.html'; // Manda para a home

        } catch (error) {
            alert('Houve um erro ao deletar sua conta.');
            btnDelete.textContent = 'Deletar Conta';
        }
    });

    // --- INICIALIZAÇÃO ---
    // Carrega os dados do perfil assim que a página abre
    loadProfile();
});