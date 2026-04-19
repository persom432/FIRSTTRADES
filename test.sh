#!/bin/bash
# Test script to verify FIRSTTRADES updates

echo "======================================"
echo "FIRSTTRADES System Test"
echo "======================================"
echo ""

# Check if Node.js is installed
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null
then
    echo "✗ Node.js not found. Please install Node.js"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null
then
    echo "✗ npm not found. Please install npm"
    exit 1
fi
echo "✓ npm found: $(npm --version)"
echo ""

# Check required files
echo "✓ Checking required files..."
files=(
    "user-data-collector.js"
    "transaction-server.js"
    "index.html"
    "trading-dashboard.html"
    "signals.html"
    "login.html"
    "fund-wallet.html"
    "USER_DATA_GUIDE.md"
    "COMPLETE_UPDATE_README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file NOT FOUND"
    fi
done
echo ""

# Check if express is installed
echo "✓ Checking dependencies..."
if [ -d "node_modules/express" ]; then
    echo "  ✓ express installed"
else
    echo "  ✗ express not found. Run: npm install"
fi
echo ""

echo "======================================"
echo "TEST COMPLETE"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start server: node transaction-server.js"
echo "2. Open browser: http://localhost:3000"
echo "3. Test page transitions (should show loading screen)"
echo "4. Try exporting data: F12 > Console > userDataCollector.exportAsJSON(userId)"
echo ""
