
Goal (do only the 4 requested changes; no admin dashboard; no other refactors):
1) Make the active predictions fetch more robust (30s timeout, 3 retries with 5s backoff, caching that prevents re-render refetch but still allows manual refresh), and add the exact console logging needed to see the real failure cause.
2) Ensure `Predictions.tsx` is not passing a `ref` to `MobileNav` (remove if present).
3) Ensure the maintenance UI only appears after all 3 retries fail; during retries/loading show skeleton cards instead.
4) Validate in the browser console + network that predictions actually load and render.

What I found in the codebase right now (important):
- `src/hooks/usePredictions.ts` already has:
  - `FETCH_TIMEOUT_MS = 30000` (30s) ✅
  - a 3-attempt loop with a 5s delay between attempts ✅
  - console logs for attempt + response status + prediction count ✅
  - throws `MaintenanceError` only after all 3 attempts fail ✅
  - `staleTime: Infinity`, `refetchOnMount: false`, etc. ✅
- However, it also has a global in-memory cache:
  - `let activePredictionsCache ...`
  - queryFn returns cached predictions immediately if present
  - This currently breaks manual refresh: calling `refetch()` will still return cached data and never actually hit the API. This is a likely contributor to “stuck” behavior during debugging and can mask recovery if the first load failed.
- `src/pages/Predictions.tsx`:
  - Currently renders `<MobileNav />` with no `ref` prop ✅ (so requirement #2 may already be satisfied in this file)
  - Shows `<MaintenanceState />` when `isMaintenanceMode` is true.
  - Shows skeletons when `isLoading && !isMaintenanceMode`
- `src/components/MaintenanceState.tsx`:
  - Always renders a full “Crunching…” maintenance card and also shows skeletons inside it.
  - It can auto-retry by calling `onRetry`, but it doesn’t have any way to know whether the parent hook is currently retrying/loading, so it cannot switch to “skeleton-only while retrying” behavior cleanly without a prop.

Constraints (per your instruction):
- Only touch these files:
  - `src/hooks/usePredictions.ts`
  - `src/pages/Predictions.tsx`
  - `src/components/MaintenanceState.tsx`
- No other changes.

Implementation plan (exact edits)

A) usePredictions.ts (make the retries + logging airtight, and fix caching so refresh works)
Edits in `src/hooks/usePredictions.ts` inside `useActivePredictions()`:

1) Add the exact debug logs you requested (and a bit more detail to diagnose CORS/CSP vs timeout vs network):
   - Before fetch: log “Fetching from API…” + attempt number.
   - After fetch: log status.
   - On success: log whether data is array or object, plus extracted length.
   - On failure: log a structured error including:
     - `error.name`, `error.message`
     - if it’s an AbortError (timeout), log that explicitly
     - log `navigator.onLine` and current page origin to help diagnose blocked requests.

2) Keep timeout at 30s (already correct), but ensure the fetch request is “plain browser fetch”:
   - Use `fetch(url, { signal, headers: { Accept: 'application/json' } })`
   - Do not add credentials.

3) Keep retry behavior as “wait 5s, retry up to 3 times” (already implemented) but make sure each attempt logs clearly:
   - attempt start
   - attempt failure
   - “waiting 5s before retry”
   - final failure message thrown as MaintenanceError

4) Fix “cache response in state” without breaking manual refresh:
   - Replace the current “return cache immediately” behavior with one of these approaches (I will implement the safest within-file approach):
     Approach I (recommended, minimal surface area):
     - Keep the global `activePredictionsCache`, but do NOT short-circuit the queryFn on every run.
     - Instead, feed the cache into React Query as `initialData` (so the first render uses cached data) and let React Query control subsequent fetches.
     - Additionally, wrap the returned `refetch` so it clears `activePredictionsCache = null` before refetching, ensuring manual refresh truly hits the API.
   - This satisfies:
     - “once data loads, don’t refetch on re-render” (handled by `staleTime: Infinity`, `refetchOnMount: false`, etc.)
     - “cache response” (we’ll store the last successful predictions in `activePredictionsCache`)
     - “refresh works” (clear cache before refetch)

