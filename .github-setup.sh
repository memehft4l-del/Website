#!/bin/bash

# GitHub Setup Script for $ELIXIR Tournament Platform
# Run this script to prepare and push your code to GitHub

echo "🚀 $ELIXIR Tournament Platform - GitHub Setup"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Run: git init"
    exit 1
fi

# Check if .env.local exists and warn
if [ -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local file exists. Make sure it's in .gitignore!"
    echo "   Your .env.local should NOT be committed to GitHub."
    echo ""
fi

# Stage all files
echo "📦 Staging files..."
git add .

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short

echo ""
read -p "Do you want to commit these files? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Commit
    echo "💾 Committing files..."
    git commit -m "Initial commit: $ELIXIR Tournament Platform"
    
    echo ""
    echo "✅ Files committed!"
    echo ""
    echo "📤 Next steps:"
    echo "1. Create a new repository on GitHub: https://github.com/new"
    echo "2. Copy the repository URL (e.g., https://github.com/username/repo-name.git)"
    echo "3. Run these commands:"
    echo ""
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo "   git push -u origin main"
    echo ""
    echo "4. Then import your GitHub repo into Vercel: https://vercel.com/new"
    echo "5. Add your environment variables in Vercel project settings"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT.md"
else
    echo "❌ Commit cancelled. No changes made."
fi

