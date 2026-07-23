# 🔐 OAuth Setup Guide for Onekof

This guide will help you configure OAuth providers (Google, GitHub, Microsoft, Apple) for Onekof.

---

## 🚨 Why OAuth Isn't Working

The error you're seeing: `client_id is required` means that OAuth providers need to be configured with API credentials from each platform. This is a security requirement - you can't use OAuth without registering your application with each provider.

---

## ✅ Quick Setup Checklist

- [ ] Google OAuth (Easiest - Start Here)
- [ ] GitHub OAuth (Easy)
- [ ] Microsoft OAuth (Moderate)
- [ ] Apple OAuth (Most Complex - Optional for MVP)

---

## 1️⃣ Google OAuth Setup (10 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it "Onekof" → Click "Create"
4. Wait for project to be created

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" → Click "Create"
3. Fill in:
   - **App name**: Onekof
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click "Save and Continue"
5. Skip "Scopes" → Click "Save and Continue"
6. Skip "Test users" → Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name: "Onekof Web"
5. Add Authorized redirect URIs:
   ```
   http://localhost:3005/api/auth/callback/google
   ```
6. Click "Create"
7. **Copy** the Client ID and Client Secret

### Step 5: Add to .env File

Open `onekof-platform/apps/web/.env` and add:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### Step 6: Restart Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
cd onekof-platform/apps/web
PORT=3005 pnpm dev
```

### ✅ Test Google Login

1. Go to `http://localhost:3005/auth/signin`
2. Click "Google" button
3. You should be redirected to Google login!

---

## 2️⃣ GitHub OAuth Setup (5 minutes)

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name**: Onekof
   - **Homepage URL**: `http://localhost:3005`
   - **Authorization callback URL**: `http://localhost:3005/api/auth/callback/github`
4. Click "Register application"

### Step 2: Generate Client Secret

1. Click "Generate a new client secret"
2. **Copy** the Client ID and Client Secret immediately (secret only shows once!)

### Step 3: Add to .env File

```env
# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Step 4: Restart Server & Test

Restart the dev server and try GitHub login!

---

## 3️⃣ Microsoft OAuth Setup (15 minutes)

### Step 1: Register App in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for "Azure Active Directory" or "Microsoft Entra ID"
3. Click "App registrations" → "New registration"
4. Fill in:
   - **Name**: Onekof
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**:
     - Platform: Web
     - URI: `http://localhost:3005/api/auth/callback/azure-ad`
5. Click "Register"

### Step 2: Create Client Secret

1. In your app, go to "Certificates & secrets"
2. Click "New client secret"
3. Description: "Onekof Dev"
4. Expires: 24 months
5. Click "Add"
6. **Copy the Value** immediately (shows only once!)

### Step 3: Get Application IDs

1. Go to "Overview" tab
2. Copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### Step 4: Add to .env File

```env
# Microsoft OAuth
AZURE_AD_CLIENT_ID="your-application-client-id"
AZURE_AD_CLIENT_SECRET="your-client-secret-value"
AZURE_AD_TENANT_ID="your-directory-tenant-id"
```

### Step 5: Configure API Permissions (Optional but Recommended)

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Delegated permissions"
5. Add: `User.Read`, `email`, `profile`, `openid`
6. Click "Add permissions"

### Step 6: Restart Server & Test

---

## 4️⃣ Apple OAuth Setup (Advanced - Optional)

Apple Sign In requires:
- Apple Developer Account ($99/year)
- More complex setup with certificates
- Additional configuration

**Recommendation**: Skip Apple OAuth for MVP. Focus on Google and GitHub first.

If you still want to set it up:
1. [Apple Developer Portal](https://developer.apple.com/)
2. Follow [NextAuth Apple Provider Docs](https://next-auth.js.org/providers/apple)

---

## 🔧 Update NextAuth Configuration

After adding OAuth credentials, make sure your NextAuth config includes the providers.

Open `onekof-platform/apps/web/src/lib/auth.ts` or wherever NextAuth is configured, and verify providers are set up:

```typescript
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    // ... other providers
  ],
  // ... rest of config
}
```

---

## 🌐 Production Setup (Later)

When deploying to production, you'll need to:

### For All Providers:

1. **Add Production Redirect URIs**:
   ```
   https://yourdomain.com/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/github
   https://yourdomain.com/api/auth/callback/azure-ad
   ```

2. **Update Environment Variables** in your hosting platform (Vercel/Netlify)

3. **Google**: Verify domain ownership
4. **Microsoft**: May need to configure additional redirect URIs
5. **GitHub**: Update homepage URL to production domain

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Redirect URI Mismatch"
- Check that redirect URI in provider matches exactly (including http vs https)
- Make sure port number matches (3005 in our case)

#### 2. "Invalid Client ID"
- Check `.env` file has correct values
- Ensure no extra spaces or quotes
- Restart dev server after changing `.env`

#### 3. OAuth Still Not Working
- Clear browser cookies/cache
- Check browser console for errors
- Check server logs (terminal where dev server is running)
- Verify all providers are enabled in their respective dashboards

#### 4. Environment Variables Not Loading
- Make sure `.env` file is in `apps/web/` directory
- File should be named exactly `.env` (not `.env.local` for NextAuth)
- Restart the dev server completely

---

## ✅ Verification Checklist

After setup, verify each provider:

- [ ] Google OAuth button shows and works
- [ ] GitHub OAuth button shows and works
- [ ] Microsoft OAuth button shows and works
- [ ] After OAuth login, user is redirected to dashboard
- [ ] User data (name, email) is saved correctly
- [ ] OAuth login creates account if user doesn't exist
- [ ] OAuth login signs in if user already exists

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Guide](https://next-auth.js.org/providers/google)
- [GitHub OAuth Guide](https://next-auth.js.org/providers/github)
- [Microsoft OAuth Guide](https://next-auth.js.org/providers/azure-ad)

---

## 💡 Pro Tips

1. **Start with Google** - It's the easiest and most commonly used
2. **Test in Incognito** - Helps avoid caching issues
3. **Use Test Accounts** - Don't use your primary email during development
4. **Save Credentials** - Store Client IDs and Secrets securely
5. **Documentation** - Each provider has limits and quotas - check their docs

---

## 🚀 Quick Start (TL;DR)

1. Set up Google OAuth (10 mins)
2. Add credentials to `.env`
3. Restart dev server
4. Test login at `http://localhost:3005/auth/signin`
5. Move on to next provider or start building features!

---

**Need Help?** Check the error logs in your terminal where the dev server is running. Most issues are related to:
- Missing environment variables
- Incorrect redirect URIs
- Not restarting the server after adding credentials

---

**Last Updated**: March 1, 2026
