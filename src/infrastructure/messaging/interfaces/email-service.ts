export interface EmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>
}
