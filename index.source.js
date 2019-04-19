const SYMBOL_ERR_TYPE = Symbol("SYMBOL_ERR_TYPE");
const SYMBOL_BEFOREHOOK_MIDDLEWARE_ID = Symbol(
  "SYMBOL_BEFOREHOOK_MIDDLEWARE_ID"
);

const objectAssignIfExists = (...args) => {
  const def = { ...args[1] };
  const overrideIfExist = { ...args[2] };
  Object.keys(def).forEach(k => {
    if (overrideIfExist[k]) {
      def[k] = overrideIfExist[k];
    }
  });

  return { ...args[0], ...def };
};

const MiddlewareHelpersInit = () => {
  const pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l))
  };

  const returnAndSendResponse = obj => {
    /* eslint-disable-next-line no-param-reassign */
    const customError = Error(JSON.stringify(obj));
    customError[SYMBOL_ERR_TYPE] = true;

    throw customError;
  };

  return () => ({
    returnAndSendResponse,
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
    await handler(
      {
        getParams: () => args,
        getHelpers: MiddlewareHelpersInit()
      },
      {}
    );

    return args;
  };

  return dispatchFn;
};

const BaseMiddleware = ({ handler, configure } = {}) => {
  if (!(typeof handler === "function")) {
    throw Error(`Custom middlewares must define a "handler"`);
  }

  let pre = async () => {};
  pre = BaseMiddlewareHandlerInit(handler);

  pre[SYMBOL_BEFOREHOOK_MIDDLEWARE_ID] = true;

  if (configure && configure.augmentMethods) {
    const { augmentMethods = {} } = configure;
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

const BodyParserMiddleware = () => {
  return BaseMiddleware({
    handler: async ({ getParams }) => {
      const [event] = getParams();
      if (Object.keys({ ...event.body }).length) {
        event.body = JSON.parse(event.body);
      }
    }
  });
};

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

  let onCatch = (...args) => {
    const [e] = args;

    try {
      if (e[SYMBOL_ERR_TYPE] === true) {
        return JSON.parse(e.message);
      }

      pvtLogger.logError(e);

      return {
        statusCode: 500,
        body: `${e.message}`
      };
    } catch (parseError) {
      pvtLogger.logError(parseError);

      return {
        statusCode: 500,
        body: `${parseError.message} - ${e && e.message ? e.message : ""}`
      };
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

  const configure = ({ augmentMethods = {} } = {}) => {
    const configurableMethods = ["onCatch", "handlerCallWrapper", "pvtLogger"];

    configurableMethods.forEach(fnName => {
      const newMethod = augmentMethods[fnName];
      if (typeof newMethod === "function") {
        if (fnName === "onCatch") {
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

    if (typeof args[0] !== "function") {
      if (handlerLength > -1 && handlerLength !== args.length) {
        pvtLogger.logWarning(
          `Dispatching with ${
            args.length
          } args while the original handler has ${handlerLength}.`
        );
      }
      return FODispatch(...args);
    }

    /* if (isHandlerFed === false && validateHandler(args[0]) === false) {
      throw Error(
        `DEPRECATED - Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`
      );
    } */

    if (
      isHandlerFed === true &&
      args[0][SYMBOL_BEFOREHOOK_MIDDLEWARE_ID] !== true
    ) {
      /* then we assume this scenario calls for a new instance */
      return CreateInstance(options)(args[0]);
    }

    [handler] = args;

    isHandlerFed = true;

    return FODispatch;
  };

  FOInitBeforeHook.use = (...args) => {
    if (isHandlerFed === false) {
      throw Error("A handler needs to be fed first before calling .use");
    }
    if (args.length > 1) {
      pvtLogger.logWarning(
        `Ignoring 2nd argument. "use" method was called with more than 1 argument.`
      );
    }
    if (pvtDispatched === true) {
      throw Error(
        "Using middlewares again after handler's invocation is not allowed."
      );
    }

    const middleware = args[0];

    if (middleware[SYMBOL_BEFOREHOOK_MIDDLEWARE_ID] === true) {
      stackedHooks.push(middleware);
    } else {
      throw Error(
        "Unknown middleware. Middlewares must extend BaseMiddleware."
      );
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
        await hook(...args);
        // const extensions = await hook(...args);
      }
    } catch (middlewaresThrow) {
      const catchHandlerToUse =
        typeof hookBeforeCatching.scrtOnCatch === "function"
          ? (err, params) =>
              hookBeforeCatching.scrtOnCatch(e => onCatch(e, params), err)
          : (err, params) => onCatch(err, params);
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

export { BaseMiddleware, BodyParserMiddleware, CreateInstance };

export default CreateInstance;
