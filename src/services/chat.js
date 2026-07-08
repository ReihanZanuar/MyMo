import api from './api';

export const chatService = {
  async sendMessageStreaming(message, conversationHistory = [], callbacks = {}, abortSignal = null) {
    const { onChunk, onLoading, onDone, onError } = callbacks;
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
        signal: abortSignal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const data = line.replace(/^data:\s*/, '');
            try {
              const event = JSON.parse(data);

              switch (event.type) {
                case 'loading':
                  if (onLoading) onLoading(event.message);
                  break;
                case 'chunk':
                  if (onChunk) onChunk(event.content);
                  break;
                case 'done':
                  if (onDone) onDone(event);
                  break;
                case 'error':
                  if (onError) onError(event.message);
                  break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      if (onError) onError(error.message);
      throw error;
    }
  },

  async checkConnection() {
    const response = await api.get('/chat/status');
    return response.data;
  },

  async analyzeReceipt(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/chat/analyze-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 150000
      });

      return response.data;
    } catch (error) {
      console.error('Receipt analysis error:', error);
      throw new Error(error.response?.data?.error || 'Gagal menganalisis struk');
    }
  }
};
