import sendToWhatsApp from './httpRequest/sendToWhatsApp.js';
// Eliminamos la importación directa de axios y config si ya no se usan directamente aquí
// import axios from 'axios';
// import config from '../config/env.js'; 

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    try {
      if (!to || typeof to !== "string" || to.trim() === "") {
        throw new Error("El parámetro 'to' debe ser un string no vacío.");
      }
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
      
      console.log("Enviando mensaje simple:", JSON.stringify(data));
      return await sendToWhatsApp(data);
    } catch (error) {
      // Los errores ya se loguean en sendToWhatsApp, pero podemos añadir contexto si queremos
      console.error('Error en WhatsAppService.sendMessage:', error.message);
      throw error; // Re-lanzar para que el llamador sepa que falló
    }
  }
  
  async markAsRead(messageId) {
    try {
      if (!messageId || typeof messageId !== "string" || messageId.trim() === "") {
        throw new Error("El parámetro 'messageId' debe ser un string no vacío.");
      }
      
      // Payload correcto para marcar como leído
      const data = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
        // Quitamos 'to' que no es necesario y causaba error
      };
      
      console.log("Marcando mensaje como leído:", JSON.stringify(data));
      return await sendToWhatsApp(data);
    } catch (error) {
      console.error('Error en WhatsAppService.markAsRead:', error.message);
      throw error;
    }
  }

  async sendInteractiveButtons(to, bodyText, buttons) {
    try {
      if (!to || typeof to !== "string" || to.trim() === "") {
        throw new Error("El parámetro 'to' debe ser un string no vacío.");
      }
      if (!bodyText || typeof bodyText !== "string" || bodyText.trim() === "") {
        throw new Error("El parámetro 'bodyText' debe ser un string no vacío.");
      }
      if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
        throw new Error("El parámetro 'buttons' debe ser un array no vacío.");
      }

      // Construimos el payload y usamos sendToWhatsApp
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

      console.log("Enviando botones interactivos:", JSON.stringify(data));
      return await sendToWhatsApp(data);
    } catch (error) {
      console.error('Error en WhatsAppService.sendInteractiveButtons:', error.message);
      throw error;
    }
  }

  async sendMediaMessage(to, type, mediaUrl, caption) {
    try {
      if (!to || typeof to !== "string" || to.trim() === "") {
        throw new Error("El parámetro 'to' debe ser un string no vacío.");
      }
      if (!type || typeof type !== "string" || !["image", "audio", "video", "document"].includes(type)) {
        throw new Error("Tipo de medio no soportado. Debe ser: image, audio, video o document");
      }
      if (!mediaUrl || typeof mediaUrl !== "string" || mediaUrl.trim() === "") {
        throw new Error("El parámetro 'mediaUrl' debe ser un string no vacío.");
      }

      const mediaObject = {};
      const data = {
        messaging_product: 'whatsapp',
        to,
        type: type
      };

      // Construimos el objeto específico del medio
      switch(type) {
        case "image":
          mediaObject.image = { link: mediaUrl, caption };
          break;
        case "audio":
          mediaObject.audio = { link: mediaUrl };
          break;
        case "video":
          mediaObject.video = { link: mediaUrl, caption };
          break;
        case "document":
          // Asegurarse de que el caption sea opcional si no se proporciona
          mediaObject.document = { link: mediaUrl, filename: "GymBro.pdf" }; 
          if (caption) {
            mediaObject.document.caption = caption;
          }
          break;
      }
      // Agregamos el objeto del medio al payload principal
      data[type] = mediaObject[type];

      console.log("Enviando mensaje multimedia:", JSON.stringify(data));
      return await sendToWhatsApp(data);
    } catch(error) {
      console.error('Error en WhatsAppService.sendMediaMessage:', error.message);
      throw error;
    }
  }
}

export default new WhatsAppService();


