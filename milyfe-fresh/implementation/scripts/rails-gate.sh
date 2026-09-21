#!/usr/bin/env bash
# Rails law gate: forbidden payment rails must never appear in Tree V1 code.
# Fails CI if GoCardless / Whop / Stripe / Visa / Mastercard integration code exists.
set -u
hits=$(grep -r -i -E "gocardless|whop|stripe|visa|mastercard" src supabase tests scripts 2>/dev/null \
  | grep -v "rails-gate.sh" \
  | grep -v -i "no .*\(gocardless\|whop\|stripe\|visa\)" \
  | grep -v -i "forbidden" || true)
if [ -n "$hits" ]; then echo "RAILS-GATE FAIL: forbidden rail reference found:"; echo "$hits"; exit 1; fi
echo "RAILS-GATE PASS: no GoCardless/Whop/Stripe/Visa-MC code."
