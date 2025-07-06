import express from 'express';
import config from './config/env.js';
import webhookRoutes from './routes/webhookRoutes.js';

const app = express();
app.use(express.json());

app.use('/', webhookRoutes);

app.get('/', (req, res) => {
  res.send(`<pre>Asistente Virtual de Bienestar Universitario - Universidad del Valle
      
Este es el servidor del bot de WhatsApp para el área de Bienestar Universitario.
      
Servicios disponibles:
- Psicología y orientación
- Comedor universitario
      
Para más información, contacta al área de Bienestar Universitario.</pre>`);
});

app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = "Univallezarzal";
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

app.listen(config.PORT, () => {
  console.log(`🚀 Servidor del Asistente Virtual de Bienestar Universitario iniciado en puerto: ${config.PORT}`);
});