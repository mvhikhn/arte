# 🪝 Polar Webhook Setup Guide

This is **CRITICAL** for cross-device email access to work!

---

## 🎯 What Webhooks Do

When a customer pays via Polar:
1. **Customer enters email** on Polar checkout page
2. **Polar sends webhook** to your API with payment details + email
3. **Your API automatically stores email** in Redis
4. **Customer can verify** from any device using that email

**Without webhooks:** Email is never captured, cross-device won't work! ❌

---

## ⚡ Quick Setup (5 minutes)

### **Step 1: Get Your Webhook URL**

Your webhook endpoint is:
```
https://your-vercel-url.vercel.app/api/webhooks/polar
```

Example:
```
https://arte-k6p8u07ar-mahi-khans-projects.vercel.app/api/webhooks/polar
```

**Use your actual production Vercel URL!**

---

### **Step 2: Add Webhook in Polar Dashboard**

1. **Go to:** https://polar.sh/dashboard

2. **Click "Settings"** (left sidebar)

3. **Click "Webhooks"** section

4. **Click "Create Webhook"** or "Add Endpoint"

5. **Fill in:**
   - **URL:** `https://your-vercel-url.vercel.app/api/webhooks/polar`
   - **Events to listen for:**
     - ✅ `checkout.created`
     - ✅ `order.created`
   - **Secret:** (leave blank or copy if shown)

6. **Click "Create" or "Save"**

---

### **Step 3: Test the Webhook**

1. **Complete a test purchase** on your site

2. **Check Vercel Logs:**
   - Go to: https://vercel.com/mahi-khans-projects/arte
   - Click "Deployments"
   - Click latest deployment
   - Click "Functions" tab
   - Look for `/api/webhooks/polar` logs

3. **You should see:**
   ```
   Polar webhook received: { ... }
   Granting access to email: customer@example.com
   Access granted successfully to: customer@example.com
   ```

4. **Test verification:**
   - Open site in incognito
   - Click "Already purchased? Verify your email"
   - Enter the email you used
   - Should grant access! ✅

---

## 🔍 Troubleshooting

### **Issue: Webhook not being called**

**Check:**
1. Webhook URL is correct (must be production URL)
2. Events are selected (`checkout.created`, `order.created`)
3. Webhook is enabled in Polar dashboard

**Test:**
- Polar dashboard usually shows webhook delivery attempts
- Check if they're failing or succeeding

---

### **Issue: Email not being stored**

**Check Vercel Logs:**
```
Function logs at: Deployments → Latest → Functions → /api/webhooks/polar
```

**Look for:**
- `Polar webhook received:` - Webhook is being called ✅
- `No customer email found` - Email not in payload ❌
- `Access granted successfully` - Working perfectly! ✅

---

### **Issue: Verification fails**

**Possible causes:**
1. **Redis not connected** - Check environment variables
2. **Different email used** - Customer used one email for purchase, different for verification
3. **Webhook didn't fire** - Email never stored in Redis

**Solution:**
1. Check Vercel logs for webhook calls
2. Verify Redis environment variables are set
3. Test with a new purchase

---

## 📊 How It Works (Technical)

### **Payment Flow:**

```
1. User clicks "Choose Your Price & Unlock"
   ↓
2. Redirected to Polar checkout
   ↓
3. User enters email: john@example.com
   ↓
4. User completes payment
   ↓
5. Polar sends webhook to: /api/webhooks/polar
   Payload: { customer_email: "john@example.com", ... }
   ↓
6. Your API stores in Redis:
   Key: "gif_access:john@example.com"
   Value: { granted: true, grantedAt: "2025-11-22..." }
   ↓
7. User returns to site with ?payment=success
   ↓
8. localStorage grants immediate access
```

### **Verification Flow (Different Device):**

```
1. User on new device tries to export GIF
   ↓
2. No localStorage access found
   ↓
3. User clicks "Already purchased? Verify your email"
   ↓
4. Enters: john@example.com
   ↓
5. API checks Redis for "gif_access:john@example.com"
   ↓
6. Found! → Grant access + store in localStorage
   ↓
7. User can now export GIFs ✅
```

---

## 🎨 Webhook Payload Example

What Polar sends to your webhook:

```json
{
  "type": "checkout.created",
  "data": {
    "id": "checkout_123",
    "customer_email": "customer@example.com",
    "amount": 500,
    "currency": "USD",
    "product_id": "d55ffe08-dc19-45be-8940-afdf7721e2d2",
    "status": "confirmed"
  }
}
```

Your webhook extracts: `customer_email` and stores it in Redis.

---

## ✅ Verification Checklist

Before launching, make sure:

- [ ] Webhook URL is production Vercel URL
- [ ] Webhook listens to `checkout.created` and `order.created`
- [ ] Webhook is enabled in Polar dashboard
- [ ] Redis environment variables are set in Vercel
- [ ] Test purchase shows webhook in Vercel logs
- [ ] Email verification works from incognito

---

## 🚀 After Setup

Once webhooks are configured:

✅ **Customer pays** → Email automatically saved
✅ **Immediate access** → localStorage on payment device
✅ **Cross-device access** → Email verification on any device
✅ **No manual work** → Everything automatic!

---

## 📝 Important Notes

**Email Source:**
- Email comes from **Polar checkout** (where customer enters it)
- NOT from your site (you don't ask for email)
- Customer must use **same email** for verification

**Privacy:**
- Only email + access status stored
- No passwords or sensitive data
- GDPR compliant (minimal data)

**Reliability:**
- Webhooks are automatic and instant
- Polar retries failed webhooks
- Your site just needs to receive them

---

**Setup the webhook and your cross-device access will work perfectly! 🎉**
