import datetime as dt
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('reader', Path(__file__).with_name('gsc-reader.py'))
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)

class ReaderTests(unittest.TestCase):
    def test_property_and_scope_are_pinned(self):
        calls = []
        def request(url, body=None, token=None, form=False):
            calls.append((url, body))
            if url == reader.TOKEN_ENDPOINT:
                return {'scope': reader.SCOPE, 'access_token': 'private-test-token'}
            if url == reader.SITE_ENDPOINT:
                return {'siteUrl': reader.SITE, 'permissionLevel':'siteOwner'}
            if body.get('dataState') == 'all':
                return {'metadata': {'first_incomplete_date':'2026-11-08'}}
            return {'rows':[{'clicks':1,'impressions':100,'ctr':0.01,'position':8}]}
        env = {name:'private' for name in ('CLINIC_MAP_GSC_CLIENT_ID','CLINIC_MAP_GSC_CLIENT_SECRET','CLINIC_MAP_GSC_REFRESH_TOKEN')}
        # Windows has no bundled IANA database; the Ubuntu runner supplies it.
        with patch.object(reader, 'request_json', side_effect=request), patch.object(reader, 'ZoneInfo', return_value=dt.timezone(dt.timedelta(hours=-8))):
            report = reader.collect(env, dt.datetime(2026,11,10,0,tzinfo=dt.timezone.utc))
        self.assertEqual(report['periods']['recent7']['end'],'2026-11-07')
        self.assertEqual(report['periods']['previous7']['start'],'2026-10-25')
        self.assertTrue(all(url in (reader.TOKEN_ENDPOINT, reader.SITE_ENDPOINT, reader.SITE_ENDPOINT+'/searchAnalytics/query') for url, body in calls))
        self.assertNotIn('private', reader.markdown(report))
        self.assertTrue(all(body.get('dimensions') in (None,['date']) for url,body in calls if url.endswith('/query')))

    def test_wrong_scope_stops_before_any_site_call(self):
        env = {name:'private' for name in ('CLINIC_MAP_GSC_CLIENT_ID','CLINIC_MAP_GSC_CLIENT_SECRET','CLINIC_MAP_GSC_REFRESH_TOKEN')}
        with patch.object(reader,'request_json',return_value={'scope':'https://www.googleapis.com/auth/webmasters','access_token':'private'}) as request:
            with self.assertRaisesRegex(reader.ReadFailure,'READ_ONLY_SCOPE'):
                reader.collect(env)
        self.assertEqual(request.call_count,1)

    def test_empty_rows_are_not_zero_metrics(self):
        day = dt.date(2026,11,7)
        result = reader.period_result(day,day,{})
        self.assertEqual(result['status'],'no_rows')
        self.assertIsNone(result['metrics'])

    def test_final_date_fallback_and_staleness(self):
        today = dt.date(2026,11,9)
        end, source = reader.final_day(today,{},[{'keys':['2026-11-06']}])
        self.assertEqual(end,dt.date(2026,11,6))
        with self.assertRaisesRegex(reader.ReadFailure,'DELAYED'):
            reader.final_day(today,{},[{'keys':['2026-11-01']}])

    def test_other_endpoint_and_query_dimensions_rejected(self):
        with self.assertRaisesRegex(reader.ReadFailure,'ENDPOINT'):
            reader.request_json('https://www.googleapis.com/webmasters/v3/sites/')
        with self.assertRaisesRegex(reader.ReadFailure,'DIMENSION'):
            reader.query('private',dt.date(2026,11,1),dt.date(2026,11,7),dimensions=['query'])

    def test_exact_keyword_pilot_is_bounded_and_preserves_missing_rows(self):
        start = dt.date(2026,11,2)
        end = dt.date(2026,11,8)
        windows = {'recent7': (start, end), 'previous7': (start-dt.timedelta(days=7), end-dt.timedelta(days=7)),
                   'recent28': (end-dt.timedelta(days=27), end)}
        def response(url, body, token, **kwargs):
            if url == reader.INSPECT_ENDPOINT:
                self.assertEqual(body['inspectionUrl'], reader.PILOT_URL)
                self.assertEqual(body['siteUrl'], reader.SITE)
                return {'inspectionResult': {'indexStatusResult': {'verdict':'PASS', 'googleCanonical':reader.PILOT_URL}}}
            self.assertEqual(url, reader.SITE_ENDPOINT+'/searchAnalytics/query')
            self.assertEqual(body['type'], 'web')
            self.assertEqual(body['dataState'], 'final')
            self.assertLessEqual(body['rowLimit'], 10)
            filters = body['dimensionFilterGroups'][0]['filters']
            self.assertEqual(len(filters), 1)
            self.assertEqual(filters[0]['operator'], 'equals')
            self.assertIn(filters[0]['expression'], reader.PILOT_QUERIES)
            if body.get('dimensions') == ['page']:
                self.assertEqual(body['aggregationType'], 'byPage')
                return {'rows':[{'keys':[reader.PILOT_URL+'?hidden=1'], 'clicks':0,'impressions':3,'ctr':0,'position':4}]}
            return {}
        with patch.object(reader, 'request_json', side_effect=response) as request:
            report = reader.keyword_pilot('fake', windows)
        self.assertEqual(request.call_count, 22)
        self.assertEqual(report['status'], 'success')
        self.assertEqual(set(report['queries']), set(reader.PILOT_QUERIES))
        jamsil = report['queries']['jamsil urology clinic']
        self.assertIsNone(jamsil['periods']['recent7']['metrics'])
        self.assertEqual(jamsil['pages']['recent7']['rows'][0]['key'], reader.PILOT_URL)
        self.assertEqual(report['inspection']['source'], 'google_stored_index')

    def test_pilot_denies_other_queries_and_handles_partial_failure(self):
        day = dt.date(2026,11,8)
        with patch.object(reader, 'request_json') as request:
            with self.assertRaisesRegex(reader.ReadFailure, 'FILTER'):
                reader.pilot_query('fake', 'other query', day, day)
            request.assert_not_called()
        windows = {name: (day, day) for name in ('recent7','previous7','recent28')}
        with patch.object(reader, 'request_json', side_effect=reader.ReadFailure('HTTP_403')):
            report = reader.keyword_pilot('fake', windows)
        self.assertEqual(report['status'], 'incomplete')
        self.assertEqual(report['inspection']['error'], 'HTTP_403')
        self.assertEqual(report['queries']['dentist near me']['periods']['recent7']['status'], 'incomplete')

if __name__ == '__main__':
    unittest.main()
