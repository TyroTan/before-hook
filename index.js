"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.validateHandler = exports.getHandlerArgumentsLength = exports.CreateInstance = exports.AuthMiddleware = exports.BodyParserMiddleware = exports.BaseHook = exports.MIDDLEWARE_CONSTANTS = exports.TYPE_CUSTOM_MIDDLEWARE = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

// import { CognitoDecodeVerifyJWTInit } from "./cognito-decode-verify-token-test-only";
// const jwtdecodeAsyncHandler = CognitoDecodeVerifyJWTInit({
//   jwt_decode: require("jwt-decode")
// }).UNSAFE_BUT_FAST_handler;
// const NOOP = () => {};
var MIDDLEWARE_PREFIX = "CUSTOM_MIDDLEWARE_";
var TYPE_CUSTOM_MIDDLEWARE = "".concat(MIDDLEWARE_PREFIX, "type_custom_middleware");
exports.TYPE_CUSTOM_MIDDLEWARE = TYPE_CUSTOM_MIDDLEWARE;
var MIDDLEWARE_CONSTANTS = {
  GENERIC: 500,
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
    if (overrideIfExist.hasOwnProperty(k)) {
      def[k] = overrideIfExist[k];
    }
  });
  return (0, _objectSpread2["default"])({}, arguments.length <= 0 ? undefined : arguments[0], def);
};
/* const setTypeCustomMiddleware = (obj, type) => {
  if (
    obj.pvtType ||
    obj.getType ||
    typeof obj.isCustomMiddleware !== "undefined"
  ) {
    throw Error("object already extended by custom middleware");
  }

  obj.pvtType = type;
  obj.getType = () => {
    return obj.pvtType;
  };
  obj.isCustomMiddleware = true;
}; */


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
  }, ""))); // const removeCommentsRegex = new RegExp(
  // /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm
  // );
  // const def = handler.toString();

  var count = getHandlerArgumentsLength(handler);
  return count >= 0 || count <= 1;
  /* const noSpaceAndComments = def
    .replace(removeCommentsRegex, '')
    .replace(new RegExp('(\\s|\\n)', 'g'), '');
   const regExp1 = new RegExp(`\\(\\)\\{`, 'g');
  const regExp2 = new RegExp(`\\(event\\)\\{`, 'g');
  const regExp3 = new RegExp(`\\(event,context\\)\\{`, 'g');
  const regExp4 = new RegExp(`\\(event,context,callback\\)\\{`, 'g');
   if (regExp4.test(noSpaceAndComments)) {
    throw Error(
      `Handlers with callbacks aren't supported by Custom Middleware yet. Use middy package instead`
    );
  }
   let validated = regExp1.test(noSpaceAndComments);
  validated = validated === true ? true : regExp2.test(noSpaceAndComments);
  validated = validated === true ? true : regExp3.test(noSpaceAndComments);
   return validated; */
}; // const tss = ({ eventAugment, contextAugment }) => {
//   const pre = (event, context) => {
//     const extensions = {};
//     if (eventAugment) {
//       extensions.event = eventAugment(event, context);
//     }
//     if (contextAugment) {
//       extensions.context = contextAugment(event, context);
//     }
//     // callback ... TODO
//     return extensions;
//   };
//   pre.isCustomMiddleware = true;
//   return pre;
// };
// tss.isCustomMiddleware = true;
// const inv = tss({
//   eventAugment: (event, context) => {
//     return event.body ? { ...event, body: JSON.parse(event.body) } : event;
//   },
//   asyncMiddleware: false
// });
// inv.isCustomMiddleware = true;


exports.validateHandler = validateHandler;

