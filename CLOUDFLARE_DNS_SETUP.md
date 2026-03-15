# ☁️ Cloudflare DNS Configuration for Onekof Multi-Tenant Setup

## ✅ Status: Vercel Configuration Complete

**Wildcard domain successfully added to Vercel!**
- ✅ `onekof.com` → Already configured
- ✅ `www.onekof.com` → Already configured
- ✅ `*.onekof.com` → **Just added!**

---

## 🔧 DNS Configuration Required

You're currently using **Cloudflare** for DNS management. Follow these steps to complete the setup:

### Step 1: Login to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your `onekof.com` domain
3. Click on **DNS** in the left sidebar

---

### Step 2: Configure DNS Records

Add/verify these DNS records in Cloudflare:

#### A. Main Domain (Already Configured)

| Type | Name | Target | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| A | `@` | `76.76.21.21` | ☁️ Proxied (Orange Cloud) | Auto |
| CNAME | `www` | `cname.vercel-dns.com` | ☁️ Proxied | Auto |

#### B. Wildcard Subdomain (NEW - Add This)

| Type | Name | Target | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| A | `*` | `76.76.21.21` | ⚪ **DNS Only** (Gray Cloud) | Auto |

**CRITICAL:** For the wildcard record (`*`), you **MUST** set Proxy Status to **DNS Only** (gray cloud icon). If it's proxied (orange cloud), it won't work correctly with Vercel.

---

### Step 3: Click the Proxy Status Toggle

When adding/editing the wildcard record:

1. Click the **orange cloud icon** ☁️ next to the record
2. It should turn **gray** ⚪ (DNS Only)
3. Save the record

**Why?** Cloudflare's proxy conflicts with Vercel's subdomain routing when proxied. DNS Only mode is required for wildcard subdomains.

---

## 📋 Detailed Cloudflare Instructions

### Adding the Wildcard A Record

1. **In Cloudflare DNS dashboard**, click **"Add record"**

2. **Fill in the form:**
   ```
   Type:    A
   Name:    *
   IPv4:    76.76.21.21
   Proxy:   DNS Only (gray cloud - click to toggle)
   TTL:     Auto
   ```

3. **Click "Save"**

4. **Verify** the record appears in your DNS table with:
   - Name: `*` or `*.onekof.com`
   - Points to: `76.76.21.21`
   - Status: **DNS Only** (gray cloud ⚪)

---

## 🎯 Alternative: CNAME Record (Not Recommended for Wildcard)

If you prefer CNAME (not recommended for wildcard):

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | `*` | `cname.vercel-dns.com` | DNS Only | Auto |

**Note:** A record is more reliable for wildcard subdomains.

---

## ⏱️ DNS Propagation Timeline

After adding the wildcard record:

- **Cloudflare CDN**: Instant to 5 minutes
- **Global DNS**: 5-30 minutes typically
- **Worst case**: Up to 48 hours

**Tip:** Use [DNS Checker](https://dnschecker.org/) to verify propagation:
- Check: `*.onekof.com` points to `76.76.21.21`
- Check multiple locations worldwide

---

## ✅ Verification Steps

### 1. Check DNS Resolution

Open terminal and run:

```bash
# Check wildcard resolves
nslookup ministry-water-irrigation.onekof.com

# Should return: 76.76.21.21

# Check another subdomain
nslookup olink-tech.onekof.com

# Should also return: 76.76.21.21
```

### 2. Test in Browser

After DNS propagates, test these URLs:

```
https://ministry-water-irrigation.onekof.com
https://olink-tech.onekof.com
https://adwa-digital.onekof.com
```

**Expected result:** Each should load the Onekof login page or dashboard.

### 3. Verify in Vercel CLI

```bash
cd onekof-platform
vercel domains inspect "*.onekof.com"
```

**Look for:** No warnings about misconfiguration.

---

## 🚨 Common Issues & Solutions

### Issue 1: "This site can't be reached"

**Cause:** DNS not propagated yet
**Solution:** Wait 5-30 minutes, clear browser cache, try again

### Issue 2: Cloudflare Error 1000

**Cause:** Wildcard domain is set to "Proxied" (orange cloud)
**Solution:** Change to "DNS Only" (gray cloud) in Cloudflare

### Issue 3: SSL Certificate Error

**Cause:** Cloudflare Universal SSL conflicts with Vercel
**Solution:**
1. In Cloudflare → SSL/TLS → Overview
2. Set to **"Full"** or **"Full (strict)"**
3. Or disable Cloudflare proxy for wildcard (DNS Only)

### Issue 4: 404 on Subdomains

**Cause:** Middleware not detecting subdomain
**Solution:** Check browser console for errors, verify `x-organization-slug` header is set

---

## 🎨 Current DNS Configuration (After Setup)

Your complete DNS records should look like:

```
Type    Name    Target                   Proxy Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A       @       76.76.21.21              ☁️ Proxied
CNAME   www     cname.vercel-dns.com     ☁️ Proxied
A       *       76.76.21.21              ⚪ DNS Only ← NEW
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check Cloudflare DNS page** - Verify records are correct
2. **Check Vercel Dashboard** - Settings → Domains → Look for green checkmarks
3. **Wait for propagation** - Can take up to 30 minutes
4. **Test with curl**:
   ```bash
   curl -I https://ministry-water-irrigation.onekof.com
   ```

---

## 🎉 Success Indicators

You'll know it's working when:

✅ No warnings in `vercel domains inspect "*.onekof.com"`
✅ All subdomains resolve to `76.76.21.21`
✅ You can access `https://ministry-water-irrigation.onekof.com/auth/signin`
✅ Each organization has its own isolated dashboard

---

## 🚀 Next Steps After DNS Propagation

1. **Test login** at each org subdomain
2. **Verify data isolation** - Switch between orgs, ensure separate data
3. **Create users** for other organizations (Olink Tech, Adwa Digital)
4. **Monitor** Vercel deployment logs for any subdomain routing issues

---

## 📝 Quick Reference Card

**What you need in Cloudflare:**

```
Add new DNS record:
├─ Type: A
├─ Name: *
├─ IPv4: 76.76.21.21
├─ Proxy: ⚪ DNS Only (MUST be gray cloud)
└─ TTL: Auto
```

**Time to completion:** 5-30 minutes after DNS configuration

---

**Last Updated:** Auto-generated during Vercel configuration
**Domain Status:** Wildcard domain added, awaiting DNS configuration
**Action Required:** Add the wildcard A record in Cloudflare DNS
