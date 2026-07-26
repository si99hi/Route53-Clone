def test_create_zone(auth_client):
    res = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"})
    assert res.status_code == 201
    body = res.json()
    assert body["domain_name"] == "example.com"
    assert body["type"] == "public"
    assert body["record_count"] == 0


def test_create_zone_requires_auth(client):
    res = client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"})
    assert res.status_code == 401


def test_create_zone_invalid_domain(auth_client):
    res = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "not a domain"})
    assert res.status_code == 422


def test_create_duplicate_zone(auth_client):
    auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"})
    res = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"})
    assert res.status_code == 409


def test_list_zones_with_search(auth_client):
    auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"})
    auth_client.post("/api/v1/hosted-zones", json={"domain_name": "other.org"})

    res = auth_client.get("/api/v1/hosted-zones", params={"search": "example"})
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 1
    assert body["items"][0]["domain_name"] == "example.com"


def test_get_zone_not_found(auth_client):
    res = auth_client.get("/api/v1/hosted-zones/does-not-exist")
    assert res.status_code == 404


def test_update_zone(auth_client):
    created = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"}).json()
    res = auth_client.patch(f"/api/v1/hosted-zones/{created['id']}", json={"description": "updated"})
    assert res.status_code == 200
    assert res.json()["description"] == "updated"


def test_delete_zone(auth_client):
    created = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"}).json()
    res = auth_client.delete(f"/api/v1/hosted-zones/{created['id']}")
    assert res.status_code == 204
    res2 = auth_client.get(f"/api/v1/hosted-zones/{created['id']}")
    assert res2.status_code == 404
