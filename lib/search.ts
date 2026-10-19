// Match complete words and preserve unrecognized terms instead of silently dropping them.
export function homeSearchPath(input: string) {
  let remaining = input.trim().toLowerCase().slice(0, 200);
  let department = 'all';
  let location = 'all';
  const departments: [RegExp, string][] = [
    [/\b(?:urology|urologist)\b/, 'urology'],
    [/\b(?:dentistry|dental|dentist)\b/, 'dentistry'],
    [/\binternal(?:[ -]+medicine)?\b/, 'internal-medicine'],
    [/\b(?:dermatology|dermatologist)\b/, 'dermatology'],
    [/\bplastic(?:[ -]+surgery)?\b/, 'plastic-surgery'],
  ];
  const locations: [RegExp, string][] = [
    [/\bgangnam[ -]+station\b/, 'gangnam-station'],
    [/\bjamsil[ -]+station\b/, 'jamsil-station'],
    [/\bseoul[ -]+station\b/, 'seoul-station'],
    [/\bgangnam\b/, 'gangnam'], [/\bjamsil\b/, 'jamsil'],
    [/\bincheon\b/, 'incheon'], [/\bdongtan\b/, 'dongtan'],
    [/\bseoul\b/, 'seoul'],
  ];
  for (const [pattern, slug] of departments) {
    if (pattern.test(remaining)) { department = slug; remaining = remaining.replace(pattern, ' '); break; }
  }
  for (const [pattern, slug] of locations) {
    if (pattern.test(remaining)) { location = slug; remaining = remaining.replace(pattern, ' '); break; }
  }
  const query = remaining.trim().replace(/\s+/g, ' ');
  return `/clinics/${department}/${location}${query ? `?q=${encodeURIComponent(query)}` : ''}`;
}

export function searchTerms(input: string) {
  // Avoid PostgREST operators and wildcard characters being interpreted as query syntax.
  return input.slice(0, 200).replace(/[,%_()*\\.\":]/g, ' ').trim().split(/\s+/).filter(Boolean);
}