5) Ensure maintenance mode is triggered only after all retries fail:
   - This is already true (MaintenanceError thrown only after attempts exhausted). Keep it.

Expected outcome after (A):
- You’ll see extremely clear console logs explaining why the fetch fails (CORS, CSP, timeout, DNS, etc.).
- Manual “Refresh” button will actually re-hit the API (currently it likely doesn’t if cache is populated).

B) Predictions.tsx (remove any ref passed to MobileNav; ensure retry/loading shows skeletons, maintenance only after final failure)
Edits in `src/pages/Predictions.tsx`:

1) Confirm no `ref` prop is passed to `<MobileNav />`.
   - Right now it’s just `<MobileNav />` at the bottom; no change needed unless we discover a `ref` is being threaded in via props (it isn’t in this file).
   - If there is any `ref` usage found during implementation, remove it here (per requirement).

2) Adjust maintenance-vs-skeleton display to match your requirement precisely:
   - Right now:
     - loading => skeleton
     - isMaintenanceMode => MaintenanceState
   - Add a rule: when MaintenanceState triggers an auto-retry/manual retry, we should show skeletons while that retry is in progress (instead of the maintenance card).
   - Since the hook exposes `isFetching`, we can pass a prop like `isRetrying={isFetching}` to MaintenanceState and let it render skeleton-only when `isRetrying` is true.
   - This remains within the allowed files and aligns with “While loading/retrying, show skeleton loading cards instead”.

Expected outcome after (B):
- No ref is passed to MobileNav from Predictions page.
- If we end up in maintenance mode, and the user retries, the UI switches to skeletons during the retry fetch instead of staying stuck on the maintenance card.

C) MaintenanceState.tsx (skeleton-only while retrying; still show maintenance after retries fail)
Edits in `src/components/MaintenanceState.tsx`:

1) Add an optional prop:
   - `isRetrying?: boolean`
   - This is controlled by the parent (Predictions.tsx) via `isFetching`.

2) Rendering logic:
   - If `isRetrying === true`:
     - Render only skeleton cards (and optionally a small “Connecting…” line), but do not show the big “Crunching…” maintenance messaging.
   - Else (not retrying):
     - Render the existing maintenance UI (title/subtitle, countdown, retry button).

3) Keep the auto-retry timer behavior, but when it triggers retry:
   - It calls `onRetry()` (existing)
   - Parent’s `isFetching` flips to true, so MaintenanceState immediately switches into skeleton-only view.

Expected outcome after (C):
- Maintenance screen is only the “final state” after all retries fail.
- During any retry attempt started from the maintenance view, the user sees skeleton cards, not the maintenance hero.

D) Test/verification steps (what I will do immediately after implementing)
1) Open the preview and navigate to `/predictions`.
2) Open browser console:
   - Confirm logs appear in this order:
     - “Fetching from API… attempt 1”
     - “Response status: 200” (or error)
     - “Data received: X predictions”
   - If failing, capture the exact error (CORS/CSP/TypeError/AbortError).
3) Check Network tab:
   - Verify a real request to `https://api.edge88.net/api/v1/predictions/active?include_details=true` is present.
   - If no request appears, that points strongly to a CSP / blocked-connect / browser extension issue; the console error should explicitly say so after the logging changes.
4) Confirm UI:
   - Predictions list renders real cards.
   - Refresh button actually triggers a new network request (not cached short-circuit).
   - MaintenanceState only appears after all 3 attempts fail; during retries it shows skeletons.

Notes / likely root cause based on current evidence
- Your console logs show `[usePredictions] Fetching from API... attempt 1`, but we do not see “Response status” or “Fetch error”.
- The browser network capture also shows no requests to api.edge88.net.
- That pattern often indicates a browser-blocked request (CSP/connect-src, extension, or an early exception before fetch), which the improved structured error logging will expose clearly.

Scope confirmation (to ensure I do exactly what you asked)
- I will not start the admin dashboard work.
- I will not modify any files beyond the three you listed.
- I will not refactor unrelated warnings (e.g., the separate “function components cannot be given refs” warning involving `UserDropdownMenu`) since you explicitly said not to touch other files.
