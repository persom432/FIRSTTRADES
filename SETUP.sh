#!/bin/bash
# FIRSTTRADES - Setup & Launch Guide
# This script helps you set up and run the trading platform

echo "╔════════════════════════════════════════╗"
echo "║      FIRSTTRADES Platform Setup        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not installed${NC}"
    echo "  Download: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}Note: npm install had issues (may be normal)${NC}"
fi
echo ""

# Create data directories
echo -e "${YELLOW}Setting up data files...${NC}"
touch transactions.json 2>/dev/null
touch trades.json 2>/dev/null
echo -e "${GREEN}✓ Data files ready${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════╗"
echo "║         Ready to Launch! 🚀            ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start the Transaction Server:"
echo -e "    ${YELLOW}node transaction-server.js${NC}"
echo ""
echo "2️⃣  Open in browser:"
echo -e "    ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "3️⃣  Test the site:"
echo "    • Navigate between pages (should see smooth loading)"
echo "    • All colors should match the trading dashboard"
echo "    • Try opening DevTools: F12"
echo ""
echo "4️⃣  Export user data (in DevTools Console):"
echo -e "    ${YELLOW}userDataCollector.exportAsJSON('user_123')${NC}"
echo ""
echo "5️⃣  Full documentation:"
echo "    • USER_DATA_GUIDE.md - Data retrieval guide"
echo "    • COMPLETE_UPDATE_README.md - Complete overview"
echo "    • TRADING_SYSTEM.md - Trading system docs"
echo ""
echo -e "${GREEN}Setup complete! Enjoy! 🎉${NC}"
echo ""
