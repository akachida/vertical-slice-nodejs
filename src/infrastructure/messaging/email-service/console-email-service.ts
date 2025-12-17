import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'

export class ConsoleEmailService implements EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[EmailService] Sending welcome email to ${name} <${email}>`)
    return Promise.resolve()
  }
}
