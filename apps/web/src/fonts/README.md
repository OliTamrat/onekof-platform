# Fonts Directory

## Required Fonts

### SF Pro (for Latin scripts)
**Download:** https://developer.apple.com/fonts/
**Files needed:**
- `SF-Pro-Display-Light.woff2`
- `SF-Pro-Display-Regular.woff2`
- `SF-Pro-Display-Medium.woff2`
- `SF-Pro-Display-Semibold.woff2`
- `SF-Pro-Display-Bold.woff2`

**Alternative:** Currently using Inter from Google Fonts as fallback

### Abyssinica SIL (for Ge'ez scripts - Amharic, Tigrinya)
**Download:** https://software.sil.org/abyssinica/
**File needed:**
- `AbyssinicaSIL-Regular.woff2`

**Alternative:** Currently using Noto Sans Ethiopic from Google Fonts as fallback

## Current Status

The app is configured to use Google Fonts alternatives:
- **Inter** instead of SF Pro (very similar Apple-inspired font)
- **Noto Sans Ethiopic** instead of Abyssinica SIL

To upgrade to premium fonts:
1. Download the fonts from the URLs above
2. Convert to WOFF2 format if needed (use https://cloudconvert.com/)
3. Place files in this directory
4. Uncomment the local font loading in `app/layout.tsx`
