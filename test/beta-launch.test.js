import { CreateInstance, BaseMiddleware } from "../index";
import { promisify } from "util";

describe(`card-20369348 - Support dynamic handler arguments length.`, () => {
  describe(`BeforeHook - handler with 1 argument`, () => {
    let beforeHook;
    beforeEach(() => {
      beforeHook = CreateInstance();
    });

    it(`should accept a promisified handler.`, async () => {
      try {
        const handler = (var1, cb) => {
          if (var1 === 123) {
            return cb("some error here");
          }
        };

        const hooked = beforeHook(promisify(handler));
        await hooked(123);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it(`should accept handlers with 1 argument only last one being a callback. Scenario 2.`, async () => {
      try {
        const handler = (var1, cb) => {
          if (var1 === 123) {
            return cb("some error here");
          }

          return cb(null, { key: var1 });
        };

        const promised = promisify(handler);

        const hooked = beforeHook(promised);
        const result = await hooked(124);

        expect(result).toBeDefined();
        expect(result.key).toEqual(124);
      } catch (e) {
        // expect(e).toBeUndefined();
      }
    });

    it(`should accept handler and it's middleware which will update 1st param state.`, async () => {
      const main = async () => {
        const handler = arg1 => {
          arg1.number++;

          return { key: arg1 };
        };

        const hooked = beforeHook(handler).use(
          BaseMiddleware({
            handler: ({ getParams }) => {
              let [param1] = getParams();

              param1.number = 4;
            }
          })
        );

        const result = await hooked({});

        expect(result).toBeDefined();
        expect(Object.keys(result).length).toEqual(1);
        expect(result.key.number).toEqual(5);
      };

      await main();
    });

    describe(`BeforeHook - handler with more than 1 argument`, () => {
      let beforeHook;
      beforeEach(() => {
        beforeHook = CreateInstance();
      });

      it(`should accept handler and it's middleware which will reference args and mutate.`, async () => {
        const main = async () => {
          const handler = (numbers, colors) => {
            return { numbers, colors };
          };

          const hooked = beforeHook(handler).use(
            BaseMiddleware({
              handler: ({ getParams }) => {
                let [event, context] = getParams();
                event = context; // event is now colors;
                event["yellow"] = 250;
              }
            })
          );

          const result = await hooked([1, 2, 3], {
            red: "255-0-0",
            green: "0-255-0"
          });

          expect(result).toBeDefined();
          expect(result).toStrictEqual({
            colors: {
              yellow: 250,
              red: "255-0-0",
              green: "0-255-0"
            },
            numbers: [1, 2, 3]
          });
        };

        await main();
      });
    });
  });
});

describe(`issue-1 - Allow passing an array of handlers to beforeHook.`, () => {
  describe(`BeforeHook - handler with 1 argument`, () => {
    let beforeHook;
    beforeEach(() => {
      beforeHook = CreateInstance({ DEBUG: true });
    });

    it(`should accept a mixed type of handler.`, async () => {
      let handler1 = async (object1, object2) => ({ object1, object2 });
      let handler2 = async (_, { fn }) => {
        return fn(1, 2);
      };
      let handler3 = ({ num }) => num ** 2;

      [handler1, handler2, handler3] = beforeHook([
        handler1,
        handler2,
        handler3
      ]).use(
        BaseMiddleware({
          handler: ({ getParams }) => {
            const [arg1, arg2] = getParams();

            if (arg1 === null) {
              arg2.fn = (num1, num2) => num1 * 5 + num2 ** 3;
            } else if (!arg1.num) {
              arg1.val = 123;
              arg2.val = 456;
            } else {
              arg1.num = 5;
            }
          }
        })
      );

      const res1 = await handler2(null, { fn: (n1, n2) => n1 + n2 });
      const res2 = await handler1({}, {});
      const res3 = await handler3({ num: 4 });
      expect(res1).toStrictEqual(13);
      expect(res2).toStrictEqual({
        object1: { val: 123 },
        object2: { val: 456 }
      });
      expect(res3).toStrictEqual(25);
    });

    it(`should allow .use for more hook per resulting handler.`, async () => {
      const fetchObject = () =>
        new Promise(resolve => {
          setTimeout(() => {
            return resolve({
              num1: 10,
              num2: 20
            });
          }, 300);
        });

      let [handler1, handler2] = beforeHook([
        async (event, context) => {
          return {
            event,
            context
          };
        },
        async (event, context) => {
          return {
            event,
            context
          };
        }
      ]).use(
        BaseMiddleware({
          handler: async ({ getParams }) => {
            const [event, context] = getParams();
            event.val = await fetchObject();
          }
        })
      );

      handler2 = handler2
        .use(
          BaseMiddleware({
            handler: ({ getParams }) => {
              const [event, context] = getParams();
              context.v = 5;
            }
          })
        )
        .use(
          BaseMiddleware({
            handler: ({ getParams }) => {
              const [event, context] = getParams();
              context.v *= 5;
            }
          })
        );

      const res1 = await handler1({}, {});
      const res2 = await handler2({}, {});

      expect(res1).toStrictEqual({
        event: { val: { num1: 10, num2: 20 } },
        context: {}
      });
      expect(res2).toStrictEqual({
        event: { val: { num1: 10, num2: 20 } },
        context: { v: 25 }
      });
    });
  });
});

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

describe(`onCatch and onReturnResponse.`, () => {
  describe(`onCatch`, () => {
    let instance1;

    it(`should NOT be called when there is no "hook exception"`, async () => {
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

      const fn = async (event, context) => {
        return {
          event,
          context
        };
      };

      const withHook = instance1(fn).use(
        BaseMiddleware({
          handler: () => {}
        })
      );

      const result = await withHook({}, {});
      expect(result).toStrictEqual({
        event: {},
        context: {}
      });
    });

    it("should be called upon hook exceptions - and return a json by default", async () => {
      instance1 = CreateInstance({
        DEBUG: true
      });

      const fn = async (event, context) => {
        return {
          event,
          context
        };
      };

      const withHook = instance1(fn).use(
        BaseMiddleware({
          handler: () => {
            throw ReferenceError("developers error");
          }
        })
      );

      const result = await withHook({}, {});
      expect(result.statusCode).toEqual(500);
      expect(result).toStrictEqual({
        statusCode: 500,
        body: "developers error"
      });
    });

    it("should call base onCatch upon hook exceptions", async () => {
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

      const fn = async (event, context) => {
        return {
          event,
          context
        };
      };

      const withHook = instance1(fn).use(
        BaseMiddleware({
          handler: () => {
            throw ReferenceError("developers error");
          }
        })
      );

      const result = await withHook({}, {});
      expect(result.statusCode).toEqual(500);
      expect(result).toStrictEqual({
        headers: { "Access-Control-Allow-Origin": "*" },
        statusCode: 500,
        body: "developers error"
      });
    });
  });
});

describe(`Express JS.`, () => {
  describe(`Short circuit functions onCatch, onReply, and onNext`, () => {
    describe(`onCatch`, () => {
      let withHook;
      beforeEach(() => {
        withHook = CreateInstance({
          DEBUG: true,
          configure: {
            augmentMethods: {
              onCatch: (prevMethodwithArgs, { prevRawMethod, arg } = {}) => {
                return Object.assign({}, prevRawMethod(arg), {
                  headers: { "Access-Control-Allow-Origin": "*" }
                });
              }
            }
          }
        });
      });

      it("should be called when there is an exeption thrown", async () => {
        let handler = async (event, context) => {
          return {
            event,
            context
          };
        };

        handler = withHook(handler).use(
          BaseMiddleware({
            handler: test1 => {
              if (test1 || !test1) {
                throw Error("test1");
              }
            }
          })
        );

        const result = await handler(1, 3);
        expect(result).toStrictEqual({
          statusCode: 500,
          body: "test1",
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      });

      it("should NOT be called when there is no exeption thrown", async () => {
        let handler = async (event, context) => {
          return {
            event,
            context
          };
        };

        handler = withHook(handler).use(
          BaseMiddleware({
            handler: () => {}
          })
        );

        const result = await handler(1, 2);
        expect(result.event).toEqual(1);
        expect(result.context).toEqual(2);
      });
    });

    describe(`reply`, () => {
      let withHook;
      beforeEach(() => {
        withHook = CreateInstance({
          DEBUG: true,
          configure: {
            augmentMethods: {
              onCatch: (prevMethodwithArgs, { prevRawMethod, arg } = {}) => {
                return Object.assign({}, prevRawMethod(arg), {
                  headers: { "Access-Control-Allow-Origin": "*" }
                });
              }
            }
          }
        });
      });

      it("should not trigger onCatch", async () => {
        let handler = async (event, context) => {
          return {
            event,
            context
          };
        };

        handler = withHook(handler).use(
          BaseMiddleware({
            handler: ({ reply }) => {
              reply({
                num: 123,
                letter: ["a", "z"]
              });
            }
          })
        );

        const result = await handler(1, 2);

        expect(result).toStrictEqual({
          num: 123,
          letter: ["a", "z"]
        });
      });

      it("should trigger onReturnObject", async () => {
        withHook = CreateInstance({
          DEBUG: true,
          configure: {
            augmentMethods: {
              onReturnObject: () => {
                return {
                  one: "1"
                };
              }
            }
          }
        });

        let handler = (event, context) => {
          return {
            event,
            context
          };
        };

        handler = withHook(handler).use(
          BaseMiddleware({
            handler: ({ reply }) => {
              reply({
                num: 123,
                letter: ["a", "z"]
              });
            }
          })
        );

        const result = await handler(1, 2);

        expect(result).toStrictEqual({
          one: "1"
        });
      });
    });
  });

  describe(`Configure to be compatible with Express`, () => {
    describe(`When an error but not "reply" is triggered, we call onCatch`, () => {
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
                { prevRawMethod, arg, getParams } = {}
              ) => {
                const [req, res] = getParams();
                expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));

                const result = Object.assign({}, prevRawMethod(arg), {
                  extra: "field_added",
                  headers: { "Access-Control-Allow-Origin": "*" }
                });

                if (res && res.json) {
                  return res.json(result);
                }

                return result;
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
            handler: async ({ getParams }) => {
              const [event] = getParams();
              if (event) {
                throw Error("test");
              }
            }
          })
        );
        const res = await hookedHandler({ body: 123 }, mockedExpressResponse());

        expect(res).toStrictEqual({
          statusCode: 500,
          resJsoned: true,
          body: "test",
          extra: "field_added",
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      });

      // it("should be called after onCatch", async () => {
      // it("should be able to override/augment onCatch", async () => {
    });
  });
});
