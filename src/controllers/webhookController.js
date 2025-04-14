import config from '../config/env.js';
import messageHandler from '../services/messageHandler.js';

class WebhookController {
  async handleIncoming(req, res) {
    try {
      console.log('📥 Webhook recibido:', JSON.stringify(req.body, null, 2));

      // Adaptación para manejar campos en español
      const entrada = req.body.entrada?.[0];
      if (!entrada) {
        console.log('❌ No se encontró entrada en el webhook');
        return res.sendStatus(200);
      }

      const cambio = entrada.cambios?.[0];
      if (!cambio) {
        console.log('❌ No se encontró cambio en el webhook');
        return res.sendStatus(200);
      }

      const valor = cambio.valor;
      if (!valor) {
        console.log('❌ No se encontró valor en el webhook');
        return res.sendStatus(200);
      }

      console.log('🔍 Procesando valor:', JSON.stringify(valor, null, 2));

      // Extraer mensaje y contacto
      const mensaje = valor.mensajes?.[0];
      const contacto = valor.contactos?.[0];
      const estados = valor.estados?.[0];

      if (estados) {
        console.log('📊 Estado del mensaje:', JSON.stringify(estados, null, 2));
        return res.sendStatus(200);
      }

      if (!mensaje) {
        console.log('❌ No se encontró mensaje en el webhook');
        return res.sendStatus(200);
      }

      // Adaptar el formato del mensaje al esperado por el handler
      const adaptedMessage = {
        from: mensaje.de,
        id: mensaje.id,
        timestamp: mensaje.marca_de_tiempo,
        type: mensaje.tipo,
        text: mensaje.texto ? { body: mensaje.texto.cuerpo } : undefined,
        interactive: mensaje.interactivo ? {
          type: mensaje.interactivo.tipo,
          button_reply: mensaje.interactivo.respuesta_boton ? {
            id: mensaje.interactivo.respuesta_boton.id,
            title: mensaje.interactivo.respuesta_boton.titulo
          } : undefined
        } : undefined
      };

      const adaptedSenderInfo = contacto ? {
        profile: {
          name: contacto.perfil?.nombre
        },
        wa_id: contacto.wa_id
      } : undefined;

      console.log('🔄 Procesando mensaje adaptado:', JSON.stringify(adaptedMessage, null, 2));
      console.log('👤 Información del remitente:', JSON.stringify(adaptedSenderInfo, null, 2));

      await messageHandler.handleIncomingMessage(adaptedMessage, adaptedSenderInfo);
      console.log('✅ Mensaje procesado exitosamente');

    } catch (error) {
      console.error('❌ Error procesando webhook:', error.stack);
      // Asegurarnos de que el error no interrumpa el servicio
      res.sendStatus(200);
      return;
    }

    res.sendStatus(200);
  }
  

  verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      console.log('🔍 Verificando webhook:', { mode, token: token ? '***' : undefined, challenge });

      if (!mode || !token) {
        console.log('❌ Parámetros de verificación incompletos');
        return res.sendStatus(400);
      }

      if (mode === 'subscribe' && token === config.WEBHOOK_VERIFY_TOKEN) {
        console.log('✅ Webhook verificado exitosamente');
        res.status(200).send(challenge);
      } else {
        console.log('❌ Verificación de webhook fallida - Token inválido o modo incorrecto');
        res.sendStatus(403);
      }
    } catch (error) {
      console.error('❌ Error verificando webhook:', error.stack);
      res.sendStatus(500);
    }
  }
}

export default new WebhookController();