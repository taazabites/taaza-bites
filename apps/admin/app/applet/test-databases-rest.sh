#!/bin/bash
API_KEY="AIzaSyAPxUmNPzAgRGNm7AeqR0hXpTilEguDlXs"
PROJECT_ID="gen-lang-client-0684462293"
APPLET_ID="f2702470-dbd9-4fd8-8d80-708eb0bdb4c2"

prefixes=(
  "taazabites"
  "taazabitescustomer"
  "taazabites-customer"
  "taazabitescust"
  "taazabites-cust"
  "taazabitesb2c"
  "taazabites-b2c"
  "taazabitescustomerp"
  "taazabites-customerp"
  "taazabitescustomerportal"
  "taazabites-customerportal"
  "taazabitesportal"
  "taazabites-portal"
  "taazabitesclient"
  "taazabites-client"
  "taazabitesweb"
  "taazabites-web"
  "taazabiteswebsite"
  "taazabites-website"
  "taazabitesstorefront"
  "taazabites-storefront"
  "taazabitesuser"
  "taazabites-user"
  "taazabites-admin"
  "taazabitesadmin"
  "taazabitesadmint"
)

for prefix in "${prefixes[@]}"; do
  db_id="ai-studio-${prefix}-${APPLET_ID}"
  url="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${db_id}/documents/settings?key=${API_KEY}"
  
  response=$(curl -s -w "\n%{http_code}" "$url")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)
  
  if [[ "$http_code" -eq 200 ]]; then
    echo "Database: ${db_id} - STATUS: EXISTS (200 OK)"
  elif [[ "$body" == *"PERMISSION_DENIED"* || "$body" == *"permission"* ]]; then
    echo "Database: ${db_id} - STATUS: EXISTS (403 Permission Denied)"
  elif [[ "$body" == *"NOT_FOUND"* || "$body" == *"not found"* || "$body" == *"does not exist"* ]]; then
    # It might be document not found (which means database exists) or database not found.
    # Let's check the error message.
    if [[ "$body" == *"Database"* && "$body" == *"does not exist"* ]]; then
      echo "Database: ${db_id} - STATUS: NOT FOUND"
    else
      echo "Database: ${db_id} - STATUS: EXISTS (404 Document Not Found)"
    fi
  else
    echo "Database: ${db_id} - STATUS: CODE ${http_code} (Response: ${body})"
  fi
done
