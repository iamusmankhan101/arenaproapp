/**
 * APK Configuration Checker
 * Checks for common APK build issues before debugging
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking APK Configuration...\n');

const issues = [];
const warnings = [];
const success = [];

// 1. Check app.json
console.log('📱 Checking app.json...');
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Check Android permissions
    if (appJson.expo?.android?.permissions) {
      success.push('✅ Android permissions are configured');
      console.log('   Permissions:', appJson.expo.android.permissions.join(', '));
    } else {
      warnings.push('⚠️  No Android permissions specified in app.json');
    }
    
    // Check package name
    if (appJson.expo?.android?.package) {
      success.push(`✅ Package name: ${appJson.expo.android.package}`);
    } else {
      issues.push('❌ No Android package name specified');
    }
    
    // Check JS Engine
    if (appJson.expo?.android?.jsEngine) {
      success.push(`✅ JS Engine: ${appJson.expo.android.jsEngine}`);
    } else {
      warnings.push('⚠️  JS Engine not specified (will use default: Hermes)');
    }
    
    // Check build type
    if (appJson.expo?.android?.buildType) {
      success.push(`✅ Build type: ${appJson.expo.android.buildType}`);
    }
  } else {
    issues.push('❌ app.json not found');
  }
} catch (error) {
  issues.push(`❌ Error reading app.json: ${error.message}`);
}

// 2. Check Firebase configuration
console.log('\n🔥 Checking Firebase configuration...');
try {
  const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
  if (fs.existsSync(firebaseConfigPath)) {
    success.push('✅ Firebase config file exists');
    
    const firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
    if (firebaseConfig.includes('apiKey') && firebaseConfig.includes('projectId')) {
      success.push('✅ Firebase credentials appear to be configured');
    } else {
      warnings.push('⚠️  Firebase credentials might be incomplete');
    }
  } else {
    issues.push('❌ Firebase config file not found');
  }
  
  // Check google-services.json
  const googleServicesPath = path.join(__dirname, 'android', 'app', 'google-services.json');
  if (fs.existsSync(googleServicesPath)) {
    success.push('✅ google-services.json exists');
  } else {
    warnings.push('⚠️  google-services.json not found (needed for Firebase in APK)');
  }
} catch (error) {
  warnings.push(`⚠️  Error checking Firebase: ${error.message}`);
}

// 3. Check API configuration
console.log('\n🌐 Checking API configuration...');
try {
  const apiConfigPath = path.join(__dirname, 'src', 'config', 'apiConfig.js');
  if (fs.existsSync(apiConfigPath)) {
    success.push('✅ API config file exists');
    
    const apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
    if (apiConfig.includes('localhost') || apiConfig.includes('127.0.0.1')) {
      warnings.push('⚠️  API config contains localhost - this will fail in APK');
    } else {
      success.push('✅ API config does not use localhost');
    }
  } else {
    warnings.push('⚠️  API config file not found');
  }
} catch (error) {
  warnings.push(`⚠️  Error checking API config: ${error.message}`);
}

// 4. Check fonts
console.log('\n🔤 Checking fonts...');
try {
  const fontsDir = path.join(__dirname, 'assets', 'fonts');
  if (fs.existsSync(fontsDir)) {
    const fonts = fs.readdirSync(fontsDir);
    if (fonts.length > 0) {
      success.push(`✅ Found ${fonts.length} font files`);
      console.log('   Fonts:', fonts.join(', '));
    } else {
      warnings.push('⚠️  No fonts found in assets/fonts');
    }
  } else {
    warnings.push('⚠️  assets/fonts directory not found');
  }
} catch (error) {
  warnings.push(`⚠️  Error checking fonts: ${error.message}`);
}

// 5. Check for common problematic imports
console.log('\n📦 Checking for problematic imports...');
try {
  const problematicModules = [
    '@react-native-firebase/messaging',
    '@react-native-firebase/analytics',
    'react-native-push-notification'
  ];
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    problematicModules.forEach(module => {
      if (dependencies[module]) {
        warnings.push(`⚠️  ${module} is installed - ensure it's properly configured for standalone builds`);
      }
    });
    
    if (warnings.filter(w => w.includes('properly configured')).length === 0) {
      success.push('✅ No obviously problematic modules detected');
    }
  }
} catch (error) {
  warnings.push(`⚠️  Error checking package.json: ${error.message}`);
}

// 6. Check ErrorBoundary
console.log('\n🛡️  Checking Error Boundary...');
try {
  const errorBoundaryPath = path.join(__dirname, 'src', 'components', 'ErrorBoundary.js');
  if (fs.existsSync(errorBoundaryPath)) {
    success.push('✅ ErrorBoundary component exists');
    
    const appJsPath = path.join(__dirname, 'App.js');
    if (fs.existsSync(appJsPath)) {
      const appJs = fs.readFileSync(appJsPath, 'utf8');
      if (appJs.includes('ErrorBoundary')) {
        success.push('✅ ErrorBoundary is imported in App.js');
      } else {
        issues.push('❌ ErrorBoundary not used in App.js');
      }
    }
  } else {
    issues.push('❌ ErrorBoundary component not found');
  }
} catch (error) {
  warnings.push(`⚠️  Error checking ErrorBoundary: ${error.message}`);
}

// 7. Check eas.json
console.log('\n🏗️  Checking EAS Build configuration...');
try {
  const easJsonPath = path.join(__dirname, 'eas.json');
  if (fs.existsSync(easJsonPath)) {
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
    success.push('✅ eas.json exists');
    
    if (easJson.build?.preview) {
      success.push('✅ Preview build profile configured');
    }
    if (easJson.build?.production) {
      success.push('✅ Production build profile configured');
    }
  } else {
    warnings.push('⚠️  eas.json not found (needed for EAS builds)');
  }
} catch (error) {
  warnings.push(`⚠️  Error checking eas.json: ${error.message}`);
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 CONFIGURATION CHECK SUMMARY');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ SUCCESS:');
  success.forEach(msg => console.log(msg));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(msg => console.log(msg));
}

if (issues.length > 0) {
  console.log('\n❌ ISSUES:');
  issues.forEach(msg => console.log(msg));
}

console.log('\n' + '='.repeat(60));

if (issues.length === 0) {
  console.log('✅ No critical issues found!');
  console.log('📱 Your app configuration looks good for APK builds.');
  console.log('\n💡 Next steps:');
  console.log('   1. Connect your device via USB');
  console.log('   2. Run: .\\CHECK_ADB_AND_DEBUG.bat');
  console.log('   3. Reproduce the crash while monitoring logs');
} else {
  console.log('❌ Critical issues found!');
  console.log('🔧 Fix the issues above before building APK.');
}

if (warnings.length > 0) {
  console.log('\n⚠️  Review warnings - they might cause APK crashes.');
}

console.log('\n📚 For detailed debugging guide, see: APK_CRASH_QUICK_START.md');
console.log('='.repeat(60) + '\n');
