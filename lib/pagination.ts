export const PAGE_SIZE = 25;
export const MAX_PAGE = 10000;
export function searchPage(value: unknown) {
  if(typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1;
  return Math.min(Number(value), MAX_PAGE);
}
