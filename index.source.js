const MIDDLEWARE_PREFIX = "BEFORE_HOOK_";
const MIDDLEWARE_CONSTANTS = {
  HTTP_RESPONSE: `${MIDDLEWARE_PREFIX}HTTP_RESPONSE`
};

/* const isAsyncFunction = fn => {
  return fn.constructor.name === "AsyncFunction";
}; */

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

const getHandlerArgumentsLength = handler => {
  let result = -1;
  try {
    if (typeof handler !== "function")
      throw Error(`Handler must be a function. type '${typeof handler}'`);

    const def = handler.toString();
    const removeCommentsRegex = new RegExp(
      /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm
    );
    const noSpaceAndComments = def
      .replace(removeCommentsRegex, "")
      .replace(new RegExp("(\\s|\\n)", "g"), "");

    const commasRegExp = new RegExp(`\\,`, "g");

    const match = noSpaceAndComments.match(commasRegExp);
    if (!match) {
      result = noSpaceAndComments.indexOf("()") > -1 ? 0 : 1;
    } else {
      result = match.length + 1;
    }
  } catch (e) {
    console.error(`__getArgumentsLength__. ${e.message}`);
  }

  return result;
};

const validateHandler = handler => {
  if (typeof handler !== "function")
    throw TypeError(
      `Handler must be a function${typeof handler} ${Object.keys(
        handler
      ).reduce((acc, cur) => `${acc} ${cur}`, "")}`
    );

  const count = getHandlerArgumentsLength(handler);
  return count >= 0 || count <= 1;
};

const readError = e => {
  let isMiddlewareHTTPResponse = false;
  try {
    const objError =
      typeof e.message === "object" ? e.message : JSON.parse(e.message);

    isMiddlewareHTTPResponse =
      objError.type === MIDDLEWARE_CONSTANTS.HTTP_RESPONSE;

    const { responseObject } = objError;
    if (typeof responseObject === "undefined") {
      throw Error(`Invalid custom "responseObject"`);
    }

    return {
      e,
      isMiddlewareHTTPResponse,
      responseObject
    };
  } catch (err) {
    return { e, err, errorMessage: `${e.message} - ${err.message}` };
  }
};

const MiddlewareHelpersInit = () => {
  const pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l))
  };

  const returnAndSendResponse = obj => {
    let stringErr = "";
    try {
      const errorObj = {
        type: MIDDLEWARE_CONSTANTS.HTTP_RESPONSE,
        responseObject: obj
      };
      stringErr = JSON.stringify({ ...errorObj });
    } catch (e) {
      if (pvtLogger && typeof pvtLogger.logError === "function") {
        pvtLogger.logError(e);
      }
      throw e;
    }

    throw Error(stringErr);
  };

  return () => ({
    returnAndSendResponse,
    getLogger: () => pvtLogger
  });
};

const setState = (objs, state) => {
  const newState = state;

  Object.keys(objs).forEach(key => {
    newState[key] = objs[key];
  });

  return newState;
};
const setContext = setState;
const simpleClone = objectToClone =>
  /* JSON.parse(JSON.stringify( */ objectToClone; /* )) */
const clone = simpleClone;

const BaseMiddlewareHandlerInit = handler => {
  const fn = async (event, context) => {
    const pvtEvent = event ? clone(event) : "";
    const pvtContext = context ? clone(context) : "";

    await handler(
      {
        getParams: () => ({
          event: pvtEvent,
          setEvent: objs => setState(objs, pvtEvent),
          context: pvtContext,
          setContext: objs => setContext(objs, pvtContext)
        }),
        getHelpers: MiddlewareHelpersInit()
      },
      {}
    );

    return {
      event: pvtEvent,
      context: pvtContext
    };
  };

  return fn;
};

const BaseMiddleware = ({ handler, configure } = {}) => {
  if (!(typeof handler === "function")) {
    throw Error(`Custom middlewares must define a "handler"`);
  }

  let pre = async () => {};
  pre = BaseMiddlewareHandlerInit(handler);

  pre.isHookMiddleware = true;

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
      const { event, setEvent } = getParams();
      if (Object.keys({ ...event.body }).length) {
        setEvent({ body: JSON.parse(event.body) });
      }
    }
  });
};

