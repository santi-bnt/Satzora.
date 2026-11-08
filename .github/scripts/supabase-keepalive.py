import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

url = os.environ.get('KEEPALIVE_URL', '')
token = os.environ.get('KEEPALIVE_TOKEN', '')
parsed = urllib.parse.urlsplit(url)
if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or len(token) < 32:
    sys.exit('Missing or invalid keep-alive configuration; use an HTTPS URL and a token of at least 32 characters.')

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

request = urllib.request.Request(url, method='POST', headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/json'})
try:
    with urllib.request.build_opener(NoRedirect).open(request, timeout=15) as response:
        body = json.loads(response.read(4096))
        if response.status != 200 or body != {'ok': True, 'check': 'postgres'}:
            raise ValueError('Unexpected response')
except (urllib.error.URLError, ValueError, TimeoutError, OSError):
    sys.exit('PostgreSQL check failed. The endpoint or database may be unavailable or paused; check Vercel and the Supabase dashboard, then resume the project if needed.')
print('PostgreSQL read-only check succeeded.')
