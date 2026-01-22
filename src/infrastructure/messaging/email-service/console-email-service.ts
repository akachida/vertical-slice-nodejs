import { EmailService } from '@/infrastructure/messaging/interfaces/email-service'

/**
 * Console-based implementation of EmailService.
 * Logs email content to stdout instead of sending actual emails.
 * Useful for development and testing environments.
 */
export class ConsoleEmailService implements EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[EmailService] Sending welcome email to ${name} <${email}>`)
    return Promise.resolve()
  }
}
