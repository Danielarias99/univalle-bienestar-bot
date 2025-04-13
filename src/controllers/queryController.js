// @ts-check

/**
 * Controlador para manejar consultas
 */
class QueryController {
    /**
     * @param {string} apiKey - API key para el servicio
     */
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * @param {string} text - Texto de la consulta
     * @returns {Promise<string>} Respuesta procesada
     */
    async handleQuery(text) {
        try {
            // Por ahora, solo devolvemos el texto como eco
            return `Procesando consulta: ${text}`;
        } catch (error) {
            console.error('Error al procesar la consulta:', error);
            return 'Lo siento, hubo un error al procesar tu consulta.';
        }
    }
}

export default QueryController; 