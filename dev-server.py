#!/usr/bin/env python3
"""Serve unlimitmusic dev with cache-busting headers so browser never
holds a stale copy when the process restarts."""
import http.server
import socketserver
import os

PORT = 8099
DIR = "/workspaces/hermes/greg/projects/unlimit-music"

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIR, **kw)
    def end_headers(self):
        # Never cache during dev — force fresh fetch every reload.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), H) as s:
    print(f"Serving {DIR} on http://0.0.0.0:{PORT}")
    s.serve_forever()
