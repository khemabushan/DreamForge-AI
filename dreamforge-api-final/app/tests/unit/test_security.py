import uuid

import pytest

from app.core.security import (
    TokenPayloadError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password_roundtrip():
    hashed = hash_password("correct-horse-battery-staple")
    assert verify_password("correct-horse-battery-staple", hashed)
    assert not verify_password("wrong-password", hashed)


def test_password_hash_is_not_plaintext():
    hashed = hash_password("super-secret")
    assert hashed != "super-secret"


def test_access_token_roundtrip():
    user_id = uuid.uuid4()
    token = create_access_token(user_id)
    subject = decode_token(token, expected_type="access")
    assert subject == str(user_id)


def test_refresh_token_rejected_as_access_token():
    user_id = uuid.uuid4()
    refresh = create_refresh_token(user_id)
    with pytest.raises(TokenPayloadError):
        decode_token(refresh, expected_type="access")


def test_garbage_token_rejected():
    with pytest.raises(TokenPayloadError):
        decode_token("not-a-real-token", expected_type="access")
