const CognitoDecodeVerifyJWTInit = require("./token-decode-test");

const jwt_decode = require("jwt-decode");
const jwtdecodeAsyncHandler = CognitoDecodeVerifyJWTInit({
  jwt_decode
}).UNSAFE_BUT_FAST_handler;
import { promisify } from "util";

const mockedExpressResponse = () => {
  return {
    send: (code, data) => ({
      statusCode: code,
      data
    }),
    json: data => {
      return { ...data, resJsoned: true };
    }
  };
};

import {
  CreateInstance,
  validateHandler,
  getHandlerArgumentsLength,
  BaseMiddleware,
  BodyParserMiddleware
} from "../index.js";

const isAsyncFunction = fn =>
  fn && fn.constructor && fn.constructor.name === "AsyncFunction";
const AuthMiddleware = ({ promisify, cognitoJWTDecodeHandler } = {}) => {
  if (
    (promisify && typeof promisify !== "function") ||
    (cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function")
  ) {
    throw Error(
      `invalid (promisify and cognitoJWTDecodeHandler) passed. ${typeof promisify},  ${typeof cognitoJWTDecodeHandler}`
    );
  }

  return BaseMiddleware({
    configure: {
      augmentMethods: {
        onCatch: () => {
          return {
            statusCode: 403,
            body: "Invalid Session",
            headers: { "Access-Control-Allow-Origin": "*" }
          };
        }
      }
    },
    handler: async ({ getParams, getHelpers }) => {
      const { event, setEvent, context } = getParams();
      const { returnAndSendResponse } = getHelpers();

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
      const claims = await promised(
        Object.assign({}, event, { headers: newEventHeaders }),
        context
      );

      if (!claims || typeof claims.sub !== "string") {
        return returnAndSendResponse({
          statusCode: 403,
          body: "Invalid Session",
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      setEvent({ user: claims });

      return {};
    }
  });
};

const test1 = {
  handler: () => {}, // params are optional
  result: 0,
  msg: `params are optional`
};

const test2 = {
  handler: event => {},
  result: 1,
  msg: `params are optional`
};

const test3 = {
  handler: e => {},
  result: 1,
  msg: `1st param need to be event and not e`
};

const test4 = {
  handler: events => {},
  result: 1,
  msg: `1st param need to be event and not events`
};

const test5 = {
  handler: (event, context) => {},
  result: 2,
  msg: `params are optional`
};

const test6 = {
  handler: (event, context123) => {},
  result: 2,
  msg: `2nd param need to be context and not context123`
};

const test7 = {
  handler: (event, context, callback) => {},
  result: 3,
  msg: `params are optional`
};

const test8 = {
  handler: (event, context, callbac) => {},
  result: 3,
  msg: `3rd param need to be callback and not callbac`
};

describe(`getHandlerArgumentsLength`, () => {
  describe(`test getHandlerArgumentsLength correctness`, () => {
    it(`should accept ~ ${test1.msg} = ${
      test1.result
    } length. ${test1.handler.toString()}`, () => {
      const handler = test1.handler;
      expect(getHandlerArgumentsLength(handler)).toEqual(test1.result);
    });

    it(`should accept ~ ${test2.msg} = ${
      test2.result
    } length. ${test2.handler.toString()}`, () => {
      const handler = test2.handler;
      expect(getHandlerArgumentsLength(handler)).toEqual(test2.result);
    });

    it(`should accept ~ ${test5.msg} = ${
      test5.result
    } length. ${test5.handler.toString()}`, () => {
      const handler = test5.handler;
      expect(getHandlerArgumentsLength(handler)).toEqual(test5.result);
    });

    it(`should accept ~ ${test7.msg} = ${
      test7.result
    } length. ${test7.handler.toString()}`, () => {
      const handler = test7.handler;
      expect(getHandlerArgumentsLength(handler)).toEqual(test7.result);
    });
  });

  describe.skip(`test validateHandler INVALID scenario`, () => {
    it(`should NOT accept ~ ${test3.msg} ${test3.handler.toString()}`, () => {
      const handler = test3.handler;
      expect(validateHandler(handler)).toEqual(false);
    });

    it(`should NOT accept ~ ${test4.msg} ${test4.handler.toString()}`, () => {
      const handler = test4.handler;
      expect(validateHandler(handler)).toEqual(false);
    });

    it(`should NOT accept ~ ${test6.msg} ${test6.handler.toString()}`, () => {
      const handler = test6.handler;
      expect(validateHandler(handler)).toEqual(false);
    });

    it(`should NOT accept ~ ${test8.msg} ${test8.handler.toString()}`, () => {
      const handler = test8.handler;
      expect(validateHandler(handler)).toEqual(false);
    });
  });

  describe.skip(`test validateHandler EDGE cases`, () => {
    const fn1 = (event, /* comments, */ context, callback) => {};
    it(`should accept with comments ~ ${fn1.toString()}`, () => {
      const handler = fn1;

      /* Future Feature
       * expect(validateHandler(handler)).toEqual(true);
       */
      expect(() => validateHandler(handler)).toThrow(Error);
    });

    const fn2 = (event, /* comments, */ context, Callback) => {};
    it(`should NoT accept case sensitive ~ ${fn2.toString()}`, () => {
      const handler = fn2;

      expect(validateHandler(handler)).toEqual(false);
    });

    it(`should accept const hello = (event, context) => {`, () => {
      const hello = async (event, context) => {
        return {};
      };

      console.log("hello tostr", hello.toString());
      expect(validateHandler(hello)).toEqual(true);
    });
  });
});

describe(`CreateInstance`, () => {
  let instance1 = CreateInstance();

  describe("Test errors or throws", () => {
    it("should show error message", () => {
      const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
      try {
        instance1(e => {});
      } catch (e) {
        expect(e.message).toEqual(expect.stringContaining(expected));
      }
    });
  });

  describe(".use", () => {
    beforeEach(() => {
      instance1 = CreateInstance();
    });

    it("should not throw error upon initialsation", () => {
      // const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
      // try {
      //   instance1(e => {});
      // } catch (e) {
      //   expect(e.message).toEqual(expect.stringContaining(expected));
      // }
    });

    it("should only throw exception once the handler is called", () => {
      // const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
      // try {
      //   instance1(e => {});
      // } catch (e) {
      //   expect(e.message).toEqual(expect.stringContaining(expected));
      // }
    });
  });
});

describe(`AsyncFunction support`, () => {
  describe("AsyncFunction handler", () => {
    let instance1 = CreateInstance();
    beforeAll(() => {
      instance1 = CreateInstance();
    });

    it("should be accepted", () => {
      expect(() => instance1(async () => {})).not.toThrow();
    });

    it("should not throw when handler is a basic async fn", async () => {
      const basicAsyncHandler = async (event, context) => {
        return {
          event,
          context
        };
      };

      await expect(() => instance1(basicAsyncHandler).not.toThrow());

      const asyncHandlerWithCW = instance1(basicAsyncHandler);
      const res1 = await asyncHandlerWithCW(
        {
          eventProperty1: "some value1"
        },
        {
          contextProperty1: "some value2"
        }
      );

      expect(res1.event.eventProperty1).toEqual("some value1");
      expect(res1.event.eventProperty1).not.toEqual("");
      expect(res1.context.contextProperty1).toEqual("some value2");
    });
  });

  describe("AsyncFunction handler + AsyncFunction middleware", () => {
    let instance1 = CreateInstance();
    beforeEach(() => {
      instance1 = CreateInstance();
    });

    it("should be accepted", () => {
      const inv = BaseMiddleware({
        handler: async ({ getParams }) => {
          const { event, setEvent } = getParams();
          const promisify = require("util").promisify;
          if (!event || !event.headers) return {};
          event.headers.Authorization = !event.headers.Authorization
            ? event.headers.authorization
            : event.headers.Authorization;
          const promised = promisify(jwtdecodeAsyncHandler);
          const claims = await promised(event, context);
          if (claims && claims.sub && typeof claims.sub === "string") {
            setEvent({ user: claims });
          }
        }
      });
      inv.isHookMiddleware = true;

      expect(() => {
        instance1(async () => {}).use(inv)();
      }).not.toThrow();
    });

    it("should not throw when handler is a basic async fn", async () => {
      const basicAsyncHandler = async (event, context) => {
        return {
          event,
          context
        };
      };

      await expect(() => instance1(basicAsyncHandler).not.toThrow());

      const asyncHandlerWithCW = instance1(basicAsyncHandler);
      const res1 = await asyncHandlerWithCW(
        {
          eventProperty1: "some value1"
        },
        {
          contextProperty1: "some value2"
        }
      );

      expect(res1.event.eventProperty1).toEqual("some value1");
      expect(res1.event.eventProperty1).not.toEqual("");
      expect(res1.context.contextProperty1).toEqual("some value2");
    });

    it("should work with async middleware", async () => {
      const inv = BaseMiddleware({
        handler: async ({ getParams }) => {
          return new Promise(resolve => {
            setTimeout(() => {
              const { setEvent } = getParams();

              setEvent({
                user: {
                  email: "email@example.com"
                }
              });
              resolve();
            }, 1);
          });
        }
      });

      const h = async (event, context) => {
        return {
          e: event,
          c: context
        };
      };

      const newHn = instance1(h).use(inv);
      const res1 = await newHn({
        headers: {
          Authorization: "token1"
        }
      });

      expect(res1.e.user).toBeDefined();
      expect(res1.e.user.email).toEqual("email@example.com");
    });
  });
});

describe(`Error Handling`, () => {
  let instance12 = CreateInstance();

  describe("CreateInstance", () => {
    beforeEach(() => {
      instance12 = CreateInstance({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: (prevMethodwithArgs, { prevRawMethod, arg } = {}) => {
              expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));
              return Object.assign({}, prevRawMethod(arg), {
                headers: { "Access-Control-Allow-Origin": "*" }
              });
            }
          }
        }
      });
    });

    it(`should cause the handler call to stop and return response at the middleware which invoked returnAndSendResponse`, async () => {
      const handler = async (event, context) => {
        return {
          result: 2 + event.multiplier
        };
      };

      const preHooked = instance12(handler)
        .use(
          BaseMiddleware({
            handler: async ({ getHelpers }) => {
              const { returnAndSendResponse } = getHelpers();
              if (returnAndSendResponse || !returnAndSendResponse) {
                returnAndSendResponse({
                  statusCode: 1234,
                  body: "my custom data",
                  obj: {
                    nu: 1235,
                    obj2: {
                      arr: [1, 2, 3, 333]
                    }
                  }
                });
              }
            }
          })
        )
        .use(
          BaseMiddleware({
            handler: async ({ getHelpers }) => {
              const { returnAndSendResponse } = getHelpers();
              if (returnAndSendResponse || !returnAndSendResponse) {
                returnAndSendResponse({
                  statusCode: 500,
                  body: "testt"
                });
              }
            }
          })
        );

      const res = await preHooked({
        multiplier: 1
      });

      expect(res.statusCode).toEqual(1234);
      expect(res.obj.obj2.arr.length).toEqual(4);
    });
  });

  describe("CreateInstance configure method", () => {
    beforeEach(() => {
      instance12 = CreateInstance();
    });

    it("should returnAndSendResponse by default", async () => {
      const handler = async (event, context) => {
        return {
          result: 2 + event.multiplier
        };
      };

      const preHooked = instance12(handler).use(
        BaseMiddleware({
          handler: async e => {
            if (e || !e) throw Error("Forced . Lorem ipsum");
          }
        })
      );

      const res = await preHooked({
        multiplier: 1
      });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toMatch(`Forced . Lorem ipsum`);
    });
  });

  describe(`CreateInstance configure method and override with middleware's`, () => {
    beforeEach(() => {
      instance12 = CreateInstance({
        configure: {
          augmentMethods: {
            onCatch: fn => {
              return Object.assign({}, fn(), {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" }
              });
            }
          }
        }
      });
    });

    it("should returnAndSendResponse by default", async () => {
      const handler = async (event, context) => {
        return {
          result: 2 + event.multiplier
        };
      };

      const preHooked = instance12(handler).use(
        BaseMiddleware({
          configure: {
            augmentMethods: {
              onCatch: fn => {
                return Object.assign({}, fn(), {
                  statusCode: 403
                });
              }
            }
          },
          handler: async e => {
            if (e || !e) throw Error("Bacon ipsum");
          }
        })
      );

      const res = await preHooked({
        multiplier: 1
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toEqual(
        `Bacon ipsum - Unexpected token B in JSON at position 0`
      );
      expect(res).toStrictEqual({
        body: `Bacon ipsum - Unexpected token B in JSON at position 0`,
        statusCode: 403,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    });

    it("should not override/augment other middleware's", async () => {
      const handler = async (event, context) => {
        return {
          result: 2 * event.multiplier
        };
      };

      const preHooked = instance12(handler).use(
        BaseMiddleware({
          configure: {
            augmentMethods: {
              onCatch: fn => {
                return Object.assign({}, fn(), {
                  statusCode: 403
                });
              }
            }
          },
          handler: async e => {
            // if (e || !e) throw Error("Bacon ipsum");
          }
        })
      );

      const res = await preHooked({
        multiplier: 2
      });

      expect(res.result).toEqual(4);

      const handler2 = async (event, context) => {
        return {
          result: 2 * event.multiplier
        };
      };

      const beforeHookThatThrows = instance12(handler2)
        .use(
          BaseMiddleware({
            configure: {
              augmentMethods: {
                onCatch: fn => {
                  return Object.assign({}, fn(), {
                    statusCode: 123
                  });
                }
              }
            },
            handler: async e => {
              // if (e || !e) throw Error("Bacon ipsum2");
            }
          })
        )
        .use(
          BaseMiddleware({
            configure: {
              // augmentMethods: {
              //   onCatch: (fn, ...args) => {
              //     return Object.assign({}, fn(...args), {
              //       statusCode: 403,
              //       headers: { "Access-Control-Allow-Origin": "*" }
              //     });
              //   }
              // }
            },
            handler: async e => {
              if (e || !e) throw Error("Bacon ipsum23");
            }
          })
        );

      const res2 = await beforeHookThatThrows({
        multiplier: 7
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2).toStrictEqual({
        body: `Bacon ipsum23 - Unexpected token B in JSON at position 0`,
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    });
  });

  describe(`AsyncFunction augment - CreateInstance configure method and override with middleware's`, () => {
    it("// TODO", () => {
      expect(1).toEqual(1);
    });
  });
  // beforeEach(() => {
  //   instance12 = CreateInstance({
  //     configure: {
  //       augmentMethods: {
  //         onCatch: async (fn, ...args) => {
});

describe(`Post Hook`, () => {
  let instance1 = CreateInstance();

  describe("BaseMiddleware handler method", () => {
    beforeEach(() => {
      instance1 = CreateInstance();
    });

    // it.only("should should force consume methods invocation (setEvent, setContext, responseObjectToThrow)", async () => {

    it("should keep own state of event and context and auto retrun it", async () => {
      const handler = async (event, context) => {
        return { event, context };
      };

      const handlerPlusMiddleware = instance1(handler).use(
        BaseMiddleware({
          handler: async () => {}
        })
      );

      const eventFromServerless = {
          headers: {
            Authorization: "dummy123"
          }
        },
        contextFromServerless = { requestContext: 321 };
      const res = await handlerPlusMiddleware(
        eventFromServerless,
        contextFromServerless
      );

      expect(res.event).toBeDefined();
      expect(res.event.headers).toBeDefined();
      expect(res.event.headers.Authorization).toEqual("dummy123");

      expect(res.context).toBeDefined();
      expect(res.context.requestContext).toEqual(321);
    });

    it("should get handler argument object and increment it", async () => {
      const handler = async (event, context) => {
        return { event, context };
      };

      const handlerPlusMiddleware = instance1(handler).use(
        BaseMiddleware({
          handler: async ({ getParams }) => {
            const { event, setEvent } = getParams();
            setEvent({ views: event.views + 1 });
          }
        })
      );

      const eventFromServerless = {
        views: 1
      };
      const res = await handlerPlusMiddleware(eventFromServerless, {});

      expect(res.event).toBeDefined();
      expect(res.event.views).toEqual(2);

      expect(res.context).toBeDefined();
      expect(res.context.requestContext).not.toBeDefined();
    });

    it("should get context argument object, increment it and return as http response", async () => {
      const handler = async (event, context) => {
        return { event, context };
      };

      const getP = (getParams, getHelpers) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              const { event, setEvent } = getParams();
              const { returnAndSendResponse } = getHelpers();

              setEvent({ views: event.views + 1 });
              return returnAndSendResponse({
                statusCode: 403,
                message: `event views should be 3 and we got ${event.views}`
              });
              // resolve({});
            } catch (e) {
              reject(e);
            }
          }, 1);
        });

      const handlerPlusMiddleware = instance1(handler).use(
        BaseMiddleware({
          handler: async ({ getParams, getHelpers }) => {
            await getP(getParams, getHelpers);
          }
        })
      );

      const eventFromServerless = {
        views: 2
      };

      const res = await handlerPlusMiddleware(eventFromServerless, {});

      expect(res).toStrictEqual({
        statusCode: 403,
        message: "event views should be 3 and we got 3"
      });
    });
  });
});

describe(`Auth Middleware`, () => {
  let instance1 = CreateInstance();

  describe("AuthMiddleware", () => {
    beforeEach(() => {
      instance1 = CreateInstance({ DEBUG: true });
    });

    it("should return empty event.user when auth failed and statusCode 403", async () => {
      const handler = event => {
        return { event };
      };

      const handlerPlusMiddleware = instance1(handler).use(
        AuthMiddleware({
          promisify,
          cognitoJWTDecodeHandler: jwtdecodeAsyncHandler
        })
      );

      const res = await handlerPlusMiddleware({
        headers: {
          Authorization: "token"
        }
      });

      expect(res).toBeDefined();
      expect(res.statusCode).toEqual(403);
    });

    it("should return 500 upon syntax error", async () => {
      const handler = event => {
        return { event };
      };

      const handlerPlusMiddleware = instance1(handler).use(
        BaseMiddleware({
          handler: ({ getParams }) => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                try {
                  const claims = jwt_decode(`token`);
                  if (claims && claims.exp && claims.aud) {
                    return resolve(null, claims);
                  }
                  return reject("invalid c");
                } catch (e) {
                  const msg = e && e.message ? `${e.message}` : e;
                  return reject(msg, msg);
                }
              }, 1);
            });
          }
        })
      );

      const res = await handlerPlusMiddleware({
        headers: {
          Authorization: "token"
        }
      });

      console.log("res", res);

      expect(res).toBeDefined();
      expect(res.statusCode).toEqual(500);
    });
  });

  describe("BaseMiddleware", () => {
    beforeEach(() => {
      instance1 = CreateInstance();
    });

    it("should return the same handler when no augmentation needed", async () => {
      const handler = event => {
        return event;
      };

      const handlerPlusMiddleware = instance1(handler);

      const res = await handlerPlusMiddleware({ body: 1 });

      expect(res.body).toEqual(1);
      expect(res.body2).not.toBeDefined();
    });

    it("should return the same handler when no augmentation needed", async () => {
      const handler = event => {
        return event;
      };

      const handlerPlusMiddleware = instance1(handler);

      const res = await handlerPlusMiddleware({ three: 1 });

      expect(res.body).not.toBeDefined();
    });

    it(`should extend "event" by adding Auth Claims`, async () => {
      const handler = event => {
        return event;
      };

      const handlerPlusMiddleware = instance1(handler).use(
        BaseMiddleware({
          handler: ({ getParams }) => {
            const { event, setEvent } = getParams();
            setEvent({
              claims: { email: "tyrtyr" }
            });
          }
        })
      );

      const res = await handlerPlusMiddleware({
        header: "ey123",
        body: '{"string": "toObj"}'
      });

      expect(res.claims.email).toEqual("tyrtyr");
    });

    it(`should extend "event" by many middlewares`, async () => {
      const BaseMiddlewareWrapper = () => {
        return BaseMiddleware({
          handler: ({ getParams }) => {
            const { setEvent } = getParams();
            setEvent({ token: 123 });
          }
        });
      };

      const handler = async event => {
        const plan_code = event.body.plan_code;
        const name = event.token === 123 ? "tyro" : null;
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            return resolve({ statusCode: 201, name, plan_code });
          }, 1);
        });

        return p;
      };

      const handlerPlusMiddleware = instance1(handler)
        .use(BaseMiddlewareWrapper())
        .use(BodyParserMiddleware());

      const res = await handlerPlusMiddleware({
        token: "ey123",
        body: '{"string": "toObj2", "plan_code": "someplancode"}'
      });

      expect(res.statusCode).toEqual(201);
      expect(res.name).toEqual("tyro");
      expect(res.plan_code).toEqual("someplancode");
    });

    it(`should return new instance if instance is reused by passing different handler`, async () => {
      const BaseMiddlewareWrapper = () => {
        return BaseMiddleware({
          handler: ({ getParams }) => getParams().setEvent({ token: 124 })
        });
      };

      const handler = async event => {
        const plan_code = event.body.plan_code;
        const name = event.token === 124 ? "tyro2" : null;
        return new Promise(resolve => {
          setTimeout(() => {
            return resolve({ statusCode: 202, name, plan_code });
          }, 1);
        });
      };

      const handler2 = async event => {
        try {
          const plan_code =
            event && event.body && event.body.plan_code
              ? event.body.plan_code
              : null;

          const name = event.token === 124 ? "tyro2" : null;
          return new Promise(resolve => {
            setTimeout(() => {
              return resolve({ statusCode: 203, name, plan_code });
            }, 1);
          });
        } catch (e) {
          return {
            statusCode: 500,
            body: e.message
          };
        }
      };

      const handlerPlusMiddleware = instance1(handler)
        .use(BaseMiddlewareWrapper())
        .use(BodyParserMiddleware());

      const handlerWithNo = instance1(handler2).use(BodyParserMiddleware());

      const res2 = await handlerWithNo({
        token: "ey123",
        body: {}
      });

      const res = await handlerPlusMiddleware({
        token: "ey123",
        body: '{"string": "toObj2", "plan_code": "someplancode"}'
      });

      expect(res2.statusCode).toEqual(203);
      expect(res2.plan_code).toBeNull();

      expect(res.statusCode).toEqual(202);
      expect(res.name).toEqual("tyro2");
      expect(res.plan_code).toEqual("someplancode");
    });
  });

  describe("BodyParser Middleware", () => {
    let instance1;
    beforeEach(() => {
      instance1 = CreateInstance();
    });

    it(`should extend "event" by parsing body`, async () => {
      const handler = event => {
        return { prefix: event };
      };

      const handlerPlusMiddleware = instance1(handler).use(
        BodyParserMiddleware()
      );

      let res = await handlerPlusMiddleware({
        header: "ey123"
      });
      expect(res.prefix.body).not.toBeDefined();

      res = await handlerPlusMiddleware({
        body: ""
      });
      expect(res.prefix.body).toEqual("");
    });
  });
});

