# Backend requests from the mobile overhaul

UI-only pass. No Python, routes, or `backend/web/` files were changed. These are gaps where a control in the design has no honest API.

1. **Keep this moment** (`vault-save`). No vault endpoint. The button is not on the letter screen.
2. **Edit as a draft.** Pieces are not an editable document. The pile toggles which lines go into the preview. There is no separate compose draft store.
3. **Channel change does not stick.** `PATCH /api/people/{id}` has no `channel` field. The sheet only changes the handoff app for this send.
4. **`release_label` always says "her time".** Dad would still read "her". The client shows the string as sent.
5. **Instagram and Facebook photo import.** Connect toggles memory on the phone. Nothing is uploaded. Face clustering (`face-cluster-*`) has no API, so those screens are not faked.
6. **Notes to yourself.** `POST /api/self-notes` wants a video file. The app lists notes from `/api/home` and opens the media URL. It does not record, because there is no camera capture wired up.
7. **Delivered strip.** Released cards come back on `/api/home`, then disappear from the waiting list. There is no short "Delivered" beat. A `delivered_at` the client can trust against the demo clock would make that line real.
8. **EAS project id.** Not a backend change. `npx eas-cli update:configure` (while logged in) still has to write `updates.url` and `extra.eas.projectId` before a phone can take an update.
