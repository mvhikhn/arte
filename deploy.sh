#!/bin/bash

# Arte - Quick Deploy to Vercel Script

echo "🎨 Arte - Deploying to Vercel"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Add all changes
echo "📁 Adding files to git..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "================================"
echo "✨ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy your Vercel URL from above"
echo "2. Update NEXT_PUBLIC_BASE_URL in Vercel settings"
echo "3. Update POLAR_SUCCESS_URL in Vercel settings"
echo "4. Update Polar product success URL"
echo ""
echo "Need help? Check DEPLOY_TO_VERCEL.md"
