# Peak Hours Feature - Quick Start Guide

## 🎯 What is Peak Hours?

Peak Hours allows venue managers to charge different prices during high-demand time periods. For example:
- **Off-peak**: 6 AM - 5 PM → PKR 2,000 per slot
- **Peak**: 5 PM - 11 PM → PKR 3,000 per slot (50% markup)

## 🚀 Quick Setup (2 minutes)

### Step 1: Open Venue Form
- Go to **Venues Management** page
- Click **Add Venue** (new) or **Edit** (existing)

### Step 2: Navigate to Pricing Section
- Click **Continue** to go to Step 3: **Pricing & Media**

### Step 3: Configure Peak Hours
Scroll down to find **Peak Hours Configuration** section:

```
☑ Enable Peak Hours Pricing

Peak Hours Start:    17:00 (5:00 PM)
Peak Hours End:      23:00 (11:00 PM)
Price Multiplier:    1.5

Peak price will be: PKR 3,000 per slot
```

### Step 4: Save
- Click **Register Venue** or **Update Venue**

## 📊 Common Configurations

### Configuration 1: Evening Peak
```
Base Price:      PKR 2,000
Peak Hours:      5:00 PM - 11:00 PM
Multiplier:      1.5 (50% markup)
Peak Price:      PKR 3,000
```

### Configuration 2: Weekend Premium
```
Base Price:      PKR 1,500
Peak Hours:      10:00 AM - 10:00 PM
Multiplier:      1.3 (30% markup)
Peak Price:      PKR 1,950
```

### Configuration 3: Late Night Surge
```
Base Price:      PKR 1,800
Peak Hours:      8:00 PM - 12:00 AM
Multiplier:      1.8 (80% markup)
Peak Price:      PKR 3,240
```

## 💰 Revenue Impact Example

**Scenario: 10 bookings per day**

### Without Peak Hours:
```
10 bookings × PKR 2,000 = PKR 20,000/day
```

### With Peak Hours (1.5x multiplier):
```
6 off-peak bookings × PKR 2,000 = PKR 12,000
4 peak bookings × PKR 3,000 = PKR 12,000
Total = PKR 24,000/day

Additional Revenue: +PKR 4,000/day (+20%)
Monthly Increase: +PKR 120,000
```

## 🔍 Viewing Peak Hours

### In Venues Grid:
The **Peak Hours** column shows:
- **Active**: `17:00 - 23:00` with `1.5x multiplier` (orange highlight)
- **Inactive**: `Not configured`

### When Editing:
All peak hours settings are pre-filled when you edit a venue.

## ⚙️ Advanced Options

### Multiplier Guide:
| Multiplier | Markup | Example |
|-----------|--------|---------|
| 1.0 | 0% | Same as base price |
| 1.2 | 20% | PKR 2,000 → PKR 2,400 |
| 1.5 | 50% | PKR 2,000 → PKR 3,000 |
| 1.8 | 80% | PKR 2,000 → PKR 3,600 |
| 2.0 | 100% | PKR 2,000 → PKR 4,000 |

### Time Format:
- Use 24-hour format (HH:MM)
- Examples:
  - 5:00 PM = 17:00
  - 11:00 PM = 23:00
  - 12:00 AM = 00:00
  - 6:00 AM = 06:00

## ❓ FAQ

**Q: Can peak hours span across midnight?**
A: Yes! You can set peak hours from 10:00 PM to 2:00 AM (22:00 to 02:00).

**Q: What if I disable peak hours?**
A: All slots will be charged at the base price. Peak hours configuration is saved but not applied.

**Q: Can I have multiple peak periods?**
A: Currently, only one peak period per day is supported. Future versions may support multiple periods.

**Q: How do customers see peak hour pricing?**
A: When customers book a slot during peak hours, they see the peak price automatically calculated.

**Q: Can I change peak hours after creating a venue?**
A: Yes! Edit the venue and update the peak hours settings anytime.

**Q: What happens to existing bookings if I change peak hours?**
A: Existing bookings keep their original price. New bookings use the updated peak hours pricing.

## 🎓 Best Practices

1. **Start Conservative**: Begin with a 1.2-1.3x multiplier and adjust based on demand
2. **Monitor Demand**: Track which time slots fill up fastest
3. **Adjust Seasonally**: Increase multiplier during peak seasons (summer, holidays)
4. **Communicate**: Inform customers about peak hour pricing in advance
5. **Test & Optimize**: A/B test different multipliers to find the sweet spot

## 📈 Monitoring Performance

Check the **Revenue Management** page to see:
- Peak vs Off-Peak revenue breakdown
- Peak hour utilization rates
- Revenue trends over time
- Peak hour booking patterns

## 🆘 Troubleshooting

**Peak hours not showing in grid?**
- Ensure peak hours are enabled (checkbox checked)
- Verify start and end times are set
- Save the venue and refresh the page

**Peak price not calculating correctly?**
- Check base price is set correctly
- Verify multiplier value (should be ≥ 1.0)
- Ensure no other discounts are interfering

**Can't enable peak hours?**
- Make sure you're in Step 3 of the form
- Check that base price is set
- Verify operating hours are configured

## 📞 Support

For issues or questions:
1. Check this Quick Start guide
2. Review the full documentation in `PEAK_HOURS_FEATURE.md`
3. Contact the development team

---

**Last Updated**: April 22, 2026
**Version**: 1.0
**Status**: Ready to Use
