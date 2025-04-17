import axios from 'axios';
import config from '../config/env.js';

class WhatsAppService {
  async sendMessage(to, body, messageId = null) {
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
      console.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async markAsRead(messageId) {
    try {
      if (!messageId || typeof messageId !== "string" || messageId.trim() === "") {
        throw new Error("El parámetro 'messageId' debe ser un string no vacío.");
      }

      const response = await axios.post(
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
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error.response?.data || error.message);
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

      const response = await axios.post(
        `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: { buttons }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending interactive buttons:', error.response?.data || error.message);
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
          mediaObject.document = { link: mediaUrl, caption, filename: "GymBro.pdf" };
          break;
      }

      const response = await axios.post(
        `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type,
          ...mediaObject
        },
        {
          headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch(error) {
      console.error("Error sending media:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new WhatsAppService();


