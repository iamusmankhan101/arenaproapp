# 🚀 START HERE - Admin Panel Quick Start

## ⚠️ IMPORTANT: Directory Location

**You MUST run the admin panel from the `admin-web` directory, NOT from the main project directory.**

## 🎯 Quick Start (3 Steps)

### Step 1: Open Terminal/Command Prompt
```bash
# Navigate to the admin-web directory
cd admin-web

# Verify you're in the right place
pwd
# Should show: .../your-project/admin-web
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 3: Start the Admin Panel
```bash
npm start
```

## 🌐 Access the Admin Panel

1. Open your browser
2. Go to: http://localhost:3000
3. Login with:
   - **Email**: admin@pitchit.com
   - **Password**: admin123

## 🔧 If You Get Errors

### "Module not found" Error?
```bash
# Complete reset (recommended)
cd admin-web
rm -rf node_modules package-lock.json
npm install
npm start
```

### Wrong Directory Error?
Make sure your terminal shows you're in the `admin-web` directory:
```bash
pwd
# Should end with: /admin-web
```

### Port 3000 Already in Use?
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
PORT=3001 npm start
```

## 📁 Correct Directory Structure

Your terminal should be here:
```
your-project/
├── src/                    ← Main mobile app
├── admin-web/              ← YOU ARE HERE
│   ├── src/
│   ├── package.json
│   └── ...
└── ...
```

## 🆘 Still Having Issues?

1. **Check you're in the right directory**: `pwd` should end with `/admin-web`
2. **Clear everything and start fresh**:
   ```bash
   cd admin-web
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   npm start
   ```
3. **Restart your terminal/command prompt**
4. **Make sure Node.js version is 16+**: `node --version`

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ "Compiled successfully!" in terminal
- ✅ Browser opens to http://localhost:3000
- ✅ Login page appears
- ✅ No "Module not found" errors

---

**Remember**: Always run `npm start` from the `admin-web` directory, not from the main project directory!