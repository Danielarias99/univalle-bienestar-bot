class QueryController {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

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