# PlanFlow - iOS Schedule & Health PWA

PlanFlow is a daily schedule planner designed to look, feel, and function like a native iOS app on iPhone without requiring Swift, Xcode, or App Store approval.

Built with **React 19 + TypeScript + Vite + Tailwind CSS**, it is ready to be hosted directly on **GitHub Pages** and installed to your iPhone home screen via Safari.

---

## Features

- 📱 **Native iOS Feel & Safe Area Support**: Optimized for the Dynamic Island, notch, and home bar indicator with frosted glass styling and standalone display mode.
- ⏱️ **Interactive Daily Schedule**: Hour-by-hour time blocking with custom categories (Work, Health, Routine, Personal, Rest).
- ❤️ **Apple Health Integration**: Connects with Apple Health via an iOS Shortcuts URL bridge (`shortcuts://run-shortcut`) to sync Steps, Sleep, Active Energy, and Water without native Swift code.
- 🔔 **iOS Alarms & Alerts**:
  - Direct 1-tap Apple Calendar (`.ics`) sync with `VALARM` native alerts.
  - Native iOS Clock Alarm deep-linking via iOS Shortcuts.
  - Web Push Notification API for standalone iOS PWAs (iOS 16.4+).
  - In-app Web Audio synthesizer chimes.
- 📴 **Offline Ready**: Built-in Service Worker via `vite-plugin-pwa` caches all static assets for instant offline loading.

---

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Deploying to GitHub Pages

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of PlanFlow PWA"
   ```
2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. Enable GitHub Pages in your repo:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
   - The `.github/workflows/deploy.yml` workflow will automatically build and publish your app.

---

## Installing on your iPhone

1. Open your deployed GitHub Pages URL in **Safari** on your iPhone.
2. Tap the **Share** button (box with an arrow pointing up) at the bottom.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right.
5. Open **PlanFlow** from your home screen. It will open full-screen like a native app!

---

## Setting Up the Apple Health Shortcut

In the **Health** tab, tap **Sync** > **Setup Recipe**:
1. Open the **Shortcuts** app on iOS and tap `+`.
2. Name the shortcut `PlanFlowHealthSync`.
3. Add **Find Health Samples** for Steps, Sleep, and Active Energy.
4. Format the output into text or JSON and add **Open URLs** targeting your PlanFlow URL.
5. *(Optional)* Set up an iOS **Personal Automation** in the Shortcuts app to run this shortcut automatically every morning at 8:00 AM!

