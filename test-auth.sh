#!/bin/bash

# Authentication API Testing Script
# Make sure your server is running on http://localhost:3000

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"
PASSWORD="password123"
NAME="Test User"

echo "🧪 Testing Authentication APIs..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        fi
    else
        if [ -n "$headers" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "$headers"
        else
            curl -s -X $method "$BASE_URL$endpoint"
        fi
    fi
}

echo -e "\n${YELLOW}1. Testing Sign Up...${NC}"
SIGNUP_RESPONSE=$(make_request "POST" "/auth/signup" "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "Response: $SIGNUP_RESPONSE"

# Extract tokens from signup response
ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Sign Up successful!${NC}"
    echo "Access Token: ${ACCESS_TOKEN:0:50}..."
    echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Sign Up failed!${NC}"
    echo "Response: $SIGNUP_RESPONSE"
    exit 1
fi

echo -e "\n${YELLOW}2. Testing Sign In...${NC}"
SIGNIN_RESPONSE=$(make_request "POST" "/auth/signin" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "Response: $SIGNIN_RESPONSE"

# Extract new tokens from signin response
NEW_ACCESS_TOKEN=$(echo $SIGNIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
NEW_REFRESH_TOKEN=$(echo $SIGNIN_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Sign In successful!${NC}"
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
    REFRESH_TOKEN=$NEW_REFRESH_TOKEN
else
    echo -e "${RED}❌ Sign In failed!${NC}"
    echo "Response: $SIGNIN_RESPONSE"
fi

echo -e "\n${YELLOW}3. Testing Get Profile...${NC}"
PROFILE_RESPONSE=$(make_request "GET" "/auth/profile" "" "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $PROFILE_RESPONSE"

if echo "$PROFILE_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Get Profile successful!${NC}"
else
    echo -e "${RED}❌ Get Profile failed!${NC}"
fi

echo -e "\n${YELLOW}4. Testing Get All Users...${NC}"
USERS_RESPONSE=$(make_request "GET" "/users" "" "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $USERS_RESPONSE"

if echo "$USERS_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Get All Users successful!${NC}"
else
    echo -e "${RED}❌ Get All Users failed!${NC}"
fi

echo -e "\n${YELLOW}5. Testing Token Refresh...${NC}"
REFRESH_RESPONSE=$(make_request "POST" "/auth/refresh" "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
echo "Response: $REFRESH_RESPONSE"

# Extract new tokens from refresh response
REFRESHED_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESHED_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$REFRESHED_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Token Refresh successful!${NC}"
    ACCESS_TOKEN=$REFRESHED_ACCESS_TOKEN
    REFRESH_TOKEN=$REFRESHED_REFRESH_TOKEN
else
    echo -e "${RED}❌ Token Refresh failed!${NC}"
fi

echo -e "\n${YELLOW}6. Testing Logout...${NC}"
LOGOUT_RESPONSE=$(make_request "POST" "/auth/logout" "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
echo "Response: $LOGOUT_RESPONSE"

if echo "$LOGOUT_RESPONSE" | grep -q '"message"'; then
    echo -e "${GREEN}✅ Logout successful!${NC}"
else
    echo -e "${RED}❌ Logout failed!${NC}"
fi

echo -e "\n${YELLOW}7. Testing Protected Route Without Token...${NC}"
PROTECTED_RESPONSE=$(make_request "GET" "/users" "")
echo "Response: $PROTECTED_RESPONSE"

if echo "$PROTECTED_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${GREEN}✅ Protection working correctly!${NC}"
else
    echo -e "${RED}❌ Protection not working!${NC}"
fi

echo -e "\n${GREEN}🎉 Authentication API Testing Complete!${NC}"
echo "=================================="
