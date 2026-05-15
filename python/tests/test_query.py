import pytest
import json
import os
import sys
from pathlib import Path

# Add python dir to path
sys.path.append(str(Path(__file__).parent.parent))

from api.query_lore import search

def test_search_exists():
    """Verify that search returns something for a known term."""
    results = search("Fire", limit=5)
    assert isinstance(results, list)
    assert len(results) > 0
    assert "id" in results[0]
    assert "content" in results[0]

def test_search_filter_rule():
    """Verify that filtering by 'rule' works."""
    results = search("Fire", filter_type="rule", limit=5)
    for r in results:
        assert r["entity_type"] == "rule"

def test_search_no_results():
    """Verify that searching for nonsense returns empty list."""
    results = search("alksjdfhalksjdhfalksjdfh", limit=5)
    assert isinstance(results, list)
    assert len(results) == 0

if __name__ == "__main__":
    pytest.main([__file__])
