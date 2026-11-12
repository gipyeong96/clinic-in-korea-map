"""Read Clinic Map search metrics for a fixed property and explicit pilot targets."""
import datetime as dt
import json
import math
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

SITE = 'https://map.clinicinkorea.com/'
SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
SITE_ENDPOINT = 'https://www.googleapis.com/webmasters/v3/sites/' + urllib.parse.quote(SITE, safe='')
TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
INSPECT_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect'
PILOT_QUERIES = ('jamsil urology clinic', 'seoul urology clinic')
PILOT_URL = SITE + 'clinics/urology/jamsil-station'

class ReadFailure(Exception):
    pass

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

def request_json(url, body=None, token=None, form=False, timeout=30):
    if url not in (TOKEN_ENDPOINT, SITE_ENDPOINT, SITE_ENDPOINT + '/searchAnalytics/query', INSPECT_ENDPOINT):
        raise ReadFailure('PROPERTY_OR_ENDPOINT_REJECTED')
    headers = {'Accept': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    data = None
    if body is not None:
        data = (urllib.parse.urlencode(body) if form else json.dumps(body)).encode()
        headers['Content-Type'] = 'application/x-www-form-urlencoded' if form else 'application/json'
    try:
        opener = urllib.request.build_opener(NoRedirect())
        with opener.open(urllib.request.Request(url, data=data, headers=headers), timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Never emit response bodies: Google's diagnostics may contain request data.
        code = 'REAUTH_REQUIRED' if error.code in (400, 401) and url == TOKEN_ENDPOINT else f'HTTP_{error.code}'
        raise ReadFailure(code) from None
    except (OSError, ValueError):
        raise ReadFailure('NETWORK_OR_RESPONSE_ERROR') from None

def query(token, start, end, *, state='final', dimensions=None):
    body = {'startDate': start.isoformat(), 'endDate': end.isoformat(), 'type': 'web',
            'dataState': state, 'rowLimit': 40 if dimensions else 1,
            'aggregationType': 'byProperty'}
    if dimensions:
        if dimensions != ['date']:
            raise ReadFailure('DIMENSION_REJECTED')
        body['dimensions'] = dimensions
    return request_json(SITE_ENDPOINT + '/searchAnalytics/query', body, token)

def final_day(today, discovery, final_rows=None):
    incomplete = discovery.get('metadata', {}).get('first_incomplete_date')
    yesterday = today - dt.timedelta(days=1)
    if incomplete:
        try:
            end = min(yesterday, dt.date.fromisoformat(incomplete) - dt.timedelta(days=1))
        except (TypeError, ValueError):
            raise ReadFailure('INVALID_DATA_BOUNDARY') from None
        source = 'first_incomplete_date'
    else:
        dates = [dt.date.fromisoformat(row['keys'][0]) for row in (final_rows or [])]
        if not dates:
            raise ReadFailure('NO_FINAL_DATA')
        end, source = min(yesterday, max(dates)), 'latest_returned_final_date'
    if end > yesterday or (today - end).days > 5:
        raise ReadFailure('FINAL_DATA_DELAYED')
    return end, source

def period_result(start, end, response):
    rows = response.get('rows', [])
    result = {'start': start.isoformat(), 'end': end.isoformat(), 'status': 'no_rows', 'metrics': None}
    if not rows:
        return result  # An empty API response is not fabricated as four zeros.
    if len(rows) != 1:
        raise ReadFailure('UNEXPECTED_AGGREGATION')
    metrics = {name: rows[0][name] for name in ('clicks', 'impressions', 'ctr', 'position')}
    if not all(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and value >= 0 for value in metrics.values()):
        raise ReadFailure('INVALID_METRICS')
    if metrics['ctr'] > 1:
        raise ReadFailure('INVALID_METRICS')
    result.update(status='observed', metrics=metrics)
    return result

def pilot_query(token, term, start, end, dimension=None):
    if term not in PILOT_QUERIES or dimension not in (None, 'page', 'country', 'device'):
        raise ReadFailure('PILOT_FILTER_REJECTED')
    body = {'startDate': start.isoformat(), 'endDate': end.isoformat(), 'type': 'web',
            'dataState': 'final', 'rowLimit': 10 if dimension else 1,
            'aggregationType': 'byPage' if dimension == 'page' else 'byProperty',
            'dimensionFilterGroups': [{'filters': [
                {'dimension': 'query', 'operator': 'equals', 'expression': term}]}]}
    if dimension:
        body['dimensions'] = [dimension]
    result = request_json(SITE_ENDPOINT + '/searchAnalytics/query', body, token, timeout=8)
    if not dimension:
        return period_result(start, end, result)
    rows = []
    for row in result.get('rows', []):
        (key,) = row['keys']
        if dimension == 'page':
            if not key.startswith(SITE):
                raise ReadFailure('PILOT_PAGE_OUTSIDE_PROPERTY')
            key = key.split('#', 1)[0].split('?', 1)[0]
        metrics = period_result(start, end, {'rows': [row]})['metrics']
        rows.append({'key': key, **metrics})
    return {'status': 'observed' if rows else 'no_rows', 'rows': rows}

def inspect_pilot_url(token):
    response = request_json(INSPECT_ENDPOINT,
                            {'inspectionUrl': PILOT_URL, 'siteUrl': SITE, 'languageCode': 'en-US'}, token, timeout=8)
    result = response.get('inspectionResult', {}).get('indexStatusResult')
    if not isinstance(result, dict) or not result.get('verdict'):
        raise ReadFailure('INSPECTION_RESULT_MISSING')
    fields = ('verdict', 'coverageState', 'robotsTxtState', 'indexingState',
              'lastCrawlTime', 'pageFetchState', 'googleCanonical', 'userCanonical')
    return {'status': 'observed', 'url': PILOT_URL, 'source': 'google_stored_index',
            **{field: result.get(field) for field in fields}}

def pilot_read(call, *args):
    try:
        return call(*args)
    except ReadFailure as error:
        return {'status': 'incomplete', 'error': str(error)}
    except (KeyError, TypeError, ValueError, AttributeError):
        return {'status': 'incomplete', 'error': 'PILOT_RESPONSE_INVALID'}

def keyword_pilot(token, windows):
    recent = windows['recent7']
    reports = {}
    for term in PILOT_QUERIES:
        periods = {name: pilot_read(pilot_query, token, term, *window)
                   for name, window in windows.items()}
        pages = {name: pilot_read(pilot_query, token, term, *windows[name], 'page')
                 for name in ('recent7', 'previous7')}
        slices = {dimension: pilot_read(pilot_query, token, term, *recent, dimension)
                  for dimension in ('country', 'device')}
        reports[term] = {'periods': periods, 'pages': pages, **slices}
    inspection = pilot_read(inspect_pilot_url, token)
    entries = [inspection]
    for report in reports.values():
        entries.extend([*report['periods'].values(), *report['pages'].values(),
                        report['country'], report['device']])
    status = 'incomplete' if any(entry['status'] == 'incomplete' for entry in entries) else 'success'
    return {'status': status, 'queries': reports, 'inspection': inspection}

def pilot_markdown(pilot):
    lines = ['', '## Keyword and index pilot', '', f"Pilot status: {pilot['status']}", '',
             '| Exact query | Period | Clicks | Impressions | CTR | Avg position |',
             '|---|---|---:|---:|---:|---:|']
    for term, report in pilot['queries'].items():
        for name, period in report['periods'].items():
            metrics = period.get('metrics')
            values = (f"{metrics['clicks']:g} | {metrics['impressions']:g} | "
                      f"{metrics['ctr']:.2%} | {metrics['position']:.2f}" if metrics else
                      f"{period['status']} | — | — | —")
            lines.append(f'| {term} | {name} | {values} |')
    for term, report in pilot['queries'].items():
        for name, data in report['pages'].items():
            rows = data.get('rows', [])
            top = ', '.join(f"{row['key']} ({row['clicks']:g} clicks / {row['impressions']:g} impressions)"
                            for row in rows[:3])
            lines.append(f"- {term} / {name} pages: {top or data.get('error', data['status'])}")
    inspection = pilot['inspection']
    lines += ['', f"Jamsil Station stored index: {inspection.get('verdict', inspection.get('error'))}",
              f"Coverage: {inspection.get('coverageState') or 'unavailable'}",
              f"Last crawl: {inspection.get('lastCrawlTime') or 'unavailable'}",
              f"Google canonical: {inspection.get('googleCanonical') or 'unavailable'}",
              f"Robots: {inspection.get('robotsTxtState') or 'unavailable'}; indexing: {inspection.get('indexingState') or 'unavailable'}"]
    return lines

def collect(env=os.environ, now=None, *, include_pilot=False):
    names = ['CLINIC_MAP_GSC_CLIENT_ID', 'CLINIC_MAP_GSC_CLIENT_SECRET', 'CLINIC_MAP_GSC_REFRESH_TOKEN']
    if any(not env.get(name) for name in names):
        raise ReadFailure('MISSING_GSC_SECRET')
    auth = request_json(TOKEN_ENDPOINT, {'client_id': env[names[0]], 'client_secret': env[names[1]],
                        'refresh_token': env[names[2]], 'grant_type': 'refresh_token'}, form=True)
    if auth.get('scope') != SCOPE or not auth.get('access_token'):
        raise ReadFailure('READ_ONLY_SCOPE_NOT_CONFIRMED')
    token = auth['access_token']
    site = request_json(SITE_ENDPOINT, token=token)
    if site.get('siteUrl') != SITE or site.get('permissionLevel') not in ('siteOwner','siteFullUser','siteRestrictedUser'):
        raise ReadFailure('PROPERTY_ACCESS_NOT_CONFIRMED')
    now = now or dt.datetime.now(dt.timezone.utc)
    today = now.astimezone(ZoneInfo('America/Los_Angeles')).date()
    start = today - dt.timedelta(days=35)
    discovery = query(token, start, today, state='all', dimensions=['date'])
    fallback = None
    if not discovery.get('metadata', {}).get('first_incomplete_date'):
        fallback = query(token, start, today - dt.timedelta(days=1), dimensions=['date']).get('rows', [])
    end, source = final_day(today, discovery, fallback)
    windows = {'recent7': (end-dt.timedelta(days=6), end),
               'previous7': (end-dt.timedelta(days=13), end-dt.timedelta(days=7)),
               'recent28': (end-dt.timedelta(days=27), end)}
    periods = {name: period_result(a, b, query(token, a, b)) for name, (a, b) in windows.items()}
    report = {'status':'success', 'property':SITE, 'scope':SCOPE, 'checkedAt':now.isoformat(),
            'reportTimezone':'America/Los_Angeles', 'dataState':'final', 'finalDateSource':source,
            'periods':periods, 'limitations':['No queries, page paths, conversions or index status collected.',
                'External OAuth Testing refresh tokens expire after 7 days; reauthorization may be required.']}
    if include_pilot:
        report['keywordPilot'] = keyword_pilot(token, windows)
        report['limitations'][0] = ('Pilot covers two exact queries only. Breakdowns are bounded to ten rows '
                                    'per dimension and do not necessarily sum to query totals. '
                                    'Page parameters are omitted. URL Inspection reports Google’s stored index.')
    return report

def markdown(report):
    lines = ['# Clinic Map Search Console', '', f"Status: {report['status']}", f'Property: {SITE}', '']
    if report['status'] != 'success':
        return '\n'.join(lines + [f"Incomplete: {report['error']}", 'Existing development automation must remain unchanged.']) + '\n'
    lines += ['Dates: America/Los_Angeles; finalized data.', '', '| Period | Dates | Clicks | Impressions | CTR | Avg position |', '|---|---|---:|---:|---:|---:|']
    for name, period in report['periods'].items():
        m = period['metrics']
        values = f"{m['clicks']:g} | {m['impressions']:g} | {m['ctr']:.2%} | {m['position']:.2f}" if m else 'no rows | no rows | no rows | no rows'
        lines.append(f"| {name} | {period['start']} – {period['end']} | {values} |")
    if 'keywordPilot' in report:
        lines.extend(pilot_markdown(report['keywordPilot']))
    return '\n'.join(lines + ['', *report['limitations']]) + '\n'

def main():
    directory = Path(os.environ.get('GSC_REPORT_DIR', 'gsc-report'))
    directory.mkdir(parents=True, exist_ok=True)
    try:
        report = collect(include_pilot=True)
    except ReadFailure as error:
        report = {'status':'incomplete', 'property':SITE, 'error':str(error)}
    except Exception:
        report = {'status':'incomplete', 'property':SITE, 'error':'UNEXPECTED_RESPONSE'}
    text = markdown(report)
    (directory/'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (directory/'report.md').write_text(text, encoding='utf-8')
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as summary:
            summary.write(text)
    print('Clinic Map Search Console: ' + report['status'])
    return 0 if report['status'] == 'success' and report['keywordPilot']['status'] == 'success' else 1

if __name__ == '__main__':
    raise SystemExit(main())
