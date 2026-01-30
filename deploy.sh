#!/bin/bash

# Rift Quick Deployment Script
# This script helps you deploy Rift quickly

echo "🚀 Rift Deployment Helper"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << 'EOF'
PORT=8080
NODE_ENV=development
KASPA_WALLET_ADDRESS=kaspa:qpau8qtrd2svw0k2enr5rqja09glp9lx8eyj3s96ea5z7x5c9g9kqlz5g4zfq
ADMIN_PASSWORD=changeme123
EOF
    echo "✅ Created .env file (remember to change ADMIN_PASSWORD!)"
fi

# Ask deployment method
echo ""
echo "Choose deployment method:"
echo "1) Local development (localhost)"
echo "2) Heroku"
echo "3) Railway"
echo "4) Manual deployment info"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🏠 Starting local development server..."
        echo "Access overlay at: http://localhost:8080/obs-overlay.html?defi=piment"
        echo "Access admin at: http://localhost:8080/admin.html"
        echo ""
        node server.js
        ;;
    2)
        echo ""
        echo "☁️  Deploying to Heroku..."
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        # Create Procfile
        echo "web: node server.js" > Procfile
        echo "✅ Created Procfile"
        
        # Initialize git if needed
        if [ ! -d ".git" ]; then
            git init
            git add .
            git commit -m "Initial commit"
        fi
        
        # Create Heroku app
        read -p "Enter your Heroku app name: " app_name
        heroku create $app_name
        
        # Set config vars
        heroku config:set NODE_ENV=production -a $app_name
        
        echo ""
        echo "📤 Pushing to Heroku..."
        git push heroku main
        
        echo ""
        echo "✅ Deployed! Your overlay URL:"
        echo "https://$app_name.herokuapp.com/obs-overlay.html?defi=piment"
        ;;
    3)
        echo ""
        echo "🚂 Deploying to Railway..."
        
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm i -g @railway/cli
        fi
        
        railway login
        railway init
        railway up
        
        echo ""
        echo "✅ Deployed! Check Railway dashboard for your URL"
        ;;
    4)
        echo ""
        echo "📖 Manual Deployment Information"
        echo "================================"
        echo ""
        echo "1. Deploy backend (server.js) to any Node.js hosting"
        echo "2. Static files (obs-overlay.html, admin.html) can be served directly"
        echo "3. Update WebSocket URL in obs-overlay.html (line ~125)"
        echo "4. Set environment variables from .env file"
        echo ""
        echo "See docs/DEPLOYMENT_GUIDE.md for detailed instructions"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
