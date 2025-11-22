# Polar.sh Paywall Setup Guide 🔐

## Overview

GIF exports are now behind a paywall powered by Polar.sh. Users must make a one-time payment of $5 to unlock unlimited GIF exports.

---

## What's Implemented

### ✅ Payment Modal
- Beautiful modal that appears when user tries to export GIF
- Shows pricing and features
- Links to Polar.sh checkout
- Supports light/dark mode

### ✅ Payment Check
- Checks localStorage for access
- Shows paywall if no access
- Allows export if paid

### ✅ API Route
- `/api/create-checkout` - Creates Polar checkout session
- Handles API communication with Polar.sh
- Returns checkout URL

### ✅ Payment Utilities
- `hasGifAccess()` - Check if user has paid
- `grantGifAccess()` - Grant access after payment
- `revokeGifAccess()` - Remove access (for testing/refunds)

---

## Setup Instructions

### Step 1: Create Polar.sh Account

1. Go to [https://polar.sh](https://polar.sh)
2. Sign up for an account
3. Complete your profile setup

---

### Step 2: Create a Product

1. In Polar dashboard, go to **Products**
2. Click **Create Product**
3. Fill in details:
   - **Name**: "GIF Export Access"
   - **Description**: "Unlock unlimited GIF exports for your generative artworks"
   - **Price**: $5.00 USD
   - **Type**: One-time payment
4. Save the product
5. **Copy the Product ID** (you'll need this)

---

### Step 3: Get Your API Key

1. In Polar dashboard, go to **Settings** → **API**
2. Click **Create API Key**
3. Name it: "Arte GIF Exports"
4. **Copy the API key** (starts with `polar_`)
5. **Keep it secret!** Never commit to git

---

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   POLAR_API_KEY=polar_sk_xxxxxxxxxxxxx
   POLAR_PRODUCT_ID=prod_xxxxxxxxxxxxx
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Important**: `.env.local` is gitignored - your secrets are safe

---

### Step 5: Install Dependencies (if needed)

The implementation uses only Next.js built-in features, no additional packages needed!

---

### Step 6: Test the Paywall

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app: `http://localhost:3000`

3. Try to export a GIF:
   - Click "Controls"
   - Expand "Export" section
   - Click "Export GIF"

4. Payment modal should appear!

5. Click "Unlock GIF Exports - $5"

6. You'll be redirected to Polar checkout

7. Use Polar's test mode to complete a test payment

8. After payment, you'll be redirected back

9. Click "I've completed payment"

10. GIF export should now work!

---

## How It Works

### 1. User Flow

```
User clicks "Export GIF"
          ↓
Check hasGifAccess()
          ↓
    ┌─────┴─────┐
    │           │
  No Access   Has Access
    │           │
    ↓           ↓
Show Modal   Export GIF
    │
    ↓
User Pays
    │
    ↓
Grant Access
    │
    ↓
Export GIF
```

### 2. Payment Modal Component

**File**: `/components/PaymentModal.tsx`

**Features**:
- Beautiful modal UI
- Pricing display ($5 one-time)
- Feature list
- Checkout button
- "I've completed payment" button
- Dark mode support

### 3. API Route

**File**: `/app/api/create-checkout/route.ts`

**What it does**:
- Receives request to create checkout
- Calls Polar API with your credentials
- Creates checkout session
- Returns checkout URL

**Endpoint**: `POST /api/create-checkout`

**Request**:
```json
{
  "productType": "gif_export"
}
```

**Response**:
```json
{
  "checkoutUrl": "https://polar.sh/checkout/...",
  "checkoutId": "checkout_..."
}
```

### 4. Payment Utilities

**File**: `/lib/paymentUtils.ts`

**Functions**:

```typescript
// Check if user has access
hasGifAccess(): boolean

// Grant access (after payment)
grantGifAccess(): void

// Remove access (testing/refunds)
revokeGifAccess(): void

// Get when access was granted
getAccessDate(): string | null
```

**Storage**: Uses `localStorage` to track access

```
arte_gif_access: "true" | null
arte_gif_access_date: ISO timestamp
```

### 5. Main Page Integration

**File**: `/app/page.tsx`

**Changes**:
1. Import PaymentModal and utilities
2. Add payment modal state
3. Track pending GIF export
4. Update handleExportGif to check payment
5. Add executeGifExport function
6. Add handlePaymentSuccess function
7. Render PaymentModal component

---

## Testing

### Test Mode

Polar provides test mode for development:

1. In Polar dashboard, enable **Test Mode**
2. Use test card numbers for payments
3. No real money is charged

**Test Card Numbers**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Manual Testing

1. Clear localStorage to reset access:
   ```javascript
   localStorage.removeItem('arte_gif_access');
   localStorage.removeItem('arte_gif_access_date');
   ```

2. Try GIF export - paywall should appear

3. Complete test payment

4. Click "I've completed payment"

5. GIF export should work

### Revoke Access

To test the paywall again:

```javascript
// In browser console
localStorage.removeItem('arte_gif_access');
localStorage.removeItem('arte_gif_access_date');
// Refresh page
```

Or use the utility:
```typescript
import { revokeGifAccess } from '@/lib/paymentUtils';
revokeGifAccess();
```

---

## Production Deployment

### Environment Variables

Set these in your deployment platform (Vercel, Netlify, etc.):

```env
POLAR_API_KEY=polar_sk_live_xxxxxxxxxxxxx
POLAR_PRODUCT_ID=prod_live_xxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Polar Settings

1. Switch to **Live Mode** in Polar dashboard
2. Update success URL to production domain
3. Set up webhooks (optional, for advanced tracking)

### Success URL

Update your Polar product settings:
- **Success URL**: `https://yourdomain.com?payment=success`

This redirects users back after payment.

---

## Customization

### Change Price

1. In Polar dashboard, edit product
2. Update price
3. Update price in `PaymentModal.tsx`:
   ```typescript
   <span className="text-[13px] font-bold">$5</span>
   ```

### Change Features

Edit `PaymentModal.tsx` feature list:

```typescript
<ul className="...">
  <li>✓ Unlimited GIF exports</li>
  <li>✓ Custom duration (1-10 seconds)</li>
  <li>✓ Adjustable FPS (10-60)</li>
  <li>✓ All 4 artwork types</li>
</ul>
```

### Change Modal Styling

All styling is in `PaymentModal.tsx`:
- Update colors
- Change layout
- Modify text
- Add/remove features

### Add Lifetime vs Subscription

Currently one-time payment. To add subscription:

1. Create subscription product in Polar
2. Update API route to handle subscription
3. Add subscription check logic
4. Update UI to show subscription status

---

## Security

### API Key Safety

✅ **API key is server-side only** - Never exposed to client
✅ **Environment variables** - Kept in `.env.local`
✅ **Gitignored** - Never committed to repository

### Access Control

⚠️ **Current**: Uses localStorage (client-side)

**Limitations**:
- Can be cleared by user
- Can be manipulated in browser console
- Not server-verified

**For Production**:
Consider adding server-side verification:
1. Store purchases in database
2. Verify on each export request
3. Use session/JWT tokens
4. Check against Polar API

### Improvement: Server-Side Verification

Create `/api/verify-access/route.ts`:

```typescript
export async function POST(request: Request) {
  const { userId } = await request.json();
  
  // Check database for purchase record
  const hasPurchased = await checkDatabase(userId);
  
  return NextResponse.json({ hasAccess: hasPurchased });
}
```

Then update `hasGifAccess()` to call API instead of localStorage.

---

## Troubleshooting

### "Polar API key not configured"

**Problem**: Environment variable not set

**Solution**:
1. Check `.env.local` exists
2. Verify `POLAR_API_KEY` is set
3. Restart dev server

### "Failed to create checkout session"

**Problem**: Invalid API key or product ID

**Solution**:
1. Check API key starts with `polar_`
2. Verify product ID is correct
3. Check Polar dashboard for product status
4. Try test mode first

### Modal doesn't appear

**Problem**: Payment check not working

**Solution**:
1. Check browser console for errors
2. Verify `hasGifAccess()` import
3. Clear localStorage
4. Refresh page

### Checkout URL not opening

**Problem**: Invalid checkout session

**Solution**:
1. Check API route logs
2. Verify Polar API response
3. Test with Polar's test mode
4. Check network tab in DevTools

### Payment completed but still blocked

**Problem**: Access not granted

**Solution**:
1. Click "I've completed payment" button
2. Check localStorage for `arte_gif_access`
3. Call `grantGifAccess()` manually if needed
4. Refresh page

---

## Files Created/Modified

### New Files:
1. `/components/PaymentModal.tsx` - Payment modal UI
2. `/app/api/create-checkout/route.ts` - API endpoint
3. `/lib/paymentUtils.ts` - Payment utilities
4. `/.env.example` - Environment template
5. `/POLAR_PAYWALL_SETUP.md` - This guide

### Modified Files:
1. `/app/page.tsx` - Added payment logic
   - Import PaymentModal
   - Import payment utilities
   - Add payment state
   - Update handleExportGif
   - Add payment handlers

---

## Next Steps

### Required (Before Going Live):

1. ✅ Create Polar.sh account
2. ✅ Create product in Polar
3. ✅ Get API key from Polar
4. ✅ Set environment variables
5. ✅ Test in development
6. ✅ Test payment flow end-to-end

### Optional Enhancements:

1. **Server-side verification** - More secure
2. **Database integration** - Track purchases
3. **Webhooks** - Auto-grant access on payment
4. **User accounts** - Link purchases to users
5. **Subscription option** - Recurring revenue
6. **Multiple tiers** - Different price points
7. **Refund handling** - Revoke access on refund
8. **Analytics** - Track conversion rate

---

## Support

### Polar.sh Documentation
- [API Docs](https://docs.polar.sh)
- [Checkout Guide](https://docs.polar.sh/api/checkouts)
- [Test Mode](https://docs.polar.sh/testing)

### Common Issues
- Check Polar dashboard for transaction logs
- Use test mode for development
- Verify environment variables are set correctly

---

## Summary

✅ **Paywall implemented** - GIF exports require payment
✅ **Payment modal** - Beautiful UI with dark mode
✅ **Polar integration** - Secure checkout via Polar.sh
✅ **Access control** - localStorage tracking
✅ **Easy setup** - Just add API keys

**Next: Get your Polar.sh API key and product ID to activate the paywall!**

---

## Quick Start Checklist

- [ ] Create Polar.sh account
- [ ] Create "$5 GIF Export" product
- [ ] Copy Product ID
- [ ] Generate API key
- [ ] Create `.env.local` file
- [ ] Add `POLAR_API_KEY`
- [ ] Add `POLAR_PRODUCT_ID`
- [ ] Add `NEXT_PUBLIC_BASE_URL`
- [ ] Restart dev server
- [ ] Test GIF export
- [ ] See payment modal appear
- [ ] Complete test payment
- [ ] Verify GIF export works

---

**You're all set! The paywall is ready to go. Just add your Polar.sh credentials! 🚀💰**
