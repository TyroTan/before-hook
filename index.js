"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CreateInstance = exports.BodyParserMiddleware = exports.BaseMiddleware = void 0;

require("source-map-support/register");

const SYMBOL_ERR_TYPE = Symbol("SYMBOL_BEFOREHOOK_ERR_TYPE");
const SYMBOL_SHORT_CIRCUIT_TYPE = Symbol("SYMBOL_BEFOREHOOK_SHORT_CIRCUIT_TYPE");
const SYMBOL_MIDDLEWARE_ID = Symbol("SYMBOL_BEFOREHOOK_MIDDLEWARE_ID");

const objectAssignIfExists = (...args) => {
  const def = { ...args[1]
  };
  const overrideIfExist = { ...args[2]
  };
  Object.keys(def).forEach(k => {
    if (overrideIfExist[k]) {
      def[k] = overrideIfExist[k];
    }
  });
  return { ...args[0],
    ...def
  };
};

const MiddlewareHelpersInit = () => {
  const pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l))
  };

  const reply = obj => {
    /* eslint-disable-next-line no-param-reassign */
    const customError = Error(JSON.stringify(obj));
    customError[SYMBOL_ERR_TYPE] = true;
    throw customError;
  };

  return () => ({
    reply,
    getLogger: () => pvtLogger
  });
};
/* deprecated const setState = (objs, oldState, state) => {
  const mutatedOldState = oldState;
  const newState = state;

  Object.keys(objs).forEach(key => {
    newState[key] = objs[key];
    mutatedOldState[key] = objs[key];
  });

  return mutatedOldState;
};
const setContext = setState; */

/* deprecated const simpleClone = objectToClone =>
  /* JSON.parse(JSON.stringify( * / objectToClone; /* )) * /
const clone = simpleClone; */


const BaseMiddlewareHandlerInit = handler => {
  const dispatchFn = async (...args) => {
    try {
      await handler({
        getParams: () => args,
        reply: obj => {
          /* eslint-disable-next-line no-param-reassign */
          const shortCircuitErrorObject = Error(JSON.stringify(obj));
          shortCircuitErrorObject[SYMBOL_ERR_TYPE] = true;
          shortCircuitErrorObject[SYMBOL_SHORT_CIRCUIT_TYPE] = "reply";
          throw shortCircuitErrorObject;
        },
        next: () => {
          const shortCircuitErrorObject = Error("next is called.");
          shortCircuitErrorObject[SYMBOL_SHORT_CIRCUIT_TYPE] = "next";
        },
        getHelpers: MiddlewareHelpersInit()
      }, {});
    } catch (error) {
      /* ignore, next() is called */
      if (error[SYMBOL_SHORT_CIRCUIT_TYPE] === "next") {
        return args;
      }

      throw error;
    }

    return args;
  };

  return dispatchFn;
};

