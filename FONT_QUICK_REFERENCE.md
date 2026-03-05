# Font Quick Reference Card

## 🎨 Two-Font System

| Purpose | Font | Usage |
|---------|------|-------|
| **Headings & Titles** | ClashDisplay | Main headings, section titles, buttons |
| **Body & UI Text** | Montserrat | Descriptions, labels, body content |

---

## 📝 Font Variants

### ClashDisplay (Primary)
```javascript
'ClashDisplay-Bold'      // Main headings, primary buttons
'ClashDisplay-Semibold'  // Section headers, card titles  
'ClashDisplay-Medium'    // Small titles, emphasized text
'ClashDisplay-Regular'   // Standard display text
```

### Montserrat (Secondary)
```javascript
'Montserrat_700Bold'      // Emphasized body text
'Montserrat_600SemiBold'  // Strong labels
'Montserrat_500Medium'    // Labels, captions
'Montserrat_400Regular'   // Body text, descriptions
```

---

## 🚀 Quick Start

### 1. Restart Metro
```bash
npx expo start -c
```

### 2. Reload App
Press `r` in terminal or shake device

---

## 💡 Common Patterns

### Screen Title
```jsx
fontFamily: 'ClashDisplay-Bold'
fontSize: 28
```

### Section Header
```jsx
fontFamily: 'ClashDisplay-Semibold'
fontSize: 20
```

### Body Text
```jsx
fontFamily: 'Montserrat_400Regular'
fontSize: 14
lineHeight: 20
```

### Button Text
```jsx
fontFamily: 'ClashDisplay-Bold'
fontSize: 16
```

### Card Title
```jsx
fontFamily: 'ClashDisplay-Semibold'
fontSize: 18
```

### Description
```jsx
fontFamily: 'Montserrat_400Regular'
fontSize: 14
color: theme.colors.textSecondary
```

---

## 🎯 Migration Rule

**Simple Rule**: 
- If it's a **heading/title/button** → Use **ClashDisplay**
- If it's **body text/label/description** → Use **Montserrat**

**Replace**:
- `Montserrat_700Bold` → `ClashDisplay-Bold` (for headings)
- `Montserrat_600SemiBold` → `ClashDisplay-Semibold` (for titles)
- Keep `Montserrat_400Regular` for body text ✅

---

## 📱 Test Screens

After restarting, check these screens:
- ✅ WelcomeScreen - Title
- ✅ HomeScreen - Section headers
- ✅ BookingSuccessScreen - "Congratulations!"

---

## 🔧 Troubleshooting

**Fonts not loading?**
```bash
npx expo start -c
# Then press 'r' to reload
```

**App crashes?**
- Check all 4 .otf files are in `assets/fonts/`
- Verify file names match exactly

**Need Montserrat only?**
```javascript
// In App.js:
import { theme } from './src/theme/theme.fallback';
```

---

## 📚 Full Documentation

See `FONT_SYSTEM_GUIDE.md` for complete guide with examples.
