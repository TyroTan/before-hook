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

var setState = function setState(objs, oldState, state) {
  var mutatedOldState = oldState;
  var newState = state;
  Object.keys(objs).forEach(function (key) {
    newState[key] = objs[key];
    mutatedOldState[key] = objs[key];
  });
  return mutatedOldState;
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
                      return setState(objs, event, pvtEvent);
                    },
                    context: pvtContext,
                    setContext: function setContext(objs) {
                      return _setContext(objs, context, pvtContext);
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
                extendedEvent = setState(extensions.event, event, extendedEvent);
              }

              if (extensions.context) {
                extendedContext = setState(extensions.context, context, extendedContext);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnNvdXJjZS5qcyJdLCJuYW1lcyI6WyJNSURETEVXQVJFX1BSRUZJWCIsIk1JRERMRVdBUkVfQ09OU1RBTlRTIiwiSFRUUF9SRVNQT05TRSIsIm9iamVjdEFzc2lnbklmRXhpc3RzIiwiZGVmIiwib3ZlcnJpZGVJZkV4aXN0IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrIiwiZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aCIsImhhbmRsZXIiLCJyZXN1bHQiLCJFcnJvciIsInRvU3RyaW5nIiwicmVtb3ZlQ29tbWVudHNSZWdleCIsIlJlZ0V4cCIsIm5vU3BhY2VBbmRDb21tZW50cyIsInJlcGxhY2UiLCJjb21tYXNSZWdFeHAiLCJtYXRjaCIsImluZGV4T2YiLCJsZW5ndGgiLCJlIiwiY29uc29sZSIsImVycm9yIiwibWVzc2FnZSIsInZhbGlkYXRlSGFuZGxlciIsIlR5cGVFcnJvciIsInJlZHVjZSIsImFjYyIsImN1ciIsImNvdW50IiwicmVhZEVycm9yIiwiaXNNaWRkbGV3YXJlSFRUUFJlc3BvbnNlIiwib2JqRXJyb3IiLCJKU09OIiwicGFyc2UiLCJ0eXBlIiwicmVzcG9uc2VPYmplY3QiLCJlcnIiLCJlcnJvck1lc3NhZ2UiLCJNaWRkbGV3YXJlSGVscGVyc0luaXQiLCJwdnRMb2dnZXIiLCJsb2ciLCJhcmdzIiwibCIsImxvZ0Vycm9yIiwicmV0dXJuQW5kU2VuZFJlc3BvbnNlIiwib2JqIiwic3RyaW5nRXJyIiwiZXJyb3JPYmoiLCJzdHJpbmdpZnkiLCJnZXRMb2dnZXIiLCJzZXRTdGF0ZSIsIm9ianMiLCJvbGRTdGF0ZSIsInN0YXRlIiwibXV0YXRlZE9sZFN0YXRlIiwibmV3U3RhdGUiLCJrZXkiLCJzZXRDb250ZXh0Iiwic2ltcGxlQ2xvbmUiLCJvYmplY3RUb0Nsb25lIiwiY2xvbmUiLCJCYXNlTWlkZGxld2FyZUhhbmRsZXJJbml0IiwiZm4iLCJldmVudCIsImNvbnRleHQiLCJwdnRFdmVudCIsInB2dENvbnRleHQiLCJnZXRQYXJhbXMiLCJzZXRFdmVudCIsImdldEhlbHBlcnMiLCJCYXNlTWlkZGxld2FyZSIsImNvbmZpZ3VyZSIsInByZSIsImlzSG9va01pZGRsZXdhcmUiLCJhdWdtZW50TWV0aG9kcyIsImNvbmZpZ3VyYWJsZU1ldGhvZHMiLCJmbk5hbWUiLCJuZXdNZXRob2QiLCJzY3J0T25DYXRjaCIsIm9sZE1ldGhvZCIsInByZXZSYXdNZXRob2QiLCJhcmciLCJCb2R5UGFyc2VyTWlkZGxld2FyZSIsImJvZHkiLCJDcmVhdGVJbnN0YW5jZSIsIm9wdGlvbnMiLCJzZXR0aW5ncyIsIkRFQlVHIiwic3RvcE9uQ2F0Y2giLCJzaWxlbnQiLCJwdnREaXNwYXRjaGVkIiwic3RhY2tlZEhvb2tzIiwiaXNIYW5kbGVyRmVkIiwiRk9JbnZva2VNaWRkbGV3YXJlcyIsImxvZ1dhcm5pbmciLCJvbkNhdGNoIiwicmVhZCIsInN0YXR1c0NvZGUiLCJoYW5kbGVyQ2FsbFdyYXBwZXIiLCJhcmcxIiwiRk9Jbml0QmVmb3JlSG9vayIsInVzZSIsIm1pZGRsZXdhcmUiLCJwdXNoIiwic2V0TG9nZ2VyIiwibmV3TG9nZ2VyIiwiZXh0ZW5kZWRFdmVudCIsImV4dGVuZGVkQ29udGV4dCIsImhvb2tCZWZvcmVDYXRjaGluZyIsImhvb2siLCJleHRlbnNpb25zIiwiY2F0Y2hIYW5kbGVyVG9Vc2UiLCJldmVudEFuZENvbnRleHQiLCJtZXRob2QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxpQkFBaUIsR0FBRyxjQUExQjtBQUNBLElBQU1DLG9CQUFvQixHQUFHO0FBQzNCQyxFQUFBQSxhQUFhLFlBQUtGLGlCQUFMO0FBRGMsQ0FBN0I7QUFJQTs7Ozs7O0FBSUEsSUFBTUcsb0JBQW9CLEdBQUcsU0FBdkJBLG9CQUF1QixHQUFhO0FBQ3hDLE1BQU1DLEdBQUcsdUZBQVQ7QUFDQSxNQUFNQyxlQUFlLHVGQUFyQjtBQUNBQyxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUgsR0FBWixFQUFpQkksT0FBakIs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QSxHQUFELEVBQU00RSxlQUFOO0FBQUEsdUJBQTBCakIsT0FBTyxDQUFDM0QsR0FBRCxFQUFNNEUsZUFBTixDQUFqQztBQUFBLGVBN0JZOztBQUFBLG9CQThCZDFCLFFBQVEsQ0FBQ0UsV0FBVCxLQUF5QixJQTlCWDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxnREErQlR1QixpQkFBaUIsZUFBbUI7QUFDekNoRCxnQkFBQUEsS0FBSyxFQUFFMkMsYUFEa0M7QUFFekMxQyxnQkFBQUEsT0FBTyxFQUFFMkM7QUFGZ0MsZUFBbkIsQ0EvQlI7O0FBQUE7QUFvQ2xCSSxjQUFBQSxpQkFBaUIsZUFBbUI7QUFDbENoRCxnQkFBQUEsS0FBSyxFQUFFMkMsYUFEMkI7QUFFbEMxQyxnQkFBQUEsT0FBTyxFQUFFMkM7QUFGeUIsZUFBbkIsQ0FBakI7O0FBcENrQjtBQUFBLGdEQTBDYlQsa0JBQWtCLENBQUNRLGFBQUQsRUFBZ0JDLGVBQWhCLENBMUNMOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUg7O0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBbkI7QUE2Q0E7OztBQUNBekcsRUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlpRyxnQkFBWixFQUE4QmhHLE9BQTlCLENBQXNDLFVBQUE2RyxNQUFNLEVBQUk7QUFDOUNwQixJQUFBQSxtQkFBbUIsQ0FBQ29CLE1BQUQsQ0FBbkIsR0FBOEJiLGdCQUFnQixDQUFDYSxNQUFELENBQTlDO0FBQ0QsR0FGRDtBQUlBOzs7Ozs7QUFNQSxTQUFPYixnQkFBUDtBQUNELENBeE9EOzs7ZUFtUGVoQixjIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgTUlERExFV0FSRV9QUkVGSVggPSBcIkJFRk9SRV9IT09LX1wiO1xuY29uc3QgTUlERExFV0FSRV9DT05TVEFOVFMgPSB7XG4gIEhUVFBfUkVTUE9OU0U6IGAke01JRERMRVdBUkVfUFJFRklYfUhUVFBfUkVTUE9OU0VgXG59O1xuXG4vKiBjb25zdCBpc0FzeW5jRnVuY3Rpb24gPSBmbiA9PiB7XG4gIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lID09PSBcIkFzeW5jRnVuY3Rpb25cIjtcbn07ICovXG5cbmNvbnN0IG9iamVjdEFzc2lnbklmRXhpc3RzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGVmID0geyAuLi5hcmdzWzFdIH07XG4gIGNvbnN0IG92ZXJyaWRlSWZFeGlzdCA9IHsgLi4uYXJnc1syXSB9O1xuICBPYmplY3Qua2V5cyhkZWYpLmZvckVhY2goayA9PiB7XG4gICAgaWYgKG92ZXJyaWRlSWZFeGlzdFtrXSkge1xuICAgICAgZGVmW2tdID0gb3ZlcnJpZGVJZkV4aXN0W2tdO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHsgLi4uYXJnc1swXSwgLi4uZGVmIH07XG59O1xuXG5jb25zdCBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoID0gaGFuZGxlciA9PiB7XG4gIGxldCByZXN1bHQgPSAtMTtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIilcbiAgICAgIHRocm93IEVycm9yKGBIYW5kbGVyIG11c3QgYmUgYSBmdW5jdGlvbi4gdHlwZSAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG5cbiAgICBjb25zdCBkZWYgPSBoYW5kbGVyLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgcmVtb3ZlQ29tbWVudHNSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgICAvXFwvXFwqW1xcc1xcU10qP1xcKlxcL3woW15cXFxcOl18XilcXC9cXC8uKiQvZ21cbiAgICApO1xuICAgIGNvbnN0IG5vU3BhY2VBbmRDb21tZW50cyA9IGRlZlxuICAgICAgLnJlcGxhY2UocmVtb3ZlQ29tbWVudHNSZWdleCwgXCJcIilcbiAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXFxcXHN8XFxcXG4pXCIsIFwiZ1wiKSwgXCJcIik7XG5cbiAgICBjb25zdCBjb21tYXNSZWdFeHAgPSBuZXcgUmVnRXhwKGBcXFxcLGAsIFwiZ1wiKTtcblxuICAgIGNvbnN0IG1hdGNoID0gbm9TcGFjZUFuZENvbW1lbnRzLm1hdGNoKGNvbW1hc1JlZ0V4cCk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmVzdWx0ID0gbm9TcGFjZUFuZENvbW1lbnRzLmluZGV4T2YoXCIoKVwiKSA+IC0xID8gMCA6IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG1hdGNoLmxlbmd0aCArIDE7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihgX19nZXRBcmd1bWVudHNMZW5ndGhfXy4gJHtlLm1lc3NhZ2V9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuY29uc3QgdmFsaWRhdGVIYW5kbGVyID0gaGFuZGxlciA9PiB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICAgIHRocm93IFR5cGVFcnJvcihcbiAgICAgIGBIYW5kbGVyIG11c3QgYmUgYSBmdW5jdGlvbiR7dHlwZW9mIGhhbmRsZXJ9ICR7T2JqZWN0LmtleXMoXG4gICAgICAgIGhhbmRsZXJcbiAgICAgICkucmVkdWNlKChhY2MsIGN1cikgPT4gYCR7YWNjfSAke2N1cn1gLCBcIlwiKX1gXG4gICAgKTtcblxuICBjb25zdCBjb3VudCA9IGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgoaGFuZGxlcik7XG4gIHJldHVybiBjb3VudCA+PSAwIHx8IGNvdW50IDw9IDE7XG59O1xuXG5jb25zdCByZWFkRXJyb3IgPSBlID0+IHtcbiAgbGV0IGlzTWlkZGxld2FyZUhUVFBSZXNwb25zZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGNvbnN0IG9iakVycm9yID1cbiAgICAgIHR5cGVvZiBlLm1lc3NhZ2UgPT09IFwib2JqZWN0XCIgPyBlLm1lc3NhZ2UgOiBKU09OLnBhcnNlKGUubWVzc2FnZSk7XG5cbiAgICBpc01pZGRsZXdhcmVIVFRQUmVzcG9uc2UgPVxuICAgICAgb2JqRXJyb3IudHlwZSA9PT0gTUlERExFV0FSRV9DT05TVEFOVFMuSFRUUF9SRVNQT05TRTtcblxuICAgIGNvbnN0IHsgcmVzcG9uc2VPYmplY3QgfSA9IG9iakVycm9yO1xuICAgIGlmICh0eXBlb2YgcmVzcG9uc2VPYmplY3QgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGN1c3RvbSBcInJlc3BvbnNlT2JqZWN0XCJgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZSxcbiAgICAgIGlzTWlkZGxld2FyZUhUVFBSZXNwb25zZSxcbiAgICAgIHJlc3BvbnNlT2JqZWN0XG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHsgZSwgZXJyLCBlcnJvck1lc3NhZ2U6IGAke2UubWVzc2FnZX0gLSAke2Vyci5tZXNzYWdlfWAgfTtcbiAgfVxufTtcblxuY29uc3QgTWlkZGxld2FyZUhlbHBlcnNJbml0ID0gKCkgPT4ge1xuICBjb25zdCBwdnRMb2dnZXIgPSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2c6ICguLi5hcmdzKSA9PiBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmxvZyhsLm1lc3NhZ2UgfHwgbCkpLFxuXG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dFcnJvcjogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUuZXJyb3IobC5tZXNzYWdlIHx8IGwpKVxuICB9O1xuXG4gIGNvbnN0IHJldHVybkFuZFNlbmRSZXNwb25zZSA9IG9iaiA9PiB7XG4gICAgbGV0IHN0cmluZ0VyciA9IFwiXCI7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVycm9yT2JqID0ge1xuICAgICAgICB0eXBlOiBNSURETEVXQVJFX0NPTlNUQU5UUy5IVFRQX1JFU1BPTlNFLFxuICAgICAgICByZXNwb25zZU9iamVjdDogb2JqXG4gICAgICB9O1xuICAgICAgc3RyaW5nRXJyID0gSlNPTi5zdHJpbmdpZnkoeyAuLi5lcnJvck9iaiB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAocHZ0TG9nZ2VyICYmIHR5cGVvZiBwdnRMb2dnZXIubG9nRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBwdnRMb2dnZXIubG9nRXJyb3IoZSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRocm93IEVycm9yKHN0cmluZ0Vycik7XG4gIH07XG5cbiAgcmV0dXJuICgpID0+ICh7XG4gICAgcmV0dXJuQW5kU2VuZFJlc3BvbnNlLFxuICAgIGdldExvZ2dlcjogKCkgPT4gcHZ0TG9nZ2VyXG4gIH0pO1xufTtcblxuY29uc3Qgc2V0U3RhdGUgPSAob2Jqcywgb2xkU3RhdGUsIHN0YXRlKSA9PiB7XG4gIGNvbnN0IG11dGF0ZWRPbGRTdGF0ZSA9IG9sZFN0YXRlO1xuICBjb25zdCBuZXdTdGF0ZSA9IHN0YXRlO1xuXG4gIE9iamVjdC5rZXlzKG9ianMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBuZXdTdGF0ZVtrZXldID0gb2Jqc1trZXldO1xuICAgIG11dGF0ZWRPbGRTdGF0ZVtrZXldID0gb2Jqc1trZXldO1xuICB9KTtcblxuICByZXR1cm4gbXV0YXRlZE9sZFN0YXRlO1xufTtcbmNvbnN0IHNldENvbnRleHQgPSBzZXRTdGF0ZTtcbmNvbnN0IHNpbXBsZUNsb25lID0gb2JqZWN0VG9DbG9uZSA9PlxuICAvKiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KCAqLyBvYmplY3RUb0Nsb25lOyAvKiApKSAqL1xuY29uc3QgY2xvbmUgPSBzaW1wbGVDbG9uZTtcblxuY29uc3QgQmFzZU1pZGRsZXdhcmVIYW5kbGVySW5pdCA9IGhhbmRsZXIgPT4ge1xuICBjb25zdCBmbiA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHB2dEV2ZW50ID0gZXZlbnQgPyBjbG9uZShldmVudCkgOiBcIlwiO1xuICAgIGNvbnN0IHB2dENvbnRleHQgPSBjb250ZXh0ID8gY2xvbmUoY29udGV4dCkgOiBcIlwiO1xuXG4gICAgYXdhaXQgaGFuZGxlcihcbiAgICAgIHtcbiAgICAgICAgZ2V0UGFyYW1zOiAoKSA9PiAoe1xuICAgICAgICAgIGV2ZW50OiBwdnRFdmVudCxcbiAgICAgICAgICBzZXRFdmVudDogb2JqcyA9PiBzZXRTdGF0ZShvYmpzLCBldmVudCwgcHZ0RXZlbnQpLFxuICAgICAgICAgIGNvbnRleHQ6IHB2dENvbnRleHQsXG4gICAgICAgICAgc2V0Q29udGV4dDogb2JqcyA9PiBzZXRDb250ZXh0KG9ianMsIGNvbnRleHQsIHB2dENvbnRleHQpXG4gICAgICAgIH0pLFxuICAgICAgICBnZXRIZWxwZXJzOiBNaWRkbGV3YXJlSGVscGVyc0luaXQoKVxuICAgICAgfSxcbiAgICAgIHt9XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBldmVudDogcHZ0RXZlbnQsXG4gICAgICBjb250ZXh0OiBwdnRDb250ZXh0XG4gICAgfTtcbiAgfTtcblxuICByZXR1cm4gZm47XG59O1xuXG5jb25zdCBCYXNlTWlkZGxld2FyZSA9ICh7IGhhbmRsZXIsIGNvbmZpZ3VyZSB9ID0ge30pID0+IHtcbiAgaWYgKCEodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICB0aHJvdyBFcnJvcihgQ3VzdG9tIG1pZGRsZXdhcmVzIG11c3QgZGVmaW5lIGEgXCJoYW5kbGVyXCJgKTtcbiAgfVxuXG4gIGxldCBwcmUgPSBhc3luYyAoKSA9PiB7fTtcbiAgcHJlID0gQmFzZU1pZGRsZXdhcmVIYW5kbGVySW5pdChoYW5kbGVyKTtcblxuICBwcmUuaXNIb29rTWlkZGxld2FyZSA9IHRydWU7XG5cbiAgaWYgKGNvbmZpZ3VyZSAmJiBjb25maWd1cmUuYXVnbWVudE1ldGhvZHMpIHtcbiAgICBjb25zdCB7IGF1Z21lbnRNZXRob2RzID0ge30gfSA9IGNvbmZpZ3VyZTtcbiAgICBjb25zdCBjb25maWd1cmFibGVNZXRob2RzID0gW1wib25DYXRjaFwiXTtcblxuICAgIGNvbmZpZ3VyYWJsZU1ldGhvZHMuZm9yRWFjaChmbk5hbWUgPT4ge1xuICAgICAgY29uc3QgbmV3TWV0aG9kID0gYXVnbWVudE1ldGhvZHNbZm5OYW1lXTtcblxuICAgICAgaWYgKHR5cGVvZiBuZXdNZXRob2QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoZm5OYW1lID09PSBcIm9uQ2F0Y2hcIikge1xuICAgICAgICAgIHByZS5zY3J0T25DYXRjaCA9IChvbGRNZXRob2QsIGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGUpLCB7XG4gICAgICAgICAgICAgIHByZXZSYXdNZXRob2Q6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcHJlO1xufTtcblxuY29uc3QgQm9keVBhcnNlck1pZGRsZXdhcmUgPSAoKSA9PiB7XG4gIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgZXZlbnQsIHNldEV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh7IC4uLmV2ZW50LmJvZHkgfSkubGVuZ3RoKSB7XG4gICAgICAgIHNldEV2ZW50KHsgYm9keTogSlNPTi5wYXJzZShldmVudC5ib2R5KSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgQ3JlYXRlSW5zdGFuY2UgPSBvcHRpb25zID0+IHtcbiAgbGV0IHNldHRpbmdzID0ge1xuICAgIERFQlVHOiBmYWxzZSxcbiAgICBzdG9wT25DYXRjaDogdHJ1ZSxcbiAgICBzaWxlbnQ6IGZhbHNlXG4gIH07XG5cbiAgc2V0dGluZ3MgPSBvYmplY3RBc3NpZ25JZkV4aXN0cyh7fSwgc2V0dGluZ3MsIG9wdGlvbnMpO1xuXG4gIGxldCBwdnREaXNwYXRjaGVkID0gZmFsc2U7XG4gIGNvbnN0IHN0YWNrZWRIb29rcyA9IFtdO1xuICBsZXQgaXNIYW5kbGVyRmVkID0gZmFsc2U7XG5cbiAgbGV0IGhhbmRsZXIgPSBhc3luYyAoKSA9PiB7fTtcbiAgbGV0IEZPSW52b2tlTWlkZGxld2FyZXMgPSBhc3luYyAoKSA9PiB7fTtcblxuICAvKipcbiAgICpcbiAgICogQ09ORklHVVJBQkxFUyAtIFNUQVJUXG4gICAqXG4gICAqICovXG5cbiAgbGV0IHB2dExvZ2dlciA9IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgIGxvZzogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUubG9nKGwubWVzc2FnZSB8fCBsKSksXG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgIGxvZ0Vycm9yOiAoLi4uYXJncykgPT4gYXJncy5mb3JFYWNoKGwgPT4gY29uc29sZS5lcnJvcihsLm1lc3NhZ2UgfHwgbCkpLFxuXG4gICAgbG9nV2FybmluZzogKC4uLmFyZ3MpID0+XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgICAgYXJncy5mb3JFYWNoKGwgPT4gY29uc29sZS5lcnJvcihgV0FSTklORzogJHtsLm1lc3NhZ2UgfHwgbH1gKSlcbiAgfTtcblxuICBpZiAoc2V0dGluZ3MuREVCVUcgIT09IHRydWUgfHwgc2V0dGluZ3Muc2lsZW50ID09PSB0cnVlKSB7XG4gICAgcHZ0TG9nZ2VyLmxvZyA9ICgpID0+IHt9O1xuICAgIHB2dExvZ2dlci5sb2dFcnJvciA9ICgpID0+IHt9O1xuICAgIHB2dExvZ2dlci5sb2dXYXJuaW5nID0gKCkgPT4ge307XG4gIH1cblxuICBsZXQgb25DYXRjaCA9ICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgW2VdID0gYXJncztcblxuICAgIGlmIChwdnRMb2dnZXIgJiYgdHlwZW9mIHB2dExvZ2dlci5sb2dFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBwdnRMb2dnZXIubG9nRXJyb3IoZSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVhZCA9IHJlYWRFcnJvcihlKTtcbiAgICBpZiAocmVhZC5pc01pZGRsZXdhcmVIVFRQUmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiByZWFkLnJlc3BvbnNlT2JqZWN0O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBib2R5OiBgJHtyZWFkLmVycm9yTWVzc2FnZX1gXG4gICAgfTtcbiAgfTtcblxuICBsZXQgaGFuZGxlckNhbGxXcmFwcGVyID0gKC4uLmFyZ3MpID0+IHtcbiAgICByZXR1cm4gaGFuZGxlciguLi5hcmdzKTtcbiAgfTtcblxuICAvKipcbiAgICpcbiAgICogQ09ORklHVVJBQkxFUyAtIEVORFxuICAgKlxuICAgKiAqL1xuXG4gIGNvbnN0IGNvbmZpZ3VyZSA9ICh7IGF1Z21lbnRNZXRob2RzID0ge30gfSA9IHt9KSA9PiB7XG4gICAgY29uc3QgY29uZmlndXJhYmxlTWV0aG9kcyA9IFtcIm9uQ2F0Y2hcIiwgXCJoYW5kbGVyQ2FsbFdyYXBwZXJcIiwgXCJwdnRMb2dnZXJcIl07XG5cbiAgICBjb25maWd1cmFibGVNZXRob2RzLmZvckVhY2goZm5OYW1lID0+IHtcbiAgICAgIGNvbnN0IG5ld01ldGhvZCA9IGF1Z21lbnRNZXRob2RzW2ZuTmFtZV07XG4gICAgICBpZiAodHlwZW9mIG5ld01ldGhvZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChmbk5hbWUgPT09IFwib25DYXRjaFwiKSB7XG4gICAgICAgICAgY29uc3Qgb2xkTWV0aG9kID0gb25DYXRjaDtcbiAgICAgICAgICBvbkNhdGNoID0gKGFyZzEsIHsgZXZlbnQsIGNvbnRleHQgfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ld01ldGhvZCgoKSA9PiBvbGRNZXRob2QoYXJnMSksIHtcbiAgICAgICAgICAgICAgcHJldlJhd01ldGhvZDogb2xkTWV0aG9kLFxuICAgICAgICAgICAgICBhcmc6IGFyZzEsXG4gICAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgICAgICBjb250ZXh0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gXCJoYW5kbGVyQ2FsbFdyYXBwZXJcIikge1xuICAgICAgICAgIGNvbnN0IG9sZE1ldGhvZCA9IGhhbmRsZXJDYWxsV3JhcHBlcjtcbiAgICAgICAgICBoYW5kbGVyQ2FsbFdyYXBwZXIgPSBlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGUpLCB7XG4gICAgICAgICAgICAgIHByZXZSYXdNZXRob2Q6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gXCJwdnRMb2dnZXJcIikge1xuICAgICAgICAgIGNvbnN0IG9sZE1ldGhvZCA9IHB2dExvZ2dlcjtcbiAgICAgICAgICBwdnRMb2dnZXIgPSBlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGUpLCB7XG4gICAgICAgICAgICAgIHByZXZSYXdNZXRob2Q6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLyogaW5pdCBjb25maWd1cmFibGVzICovXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY29uZmlndXJlKSB7XG4gICAgY29uZmlndXJlKG9wdGlvbnMuY29uZmlndXJlKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBDT1JFIC0gU1RBUlRcbiAgICpcbiAgICogKi9cblxuICAvKiogRnVuY3Rpb24gT2JqZWN0IEluaXQgXCJCZWZvcmUgSG9va1wiICogKi9cbiAgY29uc3QgRk9Jbml0QmVmb3JlSG9vayA9ICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBhcmdzWzBdICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiBGT0ludm9rZU1pZGRsZXdhcmVzKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIGlmIChpc0hhbmRsZXJGZWQgPT09IGZhbHNlICYmIHZhbGlkYXRlSGFuZGxlcihhcmdzWzBdKSA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgREVQUkVDQVRFRCAtIFBsZWFzZSB1c2UgdGhlIGV4YWN0IGFyZ3VtZW50IG5hbWVzIG9mIHRoZSBoYW5kbGVyIGFzIHRoZSBmb2xsb3dpbmcgZXZlbnQsY29udGV4dCxjYWxsYmFjayBvciBzaW1wbHkgKGV2ZW50LCBjb250ZXh0KSA9PiB7fSBvciAoKSA9PiB7fWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGlzSGFuZGxlckZlZCA9PT0gdHJ1ZSAmJiBhcmdzWzBdLmlzSG9va01pZGRsZXdhcmUgIT09IHRydWUpIHtcbiAgICAgIC8qIHRoZW4gd2UgYXNzdW1lIHRoaXMgc2NlbmFyaW8gY2FsbHMgZm9yIGEgbmV3IGluc3RhbmNlICovXG4gICAgICByZXR1cm4gQ3JlYXRlSW5zdGFuY2Uob3B0aW9ucykoYXJnc1swXSk7XG4gICAgfVxuXG4gICAgW2hhbmRsZXJdID0gYXJncztcblxuICAgIGlzSGFuZGxlckZlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gRk9JbnZva2VNaWRkbGV3YXJlcztcbiAgfTtcblxuICBGT0luaXRCZWZvcmVIb29rLnVzZSA9ICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgbWlkZGxld2FyZSA9IGFyZ3NbMF07XG4gICAgaWYgKGlzSGFuZGxlckZlZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IEVycm9yKFwiQSBoYW5kbGVyIG5lZWRzIHRvIGJlIGZlZCBmaXJzdCBiZWZvcmUgY2FsbGluZyAudXNlXCIpO1xuICAgIH1cbiAgICBpZiAoYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICBpZiAocHZ0TG9nZ2VyICYmIHR5cGVvZiBwdnRMb2dnZXIubG9nV2FybmluZyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHB2dExvZ2dlci5sb2dXYXJuaW5nKFxuICAgICAgICAgIGBJZ25vcmluZyAybmQgYXJndW1lbnQuIFwidXNlXCIgbWV0aG9kIHdhcyBjYWxsZWQgd2l0aCBtb3JlIHRoYW4gMSBhcmd1bWVudC5gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwdnREaXNwYXRjaGVkID09PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgXCJVc2luZyBtaWRkbGV3YXJlcyBhZ2FpbiBhZnRlciBoYW5kbGVyJ3MgaW52b2NhdGlvbiBpcyBub3QgYWxsb3dlZC5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAobWlkZGxld2FyZS5pc0hvb2tNaWRkbGV3YXJlID09PSB0cnVlKSB7XG4gICAgICBzdGFja2VkSG9va3MucHVzaChtaWRkbGV3YXJlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIFwiVW5rbm93biBtaWRkbGV3YXJlcyBhcmUgbm90IHlldCBzdXBwb3J0ZWQuIFBsZWFzZSBleHRlbmQgYEJhc2VgIG1pZGRsZXdhcmUgaW5zdGVhZC5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gRk9Jbml0QmVmb3JlSG9vaztcbiAgfTtcblxuICBGT0luaXRCZWZvcmVIb29rLnNldExvZ2dlciA9IG5ld0xvZ2dlciA9PiB7XG4gICAgcHZ0TG9nZ2VyID0gbmV3TG9nZ2VyO1xuICB9O1xuXG4gIEZPSW5pdEJlZm9yZUhvb2suZ2V0TG9nZ2VyID0gKCkgPT4gcHZ0TG9nZ2VyO1xuXG4gIEZPSW52b2tlTWlkZGxld2FyZXMgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICBsZXQgZXh0ZW5kZWRFdmVudCA9IGV2ZW50O1xuICAgIGxldCBleHRlbmRlZENvbnRleHQgPSBjb250ZXh0O1xuICAgIGxldCBob29rQmVmb3JlQ2F0Y2hpbmcgPSB7fTtcbiAgICBwdnREaXNwYXRjaGVkID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXggKi9cbiAgICAgIGZvciAoY29uc3QgaG9vayBvZiBzdGFja2VkSG9va3MpIHtcbiAgICAgICAgaG9va0JlZm9yZUNhdGNoaW5nID0gaG9vaztcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3AgKi9cbiAgICAgICAgY29uc3QgZXh0ZW5zaW9ucyA9IGF3YWl0IGhvb2soZXh0ZW5kZWRFdmVudCwgZXh0ZW5kZWRDb250ZXh0KTtcblxuICAgICAgICBpZiAoZXh0ZW5zaW9ucy5ldmVudCkge1xuICAgICAgICAgIGV4dGVuZGVkRXZlbnQgPSBzZXRTdGF0ZShleHRlbnNpb25zLmV2ZW50LCBldmVudCwgZXh0ZW5kZWRFdmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXh0ZW5zaW9ucy5jb250ZXh0KSB7XG4gICAgICAgICAgZXh0ZW5kZWRDb250ZXh0ID0gc2V0U3RhdGUoZXh0ZW5zaW9ucy5jb250ZXh0LCBjb250ZXh0LCBleHRlbmRlZENvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAobWlkZGxld2FyZXNUaHJvdykge1xuICAgICAgY29uc3QgY2F0Y2hIYW5kbGVyVG9Vc2UgPVxuICAgICAgICB0eXBlb2YgaG9va0JlZm9yZUNhdGNoaW5nLnNjcnRPbkNhdGNoID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IChlcnIsIGV2ZW50QW5kQ29udGV4dCkgPT5cbiAgICAgICAgICAgICAgaG9va0JlZm9yZUNhdGNoaW5nLnNjcnRPbkNhdGNoKFxuICAgICAgICAgICAgICAgIGUgPT4gb25DYXRjaChlLCBldmVudEFuZENvbnRleHQpLFxuICAgICAgICAgICAgICAgIGVyclxuICAgICAgICAgICAgICApXG4gICAgICAgICAgOiAoZXJyLCBldmVudEFuZENvbnRleHQpID0+IG9uQ2F0Y2goZXJyLCBldmVudEFuZENvbnRleHQpO1xuICAgICAgaWYgKHNldHRpbmdzLnN0b3BPbkNhdGNoID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiBjYXRjaEhhbmRsZXJUb1VzZShtaWRkbGV3YXJlc1Rocm93LCB7XG4gICAgICAgICAgZXZlbnQ6IGV4dGVuZGVkRXZlbnQsXG4gICAgICAgICAgY29udGV4dDogZXh0ZW5kZWRDb250ZXh0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgY2F0Y2hIYW5kbGVyVG9Vc2UobWlkZGxld2FyZXNUaHJvdywge1xuICAgICAgICBldmVudDogZXh0ZW5kZWRFdmVudCxcbiAgICAgICAgY29udGV4dDogZXh0ZW5kZWRDb250ZXh0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFuZGxlckNhbGxXcmFwcGVyKGV4dGVuZGVkRXZlbnQsIGV4dGVuZGVkQ29udGV4dCk7XG4gIH07XG5cbiAgLyogY29weSBwcm9wZXJ0aWVzIG9mIEZPSW5pdEJlZm9yZUhvb2sgdG8gRk9JbnZva2VNaWRkbGV3YXJlcyAtIHNvIHdlIGNhbiBjaGFpbiAudXNlIGFuZCBldGMgKi9cbiAgT2JqZWN0LmtleXMoRk9Jbml0QmVmb3JlSG9vaykuZm9yRWFjaChtZXRob2QgPT4ge1xuICAgIEZPSW52b2tlTWlkZGxld2FyZXNbbWV0aG9kXSA9IEZPSW5pdEJlZm9yZUhvb2tbbWV0aG9kXTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqXG4gICAqIENPUkUgLSBFTkRcbiAgICpcbiAgICogKi9cblxuICByZXR1cm4gRk9Jbml0QmVmb3JlSG9vaztcbn07XG5cbmV4cG9ydCB7XG4gIE1JRERMRVdBUkVfQ09OU1RBTlRTLFxuICBCYXNlTWlkZGxld2FyZSxcbiAgQm9keVBhcnNlck1pZGRsZXdhcmUsXG4gIENyZWF0ZUluc3RhbmNlLFxuICBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoLFxuICB2YWxpZGF0ZUhhbmRsZXJcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENyZWF0ZUluc3RhbmNlO1xuIl19
