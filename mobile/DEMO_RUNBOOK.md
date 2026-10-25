# Live demo runbook: Un-Said on the borrowed Galaxy Z Fold 8 (Expo Go)

The phone sits in the middle of the table. Judges linger on a photo, Un-Said knocks, they talk, and their words sort into letters. Everything uses demo data (`EXPO_PUBLIC_DEMO_DATA=1`): the seeded cast (Mom, Sarah, Michael) and the server's demo photos. Un-Said never reads the owner's photos or contacts, and never opens the owner's real WhatsApp or Instagram.

## 1. Pick the backend (`mobile/.env.local`)

| Backend | `.env.local` | Sorting runs on |
|---|---|---|
| **Laptop** (default) | `EXPO_PUBLIC_API_URL=http://<laptop Wi-Fi IP>:8000`, `EXPO_PUBLIC_APP_KEY=<APP_KEY>` (the key the laptop backend was started with) | Muse Spark through Meta's API |
| **Vultr** | `EXPO_PUBLIC_API_URL=https://45-32-200-63.sslip.io`, the Vultr key (`grep '^APP_KEY=' /srv/unsaid/.env` on the VM) | Muse Spark Open on the Vultr GPU once it's live; until then the Gemini fallback |

Keep `EXPO_PUBLIC_DEMO_DATA=1` either way.

- **Laptop IP:** run `ipconfig` and use the Wi-Fi IPv4 address. It changes when the network changes; it was 100.64.227.50 at the last check.
- **The phone must reach the laptop.** Venue Wi-Fi often blocks phone-to-laptop traffic, so put both on the phone hotspot, or use Vultr.
- **Laptop backend command**, from `backend/`: `APP_KEY=<APP_KEY> uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`. `localhost:8000` on this laptop is a different app, so always use the IP.

## 2. Start the app

1. From `mobile/`, run `npx expo start -c`. The `-c` matters: `.env.local` is baked in at bundle time.
2. On the Fold, open **Expo Go**, signed in to the same Expo account, and scan the QR code.
3. If the phone can't reach the laptop, use `npx expo start -c --tunnel`. The first run installs ngrok. The backend URL still has to be reachable from the phone, so use Vultr in that case.

## 3. Reset before each round of judges

From the laptop, swapping in the Vultr URL and key if you're on Vultr:

```
curl -X POST http://<IP>:8000/api/demo/reset -H "X-App-Key: <APP_KEY>"
curl -X PATCH http://<IP>:8000/api/settings -H "X-App-Key: <APP_KEY>" -H "Content-Type: application/json" -d "{\"knock_mode\":\"demo\"}"
```

You can also turn on Demo mode in the app: You → Settings → Demo ("Knocks after 8 seconds on any photo, for showing the app").

- **Demo mode:** knocks on any photo after 8 s of lingering, with no caps, saying the demo lines.
- **Film mode** (`"knock_mode":"film"`): knocks after 3 s with the film's lines (the Sarah drift knock and so on). Use it only for recording.

## 4. What judges do

1. **Gallery:** tap a photo, for example Riley and Sarah at the lake.
2. **Linger 8 seconds:** the banner drops in, "**You miss them, right?**"
3. **Tap the banner:** Talk opens "To Sarah", headed "**Send the words you're keeping to yourself. They're waiting for your answer.**"
4. **Tap the mic and talk**, in Hindi, English or both. Muse Voice Transcribe writes it live. Tap again to stop.
5. **"Here's who that was for."** Each person gets their exact words. Tap **Mom**.
6. **Mom's pile:** "Mom is waiting to hear this from you." with **Call on WhatsApp**. With demo data on, that only shows a toast; it never opens the owner's WhatsApp. Tap **Preview letter**.
7. **Preview:** the Hindi line plus "she'll read: …" (Gemini), and "Hold until her morning" (after 11:30 AM CDT it's night for Mom). Tap **Send when they're ready**.

**If the mic or network fails:** tap **Type instead** on Talk, type the rant, then **Done**. Everything after that is the same.

**If no knock comes:**
- Demo mode is probably off, so run step 3.
- Or a safety rant was tried in the last 24 h: knocks stay quiet after a concern, even in Demo mode. Run `/api/demo/reset`.

## 5. On the phone, before judging

- Allow the **microphone** for Expo Go when asked. Do one test tap on the mic beforehand, so the prompt doesn't appear in front of judges.
- Turn on **Do Not Disturb** and set the **screen timeout to 10 min**.
- Open the app **unfolded** (inner screen) for judges. The cover screen works too.
- Close the owner's other apps. Un-Said never opens them, but judges might wander.
