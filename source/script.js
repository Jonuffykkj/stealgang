document.addEventListener('DOMContentLoaded', () => {
    const app = {
        init() {
            this.cacheDOM();
            this.bindEvents();
            this.loadTeam();
            this.showUserIP();
            this.checkAdminStatus();
        },

        cacheDOM() {
            this.homeScreen = document.getElementById('home-screen');
            this.teamScreen = document.getElementById('team-screen');
            this.dashboardScreen = document.getElementById('dashboard-screen');
            this.adminScreen = document.getElementById('admin-screen');
            this.createTeamBtn = document.getElementById('create-team-btn');
            this.homeLink = document.getElementById('home-link');
            this.teamLink = document.getElementById('team-link');
            this.dashboardLink = document.getElementById('dashboard-link');
            this.adminLink = document.getElementById('admin-link');
            this.teamNameElement = document.getElementById('team-name');
            this.profileList = document.getElementById('profile-list');
            this.profileListAdmin = document.getElementById('profile-list-admin');
            this.teamNameInput = document.getElementById('team-name-input');
            this.saveTeamNameBtn = document.getElementById('save-team-name');
            this.profileForm = {
                name: document.getElementById('profile-name'),
                role: document.getElementById('profile-role'),
                avatar: document.getElementById('profile-avatar'),
                bio: document.getElementById('profile-bio'),
                saveBtn: document.getElementById('save-profile')
            };
            this.userIPElement = document.getElementById('user-ip');
            this.teamLinkDisplay = document.getElementById('team-link-display');
            this.shareLinkElement = document.getElementById('share-link');
            this.copyLinkBtn = document.getElementById('copy-link-btn');
            this.allTeamsList = document.getElementById('all-teams-list');
        },

        bindEvents() {
            this.createTeamBtn.addEventListener('click', () => this.createTeam());
            this.homeLink.addEventListener('click', () => this.showScreen('home'));
            this.teamLink.addEventListener('click', () => this.showScreen('team'));
            this.dashboardLink.addEventListener('click', () => this.showScreen('dashboard'));
            this.adminLink.addEventListener('click', () => this.showScreen('admin'));
            this.saveTeamNameBtn.addEventListener('click', () => this.saveTeamName());
            this.profileForm.saveBtn.addEventListener('click', () => this.saveProfile());
            this.copyLinkBtn.addEventListener('click', () => this.copyShareLink());
        },

        createTeam() {
            const teamName = prompt('Enter your team name:');
            if (teamName) {
                const userIP = localStorage.getItem('userIP');
                if (this.getTeamByIP(userIP)) {
                    alert('You can only create one team per IP address.');
                    return;
                }
                const teamId = this.generateTeamId();
                const newTeam = { id: teamId, name: teamName, ip: userIP, profiles: [] };
                this.saveTeam(newTeam);
                this.loadTeam();
                this.showScreen('team');
            }
        },

        loadTeam() {
            const userIP = localStorage.getItem('userIP');
            const team = this.getTeamByIP(userIP);
            if (team) {
                this.teamNameElement.textContent = team.name;
                this.teamNameInput.value = team.name;
                this.renderProfiles(this.profileList, team.profiles, false);
                this.renderProfiles(this.profileListAdmin, team.profiles, true);
                this.updateShareLink(team.id);
            } else {
                this.teamLinkDisplay.style.display = 'none';
            }
        },

        saveTeamName() {
            const teamName = this.teamNameInput.value;
            const userIP = localStorage.getItem('userIP');
            const team = this.getTeamByIP(userIP);
            if (team) {
                team.name = teamName;
                this.saveTeam(team);
                this.teamNameElement.textContent = teamName;
            }
        },

        renderProfiles(container, profiles, isAdmin) {
            container.innerHTML = '';
            profiles.forEach((profile, index) => {
                const profileElement = document.createElement('div');
                profileElement.className = 'profile';
                profileElement.innerHTML = `
                    <img src="${profile.avatar}" alt="${profile.name}">
                    <h3>${profile.name}</h3>
                    <p>${profile.role}</p>
                    <p class="profile-bio">${profile.bio}</p>
                    ${isAdmin ? `
                        <button onclick="app.editProfile(${index})">Edit</button>
                        <button onclick="app.deleteProfile(${index})">Delete</button>
                    ` : ''}
                `;
                container.appendChild(profileElement);
            });
        },

        saveProfile() {
            const userIP = localStorage.getItem('userIP');
            const team = this.getTeamByIP(userIP);
            if (team) {
                const newProfile = {
                    name: this.profileForm.name.value,
                    role: this.profileForm.role.value,
                    avatar: this.profileForm.avatar.value,
                    bio: this.profileForm.bio.value
                };
                team.profiles.push(newProfile);
                this.saveTeam(team);
                this.loadTeam();
                this.clearProfileForm();
            }
        },

        editProfile(index) {
            const userIP = localStorage.getItem('userIP');
            const team = this.getTeamByIP(userIP);
            if (team) {
                const profile = team.profiles[index];
                this.profileForm.name.value = profile.name;
                this.profileForm.role.value = profile.role;
                this.profileForm.avatar.value = profile.avatar;
                this.profileForm.bio.value = profile.bio;
                this.profileForm.saveBtn.onclick = () => {
                    team.profiles[index] = {
                        name: this.profileForm.name.value,
                        role: this.profileForm.role.value,
                        avatar: this.profileForm.avatar.value,
                        bio: this.profileForm.bio.value
                    };
                    this.saveTeam(team);
                    this.loadTeam();
                    this.clearProfileForm();
                    this.profileForm.saveBtn.onclick = () => this.saveProfile();
                };
            }
        },

        deleteProfile(index) {
            const userIP = localStorage.getItem('userIP');
            const team = this.getTeamByIP(userIP);
            if (team) {
                team.profiles.splice(index, 1);
                this.saveTeam(team);
                this.loadTeam();
            }
        },

        clearProfileForm() {
            this.profileForm.name.value = '';
            this.profileForm.role.value = '';
            this.profileForm.avatar.value = '';
            this.profileForm.bio.value = '';
        },

        showScreen(screen) {
            this.homeScreen.style.display = screen === 'home' ? 'block' : 'none';
            this.teamScreen.style.display = screen === 'team' ? 'block' : 'none';
            this.dashboardScreen.style.display = screen === 'dashboard' ? 'block' : 'none';
            this.adminScreen.style.display = screen === 'admin' ? 'block' : 'none';
        },

        showUserIP() {
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    this.userIPElement.textContent = `Your IP: ${data.ip}`;
                    localStorage.setItem('userIP', data.ip);
                });
        },

        generateTeamId() {
            return Math.random().toString(36).substr(2, 9);
        },

        saveTeam(team) {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            const index = teams.findIndex(t => t.id === team.id);
            if (index !== -1) {
                teams[index] = team;
            } else {
                teams.push(team);
            }
            localStorage.setItem('teams', JSON.stringify(teams));
        },

        getTeamByIP(ip) {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            return teams.find(team => team.ip === ip);
        },

        getTeamById(id) {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            return teams.find(team => team.id === id);
        },

        updateShareLink(teamId) {
            const shareLink = `${window.location.origin}?team=${teamId}`;
            this.shareLinkElement.textContent = shareLink;
            this.teamLinkDisplay.style.display = 'block';
        },

        copyShareLink() {
            const shareLink = this.shareLinkElement.textContent;
            navigator.clipboard.writeText(shareLink).then(() => {
                alert('Link copied to clipboard!');
            });
        },

        checkAdminStatus() {
            const adminIPs = ['45.161.75.216']; // Add admin IPs here
            const userIP = localStorage.getItem('userIP');
            const isAdmin = adminIPs.includes(userIP);
            this.adminLink.style.display = isAdmin ? 'inline' : 'none';
            if (isAdmin) {
                this.loadAllTeams();
            }
        },

        loadAllTeams() {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            this.allTeamsList.innerHTML = '';
            teams.forEach(team => {
                const teamElement = document.createElement('div');
                teamElement.className = 'team-card';
                teamElement.innerHTML = `
                    <h3>${team.name}</h3>
                    <p>Team ID: ${team.id}</p>
                    <p>IP: ${team.ip}</p>
                    <p>Profiles: ${team.profiles.length}</p>
                    <button class="edit-team-btn" onclick="app.editTeam('${team.id}')">Edit Team</button>
                `;
                this.allTeamsList.appendChild(teamElement);
            });
        },

        editTeam(teamId) {
            const team = this.getTeamById(teamId);
            if (team) {
                this.teamNameInput.value = team.name;
                this.renderProfiles(this.profileListAdmin, team.profiles, true);
                this.showScreen('dashboard');
                this.saveTeamNameBtn.onclick = () => {
                    team.name = this.teamNameInput.value;
                    this.saveTeam(team);
                    this.loadAllTeams();
                    alert('Team updated successfully!');
                };
            }
        }
    };

    app.init();
    window.app = app; // Expose app to global scope for button onclick handlers
});