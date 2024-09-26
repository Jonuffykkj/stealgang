document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    homeScreen: document.getElementById('home-screen'),
    teamScreen: document.getElementById('team-screen'),
    homeLink: document.getElementById('home-link'),
    teamLink: document.getElementById('team-link'),
    createTeamBtn: document.getElementById('create-team-btn'),
    addProfileBtn: document.getElementById('add-profile-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    profileForm: document.getElementById('profile-form'),
    teamSettingsForm: document.getElementById('team-settings-form'),
    copyTeamUrlBtn: document.getElementById('copy-team-url'),
    teamsList: document.getElementById('teams-list'),
    teamName: document.getElementById('team-name'),
    teamCover: document.getElementById('team-cover'),
    bgColorPicker: document.getElementById('bg-color-picker'),
    bgMusicInput: document.getElementById('bg-music-input'),
    bgMusic: document.getElementById('bg-music'),
    profileList: document.getElementById('profile-list'),
    profileModal: document.getElementById('profile-modal'),
    teamNameInput: document.getElementById('team-name-input'),
    teamCoverInput: document.getElementById('team-cover-input'),
    socialFacebook: document.getElementById('social-facebook'),
    socialTwitter: document.getElementById('social-twitter'),
    socialInstagram: document.getElementById('social-instagram'),
  };

  let currentTeam = null;
  let teams = [];

  const showScreen = (screen) => {
    [elements.homeScreen, elements.teamScreen].forEach((s) => s?.classList.add('hidden'));
    screen?.classList.remove('hidden');
    screen?.classList.add('animate__animated', 'animate__fadeIn');
  };

  const initEventListeners = () => {
    elements.homeLink?.addEventListener('click', () => showScreen(elements.homeScreen));
    elements.teamLink?.addEventListener('click', () =>
      currentTeam
        ? showScreen(elements.teamScreen)
        : Swal.fire('Ops!', 'Por favor, selecione uma equipe primeiro.', 'info'),
    );
    elements.createTeamBtn?.addEventListener('click', createTeam);
    elements.addProfileBtn?.addEventListener('click', () => toggleModal(true));
    elements.closeModalBtn?.addEventListener('click', () => toggleModal(false));
    elements.profileForm?.addEventListener('submit', handleProfileSubmit);
    elements.teamSettingsForm?.addEventListener('submit', handleTeamSettingsSubmit);
    elements.copyTeamUrlBtn?.addEventListener('click', copyTeamUrl);
    elements.teamCover?.addEventListener('click', handleTeamCoverClick);

    elements.bgColorPicker?.addEventListener('change', (e) => {
      document.body.style.backgroundColor = e.target.value;
    });

    elements.bgMusicInput?.addEventListener('change', (e) => {
      elements.bgMusic.src = e.target.value;
      elements.bgMusic.play().catch((e) => console.log('Autoplay prevented:', e));
    });
  };

  const createTeam = async () => {
    if (teams.length >= 3) {
      Swal.fire('Limite atingido', 'Você atingiu o limite máximo de 3 equipes.', 'warning');
      return;
    }
    try {
      const { value: teamName } = await Swal.fire({
        title: 'Criar nova equipe',
        input: 'text',
        inputLabel: 'Nome da equipe',
        inputPlaceholder: 'Digite o nome da equipe',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Você precisa digitar um nome para a equipe!';
          }
        },
      });

      if (teamName) {
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: teamName }),
        });
        const team = await response.json();
        teams.push(team);
        updateTeamsList();
        Swal.fire('Sucesso!', 'Nova equipe criada com sucesso.', 'success');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      Swal.fire('Erro', 'Erro ao criar equipe. Por favor, tente novamente.', 'error');
    }
  };

  const toggleModal = (show) => {
    elements.profileModal?.classList.toggle('hidden', !show);
    elements.profileModal?.classList.toggle('flex', show);
    if (show) {
      elements.profileModal?.classList.add('animate__animated', 'animate__fadeIn');
    } else {
      elements.profileForm?.reset();
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.profileForm);
    const profile = {
      name: formData.get('name'),
      role: formData.get('role'),
      avatar: formData.get('avatar'),
      bio: formData.get('bio'),
      socialLinks: {
        linkedin: formData.get('social-linkedin'),
        github: formData.get('social-github'),
        twitter: formData.get('social-twitter'),
      },
      badges: {
        apoiador: formData.get('badge-apoiador') === 'on',
        impulso: formData.get('badge-impulso') === 'on',
        nitro: formData.get('badge-nitro') === 'on',
      },
    };

    try {
      const method = elements.profileForm.hasAttribute('data-profile-id') ? 'PUT' : 'POST';
      const url =
        method === 'PUT'
          ? `/api/teams/${currentTeam.id}/profiles/${elements.profileForm.getAttribute(
              'data-profile-id',
            )}`
          : `/api/teams/${currentTeam.id}/profiles`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Erro ao salvar o perfil');

      toggleModal(false);
      await updateProfileList();
      Swal.fire(
        'Sucesso!',
        `Perfil ${method === 'PUT' ? 'atualizado' : 'adicionado'} com sucesso.`,
        'success',
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Swal.fire('Erro', 'Erro ao salvar o perfil. Por favor, tente novamente.', 'error');
    }
  };

  const handleTeamSettingsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.teamSettingsForm);
    const updatedTeam = {
      name: formData.get('team-name'),
      backgroundColor: formData.get('bg-color'),
      coverImage: formData.get('team-cover'),
      backgroundMusic: formData.get('bg-music'),
      socialLinks: {
        facebook: formData.get('social-facebook'),
        twitter: formData.get('social-twitter'),
        instagram: formData.get('social-instagram'),
      },
    };

    try {
      const response = await fetch(`/api/teams/${currentTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeam),
      });
      if (!response.ok) throw new Error('Erro ao atualizar as configurações da equipe');

      currentTeam = { ...currentTeam, ...updatedTeam };
      updateTeamDisplay();
      Swal.fire('Sucesso!', 'Configurações da equipe atualizadas com sucesso.', 'success');
    } catch (error) {
      console.error('Error updating team settings:', error);
      Swal.fire(
        'Erro',
        'Erro ao atualizar as configurações da equipe. Por favor, tente novamente.',
        'error',
      );
    }
  };

  const updateTeamsList = () => {
    if (elements.teamsList) {
      elements.teamsList.innerHTML = '';
      teams.forEach((team) => {
        const teamElement = createTeamElement(team);
        elements.teamsList.appendChild(teamElement);
      });
    }
  };

  const createTeamElement = (team) => {
    const teamElement = document.createElement('div');
    teamElement.className =
      'team-card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';
    teamElement.innerHTML = `
      <h3 class="text-2xl font-semibold mb-4">${team.name || 'Nova Equipe'}</h3>
      <button class="select-team-btn bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition duration-300 transform hover:scale-105" data-team-id="${
        team.id
      }">Selecionar</button>
    `;
    teamElement.querySelector('.select-team-btn').addEventListener('click', () => selectTeam(team));
    return teamElement;
  };

  const selectTeam = (team) => {
    currentTeam = team;
    updateTeamDisplay();
    showScreen(elements.teamScreen);
  };

  const updateTeamDisplay = () => {
    if (elements.teamName) elements.teamName.textContent = currentTeam.name;
    if (elements.teamCover) {
      elements.teamCover.style.backgroundImage = `url('${
        currentTeam.coverImage || '/img/default-cover.jpg'
      }')`;
    }
    if (elements.bgColorPicker) elements.bgColorPicker.value = currentTeam.backgroundColor;
    if (elements.bgMusicInput) elements.bgMusicInput.value = currentTeam.backgroundMusic;
    if (elements.bgMusic) elements.bgMusic.src = currentTeam.backgroundMusic;
    if (elements.teamNameInput) elements.teamNameInput.value = currentTeam.name;
    if (elements.teamCoverInput) elements.teamCoverInput.value = currentTeam.coverImage;
    if (elements.socialFacebook)
      elements.socialFacebook.value = currentTeam.socialLinks?.facebook || '';
    if (elements.socialTwitter)
      elements.socialTwitter.value = currentTeam.socialLinks?.twitter || '';
    if (elements.socialInstagram)
      elements.socialInstagram.value = currentTeam.socialLinks?.instagram || '';
    updateProfileList();
  };

  const updateProfileList = async () => {
    try {
      const response = await fetch(`/api/teams/${currentTeam.id}/profiles`);
      if (!response.ok) throw new Error('Erro ao buscar perfis');
      const profiles = await response.json();
      elements.profileList.innerHTML = '';
      profiles.forEach((profile) => {
        const profileElement = createProfileElement(profile);
        elements.profileList.appendChild(profileElement);
      });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Swal.fire('Erro', 'Erro ao buscar perfis. Por favor, tente novamente.', 'error');
    }
  };

  const createProfileElement = (profile) => {
    const profileElement = document.createElement('div');
    profileElement.className =
      'profile-card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';
    profileElement.innerHTML = `
      <img src="${profile.avatar || '/img/default-avatar.png'}" alt="${
      profile.name
    }" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
      <h3 class="text-xl font-semibold mb-2">${profile.name}</h3>
      <p class="text-gray-600 mb-2">${profile.role}</p>
      <p class="text-gray-700 italic mb-4">${profile.bio || ''}</p>
      <div class="flex justify-center space-x-2 mb-4">
        ${
          profile.badges.apoiador
            ? '<img src="/img/apoiador.png" alt="Apoiador" class="w-6 h-6">'
            : ''
        }
        ${
          profile.badges.impulso ? '<img src="/img/impulso.png" alt="Impulso" class="w-6 h-6">' : ''
        }
        ${profile.badges.nitro ? '<img src="/img/nitro.gif" alt="Nitro" class="w-6 h-6">' : ''}
      </div>
      <div class="flex justify-center space-x-4 mb-4">
        ${
          profile.socialLinks.linkedin
            ? `<a href="${profile.socialLinks.linkedin}" target="_blank" class="text-blue-600 hover:text-blue-800"><i class="fab fa-linkedin fa-lg"></i></a>`
            : ''
        }
        ${
          profile.socialLinks.github
            ? `<a href="${profile.socialLinks.github}" target="_blank" class="text-gray-800 hover:text-gray-600"><i class="fab fa-github fa-lg"></i></a>`
            : ''
        }
        ${
          profile.socialLinks.twitter
            ? `<a href="${profile.socialLinks.twitter}" target="_blank" class="text-blue-400 hover:text-blue-600"><i class="fab fa-twitter fa-lg"></i></a>`
            : ''
        }
      </div>
      <button class="edit-profile-btn bg-gray-200 text-black px-4 py-2 rounded-full hover:bg-gray-300 transition duration-300 mr-2" data-profile-id="${
        profile.id
      }">Editar</button>
      <button class="delete-profile-btn bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-300" data-profile-id="${
        profile.id
      }">Excluir</button>
    `;
    profileElement
      .querySelector('.edit-profile-btn')
      .addEventListener('click', () => editProfile(profile));
    profileElement
      .querySelector('.delete-profile-btn')
      .addEventListener('click', () => deleteProfile(profile.id));
    return profileElement;
  };

  const editProfile = (profile) => {
    elements.profileForm.setAttribute('data-profile-id', profile.id);
    Object.keys(profile).forEach((key) => {
      const input = document.getElementById(`profile-${key}`);
      if (input) input.value = profile[key];
    });
    Object.keys(profile.socialLinks).forEach((key) => {
      const input = document.getElementById(`profile-social-${key}`);
      if (input) input.value = profile.socialLinks[key];
    });
    Object.keys(profile.badges).forEach((key) => {
      const input = document.getElementById(`badge-${key}`);
      if (input) input.checked = profile.badges[key];
    });
    toggleModal(true);
  };

  const deleteProfile = async (profileId) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/teams/${currentTeam.id}/profiles/${profileId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erro ao excluir o perfil');
        await updateProfileList();
        Swal.fire('Excluído!', 'O perfil foi excluído com sucesso.', 'success');
      } catch (error) {
        console.error('Error deleting profile:', error);
        Swal.fire('Erro', 'Erro ao excluir o perfil. Por favor, tente novamente.', 'error');
      }
    }
  };

  const handleTeamCoverClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          elements.teamCover.style.backgroundImage = `url('${imageUrl}')`;
          elements.teamCoverInput.value = imageUrl;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const copyTeamUrl = () => {
    const url = `${window.location.origin}/team/${currentTeam.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'URL copiada!',
          text: 'A URL da equipe foi copiada para a área de transferência.',
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        Swal.fire('Erro', 'Não foi possível copiar a URL. Por favor, tente novamente.', 'error');
      });
  };

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Erro ao carregar equipes');
      teams = await response.json();
      updateTeamsList();
    } catch (error) {
      console.error('Error loading teams:', error);
      Swal.fire('Erro', 'Erro ao carregar equipes. Por favor, recarregue a página.', 'error');
    }
  };

  const init = async () => {
    initEventListeners();
    await loadTeams();

    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');
    if (teamId) {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        selectTeam(team);
      }
    }
  };

  init();
});