const CreateInstance = options => {
  let settings = {
    DEBUG: false,
    stopOnCatch: true,
    silent: false
  };

  settings = objectAssignIfExists({}, settings, options);

  let pvtDispatched = false;
  const stackedHooks = [];
  let isHandlerFed = false;

  let handler = async () => {};
  let FOInvokeMiddlewares = async () => {};

  /**
   *
   * CONFIGURABLES - START
   *
   * */

  let pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l)),

    logWarning: (...args) =>
      /* eslint-disable-next-line no-console */
      args.forEach(l => console.error(`WARNING: ${l.message || l}`))
  };

  if (settings.DEBUG !== true || settings.silent === true) {
    pvtLogger.log = () => {};
    pvtLogger.logError = () => {};
    pvtLogger.logWarning = () => {};
  }

  let onCatch = (...args) => {
    const [e] = args;

    if (pvtLogger && typeof pvtLogger.logError === "function") {
      pvtLogger.logError(e);
    }

    const read = readError(e);
    if (read.isMiddlewareHTTPResponse === true) {
      return read.responseObject;
    }

    return {
      statusCode: 500,
      body: `${read.errorMessage}`
    };
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
          onCatch = (arg1, { event, context }) => {
            return newMethod(() => oldMethod(arg1), {
              prevRawMethod: oldMethod,
              arg: arg1,
              event,
              context
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

  /** Function Object Init "Before Hook" * */
  const FOInitBeforeHook = (...args) => {
    if (typeof args[0] !== "function") {
      return FOInvokeMiddlewares(...args);
    }

    if (isHandlerFed === false && validateHandler(args[0]) === false) {
      throw Error(
        `DEPRECATED - Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`
      );
    }

    if (isHandlerFed === true && args[0].isHookMiddleware !== true) {
      /* then we assume this scenario calls for a new instance */
      return CreateInstance(options)(args[0]);
    }

    [handler] = args;

    isHandlerFed = true;

    return FOInvokeMiddlewares;
  };

  FOInitBeforeHook.use = (...args) => {
    const middleware = args[0];
    if (isHandlerFed === false) {
      throw Error("A handler needs to be fed first before calling .use");
    }
    if (args.length > 1) {
      if (pvtLogger && typeof pvtLogger.logWarning === "function") {
        pvtLogger.logWarning(
          `Ignoring 2nd argument. "use" method was called with more than 1 argument.`
        );
      }
    }
    if (pvtDispatched === true) {
      throw Error(
        "Using middlewares again after handler's invocation is not allowed."
      );
    }

    if (middleware.isHookMiddleware === true) {
      stackedHooks.push(middleware);
    } else {
      throw Error(
        "Unknown middlewares are not yet supported. Please extend `Base` middleware instead."
      );
    }

    return FOInitBeforeHook;
  };

  FOInitBeforeHook.setLogger = newLogger => {
    pvtLogger = newLogger;
  };

  FOInitBeforeHook.getLogger = () => pvtLogger;

  FOInvokeMiddlewares = async (event, context) => {
    let extendedEvent = event;
    let extendedContext = context;
    let hookBeforeCatching = {};
    pvtDispatched = true;

    try {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const hook of stackedHooks) {
        hookBeforeCatching = hook;
        /* eslint-disable-next-line no-await-in-loop */
        const extensions = await hook(extendedEvent, extendedContext);

        if (extensions.event) {
          extendedEvent = Object.assign({}, extendedEvent, extensions.event);
        }

        if (extensions.context) {
          extendedContext = Object.assign(
            {},
            extendedContext,
            extensions.context
          );
        }
      }
    } catch (middlewaresThrow) {
      const catchHandlerToUse =
        typeof hookBeforeCatching.scrtOnCatch === "function"
          ? (err, eventAndContext) =>
              hookBeforeCatching.scrtOnCatch(
                e => onCatch(e, eventAndContext),
                err
              )
          : (err, eventAndContext) => onCatch(err, eventAndContext);
      if (settings.stopOnCatch === true) {
        return catchHandlerToUse(middlewaresThrow, {
          event: extendedEvent,
          context: extendedContext
        });
      }
      catchHandlerToUse(middlewaresThrow, {
        event: extendedEvent,
        context: extendedContext
      });
    }

    return handlerCallWrapper(extendedEvent, extendedContext);
  };

  /* copy properties of FOInitBeforeHook to FOInvokeMiddlewares - so we can chain .use and etc */
  Object.keys(FOInitBeforeHook).forEach(method => {
    FOInvokeMiddlewares[method] = FOInitBeforeHook[method];
  });

  /**
   *
   * CORE - END
   *
   * */

  return FOInitBeforeHook;
};

export {
  MIDDLEWARE_CONSTANTS,
  BaseMiddleware,
  BodyParserMiddleware,
  CreateInstance,
  getHandlerArgumentsLength,
  validateHandler
};

export default CreateInstance;
