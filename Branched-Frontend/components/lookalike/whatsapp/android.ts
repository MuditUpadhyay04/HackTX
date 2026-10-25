/**
 * Material sizes (dp) for the WhatsApp for Android look-alike. The shared WA metrics keep the
 * bubble / wallpaper numbers; these cover the Android chrome: app bars, chips, rows, FAB, the
 * bottom navigation bar, the composer and the call screen.
 */
export const WAA = {
  appBar: 64,
  threadBar: 60,
  brandSize: 24,
  titleSize: 22,
  icon: 24,
  iconButton: 40,
  search: { height: 48, radius: 24, size: 16 },
  chip: { height: 32, size: 14, radius: 16, padX: 14 },
  row: { height: 72, avatar: 48, nameSize: 17, previewSize: 14, timeSize: 12, badge: 20, badgeSize: 12 },
  fab: { size: 56, radius: 16, icon: 24, inset: 16 },
  nav: { height: 66, indicatorW: 64, indicatorH: 32, icon: 24, labelSize: 12, badge: 16 },
  thread: { avatar: 38, nameSize: 18, subtitleSize: 13 },
  composer: { height: 60, field: 48, radius: 24, button: 48, icon: 24, padX: 6 },
  call: { avatar: 120, button: 56, end: 64 },
} as const;
