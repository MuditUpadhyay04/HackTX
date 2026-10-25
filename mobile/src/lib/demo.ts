// Demo data: Un-Said shows the seeded cast and the demo photos from the server, never the phone's own
// photos, videos or contacts (we demo on a borrowed phone). Only the microphone and local notifications
// touch the device. On by default; EXPO_PUBLIC_DEMO_DATA=0 reads the real camera roll again.
export const DEMO_DATA = process.env.EXPO_PUBLIC_DEMO_DATA !== "0";
