# Production Security Upgrade Guide for Government Launch

## Current Status (Testing Phase)
**SSL/TLS Mode:** Flexible
**Security Level:** Medium
**Issue:** Traffic between Cloudflare and Vercel is unencrypted (HTTP)
**Acceptable for:** Testing and development
**NOT acceptable for:** Government contracts and sensitive data

---

## Required Upgrade for Government/Production Launch

### Why This Matters
Government projects require **end-to-end encryption**:
- User → Cloudflare: HTTPS ✅ (Currently encrypted)
- Cloudflare → Vercel: **HTTP ❌** (Currently unencrypted)
- **Required:** Both connections must use HTTPS

### Steps to Upgrade to Full Encryption

#### Option A: Vercel-Managed SSL Certificates (Recommended)

**Step 1: Configure Cloudflare DNS**
1. Go to Cloudflare DNS Records
2. Find the wildcard record: `*` → `cname.vercel-dns.com`
3. Click the **orange cloud** to make it **gray** (DNS only, not proxied)
4. Save changes

**Step 2: Wait for Vercel SSL Certificate**
- Vercel will automatically issue SSL certificate for `*.onekof.com`
- This can take **15 minutes to 24 hours**
- Check status: `vercel certs ls` (should show `*.onekof.com` certificate)

**Step 3: Test SSL is Working**
```bash
curl -I https://ministry-water-irrigation.onekof.com
# Should return HTTP 200 or 307 (not SSL errors)
```

**Step 4: Update Cloudflare Encryption Mode**
1. Cloudflare → SSL/TLS → Overview
2. Change encryption mode from **Flexible** to **Full (strict)**
3. Save changes

**Step 5: Verify End-to-End Encryption**
```bash
curl -I https://ministry-water-irrigation.onekof.com/dashboard
# Should work without any SSL errors
```

---

#### Option B: Cloudflare Advanced Certificate Manager (ACM)

If Vercel SSL issuance fails, use Cloudflare's ACM:

**Requirements:**
- Cloudflare plan with ACM access
- Ability to issue wildcard certificates

**Steps:**
1. Activate Advanced Certificate Manager in Cloudflare
2. Issue wildcard certificate: `*.onekof.com`
3. Keep wildcard DNS record proxied (orange cloud)
4. Change encryption mode to **Full** (not Flexible)
5. Configure Cloudflare Origin Server certificate for Vercel

**Cost:** May require Cloudflare Business plan ($200/month)

---

## Security Checklist for Government Launch

- [ ] SSL/TLS encryption mode: **Full (strict)**
- [ ] Wildcard certificate issued for `*.onekof.com`
- [ ] End-to-end encryption verified (both hops HTTPS)
- [ ] HSTS enabled in Cloudflare
- [ ] TLS version set to 1.2 minimum
- [ ] Test all organization subdomains work with HTTPS
- [ ] No mixed content warnings in browser console
- [ ] Certificate expiration monitoring enabled
- [ ] Security audit completed

---

## Testing Commands

### Check DNS Resolution
```bash
nslookup ministry-water-irrigation.onekof.com
```

### Check SSL Certificate
```bash
curl -vI https://ministry-water-irrigation.onekof.com 2>&1 | grep -i "ssl\|tls\|certificate"
```

### List Vercel Certificates
```bash
cd onekof-platform
vercel certs ls
```

### Force Vercel Certificate Issuance
```bash
vercel certs issue *.onekof.com onekof.com
```

---

## Timeline Estimate

**Quick upgrade (2-4 hours):**
- Change Cloudflare to gray cloud (DNS only)
- Wait for Vercel certificate
- Change to Full (strict) mode
- Test all subdomains

**If issues occur (up to 48 hours):**
- DNS propagation delays
- Certificate verification issues
- May need to contact Vercel support

---

## Contact Information for Support

**Vercel Support:** support@vercel.com
**Cloudflare Support:** https://dash.cloudflare.com/?to=/:account/support

---

## Notes

- Current setup is **temporary for testing only**
- Schedule upgrade **at least 1 week before** government contract demos
- Test thoroughly in staging environment first
- Document all changes and keep backup of DNS settings
- Inform stakeholders of brief downtime during upgrade (5-10 minutes)

---

**Last Updated:** March 7, 2026
**Current Environment:** Production Testing (Flexible SSL)
**Target:** Government-Grade Security (Full Strict SSL)
