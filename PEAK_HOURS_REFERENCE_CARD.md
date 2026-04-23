# Peak Hours Feature - Reference Card

## 🎯 Quick Reference

### What is Peak Hours?
Dynamic pricing for specific time periods. Charge more during high-demand hours.

### Where to Configure?
**Venues Management** → **Add/Edit Venue** → **Step 3: Pricing & Media** → **Peak Hours Configuration**

### Configuration Fields
| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| Enable | Checkbox | ☑ | Toggle on/off |
| Start Time | HH:MM (24h) | 17:00 | 5:00 PM |
| End Time | HH:MM (24h) | 23:00 | 11:00 PM |
| Multiplier | Decimal | 1.5 | 50% markup |

### Quick Setup
```
1. Check "Enable Peak Hours Pricing"
2. Set Start: 17:00 (5 PM)
3. Set End: 23:00 (11 PM)
4. Set Multiplier: 1.5
5. Save Venue
```

---

## 💰 Pricing Examples

### Example 1: Evening Peak
```
Base: PKR 2,000
Peak: 5 PM - 11 PM
Multiplier: 1.5
Result: PKR 3,000 during peak
```

### Example 2: Weekend Premium
```
Base: PKR 1,500
Peak: 10 AM - 10 PM
Multiplier: 1.3
Result: PKR 1,950 during peak
```

### Example 3: Late Night Surge
```
Base: PKR 1,800
Peak: 8 PM - 12 AM
Multiplier: 1.8
Result: PKR 3,240 during peak
```

---

## 📊 Revenue Impact

### Daily Revenue Calculation
```
Without Peak Hours:
10 bookings × PKR 2,000 = PKR 20,000

With Peak Hours (1.5x):
6 off-peak × PKR 2,000 = PKR 12,000
4 peak × PKR 3,000 = PKR 12,000
Total = PKR 24,000

Increase: +PKR 4,000 (+20%)
Monthly: +PKR 120,000
```

---

## 🔧 Multiplier Quick Guide

| Multiplier | Markup | Use Case |
|-----------|--------|----------|
| 1.0 | 0% | No change |
| 1.1 | 10% | Minimal |
| 1.2 | 20% | Light |
| 1.3 | 30% | Moderate |
| 1.5 | 50% | Standard |
| 1.8 | 80% | High |
| 2.0 | 100% | Double |

---

## ⏰ Time Format Guide

### 24-Hour Format
```
6:00 AM  = 06:00
12:00 PM = 12:00
5:00 PM  = 17:00
11:00 PM = 23:00
12:00 AM = 00:00
```

### Common Peak Hours
```
Morning Rush:    08:00 - 10:00
Lunch Time:      12:00 - 14:00
Evening Peak:    17:00 - 23:00
Late Night:      20:00 - 02:00
Weekend:         10:00 - 22:00
```

---

## 📱 Venues Grid Display

### Peak Hours Column Shows:
- **Enabled**: `17:00 - 23:00` with `1.5x multiplier` (orange)
- **Disabled**: `Not configured` (gray)

### Example Grid Row:
```
Venue: Arena Pro
Peak Hours: 17:00 - 23:00 (1.5x multiplier)
```

---

## ✅ Validation Rules

| Rule | Requirement |
|------|-------------|
| Enable | Optional (can disable anytime) |
| Start Time | Required if enabled |
| End Time | Required if enabled |
| Multiplier | Must be ≥ 1.0 |
| Format | 24-hour HH:MM |
| Midnight Span | Allowed (e.g., 22:00 - 02:00) |

---

## 🆘 Common Issues

### Peak Hours Not Showing?
- ✓ Check "Enable Peak Hours Pricing"
- ✓ Verify times are set
- ✓ Save and refresh page

### Price Not Calculating?
- ✓ Check base price is set
- ✓ Verify multiplier ≥ 1.0
- ✓ Ensure no other discounts

### Can't Enable?
- ✓ Make sure in Step 3 of form
- ✓ Set base price first
- ✓ Configure operating hours

---

## 📈 Best Practices

1. **Start Conservative**: Begin with 1.2-1.3x multiplier
2. **Monitor Demand**: Track which slots fill fastest
3. **Adjust Seasonally**: Increase during peak seasons
4. **Communicate**: Inform customers in advance
5. **Test & Optimize**: A/B test different multipliers

---

## 🎓 Revenue Optimization Tips

### Tip 1: Analyze Demand
- Check which time slots book fastest
- Set peak hours for high-demand periods

### Tip 2: Gradual Increase
- Start with 1.2x multiplier
- Increase to 1.5x if demand remains high
- Monitor booking rate

### Tip 3: Seasonal Adjustment
- Summer: Higher multiplier (1.5-1.8x)
- Winter: Lower multiplier (1.2-1.3x)
- Holidays: Premium multiplier (1.8-2.0x)

### Tip 4: Competitive Analysis
- Check competitor pricing
- Ensure your peak price is competitive
- Adjust multiplier accordingly

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Full Documentation | PEAK_HOURS_FEATURE.md |
| Quick Start | PEAK_HOURS_QUICK_START.md |
| Visual Guide | PEAK_HOURS_VISUAL_GUIDE.md |
| Implementation | IMPLEMENTATION_SUMMARY.md |
| Changes | CHANGES_SUMMARY.txt |

---

## 🚀 Getting Started (30 seconds)

1. Open Venues Management
2. Click "Add Venue" or "Edit"
3. Go to Step 3
4. Enable Peak Hours
5. Set times and multiplier
6. Save

**Done!** Peak hours are now active.

---

## 📋 Checklist Before Launch

- [ ] Peak hours enabled for all venues
- [ ] Multipliers set appropriately
- [ ] Times match your business hours
- [ ] Customers informed about pricing
- [ ] Revenue reports reviewed
- [ ] Booking system tested

---

## 💡 Pro Tips

**Tip 1**: Use 1.5x multiplier for standard peak hours
**Tip 2**: Set peak hours for 5-6 hours per day
**Tip 3**: Monitor first week and adjust if needed
**Tip 4**: Communicate pricing to customers
**Tip 5**: Review revenue impact monthly

---

## 🎯 Success Metrics

Track these metrics to measure success:

| Metric | Target | Frequency |
|--------|--------|-----------|
| Revenue Increase | +15-20% | Monthly |
| Peak Hour Bookings | 40-50% of total | Weekly |
| Customer Satisfaction | No decrease | Monthly |
| Occupancy Rate | 70-80% | Weekly |

---

**Last Updated**: April 22, 2026
**Version**: 1.0
**Quick Reference**: Yes
