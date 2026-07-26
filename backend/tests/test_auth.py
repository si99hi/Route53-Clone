def test_login_success(client, demo_user):
    res = client.post("/api/v1/auth/login", json={"email": demo_user.email, "password": "Demo1234!"})
    assert res.status_code == 200
    assert res.json()["email"] == demo_user.email
    assert "session_token" in res.cookies


def test_login_wrong_password(client, demo_user):
    res = client.post("/api/v1/auth/login", json={"email": demo_user.email, "password": "wrong"})
    assert res.status_code == 401


def test_login_unknown_email(client):
    res = client.post("/api/v1/auth/login", json={"email": "nope@example.com", "password": "x"})
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_me_with_session(auth_client, demo_user):
    res = auth_client.get("/api/v1/auth/me")
    assert res.status_code == 200
    assert res.json()["email"] == demo_user.email


def test_logout_clears_session(auth_client):
    res = auth_client.post("/api/v1/auth/logout")
    assert res.status_code == 204
    res2 = auth_client.get("/api/v1/auth/me")
    assert res2.status_code == 401
