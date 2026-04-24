#!/bin/bash

# AI Sales Training Simulator - Start Script
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║       AI Sales Training Simulator                ║"
echo "║       Enterprise Sales Enablement Platform       ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Clean up used ports ----
echo -e "${YELLOW}[1/6] Cleaning up ports...${NC}"
kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

kill_port 4000
kill_port 3000

# ---- Check PostgreSQL ----
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -q 2>/dev/null; then
    echo -e "  ${GREEN}PostgreSQL is running${NC}"
  else
    echo -e "  ${CYAN}Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if ! pg_isready -q 2>/dev/null; then
      echo -e "  ${RED}PostgreSQL failed to start. Please start it manually.${NC}"
      exit 1
    fi
  fi
else
  echo -e "  ${YELLOW}pg_isready not found. Assuming PostgreSQL is running.${NC}"
fi

# ---- Create database if not exists ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"
if command -v createdb &> /dev/null; then
  createdb ai_sales_training 2>/dev/null && echo -e "  ${GREEN}Database created${NC}" || echo -e "  ${GREEN}Database already exists${NC}"
else
  echo -e "  ${YELLOW}createdb not found, attempting with psql...${NC}"
  psql -U postgres -c "CREATE DATABASE ai_sales_training;" 2>/dev/null || echo -e "  ${GREEN}Database already exists${NC}"
fi

# ---- Install dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ]; then
  echo -e "  ${CYAN}Installing server dependencies...${NC}"
  npm install --silent
else
  echo -e "  ${GREEN}Server dependencies ready${NC}"
fi

cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ]; then
  echo -e "  ${CYAN}Installing client dependencies...${NC}"
  npm install --silent
else
  echo -e "  ${GREEN}Client dependencies ready${NC}"
fi

# ---- Seed database ----
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/server"
node seeds/seed.js
echo -e "  ${GREEN}Database seeded with sample data (15 items per feature)${NC}"

# ---- Start application ----
echo -e "${YELLOW}[6/6] Starting application...${NC}"
echo ""

# Start server with nodemon for hot reload
cd "$PROJECT_DIR/server"
echo -e "  ${CYAN}Starting server on port 4000 (with hot reload)...${NC}"
npx nodemon index.js &
SERVER_PID=$!

# Wait for server to be ready
sleep 3

# Start client with hot reload (react-scripts has built-in hot reload)
cd "$PROJECT_DIR/client"
echo -e "  ${CYAN}Starting client on port 3000 (with hot reload)...${NC}"
BROWSER=none PORT=3000 npm start &
CLIENT_PID=$!

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗"
echo -e "║  Application Started Successfully!                ║"
echo -e "╠══════════════════════════════════════════════════╣"
echo -e "║                                                  ║"
echo -e "║  Frontend:  http://localhost:3000                ║"
echo -e "║  Backend:   http://localhost:4000                ║"
echo -e "║                                                  ║"
echo -e "║  Demo Login:                                     ║"
echo -e "║    Email:    demo@demo.com                       ║"
echo -e "║    Password: password123                         ║"
echo -e "║                                                  ║"
echo -e "║  Hot Reload: Active (code changes auto-refresh)  ║"
echo -e "║                                                  ║"
echo -e "║  Press Ctrl+C to stop all services               ║"
echo -e "╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Handle Ctrl+C gracefully
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down...${NC}"
  kill $SERVER_PID 2>/dev/null || true
  kill $CLIENT_PID 2>/dev/null || true
  kill_port 4000
  kill_port 3000
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
