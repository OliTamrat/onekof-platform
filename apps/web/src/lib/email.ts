/**
 * Email Utility
 *
 * Provides email sending functionality for authentication and security notifications.
 * Uses Resend for production email delivery.
 *
 * Templates included:
 * - Password reset emails
 * - Email verification emails
 * - Welcome emails
 * - Account locked security alerts
 */

import { Resend } from 'resend';

// Initialize Resend client (only if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send password reset email with secure reset link
 *
 * @param email - User's email address
 * @param resetUrl - Secure password reset URL with token
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    // In development, log instead of sending (if no API key configured)
    if (!resend) {
      console.log('\n=== PASSWORD RESET EMAIL (Development Mode) ===');
      console.log('To:', email);
      console.log('Reset URL:', resetUrl);
      console.log('===============================================\n');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: email,
      subject: 'Password Reset Request for Your Onekof Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password - Onekof</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

                  <!-- Brand Header with Logo Space -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #0070f3 0%, #0053ba 100%);">
                      <div style="width: 60px; height: 60px; margin: 0 auto 20px; background-color: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px; font-weight: 700; color: #ffffff;">O</span>
                      </div>
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Onekof</h1>
                      <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">Project & Budget Management Platform</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <!-- Title Section -->
                        <tr>
                          <td style="padding: 40px 40px 20px;">
                            <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Password Reset Request</h2>
                          </td>
                        </tr>

                        <!-- Why You Received This -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <div style="padding: 16px; background-color: #f0f9ff; border-left: 4px solid #0070f3; border-radius: 6px;">
                              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0070f3; margin-bottom: 8px;">→ Why you received this email:</p>
                              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #4a4a4a;">
                                A password reset was requested for the Onekof account associated with <strong>${email}</strong>
                              </p>
                            </div>
                          </td>
                        </tr>

                        <!-- Main Message -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                              We received a request to reset the password for your Onekof account. To proceed with the password reset, please click the button below:
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                              <tr>
                                <td align="center">
                                  <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 2px 8px rgba(0,112,243,0.3);">
                                    Reset My Password
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin: 20px 0 0; font-size: 13px; line-height: 20px; color: #6b6b6b; text-align: center;">
                              Or copy and paste this secure link into your browser:
                            </p>
                            <p style="margin: 8px 0 0; font-size: 12px; line-height: 20px; color: #0070f3; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 6px; text-align: center;">
                              ${resetUrl}
                            </p>
                          </td>
                        </tr>

                        <!-- Security Notice - Critical -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <div style="padding: 20px; background-color: #fff5f5; border-left: 4px solid #ef4444; border-radius: 6px;">
                              <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #dc2626;">
                                ⬤ Important Security Information
                              </p>
                              <ul style="margin: 0; padding-left: 20px;">
                                <li style="margin: 8px 0; font-size: 14px; line-height: 20px; color: #4a4a4a;">
                                  This reset link will <strong>expire in 1 hour</strong> for your security
                                </li>
                                <li style="margin: 8px 0; font-size: 14px; line-height: 20px; color: #4a4a4a;">
                                  This link can only be used once
                                </li>
                                <li style="margin: 8px 0; font-size: 14px; line-height: 20px; color: #4a4a4a;">
                                  <strong>If you didn't request this:</strong> Your account may be at risk. Please change your password immediately or contact our support team
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        <!-- Didn't Request This? -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <div style="padding: 20px; background-color: #fefce8; border-left: 4px solid #eab308; border-radius: 6px;">
                              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #854d0e;">
                                ! Didn't request a password reset?
                              </p>
                              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #4a4a4a;">
                                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged. However, we recommend:
                              </p>
                              <ul style="margin: 8px 0 0; padding-left: 20px;">
                                <li style="margin: 6px 0; font-size: 13px; color: #4a4a4a;">Changing your password as a precaution</li>
                                <li style="margin: 6px 0; font-size: 13px; color: #4a4a4a;">Reviewing your account's recent activity</li>
                                <li style="margin: 6px 0; font-size: 13px; color: #4a4a4a;">Enabling two-factor authentication (coming soon)</li>
                              </ul>
                            </div>
                          </td>
                        </tr>

                        <!-- Promotional Section - Why Choose Onekof -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <div style="padding: 24px; background-color: #0070f3; border-radius: 8px;">
                              <p style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #ffffff; text-align: center;">
                                Why Teams Choose Onekof
                              </p>

                              <!-- Feature Card 1 -->
                              <div style="margin-bottom: 12px; padding: 18px; background-color: #ffffff; border-radius: 6px;">
                                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #0070f3;">Smart Budgeting</p>
                                <p style="margin: 0; font-size: 13px; color: #6b6b6b; line-height: 20px;">Track expenses in real-time with intelligent budget allocation and forecasting</p>
                              </div>

                              <!-- Feature Card 2 -->
                              <div style="margin-bottom: 12px; padding: 18px; background-color: #ffffff; border-radius: 6px;">
                                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #0070f3;">Team Collaboration</p>
                                <p style="margin: 0; font-size: 13px; color: #6b6b6b; line-height: 20px;">Work together seamlessly across departments with real-time updates</p>
                              </div>

                              <!-- Feature Card 3 -->
                              <div style="margin-bottom: 12px; padding: 18px; background-color: #ffffff; border-radius: 6px;">
                                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #0070f3;">Project Tracking</p>
                                <p style="margin: 0; font-size: 13px; color: #6b6b6b; line-height: 20px;">Never miss a deadline with smart reminders and progress tracking</p>
                              </div>

                              <!-- Feature Card 4 -->
                              <div style="margin-bottom: 0; padding: 18px; background-color: #ffffff; border-radius: 6px;">
                                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #0070f3;">Analytics & Reports</p>
                                <p style="margin: 0; font-size: 13px; color: #6b6b6b; line-height: 20px;">Data-driven insights for better decisions and strategic planning</p>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <!-- Need Help? -->
                        <tr>
                          <td style="padding: 0 40px 40px;">
                            <div style="text-align: center; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                              <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                                Need Help?
                              </p>
                              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #6b6b6b;">
                                Our support team is here to help you 24/7.<br>
                                Contact us at <a href="mailto:support@onekof.com" style="color: #0070f3; text-decoration: none; font-weight: 500;">support@onekof.com</a>
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #1a1a1a; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                      <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #9b9b9b; text-align: center;">
                        This is an automated security email from Onekof<br>
                        Please do not reply to this email
                      </p>
                      <p style="margin: 0; font-size: 11px; line-height: 16px; color: #6b6b6b; text-align: center;">
                        © ${new Date().getFullYear()} Onekof. All rights reserved.<br>
                        <a href="https://onekof.com/privacy" style="color: #6b6b6b; text-decoration: none;">Privacy Policy</a> ·
                        <a href="https://onekof.com/terms" style="color: #6b6b6b; text-decoration: none;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Send email verification email for new account signup
 *
 * @param email - User's email address
 * @param verificationUrl - Secure email verification URL with token
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  try {
    // In development, log instead of sending (if no API key configured)
    if (!resend) {
      console.log('\n=== EMAIL VERIFICATION (Development Mode) ===');
      console.log('To:', email);
      console.log('Verification URL:', verificationUrl);
      console.log('=============================================\n');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: email,
      subject: 'Verify your Onekof email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Welcome to Onekof!</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                        Thank you for creating an Onekof account. To get started, please verify your email address by clicking the button below:
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500; text-align: center;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b6b6b;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; font-size: 13px; line-height: 20px; color: #10b981; word-break: break-all;">
                        ${verificationUrl}
                      </p>

                      <!-- Features List -->
                      <div style="margin-top: 40px; padding: 20px; background-color: #f0fdf4; border-radius: 6px;">
                        <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #1a1a1a;">
                          Once verified, you'll be able to:
                        </p>
                        <ul style="margin: 0; padding-left: 20px;">
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Create and manage projects</li>
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Track issues and tasks</li>
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Manage budgets and expenses</li>
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Collaborate with your team</li>
                        </ul>
                      </div>

                      <!-- Security Info -->
                      <p style="margin: 30px 0 0; font-size: 12px; line-height: 18px; color: #9b9b9b;">
                        This verification link will expire in <strong>24 hours</strong>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9b9b9b; text-align: center;">
                        This is an automated email from Onekof. Please do not reply to this email.<br>
                        © ${new Date().getFullYear()} Onekof. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

/**
 * Send welcome email after successful email verification
 *
 * @param email - User's email address
 * @param name - User's name
 */
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    // In development, log instead of sending (if no API key configured)
    if (!resend) {
      console.log('\n=== WELCOME EMAIL (Development Mode) ===');
      console.log('To:', email);
      console.log('Name:', name);
      console.log('========================================\n');
      return;
    }

    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: email,
      subject: 'Welcome to Onekof!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Onekof</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Welcome to Onekof, ${name}!</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                        Your account has been successfully created and verified. You're all set to start managing your projects!
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500; text-align: center;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Features Grid -->
                      <div style="margin-top: 40px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                          What you can do with Onekof:
                        </h2>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 15px; background-color: #f0f9ff; border-radius: 6px;" width="48%">
                              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">📋 Project Management</p>
                              <p style="margin: 5px 0 0; font-size: 13px; color: #6b6b6b;">Create and organize projects with ease</p>
                            </td>
                            <td width="4%"></td>
                            <td style="padding: 15px; background-color: #fef3f2; border-radius: 6px;" width="48%">
                              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">🐛 Issue Tracking</p>
                              <p style="margin: 5px 0 0; font-size: 13px; color: #6b6b6b;">Track bugs and tasks efficiently</p>
                            </td>
                          </tr>
                          <tr><td colspan="3" style="height: 12px;"></td></tr>
                          <tr>
                            <td style="padding: 15px; background-color: #f0fdf4; border-radius: 6px;" width="48%">
                              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">💰 Budget Management</p>
                              <p style="margin: 5px 0 0; font-size: 13px; color: #6b6b6b;">Control expenses and budgets</p>
                            </td>
                            <td width="4%"></td>
                            <td style="padding: 15px; background-color: #fefce8; border-radius: 6px;" width="48%">
                              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">👥 Team Collaboration</p>
                              <p style="margin: 5px 0 0; font-size: 13px; color: #6b6b6b;">Work together seamlessly</p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Getting Started Tips -->
                      <div style="margin-top: 40px; padding: 20px; background-color: #fafafa; border-radius: 6px;">
                        <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #1a1a1a;">
                          Getting Started Tips:
                        </p>
                        <ol style="margin: 0; padding-left: 20px;">
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Complete your profile in Settings</li>
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Create your first project</li>
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Invite team members to collaborate</li>
                          <li style="margin: 8px 0; font-size: 14px; color: #4a4a4a;">Set up your first budget</li>
                        </ol>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9b9b9b; text-align: center;">
                        Need help? Visit our <a href="${dashboardUrl}/help" style="color: #0070f3; text-decoration: none;">Help Center</a><br>
                        © ${new Date().getFullYear()} Onekof. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
  }
}

/**
 * Send security alert when account is locked due to failed login attempts
 *
 * @param email - User's email address
 * @param unlockTime - Date when account will be automatically unlocked
 */
export async function sendAccountLockedEmail(email: string, unlockTime: Date) {
  const minutesRemaining = Math.ceil((unlockTime.getTime() - Date.now()) / (60 * 1000));

  try {
    // In development, log instead of sending (if no API key configured)
    if (!resend) {
      console.log('\n=== ACCOUNT LOCKED EMAIL (Development Mode) ===');
      console.log('To:', email);
      console.log('Unlock Time:', unlockTime.toISOString());
      console.log('Minutes Remaining:', minutesRemaining);
      console.log('===============================================\n');
      return;
    }

    const supportUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/support`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof Security <noreply@onekof.com>',
      to: email,
      subject: 'Onekof Account Locked - Security Alert',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Locked</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #dc2626;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                      <div style="display: inline-block; width: 64px; height: 64px; background-color: #fee2e2; border-radius: 50%; margin-bottom: 20px;">
                        <span style="display: block; font-size: 32px; line-height: 64px;">⚠️</span>
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #dc2626;">Security Alert: Account Locked</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                        Your Onekof account has been temporarily locked due to multiple failed login attempts.
                      </p>

                      <!-- Lockout Info -->
                      <div style="margin: 30px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 14px; color: #6b6b6b;">Account Status:</p>
                              <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #dc2626;">Temporarily Locked</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 14px; color: #6b6b6b;">Will unlock in:</p>
                              <p style="margin: 4px 0 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${minutesRemaining} minutes</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 14px; color: #6b6b6b;">Unlock time:</p>
                              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 500; color: #4a4a4a;">${unlockTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- What to Do -->
                      <div style="margin: 30px 0;">
                        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                          What should you do?
                        </h2>
                        <ul style="margin: 0; padding-left: 20px;">
                          <li style="margin: 10px 0; font-size: 14px; color: #4a4a4a;">
                            <strong>If this was you:</strong> Please wait ${minutesRemaining} minutes before trying to log in again.
                          </li>
                          <li style="margin: 10px 0; font-size: 14px; color: #4a4a4a;">
                            <strong>If this wasn't you:</strong> Your account may be at risk. Please change your password immediately after the lockout period ends.
                          </li>
                          <li style="margin: 10px 0; font-size: 14px; color: #4a4a4a;">
                            <strong>Need immediate access?</strong> Contact our support team for assistance.
                          </li>
                        </ul>
                      </div>

                      <!-- Security Tips -->
                      <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-radius: 6px;">
                        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                          Security Tips:
                        </h3>
                        <ul style="margin: 0; padding-left: 20px;">
                          <li style="margin: 8px 0; font-size: 13px; color: #4a4a4a;">Use a strong, unique password</li>
                          <li style="margin: 8px 0; font-size: 13px; color: #4a4a4a;">Never share your password with anyone</li>
                          <li style="margin: 8px 0; font-size: 13px; color: #4a4a4a;">Enable two-factor authentication (when available)</li>
                          <li style="margin: 8px 0; font-size: 13px; color: #4a4a4a;">Be cautious of phishing emails</li>
                        </ul>
                      </div>

                      <!-- Support CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${supportUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500; text-align: center;">
                              Contact Support
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9b9b9b; text-align: center;">
                        This is an automated security notification from Onekof.<br>
                        Please do not reply to this email.<br>
                        © ${new Date().getFullYear()} Onekof. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Account locked email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send account locked email:', error);
    // Don't throw - security alert email failure shouldn't block the lockout
  }
}

/**
 * Send team/organization invitation email
 *
 * @param email - Invitee's email address
 * @param inviterName - Name of the person who sent the invitation
 * @param organizationName - Name of the organization
 * @param invitationUrl - URL to accept the invitation
 * @param role - Role being offered
 */
export async function sendInvitationEmail(
  email: string,
  inviterName: string,
  organizationName: string,
  invitationUrl: string,
  role: string = 'Member'
) {
  try {
    if (!resend) {
      console.log('\n=== INVITATION EMAIL (Development Mode) ===');
      console.log('To:', email);
      console.log('From:', inviterName);
      console.log('Organization:', organizationName);
      console.log('Role:', role);
      console.log('Invitation URL:', invitationUrl);
      console.log('============================================\n');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: email,
      subject: `${inviterName} invited you to join ${organizationName} on Onekof`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You've been invited to ${organizationName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1C8C7D 0%, #15695E 100%);">
                      <div style="width: 60px; height: 60px; margin: 0 auto 20px; background-color: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px; font-weight: 700; color: #ffffff;">O</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">You're Invited!</h1>
                      <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">Join your team on Onekof</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                        <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong> on Onekof — a project and budget management platform.
                      </p>
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${invitationUrl}" style="display: inline-block; padding: 16px 40px; background-color: #1C8C7D; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 2px 8px rgba(28,140,125,0.3);">
                              Accept Invitation
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0; font-size: 13px; line-height: 20px; color: #6b6b6b; text-align: center;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; font-size: 12px; line-height: 20px; color: #1C8C7D; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 6px; text-align: center;">
                        ${invitationUrl}
                      </p>
                      <!-- Security Info -->
                      <div style="margin-top: 30px; padding: 16px; background-color: #fefce8; border-left: 4px solid #eab308; border-radius: 6px;">
                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #4a4a4a;">
                          This invitation will expire in <strong>7 days</strong>. If you didn't expect this invitation, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #1a1a1a; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                      <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #9b9b9b; text-align: center;">
                        This is an automated email from Onekof.<br>
                        Please do not reply to this email.
                      </p>
                      <p style="margin: 0; font-size: 11px; line-height: 16px; color: #6b6b6b; text-align: center;">
                        &copy; ${new Date().getFullYear()} Onekof. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`Invitation email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw error;
  }
}

/**
 * Send budget alert notification email
 *
 * @param email - User's email address
 * @param projectName - Name of the project
 * @param budgetName - Name or description of the budget
 * @param percentUsed - Percentage of budget used
 * @param dashboardUrl - Link to the budget dashboard
 */
export async function sendBudgetAlertEmail(
  email: string,
  projectName: string,
  budgetName: string,
  percentUsed: number,
  dashboardUrl: string
) {
  try {
    if (!resend) {
      console.log('\n=== BUDGET ALERT EMAIL (Development Mode) ===');
      console.log('To:', email);
      console.log('Project:', projectName);
      console.log('Budget:', budgetName);
      console.log('Usage:', `${percentUsed}%`);
      console.log('=============================================\n');
      return;
    }

    const severity = percentUsed >= 100 ? 'exceeded' : percentUsed >= 90 ? 'critical' : 'warning';
    const headerColor = severity === 'exceeded' ? '#dc2626' : severity === 'critical' ? '#ea580c' : '#eab308';
    const headerText = severity === 'exceeded'
      ? 'Budget Exceeded!'
      : severity === 'critical'
        ? 'Budget Almost Exhausted'
        : 'Budget Alert';

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: email,
      subject: `Budget Alert: ${projectName} — ${percentUsed}% used`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Budget Alert</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid ${headerColor};">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${headerColor};">${headerText}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                        The budget for <strong>${projectName}</strong> has reached <strong>${percentUsed}%</strong> utilization.
                      </p>
                      <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                        <table width="100%">
                          <tr>
                            <td style="font-size: 14px; color: #6b6b6b;">Project:</td>
                            <td style="font-size: 14px; font-weight: 600; color: #1a1a1a; text-align: right;">${projectName}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #6b6b6b; padding-top: 8px;">Budget:</td>
                            <td style="font-size: 14px; font-weight: 600; color: #1a1a1a; text-align: right; padding-top: 8px;">${budgetName}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #6b6b6b; padding-top: 8px;">Usage:</td>
                            <td style="font-size: 20px; font-weight: 700; color: ${headerColor}; text-align: right; padding-top: 8px;">${percentUsed}%</td>
                          </tr>
                        </table>
                      </div>
                      <!-- Progress bar -->
                      <div style="width: 100%; background-color: #e5e7eb; border-radius: 4px; height: 8px; margin: 20px 0;">
                        <div style="width: ${Math.min(percentUsed, 100)}%; background-color: ${headerColor}; border-radius: 4px; height: 8px;"></div>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1C8C7D; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                              View Budget Details
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9b9b9b; text-align: center;">
                        &copy; ${new Date().getFullYear()} Onekof. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`Budget alert email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send budget alert email:', error);
  }
}

/**
 * Check whether a user has opted in to receive a specific notification type.
 * Returns true if:
 * - The preference is not set (default-on)
 * - The preference is explicitly true
 * Returns false only when the user has explicitly toggled the preference off.
 *
 * This is the gate that makes the Settings → Notifications toggles actually
 * work. Call it before sending any non-transactional email.
 *
 * Transactional emails (password reset, email verification, account locked)
 * should NOT go through this gate — they're always sent.
 */
export async function userWantsNotification(
  userId: string,
  prefKey:
    | 'emailOnMention'
    | 'emailOnAssignment'
    | 'emailOnStatusChange'
    | 'emailOnComment'
    | 'emailOnDueDate'
    | 'emailWeeklySummary'
    | 'emailOnExpenseDecision'
    | 'emailOnExpenseSubmitted'
): Promise<boolean> {
  try {
    const { prisma } = await import('@onekof/database');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    if (!user) return false;

    const prefs = (user.preferences as any)?.notifications || {};
    // Default to true when preference is unset — opt-out model
    if (prefs[prefKey] === undefined) return true;
    return prefs[prefKey] !== false;
  } catch {
    // If we can't read prefs, default to sending (safer than silently
    // dropping notifications)
    return true;
  }
}

/**
 * Shared compact email template used by the notification helpers below.
 * Keeps the styled wrapper consistent while letting each notification supply
 * its own heading, body, and CTA.
 */
function buildNotificationEmail(params: {
  accentColor?: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footer?: string;
}): string {
  const accent = params.accentColor || '#1C8C7D';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.heading}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08);border-top:4px solid ${accent};">
        <tr><td style="padding:36px 40px 8px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#111827;">${params.heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#374151;">${params.body}</div>
        </td></tr>
        <tr><td style="padding:24px 40px 40px;">
          <a href="${params.ctaUrl}" style="display:inline-block;background-color:${accent};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">
            ${params.ctaLabel}
          </a>
        </td></tr>
        ${params.footer ? `<tr><td style="padding:16px 40px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#6b7280;">${params.footer}</p>
        </td></tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Notify an approver that a new expense was submitted for their review.
 */
export async function sendExpenseSubmittedEmail(params: {
  to: string;
  approverName?: string | null;
  submitterName: string;
  expenseTitle: string;
  amount: number;
  currency: string;
  budgetName: string;
  expenseUrl: string;
}) {
  try {
    if (!resend) {
      console.log('\n=== EXPENSE SUBMITTED EMAIL (dev) ===');
      console.log('To:', params.to);
      console.log('From:', params.submitterName);
      console.log('Expense:', params.expenseTitle, `${params.amount} ${params.currency}`);
      console.log('Budget:', params.budgetName);
      console.log('======================================\n');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: params.to,
      subject: `New expense pending your approval: ${params.expenseTitle}`,
      html: buildNotificationEmail({
        heading: 'Expense awaiting your approval',
        body: `
          <p>Hi ${params.approverName || 'there'},</p>
          <p><strong>${params.submitterName}</strong> has submitted a new expense that needs your review:</p>
          <div style="margin:16px 0;padding:16px;background-color:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
            <div style="font-weight:600;color:#111827;margin-bottom:4px;">${params.expenseTitle}</div>
            <div style="font-size:13px;color:#6b7280;">Budget: ${params.budgetName}</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;color:#1C8C7D;">${params.amount.toLocaleString()} ${params.currency}</div>
          </div>
        `,
        ctaLabel: 'Review expense',
        ctaUrl: params.expenseUrl,
        footer: 'You received this because you are an approver on this budget. Manage notification preferences in your Onekof settings.',
      }),
    });
    console.log(`Expense submitted email sent to ${params.to}`);
  } catch (error) {
    console.error('Failed to send expense submitted email:', error);
  }
}

/**
 * Notify the submitter that their expense was approved or rejected.
 */
export async function sendExpenseDecisionEmail(params: {
  to: string;
  submitterName?: string | null;
  decision: 'APPROVED' | 'REJECTED';
  expenseTitle: string;
  amount: number;
  currency: string;
  budgetName: string;
  decidedByName: string;
  reason?: string | null;
  expenseUrl: string;
}) {
  try {
    if (!resend) {
      console.log(`\n=== EXPENSE ${params.decision} EMAIL (dev) ===`);
      console.log('To:', params.to);
      console.log('Expense:', params.expenseTitle);
      console.log('Decided by:', params.decidedByName);
      if (params.reason) console.log('Reason:', params.reason);
      console.log('======================================\n');
      return;
    }

    const isApproved = params.decision === 'APPROVED';
    const accent = isApproved ? '#1C8C7D' : '#dc2626';
    const headline = isApproved
      ? 'Your expense was approved'
      : 'Your expense was rejected';

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: params.to,
      subject: `${isApproved ? 'Approved' : 'Rejected'}: ${params.expenseTitle}`,
      html: buildNotificationEmail({
        accentColor: accent,
        heading: headline,
        body: `
          <p>Hi ${params.submitterName || 'there'},</p>
          <p><strong>${params.decidedByName}</strong> has ${isApproved ? 'approved' : 'rejected'} your expense:</p>
          <div style="margin:16px 0;padding:16px;background-color:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
            <div style="font-weight:600;color:#111827;margin-bottom:4px;">${params.expenseTitle}</div>
            <div style="font-size:13px;color:#6b7280;">Budget: ${params.budgetName}</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;color:${accent};">${params.amount.toLocaleString()} ${params.currency}</div>
          </div>
          ${params.reason ? `<p style="margin:16px 0 0;padding:12px;background-color:#fef2f2;border-left:3px solid #dc2626;border-radius:4px;font-size:13px;color:#991b1b;"><strong>Reason:</strong> ${params.reason}</p>` : ''}
        `,
        ctaLabel: 'View expense',
        ctaUrl: params.expenseUrl,
      }),
    });
    console.log(`Expense ${params.decision.toLowerCase()} email sent to ${params.to}`);
  } catch (error) {
    console.error('Failed to send expense decision email:', error);
  }
}

