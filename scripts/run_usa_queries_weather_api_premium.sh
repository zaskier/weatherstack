#!/bin/bash

# --- WeatherStack API Population Script (Premium) 🌦️ ---
# This script creates 30 properties across the USA using the GraphQL API.
# Designed for high-tier API plans with no rate limits.

ENDPOINT="http://localhost:8080/graphql"

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

printf "%b🚀 Starting USA Property Population (Premium)...%b\n" "${BLUE}" "${NC}"
printf "%s\n" "------------------------------------------"

# List of 30 USA Locations: City|State|Zip|Street
LOCATIONS=(
  "New York|NY|10001|5th Ave"
  "Los Angeles|CA|90001|Sunset Blvd"
  "Chicago|IL|60601|Michigan Ave"
  "Houston|TX|77001|Main St"
  "Phoenix|AZ|85001|Central Ave"
  "Philadelphia|PA|19101|Broad St"
  "San Antonio|TX|78201|Market St"
  "San Diego|CA|92101|Broadway"
  "Dallas|TX|75201|Elm St"
  "San Jose|CA|95101|First St"
  "Austin|TX|78701|Congress Ave"
  "Jacksonville|FL|32201|Ocean St"
  "Fort Worth|TX|76101|Commerce St"
  "Columbus|OH|43201|High St"
  "Charlotte|NC|28201|Tryon St"
  "Indianapolis|IN|46201|Washington St"
  "San Francisco|CA|94101|Market St"
  "Seattle|WA|98101|Pike St"
  "Denver|CO|80201|Colfax Ave"
  "Oklahoma City|OK|73101|Sheridan Ave"
  "Nashville|TN|37201|Broadway"
  "El Paso|TX|79901|Mesa St"
  "Washington|DC|20001|Pennsylvania Ave"
  "Las Vegas|NV|89101|Las Vegas Blvd"
  "Boston|MA|02101|Washington St"
  "Portland|OR|97201|Burnside St"
  "Louisville|KY|40201|Main St"
  "Memphis|TN|38101|Beale St"
  "Detroit|MI|48201|Woodward Ave"
  "Baltimore|MD|21201|Charles St"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for loc in "${LOCATIONS[@]}"; do
  IFS='|' read -r CITY STATE ZIP STREET <<< "$loc"
  
  printf "📡 Creating property in %b%s, %s%b... " "${GREEN}" "$CITY" "$STATE" "${NC}"

  # Constructing JSON payload more safely
  PAYLOAD=$(cat <<EOF
{
  "query": "mutation { createProperty(city: \"$CITY\", street: \"$STREET\", state: \"$STATE\", zipCode: \"$ZIP\") { id weather { temperature weatherDescriptions } } }"
}
EOF
)

  # Execute CURL
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    $ENDPOINT)

  if [[ $RESPONSE == *"\"id\""* ]]; then
    # Improved extraction logic
    TEMP=$(echo "$RESPONSE" | sed -n 's/.*"temperature":\([0-9-]*\).*/\1/p')
    DESC=$(echo "$RESPONSE" | sed -n 's/.*"weatherDescriptions":\["\([^"]*\)".*/\1/p')
    printf "✅ %bSuccess!%b (Temp: %s°C, %s)\n" "${GREEN}" "${NC}" "$TEMP" "$DESC"
    ((SUCCESS_COUNT++))
  else
    # Extract error message if possible
    ERROR_MSG=$(echo "$RESPONSE" | sed -n 's/.*"message":"\([^"]*\)".*/\1/p')
    if [ -z "$ERROR_MSG" ]; then ERROR_MSG="Unknown Error"; fi
    printf "❌ %bFailed!%b (%s)\n" "${RED}" "${NC}" "$ERROR_MSG"
    ((FAIL_COUNT++))
  fi
done

printf "%s\n" "------------------------------------------"
printf "%b🏁 Population Complete!%b\n" "${BLUE}" "${NC}"
printf "📊 Summary: %b%d Successes%b, %b%d Failures%b\n" "${GREEN}" $SUCCESS_COUNT "${NC}" "${RED}" $FAIL_COUNT "${NC}"
printf "✨ Database is now ready for testing queries & sorting.\n"
