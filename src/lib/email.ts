import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'madalincraciunica@gmail.com',
    pass: 'usoa nkbc yocx argr' // You'll need to generate an App Password in your Google Account
  }
});

interface EmailData {
  name: string;
  email: string;
  message: string;
}

export const sendEmail = async (data: EmailData) => {
  const mailOptions = {
    from: data.email,
    to: 'madalincraciunica@gmail.com',
    subject: `Contact Escortino.ro - ${data.name}`,
    text: `
Nume: ${data.name}
Email: ${data.email}

Mesaj:
${data.message}
    `,
    html: `
      <h2>Mesaj nou de la ${data.name}</h2>
      <p><strong>Email:</strong> ${data.email}</p>
      <br>
      <p><strong>Mesaj:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};