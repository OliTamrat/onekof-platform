# SF Pro Font Installation Guide

## Required Fonts for Onekof

### SF Pro (Apple)

**Download from:** https://developer.apple.com/fonts/

#### Files needed for Display variant:
1. `SF-Pro-Display-Light.woff2`
2. `SF-Pro-Display-Regular.woff2`
3. `SF-Pro-Display-Medium.woff2`
4. `SF-Pro-Display-Semibold.woff2`
5. `SF-Pro-Display-Bold.woff2`

#### Files needed for Text variant:
1. `SF-Pro-Text-Light.woff2`
2. `SF-Pro-Text-Regular.woff2`
3. `SF-Pro-Text-Medium.woff2`
4. `SF-Pro-Text-Semibold.woff2`
5. `SF-Pro-Text-Bold.woff2`

### Abyssinica SIL (for Ethiopic)

**Download from:** https://software.sil.org/abyssinica/download/

#### File needed:
1. `AbyssinicaSIL-Regular.woff2`

## Installation Steps

1. Download SF Pro from Apple Developer (requires free Apple ID)
2. Download Abyssinica SIL from SIL website
3. If fonts are in TTF/OTF format, convert to WOFF2 using: https://cloudconvert.com/
4. Place all .woff2 files in this directory (`apps/web/src/fonts/`)
5. Restart the development server: `pnpm dev`

## Current Status

Until SF Pro is installed, the app uses system fallback fonts:
- `-apple-system` (on macOS/iOS)
- `BlinkMacSystemFont` (on Chrome/macOS)
- `Segoe UI` (on Windows)
- `Roboto` (on Android)

These provide excellent quality while you download the official fonts.

## Verification

Once fonts are installed, you can verify by:
1. Opening DevTools → Elements
2. Inspecting any text element
3. Check Computed styles → font-family
4. Should show: "SF Pro Display" or "SF Pro Text"