/**
 * Notify a user that they were mentioned in a comment.
 */
export async function sendMentionEmail(params: {
  to: string;
  mentionedName?: string | null;
  authorName: string;
  taskKey: string;
  taskTitle: string;
  commentSnippet: string;
  taskUrl: string;
}) {
  try {
    if (!resend) {
      console.log('\n=== MENTION EMAIL (dev) ===');
      console.log('To:', params.to);
      console.log('From:', params.authorName);
      console.log('Task:', params.taskKey, params.taskTitle);
      console.log('===========================\n');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: params.to,
      subject: `${params.authorName} mentioned you in ${params.taskKey}`,
      html: buildNotificationEmail({
        heading: `${params.authorName} mentioned you`,
        body: `
          <p>Hi ${params.mentionedName || 'there'},</p>
          <p><strong>${params.authorName}</strong> mentioned you in a comment on <strong>${params.taskKey}</strong> — ${params.taskTitle}:</p>
          <blockquote style="margin:16px 0;padding:12px 16px;background-color:#f9fafb;border-left:3px solid #1C8C7D;border-radius:4px;font-size:14px;color:#374151;font-style:italic;">
            ${params.commentSnippet}
          </blockquote>
        `,
        ctaLabel: 'Reply on task',
        ctaUrl: params.taskUrl,
        footer: 'Manage your mention notifications in Onekof settings.',
      }),
    });
    console.log(`Mention email sent to ${params.to}`);
  } catch (error) {
    console.error('Failed to send mention email:', error);
  }
}

