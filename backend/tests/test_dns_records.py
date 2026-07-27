import pytest


@pytest.fixture()
def zone_id(auth_client):
    res = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "example.com"})
    return res.json()["id"]


def test_create_a_record(auth_client, zone_id):
    res = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={
            "name": "www.example.com",
            "type": "A",
            "value": "192.0.2.1",
            "ttl": 300,
            "alias": True,
            "routing_policy": "Weighted",
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["type"] == "A"
    assert body["value"] == "192.0.2.1"
    assert body["alias"] is True
    assert body["routing_policy"] == "Weighted"


def test_create_a_record_invalid_ip(auth_client, zone_id):
    res = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "not-an-ip", "ttl": 300},
    )
    assert res.status_code == 422


def test_mx_requires_priority(auth_client, zone_id):
    res = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "example.com", "type": "MX", "value": "mail.example.com", "ttl": 300},
    )
    assert res.status_code == 422


def test_mx_with_priority_succeeds(auth_client, zone_id):
    res = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={
            "name": "example.com",
            "type": "MX",
            "value": "mail.example.com",
            "ttl": 300,
            "priority": 10,
        },
    )
    assert res.status_code == 201


def test_record_creation_updates_zone_record_count(auth_client, zone_id):
    auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "192.0.2.1", "ttl": 300},
    )
    res = auth_client.get(f"/api/v1/hosted-zones/{zone_id}")
    assert res.json()["record_count"] == 3


def test_list_records_filter_by_type(auth_client, zone_id):
    auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "192.0.2.1", "ttl": 300},
    )
    auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "example.com", "type": "TXT", "value": "hello world", "ttl": 300},
    )
    res = auth_client.get(f"/api/v1/hosted-zones/{zone_id}/records", params={"type": "TXT"})
    body = res.json()
    assert body["total"] == 1
    assert body["items"][0]["type"] == "TXT"


def test_delete_record_updates_zone_record_count(auth_client, zone_id):
    created = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "192.0.2.1", "ttl": 300},
    ).json()

    res = auth_client.delete(f"/api/v1/hosted-zones/{zone_id}/records/{created['id']}")
    assert res.status_code == 204

    zone_res = auth_client.get(f"/api/v1/hosted-zones/{zone_id}")
    assert zone_res.json()["record_count"] == 2


def test_record_not_found_in_wrong_zone(auth_client, zone_id):
    other_zone = auth_client.post("/api/v1/hosted-zones", json={"domain_name": "other.org"}).json()
    created = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "192.0.2.1", "ttl": 300},
    ).json()

    res = auth_client.get(f"/api/v1/hosted-zones/{other_zone['id']}/records/{created['id']}")
    assert res.status_code == 404


def test_update_record_invalid_ip(auth_client, zone_id):
    created = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "192.0.2.1", "ttl": 300},
    ).json()
    res = auth_client.patch(
        f"/api/v1/hosted-zones/{zone_id}/records/{created['id']}",
        json={"value": "invalid-ip"},
    )
    assert res.status_code == 422


def test_update_record_invalid_ttl(auth_client, zone_id):
    created = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={"name": "www.example.com", "type": "A", "value": "192.0.2.1", "ttl": 300},
    ).json()
    res = auth_client.patch(
        f"/api/v1/hosted-zones/{zone_id}/records/{created['id']}",
        json={"ttl": 10},
    )
    assert res.status_code == 422


def test_update_record_mx_priority_none(auth_client, zone_id):
    created = auth_client.post(
        f"/api/v1/hosted-zones/{zone_id}/records",
        json={
            "name": "example.com",
            "type": "MX",
            "value": "mail.example.com",
            "ttl": 300,
            "priority": 10,
        },
    ).json()
    # In SQL, we pass None to clear priority, but for MX it must fail
    res = auth_client.patch(
        f"/api/v1/hosted-zones/{zone_id}/records/{created['id']}",
        json={"priority": None},
    )
    # Note: DNSRecordUpdate fields are optional. But setting it to None directly should fail
    # or if the resulting record has None priority, it should fail.
    # Our validator raises ValueError which is mapped to 422.
    assert res.status_code == 422