describe(`Configure to be compatible with Express`, () => {
  describe(`When an error or returnAndSendResponse is called, we call onCatch`, () => {
    let instance1;
    beforeEach(() => {
      instance1 = CreateInstance({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: (prevMethodwithArgs, { prevRawMethod, arg } = {}) => {
              expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));
              return Object.assign({}, prevRawMethod(arg), {
                headers: { "Access-Control-Allow-Origin": "*" }
              });
            }
          }
        }
      });
    });

    it("should not be called when there is no error", async () => {
      const fn = async (event, context) => {
        return {
          event,
          context
        };
      };

      const hookedHandler = instance1(fn);
      const res = await hookedHandler({ body: 123 }, {});

      expect(res).toStrictEqual({
        event: {
          body: 123
        },
        context: {}
      });
    });

    it("should be able to call res.json upon error", async () => {
      instance1 = CreateInstance({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: (
              prevMethodwithArgs,
              { prevRawMethod, arg, context } = {}
            ) => {
              expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));

              const res = Object.assign({}, prevRawMethod(arg), {
                extra: "field_added",
                headers: { "Access-Control-Allow-Origin": "*" }
              });
              if (context && context.json) {
                return context.json(res);
              }

              return res;
            }
          }
        }
      });

      const fn = async (event, context) => {
        return {
          event
        };
      };

      const hookedHandler = instance1(fn).use(
        BaseMiddleware({
          handler: async ({ getParams, getHelpers }) => {
            const { event } = getParams();
            if (event) {
              getHelpers().returnAndSendResponse({
                ...event
              });
            }
          }
        })
      );
      const res = await hookedHandler({ body: 123 }, mockedExpressResponse());

      expect(res).toStrictEqual({
        resJsoned: true,
        body: 123,
        extra: "field_added",
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    });

    // it("should be called after onCatch", async () => {
    // it("should be able to override/augment onCatch", async () => {
  });
});
