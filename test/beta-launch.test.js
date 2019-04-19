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

      //   await expect(main()).not.toThrow();
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

        //   await expect(main()).not.toThrow();
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

fdescribe(`Express JS.`, () => {
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
            handler: async ({ getParams, getHelpers }) => {
              const [event] = getParams();
              if (event) {
                getHelpers().returnAndSendResponse({
                  ...event
                });
              }
            }
          })
        );
        const res = await hookedHandler({ "body": 123 }, mockedExpressResponse());

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
});
