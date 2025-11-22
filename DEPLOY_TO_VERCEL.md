# 🚀 Deploy to Vercel - Complete Guide

## ✅ Pre-Deployment Checklist

- [x] DevTools removed (production ready)
- [x] Environment variables configured
- [x] Polar.sh integration working
- [x] Dark mode implemented
- [x] Payment modal functional
- [x] All artworks working
- [x] Random initialization active

---

## 📋 Step 1: Prepare Environment Variables

You'll need to add these to Vercel:

```
POLAR_ACCESS_TOKEN=polar_oat_H3gHC3XrECdhVHItCdwCMX3XZgxMHVVSyGj5m3wnR6d
POLAR_PRODUCT_ID=d55ffe08-dc19-45be-8940-afdf7721e2d2
POLAR_API_KEY=polar_oat_H3gHC3XrECdhVHItCdwCMX3XZgxMHVVSyGj5m3wnR6d
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
POLAR_SUCCESS_URL=https://your-domain.vercel.app?payment=success
```

**Note:** You'll update `NEXT_PUBLIC_BASE_URL` and `POLAR_SUCCESS_URL` after deployment with your actual Vercel URL.

---

## 🎯 Step 2: Deploy to Vercel

### **Option A: Using Vercel CLI (Fastest)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **arte** (or your choice)
   - Directory? **./** (current directory)
   - Want to override settings? **N**

5. **Add Environment Variables:**
   ```bash
   vercel env add POLAR_ACCESS_TOKEN
   vercel env add POLAR_PRODUCT_ID
   vercel env add POLAR_API_KEY
   vercel env add NEXT_PUBLIC_BASE_URL
   vercel env add POLAR_SUCCESS_URL
   ```
   
   For each variable:
   - Environment: **Production**
   - Paste the value when prompted

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### **Option B: Using Vercel Dashboard (Easier)**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Arte generative art site"
   git branch -M main
   
   # Create repo on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/arte.git
   git push -u origin main
   ```

2. **Go to Vercel:**
   - Visit: https://vercel.com
   - Click **"Add New Project"**
   - Click **"Import Git Repository"**
   - Select your GitHub repo
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** .next (auto-filled)

4. **Add Environment Variables:**
   Click **"Environment Variables"** and add:
   
   ```
   POLAR_ACCESS_TOKEN = polar_oat_H3gHC3XrECdhVHItCdwCMX3XZgxMHVVSyGj5m3wnR6d
   POLAR_PRODUCT_ID = d55ffe08-dc19-45be-8940-afdf7721e2d2
   POLAR_API_KEY = polar_oat_H3gHC3XrECdhVHItCdwCMX3XZgxMHVVSyGj5m3wnR6d
   NEXT_PUBLIC_BASE_URL = (leave empty for now)
   POLAR_SUCCESS_URL = (leave empty for now)
   ```

5. **Click "Deploy"**

6. **Wait for deployment** (2-3 minutes)

---

## 🔧 Step 3: Update URLs After First Deployment

1. **Copy your Vercel URL** (e.g., `arte-abc123.vercel.app`)

2. **Update Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Edit `NEXT_PUBLIC_BASE_URL`:
     ```
     https://arte-abc123.vercel.app
     ```
   - Edit `POLAR_SUCCESS_URL`:
     ```
     https://arte-abc123.vercel.app?payment=success
     ```

3. **Redeploy:**
   - Go to Deployments tab
   - Click ⋮ on latest deployment
   - Click "Redeploy"
   - Select "Use existing Build Cache"
   - Click "Redeploy"

---

## 🎨 Step 4: Update Polar.sh Settings

1. **Go to Polar Dashboard:**
   https://polar.sh/dashboard/products

2. **Edit your product:**
   - Click ⋮ menu on "GIF Export Access"
   - Click "Edit"

3. **Update Success URL:**
   - Find "Success URL" or "Redirect URL" field
   - Update to: `https://your-vercel-url.vercel.app?payment=success`
   - Save

---

## ✅ Step 5: Test Your Deployment

1. **Visit your site:** `https://your-vercel-url.vercel.app`

2. **Test features:**
   - ✅ Site loads with random artwork
   - ✅ Dark mode toggle works
   - ✅ Next button cycles through artworks
   - ✅ Controls dropdown works
   - ✅ Image export works (free)
   - ✅ GIF export shows payment modal
   - ✅ Payment redirect works
   - ✅ Returns and grants access

3. **Test payment flow:**
   - Clear localStorage
   - Try GIF export
   - Click "Choose Your Price & Unlock"
   - Complete payment on Polar
   - Should return to site
   - Access granted automatically
   - GIF export works!

---

## 🌐 Step 6: Add Custom Domain (Optional)

1. **Buy domain** (e.g., from Namecheap, Google Domains, etc.)

2. **In Vercel Dashboard:**
   - Go to Project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `arte.com`)
   - Follow DNS configuration instructions

3. **Update Environment Variables:**
   - Change `NEXT_PUBLIC_BASE_URL` to `https://arte.com`
   - Change `POLAR_SUCCESS_URL` to `https://arte.com?payment=success`
   - Redeploy

4. **Update Polar:**
   - Update product success URL to your custom domain

---

## 🔥 Production Optimizations Applied

✅ **Removed Dev Tools** - No debug panel in production
✅ **Environment Variables** - Secrets not in code
✅ **.gitignore** - .env.local won't be committed
✅ **Next.js Optimizations** - Automatic code splitting, image optimization
✅ **Vercel CDN** - Global edge network
✅ **Auto HTTPS** - SSL certificates included

---

## 📊 Monitoring & Analytics

### **Vercel Analytics (Built-in):**
- Go to Project → Analytics
- See visitor stats, page views, performance

### **Add Custom Analytics (Optional):**

Add to `app/layout.tsx`:

```typescript
// Google Analytics
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
  `}
</Script>
```

---

## 🐛 Troubleshooting

### **Build Fails:**
- Check Node.js version in `package.json`
- Check for TypeScript errors: `npm run build` locally
- Check Vercel build logs

### **Environment Variables Not Working:**
- Verify they're set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### **Payment Not Working:**
- Check `NEXT_PUBLIC_BASE_URL` is correct
- Verify Polar product success URL matches
- Check Polar API token has correct permissions

### **404 Errors:**
- Check file paths are correct
- Ensure all imports use `@/` prefix
- Verify `next.config.mjs` is correct

---

## 📝 Quick Commands Reference

```bash
# Local development
npm run dev

# Build locally (test before deploy)
npm run build
npm run start

# Deploy to Vercel
vercel              # Preview deployment
vercel --prod       # Production deployment

# Check deployment logs
vercel logs
```

---

## 🎉 You're Live!

Your generative art site with Polar.sh payments is now:
- ✅ Deployed globally on Vercel
- ✅ Fast edge network
- ✅ Auto HTTPS
- ✅ Payment processing working
- ✅ Professional and production-ready

**Share your site:**
- `https://your-vercel-url.vercel.app`
- Or your custom domain!

---

## 📞 Support

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Polar Issues:**
- Docs: https://docs.polar.sh
- Support: https://polar.sh/support

**Next.js Issues:**
- Docs: https://nextjs.org/docs
- Community: https://github.com/vercel/next.js/discussions

---

**Ready to deploy? Run `vercel` in your terminal now! 🚀**
