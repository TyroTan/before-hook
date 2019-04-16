"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.validateHandler = exports.getHandlerArgumentsLength = exports.CreateInstance = exports.BodyParserMiddleware = exports.BaseMiddleware = exports.MIDDLEWARE_CONSTANTS = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

require("source-map-support/register");

var MIDDLEWARE_PREFIX = "BEFORE_HOOK_";
var MIDDLEWARE_CONSTANTS = {
  HTTP_RESPONSE: "".concat(MIDDLEWARE_PREFIX, "HTTP_RESPONSE")
};
/* const isAsyncFunction = fn => {
  return fn.constructor.name === "AsyncFunction";
}; */

exports.MIDDLEWARE_CONSTANTS = MIDDLEWARE_CONSTANTS;

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
  var newState = state;
  Object.keys(objs).forEach(function (key) {
    newState[key] = objs[key];
  });
  return newState;
};

var _setContext = setState;

var simpleClone = function simpleClone(objectToClone) {
  return (
    /* JSON.parse(JSON.stringify( */
    objectToClone
  );
};
/* )) */


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
    var configurableMethods = ["onCatch"];
    configurableMethods.forEach(function (fnName) {
      var newMethod = augmentMethods[fnName];

      if (typeof newMethod === "function") {
        if (fnName === "onCatch") {
          pre.scrtOnCatch = function (oldMethod, e) {
            return newMethod(function () {
              return oldMethod(e);
            }, {
              prevRawMethod: oldMethod,
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
    var _ref5 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4() {
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function handler() {
      return _ref5.apply(this, arguments);
    };
  }();

  var FOInvokeMiddlewares =
  /*#__PURE__*/
  function () {
    var _ref6 = (0, _asyncToGenerator2["default"])(
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

    return function FOInvokeMiddlewares() {
      return _ref6.apply(this, arguments);
    };
  }();
  /**
   *
   * CONFIGURABLES - START
   *
   * */


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
    logWarning: function logWarning() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (
        /* eslint-disable-next-line no-console */
        args.forEach(function (l) {
          return console.error("WARNING: ".concat(l.message || l));
        })
      );
    }
  };

  if (settings.DEBUG !== true || settings.silent === true) {
    pvtLogger.log = function () {};

    pvtLogger.logError = function () {};

    pvtLogger.logWarning = function () {};
  }

  var onCatch = function onCatch() {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    var e = args[0];

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
   * */


  var configure = function configure() {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref7$augmentMethods = _ref7.augmentMethods,
        augmentMethods = _ref7$augmentMethods === void 0 ? {} : _ref7$augmentMethods;

    var configurableMethods = ["onCatch", "handlerCallWrapper", "pvtLogger"];
    configurableMethods.forEach(function (fnName) {
      var newMethod = augmentMethods[fnName];

      if (typeof newMethod === "function") {
        if (fnName === "onCatch") {
          var oldMethod = onCatch;

          onCatch = function onCatch(arg1, _ref8) {
            var event = _ref8.event,
                context = _ref8.context;
            return newMethod(function () {
              return oldMethod(arg1);
            }, {
              prevRawMethod: oldMethod,
              arg: arg1,
              event: event,
              context: context
            });
          };
        } else if (fnName === "handlerCallWrapper") {
          var _oldMethod = handlerCallWrapper;

          handlerCallWrapper = function handlerCallWrapper(e) {
            return newMethod(function () {
              return _oldMethod(e);
            }, {
              prevRawMethod: _oldMethod,
              arg: e
            });
          };
        } else if (fnName === "pvtLogger") {
          var _oldMethod2 = pvtLogger;

          pvtLogger = function pvtLogger(e) {
            return newMethod(function () {
              return _oldMethod2(e);
            }, {
              prevRawMethod: _oldMethod2,
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
   * */

  /** Function Object Init "Before Hook" * */


  var FOInitBeforeHook = function FOInitBeforeHook() {
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
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
    var _ref9 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee6(event, context) {
      var extendedEvent, extendedContext, hookBeforeCatching, _i, _stackedHooks, hook, extensions, catchHandlerToUse;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              extendedEvent = event;
              extendedContext = context;
              hookBeforeCatching = {};
              pvtDispatched = true;
              _context6.prev = 4;
              _i = 0, _stackedHooks = stackedHooks;

            case 6:
              if (!(_i < _stackedHooks.length)) {
                _context6.next = 17;
                break;
              }

              hook = _stackedHooks[_i];
              hookBeforeCatching = hook;
              /* eslint-disable-next-line no-await-in-loop */

              _context6.next = 11;
              return hook(extendedEvent, extendedContext);

            case 11:
              extensions = _context6.sent;

              if (extensions.event) {
                extendedEvent = Object.assign({}, extendedEvent, extensions.event);
              }

              if (extensions.context) {
                extendedContext = Object.assign({}, extendedContext, extensions.context);
              }

            case 14:
              _i++;
              _context6.next = 6;
              break;

            case 17:
              _context6.next = 25;
              break;

            case 19:
              _context6.prev = 19;
              _context6.t0 = _context6["catch"](4);
              catchHandlerToUse = typeof hookBeforeCatching.scrtOnCatch === "function" ? function (err, eventAndContext) {
                return hookBeforeCatching.scrtOnCatch(function (e) {
                  return onCatch(e, eventAndContext);
                }, err);
              } : function (err, eventAndContext) {
                return onCatch(err, eventAndContext);
              };

              if (!(settings.stopOnCatch === true)) {
                _context6.next = 24;
                break;
              }

              return _context6.abrupt("return", catchHandlerToUse(_context6.t0, {
                event: extendedEvent,
                context: extendedContext
              }));

            case 24:
              catchHandlerToUse(_context6.t0, {
                event: extendedEvent,
                context: extendedContext
              });

            case 25:
              return _context6.abrupt("return", handlerCallWrapper(extendedEvent, extendedContext));

            case 26:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, null, [[4, 19]]);
    }));

    return function FOInvokeMiddlewares(_x4, _x5) {
      return _ref9.apply(this, arguments);
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
   * */

  return FOInitBeforeHook;
};

exports.CreateInstance = CreateInstance;
var _default = CreateInstance;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnNvdXJjZS5qcyJdLCJuYW1lcyI6WyJNSURETEVXQVJFX1BSRUZJWCIsIk1JRERMRVdBUkVfQ09OU1RBTlRTIiwiSFRUUF9SRVNQT05TRSIsIm9iamVjdEFzc2lnbklmRXhpc3RzIiwiZGVmIiwib3ZlcnJpZGVJZkV4aXN0IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrIiwiZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aCIsImhhbmRsZXIiLCJyZXN1bHQiLCJFcnJvciIsInRvU3RyaW5nIiwicmVtb3ZlQ29tbWVudHNSZWdleCIsIlJlZ0V4cCIsIm5vU3BhY2VBbmRDb21tZW50cyIsInJlcGxhY2UiLCJjb21tYXNSZWdFeHAiLCJtYXRjaCIsImluZGV4T2YiLCJsZW5ndGgiLCJlIiwiY29uc29sZSIsImVycm9yIiwibWVzc2FnZSIsInZhbGlkYXRlSGFuZGxlciIsIlR5cGVFcnJvciIsInJlZHVjZSIsImFjYyIsImN1ciIsImNvdW50IiwicmVhZEVycm9yIiwiaXNNaWRkbGV3YXJlSFRUUFJlc3BvbnNlIiwib2JqRXJyb3IiLCJKU09OIiwicGFyc2UiLCJ0eXBlIiwicmVzcG9uc2VPYmplY3QiLCJlcnIiLCJlcnJvck1lc3NhZ2UiLCJNaWRkbGV3YXJlSGVscGVyc0luaXQiLCJwdnRMb2dnZXIiLCJsb2ciLCJhcmdzIiwibCIsImxvZ0Vycm9yIiwicmV0dXJuQW5kU2VuZFJlc3BvbnNlIiwib2JqIiwic3RyaW5nRXJyIiwiZXJyb3JPYmoiLCJzdHJpbmdpZnkiLCJnZXRMb2dnZXIiLCJzZXRTdGF0ZSIsIm9ianMiLCJzdGF0ZSIsIm5ld1N0YXRlIiwia2V5Iiwic2V0Q29udGV4dCIsInNpbXBsZUNsb25lIiwib2JqZWN0VG9DbG9uZSIsImNsb25lIiwiQmFzZU1pZGRsZXdhcmVIYW5kbGVySW5pdCIsImZuIiwiZXZlbnQiLCJjb250ZXh0IiwicHZ0RXZlbnQiLCJwdnRDb250ZXh0IiwiZ2V0UGFyYW1zIiwic2V0RXZlbnQiLCJnZXRIZWxwZXJzIiwiQmFzZU1pZGRsZXdhcmUiLCJjb25maWd1cmUiLCJwcmUiLCJpc0hvb2tNaWRkbGV3YXJlIiwiYXVnbWVudE1ldGhvZHMiLCJjb25maWd1cmFibGVNZXRob2RzIiwiZm5OYW1lIiwibmV3TWV0aG9kIiwic2NydE9uQ2F0Y2giLCJvbGRNZXRob2QiLCJwcmV2UmF3TWV0aG9kIiwiYXJnIiwiQm9keVBhcnNlck1pZGRsZXdhcmUiLCJib2R5IiwiQ3JlYXRlSW5zdGFuY2UiLCJvcHRpb25zIiwic2V0dGluZ3MiLCJERUJVRyIsInN0b3BPbkNhdGNoIiwic2lsZW50IiwicHZ0RGlzcGF0Y2hlZCIsInN0YWNrZWRIb29rcyIsImlzSGFuZGxlckZlZCIsIkZPSW52b2tlTWlkZGxld2FyZXMiLCJsb2dXYXJuaW5nIiwib25DYXRjaCIsInJlYWQiLCJzdGF0dXNDb2RlIiwiaGFuZGxlckNhbGxXcmFwcGVyIiwiYXJnMSIsIkZPSW5pdEJlZm9yZUhvb2siLCJ1c2UiLCJtaWRkbGV3YXJlIiwicHVzaCIsInNldExvZ2dlciIsIm5ld0xvZ2dlciIsImV4dGVuZGVkRXZlbnQiLCJleHRlbmRlZENvbnRleHQiLCJob29rQmVmb3JlQ2F0Y2hpbmciLCJob29rIiwiZXh0ZW5zaW9ucyIsImFzc2lnbiIsImNhdGNoSGFuZGxlclRvVXNlIiwiZXZlbnRBbmRDb250ZXh0IiwibWV0aG9kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsaUJBQWlCLEdBQUcsY0FBMUI7QUFDQSxJQUFNQyxvQkFBb0IsR0FBRztBQUMzQkMsRUFBQUEsYUFBYSxZQUFLRixpQkFBTDtBQURjLENBQTdCO0FBSUE7Ozs7OztBQUlBLElBQU1HLG9CQUFvQixHQUFHLFNBQXZCQSxvQkFBdUIsR0FBYTtBQUN4QyxNQUFNQyxHQUFHLHVGQUFUO0FBQ0EsTUFBTUMsZUFBZSx1RkFBckI7QUFDQUMsRUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlILEdBQVosRUFBaUJJLE9BQWpCLENBQXlCLFVBQUFDLENBQUMsRUFB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QUFBQTtBQUFBOztBQUFBLGdEQW1DVHdCLGlCQUFpQixlQUFtQjtBQUN6Q2pELGdCQUFBQSxLQUFLLEVBQUUyQyxhQURrQztBQUV6QzFDLGdCQUFBQSxPQUFPLEVBQUUyQztBQUZnQyxlQUFuQixDQW5DUjs7QUFBQTtBQXdDbEJLLGNBQUFBLGlCQUFpQixlQUFtQjtBQUNsQ2pELGdCQUFBQSxLQUFLLEVBQUUyQyxhQUQyQjtBQUVsQzFDLGdCQUFBQSxPQUFPLEVBQUUyQztBQUZ5QixlQUFuQixDQUFqQjs7QUF4Q2tCO0FBQUEsZ0RBOENiVCxrQkFBa0IsQ0FBQ1EsYUFBRCxFQUFnQkMsZUFBaEIsQ0E5Q0w7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBSDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFuQjtBQWlEQTs7O0FBQ0F2RyxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWStGLGdCQUFaLEVBQThCOUYsT0FBOUIsQ0FBc0MsVUFBQTRHLE1BQU0sRUFBSTtBQUM5Q3JCLElBQUFBLG1CQUFtQixDQUFDcUIsTUFBRCxDQUFuQixHQUE4QmQsZ0JBQWdCLENBQUNjLE1BQUQsQ0FBOUM7QUFDRCxHQUZEO0FBSUE7Ozs7OztBQU1BLFNBQU9kLGdCQUFQO0FBQ0QsQ0E1T0Q7OztlQXVQZWhCLGMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBNSURETEVXQVJFX1BSRUZJWCA9IFwiQkVGT1JFX0hPT0tfXCI7XG5jb25zdCBNSURETEVXQVJFX0NPTlNUQU5UUyA9IHtcbiAgSFRUUF9SRVNQT05TRTogYCR7TUlERExFV0FSRV9QUkVGSVh9SFRUUF9SRVNQT05TRWBcbn07XG5cbi8qIGNvbnN0IGlzQXN5bmNGdW5jdGlvbiA9IGZuID0+IHtcbiAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWUgPT09IFwiQXN5bmNGdW5jdGlvblwiO1xufTsgKi9cblxuY29uc3Qgb2JqZWN0QXNzaWduSWZFeGlzdHMgPSAoLi4uYXJncykgPT4ge1xuICBjb25zdCBkZWYgPSB7IC4uLmFyZ3NbMV0gfTtcbiAgY29uc3Qgb3ZlcnJpZGVJZkV4aXN0ID0geyAuLi5hcmdzWzJdIH07XG4gIE9iamVjdC5rZXlzKGRlZikuZm9yRWFjaChrID0+IHtcbiAgICBpZiAob3ZlcnJpZGVJZkV4aXN0W2tdKSB7XG4gICAgICBkZWZba10gPSBvdmVycmlkZUlmRXhpc3Rba107XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4geyAuLi5hcmdzWzBdLCAuLi5kZWYgfTtcbn07XG5cbmNvbnN0IGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGggPSBoYW5kbGVyID0+IHtcbiAgbGV0IHJlc3VsdCA9IC0xO1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgdGhyb3cgRXJyb3IoYEhhbmRsZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLiB0eXBlICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcblxuICAgIGNvbnN0IGRlZiA9IGhhbmRsZXIudG9TdHJpbmcoKTtcbiAgICBjb25zdCByZW1vdmVDb21tZW50c1JlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgIC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvfChbXlxcXFw6XXxeKVxcL1xcLy4qJC9nbVxuICAgICk7XG4gICAgY29uc3Qgbm9TcGFjZUFuZENvbW1lbnRzID0gZGVmXG4gICAgICAucmVwbGFjZShyZW1vdmVDb21tZW50c1JlZ2V4LCBcIlwiKVxuICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChcIihcXFxcc3xcXFxcbilcIiwgXCJnXCIpLCBcIlwiKTtcblxuICAgIGNvbnN0IGNvbW1hc1JlZ0V4cCA9IG5ldyBSZWdFeHAoYFxcXFwsYCwgXCJnXCIpO1xuXG4gICAgY29uc3QgbWF0Y2ggPSBub1NwYWNlQW5kQ29tbWVudHMubWF0Y2goY29tbWFzUmVnRXhwKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICByZXN1bHQgPSBub1NwYWNlQW5kQ29tbWVudHMuaW5kZXhPZihcIigpXCIpID4gLTEgPyAwIDogMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gbWF0Y2gubGVuZ3RoICsgMTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGBfX2dldEFyZ3VtZW50c0xlbmd0aF9fLiAke2UubWVzc2FnZX1gKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCB2YWxpZGF0ZUhhbmRsZXIgPSBoYW5kbGVyID0+IHtcbiAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgdGhyb3cgVHlwZUVycm9yKFxuICAgICAgYEhhbmRsZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJHt0eXBlb2YgaGFuZGxlcn0gJHtPYmplY3Qua2V5cyhcbiAgICAgICAgaGFuZGxlclxuICAgICAgKS5yZWR1Y2UoKGFjYywgY3VyKSA9PiBgJHthY2N9ICR7Y3VyfWAsIFwiXCIpfWBcbiAgICApO1xuXG4gIGNvbnN0IGNvdW50ID0gZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aChoYW5kbGVyKTtcbiAgcmV0dXJuIGNvdW50ID49IDAgfHwgY291bnQgPD0gMTtcbn07XG5cbmNvbnN0IHJlYWRFcnJvciA9IGUgPT4ge1xuICBsZXQgaXNNaWRkbGV3YXJlSFRUUFJlc3BvbnNlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgY29uc3Qgb2JqRXJyb3IgPVxuICAgICAgdHlwZW9mIGUubWVzc2FnZSA9PT0gXCJvYmplY3RcIiA/IGUubWVzc2FnZSA6IEpTT04ucGFyc2UoZS5tZXNzYWdlKTtcblxuICAgIGlzTWlkZGxld2FyZUhUVFBSZXNwb25zZSA9XG4gICAgICBvYmpFcnJvci50eXBlID09PSBNSURETEVXQVJFX0NPTlNUQU5UUy5IVFRQX1JFU1BPTlNFO1xuXG4gICAgY29uc3QgeyByZXNwb25zZU9iamVjdCB9ID0gb2JqRXJyb3I7XG4gICAgaWYgKHR5cGVvZiByZXNwb25zZU9iamVjdCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgY3VzdG9tIFwicmVzcG9uc2VPYmplY3RcImApO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBlLFxuICAgICAgaXNNaWRkbGV3YXJlSFRUUFJlc3BvbnNlLFxuICAgICAgcmVzcG9uc2VPYmplY3RcbiAgICB9O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4geyBlLCBlcnIsIGVycm9yTWVzc2FnZTogYCR7ZS5tZXNzYWdlfSAtICR7ZXJyLm1lc3NhZ2V9YCB9O1xuICB9XG59O1xuXG5jb25zdCBNaWRkbGV3YXJlSGVscGVyc0luaXQgPSAoKSA9PiB7XG4gIGNvbnN0IHB2dExvZ2dlciA9IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgIGxvZzogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUubG9nKGwubWVzc2FnZSB8fCBsKSksXG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgIGxvZ0Vycm9yOiAoLi4uYXJncykgPT4gYXJncy5mb3JFYWNoKGwgPT4gY29uc29sZS5lcnJvcihsLm1lc3NhZ2UgfHwgbCkpXG4gIH07XG5cbiAgY29uc3QgcmV0dXJuQW5kU2VuZFJlc3BvbnNlID0gb2JqID0+IHtcbiAgICBsZXQgc3RyaW5nRXJyID0gXCJcIjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXJyb3JPYmogPSB7XG4gICAgICAgIHR5cGU6IE1JRERMRVdBUkVfQ09OU1RBTlRTLkhUVFBfUkVTUE9OU0UsXG4gICAgICAgIHJlc3BvbnNlT2JqZWN0OiBvYmpcbiAgICAgIH07XG4gICAgICBzdHJpbmdFcnIgPSBKU09OLnN0cmluZ2lmeSh7IC4uLmVycm9yT2JqIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChwdnRMb2dnZXIgJiYgdHlwZW9mIHB2dExvZ2dlci5sb2dFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHB2dExvZ2dlci5sb2dFcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdGhyb3cgRXJyb3Ioc3RyaW5nRXJyKTtcbiAgfTtcblxuICByZXR1cm4gKCkgPT4gKHtcbiAgICByZXR1cm5BbmRTZW5kUmVzcG9uc2UsXG4gICAgZ2V0TG9nZ2VyOiAoKSA9PiBwdnRMb2dnZXJcbiAgfSk7XG59O1xuXG5jb25zdCBzZXRTdGF0ZSA9IChvYmpzLCBzdGF0ZSkgPT4ge1xuICBjb25zdCBuZXdTdGF0ZSA9IHN0YXRlO1xuXG4gIE9iamVjdC5rZXlzKG9ianMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBuZXdTdGF0ZVtrZXldID0gb2Jqc1trZXldO1xuICB9KTtcblxuICByZXR1cm4gbmV3U3RhdGU7XG59O1xuY29uc3Qgc2V0Q29udGV4dCA9IHNldFN0YXRlO1xuY29uc3Qgc2ltcGxlQ2xvbmUgPSBvYmplY3RUb0Nsb25lID0+XG4gIC8qIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoICovIG9iamVjdFRvQ2xvbmU7IC8qICkpICovXG5jb25zdCBjbG9uZSA9IHNpbXBsZUNsb25lO1xuXG5jb25zdCBCYXNlTWlkZGxld2FyZUhhbmRsZXJJbml0ID0gaGFuZGxlciA9PiB7XG4gIGNvbnN0IGZuID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgcHZ0RXZlbnQgPSBldmVudCA/IGNsb25lKGV2ZW50KSA6IFwiXCI7XG4gICAgY29uc3QgcHZ0Q29udGV4dCA9IGNvbnRleHQgPyBjbG9uZShjb250ZXh0KSA6IFwiXCI7XG5cbiAgICBhd2FpdCBoYW5kbGVyKFxuICAgICAge1xuICAgICAgICBnZXRQYXJhbXM6ICgpID0+ICh7XG4gICAgICAgICAgZXZlbnQ6IHB2dEV2ZW50LFxuICAgICAgICAgIHNldEV2ZW50OiBvYmpzID0+IHNldFN0YXRlKG9ianMsIHB2dEV2ZW50KSxcbiAgICAgICAgICBjb250ZXh0OiBwdnRDb250ZXh0LFxuICAgICAgICAgIHNldENvbnRleHQ6IG9ianMgPT4gc2V0Q29udGV4dChvYmpzLCBwdnRDb250ZXh0KVxuICAgICAgICB9KSxcbiAgICAgICAgZ2V0SGVscGVyczogTWlkZGxld2FyZUhlbHBlcnNJbml0KClcbiAgICAgIH0sXG4gICAgICB7fVxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZXZlbnQ6IHB2dEV2ZW50LFxuICAgICAgY29udGV4dDogcHZ0Q29udGV4dFxuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3QgQmFzZU1pZGRsZXdhcmUgPSAoeyBoYW5kbGVyLCBjb25maWd1cmUgfSA9IHt9KSA9PiB7XG4gIGlmICghKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgdGhyb3cgRXJyb3IoYEN1c3RvbSBtaWRkbGV3YXJlcyBtdXN0IGRlZmluZSBhIFwiaGFuZGxlclwiYCk7XG4gIH1cblxuICBsZXQgcHJlID0gYXN5bmMgKCkgPT4ge307XG4gIHByZSA9IEJhc2VNaWRkbGV3YXJlSGFuZGxlckluaXQoaGFuZGxlcik7XG5cbiAgcHJlLmlzSG9va01pZGRsZXdhcmUgPSB0cnVlO1xuXG4gIGlmIChjb25maWd1cmUgJiYgY29uZmlndXJlLmF1Z21lbnRNZXRob2RzKSB7XG4gICAgY29uc3QgeyBhdWdtZW50TWV0aG9kcyA9IHt9IH0gPSBjb25maWd1cmU7XG4gICAgY29uc3QgY29uZmlndXJhYmxlTWV0aG9kcyA9IFtcIm9uQ2F0Y2hcIl07XG5cbiAgICBjb25maWd1cmFibGVNZXRob2RzLmZvckVhY2goZm5OYW1lID0+IHtcbiAgICAgIGNvbnN0IG5ld01ldGhvZCA9IGF1Z21lbnRNZXRob2RzW2ZuTmFtZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbmV3TWV0aG9kID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGZuTmFtZSA9PT0gXCJvbkNhdGNoXCIpIHtcbiAgICAgICAgICBwcmUuc2NydE9uQ2F0Y2ggPSAob2xkTWV0aG9kLCBlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3TWV0aG9kKCgpID0+IG9sZE1ldGhvZChlKSwge1xuICAgICAgICAgICAgICBwcmV2UmF3TWV0aG9kOiBvbGRNZXRob2QsXG4gICAgICAgICAgICAgIGFyZzogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHByZTtcbn07XG5cbmNvbnN0IEJvZHlQYXJzZXJNaWRkbGV3YXJlID0gKCkgPT4ge1xuICByZXR1cm4gQmFzZU1pZGRsZXdhcmUoe1xuICAgIGhhbmRsZXI6IGFzeW5jICh7IGdldFBhcmFtcyB9KSA9PiB7XG4gICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICBpZiAoT2JqZWN0LmtleXMoeyAuLi5ldmVudC5ib2R5IH0pLmxlbmd0aCkge1xuICAgICAgICBzZXRFdmVudCh7IGJvZHk6IEpTT04ucGFyc2UoZXZlbnQuYm9keSkgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IENyZWF0ZUluc3RhbmNlID0gb3B0aW9ucyA9PiB7XG4gIGxldCBzZXR0aW5ncyA9IHtcbiAgICBERUJVRzogZmFsc2UsXG4gICAgc3RvcE9uQ2F0Y2g6IHRydWUsXG4gICAgc2lsZW50OiBmYWxzZVxuICB9O1xuXG4gIHNldHRpbmdzID0gb2JqZWN0QXNzaWduSWZFeGlzdHMoe30sIHNldHRpbmdzLCBvcHRpb25zKTtcblxuICBsZXQgcHZ0RGlzcGF0Y2hlZCA9IGZhbHNlO1xuICBjb25zdCBzdGFja2VkSG9va3MgPSBbXTtcbiAgbGV0IGlzSGFuZGxlckZlZCA9IGZhbHNlO1xuXG4gIGxldCBoYW5kbGVyID0gYXN5bmMgKCkgPT4ge307XG4gIGxldCBGT0ludm9rZU1pZGRsZXdhcmVzID0gYXN5bmMgKCkgPT4ge307XG5cbiAgLyoqXG4gICAqXG4gICAqIENPTkZJR1VSQUJMRVMgLSBTVEFSVFxuICAgKlxuICAgKiAqL1xuXG4gIGxldCBwdnRMb2dnZXIgPSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2c6ICguLi5hcmdzKSA9PiBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmxvZyhsLm1lc3NhZ2UgfHwgbCkpLFxuXG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dFcnJvcjogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUuZXJyb3IobC5tZXNzYWdlIHx8IGwpKSxcblxuICAgIGxvZ1dhcm5pbmc6ICguLi5hcmdzKSA9PlxuICAgICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICAgIGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUuZXJyb3IoYFdBUk5JTkc6ICR7bC5tZXNzYWdlIHx8IGx9YCkpXG4gIH07XG5cbiAgaWYgKHNldHRpbmdzLkRFQlVHICE9PSB0cnVlIHx8IHNldHRpbmdzLnNpbGVudCA9PT0gdHJ1ZSkge1xuICAgIHB2dExvZ2dlci5sb2cgPSAoKSA9PiB7fTtcbiAgICBwdnRMb2dnZXIubG9nRXJyb3IgPSAoKSA9PiB7fTtcbiAgICBwdnRMb2dnZXIubG9nV2FybmluZyA9ICgpID0+IHt9O1xuICB9XG5cbiAgbGV0IG9uQ2F0Y2ggPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IFtlXSA9IGFyZ3M7XG5cbiAgICBpZiAocHZ0TG9nZ2VyICYmIHR5cGVvZiBwdnRMb2dnZXIubG9nRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcHZ0TG9nZ2VyLmxvZ0Vycm9yKGUpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlYWQgPSByZWFkRXJyb3IoZSk7XG4gICAgaWYgKHJlYWQuaXNNaWRkbGV3YXJlSFRUUFJlc3BvbnNlID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gcmVhZC5yZXNwb25zZU9iamVjdDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgYm9keTogYCR7cmVhZC5lcnJvck1lc3NhZ2V9YFxuICAgIH07XG4gIH07XG5cbiAgbGV0IGhhbmRsZXJDYWxsV3JhcHBlciA9ICguLi5hcmdzKSA9PiB7XG4gICAgcmV0dXJuIGhhbmRsZXIoLi4uYXJncyk7XG4gIH07XG5cbiAgLyoqXG4gICAqXG4gICAqIENPTkZJR1VSQUJMRVMgLSBFTkRcbiAgICpcbiAgICogKi9cblxuICBjb25zdCBjb25maWd1cmUgPSAoeyBhdWdtZW50TWV0aG9kcyA9IHt9IH0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZ3VyYWJsZU1ldGhvZHMgPSBbXCJvbkNhdGNoXCIsIFwiaGFuZGxlckNhbGxXcmFwcGVyXCIsIFwicHZ0TG9nZ2VyXCJdO1xuXG4gICAgY29uZmlndXJhYmxlTWV0aG9kcy5mb3JFYWNoKGZuTmFtZSA9PiB7XG4gICAgICBjb25zdCBuZXdNZXRob2QgPSBhdWdtZW50TWV0aG9kc1tmbk5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBuZXdNZXRob2QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoZm5OYW1lID09PSBcIm9uQ2F0Y2hcIikge1xuICAgICAgICAgIGNvbnN0IG9sZE1ldGhvZCA9IG9uQ2F0Y2g7XG4gICAgICAgICAgb25DYXRjaCA9IChhcmcxLCB7IGV2ZW50LCBjb250ZXh0IH0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGFyZzEpLCB7XG4gICAgICAgICAgICAgIHByZXZSYXdNZXRob2Q6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBhcmcxLFxuICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgY29udGV4dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChmbk5hbWUgPT09IFwiaGFuZGxlckNhbGxXcmFwcGVyXCIpIHtcbiAgICAgICAgICBjb25zdCBvbGRNZXRob2QgPSBoYW5kbGVyQ2FsbFdyYXBwZXI7XG4gICAgICAgICAgaGFuZGxlckNhbGxXcmFwcGVyID0gZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3TWV0aG9kKCgpID0+IG9sZE1ldGhvZChlKSwge1xuICAgICAgICAgICAgICBwcmV2UmF3TWV0aG9kOiBvbGRNZXRob2QsXG4gICAgICAgICAgICAgIGFyZzogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChmbk5hbWUgPT09IFwicHZ0TG9nZ2VyXCIpIHtcbiAgICAgICAgICBjb25zdCBvbGRNZXRob2QgPSBwdnRMb2dnZXI7XG4gICAgICAgICAgcHZ0TG9nZ2VyID0gZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3TWV0aG9kKCgpID0+IG9sZE1ldGhvZChlKSwge1xuICAgICAgICAgICAgICBwcmV2UmF3TWV0aG9kOiBvbGRNZXRob2QsXG4gICAgICAgICAgICAgIGFyZzogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8qIGluaXQgY29uZmlndXJhYmxlcyAqL1xuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNvbmZpZ3VyZSkge1xuICAgIGNvbmZpZ3VyZShvcHRpb25zLmNvbmZpZ3VyZSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQ09SRSAtIFNUQVJUXG4gICAqXG4gICAqICovXG5cbiAgLyoqIEZ1bmN0aW9uIE9iamVjdCBJbml0IFwiQmVmb3JlIEhvb2tcIiAqICovXG4gIGNvbnN0IEZPSW5pdEJlZm9yZUhvb2sgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmICh0eXBlb2YgYXJnc1swXSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gRk9JbnZva2VNaWRkbGV3YXJlcyguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBpZiAoaXNIYW5kbGVyRmVkID09PSBmYWxzZSAmJiB2YWxpZGF0ZUhhbmRsZXIoYXJnc1swXSkgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYERFUFJFQ0FURUQgLSBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc0hhbmRsZXJGZWQgPT09IHRydWUgJiYgYXJnc1swXS5pc0hvb2tNaWRkbGV3YXJlICE9PSB0cnVlKSB7XG4gICAgICAvKiB0aGVuIHdlIGFzc3VtZSB0aGlzIHNjZW5hcmlvIGNhbGxzIGZvciBhIG5ldyBpbnN0YW5jZSAqL1xuICAgICAgcmV0dXJuIENyZWF0ZUluc3RhbmNlKG9wdGlvbnMpKGFyZ3NbMF0pO1xuICAgIH1cblxuICAgIFtoYW5kbGVyXSA9IGFyZ3M7XG5cbiAgICBpc0hhbmRsZXJGZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIEZPSW52b2tlTWlkZGxld2FyZXM7XG4gIH07XG5cbiAgRk9Jbml0QmVmb3JlSG9vay51c2UgPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IG1pZGRsZXdhcmUgPSBhcmdzWzBdO1xuICAgIGlmIChpc0hhbmRsZXJGZWQgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcIkEgaGFuZGxlciBuZWVkcyB0byBiZSBmZWQgZmlyc3QgYmVmb3JlIGNhbGxpbmcgLnVzZVwiKTtcbiAgICB9XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgaWYgKHB2dExvZ2dlciAmJiB0eXBlb2YgcHZ0TG9nZ2VyLmxvZ1dhcm5pbmcgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBwdnRMb2dnZXIubG9nV2FybmluZyhcbiAgICAgICAgICBgSWdub3JpbmcgMm5kIGFyZ3VtZW50LiBcInVzZVwiIG1ldGhvZCB3YXMgY2FsbGVkIHdpdGggbW9yZSB0aGFuIDEgYXJndW1lbnQuYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHZ0RGlzcGF0Y2hlZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIFwiVXNpbmcgbWlkZGxld2FyZXMgYWdhaW4gYWZ0ZXIgaGFuZGxlcidzIGludm9jYXRpb24gaXMgbm90IGFsbG93ZWQuXCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKG1pZGRsZXdhcmUuaXNIb29rTWlkZGxld2FyZSA9PT0gdHJ1ZSkge1xuICAgICAgc3RhY2tlZEhvb2tzLnB1c2gobWlkZGxld2FyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBcIlVua25vd24gbWlkZGxld2FyZXMgYXJlIG5vdCB5ZXQgc3VwcG9ydGVkLiBQbGVhc2UgZXh0ZW5kIGBCYXNlYCBtaWRkbGV3YXJlIGluc3RlYWQuXCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEZPSW5pdEJlZm9yZUhvb2s7XG4gIH07XG5cbiAgRk9Jbml0QmVmb3JlSG9vay5zZXRMb2dnZXIgPSBuZXdMb2dnZXIgPT4ge1xuICAgIHB2dExvZ2dlciA9IG5ld0xvZ2dlcjtcbiAgfTtcblxuICBGT0luaXRCZWZvcmVIb29rLmdldExvZ2dlciA9ICgpID0+IHB2dExvZ2dlcjtcblxuICBGT0ludm9rZU1pZGRsZXdhcmVzID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgbGV0IGV4dGVuZGVkRXZlbnQgPSBldmVudDtcbiAgICBsZXQgZXh0ZW5kZWRDb250ZXh0ID0gY29udGV4dDtcbiAgICBsZXQgaG9va0JlZm9yZUNhdGNoaW5nID0ge307XG4gICAgcHZ0RGlzcGF0Y2hlZCA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG4gICAgICBmb3IgKGNvbnN0IGhvb2sgb2Ygc3RhY2tlZEhvb2tzKSB7XG4gICAgICAgIGhvb2tCZWZvcmVDYXRjaGluZyA9IGhvb2s7XG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wICovXG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBhd2FpdCBob29rKGV4dGVuZGVkRXZlbnQsIGV4dGVuZGVkQ29udGV4dCk7XG5cbiAgICAgICAgaWYgKGV4dGVuc2lvbnMuZXZlbnQpIHtcbiAgICAgICAgICBleHRlbmRlZEV2ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgZXh0ZW5kZWRFdmVudCwgZXh0ZW5zaW9ucy5ldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXh0ZW5zaW9ucy5jb250ZXh0KSB7XG4gICAgICAgICAgZXh0ZW5kZWRDb250ZXh0ID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgZXh0ZW5kZWRDb250ZXh0LFxuICAgICAgICAgICAgZXh0ZW5zaW9ucy5jb250ZXh0XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKG1pZGRsZXdhcmVzVGhyb3cpIHtcbiAgICAgIGNvbnN0IGNhdGNoSGFuZGxlclRvVXNlID1cbiAgICAgICAgdHlwZW9mIGhvb2tCZWZvcmVDYXRjaGluZy5zY3J0T25DYXRjaCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyAoZXJyLCBldmVudEFuZENvbnRleHQpID0+XG4gICAgICAgICAgICAgIGhvb2tCZWZvcmVDYXRjaGluZy5zY3J0T25DYXRjaChcbiAgICAgICAgICAgICAgICBlID0+IG9uQ2F0Y2goZSwgZXZlbnRBbmRDb250ZXh0KSxcbiAgICAgICAgICAgICAgICBlcnJcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIDogKGVyciwgZXZlbnRBbmRDb250ZXh0KSA9PiBvbkNhdGNoKGVyciwgZXZlbnRBbmRDb250ZXh0KTtcbiAgICAgIGlmIChzZXR0aW5ncy5zdG9wT25DYXRjaCA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gY2F0Y2hIYW5kbGVyVG9Vc2UobWlkZGxld2FyZXNUaHJvdywge1xuICAgICAgICAgIGV2ZW50OiBleHRlbmRlZEV2ZW50LFxuICAgICAgICAgIGNvbnRleHQ6IGV4dGVuZGVkQ29udGV4dFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNhdGNoSGFuZGxlclRvVXNlKG1pZGRsZXdhcmVzVGhyb3csIHtcbiAgICAgICAgZXZlbnQ6IGV4dGVuZGVkRXZlbnQsXG4gICAgICAgIGNvbnRleHQ6IGV4dGVuZGVkQ29udGV4dFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhbmRsZXJDYWxsV3JhcHBlcihleHRlbmRlZEV2ZW50LCBleHRlbmRlZENvbnRleHQpO1xuICB9O1xuXG4gIC8qIGNvcHkgcHJvcGVydGllcyBvZiBGT0luaXRCZWZvcmVIb29rIHRvIEZPSW52b2tlTWlkZGxld2FyZXMgLSBzbyB3ZSBjYW4gY2hhaW4gLnVzZSBhbmQgZXRjICovXG4gIE9iamVjdC5rZXlzKEZPSW5pdEJlZm9yZUhvb2spLmZvckVhY2gobWV0aG9kID0+IHtcbiAgICBGT0ludm9rZU1pZGRsZXdhcmVzW21ldGhvZF0gPSBGT0luaXRCZWZvcmVIb29rW21ldGhvZF07XG4gIH0pO1xuXG4gIC8qKlxuICAgKlxuICAgKiBDT1JFIC0gRU5EXG4gICAqXG4gICAqICovXG5cbiAgcmV0dXJuIEZPSW5pdEJlZm9yZUhvb2s7XG59O1xuXG5leHBvcnQge1xuICBNSURETEVXQVJFX0NPTlNUQU5UUyxcbiAgQmFzZU1pZGRsZXdhcmUsXG4gIEJvZHlQYXJzZXJNaWRkbGV3YXJlLFxuICBDcmVhdGVJbnN0YW5jZSxcbiAgZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aCxcbiAgdmFsaWRhdGVIYW5kbGVyXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDcmVhdGVJbnN0YW5jZTtcbiJdfQ==
