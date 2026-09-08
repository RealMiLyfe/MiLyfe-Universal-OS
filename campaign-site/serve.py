#!/usr/bin/env python3
"""Static server for the MiJaxx campaign site.

Serves a directory of static files and reverse-proxies /api/* to the
campaign API (default http://127.0.0.1:8200). The same-origin /api path
lets the site's JS call its API without CORS in any environment —
in production nginx (or this same script) can do the same thing.

Usage:
  python3 serve.py --port 8180 --root . --api http://127.0.0.1:8200
  python3 serve.py --port 8181 --root get-root --api http://127.0.0.1:8200
"""
import argparse
import http.client
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def make_handler(root: str, api_base: str):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=root, **kwargs)

        def log_message(self, fmt, *args):
            pass  # quiet

        def do_POST(self):
            if self._is_api():
                self._proxy("POST")
            else:
                self.send_error(405, "Method Not Allowed")

        def do_PATCH(self):
            if self._is_api():
                self._proxy("PATCH")
            else:
                self.send_error(405, "Method Not Allowed")

        def do_OPTIONS(self):
            if self._is_api():
                self._proxy("OPTIONS")
            else:
                self.send_error(405, "Method Not Allowed")

        def _is_api(self):
            return self.path == "/api" or self.path.startswith("/api/")

        def do_GET(self):
            if self._is_api():
                self._proxy("GET")
                return
            # /api (no slash) → 404 like static
            super().do_GET()

        def _proxy(self, method):
            path = self.path[len("/api"):] or "/"
            if not path.startswith("/"):
                path = "/" + path
            body = None
            length = int(self.headers.get("Content-Length") or 0)
            if length:
                body = self.rfile.read(length)
            try:
                conn = http.client.HTTPConnection(*_hostport(api_base), timeout=15)
                headers = {
                    "Content-Type": self.headers.get("Content-Type", "application/json"),
                }
                if "X-API-Key" in self.headers:
                    headers["X-API-Key"] = self.headers["X-API-Key"]
                if "Origin" in self.headers:
                    headers["Origin"] = self.headers["Origin"]
                conn.request(method, path, body=body, headers=headers)
                resp = conn.getresponse()
                data = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", resp.getheader("Content-Type", "application/json"))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Headers", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                if method != "HEAD":
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"detail":"campaign api unreachable: ' + str(e).encode()[:200] + b'"}')

    return Handler


def _hostport(base: str):
    base = base.split("//", 1)[-1]
    host, _, port = base.partition(":")
    return host, int(port or 80)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, required=True)
    ap.add_argument("--root", default=".")
    ap.add_argument("--api", default="http://127.0.0.1:8200")
    args = ap.parse_args()
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(("0.0.0.0", args.port), make_handler(os.path.abspath(args.root), args.api))
    print(f"campaign site on :{args.port} (root={args.root}, api={args.api})")
    server.serve_forever()


if __name__ == "__main__":
    main()
