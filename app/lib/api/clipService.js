import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const clipService = {
  async getClip(urlSlug) {
    try {
      const response = await axios.get(`${API_BASE_URL}/clips`, {
        params: { url_slug: urlSlug }
      });
      
      if (!response.data) {
        throw new Error('Clip not found');
      }

      return {
        isProtected: !!response.data.password_hash,
        content: {
          text: response.data.text_content,
          files: response.data.file_metadata ? JSON.parse(response.data.file_metadata) : []
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clip');
    }
  },

  async createClip(clipData) {
    try {
      const formattedData = {
        url_slug: clipData.urlSlug,
        content_type: clipData.files ? 'text_file' : 'text',
        text_content: clipData.text || null,
        file_url: clipData.fileUrl || null,
        file_metadata: clipData.files ? JSON.stringify(clipData.files) : null,
        password_hash: clipData.password || null,
        expires_at: clipData.expiresAt || null
      };

      const response = await axios.post(`${API_BASE_URL}/clips`, formattedData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('This URL is already taken. Please choose a different one.');
      }
      throw new Error(error.response?.data?.message || 'Failed to create clip');
    }
  }
};

export default clipService; 