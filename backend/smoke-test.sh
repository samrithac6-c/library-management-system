#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8080}"
JSON='{"title":"Smoke Test Book","author":"API Tester","isbn":"9780000000001","category":"Testing","publisher":"SOP Press","publicationYear":2024,"quantity":2}'

request() {
  local method="$1" url="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    curl -sS -X "$method" "$BASE_URL$url" -H 'Content-Type: application/json' -d "$body" -w '\nHTTP_STATUS:%{http_code}\n'
  else
    curl -sS -X "$method" "$BASE_URL$url" -w '\nHTTP_STATUS:%{http_code}\n'
  fi
}

created="$(request POST /api/books "$JSON")"
echo "$created"
id="$(printf '%s\n' "$created" | sed -n 's/.*"id":\([0-9][0-9]*\).*/\1/p' | head -n 1)"
test -n "$id"

echo "READ"
request GET "/api/books/$id"

echo "UPDATE"
request PUT "/api/books/$id" '{"title":"Smoke Test Book Updated","author":"API Tester","isbn":"9780000000001","category":"Testing","publisher":"SOP Press","publicationYear":2025,"quantity":3}'
echo "ISSUE"
request POST "/api/books/$id/issue"
echo "RETURN"
request POST "/api/books/$id/return"
echo "DUPLICATE ISBN (expected 409)"
duplicate="$(request POST /api/books "$JSON")"
echo "$duplicate"
grep -q 'HTTP_STATUS:409' <<< "$duplicate"
echo "MISSING ID (expected 404)"
missing="$(request GET /api/books/999999999)"
echo "$missing"
grep -q 'HTTP_STATUS:404' <<< "$missing"
echo "DELETE"
deleted="$(request DELETE "/api/books/$id")"
echo "$deleted"
grep -q 'HTTP_STATUS:204' <<< "$deleted"
echo "READ AFTER DELETE (expected 404)"
after_delete="$(request GET "/api/books/$id")"
echo "$after_delete"
grep -q 'HTTP_STATUS:404' <<< "$after_delete"
echo "CRUD_SMOKE_TEST=PASS"
