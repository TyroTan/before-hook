// import { CognitoDecodeVerifyJWTInit } from "./cognito-decode-verify-token-test-only";
// const jwtdecodeAsyncHandler = CognitoDecodeVerifyJWTInit({
//   jwt_decode: require("jwt-decode")
// }).UNSAFE_BUT_FAST_handler;

// const NOOP = () => {};
const MIDDLEWARE_PREFIX = "CUSTOM_MIDDLEWARE_";
const TYPE_CUSTOM_MIDDLEWARE = `${MIDDLEWARE_PREFIX}type_custom_middleware`;
const MIDDLEWARE_CONSTANTS = {
  GENERIC: 500,
  HTTP_RESPONSE: `${MIDDLEWARE_PREFIX}HTTP_RESPONSE`
};

const isAsyncFunction = fn => {
  return fn.constructor.name === "AsyncFunction";
};

const objectAssignIfExists = (...args) => {
  let def = { ...args[1] };
  const overrideIfExist = { ...args[2] };
  Object.keys(def).forEach(k => {
    if (overrideIfExist.hasOwnProperty(k)) {
      def[k] = overrideIfExist[k];
    }
  });

  return { ...args[0], ...def };
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
  // const removeCommentsRegex = new RegExp(
  // /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm
  // );
  // const def = handler.toString();

  const count = getHandlerArgumentsLength(handler);
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
};

// const tss = ({ eventAugment, contextAugment }) => {
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
const readError = e => {
  let isMiddlewareHTTPResponse = false;
  try {
    const obj = JSON.parse(e.message);
    isMiddlewareHTTPResponse = obj.type === MIDDLEWARE_CONSTANTS.HTTP_RESPONSE;

    obj.body = obj.message;

    return {
      e,
      isMiddlewareHTTPResponse,
      data: obj
    };
  } catch (err) {
    return { e, err };
  }
};

const MiddlewareHelpersInit = () => {
  const pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l))
  };

  const responseObjectToThrow = obj => {
    let stringErr = "";
    try {
      const err = {
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

  return () => ({
    responseObjectToThrow,
    MIDDLEWARE_CONSTANTS,
    getLogger: () => pvtLogger
  });
};

const setState = (objs, state) => {
  const newState = state;

  // console.log("state", state);
  Object.keys(objs).forEach(key => {
    newState[key] = objs[key];
  });

  // console.log("new state", newState);
  return newState;
};
const setContext = setState;
const simpleClone = objectToClone => JSON.parse(JSON.stringify(objectToClone));
const clone = simpleClone;

const BaseHookHandlerInit = handler => {
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
        })
      },
      { getHelpers: MiddlewareHelpersInit() }
    );

    return {
      event: pvtEvent,
      context: pvtContext
    };
  };

  return fn;
};

const BaseHook = ({
  eventAugment,
  contextAugment,
  handler,
  configure
}) => {
  if (
    !(
      typeof eventAugment === "function" ||
      typeof contextAugment === "function" ||
      typeof handler === "function"
    )
  ) {
    throw Error(
      "Custom middlewares must define one of eventAugment|contextAugment|handler"
    );
  }

  let pre = async () => {};
  if (handler) {
    pre = BaseHookHandlerInit(handler);
  } else {
    // to be deprecated by 'handler'
    pre = async (event, context) => {
      const extensions = {};
      if (eventAugment) {
        extensions.event = await eventAugment(event, context);
      }
      if (contextAugment) {
        extensions.context = await contextAugment(event, context);
      }

      // callback ... TODO

      return extensions;
    };
  }
  
  pre.isCustomMiddleware = true;

  return pre;
};

const BodyParserMiddleware = () => {
  return BaseHook({
    handler: async ({ getParams }) => {
      const { event, setEvent } = getParams();
      if (!event.body) return;
      setEvent({ body: JSON.parse(event.body) });
    }
  });
};

