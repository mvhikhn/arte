# ⚠️ Polar.sh Setup Required

## What I Need From You

To activate the GIF export paywall, I need **2 things** from your Polar.sh account:

### 1. 🔑 POLAR_API_KEY
- Go to: https://polar.sh/dashboard/settings/api
- Create a new API key
- Name it: "Arte GIF Exports"
- Copy the key (starts with `polar_`)

### 2. 📦 POLAR_PRODUCT_ID
- Go to: https://polar.sh/dashboard/products
- Create a new product:
  - **Name**: GIF Export Access
  - **Price**: $5.00 USD
  - **Type**: One-time payment
- Save and copy the Product ID

---

## How to Add Them

1. Create a file called `.env.local` in your project root
2. Add these lines:

```env
POLAR_API_KEY=polar_sk_your_key_here
POLAR_PRODUCT_ID=prod_your_id_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Restart your dev server

---

## That's It!

Once you provide these 2 values, the paywall will work automatically.

**See `POLAR_PAYWALL_SETUP.md` for detailed instructions.**
