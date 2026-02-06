# Mobile Strategy for Milktea

## Current Stack
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Convex (realtime database)
- **UI Components**: Radix UI, custom fonts (Mondwest, Neuebit, Cygnito)
- **PWA Groundwork**: Already has `manifest.json`, apple-web-app-capable meta tags

---

## Requirements (Confirmed)
- ✅ **Offline editing is crucial** - must work with no internet
- ✅ **Manual sync button** - no automatic background sync needed
- ✅ **No merge conflicts** - if conflict, create separate entries
- ✅ **Instant load** - today's journal ready immediately on app open
- ✅ **Fast browsing** - recent journals accessible quickly
- ✅ **Data size** - ~1 string per day, 1000+ days, lazy load older entries
- ✅ **Auth required** - needs login for security

---

## Architecture: Local-First with Manual Sync

```
┌─────────────────────────────────────────────────────────────────────┐
│                           APP LAUNCH                                │
│                              ↓                                      │
│                    Load from LOCAL STORAGE                          │
│                    (instant, no network)                            │
│                              ↓                                      │
│              ┌──────────────────────────────┐                       │
│              │  Today's journal READY       │  ← 0ms wait           │
│              │  Recent 90 days cached       │                       │
│              └──────────────────────────────┘                       │
│                              │                                      │
│         User writes/edits    │    User taps SYNC                    │
│                ↓             │           ↓                          │
│         Save to LOCAL        │    ┌─────────────────┐               │
│         (instant)            │    │ Push local →    │               │
│                              │    │ Pull remote →   │               │
│                              │    │ Merge (or dupe) │               │
│                              │    └─────────────────┘               │
│                                          ↓                          │
│                                   Update LOCAL cache                │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This is Fast

1. **Zero network on launch** - reads from IndexedDB/SQLite immediately
2. **Pre-cached recent entries** - last 90 days always available
3. **Lazy load older** - fetch from Convex only when scrolling back
4. **Writes are local-first** - no waiting for network round-trip

---

## Tech Stack

| Layer | Web | iOS (Capacitor) |
|-------|-----|-----------------|
| UI | React + Tailwind | Same (WebView) |
| Local Storage | IndexedDB via Dexie.js | Same (works in WebView) |
| Auth Token | localStorage | Capacitor Preferences (secure) |
| Sync | Convex client | Convex client |

**Key dependency:** [Dexie.js](https://dexie.org/) - lightweight IndexedDB wrapper that works identically on web and in Capacitor WebView.

---

## Data Model

```typescript
// lib/db.ts
import Dexie, { Table } from 'dexie';

interface LocalNotepad {
  date: string;           // "2026-02-06" - primary key
  title: string;
  content: string;
  localUpdatedAt: number; // timestamp of last local edit
  remoteId?: string;      // Convex _id once synced
  syncStatus: 'synced' | 'pending' | 'conflict';
}

interface SyncMeta {
  key: string;
  value: string;
}

class MilkteaDB extends Dexie {
  notepads!: Table<LocalNotepad>;
  meta!: Table<SyncMeta>;

  constructor() {
    super('milktea');
    this.version(1).stores({
      notepads: 'date, syncStatus, localUpdatedAt',
      meta: 'key'
    });
  }
}

export const db = new MilkteaDB();
```

### Storage Estimates
- 1000 days × ~2KB avg per entry = **~2MB total**
- IndexedDB limit: **50MB+ on iOS Safari**, unlimited with user permission
- Conclusion: Can store EVERYTHING locally, no lazy loading needed initially

---

## Implementation Plan

### Phase 1: Local Storage Layer (2-3 days)

**1.1 Install Dexie**
```bash
npm install dexie
```

**1.2 Create database schema** (`lib/db.ts` as shown above)

**1.3 Create hooks for local-first operations**

```typescript
// hooks/useLocalNotepad.ts
import { useEffect, useState, useCallback } from 'react';
import { db, LocalNotepad } from '@/lib/db';

