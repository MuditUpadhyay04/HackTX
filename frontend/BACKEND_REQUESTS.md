# Unsaid: Backend Requests (frontend → backend)

**To:** Mudit Upadhyay (backend, `backend/`) · **From:** Gurneal Chandi (frontend, `frontend/`)
**Lives at:** `frontend/BACKEND_REQUESTS.md` in [MuditUpadhyay04/HackTX](https://github.com/MuditUpadhyay04/HackTX). It sits in `frontend/` because Gurneal owns that folder. Mudit, reply inline or in a PR comment. Nothing here edits `backend/`.
**Started:** Oct 24, 2026 (CT)

These are features where the frontend is already designed or built against mock data, with `data-feature-id` placeholders marked NOT YET CONNECTED, and is waiting on a backend. The endpoint shapes below are **suggestions**. Change anything you like, then tell us the final shape so the contract table (`Unsaid_Frontend_Build_Spec.md` Section 9) can be updated.

**How this file works:**
- The frontend's Claude Code session appends a new request whenever it adds a placeholder that needs a backend.
- The backend-sync reviewer agent checks this file against `backend/` and the contract table after every phase.
- **Status values:** `REQUESTED` · `ACCEPTED (Mudit)` · `IN PROGRESS` · `BUILT (endpoint: …)` · `DECLINED / CHANGED (why)`.

---

## Request 1: Photo connectors and face grouping (with on-screen popup)

| | |
|---|---|
| **Status** | REQUESTED |
| **Priority** | **P1** (demo-visible: feeds Screen 3 memory surfacing and the brain graph; not needed for the cold open). Honest priority: the popup can stay mock for the demo. Build the cluster list and name endpoints first. |
| **Screen** | Screen 3 add-on, "Photo connectors and face grouping" (`/memories/connect`, the `/memories?state=faces-popup` sheet, `/memories/people/[clusterId]`) |
| **Frontend status** | Designed in the spec (Section 8.3 add-on, contract rows 111–122). It is built in Phase 4 of the Claude Code prompt against mock data in `frontend/lib/mock/faces.ts`. |

### What the user sees
1. Unsaid → Memories → **"Connect photos"**. A sheet lists the photo sources as look-alike rows (no official logos): **Photos** (iCloud / Apple Photos on the device), **Instagram photos**, **Facebook photos**. Each row has a "Connect" button.
2. After a source is connected and grouping finishes, an **iOS-style popup sheet** appears on screen:
   - Heading: "**We found 4 people in your photos**".
   - Subtitle: "grouped on your phone. only you can see this."
   - Face clusters as avatar circles, each with a photo count and a suggestion: "Mom?" (212), "Jordan?" (148), "Priya?" (96), and "Name this person" (31).
   - Buttons: "see who" and "not now".
3. Tapping a cluster opens a **grid of that person's photos**. From there the user can confirm the suggested name ("Mom?" → Mom), name the person, remove a photo that isn't them, or "add to Mom's memories" (links the cluster to the person node in the brain graph).

### Feature IDs (every one is a NOT YET CONNECTED placeholder today)
| Row | Control | Feature ID | New / shared |
|---|---|---|---|
| 111 | "Connect photos" entry | `photo-connectors-open` | new |
| 112 | "Connect" on Photos (iCloud / Apple Photos look-alike) | `camera-roll-scan` | shared (row 17) |
| 113 | "Connect" on Instagram photos | `graph-api-photo-import` | shared (row 16) |
| 114 | "Connect" on Facebook photos | `graph-api-photo-import` | shared (row 16) |
| 115 | the "We found 4 people" popup sheet (event-driven) | `face-cluster-popup-event` | new |
| 116 | "see who" | `face-clusters-list` | new |
| 117 | tap a face cluster | `face-cluster-photos` | new |
| 118 | "Mom?" suggestion chip (confirm) | `face-cluster-suggestion-accept` | new |
| 119 | "Name this person" | `face-cluster-name` | shared (row 14) |
| 120 | "not now" | `face-cluster-dismiss` | new |
| 121 | "add to Mom's memories" | `face-cluster-link-person` | new |
| 122 | "not them" on a photo in the grid | `face-cluster-photo-remove` | new |

### Suggested endpoints and data shapes (suggestions; your call)

```ts
// shared types
type PhotoSource = "device" | "instagram" | "facebook";
type FaceCluster = {
  clusterId: string;            // stable across re-scans if possible
  coverFaceUrl: string;         // cropped face thumbnail (on-device URL or signed URL)
  photoCount: number;
  suggestedName?: string;       // "Mom" — from Facebook tags / contacts / user history; never from Meta face recognition
  suggestionConfidence?: number;// 0..1, frontend shows "Mom?" only above a threshold you pick
  personId?: string;            // set once the user confirms/links (brain-graph person node)
  sources: PhotoSource[];
};
type ClusterPhoto = { photoId: string; thumbUrl: string; takenAt: string; source: PhotoSource; place?: string };
```

| Feature ID | Suggested call | Request → response |
|---|---|---|
| `photo-connectors-open` | `GET /photos/sources` | → `{ sources: [{ source, label, connected: boolean, lastSyncedAt?: string, available: boolean, unavailableReason?: string }] }` |
| `camera-roll-scan` | `POST /photos/sources/device/connect` (or an on-device job; see notes) | `{ consent: true }` → `{ jobId }` |
| `graph-api-photo-import` | `POST /photos/sources/{instagram\|facebook}/connect` | `{ oauthCode }` → `{ jobId }` or `{ error: "unsupported_account_type" }` |
| (job status) | `GET /photos/jobs/{jobId}` | → `{ state: "queued"\|"scanning"\|"clustering"\|"done"\|"failed", progress: 0..1 }` |
| `face-cluster-popup-event` | push event `faces.clusters_ready` (WebSocket / SSE / push notification) | server → client: `{ type: "faces.clusters_ready", clusterCount: 4, previewClusterIds: [...] }`. The frontend shows the popup when this arrives. |
| `face-clusters-list` | `GET /faces/clusters?limit=20` | → `{ clusters: FaceCluster[] }` (sorted by photoCount desc) |
| `face-cluster-photos` | `GET /faces/clusters/{clusterId}/photos?cursor=` | → `{ photos: ClusterPhoto[], nextCursor?: string }` |
| `face-cluster-suggestion-accept` | `POST /faces/clusters/{clusterId}/confirm` | `{ name: "Mom" }` → `{ cluster: FaceCluster }` |
| `face-cluster-name` | `POST /faces/clusters/{clusterId}/name` | `{ name: string }` → `{ cluster: FaceCluster, taggedCount: number }` |
| `face-cluster-dismiss` | `POST /faces/popup/dismiss` | `{ snoozeDays?: number }` → `{ ok: true }` (popup cooldown, so it never nags) |
| `face-cluster-link-person` | `POST /faces/clusters/{clusterId}/link` | `{ personId }` → `{ ok: true, memoryCountAdded: number }` |
| `face-cluster-photo-remove` | `DELETE /faces/clusters/{clusterId}/photos/{photoId}` | → `{ ok: true, photoCount: number }` |

### Honest notes (please read before building)
- **Instagram:**
  - Meta shut down the **Instagram Basic Display API on Dec 4, 2024**. After that there is no official API for third-party consumer apps to read a **personal** Instagram account's photos ([Meta for Developers](https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/), [TechCrunch](https://techcrunch.com/2024/12/06/instagram-locks-out-developers-of-third-party-consumer-apps/)).
  - The current Instagram API only works for Business/Creator accounts.
  - Realistic options: (a) the user exports their data from Instagram ("Download your information") and uploads it, (b) business/creator accounts only, or (c) a concept-only connector for the demo.
  - Don't use unofficial or private-API scrapers. They break Instagram's terms.
- **Facebook:**
  - Reading a user's own photos goes through the Graph API with the `user_photos` permission, which requires **App Review**. Approval is unlikely within a hackathon weekend, so expect a test-user / developer-mode demo.
  - Photo **tags** (who was tagged) are the honest way to get a `suggestedName`.
- **Face recognition:**
  - Meta offers **no face-recognition API**. Facebook shut down its own face recognition system in Nov 2021 and deleted the face templates.
  - So clustering has to be our own code, and it should run **on the device**:
    - **iOS native:** Apple Vision face detection plus face feature prints, clustered locally. PhotoKit does **not** expose the Photos app's People albums to third-party apps, so we can't just read Apple's existing groups.
    - **Web demo:** in-browser face detection and embeddings (for example MediaPipe Face Detector plus a small embedding model, or face-api.js), clustered with a simple threshold or DBSCAN. Nothing leaves the browser.
    - **Server-side** (for example InsightFace) works but is the riskiest for privacy. Avoid it for real user data.
- **Privacy, consent and law:**
  - Face embeddings are **biometric identifiers**. **Texas's CUBI** law applies (Meta settled with Texas for **$1.4B in 2024** over face recognition), and so does Illinois's BIPA.
  - Require explicit opt-in consent before any scan, keep embeddings on the device, store only cluster IDs and user-given names server-side, and provide "delete all face data".
  - Never cluster or suggest names for people the user has blocked or reported (spec Section 6 protections). Safety mode turns surfacing off.
- **For the hackathon:** the whole feature can stay mock (fixed clusters in `frontend/lib/mock/faces.ts`). The smallest real slice would be on-device clustering in the browser over a handful of sample photos, plus the `face-clusters-list` and `face-cluster-name` endpoints.

---

*Add new requests below this line using the same template: feature, status, priority, screen, IDs, suggested shapes, honest notes.*
