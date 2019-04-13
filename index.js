"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.validateHandler = exports.getHandlerArgumentsLength = exports.CreateInstance = exports.AuthMiddleware = exports.BodyParserMiddleware = exports.BaseMiddleware = exports.MIDDLEWARE_CONSTANTS = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

require("source-map-support/register");

var MIDDLEWARE_PREFIX = "BEFORE_HOOK_";
var MIDDLEWARE_CONSTANTS = {
  HTTP_RESPONSE: "".concat(MIDDLEWARE_PREFIX, "HTTP_RESPONSE")
};
exports.MIDDLEWARE_CONSTANTS = MIDDLEWARE_CONSTANTS;

var isAsyncFunction = function isAsyncFunction(fn) {
  return fn.constructor.name === "AsyncFunction";
};

var objectAssignIfExists = function objectAssignIfExists() {
  var def = (0, _objectSpread2["default"])({}, arguments.length <= 1 ? undefined : arguments[1]);
  var overrideIfExist = (0, _objectSpread2["default"])({}, arguments.length <= 2 ? undefined : arguments[2]);
  Object.keys(def).forEach(function (k) {
    if (overrideIfExist[k]) {
      def[k] = overrideIfExist[k];
    }
  });
  return (0, _objectSpread2["default"])({}, arguments.length <= 0 ? undefined : arguments[0], def);
};

var getHandlerArgumentsLength = function getHandlerArgumentsLength(handler) {
  var result = -1;

  try {
    if (typeof handler !== "function") throw Error("Handler must be a function. type '".concat((0, _typeof2["default"])(handler), "'"));
    var def = handler.toString();
    var removeCommentsRegex = new RegExp(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm);
    var noSpaceAndComments = def.replace(removeCommentsRegex, "").replace(new RegExp("(\\s|\\n)", "g"), "");
    var commasRegExp = new RegExp("\\,", "g");
    var match = noSpaceAndComments.match(commasRegExp);

    if (!match) {
      result = noSpaceAndComments.indexOf("()") > -1 ? 0 : 1;
    } else {
      result = match.length + 1;
    }
  } catch (e) {
    console.error("__getArgumentsLength__. ".concat(e.message));
  }

  return result;
};

exports.getHandlerArgumentsLength = getHandlerArgumentsLength;

var validateHandler = function validateHandler(handler) {
  if (typeof handler !== "function") throw TypeError("Handler must be a function".concat((0, _typeof2["default"])(handler), " ").concat(Object.keys(handler).reduce(function (acc, cur) {
    return "".concat(acc, " ").concat(cur);
  }, "")));
  var count = getHandlerArgumentsLength(handler);
  return count >= 0 || count <= 1;
};

exports.validateHandler = validateHandler;

var readError = function readError(e) {
  var isMiddlewareHTTPResponse = false;

  try {
    var objError = (0, _typeof2["default"])(e.message) === "object" ? e.message : JSON.parse(e.message);
    isMiddlewareHTTPResponse = objError.type === MIDDLEWARE_CONSTANTS.HTTP_RESPONSE;
    var responseObject = objError.responseObject;

    if (typeof responseObject === "undefined") {
      throw Error("Invalid custom \"responseObject\"");
    }

    return {
      e: e,
      isMiddlewareHTTPResponse: isMiddlewareHTTPResponse,
      responseObject: responseObject
    };
  } catch (err) {
    return {
      e: e,
      err: err,
      errorMessage: "".concat(e.message, " - ").concat(err.message)
    };
  }
};

var MiddlewareHelpersInit = function MiddlewareHelpersInit() {
  var pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: function log() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.forEach(function (l) {
        return console.log(l.message || l);
      });
    },

    /* eslint-disable-next-line no-console */
    logError: function logError() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return args.forEach(function (l) {
        return console.error(l.message || l);
      });
    }
  };

  var returnAndSendResponse = function returnAndSendResponse(obj) {
    var stringErr = "";

    try {
      var errorObj = {
        type: MIDDLEWARE_CONSTANTS.HTTP_RESPONSE,
        responseObject: obj
      };
      stringErr = JSON.stringify((0, _objectSpread2["default"])({}, errorObj));
    } catch (e) {
      if (pvtLogger && typeof pvtLogger.logError === "function") {
        pvtLogger.logError(e);
      }

      throw e;
    }

    throw Error(stringErr);
  };

  return function () {
    return {
      returnAndSendResponse: returnAndSendResponse,
      getLogger: function getLogger() {
        return pvtLogger;
      }
    };
  };
};

var setState = function setState(objs, state) {
  var newState = state; // console.log("state", state);

  Object.keys(objs).forEach(function (key) {
    newState[key] = objs[key];
  }); // console.log("new state", newState);

  return newState;
};

var _setContext = setState;

var simpleClone = function simpleClone(objectToClone) {
  return JSON.parse(JSON.stringify(objectToClone));
};

var clone = simpleClone;

var BaseMiddlewareHandlerInit = function BaseMiddlewareHandlerInit(handler) {
  var fn =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(event, context) {
      var pvtEvent, pvtContext;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              pvtEvent = event ? clone(event) : "";
              pvtContext = context ? clone(context) : "";
              _context.next = 4;
              return handler({
                getParams: function getParams() {
                  return {
                    event: pvtEvent,
                    setEvent: function setEvent(objs) {
                      return setState(objs, pvtEvent);
                    },
                    context: pvtContext,
                    setContext: function setContext(objs) {
                      return _setContext(objs, pvtContext);
                    }
                  };
                },
                getHelpers: MiddlewareHelpersInit()
              }, {});

            case 4:
              return _context.abrupt("return", {
                event: pvtEvent,
                context: pvtContext
              });

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function fn(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  return fn;
};

var BaseMiddleware = function BaseMiddleware() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      handler = _ref2.handler,
      configure = _ref2.configure;

  if (!(typeof handler === "function")) {
    throw Error("Custom middlewares must define a \"handler\"");
  }

  var pre =
  /*#__PURE__*/
  function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function pre() {
      return _ref3.apply(this, arguments);
    };
  }();

  pre = BaseMiddlewareHandlerInit(handler);
  pre.isHookMiddleware = true;

  if (configure && configure.augmentMethods) {
    var _configure$augmentMet = configure.augmentMethods,
        augmentMethods = _configure$augmentMet === void 0 ? {} : _configure$augmentMet;
    var configurableMethods = ["onCatchHandler"];
    configurableMethods.forEach(function (fnName) {
      var newMethod = augmentMethods[fnName];

      if (typeof newMethod === "function") {
        if (fnName === "onCatchHandler") {
          pre.scrtOnCatchHandler = function (oldMethod, e) {
            return newMethod(function () {
              return oldMethod(e);
            }, {
              prevMethodwithNoArgs: oldMethod,
              arg: e
            });
          };
        }
      }
    });
  }

  return pre;
};

