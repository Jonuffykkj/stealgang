const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('redis');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.connect().catch(console.error);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let teams = [];
let profiles = {};

const saveDataToRedis = async () => {
  try {
    await client.set('teams_profiles_data', JSON.stringify({ teams, profiles }));
  } catch (error) {
    console.error('Error saving data to Redis:', error);
  }
};

const loadDataFromRedis = async () => {
  try {
    const data = await client.get('teams_profiles_data');
    if (data) {
      ({ teams, profiles } = JSON.parse(data));
    }
  } catch (error) {
    console.error('Error loading data from Redis:', error);
  }
};

loadDataFromRedis();

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/teams', async (req, res) => {
  if (teams.length >= 3) {
    return res.status(400).json({ error: 'Limite máximo de 3 equipes atingido' });
  }
  const team = {
    id: uuidv4(),
    name: req.body.name || 'Nova Equipe',
    coverImage: req.body.coverImage || 'https://via.placeholder.com/1200x400',
    backgroundColor: req.body.backgroundColor || '#ffffff',
    backgroundMusic: req.body.backgroundMusic || '',
    socialLinks: req.body.socialLinks || {},
  };
  teams.push(team);
  profiles[team.id] = [];
  await saveDataToRedis();
  res.status(201).json(team);
});

app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.put('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  const { name, backgroundColor, coverImage, backgroundMusic, socialLinks } = req.body;
  const teamIndex = teams.findIndex((t) => t.id === id);
  if (teamIndex !== -1) {
    teams[teamIndex] = {
      ...teams[teamIndex],
      name,
      backgroundColor,
      coverImage,
      backgroundMusic,
      socialLinks,
    };
    await saveDataToRedis();
    res.json(teams[teamIndex]);
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  const teamIndex = teams.findIndex((t) => t.id === id);
  if (teamIndex !== -1) {
    teams.splice(teamIndex, 1);
    delete profiles[id];
    await saveDataToRedis();
    res.sendStatus(200);
  } else {
    res.status(404).json({ error: 'Equipe não encontrada' });
  }
});

app.get('/api/teams/:id/profiles', (req, res) => {
  const { id } = req.params;
  res.json(profiles[id] || []);
});

app.post('/api/teams/:id/profiles', async (req, res) => {
  const { id } = req.params;
  if (!profiles[id]) {
    return res.status(404).json({ error: 'Equipe não encontrada' });
  }
  const profile = { ...req.body, id: uuidv4() };
  profiles[id].push(profile);
  await saveDataToRedis();
  res.status(201).json(profile);
});

app.put('/api/teams/:teamId/profiles/:profileId', async (req, res) => {
  const { teamId, profileId } = req.params;
  const updatedProfile = req.body;
  const teamProfiles = profiles[teamId];
  if (!teamProfiles) {
    return res.status(404).json({ error: 'Equipe não encontrada' });
  }
  const profileIndex = teamProfiles.findIndex((p) => p.id === profileId);
  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Perfil não encontrado' });
  }
  teamProfiles[profileIndex] = { ...teamProfiles[profileIndex], ...updatedProfile, id: profileId };
  await saveDataToRedis();
  res.json(teamProfiles[profileIndex]);
});

app.delete('/api/teams/:teamId/profiles/:profileId', async (req, res) => {
  const { teamId, profileId } = req.params;
  const teamProfiles = profiles[teamId];
  if (!teamProfiles) {
    return res.status(404).json({ error: 'Equipe não encontrada' });
  }
  const profileIndex = teamProfiles.findIndex((p) => p.id === profileId);
  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Perfil não encontrado' });
  }
  teamProfiles.splice(profileIndex, 1);
  await saveDataToRedis();
  res.sendStatus(200);
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

const server = app.listen(port, () => {
  console.log(`iDeaths server running at http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    client.quit();
  });
});