const AuthMiddleware = ({ promisify, cognitoJWTDecodeHandler } = {}) => {
  if (
    (promisify && typeof promisify !== "function") ||
    (cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function")
  ) {
    throw Error(
      `invalid (promisify and cognitoJWTDecodeHandler) passed. ${typeof promisify},  ${typeof cognitoJWTDecodeHandler}`
    );
  }

  return BaseHook({
    handler: async ({ getParams }, { getHelpers }) => {
      const { event, setEvent, context } = getParams();
      const { responseObjectToThrow } = getHelpers();
      const { HTTP_RESPONSE } = MIDDLEWARE_CONSTANTS;

      if (!event || !event.headers) return {};

      const newEventHeaders = {
        ...event.headers
      };

      if (!newEventHeaders.Authorization) {
        newEventHeaders.Authorization = newEventHeaders.authorization;
      }

      let promised = cognitoJWTDecodeHandler;
      if (!isAsyncFunction(promised)) {
        promised = promisify(promised);
      }

      try {
        const claims = await promised(
          Object.assign({}, event, { headers: newEventHeaders }),
          context
        );

        if (!claims || typeof claims.sub !== "string") {
          throw Error(claims);
        }

        setEvent({ user: claims });
      } catch (e) {
        responseObjectToThrow({
          type: HTTP_RESPONSE,
          statusCode: 403,
          message: `Invalid token passed hereez`
        });
      }

      return {};
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
  const stackedHandlerAsyncFunction = [];
  let isHandlerFed = false;

  /**
   *
   * CORE - START
   *
   **/

  let handler = async () => {};
  let FOInvokeMiddlewares = async () => {};

  /** Function Object Init Pre-Hook **/
  const FOInitPreHook = (...args) => {
    if (typeof args[0] !== "function") {
      return FOInvokeMiddlewares(...args);
    }

    [handler] = args;

    if (isHandlerFed === false && validateHandler(handler) === false) {
      throw Error(
        `DEPRECATED - Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`
      );
    }

    if (isHandlerFed === true && handler.isCustomMiddleware !== true) {
      /* then we assume this scenario calls for a new instance */
      return CreateInstance(options)(handler);
    }

    isHandlerFed = true;

    return FOInvokeMiddlewares;
  };

  FOInitPreHook.use = (...args) => {
    const params = args[0];
    if (isHandlerFed === false) {
      throw Error("A handler needs to be fed first before calling .use");
    }
    if (args.length > 1) {
      if (pvtLogger && typeof pvtLogger.logWarning === "function") {
        pvtLogger.logWarning(`.use only supports 1 param at the moment.`);
      }
    }
    if (pvtDispatched === true) {
      throw Error(
        "Using middlewares again after handler's invocation is not allowed."
      );
    }
    
    if (
      params.isCustomMiddleware === true
    ) {
      stackedHandlerAsyncFunction.push(params);
    } else {
      throw Error("Unknown middlewares are not yet supported.");
    }

    return FOInitPreHook;
  };

  FOInitPreHook.setLogger = newLogger => {
    pvtLogger = newLogger;
  };

  FOInitPreHook.getLogger = () => pvtLogger;

  FOInvokeMiddlewares = async (event, context) => {
    let extendedEvent = event;
    let extendedContext = context;
    pvtDispatched = true;

    try {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const fnAsyncFunction of stackedHandlerAsyncFunction) {
        /* eslint-disable-next-line no-await-in-loop */
        const extensions = await fnAsyncFunction(
          extendedEvent,
          extendedContext
        );

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
    } catch (e) {
      if (settings.stopOnCatch === true) {
        return onCatchHandler(e);
      }
    }

    return handlerCallWrapper(extendedEvent, extendedContext);
  };

  /* copy properties of FOInitPreHook to FOInvokeMiddlewares - so we can chain .use and etc */
  Object.keys(FOInitPreHook).forEach(method => {
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

  let pvtLogger = {
    /* eslint-disable-next-line no-console */
    log: (...args) => args.forEach(l => console.log(l.message || l)),

    /* eslint-disable-next-line no-console */
    logError: (...args) => args.forEach(l => console.error(l.message || l)),

    /* eslint-disable-next-line no-console */
    logWarning: (...args) => args.forEach(l => console.warning(l.message || l))
  };

  if (settings.DEBUG !== true || settings.silent === true) {
    (pvtLogger.log = () => {}),
      (pvtLogger.logError = () => {}),
      (pvtLogger.logWarning = () => {});
  }

  let onCatchHandler = e => {
    if (pvtLogger && typeof pvtLogger.logError === "function") {
      pvtLogger.logError(e);
    }

    const read = readError(e);
    if (read.isMiddlewareHTTPResponse === true && read.data) {
      return {
        statusCode: 500,
        body: `${read.data.message}`
      };
    } else {
      return {
        statusCode: 500,
        body: `${e.message}`
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
   **/

  let configure = ({ augmentMethods = {} } = {}) => {
    const configurableMethods = [
      "onCatchHandler",
      "handlerCallWrapper",
      "pvtLogger"
    ];

    configurableMethods.forEach(fnName => {
      const method = augmentMethods[fnName];
      if (typeof method === "function") {
        if (fnName === "onCatchHandler") {
          const oldMethod = onCatchHandler;
          onCatchHandler = (...args) => {
            return method(oldMethod, ...args);
          };
        } else if (fnName === "handlerCallWrapper") {
          const oldMethod = handlerCallWrapper;
          handlerCallWrapper = (...args) => {
            return method(oldMethod, ...args);
          };
        } else if (fnName === "pvtLogger") {
          const oldMethod = pvtLogger;
          pvtLogger = (...args) => {
            return method(oldMethod, ...args);
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

export {
  TYPE_CUSTOM_MIDDLEWARE,
  MIDDLEWARE_CONSTANTS,
  BaseHook,
  BodyParserMiddleware,
  AuthMiddleware,
  CreateInstance,
  getHandlerArgumentsLength,
  validateHandler
};
export default CreateInstance;
