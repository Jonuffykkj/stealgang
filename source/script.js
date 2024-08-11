const ALLOWED_IPS = ['45.161.75.216'];
let profiles = [
    {
        id: 1,
        name: '𝐀𝐂𝐄 ⍟',
        subname: 'odeioamor',
        image: 'https://example.com/ace.gif',
        badges: ['./images/apoiador.png', './images/nitro.gif', './images/impulso.png'],
        social: {
            instagram: 'https://www.instagram.com/stealht_gang/',
            discord: 'https://discord.gg/8JF6JRnV4a',
            youtube: 'https://www.youtube.com/@lovepussy'
        }
    },
    // Adicione mais perfis aqui
];

function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
            opacity: { value: 0.5, random: false, anim: { enable: false } },
            size: { value: 3, random: true, anim: { enable: false } },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
            modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
        },
        retina_detect: true
    });
}

function playBackgroundAudio() {
    const audio = document.getElementById('backgroundAudio');
    audio.volume = 0.5;
    audio.play().catch(error => console.error('Erro ao reproduzir áudio:', error));
}

function renderProfiles() {
    const container = document.getElementById('profilesContainer');
    container.innerHTML = '';

    profiles.forEach(profile => {
        const profileElement = document.createElement('div');
        profileElement.className = 'profile-card';
        profileElement.innerHTML = `
            <img src="${profile.image}" alt="${profile.name}" class="profile-image">
            <h2 class="profile-name">${profile.name}</h2>
            <p class="profile-subname">${profile.subname}</p>
            <div class="badges">
                ${profile.badges.map(badge => `<div class="badge" style="background-image: url('${badge}')" title="Emblema"></div>`).join('')}
            </div>
            <div class="social-buttons">
                <a href="${profile.social.instagram}" target="_blank" rel="noopener noreferrer" class="social-button">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="${profile.social.discord}" target="_blank" rel="noopener noreferrer" class="social-button">
                    <i class="fab fa-discord"></i>
                </a>
                <a href="${profile.social.youtube}" target="_blank" rel="noopener noreferrer" class="social-button">
                    <i class="fab fa-youtube"></i>
                </a>
            </div>
        `;
        container.appendChild(profileElement);
    });
}

function toggleConfigPanel() {
    const configContent = document.getElementById('configContent');
    configContent.classList.toggle('hidden');
}

function updateProfileSelect() {
    const select = document.getElementById('profileSelect');
    select.innerHTML = '';
    profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        select.appendChild(option);
    });
}

function updateProfile() {
    const id = parseInt(document.getElementById('profileSelect').value);
    const name = document.getElementById('profileName').value;
    const subname = document.getElementById('profileSubname').value;
    const image = document.getElementById('profileImage').value;
    const instagram = document.getElementById('instagramUrl').value;
    const discord = document.getElementById('discordUrl').value;
    const youtube = document.getElementById('youtubeUrl').value;

    const profile = profiles.find(p => p.id === id);
    if (profile) {
        profile.name = name || profile.name;
        profile.subname = subname || profile.subname;
        profile.image = image || profile.image;
        profile.social.instagram = instagram || profile.social.instagram;
        profile.social.discord = discord || profile.social.discord;
        profile.social.youtube = youtube || profile.social.youtube;
        
        // Update badges
        profile.badges = [];
        document.querySelectorAll('#badgeContainer input').forEach(input => {
            if (input.value) {
                profile.badges.push(input.value);
            }
        });

        renderProfiles();
        updateProfileSelect();
        saveProfilesToLocalStorage();
    }
}

function addNewProfile() {
    const newId = Math.max(...profiles.map(p => p.id), 0) + 1;
    const newProfile = {
        id: newId,
        name: 'Novo Perfil',
        subname: 'Novo Subnome',
        image: 'https://example.com/default.jpg',
        badges: [],
        social: {
            instagram: '#',
            discord: '#',
            youtube: '#'
        }
    };
    profiles.push(newProfile);
    renderProfiles();
    updateProfileSelect();
    saveProfilesToLocalStorage();
}

function deleteProfile() {
    const id = parseInt(document.getElementById('profileSelect').value);
    profiles = profiles.filter(p => p.id !== id);
    renderProfiles();
    updateProfileSelect();
    saveProfilesToLocalStorage();
}

function displayIPAddress() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipDisplay').innerText = `Seu IP: ${data.ip}`;
        })
        .catch(error => console.error('Erro ao buscar IP:', error));
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    saveThemePreference();
}

function addBadgeInput() {
    const container = document.getElementById('badgeContainer');
    const input = document.createElement('input');
    input.type = 'url';
    input.placeholder = 'URL do Emblema';
    container.appendChild(input);
}

function saveProfilesToLocalStorage() {
    localStorage.setItem('profiles', JSON.stringify(profiles));
}

function loadProfilesFromLocalStorage() {
    const savedProfiles = localStorage.getItem('profiles');
    if (savedProfiles) {
        profiles = JSON.parse(savedProfiles);
        renderProfiles();
        updateProfileSelect();
    }
}

function saveThemePreference() {
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    loadProfilesFromLocalStorage();
    loadThemePreference();

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        document.querySelector('.overlay').style.display = 'none';
        playBackgroundAudio();
        renderProfiles();
    });

    document.getElementById('toggleConfig').addEventListener('click', toggleConfigPanel);
    document.getElementById('updateProfile').addEventListener('click', updateProfile);
    document.getElementById('addNewProfile').addEventListener('click', addNewProfile);
    document.getElementById('deleteProfile').addEventListener('click', deleteProfile);
    document.getElementById('addBadge').addEventListener('click', addBadgeInput);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    updateProfileSelect();
    displayIPAddress();

    makeDraggable(document.getElementById('configPanel'));

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            if (!ALLOWED_IPS.includes(data.ip)) {
                document.getElementById('configPanel').style.display = 'none';
            }
        })
        .catch(error => console.error('Erro ao verificar IP:', error));
});