/**
 * Notify a user that they were assigned to a task.
 */
export async function sendTaskAssignmentEmail(params: {
  to: string;
  assigneeName?: string | null;
  assignerName: string;
  taskKey: string;
  taskTitle: string;
  taskDescription?: string | null;
  priority?: string | null;
  dueDate?: Date | null;
  taskUrl: string;
}) {
  try {
    if (!resend) {
      console.log('\n=== TASK ASSIGNMENT EMAIL (dev) ===');
      console.log('To:', params.to);
      console.log('Assigned by:', params.assignerName);
      console.log('Task:', params.taskKey, params.taskTitle);
      console.log('===================================\n');
      return;
    }

    const dueDateText = params.dueDate
      ? `Due ${new Date(params.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Onekof <noreply@onekof.com>',
      to: params.to,
      subject: `You were assigned to ${params.taskKey}: ${params.taskTitle}`,
      html: buildNotificationEmail({
        heading: 'You have a new task',
        body: `
          <p>Hi ${params.assigneeName || 'there'},</p>
          <p><strong>${params.assignerName}</strong> assigned you to a task:</p>
          <div style="margin:16px 0;padding:16px;background-color:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
            <div style="font-size:12px;color:#6b7280;font-family:monospace;margin-bottom:4px;">${params.taskKey}</div>
            <div style="font-weight:600;font-size:16px;color:#111827;margin-bottom:8px;">${params.taskTitle}</div>
            ${params.taskDescription ? `<div style="font-size:13px;color:#6b7280;margin-bottom:8px;line-height:1.5;">${params.taskDescription.slice(0, 200)}${params.taskDescription.length > 200 ? '...' : ''}</div>` : ''}
            <div style="display:flex;gap:12px;font-size:12px;color:#6b7280;">
              ${params.priority ? `<span><strong>Priority:</strong> ${params.priority}</span>` : ''}
              ${dueDateText ? `<span>${dueDateText}</span>` : ''}
            </div>
          </div>
        `,
        ctaLabel: 'Open task',
        ctaUrl: params.taskUrl,
        footer: 'You received this because a team member assigned you to this task.',
      }),
    });
    console.log(`Task assignment email sent to ${params.to}`);
  } catch (error) {
    console.error('Failed to send task assignment email:', error);
  }
}
