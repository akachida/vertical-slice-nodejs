/**
 * Interface for email delivery services.
 * Implementations handle the actual email sending mechanism.
 */
export interface EmailService {
  /**
   * Sends a welcome email to a newly registered user.
   * @param email - Recipient's email address
   * @param name - Recipient's display name for personalization
   */
  sendWelcomeEmail(email: string, name: string): Promise<void>
}
