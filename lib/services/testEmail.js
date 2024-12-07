import { createTransport } from 'nodemailer';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const testEmailService = {
  async sendTestEmail() {
    const testData = {
      filesDeleted: 5,
      storageFreed: 150.5,
      documentsDeleted: 3,
      errors: [],
      detailedClipData: [
        {
          id: 'test-clip-1',
          created_at: new Date(Date.now() - 86400000),
          expires_at: new Date(),
          file_metadata: [
            {
              type: 'image/jpeg',
              size: 1024 * 1024 * 50,
              stored_name: 'test-image-1.jpg'
            },
            {
              type: 'video/mp4',
              size: 1024 * 1024 * 100,
              stored_name: 'test-video-1.mp4'
            }
          ]
        }
      ]
    };

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Test Cleanup Report',
        html: `
          <h2>Test Cleanup Operation Summary</h2>
          <p>Time: ${new Date().toLocaleString()}</p>
          
          <h3>Overview</h3>
          <ul>
            <li>Files Deleted: ${testData.filesDeleted}</li>
            <li>Storage Freed: ${testData.storageFreed} MB</li>
            <li>Documents Removed: ${testData.documentsDeleted}</li>
          </ul>

          <h3>Sample Deleted Clip Details</h3>
          <ul>
            ${testData.detailedClipData.map(clip => `
              <li>
                <strong>Clip ID:</strong> ${clip.id}<br>
                <strong>Created:</strong> ${clip.created_at.toLocaleString()}<br>
                <strong>Expired:</strong> ${clip.expires_at.toLocaleString()}<br>
                <strong>Files:</strong>
                <ul>
                  ${clip.file_metadata.map(file => `
                    <li>${file.type} - ${(file.size / (1024 * 1024)).toFixed(2)} MB</li>
                  `).join('')}
                </ul>
              </li>
            `).join('')}
          </ul>

          <p style="color: green;">✓ This is a test email. All systems working correctly.</p>
        `
      });

      console.log('Test email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }
};

// Run test if file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  testEmailService.sendTestEmail()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default testEmailService; 