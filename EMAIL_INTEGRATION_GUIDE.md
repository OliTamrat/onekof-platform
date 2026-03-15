# Email Integration Guide

This guide will help you set up email functionality for password resets and email verification.

---

## Quick Start (Recommended: Resend)

### 1. Create Resend Account
```bash
# 1. Go to https://resend.com
# 2. Sign up for free account (100 emails/day free)
# 3. Verify your email
```

### 2. Get API Key
```bash
# 1. Go to API Keys section
# 2. Create new API key
# 3. Copy the key (starts with "re_")
```

### 3. Configure Environment Variables
```bash
# Add to .env.local (development) or Vercel Environment Variables (production)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@onekof.com"  # or your verified domain
```

### 4. Install Resend Package
```bash
cd onekof-platform
pnpm add resend --filter web
```

### 5. Create Email Utility
Create `apps/web/src/lib/email.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@onekof.com',
      to: email,
      subject: 'Reset your OnekOf password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to continue:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@onekof.com',
      to: email,
      subject: 'Verify your OnekOf email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to OnekOf!</h2>
          <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@onekof.com',
      to: email,
      subject: 'Welcome to OnekOf!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to OnekOf, ${name}!</h2>
          <p>Your account has been successfully created and verified.</p>
          <p>You can now:</p>
          <ul>
            <li>Create and manage projects</li>
            <li>Track issues and tasks</li>
            <li>Manage budgets and expenses</li>
            <li>Collaborate with your team</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Go to Dashboard
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendAccountLockedEmail(email: string, unlockTime: Date) {
  const minutesRemaining = Math.ceil((unlockTime.getTime() - Date.now()) / (60 * 1000));

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@onekof.com',
      to: email,
      subject: 'OnekOf Account Locked - Security Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Security Alert: Account Locked</h2>
          <p>Your OnekOf account has been temporarily locked due to multiple failed login attempts.</p>
          <p><strong>Account will unlock in:</strong> ${minutesRemaining} minutes</p>
          <p style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            If this wasn't you, please contact support immediately at support@onekof.com
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated security notification.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send account locked email:', error);
  }
}
```

### 6. Update API Routes

Update `apps/web/src/app/api/auth/forgot-password/route.ts`:
```typescript
import { sendPasswordResetEmail } from '@/lib/email';

// Replace the TODO comment with:
await sendPasswordResetEmail(email, resetUrl);
```

Update `apps/web/src/app/api/auth/signup/route.ts`:
```typescript
import { sendVerificationEmail } from '@/lib/email';

// Replace the TODO comment with:
await sendVerificationEmail(email, verificationUrl);
```

Update `apps/web/src/lib/security/account-lockout.ts`:
```typescript
import { sendAccountLockedEmail } from '@/lib/email';

// In recordFailedLogin function, after account is locked:
await sendAccountLockedEmail(email, lockedUntil);
```

### 7. Test Email Sending

```bash
# Development mode: Emails will be logged to console
npm run dev

# Test password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check server console for email content (if in development)
# Check your email inbox (if in production with valid API key)
```

---

## Alternative Email Providers

### Option 2: SendGrid

```bash
# 1. Install package
pnpm add @sendgrid/mail --filter web

# 2. Environment variables
SENDGRID_API_KEY="SG.your_api_key"
EMAIL_FROM="noreply@onekof.com"

# 3. Create email utility (apps/web/src/lib/email.ts)
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM!,
    subject: 'Reset your OnekOf password',
    html: '...' // Same HTML as Resend example
  });
}
```

### Option 3: Amazon SES

```bash
# 1. Install AWS SDK
pnpm add @aws-sdk/client-ses --filter web

# 2. Environment variables
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="us-east-1"
EMAIL_FROM="noreply@onekof.com"

# 3. Create email utility
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION });

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const command = new SendEmailCommand({
    Source: process.env.EMAIL_FROM,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Reset your OnekOf password' },
      Body: { Html: { Data: '...' } }
    }
  });

  await sesClient.send(command);
}
```

