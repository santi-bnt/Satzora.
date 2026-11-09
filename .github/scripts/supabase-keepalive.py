import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


EXPECTED_URL = 'https://satzivo.vercel.app/api/keepalive'


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def configuration_error(url, token):
    if not url:
        return 'KEEPALIVE_URL is missing from GitHub Actions secrets.'
    try:
        parsed = urllib.parse.urlsplit(url)
        port = parsed.port
    except ValueError:
        return 'KEEPALIVE_URL is invalid; set it to https://satzivo.vercel.app/api/keepalive.'
    if (
        parsed.scheme != 'https'
        or parsed.hostname != 'satzivo.vercel.app'
        or parsed.path != '/api/keepalive'
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
        or port not in (None, 443)
    ):
        return 'KEEPALIVE_URL must be https://satzivo.vercel.app/api/keepalive with no query or fragment.'
    if not token:
        return 'KEEPALIVE_TOKEN is missing from GitHub Actions secrets.'
    if len(token) < 32:
        return 'KEEPALIVE_TOKEN is shorter than the required 32 characters.'
    return None


def check(url, token, opener_factory=urllib.request.build_opener):
    request = urllib.request.Request(
        url,
        method='POST',
        headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/json'},
    )
    try:
        with opener_factory(NoRedirect).open(request, timeout=15) as response:
            try:
                body = json.loads(response.read(4096))
            except (ValueError, UnicodeDecodeError):
                return 'Maintenance endpoint returned invalid JSON; PostgreSQL was not verified.'
            if response.status != 200 or body != {'ok': True, 'check': 'postgres'}:
                return 'Maintenance endpoint did not confirm PostgreSQL; inspect Vercel configuration and Supabase status.'
    except urllib.error.HTTPError as error:
        if 300 <= error.code < 400:
            return 'Maintenance endpoint redirected the request; confirm KEEPALIVE_URL uses the production URL exactly.'
        if error.code == 401:
            return 'Maintenance endpoint rejected KEEPALIVE_TOKEN (HTTP 401). Check that both services use the same token.'
        if error.code == 503:
            try:
                body = json.loads(error.read(4096))
            except (ValueError, OSError, UnicodeDecodeError):
                body = {}
            if body.get('error') == 'not_configured':
                return 'Vercel reports keep-alive configuration missing or invalid (HTTP 503); check KEEPALIVE_DATABASE_URL and KEEPALIVE_TOKEN. PostgreSQL was not queried.'
            if body.get('error') == 'database_unavailable':
                return 'Vercel could not connect to PostgreSQL or verify SELECT 1 (HTTP 503); check the dedicated role, pooler URL/TLS, and Supabase project status.'
            return 'Maintenance endpoint returned HTTP 503; Vercel keep-alive configuration or PostgreSQL is unavailable.'
        return f'Maintenance endpoint returned HTTP {error.code}; PostgreSQL was not verified.'
    except (urllib.error.URLError, TimeoutError, OSError):
        return 'Could not reach the maintenance endpoint within 15 seconds; PostgreSQL was not verified.'
    return None


def main():
    url = os.environ.get('KEEPALIVE_URL', '')
    token = os.environ.get('KEEPALIVE_TOKEN', '')
    error = configuration_error(url, token)
    if error:
        print(error, file=sys.stderr)
        return 1
    error = check(url, token)
    if error:
        print(error, file=sys.stderr)
        return 1
    print('PostgreSQL read-only check succeeded.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
