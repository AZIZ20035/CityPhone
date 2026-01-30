# Invoice Save 500 – Debug Notes

## Reproduction attempt (local)
1) Started dev server (`npm run dev`).
2) Auth request via credentials.
3) POST `/api/invoices` with minimal payload.

### Terminal output
```
AUTH_MISSING_SESSION {
  requestId: '3e7d7c27-eca0-46f8-b416-f20a38569a91',
  path: '/api/invoices',
  method: 'POST',
  code: 'UNAUTHORIZED'
}
POST /api/invoices 401 in 137ms
```

### Result
- Local reproduction returned **401 UNAUTHORIZED** (no session cookie).
- No 500 stack trace reproduced locally.

## Root cause (observed)
- **AUTH ERROR**: missing session cookie results in 401 for `/api/invoices`.
- In this environment, session cookie is not persisted (likely due to cookie mismatch / NEXTAUTH_URL configuration).

## Next steps to capture 500 in production
1) Use `/api/version` and `/api/health` to confirm build + DB health.
2) Check server logs for `API_ERROR` with requestId.
3) Use `scripts/verify-invoice-save.mjs` on the same deployment.

## Safeguards added
- `requestId` propagated for every API request.
- `withApiHandler` returns JSON with `details` in dev only.
- `/api/invoices` logs stage-by-stage markers to pinpoint failure.
