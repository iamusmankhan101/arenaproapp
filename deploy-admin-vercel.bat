@echo off
echo 🚀 Deploying Admin Web App to Vercel...

echo 📁 Navigating to admin-web directory...
cd admin-web

echo 🔧 Installing dependencies...
call npm install

echo 🏗️ Building the application...
call npm run build

echo 🌐 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment complete!
echo 📱 Your admin panel is now live on Vercel!

pause