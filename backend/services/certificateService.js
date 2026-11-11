import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (userId, targetRole, readinessScore, verifiedSkills) => {
  try {
    const user = await User.findOne({ uid: userId });
    if (!user) throw new Error("User not found");

    const certificateId = `SKN-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const issueDate = new Date();
    
    // Directory setup
    const certsDir = path.join(__dirname, '..', 'public', 'uploads', 'certificates');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }
    
    const fileName = `${certificateId}.pdf`;
    const filePath = path.join(certsDir, fileName);
    const pdfUrl = `/uploads/certificates/${fileName}`;

    // Generate QR Code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, 'base64');

    // Create PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
      });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Design Certificate
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
      
      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).strokeColor('#2B6CB0').lineWidth(5).stroke();

      doc.fillColor('#2D3748')
         .fontSize(40)
         .font('Helvetica-Bold')
         .text('SkillNova', 0, 80, { align: 'center' });
         
      doc.fontSize(20)
         .font('Helvetica')
         .text('Certificate of Job Readiness', 0, 140, { align: 'center' });

      doc.fontSize(16)
         .text('This is to certify that', 0, 200, { align: 'center' });

      doc.fontSize(30)
         .font('Helvetica-Bold')
         .fillColor('#2B6CB0')
         .text(user.name || "Candidate", 0, 240, { align: 'center' });

      doc.fontSize(16)
         .fillColor('#2D3748')
         .font('Helvetica')
         .text('has successfully met all requirements and achieved a Job Readiness Score of', 0, 300, { align: 'center' });
         
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(`${readinessScore}%`, 0, 340, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica')
         .text(`for the role of ${targetRole}`, 0, 380, { align: 'center' });

      // Footer
      doc.fontSize(12)
         .text(`Certificate ID: ${certificateId}`, 50, 480)
         .text(`Issue Date: ${issueDate.toLocaleDateString()}`, 50, 500);
         
      // Draw QR Code
      doc.image(qrCodeBuffer, doc.page.width - 150, 430, { width: 100 });

      doc.end();

      stream.on('finish', async () => {
        // Save to Database
        const certificate = new Certificate({
          userId,
          name: user.name || "Candidate",
          targetRole,
          skillsCompleted: verifiedSkills,
          jobReadinessScore: readinessScore,
          certificateId,
          issueDate,
          pdfUrl
        });

        await certificate.save();
        resolve(certificate);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });

  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  }
};
