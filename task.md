# Task Analysis: Financial Dashboard Stabilization & Optimization

## 🔴 Critical Blocks
- [x] Fix Syntax Error in `KpiCards.tsx` (Line 190) - **P0**
- [x] Fix `useAuth` destructuring in `KpiCards.tsx` (Initial Balance sync)
- [x] Fix "Economy card" logic (dynamic colors + correct % calculation)
- [x] Fix "Pendencies" registration & visibility
- [x] Restrict Dashboard transaction list to **REALISED** transactions only
- [x] Update Chart: Only realized values for bars + Projected balance line
- [ ] Verify each step via `firecrawl agent-browser`

## 📊 Business Logic Review
- **Economy %**: `(Monthly Economy / Total Monthly Income) * 100`? Or total balance? User hint: "if total is 1000 and economy is 100, it's 10%". Assuming "total" refers to the month's turnover or balance. Actually, usually economy % is relative to income. I will check the user's previous instructions.
- **Projected Balance**: Balance + Predicted Income - Predicted Expenses.

## 🧪 Verification Plan
1. Fix syntax -> Start dev server.
2. Open browser -> Verify landing page.
3. Login -> Check if session holds.
4. Add pending transaction -> Check if it appears in Pending card/view.
5. Check Economy Card -> Positive (Green), Negative (Red).
6. Check Chart -> Bars (Realized), Line (Projected).
7. Check Dashboard List -> Only realized.

