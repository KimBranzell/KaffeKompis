const TIMEMORE_C2_MAX_SETTINGS = [
  { clicks: 0, microns: 0 },
  { clicks: 1, microns: 32 },
  { clicks: 2, microns: 63 },
  { clicks: 3, microns: 95 },
  { clicks: 4, microns: 127 },
  { clicks: 5, microns: 158 },
  { clicks: 6, microns: 190 },
  { clicks: 7, microns: 222 },
  { clicks: 8, microns: 253 },
  { clicks: 9, microns: 285 },
  { clicks: 10, microns: 317 },
  { clicks: 11, microns: 348 },
  { clicks: 12, microns: 380 },
  { clicks: 13, microns: 412 },
  { clicks: 14, microns: 443 },
  { clicks: 15, microns: 475 },
  { clicks: 16, microns: 507 },
  { clicks: 17, microns: 538 },
  { clicks: 18, microns: 570 },
  { clicks: 19, microns: 602 },
  { clicks: 20, microns: 633 },
  { clicks: 21, microns: 665 },
  { clicks: 22, microns: 697 },
  { clicks: 23, microns: 728 },
  { clicks: 24, microns: 760 },
  { clicks: 25, microns: 792 },
  { clicks: 26, microns: 823 },
  { clicks: 27, microns: 855 },
  { clicks: 28, microns: 887 },
  { clicks: 29, microns: 918 },
  { clicks: 30, microns: 950 }
];

const GRINDER_SETTINGS = {
  'timemore-c2-max': TIMEMORE_C2_MAX_SETTINGS
};

export function getGrinderSetting(microns, grinderModel = 'timemore-c2-max') {
  const settings = GRINDER_SETTINGS[grinderModel];
  if (!settings) return null;

  // Find the closest matching setting
  return settings.reduce((closest, current) => {
    const currentDiff = Math.abs(current.microns - microns);
    const closestDiff = Math.abs(closest.microns - microns);
    return currentDiff < closestDiff ? current : closest;
  });
}
