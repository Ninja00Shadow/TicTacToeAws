import jwt
from jwt import DecodeError
from jwt.algorithms import RSAAlgorithm

from rest_framework_jwt.settings import api_settings

from django.contrib.auth import authenticate


def get_username_from_payload_handler(payload):
    username = payload.get('username')
    new_user = authenticate(remote_user=username)

    # print(new_user.username)
    # print(new_user.uuid)

    return username


def cognito_jwt_decode_handler(token):
    options = {'verify_exp': api_settings.JWT_VERIFY_EXPIRATION}
    unverified_header = jwt.get_unverified_header(token)
    if 'kid' not in unverified_header:
        raise DecodeError('Incorrect authentication credentials.')

    kid = jwt.get_unverified_header(token)['kid']
    try:
        public_key = RSAAlgorithm.from_jwk(api_settings.JWT_PUBLIC_KEY[kid])
    except KeyError:
        raise DecodeError('Can\'t find proper public key in jwks')
    else:
        print('here!')
        return jwt.decode(
            token,
            public_key,
            # api_settings.JWT_VERIFY,
            options=options,
            leeway=api_settings.JWT_LEEWAY,
            audience=api_settings.JWT_AUDIENCE,
            issuer=api_settings.JWT_ISSUER,
            algorithms=api_settings.JWT_ALGORITHM
        )
