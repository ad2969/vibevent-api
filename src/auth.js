const fetch = require('node-fetch');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const { APIError } = require('./controllers/lib/_errors');

const ISSUER = process.env.COGNITO_ISSUER_URL;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

const MAX_TOKEN_AGE = '7d'; // 7 days
const ALLOWED_TOKEN_USES = 'id'; // accepted token_use params

const { NODE_ENV } = process.env;
const isTest = NODE_ENV === 'test';

let pemData = null;

const downloadPem = async () => {

  try {

    // get the cognito json
    const response = await fetch(`${ISSUER}/.well-known/jwks.json`);
    const body = await response.json();

    // check if the JWKS data is in the expected format
    if (!body || !body.keys) {

      console.debug(`JWKS data is not in expected format. Response was: ${JSON.stringify(response)}`);
      throw new APIError('JWKS data is not in the expected format', 500, 'InternalError');

    }

    // convert the JWKS data into PEM (for jsonwebtoken)
    const pems = {};

    for (let i = 0; i < body.keys.length; i++) {

      pems[body.keys[i].kid] = jwkToPem(body.keys[i]);

    }

    return pems;

  }
  catch (err) {

    throw err;

  }

};

const decodeHeaders = async (auth) => {

  try {

    // check the format of the header string
    if (!auth || auth.length < 10) {

      console.debug(`Request is missing or includes an invalid Authorization header. Expected to be in the format 'Bearer <your_JWT_token>', but got ${auth}`);
      throw new APIError('Request is missing or includes an invalid Authorization header.', 401, 'AuthorizationHeaderError');

    }
    const authorizationPrefix = auth.substring(0, 7).toLowerCase();
    if (authorizationPrefix !== 'bearer ') {

      console.debug(`Request includes an invalid Authorization header. Expected to be in the format 'Bearer <your_JWT_token>', but got ${authorizationPrefix}`);
      throw new APIError('Request includes an invalid Authorization header.', 401, 'AuthorizationHeaderError');

    }

    // decode the jwt token into read-able payload
    // note: this does not verify the source of the token
    const token = auth.substring(7);
    const decodedNotVerified = jwt.decode(token, { complete: true });
    if (!decodedNotVerified) {

      console.debug('Invalid JWT token. jwt.decode() failure.');
      throw new APIError('Authorization header contains an invalid JWT token.', 401, 'AuthorizationHeaderError');

    }

    return { token, decodedNotVerified };

  }
  catch (err) {

    throw err;

  }

};

const verifyHeaders = async (pems, token, decodedNotVerified) => {

  try {

    // check that the KID is known KID
    if (!decodedNotVerified.header.kid || !pems[decodedNotVerified.header.kid]) {

      console.debug(`Invalid JWT token. Expected a known KID ${JSON.stringify(Object.keys(pems))} but found ${decodedNotVerified.header.kid}.`);
      throw new APIError('Authorization header contains an invalid JWT token.', 401, 'AuthorizationHeaderError');

    }

    // verify that the signature matches the relevant key
    const decodedAndVerified = jwt.verify(token, pems[decodedNotVerified.header.kid], {
      issuer: ISSUER,
      maxAge: MAX_TOKEN_AGE
    });

    if (!decodedAndVerified) {

      console.debug('jwt.verify() did not complete!');
      throw new APIError('Cannot verify id token.', 500, 'InternalError');

    }

    // verify that the token_use match what we've pre-configured
    if (!ALLOWED_TOKEN_USES.includes(decodedAndVerified.token_use)) {

      console.debug(`Invalid JWT token. Expected token_use to be ${JSON.stringify(ALLOWED_TOKEN_USES)} but found ${decodedAndVerified.token_use}.`);
      throw new APIError('Authorization header contains an invalid JWT token.', 401, 'AuthorizationHeaderError');

    }

    // verify that the client_id match what we've pre-configured
    const clientId = (decodedAndVerified.aud || decodedAndVerified.client_id);
    if (clientId !== CLIENT_ID) {

      console.debug(`Invalid JWT token. Expected client id to be ${CLIENT_ID} but found ${clientId}.`);
      throw new APIError('Authorization header contains an invalid JWT token.', 403, 'AuthorizationHeaderError');

    }

    return decodedAndVerified;

  }
  catch (err) {

    console.debug(`Invalid JWT token received. jwt.verify() failed: ${err}.`);
    if (err instanceof jwt.TokenExpiredError) {

      throw new APIError(`Authorization header contains a JWT token that expired at ${err.expiredAt.toISOString()}.`, 401, 'AuthorizationHeaderError');

    }

    throw err;

  }

};

const authMiddleware = async (req, res, next) => {

  try {

    // get Cognito PEM data
    let downloadedPem = {};

    if (pemData || isTest) {

      // dont need to download Cognito PEM data if in test mode,
      // or if the data has already been downloaded before
      downloadedPem = pemData;

    }
    else {

      // download and save PEM data if first time
      downloadedPem = await downloadPem();
      pemData = downloadedPem;

    }

    // check if the PEMs have any errors
    if (!isTest && downloadedPem && downloadedPem.err) {

      throw new APIError(`JWKS Data is invalid. ${downloadedPem.err.message || downloadedPem.err}`, 500, 'InternalError');

    }

    const authorizationHeader = req.get('Authorization');

    // decode the headers
    const { token, decodedNotVerified } = await decodeHeaders(authorizationHeader);

    // verify the headers
    let decoded; // don't verify if in test mode
    if (isTest) decoded = decodedNotVerified.payload;
    else decoded = await verifyHeaders(downloadedPem, token, decodedNotVerified);

    // pass data to the request headers
    req.user = {
      sub: decoded.sub,
      token_use: decoded.token_use,
      id: decoded['custom:mongoid'],
      email: decoded.email,
      username: decoded['cognito:username']
    };

    return next();

  }
  catch (err) {

    console.debug({ err });
    return res.status(err.status || 500).json(err);

  }

};

exports.authMiddleware = authMiddleware;
