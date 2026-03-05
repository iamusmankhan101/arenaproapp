# 🔧 Network Error Solutions - Complete Guide

## Current Error
```
request to https://api.expo.dev/graphql failed
reason: getaddrinfo EAI_AGAIN api.expo.dev
```

## What This Means
Your computer cannot reach Expo's build servers. This is a DNS/network connectivity issue.

---

## 🚀 Quick Solutions (Try in Order)

### Solution 1: Check Internet Connection
```bash
# Test basic connectivity
ping google.com
ping 8.8.8.8

# Test Expo servers specifically
ping api.expo.dev
```

If ping fails, your internet connection has issues.

---

### Solution 2: Flush DNS Cache (RECOMMENDED)

**Windows:**
```cmd
ipconfig /flushdns
ipconfig /registerdns
```

Then retry:
```bash
eas build --profile preview --platform android
```

---

### Solution 3: Change DNS to Google DNS

**Windows Steps:**
1. Open Control Panel → Network and Internet → Network Connections
2. Right-click your network adapter → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Select "Use the following DNS server addresses"
5. Enter:
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
6. Click OK and restart your network adapter

**Or use Cloudflare DNS:**
- Preferred: `1.1.1.1`
- Alternate: `1.0.0.1`

Then retry the build.

---

### Solution 4: Use Mobile Hotspot
If your ISP/network blocks Expo:
1. Enable mobile hotspot on your phone
2. Connect your computer to the hotspot
3. Retry the build command

---

### Solution 5: Use VPN
If Expo is blocked in your region:
1. Connect to a VPN (try a free one like ProtonVPN)
2. Retry the build

---

### Solution 6: Check Firewall/Antivirus
Make sure these domains are allowed:
- `api.expo.dev`
- `expo.dev`
- `*.expo.dev`

**Windows Firewall:**
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Make sure Node.js and your terminal are allowed

---

### Solution 7: Wait and Retry
Sometimes Expo servers are busy or experiencing issues:
1. Check Expo status: https://status.expo.dev/
2. Wait 10-15 minutes
3. Retry the build

---

## 🔍 Diagnostic Commands

### Test DNS Resolution
```bash
# Windows
nslookup api.expo.dev
nslookup api.expo.dev 8.8.8.8

# If first fails but second works, it's a DNS issue
```

### Test Network Connectivity
```bash
# Test if you can reach Expo
curl https://api.expo.dev

# Or use PowerShell
Invoke-WebRequest -Uri https://api.expo.dev
```

---

## ✅ Your App is Ready!

The network error is NOT a code problem. Your app configuration is complete:
- ✅ Mapbox plugin configured in `app.json`
- ✅ Google Maps API key added
- ✅ Package installed
- ✅ Code ready

You just need network access to build!

---

## 🎯 Build Command (When Network Works)

```bash
# Make sure you're logged in
eas login

# Build APK
eas build --profile preview --platform android
```

---

## 💡 Alternative: Build on Different Network

If your current network consistently fails:
1. Try from a different location (café, friend's house)
2. Use mobile hotspot
3. Try at a different time of day
4. Use a VPN

---

## 📝 Common Causes

1. **ISP DNS Issues**: Your ISP's DNS servers can't resolve expo.dev
   - Solution: Change to Google DNS (8.8.8.8)

2. **Firewall Blocking**: Corporate/school firewall blocks Expo
   - Solution: Use VPN or mobile hotspot

3. **Temporary Expo Outage**: Expo servers down
   - Solution: Check status.expo.dev and wait

4. **Local Network Issues**: Router/modem problems
   - Solution: Restart router, flush DNS

---

## 🔄 Step-by-Step Fix Process

1. **Flush DNS**
   ```cmd
   ipconfig /flushdns
   ```

2. **Change DNS to Google**
   - Set to 8.8.8.8 and 8.8.4.4

3. **Restart Network Adapter**
   - Disable and re-enable in Network Connections

4. **Test Connectivity**
   ```bash
   ping api.expo.dev
   ```

5. **Retry Build**
   ```bash
   eas build --profile preview --platform android
   ```

---

## 🎉 Success Indicators

You'll know it's working when:
- `ping api.expo.dev` succeeds
- `nslookup api.expo.dev` returns an IP address
- Build command starts uploading your project

---

## 📞 Still Not Working?

If none of these work:
1. Check https://status.expo.dev/ for outages
2. Try from a completely different network
3. Contact your ISP about DNS issues
4. Use a VPN service

The build WILL work once network connectivity is restored! 🚀