exports.BaseMiddleware = BaseMiddleware;

var BodyParserMiddleware = function BodyParserMiddleware() {
  return BaseMiddleware({
    handler: function () {
      var _handler = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3(_ref4) {
        var getParams, _getParams, event, setEvent;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                getParams = _ref4.getParams;
                _getParams = getParams(), event = _getParams.event, setEvent = _getParams.setEvent;

                if (Object.keys((0, _objectSpread2["default"])({}, event.body)).length) {
                  setEvent({
                    body: JSON.parse(event.body)
                  });
                }

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function handler(_x3) {
        return _handler.apply(this, arguments);
      }

      return handler;
    }()
  });
};

exports.BodyParserMiddleware = BodyParserMiddleware;

var AuthMiddleware = function AuthMiddleware() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      promisify = _ref5.promisify,
      cognitoJWTDecodeHandler = _ref5.cognitoJWTDecodeHandler;

  if (promisify && typeof promisify !== "function" || cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function") {
    throw Error("invalid (promisify and cognitoJWTDecodeHandler) passed. ".concat((0, _typeof2["default"])(promisify), ",  ").concat((0, _typeof2["default"])(cognitoJWTDecodeHandler)));
  }

  return BaseMiddleware({
    configure: {
      augmentMethods: {
        onCatchHandler: function onCatchHandler() {
          return {
            statusCode: 403,
            body: "Invalid Session",
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          };
        }
      }
    },
    handler: function () {
      var _handler2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4(_ref6) {
        var getParams, getHelpers, _getParams2, event, setEvent, context, _getHelpers, returnAndSendResponse, newEventHeaders, promised, claims;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                getParams = _ref6.getParams, getHelpers = _ref6.getHelpers;
                _getParams2 = getParams(), event = _getParams2.event, setEvent = _getParams2.setEvent, context = _getParams2.context;
                _getHelpers = getHelpers(), returnAndSendResponse = _getHelpers.returnAndSendResponse;

                if (!(!event || !event.headers)) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt("return", {});

              case 5:
                newEventHeaders = (0, _objectSpread2["default"])({}, event.headers);

                if (!newEventHeaders.Authorization) {
                  newEventHeaders.Authorization = newEventHeaders.authorization;
                }

                promised = cognitoJWTDecodeHandler;

                if (!isAsyncFunction(promised)) {
                  promised = promisify(promised);
                }

                _context4.next = 11;
                return promised(Object.assign({}, event, {
                  headers: newEventHeaders
                }), context);

              case 11:
                claims = _context4.sent;

                if (!(!claims || typeof claims.sub !== "string")) {
                  _context4.next = 14;
                  break;
                }

                return _context4.abrupt("return", returnAndSendResponse({
                  statusCode: 403,
                  body: "Invalid Session",
                  headers: {
                    "Access-Control-Allow-Origin": "*"
                  }
                }));

              case 14:
                setEvent({
                  user: claims
                });
                return _context4.abrupt("return", {});

              case 16:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function handler(_x4) {
        return _handler2.apply(this, arguments);
      }

      return handler;
    }()
  });
};

exports.AuthMiddleware = AuthMiddleware;

var CreateInstance = function CreateInstance(options) {
  var settings = {
    DEBUG: false,
    stopOnCatch: true,
    silent: false
  };
  settings = objectAssignIfExists({}, settings, options);
  var pvtDispatched = false;
  var stackedHooks = [];
  var isHandlerFed = false;

  var handler =
  /*#__PURE__*/
  function () {
    var _ref7 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee5() {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function handler() {
      return _ref7.apply(this, arguments);
    };
  }();

  var FOInvokeMiddlewares =
  /*#__PURE__*/
  function () {
    var _ref8 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee6() {
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function FOInvokeMiddlewares() {
      return _ref8.apply(this, arguments);
    };
  }();
  /**
   *
   * CONFIGURABLES - START
   *
  **/


  var pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: function log() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return args.forEach(function (l) {
        return console.log(l.message || l);
      });
    },

    /* eslint-disable-next-line no-console */
    logError: function logError() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return args.forEach(function (l) {
        return console.error(l.message || l);
      });
    },

    /* eslint-disable-next-line no-console */
    logWarning: function logWarning() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return args.forEach(function (l) {
        return console.error("WARNING: ".concat(l.message || l));
      });
    }
  };

  if (settings.DEBUG !== true || settings.silent === true) {
    pvtLogger.log = function () {};

    pvtLogger.logError = function () {};

    pvtLogger.logWarning = function () {};
  }

  var onCatchHandler = function onCatchHandler(e) {
    if (pvtLogger && typeof pvtLogger.logError === "function") {
      pvtLogger.logError(e);
    }

    var read = readError(e);

    if (read.isMiddlewareHTTPResponse === true) {
      return read.responseObject;
    }

    return {
      statusCode: 500,
      body: "".concat(read.errorMessage)
    };
  };

  var handlerCallWrapper = function handlerCallWrapper() {
    return handler.apply(void 0, arguments);
  };
  /**
   *
   * CONFIGURABLES - END
   *
  **/


  var configure = function configure() {
    var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref9$augmentMethods = _ref9.augmentMethods,
        augmentMethods = _ref9$augmentMethods === void 0 ? {} : _ref9$augmentMethods;

    var configurableMethods = ["onCatchHandler", "handlerCallWrapper", "pvtLogger"];
    configurableMethods.forEach(function (fnName) {
      var newMethod = augmentMethods[fnName];

      if (typeof newMethod === "function") {
        if (fnName === "onCatchHandler") {
          var oldMethod = onCatchHandler;

          onCatchHandler = function onCatchHandler(e) {
            return newMethod(function () {
              return oldMethod(e);
            }, {
              prevMethodwithNoArgs: oldMethod,
              arg: e
            });
          };
        } else if (fnName === "handlerCallWrapper") {
          var _oldMethod = handlerCallWrapper;

          handlerCallWrapper = function handlerCallWrapper(e) {
            return newMethod(function () {
              return _oldMethod(e);
            }, {
              prevMethodwithNoArgs: _oldMethod,
              arg: e
            });
          };
        } else if (fnName === "pvtLogger") {
          var _oldMethod2 = pvtLogger;

          pvtLogger = function pvtLogger(e) {
            return newMethod(function () {
              return _oldMethod2(e);
            }, {
              prevMethodwithNoArgs: _oldMethod2,
              arg: e
            });
          };
        }
      }
    });
  };
  /* init configurables */


  if (options && options.configure) {
    configure(options.configure);
  }
  /**
   *
   * CORE - START
   *
  **/

  /** Function Object Init "Before Hook" **/


  var FOInitBeforeHook = function FOInitBeforeHook() {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    if (typeof args[0] !== "function") {
      return FOInvokeMiddlewares.apply(void 0, args);
    }

    if (isHandlerFed === false && validateHandler(args[0]) === false) {
      throw Error("DEPRECATED - Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}");
    }

    if (isHandlerFed === true && args[0].isHookMiddleware !== true) {
      /* then we assume this scenario calls for a new instance */
      return CreateInstance(options)(args[0]);
    }

    handler = args[0];
    isHandlerFed = true;
    return FOInvokeMiddlewares;
  };

  FOInitBeforeHook.use = function () {
    var middleware = arguments.length <= 0 ? undefined : arguments[0];

    if (isHandlerFed === false) {
      throw Error("A handler needs to be fed first before calling .use");
    }

    if (arguments.length > 1) {
      if (pvtLogger && typeof pvtLogger.logWarning === "function") {
        pvtLogger.logWarning("Ignoring 2nd argument. \"use\" method was called with more than 1 argument.");
      }
    }

    if (pvtDispatched === true) {
      throw Error("Using middlewares again after handler's invocation is not allowed.");
    }

    if (middleware.isHookMiddleware === true) {
      stackedHooks.push(middleware);
    } else {
      throw Error("Unknown middlewares are not yet supported. Please extend `Base` middleware instead.");
    }

    return FOInitBeforeHook;
  };

  FOInitBeforeHook.setLogger = function (newLogger) {
    pvtLogger = newLogger;
  };

  FOInitBeforeHook.getLogger = function () {
    return pvtLogger;
  };

  FOInvokeMiddlewares =
  /*#__PURE__*/
  function () {
    var _ref10 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee7(event, context) {
      var extendedEvent, extendedContext, hookBeforeCatching, _i, _stackedHooks, hook, extensions, catchHandlerToUse;

      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              extendedEvent = event;
              extendedContext = context;
              hookBeforeCatching = {};
              pvtDispatched = true;
              _context7.prev = 4;
              _i = 0, _stackedHooks = stackedHooks;

            case 6:
              if (!(_i < _stackedHooks.length)) {
                _context7.next = 17;
                break;
              }

              hook = _stackedHooks[_i];
              hookBeforeCatching = hook;
              /* eslint-disable-next-line no-await-in-loop */

              _context7.next = 11;
              return hook(extendedEvent, extendedContext);

            case 11:
              extensions = _context7.sent;

              if (extensions.event) {
                extendedEvent = Object.assign({}, extendedEvent, extensions.event);
              }

              if (extensions.context) {
                extendedContext = Object.assign({}, extendedContext, extensions.context);
              }

            case 14:
              _i++;
              _context7.next = 6;
              break;

            case 17:
              _context7.next = 25;
              break;

            case 19:
              _context7.prev = 19;
              _context7.t0 = _context7["catch"](4);
              catchHandlerToUse = typeof hookBeforeCatching.scrtOnCatchHandler === "function" ? function (err) {
                return hookBeforeCatching.scrtOnCatchHandler(onCatchHandler, err);
              } : onCatchHandler;

              if (!(settings.stopOnCatch === true)) {
                _context7.next = 24;
                break;
              }

              return _context7.abrupt("return", catchHandlerToUse(_context7.t0));

            case 24:
              catchHandlerToUse(_context7.t0);

            case 25:
              return _context7.abrupt("return", handlerCallWrapper(extendedEvent, extendedContext));

            case 26:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, null, [[4, 19]]);
    }));

    return function FOInvokeMiddlewares(_x5, _x6) {
      return _ref10.apply(this, arguments);
    };
  }();
  /* copy properties of FOInitBeforeHook to FOInvokeMiddlewares - so we can chain .use and etc */


  Object.keys(FOInitBeforeHook).forEach(function (method) {
    FOInvokeMiddlewares[method] = FOInitBeforeHook[method];
  });
  /**
   *
   * CORE - END
   *
  **/

  return FOInitBeforeHook;
};

