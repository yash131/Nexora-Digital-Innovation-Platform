"""Backend tests for Nexora FastAPI in-memory demo."""
import json
import os
import re
import uuid as uuidlib
from pathlib import Path

import pytest
import requests

BASE_URL = "http://localhost:8001"


# ---------- API tests ----------
class TestNexoraAPI:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data["message"] == "Hello World"
        assert data["service"] == "Nexora API"
        assert data["database"] == "none (in-memory demo)"

    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

    def test_post_status_success(self):
        name = "TEST_alice_success"
        r = requests.post(f"{BASE_URL}/api/status", json={"client_name": name})
        assert r.status_code == 200
        data = r.json()
        assert data["client_name"] == name
        # valid uuid
        uuidlib.UUID(data["id"])
        # ISO timestamp
        assert "T" in data["timestamp"]

    def test_post_status_empty_returns_400(self):
        r = requests.post(f"{BASE_URL}/api/status", json={"client_name": ""})
        assert r.status_code == 400
        assert r.json().get("detail") == "client_name is required"

    def test_post_status_whitespace_stripped(self):
        r = requests.post(f"{BASE_URL}/api/status", json={"client_name": "  TEST_whitespace  "})
        assert r.status_code == 200
        assert r.json()["client_name"] == "TEST_whitespace"

    def test_post_status_only_whitespace_returns_400(self):
        r = requests.post(f"{BASE_URL}/api/status", json={"client_name": "   "})
        assert r.status_code == 400

    def test_list_status_newest_first(self):
        n1 = "TEST_list_first"
        n2 = "TEST_list_second"
        requests.post(f"{BASE_URL}/api/status", json={"client_name": n1})
        requests.post(f"{BASE_URL}/api/status", json={"client_name": n2})
        r = requests.get(f"{BASE_URL}/api/status")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        names = [x["client_name"] for x in arr]
        # both present, and n2 comes before n1 (newest first)
        assert n2 in names and n1 in names
        assert names.index(n2) < names.index(n1)


# ---------- Static file / config checks ----------
class TestBackendSecurity:
    def test_server_py_no_mongo(self):
        src = Path("/app/backend/server.py").read_text()
        # strip comments / docstrings for import check
        assert not re.search(r"^\s*(from|import)\s+motor", src, re.M), "motor import found"
        assert not re.search(r"^\s*(from|import)\s+pymongo", src, re.M), "pymongo import found"
        assert "MONGO_URL" not in src
        assert "DB_NAME" not in src

    def test_requirements_no_mongo(self):
        req = Path("/app/backend/requirements.txt").read_text().lower()
        for bad in ("motor", "pymongo", "emergentintegrations"):
            assert bad not in req, f"{bad} found in backend requirements"


class TestVercelServerless:
    def test_api_index_importable_and_self_contained(self):
        src = Path("/app/api/index.py").read_text()
        # Must not import from /app/backend
        assert "from backend" not in src
        assert "import backend" not in src
        # Import cleanly
        import importlib.util
        spec = importlib.util.spec_from_file_location("api_index_mod", "/app/api/index.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert hasattr(mod, "app")
        from fastapi import FastAPI
        assert isinstance(mod.app, FastAPI)


class TestVercelConfigs:
    def _load(self, p):
        return json.loads(Path(p).read_text())

    def test_root_vercel_json(self):
        c = self._load("/app/vercel.json")
        assert c.get("framework") is None
        assert c.get("outputDirectory") == "website"
        assert c.get("cleanUrls") is True
        rewrites = c.get("rewrites", [])
        sources = [r["source"] for r in rewrites]
        assert "/api" in sources
        assert "/api/(.*)" in sources
        for r in rewrites:
            assert r["destination"] == "/api/index"

    def test_frontend_vercel_json(self):
        c = self._load("/app/frontend/vercel.json")
        assert c.get("framework") is None
        bc = c.get("buildCommand", "")
        assert "../website/" in bc and "build/" in bc

    def test_website_vercel_json_valid(self):
        c = self._load("/app/website/vercel.json")
        assert c.get("cleanUrls") is True
