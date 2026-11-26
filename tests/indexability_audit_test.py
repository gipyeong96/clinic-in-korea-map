import importlib.util
import unittest
spec = importlib.util.spec_from_file_location('audit', 'scripts/check-indexability.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

class AuditTests(unittest.TestCase):
    def page(self, body=None, headers=None, status=200, url=audit.ORIGIN + '/'):
        return audit.inspect('/', status, headers or {'Content-Type': 'text/html'},
            body or b'<link rel="canonical" href="https://map.clinicinkorea.com"><h1>Clinic search</h1>', url)['errors']

    def test_valid_html_and_header_case(self):
        self.assertEqual(self.page(), [])

    def test_noindex_header_or_googlebot(self):
        self.assertIn('indexing disabled', self.page(headers={'content-type':'text/html','X-Robots-Tag':'googlebot: noindex, follow'}))
        self.assertIn('indexing disabled', self.page(b'<meta name="googlebot" content=" none, follow ">'))

    def test_bad_canonical_status_and_h1(self):
        self.assertTrue(self.page(b'<link rel="canonical" href="https://elsewhere.example/">', status=503))
        self.assertIn('unexpected redirect', self.page(url=audit.ORIGIN+'/login'))

    def test_xml(self):
        valid = b'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://map.clinicinkorea.com/</loc></url></urlset>'
        check=lambda body:audit.inspect('/sitemap.xml',200,{'Content-Type':'application/xml'},body,audit.ORIGIN+'/sitemap.xml')
        self.assertEqual(check(valid)['errors'], [])
        self.assertTrue(check(b'<html>error</html>')['errors'])
        self.assertTrue(check(b'invalid')['errors'])
        self.assertTrue(check(valid.replace(b'</urlset>',valid.split(b'>',1)[1]))['errors'])

    def test_bot_specific_robots_rules(self):
        text = ('User-agent: *\nAllow: /\nUser-agent: meta-externalagent\nDisallow: /\nSitemap: '+audit.ORIGIN+'/sitemap.xml\nSitemap: '+audit.ORIGIN+'/clinic-sitemaps.xml').encode()
        check=lambda body:audit.inspect('/robots.txt',200,{'Content-Type':'text/plain'},body,audit.ORIGIN+'/robots.txt')
        self.assertEqual(check(text)['errors'], [])
        self.assertIn('Googlebot homepage crawl disallowed',check(text.replace(b'Allow: /',b'Disallow: /'))['errors'])

    def test_success_response_cannot_hide_known_query_failure(self):
        result = audit.inspect('/clinics/urology/jamsil-station', 200, {'content-type':'text/html'},
            b'<h1>Clinics</h1><p>Clinic information is temporarily unavailable. Please try again later.</p>',
            audit.ORIGIN + '/clinics/urology/jamsil-station')
        self.assertIn('HTTP 200 contains clinic query failure state', result['errors'])

    def test_response_limit(self):
        self.assertIn('response exceeds audit limit',self.page(b'x'*(audit.MAX_BYTES+1)))

if __name__ == '__main__':
    unittest.main()
