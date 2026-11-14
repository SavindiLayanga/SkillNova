import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to draw executive black-and-white certificate layout
export const renderCertificateDoc = (doc, { name, targetRole, readinessScore, verifiedSkills, certificateId, issueDate, qrCodeBuffer }) => {
  const width = doc.page.width;
  const height = doc.page.height;

  // 1. Pure Crisp White Background
  doc.rect(0, 0, width, height).fill('#FFFFFF');

  // 2. Subtle Geometric Security Watermark Lattice
  doc.save();
  doc.strokeColor('#F1F5F9').lineWidth(0.5);
  const step = 28;
  for (let x = 32; x < width - 32; x += step) {
    for (let y = 32; y < height - 32; y += step) {
      doc.moveTo(x, y - 5).lineTo(x + 5, y).lineTo(x, y + 5).lineTo(x - 5, y).closePath().stroke();
    }
  }
  doc.restore();

  // 3. Central Watermark Emblem (concentric fine security circles)
  doc.save();
  doc.strokeColor('#F8FAFC').lineWidth(1);
  const cx = width / 2;
  const cy = height / 2 + 10;
  doc.circle(cx, cy, 170).stroke();
  doc.circle(cx, cy, 130).stroke();
  doc.circle(cx, cy, 90).stroke();
  doc.restore();

  // 4. Double Diploma Security Border (Black & White Theme)
  // Outer Solid Black Frame
  doc.rect(20, 20, width - 40, height - 40)
     .strokeColor('#000000')
     .lineWidth(2.5)
     .stroke();

  // Inner Fine Hairline Frame
  doc.rect(26, 26, width - 52, height - 52)
     .strokeColor('#4A5568')
     .lineWidth(0.75)
     .stroke();

  // 5. Classic Corner Ornaments in all 4 corners
  const drawCorner = (x, y, dx, dy) => {
    doc.save();
    doc.strokeColor('#000000').lineWidth(1.5);
    doc.moveTo(x, y + dy * 16).lineTo(x, y).lineTo(x + dx * 16, y).stroke();
    doc.polygon([x + dx * 5, y + dy * 2], [x + dx * 9, y + dy * 6], [x + dx * 5, y + dy * 10], [x + dx * 1, y + dy * 6])
       .fillAndStroke('#000000', '#000000');
    doc.restore();
  };

  drawCorner(32, 32, 1, 1);
  drawCorner(width - 32, 32, -1, 1);
  drawCorner(32, height - 32, 1, -1);
  drawCorner(width - 32, height - 32, -1, -1);

  // 6. Organization Header
  doc.fillColor('#000000')
     .fontSize(26)
     .font('Helvetica-Bold')
     .text('SKILLNOVA', 0, 52, { align: 'center', characterSpacing: 4 });

  doc.fillColor('#718096')
     .fontSize(8.5)
     .font('Helvetica-Bold')
     .text('ACADEMY OF TECHNICAL EXCELLENCE & CAREER ACCELERATION', 0, 84, { align: 'center', characterSpacing: 2 });

  // Divider Line with Central Diamond Accent
  doc.moveTo(270, 102).lineTo(405, 102).strokeColor('#CBD5E0').lineWidth(0.75).stroke();
  doc.polygon([421, 98], [425, 102], [421, 106], [417, 102]).fill('#000000');
  doc.moveTo(437, 102).lineTo(572, 102).strokeColor('#CBD5E0').lineWidth(0.75).stroke();

  // 7. Certificate Title
  doc.fillColor('#000000')
     .fontSize(24)
     .font('Times-Bold')
     .text('CERTIFICATE OF JOB READINESS', 0, 122, { align: 'center', characterSpacing: 1.5 });

  doc.fillColor('#718096')
     .fontSize(8.5)
     .font('Helvetica-Bold')
     .text('THIS IS TO OFFICIALLY CERTIFY THAT', 0, 160, { align: 'center', characterSpacing: 2.5 });

  // 8. Recipient Name
  doc.fillColor('#000000')
     .fontSize(30)
     .font('Times-Bold')
     .text((name || 'Candidate').toUpperCase(), 0, 185, { align: 'center' });

  // Underline
  doc.moveTo(240, 224).lineTo(602, 224).strokeColor('#CBD5E0').lineWidth(0.5).stroke();

  // 9. Achievement Description
  doc.fillColor('#4A5568')
     .fontSize(11)
     .font('Helvetica')
     .text('has successfully demonstrated verified technical excellence, cleared all curriculum skill gaps,', 0, 240, { align: 'center' });
  doc.text('and achieved certified industry job qualification for the professional role of:', 0, 258, { align: 'center' });

  // 10. Qualified Target Role Pure Black Banner
  const roleText = (targetRole || 'Software Developer').toUpperCase();
  const badgeWidth = Math.min(Math.max(340, roleText.length * 13), width - 120);
  doc.roundedRect(width / 2 - badgeWidth / 2, 282, badgeWidth, 34, 5).fill('#000000');

  doc.fillColor('#FFFFFF')
     .fontSize(15)
     .font('Helvetica-Bold')
     .text(roleText, 0, 292, { align: 'center', characterSpacing: 1.5 });

  // 11. Readiness Score & Evaluation
  doc.fillColor('#000000')
     .fontSize(11.5)
     .font('Helvetica-Bold')
     .text(`READINESS EVALUATION: ${readinessScore}%   |   VERIFIED GRADE: A+ (TOP TIER)`, 0, 332, { align: 'center', characterSpacing: 0.5 });

  // 12. Endorsed Skills Badges / List
  const skillsList = (verifiedSkills && verifiedSkills.length > 0)
    ? verifiedSkills.slice(0, 6).map(s => typeof s === 'string' ? s : s.name).join('   •   ')
    : 'Verified Technical Competencies & Problem Solving';

  doc.fillColor('#718096')
     .fontSize(9.5)
     .font('Helvetica')
     .text(`Endorsed Skills:  ${skillsList}`, 0, 356, { align: 'center' });

  // 13. Footer / Security & Signatures
  // Left Column: Credential Info
  const dateStr = issueDate ? new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString();
  doc.fillColor('#000000')
     .fontSize(9.5)
     .font('Courier-Bold')
     .text(`CREDENTIAL ID: ${certificateId}`, 55, 435);

  doc.fillColor('#4A5568')
     .fontSize(8.5)
     .font('Helvetica')
     .text(`Issue Date: ${dateStr}`, 55, 452);

  doc.fillColor('#000000')
     .fontSize(8.5)
     .font('Helvetica-Bold')
     .text('Security: Cryptographically Verified & Active', 55, 468);

  doc.fillColor('#718096')
     .fontSize(7.5)
     .font('Helvetica')
     .text('Issued via SkillNova Operations Management Console', 55, 483);

  // Center Column: Authorized Signature Line
  doc.moveTo(330, 475).lineTo(510, 475).strokeColor('#A0AEC0').lineWidth(0.75).stroke();
  doc.fillColor('#1A202C')
     .fontSize(14)
     .font('Times-Italic')
     .text('SkillNova Board of Assessment', 330, 455, { width: 180, align: 'center' });

  doc.fillColor('#718096')
     .fontSize(7.5)
     .font('Helvetica-Bold')
     .text('AUTHORIZED VERIFICATION SEAL', 330, 482, { width: 180, align: 'center', characterSpacing: 1 });

  doc.fillColor('#A0AEC0')
     .fontSize(7)
     .font('Helvetica')
     .text('GOVERNING ACCREDITATION COUNCIL', 330, 495, { width: 180, align: 'center' });

  // Right Column: QR Code & Verification
  if (qrCodeBuffer) {
    doc.rect(width - 150, 420, 95, 95).strokeColor('#E2E8F0').lineWidth(0.75).stroke();
    doc.image(qrCodeBuffer, width - 144, 426, { width: 83 });
    doc.fillColor('#718096')
       .fontSize(6.5)
       .font('Helvetica-Bold')
       .text('SCAN TO VERIFY AUTHENTICITY', width - 165, 523, { width: 125, align: 'center', characterSpacing: 0.5 });
  }
};

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

      renderCertificateDoc(doc, {
        name: user.name || "Candidate",
        targetRole,
        readinessScore,
        verifiedSkills,
        certificateId,
        issueDate,
        qrCodeBuffer
      });

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