export function useLocalNotepad(date: string) {
  const [notepad, setNotepad] = useState<LocalNotepad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount - INSTANT
  useEffect(() => {
    db.notepads.get(date).then((entry) => {
      if (entry) {
        setNotepad(entry);
      } else {
        // Create empty entry for today
        const newEntry: LocalNotepad = {
          date,
          title: '',
          content: '',
          localUpdatedAt: Date.now(),
          syncStatus: 'pending'
        };
        db.notepads.put(newEntry);
        setNotepad(newEntry);
      }
      setIsLoading(false);
    });
  }, [date]);

  // Update locally - INSTANT, no network
  const updateContent = useCallback(async (content: string) => {
    const updated = {
      ...notepad!,
      content,
      localUpdatedAt: Date.now(),
      syncStatus: 'pending' as const
    };
    await db.notepads.put(updated);
    setNotepad(updated);
  }, [notepad]);

  const updateTitle = useCallback(async (title: string) => {
    const updated = {
      ...notepad!,
      title,
      localUpdatedAt: Date.now(),
      syncStatus: 'pending' as const
    };
    await db.notepads.put(updated);
    setNotepad(updated);
  }, [notepad]);

  return { notepad, isLoading, updateContent, updateTitle };
}
```

**1.4 Create hook for recent entries list**

```typescript
// hooks/useRecentNotepads.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useRecentNotepads(limit = 90) {
  const notepads = useLiveQuery(
    () => db.notepads
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray(),
    [limit]
  );
  
  return { notepads: notepads ?? [], isLoading: notepads === undefined };
}
```

### Phase 2: Sync Logic (2-3 days)

```typescript
// lib/sync.ts
import { db } from './db';
import { ConvexClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function syncAll(convex: ConvexClient) {
  const results = { pushed: 0, pulled: 0, conflicts: 0 };
  
  // 1. Push pending local changes
  const pending = await db.notepads.where('syncStatus').equals('pending').toArray();
  
  for (const local of pending) {
    try {
      if (local.remoteId) {
        // Update existing
        await convex.mutation(api.notepads.updateContent, {
          notepadId: local.remoteId,
          content: local.content
        });
        await convex.mutation(api.notepads.updateTitle, {
          notepadId: local.remoteId,
          title: local.title
        });
      } else {
        // Create new
        const remoteId = await convex.mutation(api.notepads.createNotepad, {
          title: local.title,
          content: local.content,
          date: local.date
        });
        local.remoteId = remoteId;
      }
      local.syncStatus = 'synced';
      await db.notepads.put(local);
      results.pushed++;
    } catch (e) {
      console.error('Sync failed for', local.date, e);
    }
  }
  
  // 2. Pull remote changes
  const remoteAll = await convex.query(api.notepads.listAll, {});
  
  for (const remote of remoteAll) {
    const local = await db.notepads.get(remote.date);
    
    if (!local) {
      // New from remote
      await db.notepads.put({
        date: remote.date,
        title: remote.title,
        content: remote.content,
        remoteId: remote._id,
        localUpdatedAt: Date.now(),
        syncStatus: 'synced'
      });
      results.pulled++;
    } else if (local.syncStatus === 'synced') {
      // Update local with remote (no local edits pending)
      await db.notepads.put({
        ...local,
        title: remote.title,
        content: remote.content,
        syncStatus: 'synced'
      });
      results.pulled++;
    } else if (local.syncStatus === 'pending' && local.remoteId === remote._id) {
      // Conflict: local and remote both changed
      // Strategy: Keep local, create duplicate entry for remote version
      const conflictDate = `${remote.date}-conflict-${Date.now()}`;
      await db.notepads.put({
        date: conflictDate,
        title: `[From Cloud] ${remote.title}`,
        content: remote.content,
        remoteId: undefined, // Will sync as new entry
        localUpdatedAt: Date.now(),
        syncStatus: 'pending'
      });
      results.conflicts++;
    }
  }
  
  return results;
}
```

**Sync UI Component**

```typescript
// components/SyncButton.tsx
'use client';
import { useState } from 'react';
import { useConvex } from 'convex/react';
import { syncAll } from '@/lib/sync';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';

export function SyncButton() {
  const convex = useConvex();
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done' | 'offline'>('idle');
  const [results, setResults] = useState<{ pushed: number; pulled: number } | null>(null);

  const handleSync = async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }
    
    setStatus('syncing');
    try {
      const r = await syncAll(convex);
      setResults(r);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setStatus('offline');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <button onClick={handleSync} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100">
      {status === 'idle' && <Cloud className="w-4 h-4" />}
      {status === 'syncing' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'done' && <Check className="w-4 h-4 text-green-500" />}
      {status === 'offline' && <CloudOff className="w-4 h-4 text-red-500" />}
      <span className="text-sm">
        {status === 'idle' && 'Sync'}
        {status === 'syncing' && 'Syncing...'}
        {status === 'done' && `Synced`}
        {status === 'offline' && 'Offline'}
      </span>
    </button>
  );
}
```

### Phase 3: Capacitor Setup (1-2 hours)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/preferences
npx cap init milktea com.yourdomain.milktea --web-dir=out

# Add iOS platform
npx cap add ios
```

