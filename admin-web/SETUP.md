# PitchIt Web Admin Panel Setup

## Quick Start

1. **Navigate to the admin-web directory:**
   ```bash
   cd admin-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Login with: `admin@pitchit.com` / `admin123`

## Troubleshooting

### Module Not Found Errors

If you see errors like "Can't resolve '../services/adminApi'":

**🔧 Quick Fix:**
```bash
# Make sure you're in the admin-web directory
cd admin-web
pwd  # Should show: .../your-project/admin-web

# Clean install
rm -rf node_modules package-lock.json
npm install
npm start
```

**🚀 Use Startup Scripts:**
```bash
# From project root
node admin-web/start-admin.js

# Or on Windows
admin-web/start-admin.bat

# Or use the automated setup
node setup-admin.js
```

**📁 Verify File Structure:**
```
admin-web/
├── src/
│   ├── services/
│   │   └── adminApi.js     ← Must exist
│   └── store/slices/
│       ├── authSlice.js
│       └── adminSlice.js
└── package.json
```

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

### Port Already in Use

If port 3000 is already in use:

1. **Kill the process using port 3000:**
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # On Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. **Or use a different port:**
   ```bash
   PORT=3001 npm start
   ```

### API Connection Issues

1. **Check API URL in `.env` file:**
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

2. **Make sure backend server is running on port 3001**

3. **Check browser console for CORS errors**

## File Structure

```
admin-web/
├── public/
├── src/
│   ├── components/
│   │   └── Layout.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── BookingsPage.js
│   │   ├── VenuesPage.js
│   │   ├── CustomersPage.js
│   │   ├── ReportsPage.js
│   │   └── SettingsPage.js
│   ├── services/
│   │   └── adminApi.js
│   ├── store/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       └── adminSlice.js
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the `admin-web` directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/ws
GENERATE_SOURCEMAP=false
```

## Development vs Production

### Development
- API URL: `http://localhost:3001/api`
- WebSocket URL: `ws://localhost:3001/ws`
- Source maps enabled for debugging

### Production
- API URL: `https://api.pitchit.com/api`
- WebSocket URL: `wss://api.pitchit.com/ws`
- Optimized build with minification

## Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Deployment

### Static Hosting (Netlify, Vercel)
1. Build the project: `npm run build`
2. Upload the `build` folder
3. Set environment variables in hosting platform

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Common Issues

### 1. Import/Export Errors
- Make sure all imports use correct paths
- Check that exports match imports (default vs named)

### 2. Redux Store Issues
- Verify store configuration in `src/store/store.js`
- Check that all slices are properly imported

### 3. API Connection Problems
- Verify backend server is running
- Check CORS configuration on backend
- Ensure API endpoints match documentation

### 4. Authentication Issues
- Check localStorage for admin token
- Verify token format and expiration
- Test login endpoint manually

## Support

For issues specific to the web admin panel:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure you're in the correct directory
4. Check that backend API is running

For general project issues, refer to the main project README.