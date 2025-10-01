import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationCode(email: string, code: string, name?: string): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like SendGrid, AWS SES, or Nodemailer
      // For now, we'll just log the code to the console
      this.logger.log(`📧 Verification code for ${email}: ${code}`);
      
      // Mock email sending - in production, replace with actual email service
      const emailContent = this.generateEmailTemplate(code, name);
      this.logger.log(`Email content: ${emailContent}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification code to ${email}:`, error);
      return false;
    }
  }

  private generateEmailTemplate(code: string, name?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Multi-Model AI Playground</h2>
        ${name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
        <p>Your verification code is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Multi-Model AI Playground Team
        </p>
      </div>
    `;
  }
}
