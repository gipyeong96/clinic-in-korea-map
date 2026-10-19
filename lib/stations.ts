import records from './stations.json';
export const stationPages = records;
export function stationForSlug(slug: string) {
  return records.find(station => station.slug === slug);
}
export function searchRadius(value: unknown) {
  return value === '500' ? 500 : value === '2000' ? 2000 : 1000;
}
