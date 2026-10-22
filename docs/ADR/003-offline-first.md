# ADR-003: Offline-first and synchronization boundaries

## Status

Accepted

## Context

GymLogiX is used in gyms with intermittent connectivity. Workout and routine data
must remain available on the device, while authenticated server data must not be
stored in a shared Cache API cache.

## Decision

1. `public/sw.js` precaches the offline page and a small app shell. It uses
   versioned, bounded caches for static assets, images, and fonts. It never
   caches API responses or arbitrary authenticated HTML.
2. The storage facade caches successful routine/session reads locally and uses
   local copies after a remote read fails. Critical writes fall back to local
   storage and record an owner-scoped pending operation.
3. `syncPendingLocalData` retries queued routine, session, profile, weekly plan,
   active-workout, and supported deletion changes when the authenticated app is
   open and online. Routine mappings keep locally-created routine IDs usable by
   local sessions.
4. Connectivity UI is limited to offline, active sync, and sync failure/success
   feedback. It does not imply that browser `navigator.onLine` proves the
   Supabase service is reachable.
5. Background Sync is only a wake-up hint for an open client; it is not a
   durable server-independent upload mechanism. Browsers can suspend service
   workers and do not guarantee timers or sync execution.

## Consequences and known limits

- Reads and supported writes can continue using previously cached or locally
  saved data. First-use data still requires a connection.
- The local pending queue is scoped by the authenticated owner ID. Pending
  changes are kept on the device if an upload fails and retried on the next
  connection/app start.
- Offline routine, session, and active-workout deletions are queued for the
  authenticated owner and replayed on the next foreground synchronization.
  Conflict resolution for concurrent edits is not implemented; the latest
  locally queued value is uploaded.
- Rest notifications scheduled with service-worker timers are best effort;
  mobile operating systems may suspend the worker before a timer fires.
- The device's local storage is not a substitute for a server backup.

## Date

2026-10-22
