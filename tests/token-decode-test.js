const CognitoDecodeVerifyJWTInit = ({ jwt_decode }) => {
  if (!jwt_decode) {
    throw ReferenceError(
      `package jwt_decode is required. But type '${typeof jwt_decode}'`
    );
  }

  return {
    UNSAFE_BUT_FAST_handler: (event, context, callback) => {
      setTimeout(() => {
        try {
          const token =
            event.headers && event.headers.Authorization
              ? event.headers.Authorization
              : ".";
          const claims = jwt_decode(token);
          if (claims && claims.exp && claims.aud) {
            return callback(null, claims);
          }
          return callback("invalid c");
        } catch (e) {
          const msg = e && e.message ? `${e.message}` : e;
          return callback(msg, msg);
        }
      }, 1);
    }
  };
};

module.exports = exports = CognitoDecodeVerifyJWTInit;
