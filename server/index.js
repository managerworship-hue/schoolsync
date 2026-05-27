import express from 'express';
import cors from 'cors';
import { scrapeInovarSchedule } from './inovar.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API route for Inovar integration
app.post('/api/inovar/extract-schedule', async (req, res) => {
  const { schoolUrl, username, password } = req.body;
  
  if (!schoolUrl || !username || !password) {
    return res.status(400).json({ error: 'URL, utilizador e password são obrigatórios.' });
  }

  try {
    const schedule = await scrapeInovarSchedule(schoolUrl, username, password);
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Inovar Scraper Error:', error);
    res.status(500).json({ 
      error: error.message || 'Falha ao conectar com o Inovar Consulta da escola.' 
    });
  }
});

// Em produção, servir a PWA (Vite build) na mesma porta
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SchoolSync Backend running on port ${PORT}`);
});
