import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const emailService = {
  async sendCleanupNotification(stats, detailedClipData) {
    const totalStorageFreedMB = stats.storageFreed.toFixed(2);
    const fileTypeStats = detailedClipData.reduce((acc, clip) => {
      clip.file_metadata.forEach((file) => {
        const type = file.type.split("/")[0];
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {});

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Monthly Cleanup Report - ${new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })}`,
      html: `
        <h2>Monthly Cleanup Operation Summary</h2>
        <p>Time: ${new Date().toLocaleString()}</p>
        
        <h3>Overview</h3>
        <ul>
          <li>Files Deleted: ${stats.filesDeleted}</li>
          <li>Storage Freed: ${totalStorageFreedMB} MB</li>
          <li>Documents Removed: ${stats.documentsDeleted}</li>
        </ul>

        <h3>File Type Distribution</h3>
        <ul>
          ${Object.entries(fileTypeStats)
            .map(([type, count]) => `<li>${type}: ${count} files</li>`)
            .join("")}
        </ul>

        <h3>Deleted Clips Details</h3>
        <ul>
          ${detailedClipData
            .map(
              (clip) => `
            <li>
              <strong>Clip ID:</strong> ${clip.id}<br>
              <strong>Created:</strong> ${clip.createdAt
                ?.toDate()
                .toLocaleString()}<br>
              <strong>Expired:</strong> ${clip.expiresAt
                ?.toDate()
                .toLocaleString()}<br>
              <strong>Files:</strong> ${clip.file_metadata.length}<br>
              <strong>Total Size:</strong> ${(
                clip.file_metadata.reduce((acc, file) => acc + file.size, 0) /
                (1024 * 1024)
              ).toFixed(2)} MB
            </li>
          `
            )
            .join("")}
        </ul>

        ${
          stats.errors.length
            ? `
          <h3>Errors:</h3>
          <ul>
            ${stats.errors
              .map((error) => `<li style="color: red;">${error}</li>`)
              .join("")}
          </ul>
        `
            : ""
        }
      `,
    };

    await transporter.sendMail(mailOptions);
  },
};
