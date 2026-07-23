import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
    this.from = this.config.getOrThrow<string>('MAIL_FROM');
    this.frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  async sendVerificationEmail(to: string, token: string) {
    const link = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'تفعيل حسابك',
      html: `
        <div dir="rtl" style="font-family: sans-serif;">
          <h2>أهلاً بيك 👋</h2>
          <p>دوس على الزرار ده عشان تفعّل حسابك:</p>
          <a href="${link}" style="background:#4C6FFF;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">تفعيل الحساب</a>
          <p>الرابط صالح لمدة 24 ساعة.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl" style="font-family: sans-serif;">
          <h2>نسيت كلمة المرور؟</h2>
          <p>دوس على الزرار ده عشان تعمل كلمة مرور جديدة:</p>
          <a href="${link}" style="background:#4C6FFF;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">إعادة تعيين كلمة المرور</a>
          <p>لو ماكنتش طلبت ده، تجاهل الإيميل. الرابط صالح لمدة ساعة.</p>
        </div>
      `,
    });
  }
}