---

## Email Templates

For better email design, consider using:
- [React Email](https://react.email) - Build emails with React
- [MJML](https://mjml.io) - Responsive email framework
- [Maizzle](https://maizzle.com) - Tailwind CSS for emails

Example with React Email:
```bash
# Install React Email
pnpm add react-email @react-email/components --filter web

# Create email template (apps/web/emails/password-reset.tsx)
import { Html, Button, Text } from '@react-email/components';

export default function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Text>Reset Your Password</Text>
      <Button href={resetUrl}>Reset Password</Button>
    </Html>
  );
}

# Render in your email utility
import { render } from '@react-email/render';
import PasswordResetEmail from '@/emails/password-reset';

const html = render(<PasswordResetEmail resetUrl={resetUrl} />);
```

---

## Testing Emails

### Development Testing

#### Option 1: Mailtrap (Recommended for Development)
```bash
# 1. Sign up at https://mailtrap.io (free)
# 2. Get SMTP credentials
# 3. Configure for development

# Using nodemailer + mailtrap
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your_username"
SMTP_PASS="your_password"
```

#### Option 2: MailHog (Local SMTP Server)
```bash
# 1. Install MailHog
brew install mailhog  # macOS
# or
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# 2. Configure SMTP
SMTP_HOST="localhost"
SMTP_PORT="1025"

# 3. View emails at http://localhost:8025
```

### Production Testing
```bash
# Test with real email address
# 1. Add your email to .env
# 2. Trigger password reset or signup
# 3. Check inbox
# 4. Verify email delivery and formatting
```

---

## Email Deliverability Best Practices

### 1. Domain Configuration
```bash
# Add these DNS records for better deliverability:

# SPF Record
TXT @ "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (provided by email service)
TXT resend._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@onekof.com"
```

### 2. Email Content Best Practices
- ✅ Use plain text alternative
- ✅ Avoid spam trigger words ("free", "guarantee", etc.)
- ✅ Include unsubscribe link (for marketing emails)
- ✅ Use professional from address
- ✅ Keep HTML simple (avoid complex CSS)
- ✅ Test on multiple email clients

### 3. Monitoring
- Monitor bounce rates
- Track open rates (if using tracking pixels)
- Monitor spam complaints
- Set up alerts for delivery failures

---

## Troubleshooting

### Emails Not Sending
1. Check API key is correct
2. Verify environment variables loaded
3. Check sender domain is verified
4. Review email service dashboard for errors
5. Check server logs for error messages

### Emails Going to Spam
1. Configure SPF, DKIM, DMARC records
2. Use verified sender domain
3. Avoid spam trigger words
4. Include plain text version
5. Warm up sender reputation gradually

### Email Delivery Delays
1. Check email service status page
2. Verify not hitting rate limits
3. Check queue status in dashboard
4. Consider using transactional email service

---

## Cost Considerations

### Resend Pricing
- **Free:** 100 emails/day, 3,000/month
- **Pro:** $20/month - 50,000 emails
- **Business:** Custom pricing

### SendGrid Pricing
- **Free:** 100 emails/day
- **Essentials:** $19.95/month - 50,000 emails
- **Pro:** $89.95/month - 100,000 emails

### Amazon SES Pricing
- **$0.10** per 1,000 emails
- Cheaper for high volume
- Requires more setup

---

## Next Steps

1. [ ] Choose email provider (Resend recommended)
2. [ ] Create account and get API key
3. [ ] Install package: `pnpm add resend --filter web`
4. [ ] Create `apps/web/src/lib/email.ts`
5. [ ] Update environment variables
6. [ ] Update API routes to send emails
7. [ ] Test email sending in development
8. [ ] Configure domain DNS records
9. [ ] Test in production
10. [ ] Monitor delivery rates

---

**Status:** Email integration ready to implement
**Recommended Provider:** Resend (easiest setup, generous free tier)
**Estimated Setup Time:** 30-60 minutes
