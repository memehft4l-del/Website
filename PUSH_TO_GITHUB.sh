#!/bin/bash

# Script to push code to GitHub
# Usage: ./PUSH_TO_GITHUB.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Usage: ./PUSH_TO_GITHUB.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME"
    echo ""
    echo "Example: ./PUSH_TO_GITHUB.sh biggucci elixir-tournament-platform"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🚀 Pushing to GitHub..."
echo "Repository: ${REPO_URL}"
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

# Add remote
echo "📡 Adding remote repository..."
git remote add origin ${REPO_URL}

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo "📋 Next step: Import this repo into Vercel at https://vercel.com/new"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   1. The repository exists on GitHub"
    echo "   2. You have access to push to it"
    echo "   3. You're authenticated with GitHub (git config --global user.name/email)"
fi


