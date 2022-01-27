const Problem = require('api-problem');

const keycloak = require('../../components/keycloak');

const getToken = req => {
  try {
    return req.kauth.grant.access_token;
  } catch (err) {
    return null;
  }
};

const parseToken = token => {
  try {
    // identity_provider_* will be undefined if user login is to local keycloak (userid/password)
    const {
      identity_provider_identity: identity,
      identity_provider: idp,
      preferred_username: username,
      given_name: firstName,
      family_name: lastName,
      sub: keycloakId,
      name: fullName,
      email
    } = token.content;

    return {
      keycloakId: keycloakId,
      username: identity ? identity : username,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email: email,
      idp: idp ? idp : '',
      public: false
    };
  } catch (e) {
    // any issues parsing the token, or if token doesn't exist, return a default "public" user
    return {
      keycloakId: undefined,
      username: 'public',
      firstName: undefined,
      lastName: undefined,
      fullName: 'public',
      email: undefined,
      idp: 'public',
      public: true
    };
  }
};

const setUser = async (req, _res, next) => {
  const token = getToken(req);
  req.currentUser = parseToken(token);
  next();
};

const currentUser = async (req, res, next) => {
  // Check if authorization header is a bearer token
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // need to check keycloak, ensure the bearer token is valid
    const token = req.headers.authorization.substring(7);
    const ok = await keycloak.grantManager.validateAccessToken(token);
    if (!ok) {
      return new Problem(403, { detail: 'Authorization token is invalid.' }).send(res);
    }
  }

  return setUser(req, res, next);
};

module.exports = {
  currentUser
};
