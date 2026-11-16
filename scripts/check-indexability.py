#!/usr/bin/env python3
"""Read-only public crawl checks. Not a Google indexing or ranking verdict.

No credentials, analytics, URL parameters, page content or GSC data are collected.
Run manually; this script does not submit URLs or change the site.
"""
import argparse
import json
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ORIGIN = 'https://map.clinicinkorea.com'
PATHS = ['/', '/robots.txt', '/sitemap.xml', '/clinic-sitemaps.xml',
         '/clinic-sitemap-0.xml', '/clinics/ophthalmology/pyeongtaek',
         '/clinics/urology/jamsil-station']
MAX_BYTES = 2_000_000


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.robots = []
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and 'canonical' in attrs.get('rel', '').lower().split():
            self.canonicals.append(attrs.get('href', ''))
        if tag == 'meta' and attrs.get('name', '').lower() in ('robots', 'googlebot'):
            self.robots.append(attrs.get('content', '').lower())
        if tag == 'h1':
            self.h1_count += 1


def inspect(path, status, headers, body, final_url):
    headers = {key.lower(): value for key, value in headers.items()}
    errors = []
    expected = ORIGIN + path
    result = {'path': path, 'status': status, 'bytes': len(body), 'errors': errors}
    if status != 200:
        errors.append('expected HTTP 200')
    if final_url.rstrip('/') != expected.rstrip('/'):
        errors.append('unexpected redirect')
    if len(body) > MAX_BYTES:
        errors.append('response exceeds audit limit')
        return result
    content_type = headers.get('content-type', '').lower()
    if path.endswith('.xml'):
        if 'xml' not in content_type:
            errors.append('expected XML content type')
        try:
            root = ET.fromstring(body)
            ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
            if root.tag not in (ns + 'sitemapindex', ns + 'urlset'):
                errors.append('unexpected sitemap root or namespace')
            urls = [node.text or '' for node in root.iter(ns + 'loc')]
            result['entries'] = len(urls)
            if not urls:
                errors.append('empty sitemap')
            if len(urls) != len(set(urls)):
                errors.append('duplicate sitemap locations')
            if any(not (url == ORIGIN or url.startswith(ORIGIN + '/')) or '?' in url or '#' in url for url in urls):
                errors.append('noncanonical sitemap location')
        except ET.ParseError:
            errors.append('invalid XML')
    elif path == '/robots.txt':
        text = body.decode('utf-8', errors='replace')
        if 'text/plain' not in content_type:
            errors.append('expected robots text content type')
        if ORIGIN + '/sitemap.xml' not in text or ORIGIN + '/clinic-sitemaps.xml' not in text:
            errors.append('missing sitemap declaration')
        # Use the standard parser instead of assuming every Disallow targets Google.
        import urllib.robotparser
        rules = urllib.robotparser.RobotFileParser()
        rules.parse(text.splitlines())
        if not rules.can_fetch('Googlebot', ORIGIN + '/'):
            errors.append('Googlebot homepage crawl disallowed')
    else:
        if 'text/html' not in content_type:
            errors.append('expected HTML content type')
        page = Page()
        rendered = body.decode('utf-8', errors='replace')
        page.feed(rendered)
        if path.startswith('/clinics/'):
            if 'Clinic information is temporarily unavailable. Please try again later.' in rendered:
                errors.append('HTTP 200 contains clinic query failure state')
            # Known SSR status, distinct from the generic empty-state copy in scripts.
            if re.search(r'Page (?:<!-- -->)?1(?:<!-- -->)? · (?:<!-- -->)?0(?:<!-- -->)? clinic profiles', rendered):
                result['empty_first_page'] = True
        directives = page.robots + [headers.get('x-robots-tag', '').lower()]
        if any(set(re.split(r'[\s,;:]+', directive)) & {'noindex', 'none'} for directive in directives):
            errors.append('indexing disabled')
        if len(page.canonicals) != 1 or page.canonicals[0].rstrip('/') != expected.rstrip('/'):
            errors.append('missing, duplicate or unexpected canonical')
        if not page.h1_count:
            errors.append('no server-rendered h1')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--timeout', type=float, default=20)
    args = parser.parse_args()
    if not 0 < args.timeout <= 60:
        parser.error('timeout must be greater than 0 and at most 60 seconds')
    results = []
    for path in PATHS:
        try:
            request = urllib.request.Request(ORIGIN + path, headers={'User-Agent': 'ClinicMap-IndexabilityAudit/1.0'})
            with urllib.request.urlopen(request, timeout=args.timeout) as response:
                results.append(inspect(path, response.status, dict(response.headers.items()),
                                       response.read(MAX_BYTES + 1), response.url))
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            # Do not print arbitrary response/error bodies.
            results.append({'path': path, 'errors': ['request failed: ' + type(error).__name__]})
    print(json.dumps({'scope': 'public HTTP checks only, not Google index status', 'checks': results}, indent=2))
    return 1 if any(result['errors'] for result in results) else 0


if __name__ == '__main__':
    raise SystemExit(main())
