# Onekof Mobile — Session Briefing
> Last updated: April 26, 2026 — Resume after PC restart

---

## WHERE WE LEFT OFF

iOS TestFlight is working and confirmed stable:
- Offline banner fixed (NetInfo removed, state driven by apiFetch results)
- Notifications fixed (Prisma query now uses `project: { organizationId }`)
- OTA updates live on production channel

**Next priority: Android Play Store submission**

**Pick up here after restart:**
1. Resolve Google Play Console device verification (Android emulator with Play Store, or use BlueStacks)
2. Create Onekof app in Google Play Console
3. Set up Google Play service account → `google-play-service-account.json`
4. Run: `cd C:\Users\olita\onekof-platform\apps\mobile && eas submit --platform android --latest`

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
All changes committed. Last commit: `e1ed734` — Fix notifications 500
Branch: master

## WHAT WAS FIXED TODAY (2026-04-27)
- Vercel builds restored: `serverComponentsExternalPackages: ['expo-server-sdk','undici']` in next.config.mjs
- Metro crash on Windows fixed: `apps/mobile/metro.config.js` restricts watchFolders to mobile only
- Offline banner fixed: NetInfo removed from api.ts, online state driven by apiFetch results
- Notifications 500 fixed: `prisma.task.findMany()` now uses `project: { organizationId }` (Task has no direct organizationId)
- OTA updates configured and working on production channel
