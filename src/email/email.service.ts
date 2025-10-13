import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    
    console.log('🔧 Email Service Configuration:');
    console.log('SMTP_USER:', smtpUser ? '✅ Set' : '❌ Not set');
    console.log('SMTP_PASS:', smtpPass ? '✅ Set' : '❌ Not set');
    
    // Only create transporter if credentials are provided
    if (smtpUser && smtpPass && smtpUser !== 'your-email@gmail.com' && smtpPass !== 'your-app-password') {
      try {
        this.transporter = createTransport({
          host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
          port: this.configService.get<number>('SMTP_PORT', 587),
          secure: false, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        console.log('✅ SMTP transporter created successfully');
      } catch (error) {
        console.error('❌ Failed to create SMTP transporter:', error.message);
        this.transporter = null;
      }
    } else {
      console.warn('⚠️  SMTP credentials not properly configured. Email service will log to console instead.');
    }
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM', 'noreply@easykey.com'),
      to: email,
      subject: 'EasyKey - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to EasyKey!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account with EasyKey, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      if (this.transporter) {
        console.log('📤 Attempting to send verification email to:', email);
        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully!');
        console.log('Message ID:', result.messageId);
      } else {
        // Fallback for development - log to console
        console.log('\n📧 VERIFICATION EMAIL (Development Mode)');
        console.log('=====================================');
        console.log(`To: ${email}`);
        console.log(`Subject: EasyKey - Email Verification Code`);
        console.log(`Verification Code: ${code}`);
        console.log('=====================================\n');
      }
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      console.error('Error details:', error);
      
      // In development, don't throw error, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 VERIFICATION EMAIL (Fallback due to error)');
        console.log('=====================================');
        console.log(`To: ${email}`);
        console.log(`Subject: EasyKey - Email Verification Code`);
        console.log(`Verification Code: ${code}`);
        console.log('=====================================\n');
      } else {
        throw new Error('Failed to send verification email');
      }
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM', 'noreply@easykey.com'),
      to: email,
      subject: 'Welcome to EasyKey!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to EasyKey!</h2>
          <p>Hi ${name},</p>
          <p>Your email has been successfully verified! You can now enjoy all the features of EasyKey.</p>
          
          <p>If you have any questions, feel free to contact our support team.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully to:', email);
      } else {
        console.log('📧 Welcome email would be sent to:', email);
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }
}
