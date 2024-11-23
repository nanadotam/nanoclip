import { ENDPOINTS } from '@/config/api';

class ClipService {
  async createClip(formData) {
    try {
      const response = await fetch(ENDPOINTS.clips, {
        method: 'POST',
        body: formData // FormData is already properly formatted
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create clip');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getClip(urlSlug, password = null) {
    try {
      const headers = {};
      if (password) {
        headers['X-Clip-Password'] = password;
      }

      const response = await fetch(`${ENDPOINTS.clips}?url_slug=${urlSlug}`, {
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch clip');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async downloadFile(filename) {
    try {
      const response = await fetch(ENDPOINTS.download(filename));
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      return response.blob();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new ClipService(); 