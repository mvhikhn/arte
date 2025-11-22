# Arte - Generative Art Studio 🎨

A professional generative art platform with 4 unique artworks, real-time customization, and integrated payments. Built with Next.js, TypeScript, p5.js, and Polar.sh.

## ✨ Features

### 🎨 **4 Unique Generative Artworks**
- **Flow** - Organic flowing patterns with Perlin noise
- **Grid** - Geometric Mondrian-style compositions  
- **Mosaic** - Recursive subdivision patterns
- **Rotated Grid** - Angular geometric designs

### 🎯 **Core Features**
- 🎲 **Random on Load** - Fresh artwork every page refresh
- 🌓 **Dark Mode** - Toggle between light/dark themes
- 📐 **4:5 Aspect Ratio** - Perfect for social media
- 🎚️ **Real-time Controls** - Customize all parameters
- 💾 **Export to PNG** - High-resolution image export (free)
- 🎬 **Export to GIF** - Animated exports (pay-what-you-want)

### 💰 **Integrated Payments**
- **Polar.sh Integration** - Secure payment processing
- **Pay What You Want** - Flexible pricing for GIF exports
- **One-time Payment** - Lifetime unlimited GIF exports
- **Instant Access** - Auto-grant after payment

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

### Quick Deploy to Vercel

```bash
# Option 1: Using deploy script
./deploy.sh

# Option 2: Manual deployment
vercel --prod
```

See **[DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)** for complete deployment guide.

### Environment Variables

Required for Polar.sh payment integration:

```env
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_PRODUCT_ID=your_polar_product_id
POLAR_API_KEY=your_polar_api_key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
POLAR_SUCCESS_URL=https://your-domain.vercel.app?payment=success
```

Copy `.env.example` to `.env.local` for local development.

## 💻 Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Graphics:** p5.js
- **Payments:** Polar.sh SDK
- **Icons:** Lucide React
- **Deployment:** Vercel

## Project Structure

```
Arte/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── label.tsx
│   │   └── slider.tsx
│   ├── Artwork.tsx
│   └── Controls.tsx
└── lib/
    └── utils.ts
```

## Customization

All artwork parameters can be adjusted in real-time using the control panel on the right side of the interface. Changes are reflected immediately in the artwork.

## Export Features

### Image Export
- **High-Resolution PNG**: Export a single static frame at your custom resolution
- **Resolution Control**: Set export width and height independently (default: 1600 × 2000)
- **Centered Artwork**: Exports use an offscreen graphics buffer to render a clean, centered composition
- **Instant Download**: Click "Export Image" to download immediately

### GIF Export
- **Animated GIF**: Record the generative artwork in motion
- **Duration Control**: Set recording length from 1-10 seconds
- **FPS Control**: Adjust frame rate from 10-60 fps for smoothness vs file size
- **Recording Process**: Click "Export GIF" and wait for the specified duration while it records
- **Note**: GIF export uses p5.js's built-in saveGif() function. If it doesn't work in your browser, try exporting individual frames as images instead.

### Usage Tips
1. Set your desired export resolution before exporting
2. For prints: Use higher resolutions (2000×2500 or larger)
3. For social media: 1080×1350 (Instagram) or 1200×1500 work well
4. GIF file sizes increase with duration and FPS - start with 3s at 30fps
5. Image exports capture the current aesthetic state of the artwork

## License

MIT
