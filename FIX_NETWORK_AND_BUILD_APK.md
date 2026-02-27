# 🚀 Fix Network Issue & Build APK - Complete Guide

## ✅ MapScreen Fixed!
Google Maps has been restored in MapScreen. Your app will now work properly.

---

## 🔧 Step 1: Fix Network Issue

### Error You're Seeing:
```
request to https://api.expo.dev/graphql failed
reason: getaddrinfo EAI_AGAIN api.expo.dev
```

### What This Means:
Your computer cannot resolve the DNS for `api.expo.dev`. This is a network/DNS issue.

---

## 🎯 Solution 1: Flush DNS Cache (Try This First!)

### Windows Command:
```cmd
ipconfig /flushdns
ipconfig /registerdns
```

### Then Test:
```cmd
ping api.expo.dev
```

If ping works, proceed to build APK!

---

## 🎯 Solution 2: Change DNS to Google DNS

### Steps:
1. Open **Control Panel** → **Network and Internet** → **Network Connections**
2. Right-click your network adapter (WiFi or Ethernet) → **Properties**
3. Select **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**
4. Select **Use the following DNS server addresses:**
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
5. Click **OK** and close all windows

### Restart Network Adapter:
```cmd
# Disable and re-enable your network adapter
# Or restart your computer
```

### Test Again:
```cmd
ping api.expo.dev
nslookup api.expo.dev
```

---

## 🎯 Solution 3: Use Mobile Hotspot

If your ISP/network blocks Expo:
1. Enable mobile hotspot on your phone
2. Connect your computer to the hotspot
3. Retry the build

---

## 🎯 Solution 4: Use VPN

If Expo is blocked in your region:
1. Install a VPN (ProtonVPN, Windscribe, etc.)
2. Connect to VPN
3. Retry the build

---

## 🎯 Solution 5: Check Firewall

Make sure Windows Firewall allows:
1. Open **Windows Security** → **Firewall & network protection**
2. Click **Allow an app through firewall**
3. Make sure **Node.js** and your terminal are allowed
4. If not, click **Change settings** → **Allow another app** → Add Node.js

---

## 📊 Diagnostic Commands

### Test DNS Resolution:
```cmd
nslookup api.expo.dev
nslookup api.expo.dev 8.8.8.8
```

If second command works but first doesn't = DNS issue

### Test Network Connectivity:
```cmd
ping google.com
ping 8.8.8.8
ping api.expo.dev
```

### Test HTTPS Access:
```cmd
curl https://api.expo.dev
```

Or in PowerShell:
```powershell
Invoke-WebRequest -Uri https://api.expo.dev
```

---

## 🚀 Step 2: Build APK (When Network Works)

### Make Sure You're Logged In:
```bash
eas login
```

### Build Command:
```bash
eas build --profile preview --platform android
```

### What Happens:
1. EAS uploads your project to Expo servers
2. Expo builds your APK in the cloud
3. You get a download link when done (15-30 minutes)

---

## ✅ Verification Checklist

Before building, verify:
- [ ] `ping api.expo.dev` works
- [ ] `nslookup api.expo.dev` returns an IP
- [ ] You're logged into EAS (`eas whoami`)
- [ ] MapScreen is fixed (Google Maps restored)

---

## 🎯 Quick Fix Summary

**Most Common Solution:**
1. Flush DNS: `ipconfig /flushdns`
2. Change DNS to 8.8.8.8 and 8.8.4.4
3. Test: `ping api.expo.dev`
4. Build: `eas build --profile preview --platform android`

---

## 📝 Expected Build Output

When network works, you'll see:
```
✔ Logged in as [your-email]
✔ Project: arena-pro
✔ Uploading project...
✔ Build started
✔ Build in progress...
```

Build takes 15-30 minutes. You'll get a download link when done.

---

## 🔍 Still Not Working?

### Check Expo Status:
Visit: https://status.expo.dev/

### Try Different Network:
- Mobile hotspot
- Different WiFi
- VPN
- Different location

### Wait and Retry:
Sometimes Expo servers are busy. Wait 10-15 minutes and try again.

---

## 💡 Pro Tips

1. **DNS is usually the culprit** - Change to Google DNS (8.8.8.8)
2. **Flush DNS after changing** - `ipconfig /flushdns`
3. **Test before building** - `ping api.expo.dev` should work
4. **Use mobile hotspot** if all else fails

---

## 🎉 When Build Succeeds

You'll get:
- Download link for APK
- QR code to download on device
- Build logs

Download the APK and install on your device to test!

---

## 📞 Need Help?

If network issue persists:
1. Check your ISP isn't blocking Expo
2. Try VPN
3. Try from different network
4. Check https://status.expo.dev/ for outages

The build WILL work once network is stable! 🚀
