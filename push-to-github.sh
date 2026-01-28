#!/bin/bash

# Push to GitHub script
# This will help you push to https://github.com/memehft4l-del/Website

echo "🚀 Pushing to GitHub..."
echo "Repository: https://github.com/memehft4l-del/Website"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository. Run this from the project root."
    exit 1
fi

# Check remote
echo "📡 Checking remote..."
git remote -v

echo ""
echo "📤 Attempting to push..."
echo ""

# Try pushing - this will prompt for credentials if needed
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository: https://github.com/memehft4l-del/Website"
else
    echo ""
    echo "⚠️  Push failed. You may need to authenticate."
    echo ""
    echo "Options:"
    echo "1. Use Personal Access Token:"
    echo "   - Create token at: https://github.com/settings/tokens"
    echo "   - Then run: git push https://YOUR_TOKEN@github.com/memehft4l-del/Website.git main"
    echo ""
    echo "2. Use GitHub CLI:"
    echo "   gh auth login"
    echo "   git push -u origin main"
    echo ""
    echo "3. Authenticate via browser when prompted"
fi