**Update next.config.ts for static export:**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // ... existing config
};

export default nextConfig;
```

**Add build scripts:**

```json
// package.json
{
  "scripts": {
    "build:ios": "next build && npx cap sync ios",
    "open:ios": "npx cap open ios"
  }
}
```

### Phase 4: Auth Strategy (1 day)

**Problem:** User needs to log in for security, but app should work offline after initial login.

**Solution:** Persistent auth token stored locally.

```typescript
// lib/auth.ts
import { Preferences } from '@capacitor/preferences';

const AUTH_KEY = 'milktea_auth_token';
const USER_KEY = 'milktea_user';

export async function saveAuthToken(token: string, user: { email: string }) {
  await Preferences.set({ key: AUTH_KEY, value: token });
  await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
}

export async function getAuthToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: AUTH_KEY });
  return value;
}

export async function getUser(): Promise<{ email: string } | null> {
  const { value } = await Preferences.get({ key: USER_KEY });
  return value ? JSON.parse(value) : null;
}

export async function clearAuth() {
  await Preferences.remove({ key: AUTH_KEY });
  await Preferences.remove({ key: USER_KEY });
}
```

**App Launch Flow:**

```
1. App opens
2. Check for saved auth token
   ├── Token exists → Show app immediately (offline-capable)
   └── No token → Show login screen
3. On login success → Save token + sync initial data
4. User can now use app offline indefinitely
```

### Phase 5: iOS Polish (1 day)

```bash
npm install @capacitor/status-bar @capacitor/keyboard @capacitor/haptics @capacitor/splash-screen
```

**Safe areas in Tailwind:**

```css
/* globals.css */
@supports (padding-top: env(safe-area-inset-top)) {
  .safe-top { padding-top: env(safe-area-inset-top); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
}
```

**Configure capacitor.config.ts:**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.milktea',
  appName: 'milktea',
  webDir: 'out',
  server: {
    // For development, can use live reload
    // url: 'http://192.168.x.x:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // We'll hide after data loads
      backgroundColor: '#000000'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;
```

---

## File Structure (Final)

```
milktea/
├── app/                        # Next.js pages (minimal changes)
├── components/
│   ├── SyncButton.tsx          # NEW: Manual sync trigger
│   └── ...
├── hooks/
│   ├── useLocalNotepad.ts      # NEW: Local-first notepad
│   └── useRecentNotepads.ts    # NEW: Recent entries list
├── lib/
│   ├── db.ts                   # NEW: Dexie database
│   ├── sync.ts                 # NEW: Sync logic
│   └── auth.ts                 # NEW: Auth token storage
├── capacitor.config.ts         # NEW: Capacitor config
├── ios/                        # NEW: Xcode project (generated)
└── package.json
```

---

## Migration Path

To avoid breaking the current web app while adding mobile support:

1. **Keep Convex hooks as fallback** for web (real-time updates still work)
2. **Add local-first hooks** that web can optionally use
3. **Detect platform** to choose strategy:

```typescript
// lib/platform.ts
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const isWeb = !isNative;

// In components:
const { notepad, updateContent } = isNative 
  ? useLocalNotepad(date) 
  : useConvexNotepad(date);  // existing hook
```

Or just go fully local-first on both platforms (recommended for simplicity).

---

## Timeline

| Phase | Effort | Description |
|-------|--------|-------------|
| Dexie + local hooks | 2 days | Local storage, instant reads/writes |
| Sync logic + UI | 2 days | Manual sync button, conflict handling |
| Capacitor setup | 2 hours | iOS build working |
| Auth persistence | 1 day | Login once, use offline |
| iOS polish | 1 day | Safe areas, keyboard, splash |
| Testing | 1 day | Simulator + real device |
| **Total** | **~7 days** | |

---

## Remaining Questions

1. **Bundle ID**: What should the iOS app ID be? (e.g., `com.yourname.milktea`)
2. **Apple Developer Account**: Do you have one, or need to set up?
3. **Existing auth**: What's the current login mechanism? (I see routes but not the provider)

---

## Addendum: Convex Changes Needed

You'll need a new query to fetch all notepads for sync:

```typescript
// convex/notepads.ts
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    return await ctx.db
      .query('notepads')
      .withIndex('by_email_and_date', (q) => q.eq('email', identity.email))
      .collect();
  },
});