const BaseMiddleware = ({
  handler,
  configure
} = {}) => {
  if (!(typeof handler === "function")) {
    throw Error(`Custom middlewares must define a "handler"`);
  }

  let pre = async () => {};

  pre = BaseMiddlewareHandlerInit(handler);
  pre[SYMBOL_MIDDLEWARE_ID] = true;

  if (configure && configure.augmentMethods) {
    const {
      augmentMethods = {}
    } = configure;
    const configurableMethods = ["onCatch"];
    configurableMethods.forEach(fnName => {
      const newMethod = augmentMethods[fnName];

      if (typeof newMethod === "function") {
        if (fnName === "onCatch") {
          pre.scrtOnCatch = (oldMethod, e) => {
            return newMethod(() => oldMethod(e), {
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

const BodyParserMiddleware = () => {
  return BaseMiddleware({
    handler: async ({
      getParams
    }) => {
      const [event] = getParams();

      if (Object.keys({ ...event.body
      }).length) {
        event.body = JSON.parse(event.body);
      }
    }
  });
};

exports.BodyParserMiddleware = BodyParserMiddleware;

const CreateInstance = options => {
  let settings = {
    DEBUG: false,
    stopOnCatch: true
  };
  settings = objectAssignIfExists({}, settings, options);
  let pvtDispatched = false;
  const stackedHooks = [];
  let isHandlerFed = false;
  let handlerLength = -1;

  let handler = async () => {};

  let FODispatch = async () => {};
  /*
   *
   * CONFIGURABLES - START
   *
   */


  let pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l)),
    logWarning: (...args) =>
    /* eslint-disable-next-line no-console */
    args.forEach(l => console.error(`WARNING: ${l.message || l}`))
  };
  /* logs are off by default */

  if (settings.DEBUG !== true) {
    pvtLogger.log = () => {};

    pvtLogger.logError = () => {};

    pvtLogger.logWarning = () => {};
  }

  let onReturnObject = args => args;

  const onReply = (...args) => onReturnObject(...args);

  let onCatch = (...args) => {
    const [e] = args;

    try {
      if (e[SYMBOL_ERR_TYPE] === true) {
        // if (e[SYMBOL_SHORT_CIRCUIT_TYPE] === "reply") {
        //   return onReply(JSON.parse(e.message));
        // }
        return onReturnObject(JSON.parse(e.message));
      }

      pvtLogger.logError(e);
      return onReturnObject({
        statusCode: 500,
        body: `${e.message}`
      });
    } catch (parseError) {
      pvtLogger.logError(parseError);
      return onReturnObject({
        statusCode: 500,
        body: `${parseError.message} - ${e && e.message ? e.message : ""}`
      });
    }
  };

  let handlerCallWrapper = (...args) => {
    return handler(...args);
  };
  /**
   *
   * CONFIGURABLES - END
   *
   * */


  const configure = ({
    augmentMethods = {}
  } = {}) => {
    const configurableMethods = ["onCatch", "onReturnObject", "handlerCallWrapper", "pvtLogger"];
    configurableMethods.forEach(fnName => {
      const newMethod = augmentMethods[fnName];

      if (typeof newMethod === "function") {
        if (fnName === "onReturnObject") {
          const oldMethod = onReturnObject;

          onReturnObject = (arg1, params) => {
            return newMethod(() => oldMethod(arg1), {
              prevRawMethod: oldMethod,
              arg: arg1,
              ...params
            });
          };
        } else if (fnName === "onCatch") {
          const oldMethod = onCatch;

          onCatch = (arg1, params) => {
            return newMethod(() => oldMethod(arg1), {
              prevRawMethod: oldMethod,
              arg: arg1,
              ...params
            });
          };
        } else if (fnName === "handlerCallWrapper") {
          const oldMethod = handlerCallWrapper;

          handlerCallWrapper = e => {
            return newMethod(() => oldMethod(e), {
              prevRawMethod: oldMethod,
              arg: e
            });
          };
        } else if (fnName === "pvtLogger") {
          const oldMethod = pvtLogger;

          pvtLogger = e => {
            return newMethod(() => oldMethod(e), {
              prevRawMethod: oldMethod,
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

  /* Function Object Init "Before Hook" */


  const FOInitBeforeHook = (...args) => {
    if (isHandlerFed === true) {
      handlerLength = handler.length;
    }

    if (typeof args[0] === "undefined") {
      pvtLogger.logWarning(`"undefined" is probably not expected here.`);
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
      if (handlerLength > -1 && handlerLength !== args.length) {
        pvtLogger.logWarning(`Dispatching with ${args.length} args while the original handler has ${handlerLength}.`);
      }

      return FODispatch(...args);
    }

    if (isHandlerFed === true && args[0][SYMBOL_MIDDLEWARE_ID] !== true) {
      /* then we assume this scenario calls for a new instance */
      return CreateInstance(options)(args[0]);
    }

    [handler] = args;
    isHandlerFed = true;
    return FODispatch;
  };

  FOInitBeforeHook.use = (...args) => {
    if (!args || !args[0]) {
      throw Error(`.use expects an instance from BaseMiddleware. (Got type "${typeof args[0]}")`);
    }

    if (isHandlerFed === false) {
      throw Error("A handler needs to be fed first before calling .use");
    }

    if (args.length > 1) {
      pvtLogger.logWarning(`Ignoring 2nd argument. "use" method was called with more than 1 argument.`);
    }

    if (pvtDispatched === true) {
      throw Error("Using middlewares again after handler's invocation is not allowed.");
    }

    const middleware = args[0];

    if (middleware[SYMBOL_MIDDLEWARE_ID] === true) {
      stackedHooks.push(middleware);
    } else {
      throw Error("Unknown middleware. Middlewares must extend BaseMiddleware.");
    }

    return FOInitBeforeHook;
  };

  FOInitBeforeHook.setLogger = newLogger => {
    pvtLogger = newLogger;
  };

  FOInitBeforeHook.getLogger = () => pvtLogger;

  FODispatch = async (...args) => {
    let hookBeforeCatching = {};
    pvtDispatched = true;

    try {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const hook of stackedHooks) {
        hookBeforeCatching = hook;
        /* eslint-disable-next-line no-await-in-loop */

        await hook(...args); // const extensions = await hook(...args);
      }
    } catch (middlewaresThrow) {
      if (middlewaresThrow[SYMBOL_SHORT_CIRCUIT_TYPE] === "reply") {
        if (settings.stopOnCatch === true) {
          return onReply(JSON.parse(middlewaresThrow.message));
        }
      }

      const catchHandlerToUse = typeof hookBeforeCatching.scrtOnCatch === "function" ? (err, params) => hookBeforeCatching.scrtOnCatch(e => onCatch(e, params), err) : (err, params) => onCatch(err, params);

      if (settings.stopOnCatch === true) {
        return catchHandlerToUse(middlewaresThrow, {
          getParams: () => args
        });
      }

      catchHandlerToUse(middlewaresThrow, {
        getParams: () => args
      });
    }

    return handlerCallWrapper(...args);
  };
  /* copy properties of FOInitBeforeHook to FODispatch - so we can chain .use and etc */


  Object.keys(FOInitBeforeHook).forEach(method => {
    FODispatch[method] = FOInitBeforeHook[method];
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
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnNvdXJjZS5qcyJdLCJuYW1lcyI6WyJTWU1CT0xfRVJSX1RZUEUiLCJTeW1ib2wiLCJTWU1CT0xfU0hPUlRfQ0lSQ1VJVF9UWVBFIiwiU1lNQk9MX01JRERMRVdBUkVfSUQiLCJvYmplY3RBc3NpZ25JZkV4aXN0cyIsImFyZ3MiLCJkZWYiLCJvdmVycmlkZUlmRXhpc3QiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImsiLCJNaWRkbGV3YXJlSGVscGVyc0luaXQiLCJwdnRMb2dnZXIiLCJsb2ciLCJsIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJsb2dFcnJvciIsImVycm9yIiwicmVwbHkiLCJvYmoiLCJjdXN0b21FcnJvciIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImdldExvZ2dlciIsIkJhc2VNaWRkbGV3YXJlSGFuZGxlckluaXQiLCJoYW5kbGVyIiwiZGlzcGF0Y2hGbiIsImdldFBhcmFtcyIsInNob3J0Q2lyY3VpdEVycm9yT2JqZWN0IiwibmV4dCIsImdldEhlbHBlcnMiLCJCYXNlTWlkZGxld2FyZSIsImNvbmZpZ3VyZSIsInByZSIsImF1Z21lbnRNZXRob2RzIiwiY29uZmlndXJhYmxlTWV0aG9kcyIsImZuTmFtZSIsIm5ld01ldGhvZCIsInNjcnRPbkNhdGNoIiwib2xkTWV0aG9kIiwiZSIsInByZXZSYXdNZXRob2QiLCJhcmciLCJCb2R5UGFyc2VyTWlkZGxld2FyZSIsImV2ZW50IiwiYm9keSIsImxlbmd0aCIsInBhcnNlIiwiQ3JlYXRlSW5zdGFuY2UiLCJvcHRpb25zIiwic2V0dGluZ3MiLCJERUJVRyIsInN0b3BPbkNhdGNoIiwicHZ0RGlzcGF0Y2hlZCIsInN0YWNrZWRIb29rcyIsImlzSGFuZGxlckZlZCIsImhhbmRsZXJMZW5ndGgiLCJGT0Rpc3BhdGNoIiwibG9nV2FybmluZyIsIm9uUmV0dXJuT2JqZWN0Iiwib25SZXBseSIsIm9uQ2F0Y2giLCJzdGF0dXNDb2RlIiwicGFyc2VFcnJvciIsImhhbmRsZXJDYWxsV3JhcHBlciIsImFyZzEiLCJwYXJhbXMiLCJGT0luaXRCZWZvcmVIb29rIiwidXNlIiwibWlkZGxld2FyZSIsInB1c2giLCJzZXRMb2dnZXIiLCJuZXdMb2dnZXIiLCJob29rQmVmb3JlQ2F0Y2hpbmciLCJob29rIiwibWlkZGxld2FyZXNUaHJvdyIsImNhdGNoSGFuZGxlclRvVXNlIiwiZXJyIiwibWV0aG9kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFNQSxlQUFlLEdBQUdDLE1BQU0sQ0FBQyw0QkFBRCxDQUE5QjtBQUNBLE1BQU1DLHlCQUF5QixHQUFHRCxNQUFNLENBQ3RDLHNDQURzQyxDQUF4QztBQUdBLE1BQU1FLG9CQUFvQixHQUFHRixNQUFNLENBQUMsaUNBQUQsQ0FBbkM7O0FBRUEsTUFBTUcsb0JBQW9CLEdBQUcsQ0FBQyxHQUFHQyxJQUFKLEtBQWE7QUFDeEMsUUFBTUMsR0FBRyxHQUFHLEVBQUUsR0FBR0QsSUFBSSxDQUFDLENBQUQ7QUFBVCxHQUFaO0FBQ0EsUUFBTUUsZUFBZSxHQUFHLEVBQUUsR0FBR0YsSUFBSSxDQUFDLENBQUQ7QUFBVCxHQUF4QjtBQUNBRyxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUgsR0FBWixFQUFpQkksT0FBakIsQ0FBeUJDLENBQUMsSUFBSTtBQUM1QixRQUFJSixlQUFlLENBQUNJLENBQUQsQ0FBbkIsRUFBd0I7QUFDdEJMLE1BQUFBLEdBQUcsQ0FBQ0ssQ0FBRCxDQUFILEdBQVNKLGVBQWUsQ0FBQ0ksQ0FBRCxDQUF4QjtBQUNEO0FBQ0YsR0FKRDtBQU1BLFNBQU8sRUFBRSxHQUFHTixJQUFJLENBQUMsQ0FBRCxDQUFUO0FBQWMsT0FBR0M7QUFBakIsR0FBUDtBQUNELENBVkQ7O0FBWUEsTUFBTU0scUJBQXFCLEdBQUcsTUFBTTtBQUNsQyxRQUFNQyxTQUFTLEdBQUc7QUFDaEI7QUFDQUMsSUFBQUEsR0FBRyxFQUFFLENBQUMsR0FBR1QsSUFBSixLQUFhQSxJQUFJLENBQUNLLE9BQUwsQ0FBYUssQ0FBQyxJQUFJQyxPQUFPLENBQUNG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S0FDRU8sa0JBQWtCLENBQUNuQyxXQUFuQixDQUErQkUsQ0FBQyxJQUFJcUIsT0FBTyxDQUFDckIsQ0FBRCxFQUFJMEIsTUFBSixDQUEzQyxFQUF3RFcsR0FBeEQsQ0FGTixHQUdJLENBQUNBLEdBQUQsRUFBTVgsTUFBTixLQUFpQkwsT0FBTyxDQUFDZ0IsR0FBRCxFQUFNWCxNQUFOLENBSjlCOztBQUtBLFVBQUloQixRQUFRLENBQUNFLFdBQVQsS0FBeUIsSUFBN0IsRUFBbUM7QUFDakMsZUFBT3dCLGlCQUFpQixDQUFDRCxnQkFBRCxFQUFtQjtBQUN6Q2hELFVBQUFBLFNBQVMsRUFBRSxNQUFNekI7QUFEd0IsU0FBbkIsQ0FBeEI7QUFHRDs7QUFDRDBFLE1BQUFBLGlCQUFpQixDQUFDRCxnQkFBRCxFQUFtQjtBQUNsQ2hELFFBQUFBLFNBQVMsRUFBRSxNQUFNekI7QUFEaUIsT0FBbkIsQ0FBakI7QUFHRDs7QUFFRCxXQUFPOEQsa0JBQWtCLENBQUMsR0FBRzlELElBQUosQ0FBekI7QUFDRCxHQXBDRDtBQXNDQTs7O0FBQ0FHLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZNkQsZ0JBQVosRUFBOEI1RCxPQUE5QixDQUFzQ3VFLE1BQU0sSUFBSTtBQUM5Q3JCLElBQUFBLFVBQVUsQ0FBQ3FCLE1BQUQsQ0FBVixHQUFxQlgsZ0JBQWdCLENBQUNXLE1BQUQsQ0FBckM7QUFDRCxHQUZEO0FBSUE7Ozs7OztBQU1BLFNBQU9YLGdCQUFQO0FBQ0QsQ0ExUUQ7OztlQThRZW5CLGMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBTWU1CT0xfRVJSX1RZUEUgPSBTeW1ib2woXCJTWU1CT0xfQkVGT1JFSE9PS19FUlJfVFlQRVwiKTtcbmNvbnN0IFNZTUJPTF9TSE9SVF9DSVJDVUlUX1RZUEUgPSBTeW1ib2woXG4gIFwiU1lNQk9MX0JFRk9SRUhPT0tfU0hPUlRfQ0lSQ1VJVF9UWVBFXCJcbik7XG5jb25zdCBTWU1CT0xfTUlERExFV0FSRV9JRCA9IFN5bWJvbChcIlNZTUJPTF9CRUZPUkVIT09LX01JRERMRVdBUkVfSURcIik7XG5cbmNvbnN0IG9iamVjdEFzc2lnbklmRXhpc3RzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGVmID0geyAuLi5hcmdzWzFdIH07XG4gIGNvbnN0IG92ZXJyaWRlSWZFeGlzdCA9IHsgLi4uYXJnc1syXSB9O1xuICBPYmplY3Qua2V5cyhkZWYpLmZvckVhY2goayA9PiB7XG4gICAgaWYgKG92ZXJyaWRlSWZFeGlzdFtrXSkge1xuICAgICAgZGVmW2tdID0gb3ZlcnJpZGVJZkV4aXN0W2tdO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHsgLi4uYXJnc1swXSwgLi4uZGVmIH07XG59O1xuXG5jb25zdCBNaWRkbGV3YXJlSGVscGVyc0luaXQgPSAoKSA9PiB7XG4gIGNvbnN0IHB2dExvZ2dlciA9IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgIGxvZzogKC4uLmFyZ3MpID0+IGFyZ3MuZm9yRWFjaChsID0+IGNvbnNvbGUubG9nKGwubWVzc2FnZSB8fCBsKSksXG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgIGxvZ0Vycm9yOiAoLi4uYXJncykgPT4gYXJncy5mb3JFYWNoKGwgPT4gY29uc29sZS5lcnJvcihsLm1lc3NhZ2UgfHwgbCkpXG4gIH07XG5cbiAgY29uc3QgcmVwbHkgPSBvYmogPT4ge1xuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICAgIGNvbnN0IGN1c3RvbUVycm9yID0gRXJyb3IoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgY3VzdG9tRXJyb3JbU1lNQk9MX0VSUl9UWVBFXSA9IHRydWU7XG5cbiAgICB0aHJvdyBjdXN0b21FcnJvcjtcbiAgfTtcblxuICByZXR1cm4gKCkgPT4gKHtcbiAgICByZXBseSxcbiAgICBnZXRMb2dnZXI6ICgpID0+IHB2dExvZ2dlclxuICB9KTtcbn07XG5cbi8qIGRlcHJlY2F0ZWQgY29uc3Qgc2V0U3RhdGUgPSAob2Jqcywgb2xkU3RhdGUsIHN0YXRlKSA9PiB7XG4gIGNvbnN0IG11dGF0ZWRPbGRTdGF0ZSA9IG9sZFN0YXRlO1xuICBjb25zdCBuZXdTdGF0ZSA9IHN0YXRlO1xuXG4gIE9iamVjdC5rZXlzKG9ianMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBuZXdTdGF0ZVtrZXldID0gb2Jqc1trZXldO1xuICAgIG11dGF0ZWRPbGRTdGF0ZVtrZXldID0gb2Jqc1trZXldO1xuICB9KTtcblxuICByZXR1cm4gbXV0YXRlZE9sZFN0YXRlO1xufTtcbmNvbnN0IHNldENvbnRleHQgPSBzZXRTdGF0ZTsgKi9cbi8qIGRlcHJlY2F0ZWQgY29uc3Qgc2ltcGxlQ2xvbmUgPSBvYmplY3RUb0Nsb25lID0+XG4gIC8qIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoICogLyBvYmplY3RUb0Nsb25lOyAvKiApKSAqIC9cbmNvbnN0IGNsb25lID0gc2ltcGxlQ2xvbmU7ICovXG5cbmNvbnN0IEJhc2VNaWRkbGV3YXJlSGFuZGxlckluaXQgPSBoYW5kbGVyID0+IHtcbiAgY29uc3QgZGlzcGF0Y2hGbiA9IGFzeW5jICguLi5hcmdzKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGhhbmRsZXIoXG4gICAgICAgIHtcbiAgICAgICAgICBnZXRQYXJhbXM6ICgpID0+IGFyZ3MsXG4gICAgICAgICAgcmVwbHk6IG9iaiA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ24gKi9cbiAgICAgICAgICAgIGNvbnN0IHNob3J0Q2lyY3VpdEVycm9yT2JqZWN0ID0gRXJyb3IoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgICAgICAgICBzaG9ydENpcmN1aXRFcnJvck9iamVjdFtTWU1CT0xfRVJSX1RZUEVdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNob3J0Q2lyY3VpdEVycm9yT2JqZWN0W1NZTUJPTF9TSE9SVF9DSVJDVUlUX1RZUEVdID0gXCJyZXBseVwiO1xuXG4gICAgICAgICAgICB0aHJvdyBzaG9ydENpcmN1aXRFcnJvck9iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG5leHQ6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNob3J0Q2lyY3VpdEVycm9yT2JqZWN0ID0gRXJyb3IoXCJuZXh0IGlzIGNhbGxlZC5cIik7XG4gICAgICAgICAgICBzaG9ydENpcmN1aXRFcnJvck9iamVjdFtTWU1CT0xfU0hPUlRfQ0lSQ1VJVF9UWVBFXSA9IFwibmV4dFwiO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2V0SGVscGVyczogTWlkZGxld2FyZUhlbHBlcnNJbml0KClcbiAgICAgICAgfSxcbiAgICAgICAge31cbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8qIGlnbm9yZSwgbmV4dCgpIGlzIGNhbGxlZCAqL1xuICAgICAgaWYgKGVycm9yW1NZTUJPTF9TSE9SVF9DSVJDVUlUX1RZUEVdID09PSBcIm5leHRcIikge1xuICAgICAgICByZXR1cm4gYXJncztcbiAgICAgIH1cblxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3M7XG4gIH07XG5cbiAgcmV0dXJuIGRpc3BhdGNoRm47XG59O1xuXG5jb25zdCBCYXNlTWlkZGxld2FyZSA9ICh7IGhhbmRsZXIsIGNvbmZpZ3VyZSB9ID0ge30pID0+IHtcbiAgaWYgKCEodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICB0aHJvdyBFcnJvcihgQ3VzdG9tIG1pZGRsZXdhcmVzIG11c3QgZGVmaW5lIGEgXCJoYW5kbGVyXCJgKTtcbiAgfVxuXG4gIGxldCBwcmUgPSBhc3luYyAoKSA9PiB7fTtcbiAgcHJlID0gQmFzZU1pZGRsZXdhcmVIYW5kbGVySW5pdChoYW5kbGVyKTtcblxuICBwcmVbU1lNQk9MX01JRERMRVdBUkVfSURdID0gdHJ1ZTtcblxuICBpZiAoY29uZmlndXJlICYmIGNvbmZpZ3VyZS5hdWdtZW50TWV0aG9kcykge1xuICAgIGNvbnN0IHsgYXVnbWVudE1ldGhvZHMgPSB7fSB9ID0gY29uZmlndXJlO1xuICAgIGNvbnN0IGNvbmZpZ3VyYWJsZU1ldGhvZHMgPSBbXCJvbkNhdGNoXCJdO1xuXG4gICAgY29uZmlndXJhYmxlTWV0aG9kcy5mb3JFYWNoKGZuTmFtZSA9PiB7XG4gICAgICBjb25zdCBuZXdNZXRob2QgPSBhdWdtZW50TWV0aG9kc1tmbk5hbWVdO1xuXG4gICAgICBpZiAodHlwZW9mIG5ld01ldGhvZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChmbk5hbWUgPT09IFwib25DYXRjaFwiKSB7XG4gICAgICAgICAgcHJlLnNjcnRPbkNhdGNoID0gKG9sZE1ldGhvZCwgZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ld01ldGhvZCgoKSA9PiBvbGRNZXRob2QoZSksIHtcbiAgICAgICAgICAgICAgcHJldlJhd01ldGhvZDogb2xkTWV0aG9kLFxuICAgICAgICAgICAgICBhcmc6IGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBwcmU7XG59O1xuXG5jb25zdCBCb2R5UGFyc2VyTWlkZGxld2FyZSA9ICgpID0+IHtcbiAgcmV0dXJuIEJhc2VNaWRkbGV3YXJlKHtcbiAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRQYXJhbXMgfSkgPT4ge1xuICAgICAgY29uc3QgW2V2ZW50XSA9IGdldFBhcmFtcygpO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHsgLi4uZXZlbnQuYm9keSB9KS5sZW5ndGgpIHtcbiAgICAgICAgZXZlbnQuYm9keSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IENyZWF0ZUluc3RhbmNlID0gb3B0aW9ucyA9PiB7XG4gIGxldCBzZXR0aW5ncyA9IHtcbiAgICBERUJVRzogZmFsc2UsXG4gICAgc3RvcE9uQ2F0Y2g6IHRydWVcbiAgfTtcblxuICBzZXR0aW5ncyA9IG9iamVjdEFzc2lnbklmRXhpc3RzKHt9LCBzZXR0aW5ncywgb3B0aW9ucyk7XG5cbiAgbGV0IHB2dERpc3BhdGNoZWQgPSBmYWxzZTtcbiAgY29uc3Qgc3RhY2tlZEhvb2tzID0gW107XG4gIGxldCBpc0hhbmRsZXJGZWQgPSBmYWxzZTtcbiAgbGV0IGhhbmRsZXJMZW5ndGggPSAtMTtcblxuICBsZXQgaGFuZGxlciA9IGFzeW5jICgpID0+IHt9O1xuICBsZXQgRk9EaXNwYXRjaCA9IGFzeW5jICgpID0+IHt9O1xuXG4gIC8qXG4gICAqXG4gICAqIENPTkZJR1VSQUJMRVMgLSBTVEFSVFxuICAgKlxuICAgKi9cblxuICBsZXQgcHZ0TG9nZ2VyID0ge1xuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlICovXG4gICAgbG9nOiAoLi4uYXJncykgPT4gYXJncy5mb3JFYWNoKGwgPT4gY29uc29sZS5sb2cobC5tZXNzYWdlIHx8IGwpKSxcblxuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlICovXG4gICAgbG9nRXJyb3I6ICguLi5hcmdzKSA9PiBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmVycm9yKGwubWVzc2FnZSB8fCBsKSksXG5cbiAgICBsb2dXYXJuaW5nOiAoLi4uYXJncykgPT5cbiAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlICovXG4gICAgICBhcmdzLmZvckVhY2gobCA9PiBjb25zb2xlLmVycm9yKGBXQVJOSU5HOiAke2wubWVzc2FnZSB8fCBsfWApKVxuICB9O1xuXG4gIC8qIGxvZ3MgYXJlIG9mZiBieSBkZWZhdWx0ICovXG4gIGlmIChzZXR0aW5ncy5ERUJVRyAhPT0gdHJ1ZSkge1xuICAgIHB2dExvZ2dlci5sb2cgPSAoKSA9PiB7fTtcbiAgICBwdnRMb2dnZXIubG9nRXJyb3IgPSAoKSA9PiB7fTtcbiAgICBwdnRMb2dnZXIubG9nV2FybmluZyA9ICgpID0+IHt9O1xuICB9XG5cbiAgbGV0IG9uUmV0dXJuT2JqZWN0ID0gYXJncyA9PiBhcmdzO1xuICBjb25zdCBvblJlcGx5ID0gKC4uLmFyZ3MpID0+IG9uUmV0dXJuT2JqZWN0KC4uLmFyZ3MpO1xuXG4gIGxldCBvbkNhdGNoID0gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBbZV0gPSBhcmdzO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChlW1NZTUJPTF9FUlJfVFlQRV0gPT09IHRydWUpIHtcbiAgICAgICAgLy8gaWYgKGVbU1lNQk9MX1NIT1JUX0NJUkNVSVRfVFlQRV0gPT09IFwicmVwbHlcIikge1xuICAgICAgICAvLyAgIHJldHVybiBvblJlcGx5KEpTT04ucGFyc2UoZS5tZXNzYWdlKSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgcmV0dXJuIG9uUmV0dXJuT2JqZWN0KEpTT04ucGFyc2UoZS5tZXNzYWdlKSk7XG4gICAgICB9XG5cbiAgICAgIHB2dExvZ2dlci5sb2dFcnJvcihlKTtcblxuICAgICAgcmV0dXJuIG9uUmV0dXJuT2JqZWN0KHtcbiAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICBib2R5OiBgJHtlLm1lc3NhZ2V9YFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgcHZ0TG9nZ2VyLmxvZ0Vycm9yKHBhcnNlRXJyb3IpO1xuXG4gICAgICByZXR1cm4gb25SZXR1cm5PYmplY3Qoe1xuICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgIGJvZHk6IGAke3BhcnNlRXJyb3IubWVzc2FnZX0gLSAke2UgJiYgZS5tZXNzYWdlID8gZS5tZXNzYWdlIDogXCJcIn1gXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgbGV0IGhhbmRsZXJDYWxsV3JhcHBlciA9ICguLi5hcmdzKSA9PiB7XG4gICAgcmV0dXJuIGhhbmRsZXIoLi4uYXJncyk7XG4gIH07XG5cbiAgLyoqXG4gICAqXG4gICAqIENPTkZJR1VSQUJMRVMgLSBFTkRcbiAgICpcbiAgICogKi9cblxuICBjb25zdCBjb25maWd1cmUgPSAoeyBhdWdtZW50TWV0aG9kcyA9IHt9IH0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZ3VyYWJsZU1ldGhvZHMgPSBbXG4gICAgICBcIm9uQ2F0Y2hcIixcbiAgICAgIFwib25SZXR1cm5PYmplY3RcIixcbiAgICAgIFwiaGFuZGxlckNhbGxXcmFwcGVyXCIsXG4gICAgICBcInB2dExvZ2dlclwiXG4gICAgXTtcblxuICAgIGNvbmZpZ3VyYWJsZU1ldGhvZHMuZm9yRWFjaChmbk5hbWUgPT4ge1xuICAgICAgY29uc3QgbmV3TWV0aG9kID0gYXVnbWVudE1ldGhvZHNbZm5OYW1lXTtcbiAgICAgIGlmICh0eXBlb2YgbmV3TWV0aG9kID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGZuTmFtZSA9PT0gXCJvblJldHVybk9iamVjdFwiKSB7XG4gICAgICAgICAgY29uc3Qgb2xkTWV0aG9kID0gb25SZXR1cm5PYmplY3Q7XG4gICAgICAgICAgb25SZXR1cm5PYmplY3QgPSAoYXJnMSwgcGFyYW1zKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3TWV0aG9kKCgpID0+IG9sZE1ldGhvZChhcmcxKSwge1xuICAgICAgICAgICAgICBwcmV2UmF3TWV0aG9kOiBvbGRNZXRob2QsXG4gICAgICAgICAgICAgIGFyZzogYXJnMSxcbiAgICAgICAgICAgICAgLi4ucGFyYW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gXCJvbkNhdGNoXCIpIHtcbiAgICAgICAgICBjb25zdCBvbGRNZXRob2QgPSBvbkNhdGNoO1xuICAgICAgICAgIG9uQ2F0Y2ggPSAoYXJnMSwgcGFyYW1zKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3TWV0aG9kKCgpID0+IG9sZE1ldGhvZChhcmcxKSwge1xuICAgICAgICAgICAgICBwcmV2UmF3TWV0aG9kOiBvbGRNZXRob2QsXG4gICAgICAgICAgICAgIGFyZzogYXJnMSxcbiAgICAgICAgICAgICAgLi4ucGFyYW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gXCJoYW5kbGVyQ2FsbFdyYXBwZXJcIikge1xuICAgICAgICAgIGNvbnN0IG9sZE1ldGhvZCA9IGhhbmRsZXJDYWxsV3JhcHBlcjtcbiAgICAgICAgICBoYW5kbGVyQ2FsbFdyYXBwZXIgPSBlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGUpLCB7XG4gICAgICAgICAgICAgIHByZXZSYXdNZXRob2Q6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gXCJwdnRMb2dnZXJcIikge1xuICAgICAgICAgIGNvbnN0IG9sZE1ldGhvZCA9IHB2dExvZ2dlcjtcbiAgICAgICAgICBwdnRMb2dnZXIgPSBlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXdNZXRob2QoKCkgPT4gb2xkTWV0aG9kKGUpLCB7XG4gICAgICAgICAgICAgIHByZXZSYXdNZXRob2Q6IG9sZE1ldGhvZCxcbiAgICAgICAgICAgICAgYXJnOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLyogaW5pdCBjb25maWd1cmFibGVzICovXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY29uZmlndXJlKSB7XG4gICAgY29uZmlndXJlKG9wdGlvbnMuY29uZmlndXJlKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBDT1JFIC0gU1RBUlRcbiAgICpcbiAgICogKi9cblxuICAvKiBGdW5jdGlvbiBPYmplY3QgSW5pdCBcIkJlZm9yZSBIb29rXCIgKi9cbiAgY29uc3QgRk9Jbml0QmVmb3JlSG9vayA9ICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKGlzSGFuZGxlckZlZCA9PT0gdHJ1ZSkge1xuICAgICAgaGFuZGxlckxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcHZ0TG9nZ2VyLmxvZ1dhcm5pbmcoYFwidW5kZWZpbmVkXCIgaXMgcHJvYmFibHkgbm90IGV4cGVjdGVkIGhlcmUuYCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmdzWzBdICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGlmIChoYW5kbGVyTGVuZ3RoID4gLTEgJiYgaGFuZGxlckxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgcHZ0TG9nZ2VyLmxvZ1dhcm5pbmcoXG4gICAgICAgICAgYERpc3BhdGNoaW5nIHdpdGggJHtcbiAgICAgICAgICAgIGFyZ3MubGVuZ3RoXG4gICAgICAgICAgfSBhcmdzIHdoaWxlIHRoZSBvcmlnaW5hbCBoYW5kbGVyIGhhcyAke2hhbmRsZXJMZW5ndGh9LmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBGT0Rpc3BhdGNoKC4uLmFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICBpZiAoaXNIYW5kbGVyRmVkID09PSB0cnVlICYmIGFyZ3NbMF1bU1lNQk9MX01JRERMRVdBUkVfSURdICE9PSB0cnVlKSB7XG4gICAgICAvKiB0aGVuIHdlIGFzc3VtZSB0aGlzIHNjZW5hcmlvIGNhbGxzIGZvciBhIG5ldyBpbnN0YW5jZSAqL1xuICAgICAgcmV0dXJuIENyZWF0ZUluc3RhbmNlKG9wdGlvbnMpKGFyZ3NbMF0pO1xuICAgIH1cblxuICAgIFtoYW5kbGVyXSA9IGFyZ3M7XG5cbiAgICBpc0hhbmRsZXJGZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIEZPRGlzcGF0Y2g7XG4gIH07XG5cbiAgRk9Jbml0QmVmb3JlSG9vay51c2UgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmICghYXJncyB8fCAhYXJnc1swXSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGAudXNlIGV4cGVjdHMgYW4gaW5zdGFuY2UgZnJvbSBCYXNlTWlkZGxld2FyZS4gKEdvdCB0eXBlIFwiJHt0eXBlb2YgYXJnc1swXX1cIilgXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc0hhbmRsZXJGZWQgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcIkEgaGFuZGxlciBuZWVkcyB0byBiZSBmZWQgZmlyc3QgYmVmb3JlIGNhbGxpbmcgLnVzZVwiKTtcbiAgICB9XG5cbiAgICBpZiAoYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICBwdnRMb2dnZXIubG9nV2FybmluZyhcbiAgICAgICAgYElnbm9yaW5nIDJuZCBhcmd1bWVudC4gXCJ1c2VcIiBtZXRob2Qgd2FzIGNhbGxlZCB3aXRoIG1vcmUgdGhhbiAxIGFyZ3VtZW50LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChwdnREaXNwYXRjaGVkID09PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgXCJVc2luZyBtaWRkbGV3YXJlcyBhZ2FpbiBhZnRlciBoYW5kbGVyJ3MgaW52b2NhdGlvbiBpcyBub3QgYWxsb3dlZC5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBtaWRkbGV3YXJlID0gYXJnc1swXTtcblxuICAgIGlmIChtaWRkbGV3YXJlW1NZTUJPTF9NSURETEVXQVJFX0lEXSA9PT0gdHJ1ZSkge1xuICAgICAgc3RhY2tlZEhvb2tzLnB1c2gobWlkZGxld2FyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBcIlVua25vd24gbWlkZGxld2FyZS4gTWlkZGxld2FyZXMgbXVzdCBleHRlbmQgQmFzZU1pZGRsZXdhcmUuXCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEZPSW5pdEJlZm9yZUhvb2s7XG4gIH07XG5cbiAgRk9Jbml0QmVmb3JlSG9vay5zZXRMb2dnZXIgPSBuZXdMb2dnZXIgPT4ge1xuICAgIHB2dExvZ2dlciA9IG5ld0xvZ2dlcjtcbiAgfTtcblxuICBGT0luaXRCZWZvcmVIb29rLmdldExvZ2dlciA9ICgpID0+IHB2dExvZ2dlcjtcblxuICBGT0Rpc3BhdGNoID0gYXN5bmMgKC4uLmFyZ3MpID0+IHtcbiAgICBsZXQgaG9va0JlZm9yZUNhdGNoaW5nID0ge307XG4gICAgcHZ0RGlzcGF0Y2hlZCA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG4gICAgICBmb3IgKGNvbnN0IGhvb2sgb2Ygc3RhY2tlZEhvb2tzKSB7XG4gICAgICAgIGhvb2tCZWZvcmVDYXRjaGluZyA9IGhvb2s7XG5cbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3AgKi9cbiAgICAgICAgYXdhaXQgaG9vayguLi5hcmdzKTtcbiAgICAgICAgLy8gY29uc3QgZXh0ZW5zaW9ucyA9IGF3YWl0IGhvb2soLi4uYXJncyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAobWlkZGxld2FyZXNUaHJvdykge1xuICAgICAgaWYgKG1pZGRsZXdhcmVzVGhyb3dbU1lNQk9MX1NIT1JUX0NJUkNVSVRfVFlQRV0gPT09IFwicmVwbHlcIikge1xuICAgICAgICBpZiAoc2V0dGluZ3Muc3RvcE9uQ2F0Y2ggPT09IHRydWUpIHtcbiAgICAgICAgICByZXR1cm4gb25SZXBseShKU09OLnBhcnNlKG1pZGRsZXdhcmVzVGhyb3cubWVzc2FnZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhdGNoSGFuZGxlclRvVXNlID1cbiAgICAgICAgdHlwZW9mIGhvb2tCZWZvcmVDYXRjaGluZy5zY3J0T25DYXRjaCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyAoZXJyLCBwYXJhbXMpID0+XG4gICAgICAgICAgICAgIGhvb2tCZWZvcmVDYXRjaGluZy5zY3J0T25DYXRjaChlID0+IG9uQ2F0Y2goZSwgcGFyYW1zKSwgZXJyKVxuICAgICAgICAgIDogKGVyciwgcGFyYW1zKSA9PiBvbkNhdGNoKGVyciwgcGFyYW1zKTtcbiAgICAgIGlmIChzZXR0aW5ncy5zdG9wT25DYXRjaCA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gY2F0Y2hIYW5kbGVyVG9Vc2UobWlkZGxld2FyZXNUaHJvdywge1xuICAgICAgICAgIGdldFBhcmFtczogKCkgPT4gYXJnc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNhdGNoSGFuZGxlclRvVXNlKG1pZGRsZXdhcmVzVGhyb3csIHtcbiAgICAgICAgZ2V0UGFyYW1zOiAoKSA9PiBhcmdzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFuZGxlckNhbGxXcmFwcGVyKC4uLmFyZ3MpO1xuICB9O1xuXG4gIC8qIGNvcHkgcHJvcGVydGllcyBvZiBGT0luaXRCZWZvcmVIb29rIHRvIEZPRGlzcGF0Y2ggLSBzbyB3ZSBjYW4gY2hhaW4gLnVzZSBhbmQgZXRjICovXG4gIE9iamVjdC5rZXlzKEZPSW5pdEJlZm9yZUhvb2spLmZvckVhY2gobWV0aG9kID0+IHtcbiAgICBGT0Rpc3BhdGNoW21ldGhvZF0gPSBGT0luaXRCZWZvcmVIb29rW21ldGhvZF07XG4gIH0pO1xuXG4gIC8qKlxuICAgKlxuICAgKiBDT1JFIC0gRU5EXG4gICAqXG4gICAqICovXG5cbiAgcmV0dXJuIEZPSW5pdEJlZm9yZUhvb2s7XG59O1xuXG5leHBvcnQgeyBCYXNlTWlkZGxld2FyZSwgQm9keVBhcnNlck1pZGRsZXdhcmUsIENyZWF0ZUluc3RhbmNlIH07XG5cbmV4cG9ydCBkZWZhdWx0IENyZWF0ZUluc3RhbmNlO1xuIl19
