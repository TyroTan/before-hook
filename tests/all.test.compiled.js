"use strict";

require("source-map-support/register");

var _util = require("util");

var _index = require("../index.js");

const CognitoDecodeVerifyJWTInit = require("./token-decode-test");

const jwt_decode = require("jwt-decode");

const jwtdecodeAsyncHandler = CognitoDecodeVerifyJWTInit({
  jwt_decode
}).UNSAFE_BUT_FAST_handler;

const mockedExpressResponse = () => {
  return {
    send: (code, data) => ({
      statusCode: code,
      data
    }),
    json: data => {
      return { ...data,
        resJsoned: true
      };
    }
  };
};

const isAsyncFunction = fn => fn && fn.constructor && fn.constructor.name === "AsyncFunction";

const AuthMiddleware = ({
  promisify,
  cognitoJWTDecodeHandler
} = {}) => {
  if (promisify && typeof promisify !== "function" || cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function") {
    throw Error(`invalid (promisify and cognitoJWTDecodeHandler) passed. ${typeof promisify},  ${typeof cognitoJWTDecodeHandler}`);
  }

  return (0, _index.BaseMiddleware)({
    configure: {
      augmentMethods: {
        onCatch: () => {
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
    handler: async ({
      getParams,
      getHelpers
    }) => {
      const {
        event,
        setEvent,
        context
      } = getParams();
      const {
        returnAndSendResponse
      } = getHelpers();
      if (!event || !event.headers) return {};
      const newEventHeaders = { ...event.headers
      };

      if (!newEventHeaders.Authorization) {
        newEventHeaders.Authorization = newEventHeaders.authorization;
      }

      let promised = cognitoJWTDecodeHandler;

      if (!isAsyncFunction(promised)) {
        promised = promisify(promised);
      }

      const claims = await promised(Object.assign({}, event, {
        headers: newEventHeaders
      }), context);

      if (!claims || typeof claims.sub !== "string") {
        return returnAndSendResponse({
          statusCode: 403,
          body: "Invalid Session",
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      setEvent({
        user: claims
      });
      return {};
    }
  });
};

const test1 = {
  handler: () => {},
  // params are optional
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
    it(`should accept ~ ${test1.msg} = ${test1.result} length. ${test1.handler.toString()}`, () => {
      const handler = test1.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test1.result);
    });
    it(`should accept ~ ${test2.msg} = ${test2.result} length. ${test2.handler.toString()}`, () => {
      const handler = test2.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test2.result);
    });
    it(`should accept ~ ${test5.msg} = ${test5.result} length. ${test5.handler.toString()}`, () => {
      const handler = test5.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test5.result);
    });
    it(`should accept ~ ${test7.msg} = ${test7.result} length. ${test7.handler.toString()}`, () => {
      const handler = test7.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test7.result);
    });
  });
  describe.skip(`test validateHandler INVALID scenario`, () => {
    it(`should NOT accept ~ ${test3.msg} ${test3.handler.toString()}`, () => {
      const handler = test3.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it(`should NOT accept ~ ${test4.msg} ${test4.handler.toString()}`, () => {
      const handler = test4.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it(`should NOT accept ~ ${test6.msg} ${test6.handler.toString()}`, () => {
      const handler = test6.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it(`should NOT accept ~ ${test8.msg} ${test8.handler.toString()}`, () => {
      const handler = test8.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
  });
  describe.skip(`test validateHandler EDGE cases`, () => {
    const fn1 = (event,
    /* comments, */
    context, callback) => {};

    it(`should accept with comments ~ ${fn1.toString()}`, () => {
      const handler = fn1;
      /* Future Feature
       * expect(validateHandler(handler)).toEqual(true);
       */

      expect(() => (0, _index.validateHandler)(handler)).toThrow(Error);
    });

    const fn2 = (event,
    /* comments, */
    context, Callback) => {};

    it(`should NoT accept case sensitive ~ ${fn2.toString()}`, () => {
      const handler = fn2;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it(`should accept const hello = (event, context) => {`, () => {
      const hello = async (event, context) => {
        return {};
      };

      expect((0, _index.validateHandler)(hello)).toEqual(true);
    });
  });
});
describe(`CreateInstance`, () => {
  let instance1 = (0, _index.CreateInstance)();
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
      instance1 = (0, _index.CreateInstance)();
    });
    it("should not throw error upon initialsation", () => {// const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
      // try {
      //   instance1(e => {});
      // } catch (e) {
      //   expect(e.message).toEqual(expect.stringContaining(expected));
      // }
    });
    it("should only throw exception once the handler is called", () => {// const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
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
    let instance1 = (0, _index.CreateInstance)();
    beforeAll(() => {
      instance1 = (0, _index.CreateInstance)();
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
      const res1 = await asyncHandlerWithCW({
        eventProperty1: "some value1"
      }, {
        contextProperty1: "some value2"
      });
      expect(res1.event.eventProperty1).toEqual("some value1");
      expect(res1.event.eventProperty1).not.toEqual("");
      expect(res1.context.contextProperty1).toEqual("some value2");
    });
  });
  describe("AsyncFunction handler + AsyncFunction middleware", () => {
    let instance1 = (0, _index.CreateInstance)();
    beforeEach(() => {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should be accepted", () => {
      const inv = (0, _index.BaseMiddleware)({
        handler: async ({
          getParams
        }) => {
          const {
            event,
            setEvent
          } = getParams();

          const promisify = require("util").promisify;

          if (!event || !event.headers) return {};
          event.headers.Authorization = !event.headers.Authorization ? event.headers.authorization : event.headers.Authorization;
          const promised = promisify(jwtdecodeAsyncHandler);
          const claims = await promised(event, context);

          if (claims && claims.sub && typeof claims.sub === "string") {
            setEvent({
              user: claims
            });
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
      const res1 = await asyncHandlerWithCW({
        eventProperty1: "some value1"
      }, {
        contextProperty1: "some value2"
      });
      expect(res1.event.eventProperty1).toEqual("some value1");
      expect(res1.event.eventProperty1).not.toEqual("");
      expect(res1.context.contextProperty1).toEqual("some value2");
    });
    it("should work with async middleware", async () => {
      const inv = (0, _index.BaseMiddleware)({
        handler: async ({
          getParams
        }) => {
          return new Promise(resolve => {
            setTimeout(() => {
              const {
                setEvent
              } = getParams();
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
  let instance12 = (0, _index.CreateInstance)();
  describe("CreateInstance", () => {
    beforeEach(() => {
      instance12 = (0, _index.CreateInstance)({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: (prevMethodwithArgs, {
              prevRawMethod,
              arg
            } = {}) => {
              expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));
              return Object.assign({}, prevRawMethod(arg), {
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
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

      const preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
        handler: async ({
          getHelpers
        }) => {
          const {
            returnAndSendResponse
          } = getHelpers();

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
      })).use((0, _index.BaseMiddleware)({
        handler: async ({
          getHelpers
        }) => {
          const {
            returnAndSendResponse
          } = getHelpers();

          if (returnAndSendResponse || !returnAndSendResponse) {
            returnAndSendResponse({
              statusCode: 500,
              body: "testt"
            });
          }
        }
      }));
      const res = await preHooked({
        multiplier: 1
      });
      expect(res.statusCode).toEqual(1234);
      expect(res.obj.obj2.arr.length).toEqual(4);
    });
  });
  describe("CreateInstance configure method", () => {
    beforeEach(() => {
      instance12 = (0, _index.CreateInstance)();
    });
    it("should returnAndSendResponse by default", async () => {
      const handler = async (event, context) => {
        return {
          result: 2 + event.multiplier
        };
      };

      const preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
        handler: async e => {
          if (e || !e) throw Error("Forced . Lorem ipsum");
        }
      }));
      const res = await preHooked({
        multiplier: 1
      });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toMatch(`Forced . Lorem ipsum`);
    });
  });
  describe(`CreateInstance configure method and override with middleware's`, () => {
    beforeEach(() => {
      instance12 = (0, _index.CreateInstance)({
        configure: {
          augmentMethods: {
            onCatch: fn => {
              return Object.assign({}, fn(), {
                statusCode: 500,
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
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

      const preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
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
      }));
      const res = await preHooked({
        multiplier: 1
      });
      expect(res.statusCode).toEqual(403);
      expect(res.body).toEqual(`Bacon ipsum - Unexpected token B in JSON at position 0`);
      expect(res).toStrictEqual({
        body: `Bacon ipsum - Unexpected token B in JSON at position 0`,
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    });
    it("should not override/augment other middleware's", async () => {
      const handler = async (event, context) => {
        return {
          result: 2 * event.multiplier
        };
      };

      const preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
        configure: {
          augmentMethods: {
            onCatch: fn => {
              return Object.assign({}, fn(), {
                statusCode: 403
              });
            }
          }
        },
        handler: async e => {// if (e || !e) throw Error("Bacon ipsum");
        }
      }));
      const res = await preHooked({
        multiplier: 2
      });
      expect(res.result).toEqual(4);

      const handler2 = async (event, context) => {
        return {
          result: 2 * event.multiplier
        };
      };

      const beforeHookThatThrows = instance12(handler2).use((0, _index.BaseMiddleware)({
        configure: {
          augmentMethods: {
            onCatch: fn => {
              return Object.assign({}, fn(), {
                statusCode: 123
              });
            }
          }
        },
        handler: async e => {// if (e || !e) throw Error("Bacon ipsum2");
        }
      })).use((0, _index.BaseMiddleware)({
        configure: {// augmentMethods: {
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
      }));
      const res2 = await beforeHookThatThrows({
        multiplier: 7
      });
      expect(res2.statusCode).toEqual(500);
      expect(res2).toStrictEqual({
        body: `Bacon ipsum23 - Unexpected token B in JSON at position 0`,
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    });
  });
  describe(`AsyncFunction augment - CreateInstance configure method and override with middleware's`, () => {
    it("// TODO", () => {
      expect(1).toEqual(1);
    });
  }); // beforeEach(() => {
  //   instance12 = CreateInstance({
  //     configure: {
  //       augmentMethods: {
  //         onCatch: async (fn, ...args) => {
});
describe(`Post Hook`, () => {
  let instance1 = (0, _index.CreateInstance)();
  describe("BaseMiddleware handler method", () => {
    beforeEach(() => {
      instance1 = (0, _index.CreateInstance)();
    }); // it.only("should should force consume methods invocation (setEvent, setContext, responseObjectToThrow)", async () => {

    it("should keep own state of event and context and auto retrun it", async () => {
      const handler = async (event, context) => {
        return {
          event,
          context
        };
      };

      const handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
        handler: async () => {}
      }));
      const eventFromServerless = {
        headers: {
          Authorization: "dummy123"
        }
      },
            contextFromServerless = {
        requestContext: 321
      };
      const res = await handlerPlusMiddleware(eventFromServerless, contextFromServerless);
      expect(res.event).toBeDefined();
      expect(res.event.headers).toBeDefined();
      expect(res.event.headers.Authorization).toEqual("dummy123");
      expect(res.context).toBeDefined();
      expect(res.context.requestContext).toEqual(321);
    });
    it("should get handler argument object and increment it", async () => {
      const handler = async (event, context) => {
        return {
          event,
          context
        };
      };

      const handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
        handler: async ({
          getParams
        }) => {
          const {
            event,
            setEvent
          } = getParams();
          setEvent({
            views: event.views + 1
          });
        }
      }));
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
        return {
          event,
          context
        };
      };

      const getP = (getParams, getHelpers) => new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const {
              event,
              setEvent
            } = getParams();
            const {
              returnAndSendResponse
            } = getHelpers();
            setEvent({
              views: event.views + 1
            });
            return returnAndSendResponse({
              statusCode: 403,
              message: `event views should be 3 and we got ${event.views}`
            }); // resolve({});
          } catch (e) {
            reject(e);
          }
        }, 1);
      });

      const handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
        handler: async ({
          getParams,
          getHelpers
        }) => {
          await getP(getParams, getHelpers);
        }
      }));
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
  let instance1 = (0, _index.CreateInstance)();
  describe("AuthMiddleware", () => {
    beforeEach(() => {
      instance1 = (0, _index.CreateInstance)({
        DEBUG: true
      });
    });
    it("should return empty event.user when auth failed and statusCode 403", async () => {
      const handler = event => {
        return {
          event
        };
      };

      const handlerPlusMiddleware = instance1(handler).use(AuthMiddleware({
        promisify: _util.promisify,
        cognitoJWTDecodeHandler: jwtdecodeAsyncHandler
      }));
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
        return {
          event
        };
      };

      const handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
        handler: ({
          getParams
        }) => {
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
      }));
      const res = await handlerPlusMiddleware({
        headers: {
          Authorization: "token"
        }
      });
      expect(res).toBeDefined();
      expect(res.statusCode).toEqual(500);
    });
  });
  describe("BaseMiddleware", () => {
    beforeEach(() => {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should return the same handler when no augmentation needed", async () => {
      const handler = event => {
        return event;
      };

      const handlerPlusMiddleware = instance1(handler);
      const res = await handlerPlusMiddleware({
        body: 1
      });
      expect(res.body).toEqual(1);
      expect(res.body2).not.toBeDefined();
    });
    it("should return the same handler when no augmentation needed", async () => {
      const handler = event => {
        return event;
      };

      const handlerPlusMiddleware = instance1(handler);
      const res = await handlerPlusMiddleware({
        three: 1
      });
      expect(res.body).not.toBeDefined();
    });
    it(`should extend "event" by adding Auth Claims`, async () => {
      const handler = event => {
        return event;
      };

      const handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
        handler: ({
          getParams
        }) => {
          const {
            event,
            setEvent
          } = getParams();
          setEvent({
            claims: {
              email: "tyrtyr"
            }
          });
        }
      }));
      const res = await handlerPlusMiddleware({
        header: "ey123",
        body: '{"string": "toObj"}'
      });
      expect(res.claims.email).toEqual("tyrtyr");
    });
    it(`should extend "event" by many middlewares`, async () => {
      const BaseMiddlewareWrapper = () => {
        return (0, _index.BaseMiddleware)({
          handler: ({
            getParams
          }) => {
            const {
              setEvent
            } = getParams();
            setEvent({
              token: 123
            });
          }
        });
      };

      const handler = async event => {
        const plan_code = event.body.plan_code;
        const name = event.token === 123 ? "tyro" : null;
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            return resolve({
              statusCode: 201,
              name,
              plan_code
            });
          }, 1);
        });
        return p;
      };

      const handlerPlusMiddleware = instance1(handler).use(BaseMiddlewareWrapper()).use((0, _index.BodyParserMiddleware)());
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
        return (0, _index.BaseMiddleware)({
          handler: ({
            getParams
          }) => getParams().setEvent({
            token: 124
          })
        });
      };

      const handler = async event => {
        const plan_code = event.body.plan_code;
        const name = event.token === 124 ? "tyro2" : null;
        return new Promise(resolve => {
          setTimeout(() => {
            return resolve({
              statusCode: 202,
              name,
              plan_code
            });
          }, 1);
        });
      };

      const handler2 = async event => {
        try {
          const plan_code = event && event.body && event.body.plan_code ? event.body.plan_code : null;
          const name = event.token === 124 ? "tyro2" : null;
          return new Promise(resolve => {
            setTimeout(() => {
              return resolve({
                statusCode: 203,
                name,
                plan_code
              });
            }, 1);
          });
        } catch (e) {
          return {
            statusCode: 500,
            body: e.message
          };
        }
      };

      const handlerPlusMiddleware = instance1(handler).use(BaseMiddlewareWrapper()).use((0, _index.BodyParserMiddleware)());
      const handlerWithNo = instance1(handler2).use((0, _index.BodyParserMiddleware)());
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
      instance1 = (0, _index.CreateInstance)();
    });
    it(`should extend "event" by parsing body`, async () => {
      const handler = event => {
        return {
          prefix: event
        };
      };

      const handlerPlusMiddleware = instance1(handler).use((0, _index.BodyParserMiddleware)());
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
      instance1 = (0, _index.CreateInstance)({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: (prevMethodwithArgs, {
              prevRawMethod,
              arg
            } = {}) => {
              expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));
              return Object.assign({}, prevRawMethod(arg), {
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
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
      const res = await hookedHandler({
        body: 123
      }, {});
      expect(res).toStrictEqual({
        event: {
          body: 123
        },
        context: {}
      });
    });
    it("should be able to call res.json upon error", async () => {
      instance1 = (0, _index.CreateInstance)({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: (prevMethodwithArgs, {
              prevRawMethod,
              arg,
              context
            } = {}) => {
              expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));
              const res = Object.assign({}, prevRawMethod(arg), {
                extra: "field_added",
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
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

      const hookedHandler = instance1(fn).use((0, _index.BaseMiddleware)({
        handler: async ({
          getParams,
          getHelpers
        }) => {
          const {
            event
          } = getParams();

          if (event) {
            getHelpers().returnAndSendResponse({ ...event
            });
          }
        }
      }));
      const res = await hookedHandler({
        body: 123
      }, mockedExpressResponse());
      expect(res).toStrictEqual({
        resJsoned: true,
        body: 123,
        extra: "field_added",
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }); // it("should be called after onCatch", async () => {
    // it("should be able to override/augment onCatch", async () => {
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFsbC10ZXN0LmpzIl0sIm5hbWVzIjpbIkNvZ25pdG9EZWNvZGVWZXJpZnlKV1RJbml0IiwicmVxdWlyZSIsImp3dF9kZWNvZGUiLCJqd3RkZWNvZGVBc3luY0hhbmRsZXIiLCJVTlNBRkVfQlVUX0ZBU1RfaGFuZGxlciIsIm1vY2tlZEV4cHJlc3NSZXNwb25zZSIsInNlbmQiLCJjb2RlIiwiZGF0YSIsInN0YXR1c0NvZGUiLCJqc29uIiwicmVzSnNvbmVkIiwiaXNBc3luY0Z1bmN0aW9uIiwiZm4iLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJBdXRoTWlkZGxld2FyZSIsInByb21pc2lmeSIsImNvZ25pdG9KV1REZWNvZGVIYW5kbGVyIiwiRXJyb3IiLCJjb25maWd1cmUiLCJhdWdtZW50TWV0aG9kcyIsIm9uQ2F0Y2giLCJib2R5IiwiaGVhZGVycyIsImhhbmRsZXIiLCJnZXRQYXJhbXMiLCJnZXRIZWxwZXJzIiwiZXZlbnQiLCJzZXRFdmVudCIsImNvbnRleHQiLCJyZXR1cm5BbmRTZW5kUmVzcG9uc2UiLCJuZXdFdmVudEhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiYXV0aG9yaXphdGlvbiIsInByb21pc2VkIiwiY2xhaW1zIiwiT2JqZWN0IiwiYXNzaWduIiwic3ViIiwidXNlciIsInRlc3QxIiwicmVzdWx0IiwibXNnIiwidGVzdDIiLCJ0ZXN0MyIsImUiLCJ0ZXN0NCIsImV2ZW50cyIsInRlc3Q1IiwidGVzdDYiLCJjb250ZXh0MTIzIiwidGVzdDciLCJjYWxsYmFjayIsInRlc3Q4IiwiY2FsbGJhYyIsImRlc2NyaWJlIiwiaXQiLCJ0b1N0cmluZyIsImV4cGVjdCIsInRvRXF1YWwiLCJza2lwIiwiZm4xIiwidG9UaHJvdyIsImZuMiIsIkNhbGxiYWNrIiwiaGVsbG8iLCJpbnN0YW5jZTEiLCJleHBlY3RlZCIsIm1lc3NhZ2UiLCJzdHJpbmdDb250YWluaW5nIiwiYmVmb3JlRWFjaCIsImJlZm9yZUFsbCIsIm5vdCIsImJhc2ljQXN5bmNIYW5kbGVyIiwiYXN5bmNIYW5kbGVyV2l0aENXIiwicmVzMSIsImV2ZW50UHJvcGVydHkxIiwiY29udGV4dFByb3BlcnR5MSIsImludiIsImlzSG9va01pZGRsZXdhcmUiLCJ1c2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJlbWFpbCIsImgiLCJjIiwibmV3SG4iLCJ0b0JlRGVmaW5lZCIsImluc3RhbmNlMTIiLCJERUJVRyIsInByZXZNZXRob2R3aXRoQXJncyIsInByZXZSYXdNZXRob2QiLCJhcmciLCJ0b1N0cmljdEVxdWFsIiwibXVsdGlwbGllciIsInByZUhvb2tlZCIsIm9iaiIsIm51Iiwib2JqMiIsImFyciIsInJlcyIsImxlbmd0aCIsInRvTWF0Y2giLCJoYW5kbGVyMiIsImJlZm9yZUhvb2tUaGF0VGhyb3dzIiwicmVzMiIsImhhbmRsZXJQbHVzTWlkZGxld2FyZSIsImV2ZW50RnJvbVNlcnZlcmxlc3MiLCJjb250ZXh0RnJvbVNlcnZlcmxlc3MiLCJyZXF1ZXN0Q29udGV4dCIsInZpZXdzIiwiZ2V0UCIsInJlamVjdCIsImV4cCIsImF1ZCIsImJvZHkyIiwidGhyZWUiLCJoZWFkZXIiLCJCYXNlTWlkZGxld2FyZVdyYXBwZXIiLCJ0b2tlbiIsInBsYW5fY29kZSIsInAiLCJoYW5kbGVyV2l0aE5vIiwidG9CZU51bGwiLCJwcmVmaXgiLCJob29rZWRIYW5kbGVyIiwiZXh0cmEiXSwibWFwcGluZ3MiOiI7Ozs7QUFNQTs7QUFjQTs7QUFwQkEsTUFBTUEsMEJBQTBCLEdBQUdDLE9BQU8sQ0FBQyxxQkFBRCxDQUExQzs7QUFFQSxNQUFNQyxVQUFVLEdBQUdELE9BQU8sQ0FBQyxZQUFELENBQTFCOztBQUNBLE1BQU1FLHFCQUFxQixHQUFHSCwwQkFBMEIsQ0FBQztBQUN2REUsRUFBQUE7QUFEdUQsQ0FBRCxDQUExQixDQUUzQkUsdUJBRkg7O0FBS0EsTUFBTUMscUJBQXFCLEdBQUcsTUFBTTtBQUNsQyxTQUFPO0FBQ0xDLElBQUFBLElBQUksRUFBRSxDQUFDQyxJQUFELEVBQU9DLElB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RUFBRSxJQURhO0FBRXhCWSxRQUFBQSxJQUFJLEVBQUUsR0FGa0I7QUFHeEJ5RyxRQUFBQSxLQUFLLEVBQUUsYUFIaUI7QUFJeEJ4RyxRQUFBQSxPQUFPLEVBQUU7QUFBRSx5Q0FBK0I7QUFBakM7QUFKZSxPQUExQjtBQU1ELEtBbkRDLENBQUYsQ0FyQ2tGLENBMEZsRjtBQUNBO0FBQ0QsR0E1Rk8sQ0FBUjtBQTZGRCxDQTlGTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ29nbml0b0RlY29kZVZlcmlmeUpXVEluaXQgPSByZXF1aXJlKFwiLi90b2tlbi1kZWNvZGUtdGVzdFwiKTtcblxuY29uc3Qgand0X2RlY29kZSA9IHJlcXVpcmUoXCJqd3QtZGVjb2RlXCIpO1xuY29uc3Qgand0ZGVjb2RlQXN5bmNIYW5kbGVyID0gQ29nbml0b0RlY29kZVZlcmlmeUpXVEluaXQoe1xuICBqd3RfZGVjb2RlXG59KS5VTlNBRkVfQlVUX0ZBU1RfaGFuZGxlcjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5cbmNvbnN0IG1vY2tlZEV4cHJlc3NSZXNwb25zZSA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBzZW5kOiAoY29kZSwgZGF0YSkgPT4gKHtcbiAgICAgIHN0YXR1c0NvZGU6IGNvZGUsXG4gICAgICBkYXRhXG4gICAgfSksXG4gICAganNvbjogZGF0YSA9PiB7XG4gICAgICByZXR1cm4geyAuLi5kYXRhLCByZXNKc29uZWQ6IHRydWUgfTtcbiAgICB9XG4gIH07XG59O1xuXG5pbXBvcnQge1xuICBDcmVhdGVJbnN0YW5jZSxcbiAgdmFsaWRhdGVIYW5kbGVyLFxuICBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoLFxuICBCYXNlTWlkZGxld2FyZSxcbiAgQm9keVBhcnNlck1pZGRsZXdhcmVcbn0gZnJvbSBcIi4uL2luZGV4LmpzXCI7XG5cbmNvbnN0IGlzQXN5bmNGdW5jdGlvbiA9IGZuID0+XG4gIGZuICYmIGZuLmNvbnN0cnVjdG9yICYmIGZuLmNvbnN0cnVjdG9yLm5hbWUgPT09IFwiQXN5bmNGdW5jdGlvblwiO1xuY29uc3QgQXV0aE1pZGRsZXdhcmUgPSAoeyBwcm9taXNpZnksIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyIH0gPSB7fSkgPT4ge1xuICBpZiAoXG4gICAgKHByb21pc2lmeSAmJiB0eXBlb2YgcHJvbWlzaWZ5ICE9PSBcImZ1bmN0aW9uXCIpIHx8XG4gICAgKGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyICYmIHR5cGVvZiBjb2duaXRvSldURGVjb2RlSGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICApIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIGBpbnZhbGlkIChwcm9taXNpZnkgYW5kIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyKSBwYXNzZWQuICR7dHlwZW9mIHByb21pc2lmeX0sICAke3R5cGVvZiBjb2duaXRvSldURGVjb2RlSGFuZGxlcn1gXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgY29uZmlndXJlOiB7XG4gICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICBvbkNhdGNoOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMyxcbiAgICAgICAgICAgIGJvZHk6IFwiSW52YWxpZCBTZXNzaW9uXCIsXG4gICAgICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRQYXJhbXMsIGdldEhlbHBlcnMgfSkgPT4ge1xuICAgICAgY29uc3QgeyBldmVudCwgc2V0RXZlbnQsIGNvbnRleHQgfSA9IGdldFBhcmFtcygpO1xuICAgICAgY29uc3QgeyByZXR1cm5BbmRTZW5kUmVzcG9uc2UgfSA9IGdldEhlbHBlcnMoKTtcblxuICAgICAgaWYgKCFldmVudCB8fCAhZXZlbnQuaGVhZGVycykgcmV0dXJuIHt9O1xuXG4gICAgICBjb25zdCBuZXdFdmVudEhlYWRlcnMgPSB7XG4gICAgICAgIC4uLmV2ZW50LmhlYWRlcnNcbiAgICAgIH07XG5cbiAgICAgIGlmICghbmV3RXZlbnRIZWFkZXJzLkF1dGhvcml6YXRpb24pIHtcbiAgICAgICAgbmV3RXZlbnRIZWFkZXJzLkF1dGhvcml6YXRpb24gPSBuZXdFdmVudEhlYWRlcnMuYXV0aG9yaXphdGlvbjtcbiAgICAgIH1cblxuICAgICAgbGV0IHByb21pc2VkID0gY29nbml0b0pXVERlY29kZUhhbmRsZXI7XG4gICAgICBpZiAoIWlzQXN5bmNGdW5jdGlvbihwcm9taXNlZCkpIHtcbiAgICAgICAgcHJvbWlzZWQgPSBwcm9taXNpZnkocHJvbWlzZWQpO1xuICAgICAgfVxuICAgICAgY29uc3QgY2xhaW1zID0gYXdhaXQgcHJvbWlzZWQoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oe30sIGV2ZW50LCB7IGhlYWRlcnM6IG5ld0V2ZW50SGVhZGVycyB9KSxcbiAgICAgICAgY29udGV4dFxuICAgICAgKTtcblxuICAgICAgaWYgKCFjbGFpbXMgfHwgdHlwZW9mIGNsYWltcy5zdWIgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICAgIGJvZHk6IFwiSW52YWxpZCBTZXNzaW9uXCIsXG4gICAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzZXRFdmVudCh7IHVzZXI6IGNsYWltcyB9KTtcblxuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCB0ZXN0MSA9IHtcbiAgaGFuZGxlcjogKCkgPT4ge30sIC8vIHBhcmFtcyBhcmUgb3B0aW9uYWxcbiAgcmVzdWx0OiAwLFxuICBtc2c6IGBwYXJhbXMgYXJlIG9wdGlvbmFsYFxufTtcblxuY29uc3QgdGVzdDIgPSB7XG4gIGhhbmRsZXI6IGV2ZW50ID0+IHt9LFxuICByZXN1bHQ6IDEsXG4gIG1zZzogYHBhcmFtcyBhcmUgb3B0aW9uYWxgXG59O1xuXG5jb25zdCB0ZXN0MyA9IHtcbiAgaGFuZGxlcjogZSA9PiB7fSxcbiAgcmVzdWx0OiAxLFxuICBtc2c6IGAxc3QgcGFyYW0gbmVlZCB0byBiZSBldmVudCBhbmQgbm90IGVgXG59O1xuXG5jb25zdCB0ZXN0NCA9IHtcbiAgaGFuZGxlcjogZXZlbnRzID0+IHt9LFxuICByZXN1bHQ6IDEsXG4gIG1zZzogYDFzdCBwYXJhbSBuZWVkIHRvIGJlIGV2ZW50IGFuZCBub3QgZXZlbnRzYFxufTtcblxuY29uc3QgdGVzdDUgPSB7XG4gIGhhbmRsZXI6IChldmVudCwgY29udGV4dCkgPT4ge30sXG4gIHJlc3VsdDogMixcbiAgbXNnOiBgcGFyYW1zIGFyZSBvcHRpb25hbGBcbn07XG5cbmNvbnN0IHRlc3Q2ID0ge1xuICBoYW5kbGVyOiAoZXZlbnQsIGNvbnRleHQxMjMpID0+IHt9LFxuICByZXN1bHQ6IDIsXG4gIG1zZzogYDJuZCBwYXJhbSBuZWVkIHRvIGJlIGNvbnRleHQgYW5kIG5vdCBjb250ZXh0MTIzYFxufTtcblxuY29uc3QgdGVzdDcgPSB7XG4gIGhhbmRsZXI6IChldmVudCwgY29udGV4dCwgY2FsbGJhY2spID0+IHt9LFxuICByZXN1bHQ6IDMsXG4gIG1zZzogYHBhcmFtcyBhcmUgb3B0aW9uYWxgXG59O1xuXG5jb25zdCB0ZXN0OCA9IHtcbiAgaGFuZGxlcjogKGV2ZW50LCBjb250ZXh0LCBjYWxsYmFjKSA9PiB7fSxcbiAgcmVzdWx0OiAzLFxuICBtc2c6IGAzcmQgcGFyYW0gbmVlZCB0byBiZSBjYWxsYmFjayBhbmQgbm90IGNhbGxiYWNgXG59O1xuXG5kZXNjcmliZShgZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aGAsICgpID0+IHtcbiAgZGVzY3JpYmUoYHRlc3QgZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aCBjb3JyZWN0bmVzc2AsICgpID0+IHtcbiAgICBpdChgc2hvdWxkIGFjY2VwdCB+ICR7dGVzdDEubXNnfSA9ICR7XG4gICAgICB0ZXN0MS5yZXN1bHRcbiAgICB9IGxlbmd0aC4gJHt0ZXN0MS5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3QxLmhhbmRsZXI7XG4gICAgICBleHBlY3QoZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aChoYW5kbGVyKSkudG9FcXVhbCh0ZXN0MS5yZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBhY2NlcHQgfiAke3Rlc3QyLm1zZ30gPSAke1xuICAgICAgdGVzdDIucmVzdWx0XG4gICAgfSBsZW5ndGguICR7dGVzdDIuaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0Mi5oYW5kbGVyO1xuICAgICAgZXhwZWN0KGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgoaGFuZGxlcikpLnRvRXF1YWwodGVzdDIucmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgYWNjZXB0IH4gJHt0ZXN0NS5tc2d9ID0gJHtcbiAgICAgIHRlc3Q1LnJlc3VsdFxuICAgIH0gbGVuZ3RoLiAke3Rlc3Q1LmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDUuaGFuZGxlcjtcbiAgICAgIGV4cGVjdChnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoKGhhbmRsZXIpKS50b0VxdWFsKHRlc3Q1LnJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGFjY2VwdCB+ICR7dGVzdDcubXNnfSA9ICR7XG4gICAgICB0ZXN0Ny5yZXN1bHRcbiAgICB9IGxlbmd0aC4gJHt0ZXN0Ny5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3Q3LmhhbmRsZXI7XG4gICAgICBleHBlY3QoZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aChoYW5kbGVyKSkudG9FcXVhbCh0ZXN0Ny5yZXN1bHQpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZS5za2lwKGB0ZXN0IHZhbGlkYXRlSGFuZGxlciBJTlZBTElEIHNjZW5hcmlvYCwgKCkgPT4ge1xuICAgIGl0KGBzaG91bGQgTk9UIGFjY2VwdCB+ICR7dGVzdDMubXNnfSAke3Rlc3QzLmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDMuaGFuZGxlcjtcbiAgICAgIGV4cGVjdCh2YWxpZGF0ZUhhbmRsZXIoaGFuZGxlcikpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBOT1QgYWNjZXB0IH4gJHt0ZXN0NC5tc2d9ICR7dGVzdDQuaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0NC5oYW5kbGVyO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIE5PVCBhY2NlcHQgfiAke3Rlc3Q2Lm1zZ30gJHt0ZXN0Ni5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3Q2LmhhbmRsZXI7XG4gICAgICBleHBlY3QodmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b0VxdWFsKGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgTk9UIGFjY2VwdCB+ICR7dGVzdDgubXNnfSAke3Rlc3Q4LmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDguaGFuZGxlcjtcbiAgICAgIGV4cGVjdCh2YWxpZGF0ZUhhbmRsZXIoaGFuZGxlcikpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZS5za2lwKGB0ZXN0IHZhbGlkYXRlSGFuZGxlciBFREdFIGNhc2VzYCwgKCkgPT4ge1xuICAgIGNvbnN0IGZuMSA9IChldmVudCwgLyogY29tbWVudHMsICovIGNvbnRleHQsIGNhbGxiYWNrKSA9PiB7fTtcbiAgICBpdChgc2hvdWxkIGFjY2VwdCB3aXRoIGNvbW1lbnRzIH4gJHtmbjEudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZm4xO1xuXG4gICAgICAvKiBGdXR1cmUgRmVhdHVyZVxuICAgICAgICogZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAqL1xuICAgICAgZXhwZWN0KCgpID0+IHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9UaHJvdyhFcnJvcik7XG4gICAgfSk7XG5cbiAgICBjb25zdCBmbjIgPSAoZXZlbnQsIC8qIGNvbW1lbnRzLCAqLyBjb250ZXh0LCBDYWxsYmFjaykgPT4ge307XG4gICAgaXQoYHNob3VsZCBOb1QgYWNjZXB0IGNhc2Ugc2Vuc2l0aXZlIH4gJHtmbjIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZm4yO1xuXG4gICAgICBleHBlY3QodmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b0VxdWFsKGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgYWNjZXB0IGNvbnN0IGhlbGxvID0gKGV2ZW50LCBjb250ZXh0KSA9PiB7YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGVsbG8gPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoZWxsbykpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBDcmVhdGVJbnN0YW5jZWAsICgpID0+IHtcbiAgbGV0IGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJUZXN0IGVycm9ycyBvciB0aHJvd3NcIiwgKCkgPT4ge1xuICAgIGl0KFwic2hvdWxkIHNob3cgZXJyb3IgbWVzc2FnZVwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiLnVzZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IGVycm9yIHVwb24gaW5pdGlhbHNhdGlvblwiLCAoKSA9PiB7XG4gICAgICAvLyBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgLy8gICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICAvLyB9XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBvbmx5IHRocm93IGV4Y2VwdGlvbiBvbmNlIHRoZSBoYW5kbGVyIGlzIGNhbGxlZFwiLCAoKSA9PiB7XG4gICAgICAvLyBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgLy8gICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICAvLyB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBBc3luY0Z1bmN0aW9uIHN1cHBvcnRgLCAoKSA9PiB7XG4gIGRlc2NyaWJlKFwiQXN5bmNGdW5jdGlvbiBoYW5kbGVyXCIsICgpID0+IHtcbiAgICBsZXQgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICBiZWZvcmVBbGwoKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIGFjY2VwdGVkXCIsICgpID0+IHtcbiAgICAgIGV4cGVjdCgoKSA9PiBpbnN0YW5jZTEoYXN5bmMgKCkgPT4ge30pKS5ub3QudG9UaHJvdygpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IHdoZW4gaGFuZGxlciBpcyBhIGJhc2ljIGFzeW5jIGZuXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2ljQXN5bmNIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgYXdhaXQgZXhwZWN0KCgpID0+IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcikubm90LnRvVGhyb3coKSk7XG5cbiAgICAgIGNvbnN0IGFzeW5jSGFuZGxlcldpdGhDVyA9IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcik7XG4gICAgICBjb25zdCByZXMxID0gYXdhaXQgYXN5bmNIYW5kbGVyV2l0aENXKFxuICAgICAgICB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0eTE6IFwic29tZSB2YWx1ZTFcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY29udGV4dFByb3BlcnR5MTogXCJzb21lIHZhbHVlMlwiXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMxLmV2ZW50LmV2ZW50UHJvcGVydHkxKS50b0VxdWFsKFwic29tZSB2YWx1ZTFcIik7XG4gICAgICBleHBlY3QocmVzMS5ldmVudC5ldmVudFByb3BlcnR5MSkubm90LnRvRXF1YWwoXCJcIik7XG4gICAgICBleHBlY3QocmVzMS5jb250ZXh0LmNvbnRleHRQcm9wZXJ0eTEpLnRvRXF1YWwoXCJzb21lIHZhbHVlMlwiKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJBc3luY0Z1bmN0aW9uIGhhbmRsZXIgKyBBc3luY0Z1bmN0aW9uIG1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGxldCBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIGFjY2VwdGVkXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGludiA9IEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgY29uc3QgcHJvbWlzaWZ5ID0gcmVxdWlyZShcInV0aWxcIikucHJvbWlzaWZ5O1xuICAgICAgICAgIGlmICghZXZlbnQgfHwgIWV2ZW50LmhlYWRlcnMpIHJldHVybiB7fTtcbiAgICAgICAgICBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSAhZXZlbnQuaGVhZGVycy5BdXRob3JpemF0aW9uXG4gICAgICAgICAgICA/IGV2ZW50LmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgICAgICAgICAgOiBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb247XG4gICAgICAgICAgY29uc3QgcHJvbWlzZWQgPSBwcm9taXNpZnkoand0ZGVjb2RlQXN5bmNIYW5kbGVyKTtcbiAgICAgICAgICBjb25zdCBjbGFpbXMgPSBhd2FpdCBwcm9taXNlZChldmVudCwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGNsYWltcyAmJiBjbGFpbXMuc3ViICYmIHR5cGVvZiBjbGFpbXMuc3ViID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHVzZXI6IGNsYWltcyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaW52LmlzSG9va01pZGRsZXdhcmUgPSB0cnVlO1xuXG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBpbnN0YW5jZTEoYXN5bmMgKCkgPT4ge30pLnVzZShpbnYpKCk7XG4gICAgICB9KS5ub3QudG9UaHJvdygpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IHdoZW4gaGFuZGxlciBpcyBhIGJhc2ljIGFzeW5jIGZuXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2ljQXN5bmNIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgYXdhaXQgZXhwZWN0KCgpID0+IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcikubm90LnRvVGhyb3coKSk7XG5cbiAgICAgIGNvbnN0IGFzeW5jSGFuZGxlcldpdGhDVyA9IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcik7XG4gICAgICBjb25zdCByZXMxID0gYXdhaXQgYXN5bmNIYW5kbGVyV2l0aENXKFxuICAgICAgICB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0eTE6IFwic29tZSB2YWx1ZTFcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY29udGV4dFByb3BlcnR5MTogXCJzb21lIHZhbHVlMlwiXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMxLmV2ZW50LmV2ZW50UHJvcGVydHkxKS50b0VxdWFsKFwic29tZSB2YWx1ZTFcIik7XG4gICAgICBleHBlY3QocmVzMS5ldmVudC5ldmVudFByb3BlcnR5MSkubm90LnRvRXF1YWwoXCJcIik7XG4gICAgICBleHBlY3QocmVzMS5jb250ZXh0LmNvbnRleHRQcm9wZXJ0eTEpLnRvRXF1YWwoXCJzb21lIHZhbHVlMlwiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHdvcmsgd2l0aCBhc3luYyBtaWRkbGV3YXJlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGludiA9IEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG5cbiAgICAgICAgICAgICAgc2V0RXZlbnQoe1xuICAgICAgICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgICAgICAgIGVtYWlsOiBcImVtYWlsQGV4YW1wbGUuY29tXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGggPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlOiBldmVudCxcbiAgICAgICAgICBjOiBjb250ZXh0XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBuZXdIbiA9IGluc3RhbmNlMShoKS51c2UoaW52KTtcbiAgICAgIGNvbnN0IHJlczEgPSBhd2FpdCBuZXdIbih7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBcInRva2VuMVwiXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzMS5lLnVzZXIpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzMS5lLnVzZXIuZW1haWwpLnRvRXF1YWwoXCJlbWFpbEBleGFtcGxlLmNvbVwiKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoYEVycm9yIEhhbmRsaW5nYCwgKCkgPT4ge1xuICBsZXQgaW5zdGFuY2UxMiA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJDcmVhdGVJbnN0YW5jZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2Uoe1xuICAgICAgICBERUJVRzogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgIG9uQ2F0Y2g6IChwcmV2TWV0aG9kd2l0aEFyZ3MsIHsgcHJldlJhd01ldGhvZCwgYXJnIH0gPSB7fSkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocHJldk1ldGhvZHdpdGhBcmdzKCkpLnRvU3RyaWN0RXF1YWwocHJldlJhd01ldGhvZChhcmcpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHByZXZSYXdNZXRob2QoYXJnKSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBjYXVzZSB0aGUgaGFuZGxlciBjYWxsIHRvIHN0b3AgYW5kIHJldHVybiByZXNwb25zZSBhdCB0aGUgbWlkZGxld2FyZSB3aGljaCBpbnZva2VkIHJldHVybkFuZFNlbmRSZXNwb25zZWAsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKyBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcmVIb29rZWQgPSBpbnN0YW5jZTEyKGhhbmRsZXIpXG4gICAgICAgIC51c2UoXG4gICAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIH0gPSBnZXRIZWxwZXJzKCk7XG4gICAgICAgICAgICAgIGlmIChyZXR1cm5BbmRTZW5kUmVzcG9uc2UgfHwgIXJldHVybkFuZFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAxMjM0LFxuICAgICAgICAgICAgICAgICAgYm9keTogXCJteSBjdXN0b20gZGF0YVwiLFxuICAgICAgICAgICAgICAgICAgb2JqOiB7XG4gICAgICAgICAgICAgICAgICAgIG51OiAxMjM1LFxuICAgICAgICAgICAgICAgICAgICBvYmoyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgYXJyOiBbMSwgMiwgMywgMzMzXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICAgIC51c2UoXG4gICAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIH0gPSBnZXRIZWxwZXJzKCk7XG4gICAgICAgICAgICAgIGlmIChyZXR1cm5BbmRTZW5kUmVzcG9uc2UgfHwgIXJldHVybkFuZFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICBib2R5OiBcInRlc3R0XCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByZUhvb2tlZCh7XG4gICAgICAgIG11bHRpcGxpZXI6IDFcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoMTIzNCk7XG4gICAgICBleHBlY3QocmVzLm9iai5vYmoyLmFyci5sZW5ndGgpLnRvRXF1YWwoNCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZFwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybkFuZFNlbmRSZXNwb25zZSBieSBkZWZhdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKyBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcmVIb29rZWQgPSBpbnN0YW5jZTEyKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jIGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUgfHwgIWUpIHRocm93IEVycm9yKFwiRm9yY2VkIC4gTG9yZW0gaXBzdW1cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcHJlSG9va2VkKHtcbiAgICAgICAgbXVsdGlwbGllcjogMVxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCg1MDApO1xuICAgICAgZXhwZWN0KHJlcy5ib2R5KS50b01hdGNoKGBGb3JjZWQgLiBMb3JlbSBpcHN1bWApO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShgQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZCBhbmQgb3ZlcnJpZGUgd2l0aCBtaWRkbGV3YXJlJ3NgLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2Uoe1xuICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgb25DYXRjaDogZm4gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZm4oKSwge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybkFuZFNlbmRSZXNwb25zZSBieSBkZWZhdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKyBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcmVIb29rZWQgPSBpbnN0YW5jZTEyKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGNvbmZpZ3VyZToge1xuICAgICAgICAgICAgYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgb25DYXRjaDogZm4gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmbigpLCB7XG4gICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICBpZiAoZSB8fCAhZSkgdGhyb3cgRXJyb3IoXCJCYWNvbiBpcHN1bVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBwcmVIb29rZWQoe1xuICAgICAgICBtdWx0aXBsaWVyOiAxXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5zdGF0dXNDb2RlKS50b0VxdWFsKDQwMyk7XG4gICAgICBleHBlY3QocmVzLmJvZHkpLnRvRXF1YWwoXG4gICAgICAgIGBCYWNvbiBpcHN1bSAtIFVuZXhwZWN0ZWQgdG9rZW4gQiBpbiBKU09OIGF0IHBvc2l0aW9uIDBgXG4gICAgICApO1xuICAgICAgZXhwZWN0KHJlcykudG9TdHJpY3RFcXVhbCh7XG4gICAgICAgIGJvZHk6IGBCYWNvbiBpcHN1bSAtIFVuZXhwZWN0ZWQgdG9rZW4gQiBpbiBKU09OIGF0IHBvc2l0aW9uIDBgLFxuICAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBub3Qgb3ZlcnJpZGUvYXVnbWVudCBvdGhlciBtaWRkbGV3YXJlJ3NcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3VsdDogMiAqIGV2ZW50Lm11bHRpcGxpZXJcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHByZUhvb2tlZCA9IGluc3RhbmNlMTIoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgICBvbkNhdGNoOiBmbiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGZuKCksIHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwM1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyBlID0+IHtcbiAgICAgICAgICAgIC8vIGlmIChlIHx8ICFlKSB0aHJvdyBFcnJvcihcIkJhY29uIGlwc3VtXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByZUhvb2tlZCh7XG4gICAgICAgIG11bHRpcGxpZXI6IDJcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzLnJlc3VsdCkudG9FcXVhbCg0KTtcblxuICAgICAgY29uc3QgaGFuZGxlcjIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKiBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBiZWZvcmVIb29rVGhhdFRocm93cyA9IGluc3RhbmNlMTIoaGFuZGxlcjIpXG4gICAgICAgIC51c2UoXG4gICAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgb25DYXRjaDogZm4gPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGZuKCksIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMTIzXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVyOiBhc3luYyBlID0+IHtcbiAgICAgICAgICAgICAgLy8gaWYgKGUgfHwgIWUpIHRocm93IEVycm9yKFwiQmFjb24gaXBzdW0yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgLnVzZShcbiAgICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICAgICAgLy8gYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgLy8gICBvbkNhdGNoOiAoZm4sIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmbiguLi5hcmdzKSwge1xuICAgICAgICAgICAgICAvLyAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgICAgICAgIC8vICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlIHx8ICFlKSB0aHJvdyBFcnJvcihcIkJhY29uIGlwc3VtMjNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzMiA9IGF3YWl0IGJlZm9yZUhvb2tUaGF0VGhyb3dzKHtcbiAgICAgICAgbXVsdGlwbGllcjogN1xuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMyLnN0YXR1c0NvZGUpLnRvRXF1YWwoNTAwKTtcbiAgICAgIGV4cGVjdChyZXMyKS50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgYm9keTogYEJhY29uIGlwc3VtMjMgLSBVbmV4cGVjdGVkIHRva2VuIEIgaW4gSlNPTiBhdCBwb3NpdGlvbiAwYCxcbiAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShgQXN5bmNGdW5jdGlvbiBhdWdtZW50IC0gQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZCBhbmQgb3ZlcnJpZGUgd2l0aCBtaWRkbGV3YXJlJ3NgLCAoKSA9PiB7XG4gICAgaXQoXCIvLyBUT0RPXCIsICgpID0+IHtcbiAgICAgIGV4cGVjdCgxKS50b0VxdWFsKDEpO1xuICAgIH0pO1xuICB9KTtcbiAgLy8gYmVmb3JlRWFjaCgoKSA9PiB7XG4gIC8vICAgaW5zdGFuY2UxMiA9IENyZWF0ZUluc3RhbmNlKHtcbiAgLy8gICAgIGNvbmZpZ3VyZToge1xuICAvLyAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAvLyAgICAgICAgIG9uQ2F0Y2g6IGFzeW5jIChmbiwgLi4uYXJncykgPT4ge1xufSk7XG5cbmRlc2NyaWJlKGBQb3N0IEhvb2tgLCAoKSA9PiB7XG4gIGxldCBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuXG4gIGRlc2NyaWJlKFwiQmFzZU1pZGRsZXdhcmUgaGFuZGxlciBtZXRob2RcIiwgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIC8vIGl0Lm9ubHkoXCJzaG91bGQgc2hvdWxkIGZvcmNlIGNvbnN1bWUgbWV0aG9kcyBpbnZvY2F0aW9uIChzZXRFdmVudCwgc2V0Q29udGV4dCwgcmVzcG9uc2VPYmplY3RUb1Rocm93KVwiLCBhc3luYyAoKSA9PiB7XG5cbiAgICBpdChcInNob3VsZCBrZWVwIG93biBzdGF0ZSBvZiBldmVudCBhbmQgY29udGV4dCBhbmQgYXV0byByZXRydW4gaXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCwgY29udGV4dCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jICgpID0+IHt9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCBldmVudEZyb21TZXJ2ZXJsZXNzID0ge1xuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246IFwiZHVtbXkxMjNcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dEZyb21TZXJ2ZXJsZXNzID0geyByZXF1ZXN0Q29udGV4dDogMzIxIH07XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoXG4gICAgICAgIGV2ZW50RnJvbVNlcnZlcmxlc3MsXG4gICAgICAgIGNvbnRleHRGcm9tU2VydmVybGVzc1xuICAgICAgKTtcblxuICAgICAgZXhwZWN0KHJlcy5ldmVudCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuZXZlbnQuaGVhZGVycykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuZXZlbnQuaGVhZGVycy5BdXRob3JpemF0aW9uKS50b0VxdWFsKFwiZHVtbXkxMjNcIik7XG5cbiAgICAgIGV4cGVjdChyZXMuY29udGV4dCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuY29udGV4dC5yZXF1ZXN0Q29udGV4dCkudG9FcXVhbCgzMjEpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgZ2V0IGhhbmRsZXIgYXJndW1lbnQgb2JqZWN0IGFuZCBpbmNyZW1lbnQgaXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCwgY29udGV4dCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jICh7IGdldFBhcmFtcyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHZpZXdzOiBldmVudC52aWV3cyArIDEgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgZXZlbnRGcm9tU2VydmVybGVzcyA9IHtcbiAgICAgICAgdmlld3M6IDFcbiAgICAgIH07XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoZXZlbnRGcm9tU2VydmVybGVzcywge30pO1xuXG4gICAgICBleHBlY3QocmVzLmV2ZW50KS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlcy5ldmVudC52aWV3cykudG9FcXVhbCgyKTtcblxuICAgICAgZXhwZWN0KHJlcy5jb250ZXh0KS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlcy5jb250ZXh0LnJlcXVlc3RDb250ZXh0KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGdldCBjb250ZXh0IGFyZ3VtZW50IG9iamVjdCwgaW5jcmVtZW50IGl0IGFuZCByZXR1cm4gYXMgaHR0cCByZXNwb25zZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7IGV2ZW50LCBjb250ZXh0IH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBnZXRQID0gKGdldFBhcmFtcywgZ2V0SGVscGVycykgPT5cbiAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBldmVudCwgc2V0RXZlbnQgfSA9IGdldFBhcmFtcygpO1xuICAgICAgICAgICAgICBjb25zdCB7IHJldHVybkFuZFNlbmRSZXNwb25zZSB9ID0gZ2V0SGVscGVycygpO1xuXG4gICAgICAgICAgICAgIHNldEV2ZW50KHsgdmlld3M6IGV2ZW50LnZpZXdzICsgMSB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBldmVudCB2aWV3cyBzaG91bGQgYmUgMyBhbmQgd2UgZ290ICR7ZXZlbnQudmlld3N9YFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgLy8gcmVzb2x2ZSh7fSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRQYXJhbXMsIGdldEhlbHBlcnMgfSkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgZ2V0UChnZXRQYXJhbXMsIGdldEhlbHBlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGV2ZW50RnJvbVNlcnZlcmxlc3MgPSB7XG4gICAgICAgIHZpZXdzOiAyXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoZXZlbnRGcm9tU2VydmVybGVzcywge30pO1xuXG4gICAgICBleHBlY3QocmVzKS50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICBtZXNzYWdlOiBcImV2ZW50IHZpZXdzIHNob3VsZCBiZSAzIGFuZCB3ZSBnb3QgM1wiXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoYEF1dGggTWlkZGxld2FyZWAsICgpID0+IHtcbiAgbGV0IGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJBdXRoTWlkZGxld2FyZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSh7IERFQlVHOiB0cnVlIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIGVtcHR5IGV2ZW50LnVzZXIgd2hlbiBhdXRoIGZhaWxlZCBhbmQgc3RhdHVzQ29kZSA0MDNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIHsgZXZlbnQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEF1dGhNaWRkbGV3YXJlKHtcbiAgICAgICAgICBwcm9taXNpZnksXG4gICAgICAgICAgY29nbml0b0pXVERlY29kZUhhbmRsZXI6IGp3dGRlY29kZUFzeW5jSGFuZGxlclxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IFwidG9rZW5cIlxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCg0MDMpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIDUwMCB1cG9uIHN5bnRheCBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6ICh7IGdldFBhcmFtcyB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2xhaW1zID0gand0X2RlY29kZShgdG9rZW5gKTtcbiAgICAgICAgICAgICAgICAgIGlmIChjbGFpbXMgJiYgY2xhaW1zLmV4cCAmJiBjbGFpbXMuYXVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKG51bGwsIGNsYWltcyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KFwiaW52YWxpZCBjXCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGUgJiYgZS5tZXNzYWdlID8gYCR7ZS5tZXNzYWdlfWAgOiBlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChtc2csIG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBcInRva2VuXCJcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoNTAwKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJCYXNlTWlkZGxld2FyZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIHRoZSBzYW1lIGhhbmRsZXIgd2hlbiBubyBhdWdtZW50YXRpb24gbmVlZGVkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHsgYm9keTogMSB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5ib2R5KS50b0VxdWFsKDEpO1xuICAgICAgZXhwZWN0KHJlcy5ib2R5Mikubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCByZXR1cm4gdGhlIHNhbWUgaGFuZGxlciB3aGVuIG5vIGF1Z21lbnRhdGlvbiBuZWVkZWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoeyB0aHJlZTogMSB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5ib2R5KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgZXh0ZW5kIFwiZXZlbnRcIiBieSBhZGRpbmcgQXV0aCBDbGFpbXNgLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZXZlbnQsIHNldEV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgICAgICAgIHNldEV2ZW50KHtcbiAgICAgICAgICAgICAgY2xhaW1zOiB7IGVtYWlsOiBcInR5cnR5clwiIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIGhlYWRlcjogXCJleTEyM1wiLFxuICAgICAgICBib2R5OiAne1wic3RyaW5nXCI6IFwidG9PYmpcIn0nXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5jbGFpbXMuZW1haWwpLnRvRXF1YWwoXCJ0eXJ0eXJcIik7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGV4dGVuZCBcImV2ZW50XCIgYnkgbWFueSBtaWRkbGV3YXJlc2AsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IEJhc2VNaWRkbGV3YXJlV3JhcHBlciA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiAoeyBnZXRQYXJhbXMgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHRva2VuOiAxMjMgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHBsYW5fY29kZSA9IGV2ZW50LmJvZHkucGxhbl9jb2RlO1xuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudG9rZW4gPT09IDEyMyA/IFwidHlyb1wiIDogbnVsbDtcbiAgICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHsgc3RhdHVzQ29kZTogMjAxLCBuYW1lLCBwbGFuX2NvZGUgfSk7XG4gICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpXG4gICAgICAgIC51c2UoQmFzZU1pZGRsZXdhcmVXcmFwcGVyKCkpXG4gICAgICAgIC51c2UoQm9keVBhcnNlck1pZGRsZXdhcmUoKSk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIHRva2VuOiBcImV5MTIzXCIsXG4gICAgICAgIGJvZHk6ICd7XCJzdHJpbmdcIjogXCJ0b09iajJcIiwgXCJwbGFuX2NvZGVcIjogXCJzb21lcGxhbmNvZGVcIn0nXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5zdGF0dXNDb2RlKS50b0VxdWFsKDIwMSk7XG4gICAgICBleHBlY3QocmVzLm5hbWUpLnRvRXF1YWwoXCJ0eXJvXCIpO1xuICAgICAgZXhwZWN0KHJlcy5wbGFuX2NvZGUpLnRvRXF1YWwoXCJzb21lcGxhbmNvZGVcIik7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIHJldHVybiBuZXcgaW5zdGFuY2UgaWYgaW5zdGFuY2UgaXMgcmV1c2VkIGJ5IHBhc3NpbmcgZGlmZmVyZW50IGhhbmRsZXJgLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBCYXNlTWlkZGxld2FyZVdyYXBwZXIgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogKHsgZ2V0UGFyYW1zIH0pID0+IGdldFBhcmFtcygpLnNldEV2ZW50KHsgdG9rZW46IDEyNCB9KVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHBsYW5fY29kZSA9IGV2ZW50LmJvZHkucGxhbl9jb2RlO1xuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudG9rZW4gPT09IDEyNCA/IFwidHlybzJcIiA6IG51bGw7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHsgc3RhdHVzQ29kZTogMjAyLCBuYW1lLCBwbGFuX2NvZGUgfSk7XG4gICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlcjIgPSBhc3luYyBldmVudCA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcGxhbl9jb2RlID1cbiAgICAgICAgICAgIGV2ZW50ICYmIGV2ZW50LmJvZHkgJiYgZXZlbnQuYm9keS5wbGFuX2NvZGVcbiAgICAgICAgICAgICAgPyBldmVudC5ib2R5LnBsYW5fY29kZVxuICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudG9rZW4gPT09IDEyNCA/IFwidHlybzJcIiA6IG51bGw7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHsgc3RhdHVzQ29kZTogMjAzLCBuYW1lLCBwbGFuX2NvZGUgfSk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBlLm1lc3NhZ2VcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcilcbiAgICAgICAgLnVzZShCYXNlTWlkZGxld2FyZVdyYXBwZXIoKSlcbiAgICAgICAgLnVzZShCb2R5UGFyc2VyTWlkZGxld2FyZSgpKTtcblxuICAgICAgY29uc3QgaGFuZGxlcldpdGhObyA9IGluc3RhbmNlMShoYW5kbGVyMikudXNlKEJvZHlQYXJzZXJNaWRkbGV3YXJlKCkpO1xuXG4gICAgICBjb25zdCByZXMyID0gYXdhaXQgaGFuZGxlcldpdGhObyh7XG4gICAgICAgIHRva2VuOiBcImV5MTIzXCIsXG4gICAgICAgIGJvZHk6IHt9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgdG9rZW46IFwiZXkxMjNcIixcbiAgICAgICAgYm9keTogJ3tcInN0cmluZ1wiOiBcInRvT2JqMlwiLCBcInBsYW5fY29kZVwiOiBcInNvbWVwbGFuY29kZVwifSdcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzMi5zdGF0dXNDb2RlKS50b0VxdWFsKDIwMyk7XG4gICAgICBleHBlY3QocmVzMi5wbGFuX2NvZGUpLnRvQmVOdWxsKCk7XG5cbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCgyMDIpO1xuICAgICAgZXhwZWN0KHJlcy5uYW1lKS50b0VxdWFsKFwidHlybzJcIik7XG4gICAgICBleHBlY3QocmVzLnBsYW5fY29kZSkudG9FcXVhbChcInNvbWVwbGFuY29kZVwiKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJCb2R5UGFyc2VyIE1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGxldCBpbnN0YW5jZTE7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBleHRlbmQgXCJldmVudFwiIGJ5IHBhcnNpbmcgYm9keWAsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiB7IHByZWZpeDogZXZlbnQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJvZHlQYXJzZXJNaWRkbGV3YXJlKClcbiAgICAgICk7XG5cbiAgICAgIGxldCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoe1xuICAgICAgICBoZWFkZXI6IFwiZXkxMjNcIlxuICAgICAgfSk7XG4gICAgICBleHBlY3QocmVzLnByZWZpeC5ib2R5KS5ub3QudG9CZURlZmluZWQoKTtcblxuICAgICAgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgYm9keTogXCJcIlxuICAgICAgfSk7XG4gICAgICBleHBlY3QocmVzLnByZWZpeC5ib2R5KS50b0VxdWFsKFwiXCIpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZShgQ29uZmlndXJlIHRvIGJlIGNvbXBhdGlibGUgd2l0aCBFeHByZXNzYCwgKCkgPT4ge1xuICBkZXNjcmliZShgV2hlbiBhbiBlcnJvciBvciByZXR1cm5BbmRTZW5kUmVzcG9uc2UgaXMgY2FsbGVkLCB3ZSBjYWxsIG9uQ2F0Y2hgLCAoKSA9PiB7XG4gICAgbGV0IGluc3RhbmNlMTtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKHtcbiAgICAgICAgREVCVUc6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyZToge1xuICAgICAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgICAgICBvbkNhdGNoOiAocHJldk1ldGhvZHdpdGhBcmdzLCB7IHByZXZSYXdNZXRob2QsIGFyZyB9ID0ge30pID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHByZXZNZXRob2R3aXRoQXJncygpKS50b1N0cmljdEVxdWFsKHByZXZSYXdNZXRob2QoYXJnKSk7XG4gICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBwcmV2UmF3TWV0aG9kKGFyZyksIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIG5vdCBiZSBjYWxsZWQgd2hlbiB0aGVyZSBpcyBubyBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmbiA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIGNvbnRleHRcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvb2tlZEhhbmRsZXIgPSBpbnN0YW5jZTEoZm4pO1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaG9va2VkSGFuZGxlcih7IGJvZHk6IDEyMyB9LCB7fSk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgICBldmVudDoge1xuICAgICAgICAgIGJvZHk6IDEyM1xuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0OiB7fVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBiZSBhYmxlIHRvIGNhbGwgcmVzLmpzb24gdXBvbiBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSh7XG4gICAgICAgIERFQlVHOiB0cnVlLFxuICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgb25DYXRjaDogKFxuICAgICAgICAgICAgICBwcmV2TWV0aG9kd2l0aEFyZ3MsXG4gICAgICAgICAgICAgIHsgcHJldlJhd01ldGhvZCwgYXJnLCBjb250ZXh0IH0gPSB7fVxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChwcmV2TWV0aG9kd2l0aEFyZ3MoKSkudG9TdHJpY3RFcXVhbChwcmV2UmF3TWV0aG9kKGFyZykpO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHJlcyA9IE9iamVjdC5hc3NpZ24oe30sIHByZXZSYXdNZXRob2QoYXJnKSwge1xuICAgICAgICAgICAgICAgIGV4dHJhOiBcImZpZWxkX2FkZGVkXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lmpzb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dC5qc29uKHJlcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGZuID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnRcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvb2tlZEhhbmRsZXIgPSBpbnN0YW5jZTEoZm4pLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jICh7IGdldFBhcmFtcywgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgICBnZXRIZWxwZXJzKCkucmV0dXJuQW5kU2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAuLi5ldmVudFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaG9va2VkSGFuZGxlcih7IGJvZHk6IDEyMyB9LCBtb2NrZWRFeHByZXNzUmVzcG9uc2UoKSk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgICByZXNKc29uZWQ6IHRydWUsXG4gICAgICAgIGJvZHk6IDEyMyxcbiAgICAgICAgZXh0cmE6IFwiZmllbGRfYWRkZWRcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGl0KFwic2hvdWxkIGJlIGNhbGxlZCBhZnRlciBvbkNhdGNoXCIsIGFzeW5jICgpID0+IHtcbiAgICAvLyBpdChcInNob3VsZCBiZSBhYmxlIHRvIG92ZXJyaWRlL2F1Z21lbnQgb25DYXRjaFwiLCBhc3luYyAoKSA9PiB7XG4gIH0pO1xufSk7XG4iXX0=
