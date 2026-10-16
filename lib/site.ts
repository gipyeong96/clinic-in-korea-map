export const SITE_URL = 'https://map.clinicinkorea.com';

export function clinicPath(clinic: { hira_code?: string | null; id: string }) {
  return `/clinics/detail/${encodeURIComponent(clinic.hira_code || clinic.id)}`;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
