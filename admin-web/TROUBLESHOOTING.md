# Admin Panel Troubleshooting Guide

## Common Issues and Solutions

### 1. Module Not Found Error: '../services/adminApi'

**Error Message:**
```
Module not found: Error: Can't resolve '../services/adminApi' in 'C:\...\admin-web\src\store\slices'
```

**Cause:** This error occurs when the React development server is running from the wrong directory or there are path resolution issues.

**Solutions:**

#### Solution 1: Complete Reset (Recommended)
```bash
# Use the reset script
cd admin-web
node reset-and-start.js

# Or on Windows
admin-web/reset-and-start.bat
```

#### Solution 2: Manual Reset
```bash
cd admin-web
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

#### Solution 3: Use Alternative Import Path
The imports have been updated to use a more reliable path:
```javascript
// Now using this import instead
import { adminApi } from '../services/api';
```

#### Solution 4: Verify File Structure
Make sure your directory structure looks like this:
```
admin-web/
├── src/
│   ├── services/
│   │   └── adminApi.js     ← This file must exist
│   ├── store/
│   │   └── slices/
│   │       ├── authSlice.js
│   │       └── adminSlice.js
│   └── ...
├── package.json
└── ...
```

#### Solution 5: Check Import Statements
Verify the import statements in the slice files:

**admin-web/src/store/slices/authSlice.js:**
```javascript
import { adminApi } from '../services/adminApi';  // ✅ Correct
```

**admin-web/src/store/slices/adminSlice.js:**
```javascript
import { adminApi } from '../services/adminApi';  // ✅ Correct
```

### 2. Port Already in Use

**Error Message:**
```
Something is already running on port 3000
```

**Solutions:**
```bash
# Option 1: Kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
PORT=3001 npm start
```

### 3. API Connection Issues

**Error Message:**
```
Network Error / CORS Error / 404 Not Found
```

**Solutions:**
1. **Check API URL in `.env` file:**
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

2. **Verify backend server is running on port 3001**

3. **Check browser console for specific errors**

### 4. Dependencies Issues

**Error Message:**
```
Module not found: Can't resolve '@mui/material'
```

**Solution:**
```bash
cd admin-web
npm install
```

### 5. Build Issues

**Error Message:**
```
Build failed / Compilation error
```

**Solutions:**
```bash
# Clear cache and reinstall
cd admin-web
rm -rf node_modules package-lock.json .next build
npm install
npm start
```

## Debug Commands

### Check File Existence
```bash
cd admin-web
ls -la src/services/adminApi.js  # Should exist
ls -la src/store/slices/         # Should contain authSlice.js and adminSlice.js
```

### Test Imports
```bash
cd admin-web
node debug-imports.js
```

### Verify Package.json
```bash
cd admin-web
cat package.json | grep "name"  # Should show: "pitchit-admin-web"
```

### Check Working Directory
```bash
pwd  # Should end with /admin-web when running npm start
```

## Environment Setup

### Required Files
- `admin-web/.env` - Environment variables
- `admin-web/package.json` - Dependencies
- `admin-web/src/services/adminApi.js` - API service

### Environment Variables
Create `admin-web/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/ws
GENERATE_SOURCEMAP=false
```

## Step-by-Step Verification

1. **Verify you're in the right directory:**
   ```bash
   cd admin-web
   pwd
   ```

2. **Check if all required files exist:**
   ```bash
   ls src/services/adminApi.js
   ls src/store/slices/authSlice.js
   ls src/store/slices/adminSlice.js
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open browser:**
   - Go to http://localhost:3000
   - Login with: admin@pitchit.com / admin123

## Still Having Issues?

If none of the above solutions work:

1. **Check the exact error message** in the browser console
2. **Verify Node.js version** (should be 16+ for React 18)
3. **Check npm version** (should be 8+)
4. **Try running from a different terminal/command prompt**
5. **Restart your computer** (sometimes helps with path issues)

## Contact Support

If you're still experiencing issues, please provide:
- Exact error message
- Operating system
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Directory structure (`ls -la admin-web/src/`)
- Working directory when running commands (`pwd`)