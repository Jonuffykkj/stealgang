const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let teams = [];
let profiles = {};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/teams', (req, res) => {
  if (teams.length >= 3) {
    return res.status(400).json({ error: 'Limite máximo de 3 equipes atingido' });
  }
  const team = {
    id: uuidv4(),
    name: req.body.name || 'Nova Equipe',
    coverImage: 'https://via.placeholder.com/1200x400',
    backgroundColor: '#ffffff',
    backgroundMusic: '',
    socialLinks: {},
  };
  teams.push(team);
  profiles[team.id] = [];
  res.json(team);
});

app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.put('/api/teams/:id', (req, res) => {
  const { id } = req.params;
  const { name, backgroundColor, coverImage, backgroundMusic, socialLinks } = req.body;
  const team = teams.find((t) => t.id === id);
  if (team) {
    Object.assign(team, { name, backgroundColor, coverImage, backgroundMusic, socialLinks });
    res.json(team);
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.delete('/api/teams/:id', (req, res) => {
  const { id } = req.params;
  const index = teams.findIndex((t) => t.id === id);
  if (index !== -1) {
    teams.splice(index, 1);
    delete profiles[id];
    res.sendStatus(200);
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.get('/api/teams/:id/profiles', (req, res) => {
  const { id } = req.params;
  res.json(profiles[id] || []);
});

app.post('/api/teams/:id/profiles', (req, res) => {
  const { id } = req.params;
  const profile = { ...req.body, id: uuidv4() };
  if (profiles[id]) {
    profiles[id].push(profile);
    res.status(201).json(profile);
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.put('/api/teams/:teamId/profiles/:profileId', (req, res) => {
  const { teamId, profileId } = req.params;
  const updatedProfile = req.body;
  const teamProfiles = profiles[teamId];
  if (teamProfiles) {
    const profileIndex = teamProfiles.findIndex((p) => p.id === profileId);
    if (profileIndex !== -1) {
      teamProfiles[profileIndex] = {
        ...teamProfiles[profileIndex],
        ...updatedProfile,
        id: profileId,
      };
      res.json(teamProfiles[profileIndex]);
    } else {
      res.status(404).json({ error: 'Perfil não encontrado' });
    }
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.delete('/api/teams/:teamId/profiles/:profileId', (req, res) => {
  const { teamId, profileId } = req.params;
  const teamProfiles = profiles[teamId];
  if (teamProfiles) {
    const profileIndex = teamProfiles.findIndex((p) => p.id === profileId);
    if (profileIndex !== -1) {
      teamProfiles.splice(profileIndex, 1);
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: 'Perfil não encontrado' });
    }
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.get('/team/:id', (req, res) => {
  const { id } = req.params;
  const team = teams.find((t) => t.id === id);
  if (team) {
    res.render('team', { team, profiles: profiles[id] || [] });
  } else {
    res.status(404).send('Equipe não encontrada');
  }
});

app.get('/api/save', (req, res) => {
  const data = JSON.stringify({ teams, profiles });
  res.json({ message: 'Dados salvos com sucesso', data });
});

app.post('/api/load', (req, res) => {
  const { data } = req.body;
  if (data) {
    const parsedData = JSON.parse(data);
    teams = parsedData.teams;
    profiles = parsedData.profiles;
    res.json({ message: 'Dados carregados com sucesso' });
  } else {
    res.status(400).json({ error: 'Nenhum dado fornecido' });
  }
});

app.listen(port, () => {
  console.log(`iDeaths server running at http://localhost:${port}`);
});