var readError = function readError(e) {
  var isMiddlewareHTTPResponse = false;

  try {
    var obj = JSON.parse(e.message);
    isMiddlewareHTTPResponse = obj.type === MIDDLEWARE_CONSTANTS.HTTP_RESPONSE;
    obj.body = obj.message;
    return {
      e: e,
      isMiddlewareHTTPResponse: isMiddlewareHTTPResponse,
      data: obj
    };
  } catch (err) {
    return {
      e: e,
      err: err
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

  var responseObjectToThrow = function responseObjectToThrow(obj) {
    var stringErr = "";

    try {
      var err = {
        type: obj.type,
        statusCode: 403,
        message: obj.message
      };
      stringErr = JSON.stringify(err);
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
      responseObjectToThrow: responseObjectToThrow,
      MIDDLEWARE_CONSTANTS: MIDDLEWARE_CONSTANTS,
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

var BaseHookHandlerInit = function BaseHookHandlerInit(handler) {
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
                }
              }, {
                getHelpers: MiddlewareHelpersInit()
              });

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

var BaseHook = function BaseHook(_ref2) {
  var eventAugment = _ref2.eventAugment,
      contextAugment = _ref2.contextAugment,
      handler = _ref2.handler,
      configure = _ref2.configure;

  if (!(typeof eventAugment === "function" || typeof contextAugment === "function" || typeof handler === "function")) {
    throw Error("Custom middlewares must define one of eventAugment|contextAugment|handler");
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

  if (handler) {
    pre = BaseHookHandlerInit(handler);
  } else {
    // to be deprecated by 'handler'
    pre =
    /*#__PURE__*/
    function () {
      var _ref4 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3(event, context) {
        var extensions;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                extensions = {};

                if (!eventAugment) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 4;
                return eventAugment(event, context);

              case 4:
                extensions.event = _context3.sent;

              case 5:
                if (!contextAugment) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 8;
                return contextAugment(event, context);

              case 8:
                extensions.context = _context3.sent;

              case 9:
                return _context3.abrupt("return", extensions);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function pre(_x3, _x4) {
        return _ref4.apply(this, arguments);
      };
    }();
  }

  pre.isCustomMiddleware = true;
  return pre;
};

exports.BaseHook = BaseHook;

var BodyParserMiddleware = function BodyParserMiddleware() {
  return BaseHook({
    handler: function () {
      var _handler = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4(_ref5) {
        var getParams, _getParams, event, setEvent;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                getParams = _ref5.getParams;
                _getParams = getParams(), event = _getParams.event, setEvent = _getParams.setEvent;

                if (event.body) {
                  _context4.next = 4;
                  break;
                }

                return _context4.abrupt("return");

              case 4:
                setEvent({
                  body: JSON.parse(event.body)
                });

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function handler(_x5) {
        return _handler.apply(this, arguments);
      }

      return handler;
    }()
  });
};

exports.BodyParserMiddleware = BodyParserMiddleware;

var AuthMiddleware = function AuthMiddleware() {
  var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      promisify = _ref6.promisify,
      cognitoJWTDecodeHandler = _ref6.cognitoJWTDecodeHandler;

  if (promisify && typeof promisify !== "function" || cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function") {
    throw Error("invalid (promisify and cognitoJWTDecodeHandler) passed. ".concat((0, _typeof2["default"])(promisify), ",  ").concat((0, _typeof2["default"])(cognitoJWTDecodeHandler)));
  }

  return BaseHook({
    handler: function () {
      var _handler2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5(_ref7, _ref8) {
        var getParams, getHelpers, _getParams2, event, setEvent, context, _getHelpers, responseObjectToThrow, HTTP_RESPONSE, newEventHeaders, promised, claims;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                getParams = _ref7.getParams;
                getHelpers = _ref8.getHelpers;
                _getParams2 = getParams(), event = _getParams2.event, setEvent = _getParams2.setEvent, context = _getParams2.context;
                _getHelpers = getHelpers(), responseObjectToThrow = _getHelpers.responseObjectToThrow;
                HTTP_RESPONSE = MIDDLEWARE_CONSTANTS.HTTP_RESPONSE;

                if (!(!event || !event.headers)) {
                  _context5.next = 7;
                  break;
                }

                return _context5.abrupt("return", {});

              case 7:
                newEventHeaders = (0, _objectSpread2["default"])({}, event.headers);

                if (!newEventHeaders.Authorization) {
                  newEventHeaders.Authorization = newEventHeaders.authorization;
                }

                promised = cognitoJWTDecodeHandler;

                if (!isAsyncFunction(promised)) {
                  promised = promisify(promised);
                }

                _context5.prev = 11;
                _context5.next = 14;
                return promised(Object.assign({}, event, {
                  headers: newEventHeaders
                }), context);

              case 14:
                claims = _context5.sent;

                if (!(!claims || typeof claims.sub !== "string")) {
                  _context5.next = 17;
                  break;
                }

                throw Error(claims);

              case 17:
                setEvent({
                  user: claims
                });
                _context5.next = 23;
                break;

              case 20:
                _context5.prev = 20;
                _context5.t0 = _context5["catch"](11);
                responseObjectToThrow({
                  type: HTTP_RESPONSE,
                  statusCode: 403,
                  message: "Invalid token passed hereez"
                });

              case 23:
                return _context5.abrupt("return", {});

              case 24:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[11, 20]]);
      }));

      function handler(_x6, _x7) {
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
  var stackedHandlerAsyncFunction = [];
  var isHandlerFed = false;
  /**
   *
   * CORE - START
   *
   **/

  var handler =
  /*#__PURE__*/
  function () {
    var _ref9 = (0, _asyncToGenerator2["default"])(
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

    return function handler() {
      return _ref9.apply(this, arguments);
    };
  }();

  var FOInvokeMiddlewares =
  /*#__PURE__*/
  function () {
    var _ref10 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee7() {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function FOInvokeMiddlewares() {
      return _ref10.apply(this, arguments);
    };
  }();
  /** Function Object Init Pre-Hook **/


  var FOInitPreHook = function FOInitPreHook() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if (typeof args[0] !== "function") {
      return FOInvokeMiddlewares.apply(void 0, args);
    }

    handler = args[0];

    if (isHandlerFed === false && validateHandler(handler) === false) {
      throw Error("DEPRECATED - Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}");
    }

    if (isHandlerFed === true && handler.isCustomMiddleware !== true) {
      /* then we assume this scenario calls for a new instance */
      return CreateInstance(options)(handler);
    }

    isHandlerFed = true;
    return FOInvokeMiddlewares;
  };

  FOInitPreHook.use = function () {
    var params = arguments.length <= 0 ? undefined : arguments[0];

    if (isHandlerFed === false) {
      throw Error("A handler needs to be fed first before calling .use");
    }

    if (arguments.length > 1) {
      if (pvtLogger && typeof pvtLogger.logWarning === "function") {
        pvtLogger.logWarning(".use only supports 1 param at the moment.");
      }
    }

    if (pvtDispatched === true) {
      throw Error("Using middlewares again after handler's invocation is not allowed.");
    }

    if (params.isCustomMiddleware === true) {
      stackedHandlerAsyncFunction.push(params);
    } else {
      throw Error("Unknown middlewares are not yet supported.");
    }

    return FOInitPreHook;
  };

  FOInitPreHook.setLogger = function (newLogger) {
    pvtLogger = newLogger;
  };

  FOInitPreHook.getLogger = function () {
    return pvtLogger;
  };

  FOInvokeMiddlewares =
  /*#__PURE__*/
  function () {
    var _ref11 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee8(event, context) {
      var extendedEvent, extendedContext, _i, _stackedHandlerAsyncF, fnAsyncFunction, extensions;

      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              extendedEvent = event;
              extendedContext = context;
              pvtDispatched = true;
              _context8.prev = 3;
              _i = 0, _stackedHandlerAsyncF = stackedHandlerAsyncFunction;

            case 5:
              if (!(_i < _stackedHandlerAsyncF.length)) {
                _context8.next = 15;
                break;
              }

              fnAsyncFunction = _stackedHandlerAsyncF[_i];
              _context8.next = 9;
              return fnAsyncFunction(extendedEvent, extendedContext);

            case 9:
              extensions = _context8.sent;

              if (extensions.event) {
                extendedEvent = Object.assign({}, extendedEvent, extensions.event);
              }

              if (extensions.context) {
                extendedContext = Object.assign({}, extendedContext, extensions.context);
              }

            case 12:
              _i++;
              _context8.next = 5;
              break;

            case 15:
              _context8.next = 21;
              break;

            case 17:
              _context8.prev = 17;
              _context8.t0 = _context8["catch"](3);

              if (!(settings.stopOnCatch === true)) {
                _context8.next = 21;
                break;
              }

              return _context8.abrupt("return", onCatchHandler(_context8.t0));

            case 21:
              return _context8.abrupt("return", handlerCallWrapper(extendedEvent, extendedContext));

            case 22:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, null, [[3, 17]]);
    }));

    return function FOInvokeMiddlewares(_x8, _x9) {
      return _ref11.apply(this, arguments);
    };
  }();
  /* copy properties of FOInitPreHook to FOInvokeMiddlewares - so we can chain .use and etc */


  Object.keys(FOInitPreHook).forEach(function (method) {
    FOInvokeMiddlewares[method] = FOInitPreHook[method];
  });
  /**
   *
   * CORE - END
   *
   **/

  /**
   *
   * CONFIGURABLES - START
   *
   **/

  var pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: function log() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return args.forEach(function (l) {
        return console.log(l.message || l);
      });
    },

    /* eslint-disable-next-line no-console */
    logError: function logError() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return args.forEach(function (l) {
        return console.error(l.message || l);
      });
    },

    /* eslint-disable-next-line no-console */
    logWarning: function logWarning() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return args.forEach(function (l) {
        return console.warning(l.message || l);
      });
    }
  };

  if (settings.DEBUG !== true || settings.silent === true) {
    pvtLogger.log = function () {}, pvtLogger.logError = function () {}, pvtLogger.logWarning = function () {};
  }

  var onCatchHandler = function onCatchHandler(e) {
    if (pvtLogger && typeof pvtLogger.logError === "function") {
      pvtLogger.logError(e);
    }

    var read = readError(e);

    if (read.isMiddlewareHTTPResponse === true && read.data) {
      return {
        statusCode: 500,
        body: "".concat(read.data.message)
      };
    } else {
      return {
        statusCode: 500,
        body: "".concat(e.message)
      };
    }
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
    var _ref12 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref12$augmentMethods = _ref12.augmentMethods,
        augmentMethods = _ref12$augmentMethods === void 0 ? {} : _ref12$augmentMethods;

    var configurableMethods = ["onCatchHandler", "handlerCallWrapper", "pvtLogger"];
    configurableMethods.forEach(function (fnName) {
      var method = augmentMethods[fnName];

      if (typeof method === "function") {
        if (fnName === "onCatchHandler") {
          var oldMethod = onCatchHandler;

          onCatchHandler = function onCatchHandler() {
            for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
              args[_key7] = arguments[_key7];
            }

            return method.apply(void 0, [oldMethod].concat(args));
          };
        } else if (fnName === "handlerCallWrapper") {
          var _oldMethod = handlerCallWrapper;

          handlerCallWrapper = function handlerCallWrapper() {
            for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
              args[_key8] = arguments[_key8];
            }

            return method.apply(void 0, [_oldMethod].concat(args));
          };
        } else if (fnName === "pvtLogger") {
          var _oldMethod2 = pvtLogger;

          pvtLogger = function pvtLogger() {
            for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
              args[_key9] = arguments[_key9];
            }

            return method.apply(void 0, [_oldMethod2].concat(args));
          };
        }
      }
    });
  };
  /* init configurables */


  if (options && options.configure) {
    configure(options.configure);
  }

  return FOInitPreHook;
};

exports.CreateInstance = CreateInstance;
var _default = CreateInstance;
exports["default"] = _default;
