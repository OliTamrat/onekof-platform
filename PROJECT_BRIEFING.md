# Onekof Mobile — Session Briefing
> Last updated: April 26, 2026 — Resume after PC restart

---

## WHERE WE LEFT OFF

Android Studio is installed and a Pixel 6 emulator (API 33) was booting.
Goal: Use the emulator to verify Google Play developer account.

**Pick up here after restart:**
1. Open Android Studio → Device Manager → Start Pixel 6 emulator
2. Sign in to Google with `olitamrat@gmail.com` on the emulator
3. Install **Google Play Console** app from Play Store on the emulator
4. Go to play.google.com/console → verify Android device
5. After verification → create Onekof app in Play Console
6. Run: `cd C:\Users\olita\onekof-platform\apps\mobile && eas submit --platform android --latest`

---

## WHAT WAS COMPLETED TODAY

### Mobile App Enhancements
- **Dashboard header redesign** — SafeArea fills status bar (no black gap), teal accent layer, date chip, org pill with double-ring dot + border, greeting bumped to 26px, sub-greeting brighter
- **Bell badge** — fetches unread count from `/api/notifications`, shows red badge
- **Avatar ring** — 2px teal border around avatar
- **Offline startup fix** — session cached in AsyncStorage, users stay logged in offline
- **AI document analyzer** — receipt/invoice scanner with line item extraction, vendor info, confidence score, document detail modal
- **Notification error state** — shows error UI instead of silently failing
- **Issues offline fallback** — empty list instead of crash when offline
- **Fixed missing styles** in documents.tsx (aiStatsRow, aiBanner, modals)
- **Fixed bad icon** in notifications.tsx (check-double → check)

### App Store Submission Prep
- **Delete Account** — API endpoint (DELETE /api/auth/mobile/me) + UI in settings with double-confirm (Apple mandatory)
- **Privacy Policy link** → onekof.com/privacy (confirmed live, 200)
- **Terms of Service link** → onekof.com/terms (confirmed live, 200)
- **google-services.json** — Firebase project `onekof-pm-840af` linked for Android FCM
- **Icons verified** — all 1024×1024 (icon, adaptive-icon, splash)
- **onekof.com confirmed live** — 405 on GET = server running
- **.easignore created** — reduces future upload size

### Store Metadata
- Full App Store + Play Store copy written → `STORE_METADATA.md`
- Reviewer demo account seeded → `reviewer@onekof.com` / `ReviewOnekof2026!`
- 12 pre-populated tasks in "Onekof Demo" org

### Builds & Submissions
- **iOS production build** — submitted to TestFlight (build 3, version 1.0.0)
  - Build: https://expo.dev/accounts/olink/projects/onekof/builds/c295977c-f2f4-4dfe-9e6b-3aded75242cd
  - TestFlight: https://appstoreconnect.apple.com/apps/6763942879/testflight/ios
- **Android production build** — compiled, ready to submit
  - Build: https://expo.dev/accounts/olink/projects/onekof/builds/aafe7391-325c-4676-ac38-8693eb86c9ae
  - AAB: https://expo.dev/artifacts/eas/n7F4ZbcJnocvGqAASv42Xd.aab
  - **Blocked on**: Google Play developer account device verification

### Config Updates
- `eas.json` — added submit profile with ASC App ID `6763942879`
- `google-services.json` — committed for Android FCM
- `.easignore` — created to reduce upload size

---

## REMAINING TASKS

| # | Task | Status |
|---|---|---|
| 1 | Verify Android device in Google Play Console (emulator) | In progress |
| 2 | Create Onekof app in Google Play Console | Pending |
| 3 | Set up Google Play service account for `eas submit` | Pending |
| 4 | Submit Android build to Google Play internal track | Pending |
| 5 | Add yourself as TestFlight internal tester (iOS) | Pending |
| 6 | Screenshots — 6.7" iPhone + Android phone | Pending |
| 7 | Fill App Store listing metadata | Pending |
| 8 | Submit for App Store Review | Pending |
| 9 | Submit for Google Play Review | Pending |

---

## KEY CREDENTIALS & IDs

| Item | Value |
|---|---|
| Apple ASC App ID | 6763942879 |
| Apple Bundle ID | com.dapsanalytics.onekof |
| Apple Team | VMU339WDA5 (Oli T. Oli Individual) |
| EAS Project ID | de51f86c-459c-4330-83df-7b481b9e9740 |
| EAS Owner | olink |
| Firebase Project | onekof-pm-840af |
| Android Package | com.dapsanalytics.onekof |
| Play Console Account | olitamrat@gmail.com |
| Reviewer email | reviewer@onekof.com |
| Reviewer password | ReviewOnekof2026! |

---

## KEY COMMANDS TO REMEMBER

```powershell
# Start mobile dev server
cd C:\Users\olita\onekof-platform\apps\mobile
npx expo start

# Build iOS production
eas build --platform ios --profile production

# Build Android production
eas build --platform android --profile production

# Submit iOS to TestFlight
eas submit --platform ios --latest

# Submit Android to Play Store
eas submit --platform android --latest
```

---

## GIT STATUS
All changes committed. Last commit: `d2cbac8` — Add .easignore
Branch: master