exports.CreateInstance = CreateInstance;
var _default = CreateInstance;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnNvdXJjZS5qcyJdLCJuYW1lcyI6WyJNSURETEVXQVJFX1BSRUZJWCIsIk1JRERMRVdBUkVfQ09OU1RBTlRTIiwiSFRUUF9SRVNQT05TRSIsImlzQXN5bmNGdW5jdGlvbiIsImZuIiwiY29uc3RydWN0b3IiLCJuYW1lIiwib2JqZWN0QXNzaWduSWZFeGlzdHMiLCJkZWYiLCJvdmVycmlkZUlmRXhpc3QiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImsiLCJnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoIiwiaGFuZGxlciIsInJlc3VsdCIsIkVycm9yIiwidG9TdHJpbmciLCJyZW1vdmVDb21tZW50c1JlZ2V4IiwiUmVnRXhwIiwibm9TcGFjZUFuZENvbW1lbnRzIiwicmVwbGFjZSIsImNvbW1hc1JlZ0V4cCIsIm1hdGNoIiwiaW5kZXhPZiIsImxlbmd0aCIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIiwidmFsaWRhdGVIYW5kbGVyIiwiVHlwZUVycm9yIiwicmVkdWNlIiwiYWNjIiwiY3VyIiwiY291bnQiLCJyZWFkRXJyb3IiLCJpc01pZGRsZXdhcmVIVFRQUmVzcG9uc2UiLCJvYmpFcnJvciIsIkpTT04iLCJwYXJzZSIsInR5cGUiLCJyZXNwb25zZU9iamVjdCIsImVyciIsImVycm9yTWVzc2FnZSIsIk1pZGRsZXdhcmVIZWxwZXJzSW5pdCIsInB2dExvZ2dlciIsImxvZyIsImFyZ3MiLCJsIiwibG9nRXJyb3IiLCJyZXR1cm5BbmRTZW5kUmVzcG9uc2UiLCJvYmoiLCJzdHJpbmdFcnIiLCJlcnJvck9iaiIsInN0cmluZ2lmeSIsImdldExvZ2dlciIsInNldFN0YXRlIiwib2JqcyIsInN0YXRlIiwibmV3U3RhdGUiLCJrZXkiLCJzZXRDb250ZXh0Iiwic2ltcGxlQ2xvbmUiLCJvYmplY3RUb0Nsb25lIiwiY2xvbmUiLCJCYXNlTWlkZGxld2FyZUhhbmRsZXJJbml0IiwiZXZlbnQiLCJjb250ZXh0IiwicHZ0RXZlbnQiLCJwdnRDb250ZXh0IiwiZ2V0UGFyYW1zIiwic2V0RXZlbnQiLCJnZXRIZWxwZXJzIiwiQmFzZU1pZGRsZXdhcmUiLCJjb25maWd1cmUiLCJwcmUiLCJpc0hvb2tNaWRkbGV3YXJlIiwiYXVnbWVudE1ldGhvZHMiLCJjb25maWd1cmFibGVNZXRob2RzIiwiZm5OYW1lIiwibmV3TWV0aG9kIiwic2NydE9uQ2F0Y2hIYW5kbGVyIiwib2xkTWV0aG9kIiwicHJldk1ldGhvZHdpdGhOb0FyZ3MiLCJhcmciLCJCb2R5UGFyc2VyTWlkZGxld2FyZSIsImJvZHkiLCJBdXRoTWlkZGxld2FyZSIsInByb21pc2lmeSIsImNvZ25pdG9KV1REZWNvZGVIYW5kbGVyIiwib25DYXRjaEhhbmRsZXIiLCJzdGF0dXNDb2RlIiwiaGVhZGVycyIsIm5ld0V2ZW50SGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJhdXRob3JpemF0aW9uIiwicHJvbWlzZWQiLCJhc3NpZ24iLCJjbGFpbXMiLCJzdWIiLCJ1c2VyIiwiQ3JlYXRlSW5zdGFuY2UiLCJvcHRpb25zIiwic2V0dGluZ3MiLCJERUJVRyIsInN0b3BPbkNhdGNoIiwic2lsZW50IiwicHZ0RGlzcGF0Y2hlZCIsInN0YWNrZWRIb29rcyIsImlzSGFuZGxlckZlZCIsIkZPSW52b2tlTWlkZGxld2FyZXMiLCJsb2dXYXJuaW5nIiwicmVhZCIsImhhbmRsZXJDYWxsV3JhcHBlciIsIkZPSW5pdEJlZm9yZUhvb2siLCJ1c2UiLCJtaWRkbGV3YXJlIiwicHVzaCIsInNldExvZ2dlciIsIm5ld0xvZ2dlciIsImV4dGVuZGVkRXZlbnQiLCJleHRlbmRlZENvbnRleHQiLCJob29rQmVmb3JlQ2F0Y2hpbmciLCJob29rIiwiZXh0ZW5zaW9ucyIsImNhdGNoSGFuZGxlclRvVXNlIiwibWV0aG9kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsaUJBQWlCLEdBQUcsY0FBMUI7QUFDQSxJQUFNQyxvQkFBb0IsR0FBRztBQUMzQkMsRUFBQUEsYUFBYSxZQUFLRixpQkFB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QUFBO0FBaUNsQkEsY0FBQUEsaUJBQWlCLGNBQWpCOztBQWpDa0I7QUFBQSxnREFvQ2JaLGtCQUFrQixDQUFDTyxhQUFELEVBQWdCQyxlQUFoQixDQXBDTDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFIOztBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQW5CO0FBdUNBOzs7QUFDQWpILEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZeUcsZ0JBQVosRUFBOEJ4RyxPQUE5QixDQUFzQyxVQUFBb0gsTUFBTSxFQUFJO0FBQzlDaEIsSUFBQUEsbUJBQW1CLENBQUNnQixNQUFELENBQW5CLEdBQThCWixnQkFBZ0IsQ0FBQ1ksTUFBRCxDQUE5QztBQUNELEdBRkQ7QUFJQTs7Ozs7O0FBTUEsU0FBT1osZ0JBQVA7QUFDRCxDQWpPRDs7O2VBNk9lYixjIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgTUlERExFV0FSRV9QUkVGSVggPSBcIkJFRk9SRV9IT09LX1wiO1xuY29uc3QgTUlERExFV0FSRV9DT05TVEFOVFMgPSB7XG4gIEhUVFBfUkVTUE9OU0U6IGAke01JRERMRVdBUkVfUFJFRklYfUhUVFBfUkVTUE9OU0VgXG59O1xuXG5jb25zdCBpc0FzeW5jRnVuY3Rpb24gPSBmbiA9PiB7XG4gIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lID09PSBcIkFzeW5jRnVuY3Rpb25cIjtcbn07XG5cbmNvbnN0IG9iamVjdEFzc2lnbklmRXhpc3RzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGVmID0geyAuLi5hcmdzWzFdIH07XG4gIGNvbnN0IG92ZXJyaWRlSWZFeGlzdCA9IHsgLi4uYXJnc1syXSB9O1xuICBPYmplY3Qua2V5cyhkZWYpLmZvckVhY2goayA9PiB7XG4gICAgaWYgKG92ZXJyaWRlSWZFeGlzdFtrXSkge1xuICAgICAgZGVmW2tdID0gb3ZlcnJpZGVJZkV4aXN0W2tdO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHsgLi4uYXJnc1swXSwgLi4uZGVmIH07XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoID0gaGFuZGxlciA9PiB7XG4gIGxldCByZXN1bHQgPSAtMTtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIilcbiAgICAgIHRocm93IEVycm9yKGBIYW5kbGVyIG11c3QgYmUgYSBmdW5jdGlvbi4gdHlwZSAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG5cbiAgICBjb25zdCBkZWYgPSBoYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgcmVtb3ZlQ29tbWVudHNSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgICAvXFwvXFwqW1xcc1xcU10qP1xcKlxcL3woW15cXFxcOl18XilcXC9cXC8uKiQvZ21cbiAgICApO1xuICAgIGNvbnN0IG5vU3BhY2VBbmRDb21tZW50cyA9IGRlZlxuICAgICAgLnJlcGxhY2UocmVtb3ZlQ29tbWVudHNSZWdleCwgXCJcIilcbiAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXFxcXHN8XFxcXG4pXCIsIFwiZ1wiKSwgXCJcIik7XG5cbiAgICBjb25zdCBjb21tYXNSZWdFeHAgPSBuZXcgUmVnRXhwKGBcXFxcLGAsIFwiZ1wiKTtcblxuICAgIGNvbnN0IG1hdGNoID0gbm9TcGFjZUFuZENvbW1lbnRzLm1hdGNoKGNvbW1hc1JlZ0V4cCk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmVzdWx0ID0gbm9TcGFjZUFuZENvbW1lbnRzLmluZGV4T2YoXCIoKVwiKSA+IC0xID8gMCA6IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG1hdGNoLmxlbmd0aCArIDE7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihgX19nZXRBcmd1bWVudHNMZW5ndGhfXy4gJHtlLm1lc3NhZ2V9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuY29uc3QgdmFsaWRhdGVIYW5kbGVyID0gaGFuZGxlciA9PiB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICAgIHRocm93IFR5cGVFcnJvcihcbiAgICAgIGBIYW5kbGVyIG11c3QgYmUgYSBmdW5jdGlvbiR7dHlwZW9mIGhhbmRsZXJ9ICR7T2JqZWN0LmtleXMoXG4gICAgICAgIGhhbmRsZXJcbiAgICAgICkucmVkdWNlKChhY2MsIGN1cikgPT4gYCR7YWNjfSAke2N1cn1gLCBcIlwiKX1gXG4gICAgKTtcblxuICBjb25zdCBjb3VudCA9IGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgoaGFuZGxlcik7XG4gIHJldHVybiBjb3VudCA+PSAwIHx8IGNvdW50IDw9IDE7XG59O1xuXG5jb25zdCByZWFkRXJyb3IgPSBlID0+IHtcbiAgbGV0IGlzTWlkZGxld2FyZUhUVFBSZXNwb25zZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGNvbnN0IG9iakVycm9yID1cbiAgICAgIHR5cGVvZiBlLm1lc3NhZ2UgPT09IFwib2JqZWN0XCIgPyBlLm1lc3NhZ2UgOiBKU09OLnBhcnNlKGUubWVzc2FnZSk7XG5cbiAgICBpc01pZGRsZXdhcmVIVFRQUmVzcG9uc2UgPVxuICAgICAgb2JqRXJyb3IudHlwZSA9PT0gTUlERExFV0FSRV9DT05TVEFOVFMuSFRUUF9SRVNQT05TRTtcblxuICAgIGNvbnN0IHsgcmVzcG9uc2VPYmplY3QgfSA9IG9iakVycm9yO1xuICAgIGlmICh0eXBlb2YgcmVzcG9uc2VPYmplY3QgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGN1c3RvbSBcInJlc3BvbnNlT2JqZWN0XCJgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZSxcbiAgICAgIGlzTWlkZGxld2FyZUhUVFBSZXNwb25zZSxcbiAgICAgIHJlc3BvbnNlT2JqZWN0XG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHsgZSwgZXJyLCBlcnJvck1lc3NhZ2U6IGAke2UubWVzc2FnZX0gLSAke2Vyci5tZXNzYWdlfWAgfTtcbiAgfVxufTtcblxuY29uc3QgTWlkZGxld2FyZUhlbHBlcnNJbml0ID0gKCkgPT4ge1xuICBjb25zdCBwdnRMb2dnZXIgPSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2c6ICguLi5hcmdzKSA9PiBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmxvZyhsLm1lc3NhZ2UgfHwgbCkpLFxuXG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dFcnJvcjogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUuZXJyb3IobC5tZXNzYWdlIHx8IGwpKVxuICB9O1xuXG4gIGNvbnN0IHJldHVybkFuZFNlbmRSZXNwb25zZSA9IG9iaiA9PiB7XG4gICAgbGV0IHN0cmluZ0VyciA9IFwiXCI7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVycm9yT2JqID0ge1xuICAgICAgICB0eXBlOiBNSURETEVXQVJFX0NPTlNUQU5UUy5IVFRQX1JFU1BPTlNFLFxuICAgICAgICByZXNwb25zZU9iamVjdDogb2JqXG4gICAgICB9O1xuICAgICAgc3RyaW5nRXJyID0gSlNPTi5zdHJpbmdpZnkoeyAuLi5lcnJvck9iaiB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAocHZ0TG9nZ2VyICYmIHR5cGVvZiBwdnRMb2dnZXIubG9nRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBwdnRMb2dnZXIubG9nRXJyb3IoZSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRocm93IEVycm9yKHN0cmluZ0Vycik7XG4gIH07XG5cbiAgcmV0dXJuICgpID0+ICh7XG4gICAgcmV0dXJuQW5kU2VuZFJlc3BvbnNlLFxuICAgIGdldExvZ2dlcjogKCkgPT4gcHZ0TG9nZ2VyXG4gIH0pO1xufTtcblxuY29uc3Qgc2V0U3RhdGUgPSAob2Jqcywgc3RhdGUpID0+IHtcbiAgY29uc3QgbmV3U3RhdGUgPSBzdGF0ZTtcblxuICAvLyBjb25zb2xlLmxvZyhcInN0YXRlXCIsIHN0YXRlKTtcbiAgT2JqZWN0LmtleXMob2JqcykuZm9yRWFjaChrZXkgPT4ge1xuICAgIG5ld1N0YXRlW2tleV0gPSBvYmpzW2tleV07XG4gIH0pO1xuXG4gIC8vIGNvbnNvbGUubG9nKFwibmV3IHN0YXRlXCIsIG5ld1N0YXRlKTtcbiAgcmV0dXJuIG5ld1N0YXRlO1xufTtcbmNvbnN0IHNldENvbnRleHQgPSBzZXRTdGF0ZTtcbmNvbnN0IHNpbXBsZUNsb25lID0gb2JqZWN0VG9DbG9uZSA9PiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iamVjdFRvQ2xvbmUpKTtcbmNvbnN0IGNsb25lID0gc2ltcGxlQ2xvbmU7XG5cbmNvbnN0IEJhc2VNaWRkbGV3YXJlSGFuZGxlckluaXQgPSBoYW5kbGVyID0+IHtcbiAgY29uc3QgZm4gPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCBwdnRFdmVudCA9IGV2ZW50ID8gY2xvbmUoZXZlbnQpIDogXCJcIjtcbiAgICBjb25zdCBwdnRDb250ZXh0ID0gY29udGV4dCA/IGNsb25lKGNvbnRleHQpIDogXCJcIjtcblxuICAgIGF3YWl0IGhhbmRsZXIoXG4gICAgICB7XG4gICAgICAgIGdldFBhcmFtczogKCkgPT4gKHtcbiAgICAgICAgICBldmVudDogcHZ0RXZlbnQsXG4gICAgICAgICAgc2V0RXZlbnQ6IG9ianMgPT4gc2V0U3RhdGUob2JqcywgcHZ0RXZlbnQpLFxuICAgICAgICAgIGNvbnRleHQ6IHB2dENvbnRleHQsXG4gICAgICAgICAgc2V0Q29udGV4dDogb2JqcyA9PiBzZXRDb250ZXh0KG9ianMsIHB2dENvbnRleHQpXG4gICAgICAgIH0pLFxuICAgICAgICBnZXRIZWxwZXJzOiBNaWRkbGV3YXJlSGVscGVyc0luaXQoKVxuICAgICAgfSxcbiAgICAgIHt9XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBldmVudDogcHZ0RXZlbnQsXG4gICAgICBjb250ZXh0OiBwdnRDb250ZXh0XG4gICAgfTtcbiAgfTtcblxuICByZXR1cm4gZm47XG59O1xuXG5jb25zdCBCYXNlTWlkZGxld2FyZSA9ICh7IGhhbmRsZXIsIGNvbmZpZ3VyZSB9ID0ge30pID0+IHtcbiAgaWYgKCEodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICB0aHJvdyBFcnJvcihgQ3VzdG9tIG1pZGRsZXdhcmVzIG11c3QgZGVmaW5lIGEgXCJoYW5kbGVyXCJgKTtcbiAgfVxuXG4gIGxldCBwcmUgPSBhc3luYyAoKSA9PiB7fTtcbiAgcHJlID0gQmFzZU1pZGRsZXdhcmVIYW5kbGVySW5pdChoYW5kbGVyKTtcblxuICBwcmUuaXNIb29rTWlkZGxld2FyZSA9IHRydWU7XG5cbiAgaWYgKGNvbmZpZ3VyZSAmJiBjb25maWd1cmUuYXVnbWVudE1ldGhvZHMpIHtcbiAgICBjb25zdCB7IGF1Z21lbnRNZXRob2RzID0ge30gfSA9IGNvbmZpZ3VyZTtcbiAgICBjb25zdCBjb25maWd1cmFibGVNZXRob2RzID0gW1wib25DYXRjaEhhbmRsZXJcIl07XG5cbiAgICBjb25maWd1cmFibGVNZXRob2RzLmZvckVhY2goZm5OYW1lID0+IHtcbiAgICAgIGNvbnN0IG5ld01ldGhvZCA9IGF1Z21lbnRNZXRob2RzW2ZuTmFtZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbmV3TWV0aG9kID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGZuTmFtZSA9PT0gXCJvbkNhdGNoSGFuZGxlclwiKSB7XG5cbiAgICAgICAgICBwcmUuc2NydE9uQ2F0Y2hIYW5kbGVyID0gKG9sZE1ldGhvZCwgZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ld01ldGhvZCgoKSA9PiBvbGRNZXRob2QoZSksIHtcbiAgICAgICAgICAgICAgcHJldk1ldGhvZHdpdGhOb0FyZ3M6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcHJlO1xufTtcblxuY29uc3QgQm9keVBhcnNlck1pZGRsZXdhcmUgPSAoKSA9PiB7XG4gIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgZXZlbnQsIHNldEV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh7IC4uLmV2ZW50LmJvZHkgfSkubGVuZ3RoKSB7XG4gICAgICAgIHNldEV2ZW50KHsgYm9keTogSlNPTi5wYXJzZShldmVudC5ib2R5KSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgQXV0aE1pZGRsZXdhcmUgPSAoeyBwcm9taXNpZnksIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyIH0gPSB7fSkgPT4ge1xuICBpZiAoXG4gICAgKHByb21pc2lmeSAmJiB0eXBlb2YgcHJvbWlzaWZ5ICE9PSBcImZ1bmN0aW9uXCIpIHx8XG4gICAgKGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyICYmIHR5cGVvZiBjb2duaXRvSldURGVjb2RlSGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICApIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIChwcm9taXNpZnkgYW5kIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyKSBwYXNzZWQuICR7dHlwZW9mIHByb21pc2lmeX0sICAke3R5cGVvZiBjb2duaXRvSldURGVjb2RlSGFuZGxlcn1gXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgY29uZmlndXJlOiB7XG4gICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICBvbkNhdGNoSGFuZGxlcjogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgICAgICBib2R5OiBcIkludmFsaWQgU2Vzc2lvblwiLFxuICAgICAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zLCBnZXRIZWxwZXJzIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgZXZlbnQsIHNldEV2ZW50LCBjb250ZXh0IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgIGNvbnN0IHsgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIH0gPSBnZXRIZWxwZXJzKCk7XG5cbiAgICAgIGlmICghZXZlbnQgfHwgIWV2ZW50LmhlYWRlcnMpIHJldHVybiB7fTtcblxuICAgICAgY29uc3QgbmV3RXZlbnRIZWFkZXJzID0ge1xuICAgICAgICAuLi5ldmVudC5oZWFkZXJzXG4gICAgICB9O1xuXG4gICAgICBpZiAoIW5ld0V2ZW50SGVhZGVycy5BdXRob3JpemF0aW9uKSB7XG4gICAgICAgIG5ld0V2ZW50SGVhZGVycy5BdXRob3JpemF0aW9uID0gbmV3RXZlbnRIZWFkZXJzLmF1dGhvcml6YXRpb247XG4gICAgICB9XG5cbiAgICAgIGxldCBwcm9taXNlZCA9IGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyO1xuICAgICAgaWYgKCFpc0FzeW5jRnVuY3Rpb24ocHJvbWlzZWQpKSB7XG4gICAgICAgIHByb21pc2VkID0gcHJvbWlzaWZ5KHByb21pc2VkKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsYWltcyA9IGF3YWl0IHByb21pc2VkKFxuICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBldmVudCwgeyBoZWFkZXJzOiBuZXdFdmVudEhlYWRlcnMgfSksXG4gICAgICAgIGNvbnRleHRcbiAgICAgICk7XG5cbiAgICAgIGlmICghY2xhaW1zIHx8IHR5cGVvZiBjbGFpbXMuc3ViICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiByZXR1cm5BbmRTZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMyxcbiAgICAgICAgICBib2R5OiBcIkludmFsaWQgU2Vzc2lvblwiLFxuICAgICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc2V0RXZlbnQoeyB1c2VyOiBjbGFpbXMgfSk7XG5cbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgQ3JlYXRlSW5zdGFuY2UgPSBvcHRpb25zID0+IHtcbiAgbGV0IHNldHRpbmdzID0ge1xuICAgIERFQlVHOiBmYWxzZSxcbiAgICBzdG9wT25DYXRjaDogdHJ1ZSxcbiAgICBzaWxlbnQ6IGZhbHNlXG4gIH07XG5cbiAgc2V0dGluZ3MgPSBvYmplY3RBc3NpZ25JZkV4aXN0cyh7fSwgc2V0dGluZ3MsIG9wdGlvbnMpO1xuXG4gIGxldCBwdnREaXNwYXRjaGVkID0gZmFsc2U7XG4gIGNvbnN0IHN0YWNrZWRIb29rcyA9IFtdO1xuICBsZXQgaXNIYW5kbGVyRmVkID0gZmFsc2U7XG5cbiAgbGV0IGhhbmRsZXIgPSBhc3luYyAoKSA9PiB7fTtcbiAgbGV0IEZPSW52b2tlTWlkZGxld2FyZXMgPSBhc3luYyAoKSA9PiB7fTtcblxuICAvKipcbiAgICpcbiAgICogQ09ORklHVVJBQkxFUyAtIFNUQVJUXG4gICAqXG4gICoqL1xuXG4gIGxldCBwdnRMb2dnZXIgPSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2c6ICguLi5hcmdzKSA9PiBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmxvZyhsLm1lc3NhZ2UgfHwgbCkpLFxuXG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dFcnJvcjogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUuZXJyb3IobC5tZXNzYWdlIHx8IGwpKSxcblxuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlICovXG4gICAgbG9nV2FybmluZzogKC4uLmFyZ3MpID0+XG4gICAgICBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmVycm9yKGBXQVJOSU5HOiAke2wubWVzc2FnZSB8fCBsfWApKVxuICB9O1xuXG4gIGlmIChzZXR0aW5ncy5ERUJVRyAhPT0gdHJ1ZSB8fCBzZXR0aW5ncy5zaWxlbnQgPT09IHRydWUpIHtcbiAgICBwdnRMb2dnZXIubG9nID0gKCkgPT4ge307XG4gICAgcHZ0TG9nZ2VyLmxvZ0Vycm9yID0gKCkgPT4ge307XG4gICAgcHZ0TG9nZ2VyLmxvZ1dhcm5pbmcgPSAoKSA9PiB7fTtcbiAgfVxuXG4gIGxldCBvbkNhdGNoSGFuZGxlciA9IGUgPT4ge1xuICAgIGlmIChwdnRMb2dnZXIgJiYgdHlwZW9mIHB2dExvZ2dlci5sb2dFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBwdnRMb2dnZXIubG9nRXJyb3IoZSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVhZCA9IHJlYWRFcnJvcihlKTtcbiAgICBpZiAocmVhZC5pc01pZGRsZXdhcmVIVFRQUmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiByZWFkLnJlc3BvbnNlT2JqZWN0O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgYm9keTogYCR7cmVhZC5lcnJvck1lc3NhZ2V9YFxuICAgIH07XG4gIH07XG5cbiAgbGV0IGhhbmRsZXJDYWxsV3JhcHBlciA9ICguLi5hcmdzKSA9PiB7XG4gICAgcmV0dXJuIGhhbmRsZXIoLi4uYXJncyk7XG4gIH07XG5cbiAgLyoqXG4gICAqXG4gICAqIENPTkZJR1VSQUJMRVMgLSBFTkRcbiAgICpcbiAgKiovXG5cbiAgY29uc3QgY29uZmlndXJlID0gKHsgYXVnbWVudE1ldGhvZHMgPSB7fSB9ID0ge30pID0+IHtcbiAgICBjb25zdCBjb25maWd1cmFibGVNZXRob2RzID0gW1xuICAgICAgXCJvbkNhdGNoSGFuZGxlclwiLFxuICAgICAgXCJoYW5kbGVyQ2FsbFdyYXBwZXJcIixcbiAgICAgIFwicHZ0TG9nZ2VyXCJcbiAgICBdO1xuXG4gICAgY29uZmlndXJhYmxlTWV0aG9kcy5mb3JFYWNoKGZuTmFtZSA9PiB7XG4gICAgICBjb25zdCBuZXdNZXRob2QgPSBhdWdtZW50TWV0aG9kc1tmbk5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBuZXdNZXRob2QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoZm5OYW1lID09PSBcIm9uQ2F0Y2hIYW5kbGVyXCIpIHtcbiAgICAgICAgICBjb25zdCBvbGRNZXRob2QgPSBvbkNhdGNoSGFuZGxlcjtcbiAgICAgICAgICBvbkNhdGNoSGFuZGxlciA9IGUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ld01ldGhvZCgoKSA9PiBvbGRNZXRob2QoZSksIHtcbiAgICAgICAgICAgICAgcHJldk1ldGhvZHdpdGhOb0FyZ3M6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gXCJoYW5kbGVyQ2FsbFdyYXBwZXJcIikge1xuICAgICAgICAgIGNvbnN0IG9sZE1ldGhvZCA9IGhhbmRsZXJDYWxsV3JhcHBlcjtcbiAgICAgICAgICBoYW5kbGVyQ2FsbFdyYXBwZXIgPSBlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGUpLCB7XG4gICAgICAgICAgICAgIHByZXZNZXRob2R3aXRoTm9BcmdzOiBvbGRNZXRob2QsXG4gICAgICAgICAgICAgIGFyZzogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChmbk5hbWUgPT09IFwicHZ0TG9nZ2VyXCIpIHtcbiAgICAgICAgICBjb25zdCBvbGRNZXRob2QgPSBwdnRMb2dnZXI7XG4gICAgICAgICAgcHZ0TG9nZ2VyID0gZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3TWV0aG9kKCgpID0+IG9sZE1ldGhvZChlKSwge1xuICAgICAgICAgICAgICBwcmV2TWV0aG9kd2l0aE5vQXJnczogb2xkTWV0aG9kLFxuICAgICAgICAgICAgICBhcmc6IGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvKiBpbml0IGNvbmZpZ3VyYWJsZXMgKi9cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jb25maWd1cmUpIHtcbiAgICBjb25maWd1cmUob3B0aW9ucy5jb25maWd1cmUpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIENPUkUgLSBTVEFSVFxuICAgKlxuICAqKi9cblxuICAvKiogRnVuY3Rpb24gT2JqZWN0IEluaXQgXCJCZWZvcmUgSG9va1wiICoqL1xuICBjb25zdCBGT0luaXRCZWZvcmVIb29rID0gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAodHlwZW9mIGFyZ3NbMF0gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIEZPSW52b2tlTWlkZGxld2FyZXMoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKGlzSGFuZGxlckZlZCA9PT0gZmFsc2UgJiYgdmFsaWRhdGVIYW5kbGVyKGFyZ3NbMF0pID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBERVBSRUNBVEVEIC0gUGxlYXNlIHVzZSB0aGUgZXhhY3QgYXJndW1lbnQgbmFtZXMgb2YgdGhlIGhhbmRsZXIgYXMgdGhlIGZvbGxvd2luZyBldmVudCxjb250ZXh0LGNhbGxiYWNrIG9yIHNpbXBseSAoZXZlbnQsIGNvbnRleHQpID0+IHt9IG9yICgpID0+IHt9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoaXNIYW5kbGVyRmVkID09PSB0cnVlICYmIGFyZ3NbMF0uaXNIb29rTWlkZGxld2FyZSAhPT0gdHJ1ZSkge1xuICAgICAgLyogdGhlbiB3ZSBhc3N1bWUgdGhpcyBzY2VuYXJpbyBjYWxscyBmb3IgYSBuZXcgaW5zdGFuY2UgKi9cbiAgICAgIHJldHVybiBDcmVhdGVJbnN0YW5jZShvcHRpb25zKShhcmdzWzBdKTtcbiAgICB9XG5cbiAgICBbaGFuZGxlcl0gPSBhcmdzO1xuXG4gICAgaXNIYW5kbGVyRmVkID0gdHJ1ZTtcblxuICAgIHJldHVybiBGT0ludm9rZU1pZGRsZXdhcmVzO1xuICB9O1xuXG4gIEZPSW5pdEJlZm9yZUhvb2sudXNlID0gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBtaWRkbGV3YXJlID0gYXJnc1swXTtcbiAgICBpZiAoaXNIYW5kbGVyRmVkID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJBIGhhbmRsZXIgbmVlZHMgdG8gYmUgZmVkIGZpcnN0IGJlZm9yZSBjYWxsaW5nIC51c2VcIik7XG4gICAgfVxuICAgIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGlmIChwdnRMb2dnZXIgJiYgdHlwZW9mIHB2dExvZ2dlci5sb2dXYXJuaW5nID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcHZ0TG9nZ2VyLmxvZ1dhcm5pbmcoXG4gICAgICAgICAgYElnbm9yaW5nIDJuZCBhcmd1bWVudC4gXCJ1c2VcIiBtZXRob2Qgd2FzIGNhbGxlZCB3aXRoIG1vcmUgdGhhbiAxIGFyZ3VtZW50LmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHB2dERpc3BhdGNoZWQgPT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBcIlVzaW5nIG1pZGRsZXdhcmVzIGFnYWluIGFmdGVyIGhhbmRsZXIncyBpbnZvY2F0aW9uIGlzIG5vdCBhbGxvd2VkLlwiXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChtaWRkbGV3YXJlLmlzSG9va01pZGRsZXdhcmUgPT09IHRydWUpIHtcbiAgICAgIHN0YWNrZWRIb29rcy5wdXNoKG1pZGRsZXdhcmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgXCJVbmtub3duIG1pZGRsZXdhcmVzIGFyZSBub3QgeWV0IHN1cHBvcnRlZC4gUGxlYXNlIGV4dGVuZCBgQmFzZWAgbWlkZGxld2FyZSBpbnN0ZWFkLlwiXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBGT0luaXRCZWZvcmVIb29rO1xuICB9O1xuXG4gIEZPSW5pdEJlZm9yZUhvb2suc2V0TG9nZ2VyID0gbmV3TG9nZ2VyID0+IHtcbiAgICBwdnRMb2dnZXIgPSBuZXdMb2dnZXI7XG4gIH07XG5cbiAgRk9Jbml0QmVmb3JlSG9vay5nZXRMb2dnZXIgPSAoKSA9PiBwdnRMb2dnZXI7XG5cbiAgRk9JbnZva2VNaWRkbGV3YXJlcyA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgIGxldCBleHRlbmRlZEV2ZW50ID0gZXZlbnQ7XG4gICAgbGV0IGV4dGVuZGVkQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgbGV0IGhvb2tCZWZvcmVDYXRjaGluZyA9IHt9O1xuICAgIHB2dERpc3BhdGNoZWQgPSB0cnVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheCAqL1xuICAgICAgZm9yIChjb25zdCBob29rIG9mIHN0YWNrZWRIb29rcykge1xuICAgICAgICBob29rQmVmb3JlQ2F0Y2hpbmcgPSBob29rO1xuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgICAgICBjb25zdCBleHRlbnNpb25zID0gYXdhaXQgaG9vayhleHRlbmRlZEV2ZW50LCBleHRlbmRlZENvbnRleHQpO1xuXG4gICAgICAgIGlmIChleHRlbnNpb25zLmV2ZW50KSB7XG4gICAgICAgICAgZXh0ZW5kZWRFdmVudCA9IE9iamVjdC5hc3NpZ24oe30sIGV4dGVuZGVkRXZlbnQsIGV4dGVuc2lvbnMuZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4dGVuc2lvbnMuY29udGV4dCkge1xuICAgICAgICAgIGV4dGVuZGVkQ29udGV4dCA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIGV4dGVuZGVkQ29udGV4dCxcbiAgICAgICAgICAgIGV4dGVuc2lvbnMuY29udGV4dFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zdCBjYXRjaEhhbmRsZXJUb1VzZSA9XG4gICAgICAgIHR5cGVvZiBob29rQmVmb3JlQ2F0Y2hpbmcuc2NydE9uQ2F0Y2hIYW5kbGVyID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGVyciA9PiBob29rQmVmb3JlQ2F0Y2hpbmcuc2NydE9uQ2F0Y2hIYW5kbGVyKG9uQ2F0Y2hIYW5kbGVyLCBlcnIpXG4gICAgICAgICAgOiBvbkNhdGNoSGFuZGxlcjtcbiAgICAgIGlmIChzZXR0aW5ncy5zdG9wT25DYXRjaCA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gY2F0Y2hIYW5kbGVyVG9Vc2UoZSk7XG4gICAgICB9XG4gICAgICBjYXRjaEhhbmRsZXJUb1VzZShlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFuZGxlckNhbGxXcmFwcGVyKGV4dGVuZGVkRXZlbnQsIGV4dGVuZGVkQ29udGV4dCk7XG4gIH07XG5cbiAgLyogY29weSBwcm9wZXJ0aWVzIG9mIEZPSW5pdEJlZm9yZUhvb2sgdG8gRk9JbnZva2VNaWRkbGV3YXJlcyAtIHNvIHdlIGNhbiBjaGFpbiAudXNlIGFuZCBldGMgKi9cbiAgT2JqZWN0LmtleXMoRk9Jbml0QmVmb3JlSG9vaykuZm9yRWFjaChtZXRob2QgPT4ge1xuICAgIEZPSW52b2tlTWlkZGxld2FyZXNbbWV0aG9kXSA9IEZPSW5pdEJlZm9yZUhvb2tbbWV0aG9kXTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqXG4gICAqIENPUkUgLSBFTkRcbiAgICpcbiAgKiovXG5cbiAgcmV0dXJuIEZPSW5pdEJlZm9yZUhvb2s7XG59O1xuXG5leHBvcnQge1xuICBNSURETEVXQVJFX0NPTlNUQU5UUyxcbiAgQmFzZU1pZGRsZXdhcmUsXG4gIEJvZHlQYXJzZXJNaWRkbGV3YXJlLFxuICBBdXRoTWlkZGxld2FyZSxcbiAgQ3JlYXRlSW5zdGFuY2UsXG4gIGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgsXG4gIHZhbGlkYXRlSGFuZGxlclxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ3JlYXRlSW5zdGFuY2U7Il19
