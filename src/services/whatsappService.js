import axios from 'axios';
import config from '../config/env.js';

class WhatsAppService {
  async sendMessage(to, body, messageId = null) {
    try {
      if (!body || typeof body !== "string" || body.trim() === "") {
        throw new Error("El parámetro 'body' debe ser un string no vacío.");
      }
  
      const data = {
        messaging_product: 'whatsapp',
        to,
        text: { body }
      };
  
      if (messageId) {
        data.context = { message_id: messageId };
      }

      const response = await axios.post(
        `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        data,
        {
          headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', {
        error: error.message,
        response: error.response?.data,
        config: {
          API_VERSION: config.API_VERSION,
          BUSINESS_PHONE: config.BUSINESS_PHONE,
          hasToken: !!config.API_TOKEN
        }
      });
      throw error;
    }
  }
  

  async markAsRead(messageId) {
    if (!messageId) {
      console.error('Error: messageId es requerido para marcar como leído');
      return;
    }
    try {
      await axios.post(
        `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error.response?.data || error.message);
    }
  }

  async sendInteractiveButtons(to, bodyText, buttons) {
    try {
      if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
        throw new Error('Se requiere un array de botones válido');
      }

      const data = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: { buttons }
        }
      };

      const response = await axios.post(
        `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        data,
        {
          headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error al enviar botones:', {
        error: error.message,
        response: error.response?.data,
        config: {
          API_VERSION: config.API_VERSION,
          BUSINESS_PHONE: config.BUSINESS_PHONE,
          hasToken: !!config.API_TOKEN
        }
      });
      throw error;
    }
  }

  async sendMediaMessage(to, type, mediaUrl, caption) {
    try{
      const mediaObject = {}

      switch(type){
        case "image":
          mediaObject.image ={link: mediaUrl, caption: caption};
          break;
        case "audio":
            mediaObject.audio ={ link:mediaUrl};
          break;
        case "video":
              mediaObject.video = { link: mediaUrl, caption: caption};
            break;
        case "document":
                mediaObject.document={link: mediaUrl, caption: caption, filename: "GymBro.pdf"};
              break;

        default:
          throw new Error ("Not soported Media Type");
            
      }
      await axios.post(
        `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: type,
          ...mediaObject
        },
        {
          headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      

    } catch(error) {
      console.error("Error sending Media;", error);

    }
  }







}

export default new WhatsAppService();


