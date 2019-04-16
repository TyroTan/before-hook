"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

require("source-map-support/register");

var _util = require("util");

var _index = require("../index.js");

var CognitoDecodeVerifyJWTInit = require("./token-decode-test");

var jwt_decode = require("jwt-decode");

var jwtdecodeAsyncHandler = CognitoDecodeVerifyJWTInit({
  jwt_decode: jwt_decode
}).UNSAFE_BUT_FAST_handler;

var mockedExpressResponse = function mockedExpressResponse() {
  return {
    send: function send(code, data) {
      return {
        statusCode: code,
        data: data
      };
    },
    json: function json(data) {
      return (0, _objectSpread2["default"])({}, data, {
        resJsoned: true
      });
    }
  };
};

var isAsyncFunction = function isAsyncFunction(fn) {
  return fn && fn.constructor && fn.constructor.name === "AsyncFunction";
};

var AuthMiddleware = function AuthMiddleware() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      promisify = _ref.promisify,
      cognitoJWTDecodeHandler = _ref.cognitoJWTDecodeHandler;

  if (promisify && typeof promisify !== "function" || cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function") {
    throw Error("invalid (promisify and cognitoJWTDecodeHandler) passed. ".concat((0, _typeof2["default"])(promisify), ",  ").concat((0, _typeof2["default"])(cognitoJWTDecodeHandler)));
  }

  return (0, _index.BaseMiddleware)({
    configure: {
      augmentMethods: {
        onCatch: function onCatch() {
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
    handler: function () {
      var _handler = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(_ref2) {
        var getParams, getHelpers, _getParams, event, setEvent, context, _getHelpers, returnAndSendResponse, newEventHeaders, promised, claims;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                getParams = _ref2.getParams, getHelpers = _ref2.getHelpers;
                _getParams = getParams(), event = _getParams.event, setEvent = _getParams.setEvent, context = _getParams.context;
                _getHelpers = getHelpers(), returnAndSendResponse = _getHelpers.returnAndSendResponse;

                if (!(!event || !event.headers)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", {});

              case 5:
                newEventHeaders = (0, _objectSpread2["default"])({}, event.headers);

                if (!newEventHeaders.Authorization) {
                  newEventHeaders.Authorization = newEventHeaders.authorization;
                }

                promised = cognitoJWTDecodeHandler;

                if (!isAsyncFunction(promised)) {
                  promised = promisify(promised);
                }

                _context.next = 11;
                return promised(Object.assign({}, event, {
                  headers: newEventHeaders
                }), context);

              case 11:
                claims = _context.sent;

                if (!(!claims || typeof claims.sub !== "string")) {
                  _context.next = 14;
                  break;
                }

                return _context.abrupt("return", returnAndSendResponse({
                  statusCode: 403,
                  body: "Invalid Session",
                  headers: {
                    "Access-Control-Allow-Origin": "*"
                  }
                }));

              case 14:
                setEvent({
                  user: claims
                });
                return _context.abrupt("return", {});

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function handler(_x) {
        return _handler.apply(this, arguments);
      }

      return handler;
    }()
  });
};

var test1 = {
  handler: function handler() {},
  // params are optional
  result: 0,
  msg: "params are optional"
};
var test2 = {
  handler: function handler(event) {},
  result: 1,
  msg: "params are optional"
};
var test3 = {
  handler: function handler(e) {},
  result: 1,
  msg: "1st param need to be event and not e"
};
var test4 = {
  handler: function handler(events) {},
  result: 1,
  msg: "1st param need to be event and not events"
};
var test5 = {
  handler: function handler(event, context) {},
  result: 2,
  msg: "params are optional"
};
var test6 = {
  handler: function handler(event, context123) {},
  result: 2,
  msg: "2nd param need to be context and not context123"
};
var test7 = {
  handler: function handler(event, context, callback) {},
  result: 3,
  msg: "params are optional"
};
var test8 = {
  handler: function handler(event, context, callbac) {},
  result: 3,
  msg: "3rd param need to be callback and not callbac"
};
describe("getHandlerArgumentsLength", function () {
  describe("test getHandlerArgumentsLength correctness", function () {
    it("should accept ~ ".concat(test1.msg, " = ").concat(test1.result, " length. ").concat(test1.handler.toString()), function () {
      var handler = test1.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test1.result);
    });
    it("should accept ~ ".concat(test2.msg, " = ").concat(test2.result, " length. ").concat(test2.handler.toString()), function () {
      var handler = test2.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test2.result);
    });
    it("should accept ~ ".concat(test5.msg, " = ").concat(test5.result, " length. ").concat(test5.handler.toString()), function () {
      var handler = test5.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test5.result);
    });
    it("should accept ~ ".concat(test7.msg, " = ").concat(test7.result, " length. ").concat(test7.handler.toString()), function () {
      var handler = test7.handler;
      expect((0, _index.getHandlerArgumentsLength)(handler)).toEqual(test7.result);
    });
  });
  describe.skip("test validateHandler INVALID scenario", function () {
    it("should NOT accept ~ ".concat(test3.msg, " ").concat(test3.handler.toString()), function () {
      var handler = test3.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it("should NOT accept ~ ".concat(test4.msg, " ").concat(test4.handler.toString()), function () {
      var handler = test4.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it("should NOT accept ~ ".concat(test6.msg, " ").concat(test6.handler.toString()), function () {
      var handler = test6.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it("should NOT accept ~ ".concat(test8.msg, " ").concat(test8.handler.toString()), function () {
      var handler = test8.handler;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
  });
  describe.skip("test validateHandler EDGE cases", function () {
    var fn1 = function fn1(event,
    /* comments, */
    context, callback) {};

    it("should accept with comments ~ ".concat(fn1.toString()), function () {
      var handler = fn1;
      /* Future Feature
       * expect(validateHandler(handler)).toEqual(true);
       */

      expect(function () {
        return (0, _index.validateHandler)(handler);
      }).toThrow(Error);
    });

    var fn2 = function fn2(event,
    /* comments, */
    context, Callback) {};

    it("should NoT accept case sensitive ~ ".concat(fn2.toString()), function () {
      var handler = fn2;
      expect((0, _index.validateHandler)(handler)).toEqual(false);
    });
    it("should accept const hello = (event, context) => {", function () {
      var hello =
      /*#__PURE__*/
      function () {
        var _ref3 = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee2(event, context) {
          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  return _context2.abrupt("return", {});

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        return function hello(_x2, _x3) {
          return _ref3.apply(this, arguments);
        };
      }();

      console.log("hello tostr", hello.toString());
      expect((0, _index.validateHandler)(hello)).toEqual(true);
    });
  });
});
describe("CreateInstance", function () {
  var instance1 = (0, _index.CreateInstance)();
  describe("Test errors or throws", function () {
    it("should show error message", function () {
      var expected = "Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}";

      try {
        instance1(function (e) {});
      } catch (e) {
        expect(e.message).toEqual(expect.stringContaining(expected));
      }
    });
  });
  describe(".use", function () {
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should not throw error upon initialsation", function () {// const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
      // try {
      //   instance1(e => {});
      // } catch (e) {
      //   expect(e.message).toEqual(expect.stringContaining(expected));
      // }
    });
    it("should only throw exception once the handler is called", function () {// const expected = `Please use the exact argument names of the handler as the following event,context,callback or simply (event, context) => {} or () => {}`;
      // try {
      //   instance1(e => {});
      // } catch (e) {
      //   expect(e.message).toEqual(expect.stringContaining(expected));
      // }
    });
  });
});
describe("AsyncFunction support", function () {
  describe("AsyncFunction handler", function () {
    var instance1 = (0, _index.CreateInstance)();
    beforeAll(function () {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should be accepted", function () {
      expect(function () {
        return instance1(
        /*#__PURE__*/
        (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee3() {
          return _regenerator["default"].wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        })));
      }).not.toThrow();
    });
    it("should not throw when handler is a basic async fn",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee5() {
      var basicAsyncHandler, asyncHandlerWithCW, res1;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              basicAsyncHandler =
              /*#__PURE__*/
              function () {
                var _ref6 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee4(event, context) {
                  return _regenerator["default"].wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          return _context4.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4);
                }));

                return function basicAsyncHandler(_x4, _x5) {
                  return _ref6.apply(this, arguments);
                };
              }();

              _context5.next = 3;
              return expect(function () {
                return instance1(basicAsyncHandler).not.toThrow();
              });

            case 3:
              asyncHandlerWithCW = instance1(basicAsyncHandler);
              _context5.next = 6;
              return asyncHandlerWithCW({
                eventProperty1: "some value1"
              }, {
                contextProperty1: "some value2"
              });

            case 6:
              res1 = _context5.sent;
              expect(res1.event.eventProperty1).toEqual("some value1");
              expect(res1.event.eventProperty1).not.toEqual("");
              expect(res1.context.contextProperty1).toEqual("some value2");

            case 10:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })));
  });
  describe("AsyncFunction handler + AsyncFunction middleware", function () {
    var instance1 = (0, _index.CreateInstance)();
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should be accepted", function () {
      var inv = (0, _index.BaseMiddleware)({
        handler: function () {
          var _handler2 = (0, _asyncToGenerator2["default"])(
          /*#__PURE__*/
          _regenerator["default"].mark(function _callee6(_ref7) {
            var getParams, _getParams2, event, setEvent, promisify, promised, claims;

            return _regenerator["default"].wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    getParams = _ref7.getParams;
                    _getParams2 = getParams(), event = _getParams2.event, setEvent = _getParams2.setEvent;
                    promisify = require("util").promisify;

                    if (!(!event || !event.headers)) {
                      _context6.next = 5;
                      break;
                    }

                    return _context6.abrupt("return", {});

                  case 5:
                    event.headers.Authorization = !event.headers.Authorization ? event.headers.authorization : event.headers.Authorization;
                    promised = promisify(jwtdecodeAsyncHandler);
                    _context6.next = 9;
                    return promised(event, context);

                  case 9:
                    claims = _context6.sent;

                    if (claims && claims.sub && typeof claims.sub === "string") {
                      setEvent({
                        user: claims
                      });
                    }

                  case 11:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6);
          }));

          function handler(_x6) {
            return _handler2.apply(this, arguments);
          }

          return handler;
        }()
      });
      inv.isHookMiddleware = true;
      expect(function () {
        instance1(
        /*#__PURE__*/
        (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee7() {
          return _regenerator["default"].wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7);
        }))).use(inv)();
      }).not.toThrow();
    });
    it("should not throw when handler is a basic async fn",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee9() {
      var basicAsyncHandler, asyncHandlerWithCW, res1;
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              basicAsyncHandler =
              /*#__PURE__*/
              function () {
                var _ref10 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee8(event, context) {
                  return _regenerator["default"].wrap(function _callee8$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          return _context8.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context8.stop();
                      }
                    }
                  }, _callee8);
                }));

                return function basicAsyncHandler(_x7, _x8) {
                  return _ref10.apply(this, arguments);
                };
              }();

              _context9.next = 3;
              return expect(function () {
                return instance1(basicAsyncHandler).not.toThrow();
              });

            case 3:
              asyncHandlerWithCW = instance1(basicAsyncHandler);
              _context9.next = 6;
              return asyncHandlerWithCW({
                eventProperty1: "some value1"
              }, {
                contextProperty1: "some value2"
              });

            case 6:
              res1 = _context9.sent;
              expect(res1.event.eventProperty1).toEqual("some value1");
              expect(res1.event.eventProperty1).not.toEqual("");
              expect(res1.context.contextProperty1).toEqual("some value2");

            case 10:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    })));
    it("should work with async middleware",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee12() {
      var inv, h, newHn, res1;
      return _regenerator["default"].wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              inv = (0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler3 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee10(_ref12) {
                    var getParams;
                    return _regenerator["default"].wrap(function _callee10$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            getParams = _ref12.getParams;
                            return _context10.abrupt("return", new Promise(function (resolve) {
                              setTimeout(function () {
                                var _getParams3 = getParams(),
                                    setEvent = _getParams3.setEvent;

                                setEvent({
                                  user: {
                                    email: "email@example.com"
                                  }
                                });
                                resolve();
                              }, 1);
                            }));

                          case 2:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee10);
                  }));

                  function handler(_x9) {
                    return _handler3.apply(this, arguments);
                  }

                  return handler;
                }()
              });

              h =
              /*#__PURE__*/
              function () {
                var _ref13 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee11(event, context) {
                  return _regenerator["default"].wrap(function _callee11$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          return _context11.abrupt("return", {
                            e: event,
                            c: context
                          });

                        case 1:
                        case "end":
                          return _context11.stop();
                      }
                    }
                  }, _callee11);
                }));

                return function h(_x10, _x11) {
                  return _ref13.apply(this, arguments);
                };
              }();

              newHn = instance1(h).use(inv);
              _context12.next = 5;
              return newHn({
                headers: {
                  Authorization: "token1"
                }
              });

            case 5:
              res1 = _context12.sent;
              expect(res1.e.user).toBeDefined();
              expect(res1.e.user.email).toEqual("email@example.com");

            case 8:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    })));
  });
});
describe("Error Handling", function () {
  var instance12 = (0, _index.CreateInstance)();
  describe("CreateInstance", function () {
    beforeEach(function () {
      instance12 = (0, _index.CreateInstance)({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: function onCatch(prevMethodwithArgs) {
              var _ref14 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                  prevRawMethod = _ref14.prevRawMethod,
                  arg = _ref14.arg;

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
    it("should cause the handler call to stop and return response at the middleware which invoked returnAndSendResponse",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee16() {
      var handler, preHooked, res;
      return _regenerator["default"].wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref16 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee13(event, context) {
                  return _regenerator["default"].wrap(function _callee13$(_context13) {
                    while (1) {
                      switch (_context13.prev = _context13.next) {
                        case 0:
                          return _context13.abrupt("return", {
                            result: 2 + event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context13.stop();
                      }
                    }
                  }, _callee13);
                }));

                return function handler(_x12, _x13) {
                  return _ref16.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler4 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee14(_ref17) {
                    var getHelpers, _getHelpers2, returnAndSendResponse;

                    return _regenerator["default"].wrap(function _callee14$(_context14) {
                      while (1) {
                        switch (_context14.prev = _context14.next) {
                          case 0:
                            getHelpers = _ref17.getHelpers;
                            _getHelpers2 = getHelpers(), returnAndSendResponse = _getHelpers2.returnAndSendResponse;

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

                          case 3:
                          case "end":
                            return _context14.stop();
                        }
                      }
                    }, _callee14);
                  }));

                  function handler(_x14) {
                    return _handler4.apply(this, arguments);
                  }

                  return handler;
                }()
              })).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler5 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee15(_ref18) {
                    var getHelpers, _getHelpers3, returnAndSendResponse;

                    return _regenerator["default"].wrap(function _callee15$(_context15) {
                      while (1) {
                        switch (_context15.prev = _context15.next) {
                          case 0:
                            getHelpers = _ref18.getHelpers;
                            _getHelpers3 = getHelpers(), returnAndSendResponse = _getHelpers3.returnAndSendResponse;

                            if (returnAndSendResponse || !returnAndSendResponse) {
                              returnAndSendResponse({
                                statusCode: 500,
                                body: "testt"
                              });
                            }

                          case 3:
                          case "end":
                            return _context15.stop();
                        }
                      }
                    }, _callee15);
                  }));

                  function handler(_x15) {
                    return _handler5.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context16.next = 4;
              return preHooked({
                multiplier: 1
              });

            case 4:
              res = _context16.sent;
              expect(res.statusCode).toEqual(1234);
              expect(res.obj.obj2.arr.length).toEqual(4);

            case 7:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16);
    })));
  });
  describe("CreateInstance configure method", function () {
    beforeEach(function () {
      instance12 = (0, _index.CreateInstance)();
    });
    it("should returnAndSendResponse by default",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee19() {
      var handler, preHooked, res;
      return _regenerator["default"].wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref20 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee17(event, context) {
                  return _regenerator["default"].wrap(function _callee17$(_context17) {
                    while (1) {
                      switch (_context17.prev = _context17.next) {
                        case 0:
                          return _context17.abrupt("return", {
                            result: 2 + event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context17.stop();
                      }
                    }
                  }, _callee17);
                }));

                return function handler(_x16, _x17) {
                  return _ref20.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler6 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee18(e) {
                    return _regenerator["default"].wrap(function _callee18$(_context18) {
                      while (1) {
                        switch (_context18.prev = _context18.next) {
                          case 0:
                            if (!(e || !e)) {
                              _context18.next = 2;
                              break;
                            }

                            throw Error("Forced . Lorem ipsum");

                          case 2:
                          case "end":
                            return _context18.stop();
                        }
                      }
                    }, _callee18);
                  }));

                  function handler(_x18) {
                    return _handler6.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context19.next = 4;
              return preHooked({
                multiplier: 1
              });

            case 4:
              res = _context19.sent;
              expect(res.statusCode).toEqual(500);
              expect(res.body).toMatch("Forced . Lorem ipsum");

            case 7:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee19);
    })));
  });
  describe("CreateInstance configure method and override with middleware's", function () {
    beforeEach(function () {
      instance12 = (0, _index.CreateInstance)({
        configure: {
          augmentMethods: {
            onCatch: function onCatch(fn) {
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
    it("should returnAndSendResponse by default",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee22() {
      var handler, preHooked, res;
      return _regenerator["default"].wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref22 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee20(event, context) {
                  return _regenerator["default"].wrap(function _callee20$(_context20) {
                    while (1) {
                      switch (_context20.prev = _context20.next) {
                        case 0:
                          return _context20.abrupt("return", {
                            result: 2 + event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context20.stop();
                      }
                    }
                  }, _callee20);
                }));

                return function handler(_x19, _x20) {
                  return _ref22.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                configure: {
                  augmentMethods: {
                    onCatch: function onCatch(fn) {
                      return Object.assign({}, fn(), {
                        statusCode: 403
                      });
                    }
                  }
                },
                handler: function () {
                  var _handler7 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee21(e) {
                    return _regenerator["default"].wrap(function _callee21$(_context21) {
                      while (1) {
                        switch (_context21.prev = _context21.next) {
                          case 0:
                            if (!(e || !e)) {
                              _context21.next = 2;
                              break;
                            }

                            throw Error("Bacon ipsum");

                          case 2:
                          case "end":
                            return _context21.stop();
                        }
                      }
                    }, _callee21);
                  }));

                  function handler(_x21) {
                    return _handler7.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context22.next = 4;
              return preHooked({
                multiplier: 1
              });

            case 4:
              res = _context22.sent;
              expect(res.statusCode).toEqual(403);
              expect(res.body).toEqual("Bacon ipsum - Unexpected token B in JSON at position 0");
              expect(res).toStrictEqual({
                body: "Bacon ipsum - Unexpected token B in JSON at position 0",
                statusCode: 403,
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
              });

            case 8:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22);
    })));
    it("should not override/augment other middleware's",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee28() {
      var handler, preHooked, res, handler2, beforeHookThatThrows, res2;
      return _regenerator["default"].wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref24 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee23(event, context) {
                  return _regenerator["default"].wrap(function _callee23$(_context23) {
                    while (1) {
                      switch (_context23.prev = _context23.next) {
                        case 0:
                          return _context23.abrupt("return", {
                            result: 2 * event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context23.stop();
                      }
                    }
                  }, _callee23);
                }));

                return function handler(_x22, _x23) {
                  return _ref24.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                configure: {
                  augmentMethods: {
                    onCatch: function onCatch(fn) {
                      return Object.assign({}, fn(), {
                        statusCode: 403
                      });
                    }
                  }
                },
                handler: function () {
                  var _handler8 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee24(e) {
                    return _regenerator["default"].wrap(function _callee24$(_context24) {
                      while (1) {
                        switch (_context24.prev = _context24.next) {
                          case 0:
                          case "end":
                            return _context24.stop();
                        }
                      }
                    }, _callee24);
                  }));

                  function handler(_x24) {
                    return _handler8.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context28.next = 4;
              return preHooked({
                multiplier: 2
              });

            case 4:
              res = _context28.sent;
              expect(res.result).toEqual(4);

              handler2 =
              /*#__PURE__*/
              function () {
                var _ref25 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee25(event, context) {
                  return _regenerator["default"].wrap(function _callee25$(_context25) {
                    while (1) {
                      switch (_context25.prev = _context25.next) {
                        case 0:
                          return _context25.abrupt("return", {
                            result: 2 * event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context25.stop();
                      }
                    }
                  }, _callee25);
                }));

                return function handler2(_x25, _x26) {
                  return _ref25.apply(this, arguments);
                };
              }();

              beforeHookThatThrows = instance12(handler2).use((0, _index.BaseMiddleware)({
                configure: {
                  augmentMethods: {
                    onCatch: function onCatch(fn) {
                      return Object.assign({}, fn(), {
                        statusCode: 123
                      });
                    }
                  }
                },
                handler: function () {
                  var _handler9 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee26(e) {
                    return _regenerator["default"].wrap(function _callee26$(_context26) {
                      while (1) {
                        switch (_context26.prev = _context26.next) {
                          case 0:
                          case "end":
                            return _context26.stop();
                        }
                      }
                    }, _callee26);
                  }));

                  function handler(_x27) {
                    return _handler9.apply(this, arguments);
                  }

                  return handler;
                }()
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
                handler: function () {
                  var _handler10 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee27(e) {
                    return _regenerator["default"].wrap(function _callee27$(_context27) {
                      while (1) {
                        switch (_context27.prev = _context27.next) {
                          case 0:
                            if (!(e || !e)) {
                              _context27.next = 2;
                              break;
                            }

                            throw Error("Bacon ipsum23");

                          case 2:
                          case "end":
                            return _context27.stop();
                        }
                      }
                    }, _callee27);
                  }));

                  function handler(_x28) {
                    return _handler10.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context28.next = 10;
              return beforeHookThatThrows({
                multiplier: 7
              });

            case 10:
              res2 = _context28.sent;
              expect(res2.statusCode).toEqual(500);
              expect(res2).toStrictEqual({
                body: "Bacon ipsum23 - Unexpected token B in JSON at position 0",
                statusCode: 500,
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
              });

            case 13:
            case "end":
              return _context28.stop();
          }
        }
      }, _callee28);
    })));
  });
  describe("AsyncFunction augment - CreateInstance configure method and override with middleware's", function () {
    it("// TODO", function () {
      expect(1).toEqual(1);
    });
  }); // beforeEach(() => {
  //   instance12 = CreateInstance({
  //     configure: {
  //       augmentMethods: {
  //         onCatch: async (fn, ...args) => {
});
describe("Post Hook", function () {
  var instance1 = (0, _index.CreateInstance)();
  describe("BaseMiddleware handler method", function () {
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)();
    }); // it.only("should should force consume methods invocation (setEvent, setContext, responseObjectToThrow)", async () => {

    it("should keep own state of event and context and auto retrun it",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee31() {
      var handler, handlerPlusMiddleware, eventFromServerless, contextFromServerless, res;
      return _regenerator["default"].wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref27 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee29(event, context) {
                  return _regenerator["default"].wrap(function _callee29$(_context29) {
                    while (1) {
                      switch (_context29.prev = _context29.next) {
                        case 0:
                          return _context29.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context29.stop();
                      }
                    }
                  }, _callee29);
                }));

                return function handler(_x29, _x30) {
                  return _ref27.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler11 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee30() {
                    return _regenerator["default"].wrap(function _callee30$(_context30) {
                      while (1) {
                        switch (_context30.prev = _context30.next) {
                          case 0:
                          case "end":
                            return _context30.stop();
                        }
                      }
                    }, _callee30);
                  }));

                  function handler() {
                    return _handler11.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              eventFromServerless = {
                headers: {
                  Authorization: "dummy123"
                }
              }, contextFromServerless = {
                requestContext: 321
              };
              _context31.next = 5;
              return handlerPlusMiddleware(eventFromServerless, contextFromServerless);

            case 5:
              res = _context31.sent;
              expect(res.event).toBeDefined();
              expect(res.event.headers).toBeDefined();
              expect(res.event.headers.Authorization).toEqual("dummy123");
              expect(res.context).toBeDefined();
              expect(res.context.requestContext).toEqual(321);

            case 11:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee31);
    })));
    it("should get handler argument object and increment it",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee34() {
      var handler, handlerPlusMiddleware, eventFromServerless, res;
      return _regenerator["default"].wrap(function _callee34$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref29 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee32(event, context) {
                  return _regenerator["default"].wrap(function _callee32$(_context32) {
                    while (1) {
                      switch (_context32.prev = _context32.next) {
                        case 0:
                          return _context32.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context32.stop();
                      }
                    }
                  }, _callee32);
                }));

                return function handler(_x31, _x32) {
                  return _ref29.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler12 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee33(_ref30) {
                    var getParams, _getParams4, event, setEvent;

                    return _regenerator["default"].wrap(function _callee33$(_context33) {
                      while (1) {
                        switch (_context33.prev = _context33.next) {
                          case 0:
                            getParams = _ref30.getParams;
                            _getParams4 = getParams(), event = _getParams4.event, setEvent = _getParams4.setEvent;
                            setEvent({
                              views: event.views + 1
                            });

                          case 3:
                          case "end":
                            return _context33.stop();
                        }
                      }
                    }, _callee33);
                  }));

                  function handler(_x33) {
                    return _handler12.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              eventFromServerless = {
                views: 1
              };
              _context34.next = 5;
              return handlerPlusMiddleware(eventFromServerless, {});

            case 5:
              res = _context34.sent;
              expect(res.event).toBeDefined();
              expect(res.event.views).toEqual(2);
              expect(res.context).toBeDefined();
              expect(res.context.requestContext).not.toBeDefined();

            case 10:
            case "end":
              return _context34.stop();
          }
        }
      }, _callee34);
    })));
    it("should get context argument object, increment it and return as http response",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee37() {
      var handler, getP, handlerPlusMiddleware, eventFromServerless, res;
      return _regenerator["default"].wrap(function _callee37$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref32 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee35(event, context) {
                  return _regenerator["default"].wrap(function _callee35$(_context35) {
                    while (1) {
                      switch (_context35.prev = _context35.next) {
                        case 0:
                          return _context35.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context35.stop();
                      }
                    }
                  }, _callee35);
                }));

                return function handler(_x34, _x35) {
                  return _ref32.apply(this, arguments);
                };
              }();

              getP = function getP(getParams, getHelpers) {
                return new Promise(function (resolve, reject) {
                  setTimeout(function () {
                    try {
                      var _getParams5 = getParams(),
                          event = _getParams5.event,
                          setEvent = _getParams5.setEvent;

                      var _getHelpers4 = getHelpers(),
                          returnAndSendResponse = _getHelpers4.returnAndSendResponse;

                      setEvent({
                        views: event.views + 1
                      });
                      return returnAndSendResponse({
                        statusCode: 403,
                        message: "event views should be 3 and we got ".concat(event.views)
                      }); // resolve({});
                    } catch (e) {
                      reject(e);
                    }
                  }, 1);
                });
              };

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler13 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee36(_ref33) {
                    var getParams, getHelpers;
                    return _regenerator["default"].wrap(function _callee36$(_context36) {
                      while (1) {
                        switch (_context36.prev = _context36.next) {
                          case 0:
                            getParams = _ref33.getParams, getHelpers = _ref33.getHelpers;
                            _context36.next = 3;
                            return getP(getParams, getHelpers);

                          case 3:
                          case "end":
                            return _context36.stop();
                        }
                      }
                    }, _callee36);
                  }));

                  function handler(_x36) {
                    return _handler13.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              eventFromServerless = {
                views: 2
              };
              _context37.next = 6;
              return handlerPlusMiddleware(eventFromServerless, {});

            case 6:
              res = _context37.sent;
              expect(res).toStrictEqual({
                statusCode: 403,
                message: "event views should be 3 and we got 3"
              });

            case 8:
            case "end":
              return _context37.stop();
          }
        }
      }, _callee37);
    })));
  });
});
describe("Auth Middleware", function () {
  var instance1 = (0, _index.CreateInstance)();
  describe("AuthMiddleware", function () {
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)({
        DEBUG: true
      });
    });
    it("should return empty event.user when auth failed and statusCode 403",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee38() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee38$(_context38) {
        while (1) {
          switch (_context38.prev = _context38.next) {
            case 0:
              handler = function handler(event) {
                return {
                  event: event
                };
              };

              handlerPlusMiddleware = instance1(handler).use(AuthMiddleware({
                promisify: _util.promisify,
                cognitoJWTDecodeHandler: jwtdecodeAsyncHandler
              }));
              _context38.next = 4;
              return handlerPlusMiddleware({
                headers: {
                  Authorization: "token"
                }
              });

            case 4:
              res = _context38.sent;
              expect(res).toBeDefined();
              expect(res.statusCode).toEqual(403);

            case 7:
            case "end":
              return _context38.stop();
          }
        }
      }, _callee38);
    })));
    it("should return 500 upon syntax error",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee39() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee39$(_context39) {
        while (1) {
          switch (_context39.prev = _context39.next) {
            case 0:
              handler = function handler(event) {
                return {
                  event: event
                };
              };

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function handler(_ref36) {
                  var getParams = _ref36.getParams;
                  return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                      try {
                        var claims = jwt_decode("token");

                        if (claims && claims.exp && claims.aud) {
                          return resolve(null, claims);
                        }

                        return reject("invalid c");
                      } catch (e) {
                        var msg = e && e.message ? "".concat(e.message) : e;
                        return reject(msg, msg);
                      }
                    }, 1);
                  });
                }
              }));
              _context39.next = 4;
              return handlerPlusMiddleware({
                headers: {
                  Authorization: "token"
                }
              });

            case 4:
              res = _context39.sent;
              console.log("res", res);
              expect(res).toBeDefined();
              expect(res.statusCode).toEqual(500);

            case 8:
            case "end":
              return _context39.stop();
          }
        }
      }, _callee39);
    })));
  });
  describe("BaseMiddleware", function () {
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should return the same handler when no augmentation needed",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee40() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee40$(_context40) {
        while (1) {
          switch (_context40.prev = _context40.next) {
            case 0:
              handler = function handler(event) {
                return event;
              };

              handlerPlusMiddleware = instance1(handler);
              _context40.next = 4;
              return handlerPlusMiddleware({
                body: 1
              });

            case 4:
              res = _context40.sent;
              expect(res.body).toEqual(1);
              expect(res.body2).not.toBeDefined();

            case 7:
            case "end":
              return _context40.stop();
          }
        }
      }, _callee40);
    })));
    it("should return the same handler when no augmentation needed",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee41() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee41$(_context41) {
        while (1) {
          switch (_context41.prev = _context41.next) {
            case 0:
              handler = function handler(event) {
                return event;
              };

              handlerPlusMiddleware = instance1(handler);
              _context41.next = 4;
              return handlerPlusMiddleware({
                three: 1
              });

            case 4:
              res = _context41.sent;
              expect(res.body).not.toBeDefined();

            case 6:
            case "end":
              return _context41.stop();
          }
        }
      }, _callee41);
    })));
    it("should extend \"event\" by adding Auth Claims",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee42() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee42$(_context42) {
        while (1) {
          switch (_context42.prev = _context42.next) {
            case 0:
              handler = function handler(event) {
                return event;
              };

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function handler(_ref40) {
                  var getParams = _ref40.getParams;

                  var _getParams6 = getParams(),
                      event = _getParams6.event,
                      setEvent = _getParams6.setEvent;

                  setEvent({
                    claims: {
                      email: "tyrtyr"
                    }
                  });
                }
              }));
              _context42.next = 4;
              return handlerPlusMiddleware({
                header: "ey123",
                body: '{"string": "toObj"}'
              });

            case 4:
              res = _context42.sent;
              expect(res.claims.email).toEqual("tyrtyr");

            case 6:
            case "end":
              return _context42.stop();
          }
        }
      }, _callee42);
    })));
    it("should extend \"event\" by many middlewares",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee44() {
      var BaseMiddlewareWrapper, handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee44$(_context44) {
        while (1) {
          switch (_context44.prev = _context44.next) {
            case 0:
              BaseMiddlewareWrapper = function BaseMiddlewareWrapper() {
                return (0, _index.BaseMiddleware)({
                  handler: function handler(_ref42) {
                    var getParams = _ref42.getParams;

                    var _getParams7 = getParams(),
                        setEvent = _getParams7.setEvent;

                    setEvent({
                      token: 123
                    });
                  }
                });
              };

              handler =
              /*#__PURE__*/
              function () {
                var _ref43 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee43(event) {
                  var plan_code, name, p;
                  return _regenerator["default"].wrap(function _callee43$(_context43) {
                    while (1) {
                      switch (_context43.prev = _context43.next) {
                        case 0:
                          plan_code = event.body.plan_code;
                          name = event.token === 123 ? "tyro" : null;
                          p = new Promise(function (resolve, reject) {
                            setTimeout(function () {
                              return resolve({
                                statusCode: 201,
                                name: name,
                                plan_code: plan_code
                              });
                            }, 1);
                          });
                          return _context43.abrupt("return", p);

                        case 4:
                        case "end":
                          return _context43.stop();
                      }
                    }
                  }, _callee43);
                }));

                return function handler(_x37) {
                  return _ref43.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use(BaseMiddlewareWrapper()).use((0, _index.BodyParserMiddleware)());
              _context44.next = 5;
              return handlerPlusMiddleware({
                token: "ey123",
                body: '{"string": "toObj2", "plan_code": "someplancode"}'
              });

            case 5:
              res = _context44.sent;
              expect(res.statusCode).toEqual(201);
              expect(res.name).toEqual("tyro");
              expect(res.plan_code).toEqual("someplancode");

            case 9:
            case "end":
              return _context44.stop();
          }
        }
      }, _callee44);
    })));
    it("should return new instance if instance is reused by passing different handler",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee47() {
      var BaseMiddlewareWrapper, handler, handler2, handlerPlusMiddleware, handlerWithNo, res2, res;
      return _regenerator["default"].wrap(function _callee47$(_context47) {
        while (1) {
          switch (_context47.prev = _context47.next) {
            case 0:
              BaseMiddlewareWrapper = function BaseMiddlewareWrapper() {
                return (0, _index.BaseMiddleware)({
                  handler: function handler(_ref45) {
                    var getParams = _ref45.getParams;
                    return getParams().setEvent({
                      token: 124
                    });
                  }
                });
              };

              handler =
              /*#__PURE__*/
              function () {
                var _ref46 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee45(event) {
                  var plan_code, name;
                  return _regenerator["default"].wrap(function _callee45$(_context45) {
                    while (1) {
                      switch (_context45.prev = _context45.next) {
                        case 0:
                          plan_code = event.body.plan_code;
                          name = event.token === 124 ? "tyro2" : null;
                          return _context45.abrupt("return", new Promise(function (resolve) {
                            setTimeout(function () {
                              return resolve({
                                statusCode: 202,
                                name: name,
                                plan_code: plan_code
                              });
                            }, 1);
                          }));

                        case 3:
                        case "end":
                          return _context45.stop();
                      }
                    }
                  }, _callee45);
                }));

                return function handler(_x38) {
                  return _ref46.apply(this, arguments);
                };
              }();

              handler2 =
              /*#__PURE__*/
              function () {
                var _ref47 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee46(event) {
                  var plan_code, name;
                  return _regenerator["default"].wrap(function _callee46$(_context46) {
                    while (1) {
                      switch (_context46.prev = _context46.next) {
                        case 0:
                          _context46.prev = 0;
                          plan_code = event && event.body && event.body.plan_code ? event.body.plan_code : null;
                          name = event.token === 124 ? "tyro2" : null;
                          return _context46.abrupt("return", new Promise(function (resolve) {
                            setTimeout(function () {
                              return resolve({
                                statusCode: 203,
                                name: name,
                                plan_code: plan_code
                              });
                            }, 1);
                          }));

                        case 6:
                          _context46.prev = 6;
                          _context46.t0 = _context46["catch"](0);
                          return _context46.abrupt("return", {
                            statusCode: 500,
                            body: _context46.t0.message
                          });

                        case 9:
                        case "end":
                          return _context46.stop();
                      }
                    }
                  }, _callee46, null, [[0, 6]]);
                }));

                return function handler2(_x39) {
                  return _ref47.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use(BaseMiddlewareWrapper()).use((0, _index.BodyParserMiddleware)());
              handlerWithNo = instance1(handler2).use((0, _index.BodyParserMiddleware)());
              _context47.next = 7;
              return handlerWithNo({
                token: "ey123",
                body: {}
              });

            case 7:
              res2 = _context47.sent;
              _context47.next = 10;
              return handlerPlusMiddleware({
                token: "ey123",
                body: '{"string": "toObj2", "plan_code": "someplancode"}'
              });

            case 10:
              res = _context47.sent;
              expect(res2.statusCode).toEqual(203);
              expect(res2.plan_code).toBeNull();
              expect(res.statusCode).toEqual(202);
              expect(res.name).toEqual("tyro2");
              expect(res.plan_code).toEqual("someplancode");

            case 16:
            case "end":
              return _context47.stop();
          }
        }
      }, _callee47);
    })));
  });
  describe("BodyParser Middleware", function () {
    var instance1;
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)();
    });
    it("should extend \"event\" by parsing body",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee48() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee48$(_context48) {
        while (1) {
          switch (_context48.prev = _context48.next) {
            case 0:
              handler = function handler(event) {
                return {
                  prefix: event
                };
              };

              handlerPlusMiddleware = instance1(handler).use((0, _index.BodyParserMiddleware)());
              _context48.next = 4;
              return handlerPlusMiddleware({
                header: "ey123"
              });

            case 4:
              res = _context48.sent;
              expect(res.prefix.body).not.toBeDefined();
              _context48.next = 8;
              return handlerPlusMiddleware({
                body: ""
              });

            case 8:
              res = _context48.sent;
              expect(res.prefix.body).toEqual("");

            case 10:
            case "end":
              return _context48.stop();
          }
        }
      }, _callee48);
    })));
  });
});
describe("Configure to be compatible with Express", function () {
  describe("When an error or returnAndSendResponse is called, we call onCatch", function () {
    var instance1;
    beforeEach(function () {
      instance1 = (0, _index.CreateInstance)({
        DEBUG: true,
        configure: {
          augmentMethods: {
            onCatch: function onCatch(prevMethodwithArgs) {
              var _ref49 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                  prevRawMethod = _ref49.prevRawMethod,
                  arg = _ref49.arg;

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
    it("should not be called when there is no error",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee50() {
      var fn, hookedHandler, res;
      return _regenerator["default"].wrap(function _callee50$(_context50) {
        while (1) {
          switch (_context50.prev = _context50.next) {
            case 0:
              fn =
              /*#__PURE__*/
              function () {
                var _ref51 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee49(event, context) {
                  return _regenerator["default"].wrap(function _callee49$(_context49) {
                    while (1) {
                      switch (_context49.prev = _context49.next) {
                        case 0:
                          return _context49.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context49.stop();
                      }
                    }
                  }, _callee49);
                }));

                return function fn(_x40, _x41) {
                  return _ref51.apply(this, arguments);
                };
              }();

              hookedHandler = instance1(fn);
              _context50.next = 4;
              return hookedHandler({
                body: 123
              }, {});

            case 4:
              res = _context50.sent;
              expect(res).toStrictEqual({
                event: {
                  body: 123
                },
                context: {}
              });

            case 6:
            case "end":
              return _context50.stop();
          }
        }
      }, _callee50);
    })));
    it("should be able to call res.json upon error",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee53() {
      var fn, hookedHandler, res;
      return _regenerator["default"].wrap(function _callee53$(_context53) {
        while (1) {
          switch (_context53.prev = _context53.next) {
            case 0:
              instance1 = (0, _index.CreateInstance)({
                DEBUG: true,
                configure: {
                  augmentMethods: {
                    onCatch: function onCatch(prevMethodwithArgs) {
                      var _ref53 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                          prevRawMethod = _ref53.prevRawMethod,
                          arg = _ref53.arg,
                          context = _ref53.context;

                      expect(prevMethodwithArgs()).toStrictEqual(prevRawMethod(arg));
                      var res = Object.assign({}, prevRawMethod(arg), {
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

              fn =
              /*#__PURE__*/
              function () {
                var _ref54 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee51(event, context) {
                  return _regenerator["default"].wrap(function _callee51$(_context51) {
                    while (1) {
                      switch (_context51.prev = _context51.next) {
                        case 0:
                          return _context51.abrupt("return", {
                            event: event
                          });

                        case 1:
                        case "end":
                          return _context51.stop();
                      }
                    }
                  }, _callee51);
                }));

                return function fn(_x42, _x43) {
                  return _ref54.apply(this, arguments);
                };
              }();

              hookedHandler = instance1(fn).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler14 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee52(_ref55) {
                    var getParams, getHelpers, _getParams8, event;

                    return _regenerator["default"].wrap(function _callee52$(_context52) {
                      while (1) {
                        switch (_context52.prev = _context52.next) {
                          case 0:
                            getParams = _ref55.getParams, getHelpers = _ref55.getHelpers;
                            _getParams8 = getParams(), event = _getParams8.event;

                            if (event) {
                              getHelpers().returnAndSendResponse((0, _objectSpread2["default"])({}, event));
                            }

                          case 3:
                          case "end":
                            return _context52.stop();
                        }
                      }
                    }, _callee52);
                  }));

                  function handler(_x44) {
                    return _handler14.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context53.next = 5;
              return hookedHandler({
                body: 123
              }, mockedExpressResponse());

            case 5:
              res = _context53.sent;
              expect(res).toStrictEqual({
                resJsoned: true,
                body: 123,
                extra: "field_added",
                headers: {
                  "Access-Control-Allow-Origin": "*"
                }
              });

            case 7:
            case "end":
              return _context53.stop();
          }
        }
      }, _callee53);
    }))); // it("should be called after onCatch", async () => {
    // it("should be able to override/augment onCatch", async () => {
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFsbC10ZXN0LmpzIl0sIm5hbWVzIjpbIkNvZ25pdG9EZWNvZGVWZXJpZnlKV1RJbml0IiwicmVxdWlyZSIsImp3dF9kZWNvZGUiLCJqd3RkZWNvZGVBc3luY0hhbmRsZXIiLCJVTlNBRkVfQlVUX0ZBU1RfaGFuZGxlciIsIm1vY2tlZEV4cHJlc3NSZXNwb25zZSIsInNlbmQiLCJjb2RlIiwiZGF0YSIsInN0YXR1c0NvZGUiLCJqc29uIiwicmVzSnNvbmVkIiwiaXNBc3luY0Z1bmN0aW9uIiwiZm4iLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJBdXRoTWlkZGxld2FyZSIsInByb21pc2lmeSIsImNvZ25pdG9KV1REZWNvZGVIYW5kbGVyIiwiRXJyb3IiLCJjb25maWd1cmUiLCJhdWdtZW50TWV0aG9kcyIsIm9uQ2F0Y2giLCJib2R5IiwiaGVhZGVycyIsImhhbmRsZXIiLCJnZXRQYXJhbXMiLCJnZXRIZWxwZXJzIiwiZXZlbnQiLCJzZXRFdmVudCIsImNvbnRleHQiLCJyZXR1cm5BbmRTZW5kUmVzcG9uc2UiLCJuZXdFdmVudEhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiYXV0aG9yaXphdGlvbiIsInByb21pc2VkIiwiT2JqZWN0IiwiYXNzaWduIiwiY2xhaW1zIiwic3ViIiwidXNlciIsInRlc3QxIiwicmVzdWx0IiwibXNnIiwidGVzdDIiLCJ0ZXN0MyIsImUiLCJ0ZXN0NCIsImV2ZW50cyIsInRlc3Q1IiwidGVzdDYiLCJjb250ZXh0MTIzIiwidGVzdDciLCJjYWxsYmFjayIsInRlc3Q4IiwiY2FsbGJhYyIsImRlc2NyaWJlIiwiaXQiLCJ0b1N0cmluZyIsImV4cGVjdCIsInRvRXF1YWwiLCJza2lwIiwiZm4xIiwidG9UaHJvdyIsImZuMiIsIkNhbGxiYWNrIiwiaGVsbG8iLCJjb25zb2xlIiwibG9nIiwiaW5zdGFuY2UxIiwiZXhwZWN0ZWQiLCJtZXNzYWdlIiwic3RyaW5nQ29udGFpbmluZyIsImJlZm9yZUVhY2giLCJiZWZvcmVBbGwiLCJub3QiLCJiYXNpY0FzeW5jSGFuZGxlciIsImFzeW5jSGFuZGxlcldpdGhDVyIsImV2ZW50UHJvcGVydHkxIiwiY29udGV4dFByb3BlcnR5MSIsInJlczEiLCJpbnYiLCJpc0hvb2tNaWRkbGV3YXJlIiwidXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwiZW1haWwiLCJoIiwiYyIsIm5ld0huIiwidG9CZURlZmluZWQiLCJpbnN0YW5jZTEyIiwiREVCVUciLCJwcmV2TWV0aG9kd2l0aEFyZ3MiLCJwcmV2UmF3TWV0aG9kIiwiYXJnIiwidG9TdHJpY3RFcXVhbCIsIm11bHRpcGxpZXIiLCJwcmVIb29rZWQiLCJvYmoiLCJudSIsIm9iajIiLCJhcnIiLCJyZXMiLCJsZW5ndGgiLCJ0b01hdGNoIiwiaGFuZGxlcjIiLCJiZWZvcmVIb29rVGhhdFRocm93cyIsInJlczIiLCJoYW5kbGVyUGx1c01pZGRsZXdhcmUiLCJldmVudEZyb21TZXJ2ZXJsZXNzIiwiY29udGV4dEZyb21TZXJ2ZXJsZXNzIiwicmVxdWVzdENvbnRleHQiLCJ2aWV3cyIsImdldFAiLCJyZWplY3QiLCJleHAiLCJhdWQiLCJib2R5MiIsInRocmVlIiwiaGVhZGVyIiwiQmFzZU1pZGRsZXdhcmVXcmFwcGVyIiwidG9rZW4iLCJwbGFuX2NvZGUiLCJwIiwiaGFuZGxlcldpdGhObyIsInRvQmVOdWxsIiwicHJlZml4IiwiaG9va2VkSGFuZGxlciIsImV4dHJhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQU1BOztBQWNBOztBQXBCQSxJQUFNQSwwQkFBMEIsR0FBR0MsT0FBTyxDQUFDLHFCQUFELENBQTFDOztBQUVBLElBQU1DLFVBQVUsR0FBR0QsT0FBTyxDQUFDLFlBQUQsQ0FBMUI7O0FBQ0EsSUFBTUUscUJBQXFCLEdBQUdILDBCQUEwQixDQUFDO0FBQ3ZERSxFQUFBQSxVQUFVLEVBQVZBO0FBRHVELENBQUQsQ0FBMUIsQ0FFM0JFLHVCQUZIOztBQUtBLElBQU1DLHFCQUFxQixHQUFHLFNBQXhCQSxxQkFBd0IsR0FBTTtB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LENBQUM7QUFBRTFHLGdCQUFBQSxJQUFJLEVBQUU7QUFBUixlQUFELEVBQWdCbEIscUJBQXFCLEVBQXJDLENBM0NnQjs7QUFBQTtBQTJDekNtRyxjQUFBQSxHQTNDeUM7QUE2Qy9DN0MsY0FBQUEsTUFBTSxDQUFDNkMsR0FBRCxDQUFOLENBQVlQLGFBQVosQ0FBMEI7QUFDeEJ0RixnQkFBQUEsU0FBUyxFQUFFLElBRGE7QUFFeEJZLGdCQUFBQSxJQUFJLEVBQUUsR0FGa0I7QUFHeEIyRyxnQkFBQUEsS0FBSyxFQUFFLGFBSGlCO0FBSXhCMUcsZ0JBQUFBLE9BQU8sRUFBRTtBQUFFLGlEQUErQjtBQUFqQztBQUplLGVBQTFCOztBQTdDK0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBL0MsR0FBRixDQXJDa0YsQ0EwRmxGO0FBQ0E7QUFDRCxHQTVGTyxDQUFSO0FBNkZELENBOUZPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDb2duaXRvRGVjb2RlVmVyaWZ5SldUSW5pdCA9IHJlcXVpcmUoXCIuL3Rva2VuLWRlY29kZS10ZXN0XCIpO1xuXG5jb25zdCBqd3RfZGVjb2RlID0gcmVxdWlyZShcImp3dC1kZWNvZGVcIik7XG5jb25zdCBqd3RkZWNvZGVBc3luY0hhbmRsZXIgPSBDb2duaXRvRGVjb2RlVmVyaWZ5SldUSW5pdCh7XG4gIGp3dF9kZWNvZGVcbn0pLlVOU0FGRV9CVVRfRkFTVF9oYW5kbGVyO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcInV0aWxcIjtcblxuY29uc3QgbW9ja2VkRXhwcmVzc1Jlc3BvbnNlID0gKCkgPT4ge1xuICByZXR1cm4ge1xuICAgIHNlbmQ6IChjb2RlLCBkYXRhKSA9PiAoe1xuICAgICAgc3RhdHVzQ29kZTogY29kZSxcbiAgICAgIGRhdGFcbiAgICB9KSxcbiAgICBqc29uOiBkYXRhID0+IHtcbiAgICAgIHJldHVybiB7IC4uLmRhdGEsIHJlc0pzb25lZDogdHJ1ZSB9O1xuICAgIH1cbiAgfTtcbn07XG5cbmltcG9ydCB7XG4gIENyZWF0ZUluc3RhbmNlLFxuICB2YWxpZGF0ZUhhbmRsZXIsXG4gIGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgsXG4gIEJhc2VNaWRkbGV3YXJlLFxuICBCb2R5UGFyc2VyTWlkZGxld2FyZVxufSBmcm9tIFwiLi4vaW5kZXguanNcIjtcblxuY29uc3QgaXNBc3luY0Z1bmN0aW9uID0gZm4gPT5cbiAgZm4gJiYgZm4uY29uc3RydWN0b3IgJiYgZm4uY29uc3RydWN0b3IubmFtZSA9PT0gXCJBc3luY0Z1bmN0aW9uXCI7XG5jb25zdCBBdXRoTWlkZGxld2FyZSA9ICh7IHByb21pc2lmeSwgY29nbml0b0pXVERlY29kZUhhbmRsZXIgfSA9IHt9KSA9PiB7XG4gIGlmIChcbiAgICAocHJvbWlzaWZ5ICYmIHR5cGVvZiBwcm9taXNpZnkgIT09IFwiZnVuY3Rpb25cIikgfHxcbiAgICAoY29nbml0b0pXVERlY29kZUhhbmRsZXIgJiYgdHlwZW9mIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpXG4gICkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgYGludmFsaWQgKHByb21pc2lmeSBhbmQgY29nbml0b0pXVERlY29kZUhhbmRsZXIpIHBhc3NlZC4gJHt0eXBlb2YgcHJvbWlzaWZ5fSwgICR7dHlwZW9mIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyfWBcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIEJhc2VNaWRkbGV3YXJlKHtcbiAgICBjb25maWd1cmU6IHtcbiAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgIG9uQ2F0Y2g6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICAgICAgYm9keTogXCJJbnZhbGlkIFNlc3Npb25cIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZXI6IGFzeW5jICh7IGdldFBhcmFtcywgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCwgY29udGV4dCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICBjb25zdCB7IHJldHVybkFuZFNlbmRSZXNwb25zZSB9ID0gZ2V0SGVscGVycygpO1xuXG4gICAgICBpZiAoIWV2ZW50IHx8ICFldmVudC5oZWFkZXJzKSByZXR1cm4ge307XG5cbiAgICAgIGNvbnN0IG5ld0V2ZW50SGVhZGVycyA9IHtcbiAgICAgICAgLi4uZXZlbnQuaGVhZGVyc1xuICAgICAgfTtcblxuICAgICAgaWYgKCFuZXdFdmVudEhlYWRlcnMuQXV0aG9yaXphdGlvbikge1xuICAgICAgICBuZXdFdmVudEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IG5ld0V2ZW50SGVhZGVycy5hdXRob3JpemF0aW9uO1xuICAgICAgfVxuXG4gICAgICBsZXQgcHJvbWlzZWQgPSBjb2duaXRvSldURGVjb2RlSGFuZGxlcjtcbiAgICAgIGlmICghaXNBc3luY0Z1bmN0aW9uKHByb21pc2VkKSkge1xuICAgICAgICBwcm9taXNlZCA9IHByb21pc2lmeShwcm9taXNlZCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjbGFpbXMgPSBhd2FpdCBwcm9taXNlZChcbiAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQsIHsgaGVhZGVyczogbmV3RXZlbnRIZWFkZXJzIH0pLFxuICAgICAgICBjb250ZXh0XG4gICAgICApO1xuXG4gICAgICBpZiAoIWNsYWltcyB8fCB0eXBlb2YgY2xhaW1zLnN1YiAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gcmV0dXJuQW5kU2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgICAgYm9keTogXCJJbnZhbGlkIFNlc3Npb25cIixcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHNldEV2ZW50KHsgdXNlcjogY2xhaW1zIH0pO1xuXG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IHRlc3QxID0ge1xuICBoYW5kbGVyOiAoKSA9PiB7fSwgLy8gcGFyYW1zIGFyZSBvcHRpb25hbFxuICByZXN1bHQ6IDAsXG4gIG1zZzogYHBhcmFtcyBhcmUgb3B0aW9uYWxgXG59O1xuXG5jb25zdCB0ZXN0MiA9IHtcbiAgaGFuZGxlcjogZXZlbnQgPT4ge30sXG4gIHJlc3VsdDogMSxcbiAgbXNnOiBgcGFyYW1zIGFyZSBvcHRpb25hbGBcbn07XG5cbmNvbnN0IHRlc3QzID0ge1xuICBoYW5kbGVyOiBlID0+IHt9LFxuICByZXN1bHQ6IDEsXG4gIG1zZzogYDFzdCBwYXJhbSBuZWVkIHRvIGJlIGV2ZW50IGFuZCBub3QgZWBcbn07XG5cbmNvbnN0IHRlc3Q0ID0ge1xuICBoYW5kbGVyOiBldmVudHMgPT4ge30sXG4gIHJlc3VsdDogMSxcbiAgbXNnOiBgMXN0IHBhcmFtIG5lZWQgdG8gYmUgZXZlbnQgYW5kIG5vdCBldmVudHNgXG59O1xuXG5jb25zdCB0ZXN0NSA9IHtcbiAgaGFuZGxlcjogKGV2ZW50LCBjb250ZXh0KSA9PiB7fSxcbiAgcmVzdWx0OiAyLFxuICBtc2c6IGBwYXJhbXMgYXJlIG9wdGlvbmFsYFxufTtcblxuY29uc3QgdGVzdDYgPSB7XG4gIGhhbmRsZXI6IChldmVudCwgY29udGV4dDEyMykgPT4ge30sXG4gIHJlc3VsdDogMixcbiAgbXNnOiBgMm5kIHBhcmFtIG5lZWQgdG8gYmUgY29udGV4dCBhbmQgbm90IGNvbnRleHQxMjNgXG59O1xuXG5jb25zdCB0ZXN0NyA9IHtcbiAgaGFuZGxlcjogKGV2ZW50LCBjb250ZXh0LCBjYWxsYmFjaykgPT4ge30sXG4gIHJlc3VsdDogMyxcbiAgbXNnOiBgcGFyYW1zIGFyZSBvcHRpb25hbGBcbn07XG5cbmNvbnN0IHRlc3Q4ID0ge1xuICBoYW5kbGVyOiAoZXZlbnQsIGNvbnRleHQsIGNhbGxiYWMpID0+IHt9LFxuICByZXN1bHQ6IDMsXG4gIG1zZzogYDNyZCBwYXJhbSBuZWVkIHRvIGJlIGNhbGxiYWNrIGFuZCBub3QgY2FsbGJhY2Bcbn07XG5cbmRlc2NyaWJlKGBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoYCwgKCkgPT4ge1xuICBkZXNjcmliZShgdGVzdCBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoIGNvcnJlY3RuZXNzYCwgKCkgPT4ge1xuICAgIGl0KGBzaG91bGQgYWNjZXB0IH4gJHt0ZXN0MS5tc2d9ID0gJHtcbiAgICAgIHRlc3QxLnJlc3VsdFxuICAgIH0gbGVuZ3RoLiAke3Rlc3QxLmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDEuaGFuZGxlcjtcbiAgICAgIGV4cGVjdChnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoKGhhbmRsZXIpKS50b0VxdWFsKHRlc3QxLnJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGFjY2VwdCB+ICR7dGVzdDIubXNnfSA9ICR7XG4gICAgICB0ZXN0Mi5yZXN1bHRcbiAgICB9IGxlbmd0aC4gJHt0ZXN0Mi5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3QyLmhhbmRsZXI7XG4gICAgICBleHBlY3QoZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aChoYW5kbGVyKSkudG9FcXVhbCh0ZXN0Mi5yZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBhY2NlcHQgfiAke3Rlc3Q1Lm1zZ30gPSAke1xuICAgICAgdGVzdDUucmVzdWx0XG4gICAgfSBsZW5ndGguICR7dGVzdDUuaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0NS5oYW5kbGVyO1xuICAgICAgZXhwZWN0KGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgoaGFuZGxlcikpLnRvRXF1YWwodGVzdDUucmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgYWNjZXB0IH4gJHt0ZXN0Ny5tc2d9ID0gJHtcbiAgICAgIHRlc3Q3LnJlc3VsdFxuICAgIH0gbGVuZ3RoLiAke3Rlc3Q3LmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDcuaGFuZGxlcjtcbiAgICAgIGV4cGVjdChnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoKGhhbmRsZXIpKS50b0VxdWFsKHRlc3Q3LnJlc3VsdCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlLnNraXAoYHRlc3QgdmFsaWRhdGVIYW5kbGVyIElOVkFMSUQgc2NlbmFyaW9gLCAoKSA9PiB7XG4gICAgaXQoYHNob3VsZCBOT1QgYWNjZXB0IH4gJHt0ZXN0My5tc2d9ICR7dGVzdDMuaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0My5oYW5kbGVyO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIE5PVCBhY2NlcHQgfiAke3Rlc3Q0Lm1zZ30gJHt0ZXN0NC5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3Q0LmhhbmRsZXI7XG4gICAgICBleHBlY3QodmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b0VxdWFsKGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgTk9UIGFjY2VwdCB+ICR7dGVzdDYubXNnfSAke3Rlc3Q2LmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDYuaGFuZGxlcjtcbiAgICAgIGV4cGVjdCh2YWxpZGF0ZUhhbmRsZXIoaGFuZGxlcikpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBOT1QgYWNjZXB0IH4gJHt0ZXN0OC5tc2d9ICR7dGVzdDguaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0OC5oYW5kbGVyO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlLnNraXAoYHRlc3QgdmFsaWRhdGVIYW5kbGVyIEVER0UgY2FzZXNgLCAoKSA9PiB7XG4gICAgY29uc3QgZm4xID0gKGV2ZW50LCAvKiBjb21tZW50cywgKi8gY29udGV4dCwgY2FsbGJhY2spID0+IHt9O1xuICAgIGl0KGBzaG91bGQgYWNjZXB0IHdpdGggY29tbWVudHMgfiAke2ZuMS50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBmbjE7XG5cbiAgICAgIC8qIEZ1dHVyZSBGZWF0dXJlXG4gICAgICAgKiBleHBlY3QodmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b0VxdWFsKHRydWUpO1xuICAgICAgICovXG4gICAgICBleHBlY3QoKCkgPT4gdmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b1Rocm93KEVycm9yKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGZuMiA9IChldmVudCwgLyogY29tbWVudHMsICovIGNvbnRleHQsIENhbGxiYWNrKSA9PiB7fTtcbiAgICBpdChgc2hvdWxkIE5vVCBhY2NlcHQgY2FzZSBzZW5zaXRpdmUgfiAke2ZuMi50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBmbjI7XG5cbiAgICAgIGV4cGVjdCh2YWxpZGF0ZUhhbmRsZXIoaGFuZGxlcikpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBhY2NlcHQgY29uc3QgaGVsbG8gPSAoZXZlbnQsIGNvbnRleHQpID0+IHtgLCAoKSA9PiB7XG4gICAgICBjb25zdCBoZWxsbyA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhcImhlbGxvIHRvc3RyXCIsIGhlbGxvLnRvU3RyaW5nKCkpO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoZWxsbykpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBDcmVhdGVJbnN0YW5jZWAsICgpID0+IHtcbiAgbGV0IGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJUZXN0IGVycm9ycyBvciB0aHJvd3NcIiwgKCkgPT4ge1xuICAgIGl0KFwic2hvdWxkIHNob3cgZXJyb3IgbWVzc2FnZVwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiLnVzZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IGVycm9yIHVwb24gaW5pdGlhbHNhdGlvblwiLCAoKSA9PiB7XG4gICAgICAvLyBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgLy8gICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICAvLyB9XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBvbmx5IHRocm93IGV4Y2VwdGlvbiBvbmNlIHRoZSBoYW5kbGVyIGlzIGNhbGxlZFwiLCAoKSA9PiB7XG4gICAgICAvLyBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgLy8gICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICAvLyB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBBc3luY0Z1bmN0aW9uIHN1cHBvcnRgLCAoKSA9PiB7XG4gIGRlc2NyaWJlKFwiQXN5bmNGdW5jdGlvbiBoYW5kbGVyXCIsICgpID0+IHtcbiAgICBsZXQgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICBiZWZvcmVBbGwoKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIGFjY2VwdGVkXCIsICgpID0+IHtcbiAgICAgIGV4cGVjdCgoKSA9PiBpbnN0YW5jZTEoYXN5bmMgKCkgPT4ge30pKS5ub3QudG9UaHJvdygpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IHdoZW4gaGFuZGxlciBpcyBhIGJhc2ljIGFzeW5jIGZuXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2ljQXN5bmNIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgYXdhaXQgZXhwZWN0KCgpID0+IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcikubm90LnRvVGhyb3coKSk7XG5cbiAgICAgIGNvbnN0IGFzeW5jSGFuZGxlcldpdGhDVyA9IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcik7XG4gICAgICBjb25zdCByZXMxID0gYXdhaXQgYXN5bmNIYW5kbGVyV2l0aENXKFxuICAgICAgICB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0eTE6IFwic29tZSB2YWx1ZTFcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY29udGV4dFByb3BlcnR5MTogXCJzb21lIHZhbHVlMlwiXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMxLmV2ZW50LmV2ZW50UHJvcGVydHkxKS50b0VxdWFsKFwic29tZSB2YWx1ZTFcIik7XG4gICAgICBleHBlY3QocmVzMS5ldmVudC5ldmVudFByb3BlcnR5MSkubm90LnRvRXF1YWwoXCJcIik7XG4gICAgICBleHBlY3QocmVzMS5jb250ZXh0LmNvbnRleHRQcm9wZXJ0eTEpLnRvRXF1YWwoXCJzb21lIHZhbHVlMlwiKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJBc3luY0Z1bmN0aW9uIGhhbmRsZXIgKyBBc3luY0Z1bmN0aW9uIG1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGxldCBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIGFjY2VwdGVkXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGludiA9IEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgY29uc3QgcHJvbWlzaWZ5ID0gcmVxdWlyZShcInV0aWxcIikucHJvbWlzaWZ5O1xuICAgICAgICAgIGlmICghZXZlbnQgfHwgIWV2ZW50LmhlYWRlcnMpIHJldHVybiB7fTtcbiAgICAgICAgICBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSAhZXZlbnQuaGVhZGVycy5BdXRob3JpemF0aW9uXG4gICAgICAgICAgICA/IGV2ZW50LmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgICAgICAgICAgOiBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb247XG4gICAgICAgICAgY29uc3QgcHJvbWlzZWQgPSBwcm9taXNpZnkoand0ZGVjb2RlQXN5bmNIYW5kbGVyKTtcbiAgICAgICAgICBjb25zdCBjbGFpbXMgPSBhd2FpdCBwcm9taXNlZChldmVudCwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGNsYWltcyAmJiBjbGFpbXMuc3ViICYmIHR5cGVvZiBjbGFpbXMuc3ViID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHVzZXI6IGNsYWltcyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaW52LmlzSG9va01pZGRsZXdhcmUgPSB0cnVlO1xuXG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBpbnN0YW5jZTEoYXN5bmMgKCkgPT4ge30pLnVzZShpbnYpKCk7XG4gICAgICB9KS5ub3QudG9UaHJvdygpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IHdoZW4gaGFuZGxlciBpcyBhIGJhc2ljIGFzeW5jIGZuXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2ljQXN5bmNIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgYXdhaXQgZXhwZWN0KCgpID0+IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcikubm90LnRvVGhyb3coKSk7XG5cbiAgICAgIGNvbnN0IGFzeW5jSGFuZGxlcldpdGhDVyA9IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcik7XG4gICAgICBjb25zdCByZXMxID0gYXdhaXQgYXN5bmNIYW5kbGVyV2l0aENXKFxuICAgICAgICB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0eTE6IFwic29tZSB2YWx1ZTFcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY29udGV4dFByb3BlcnR5MTogXCJzb21lIHZhbHVlMlwiXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMxLmV2ZW50LmV2ZW50UHJvcGVydHkxKS50b0VxdWFsKFwic29tZSB2YWx1ZTFcIik7XG4gICAgICBleHBlY3QocmVzMS5ldmVudC5ldmVudFByb3BlcnR5MSkubm90LnRvRXF1YWwoXCJcIik7XG4gICAgICBleHBlY3QocmVzMS5jb250ZXh0LmNvbnRleHRQcm9wZXJ0eTEpLnRvRXF1YWwoXCJzb21lIHZhbHVlMlwiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHdvcmsgd2l0aCBhc3luYyBtaWRkbGV3YXJlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGludiA9IEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG5cbiAgICAgICAgICAgICAgc2V0RXZlbnQoe1xuICAgICAgICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgICAgICAgIGVtYWlsOiBcImVtYWlsQGV4YW1wbGUuY29tXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGggPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlOiBldmVudCxcbiAgICAgICAgICBjOiBjb250ZXh0XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBuZXdIbiA9IGluc3RhbmNlMShoKS51c2UoaW52KTtcbiAgICAgIGNvbnN0IHJlczEgPSBhd2FpdCBuZXdIbih7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBcInRva2VuMVwiXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzMS5lLnVzZXIpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzMS5lLnVzZXIuZW1haWwpLnRvRXF1YWwoXCJlbWFpbEBleGFtcGxlLmNvbVwiKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoYEVycm9yIEhhbmRsaW5nYCwgKCkgPT4ge1xuICBsZXQgaW5zdGFuY2UxMiA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJDcmVhdGVJbnN0YW5jZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2Uoe1xuICAgICAgICBERUJVRzogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgIG9uQ2F0Y2g6IChwcmV2TWV0aG9kd2l0aEFyZ3MsIHsgcHJldlJhd01ldGhvZCwgYXJnIH0gPSB7fSkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocHJldk1ldGhvZHdpdGhBcmdzKCkpLnRvU3RyaWN0RXF1YWwocHJldlJhd01ldGhvZChhcmcpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHByZXZSYXdNZXRob2QoYXJnKSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBjYXVzZSB0aGUgaGFuZGxlciBjYWxsIHRvIHN0b3AgYW5kIHJldHVybiByZXNwb25zZSBhdCB0aGUgbWlkZGxld2FyZSB3aGljaCBpbnZva2VkIHJldHVybkFuZFNlbmRSZXNwb25zZWAsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKyBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcmVIb29rZWQgPSBpbnN0YW5jZTEyKGhhbmRsZXIpXG4gICAgICAgIC51c2UoXG4gICAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIH0gPSBnZXRIZWxwZXJzKCk7XG4gICAgICAgICAgICAgIGlmIChyZXR1cm5BbmRTZW5kUmVzcG9uc2UgfHwgIXJldHVybkFuZFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAxMjM0LFxuICAgICAgICAgICAgICAgICAgYm9keTogXCJteSBjdXN0b20gZGF0YVwiLFxuICAgICAgICAgICAgICAgICAgb2JqOiB7XG4gICAgICAgICAgICAgICAgICAgIG51OiAxMjM1LFxuICAgICAgICAgICAgICAgICAgICBvYmoyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgYXJyOiBbMSwgMiwgMywgMzMzXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICAgIC51c2UoXG4gICAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIH0gPSBnZXRIZWxwZXJzKCk7XG4gICAgICAgICAgICAgIGlmIChyZXR1cm5BbmRTZW5kUmVzcG9uc2UgfHwgIXJldHVybkFuZFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICBib2R5OiBcInRlc3R0XCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByZUhvb2tlZCh7XG4gICAgICAgIG11bHRpcGxpZXI6IDFcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoMTIzNCk7XG4gICAgICBleHBlY3QocmVzLm9iai5vYmoyLmFyci5sZW5ndGgpLnRvRXF1YWwoNCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZFwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybkFuZFNlbmRSZXNwb25zZSBieSBkZWZhdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKyBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcmVIb29rZWQgPSBpbnN0YW5jZTEyKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jIGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUgfHwgIWUpIHRocm93IEVycm9yKFwiRm9yY2VkIC4gTG9yZW0gaXBzdW1cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcHJlSG9va2VkKHtcbiAgICAgICAgbXVsdGlwbGllcjogMVxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCg1MDApO1xuICAgICAgZXhwZWN0KHJlcy5ib2R5KS50b01hdGNoKGBGb3JjZWQgLiBMb3JlbSBpcHN1bWApO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShgQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZCBhbmQgb3ZlcnJpZGUgd2l0aCBtaWRkbGV3YXJlJ3NgLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2Uoe1xuICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgb25DYXRjaDogZm4gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZm4oKSwge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybkFuZFNlbmRSZXNwb25zZSBieSBkZWZhdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKyBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcmVIb29rZWQgPSBpbnN0YW5jZTEyKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGNvbmZpZ3VyZToge1xuICAgICAgICAgICAgYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgb25DYXRjaDogZm4gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmbigpLCB7XG4gICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICBpZiAoZSB8fCAhZSkgdGhyb3cgRXJyb3IoXCJCYWNvbiBpcHN1bVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBwcmVIb29rZWQoe1xuICAgICAgICBtdWx0aXBsaWVyOiAxXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5zdGF0dXNDb2RlKS50b0VxdWFsKDQwMyk7XG4gICAgICBleHBlY3QocmVzLmJvZHkpLnRvRXF1YWwoXG4gICAgICAgIGBCYWNvbiBpcHN1bSAtIFVuZXhwZWN0ZWQgdG9rZW4gQiBpbiBKU09OIGF0IHBvc2l0aW9uIDBgXG4gICAgICApO1xuICAgICAgZXhwZWN0KHJlcykudG9TdHJpY3RFcXVhbCh7XG4gICAgICAgIGJvZHk6IGBCYWNvbiBpcHN1bSAtIFVuZXhwZWN0ZWQgdG9rZW4gQiBpbiBKU09OIGF0IHBvc2l0aW9uIDBgLFxuICAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBub3Qgb3ZlcnJpZGUvYXVnbWVudCBvdGhlciBtaWRkbGV3YXJlJ3NcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3VsdDogMiAqIGV2ZW50Lm11bHRpcGxpZXJcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHByZUhvb2tlZCA9IGluc3RhbmNlMTIoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgICBvbkNhdGNoOiBmbiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGZuKCksIHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwM1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyBlID0+IHtcbiAgICAgICAgICAgIC8vIGlmIChlIHx8ICFlKSB0aHJvdyBFcnJvcihcIkJhY29uIGlwc3VtXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByZUhvb2tlZCh7XG4gICAgICAgIG11bHRpcGxpZXI6IDJcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzLnJlc3VsdCkudG9FcXVhbCg0KTtcblxuICAgICAgY29uc3QgaGFuZGxlcjIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN1bHQ6IDIgKiBldmVudC5tdWx0aXBsaWVyXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBiZWZvcmVIb29rVGhhdFRocm93cyA9IGluc3RhbmNlMTIoaGFuZGxlcjIpXG4gICAgICAgIC51c2UoXG4gICAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgb25DYXRjaDogZm4gPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGZuKCksIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMTIzXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVyOiBhc3luYyBlID0+IHtcbiAgICAgICAgICAgICAgLy8gaWYgKGUgfHwgIWUpIHRocm93IEVycm9yKFwiQmFjb24gaXBzdW0yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgLnVzZShcbiAgICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICAgICAgLy8gYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgLy8gICBvbkNhdGNoOiAoZm4sIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmbiguLi5hcmdzKSwge1xuICAgICAgICAgICAgICAvLyAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgICAgICAgIC8vICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlIHx8ICFlKSB0aHJvdyBFcnJvcihcIkJhY29uIGlwc3VtMjNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzMiA9IGF3YWl0IGJlZm9yZUhvb2tUaGF0VGhyb3dzKHtcbiAgICAgICAgbXVsdGlwbGllcjogN1xuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMyLnN0YXR1c0NvZGUpLnRvRXF1YWwoNTAwKTtcbiAgICAgIGV4cGVjdChyZXMyKS50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgYm9keTogYEJhY29uIGlwc3VtMjMgLSBVbmV4cGVjdGVkIHRva2VuIEIgaW4gSlNPTiBhdCBwb3NpdGlvbiAwYCxcbiAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShgQXN5bmNGdW5jdGlvbiBhdWdtZW50IC0gQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZCBhbmQgb3ZlcnJpZGUgd2l0aCBtaWRkbGV3YXJlJ3NgLCAoKSA9PiB7XG4gICAgaXQoXCIvLyBUT0RPXCIsICgpID0+IHtcbiAgICAgIGV4cGVjdCgxKS50b0VxdWFsKDEpO1xuICAgIH0pO1xuICB9KTtcbiAgLy8gYmVmb3JlRWFjaCgoKSA9PiB7XG4gIC8vICAgaW5zdGFuY2UxMiA9IENyZWF0ZUluc3RhbmNlKHtcbiAgLy8gICAgIGNvbmZpZ3VyZToge1xuICAvLyAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAvLyAgICAgICAgIG9uQ2F0Y2g6IGFzeW5jIChmbiwgLi4uYXJncykgPT4ge1xufSk7XG5cbmRlc2NyaWJlKGBQb3N0IEhvb2tgLCAoKSA9PiB7XG4gIGxldCBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuXG4gIGRlc2NyaWJlKFwiQmFzZU1pZGRsZXdhcmUgaGFuZGxlciBtZXRob2RcIiwgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIC8vIGl0Lm9ubHkoXCJzaG91bGQgc2hvdWxkIGZvcmNlIGNvbnN1bWUgbWV0aG9kcyBpbnZvY2F0aW9uIChzZXRFdmVudCwgc2V0Q29udGV4dCwgcmVzcG9uc2VPYmplY3RUb1Rocm93KVwiLCBhc3luYyAoKSA9PiB7XG5cbiAgICBpdChcInNob3VsZCBrZWVwIG93biBzdGF0ZSBvZiBldmVudCBhbmQgY29udGV4dCBhbmQgYXV0byByZXRydW4gaXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCwgY29udGV4dCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jICgpID0+IHt9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCBldmVudEZyb21TZXJ2ZXJsZXNzID0ge1xuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246IFwiZHVtbXkxMjNcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dEZyb21TZXJ2ZXJsZXNzID0geyByZXF1ZXN0Q29udGV4dDogMzIxIH07XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoXG4gICAgICAgIGV2ZW50RnJvbVNlcnZlcmxlc3MsXG4gICAgICAgIGNvbnRleHRGcm9tU2VydmVybGVzc1xuICAgICAgKTtcblxuICAgICAgZXhwZWN0KHJlcy5ldmVudCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuZXZlbnQuaGVhZGVycykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuZXZlbnQuaGVhZGVycy5BdXRob3JpemF0aW9uKS50b0VxdWFsKFwiZHVtbXkxMjNcIik7XG5cbiAgICAgIGV4cGVjdChyZXMuY29udGV4dCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuY29udGV4dC5yZXF1ZXN0Q29udGV4dCkudG9FcXVhbCgzMjEpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgZ2V0IGhhbmRsZXIgYXJndW1lbnQgb2JqZWN0IGFuZCBpbmNyZW1lbnQgaXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCwgY29udGV4dCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jICh7IGdldFBhcmFtcyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHZpZXdzOiBldmVudC52aWV3cyArIDEgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgZXZlbnRGcm9tU2VydmVybGVzcyA9IHtcbiAgICAgICAgdmlld3M6IDFcbiAgICAgIH07XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoZXZlbnRGcm9tU2VydmVybGVzcywge30pO1xuXG4gICAgICBleHBlY3QocmVzLmV2ZW50KS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlcy5ldmVudC52aWV3cykudG9FcXVhbCgyKTtcblxuICAgICAgZXhwZWN0KHJlcy5jb250ZXh0KS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlcy5jb250ZXh0LnJlcXVlc3RDb250ZXh0KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGdldCBjb250ZXh0IGFyZ3VtZW50IG9iamVjdCwgaW5jcmVtZW50IGl0IGFuZCByZXR1cm4gYXMgaHR0cCByZXNwb25zZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7IGV2ZW50LCBjb250ZXh0IH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBnZXRQID0gKGdldFBhcmFtcywgZ2V0SGVscGVycykgPT5cbiAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBldmVudCwgc2V0RXZlbnQgfSA9IGdldFBhcmFtcygpO1xuICAgICAgICAgICAgICBjb25zdCB7IHJldHVybkFuZFNlbmRSZXNwb25zZSB9ID0gZ2V0SGVscGVycygpO1xuXG4gICAgICAgICAgICAgIHNldEV2ZW50KHsgdmlld3M6IGV2ZW50LnZpZXdzICsgMSB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJldHVybkFuZFNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBldmVudCB2aWV3cyBzaG91bGQgYmUgMyBhbmQgd2UgZ290ICR7ZXZlbnQudmlld3N9YFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgLy8gcmVzb2x2ZSh7fSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRQYXJhbXMsIGdldEhlbHBlcnMgfSkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgZ2V0UChnZXRQYXJhbXMsIGdldEhlbHBlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGV2ZW50RnJvbVNlcnZlcmxlc3MgPSB7XG4gICAgICAgIHZpZXdzOiAyXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoZXZlbnRGcm9tU2VydmVybGVzcywge30pO1xuXG4gICAgICBleHBlY3QocmVzKS50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAzLFxuICAgICAgICBtZXNzYWdlOiBcImV2ZW50IHZpZXdzIHNob3VsZCBiZSAzIGFuZCB3ZSBnb3QgM1wiXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoYEF1dGggTWlkZGxld2FyZWAsICgpID0+IHtcbiAgbGV0IGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJBdXRoTWlkZGxld2FyZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSh7IERFQlVHOiB0cnVlIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIGVtcHR5IGV2ZW50LnVzZXIgd2hlbiBhdXRoIGZhaWxlZCBhbmQgc3RhdHVzQ29kZSA0MDNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIHsgZXZlbnQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEF1dGhNaWRkbGV3YXJlKHtcbiAgICAgICAgICBwcm9taXNpZnksXG4gICAgICAgICAgY29nbml0b0pXVERlY29kZUhhbmRsZXI6IGp3dGRlY29kZUFzeW5jSGFuZGxlclxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IFwidG9rZW5cIlxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCg0MDMpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIDUwMCB1cG9uIHN5bnRheCBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6ICh7IGdldFBhcmFtcyB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2xhaW1zID0gand0X2RlY29kZShgdG9rZW5gKTtcbiAgICAgICAgICAgICAgICAgIGlmIChjbGFpbXMgJiYgY2xhaW1zLmV4cCAmJiBjbGFpbXMuYXVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKG51bGwsIGNsYWltcyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KFwiaW52YWxpZCBjXCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGUgJiYgZS5tZXNzYWdlID8gYCR7ZS5tZXNzYWdlfWAgOiBlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChtc2csIG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBcInRva2VuXCJcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwicmVzXCIsIHJlcyk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoNTAwKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJCYXNlTWlkZGxld2FyZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIHRoZSBzYW1lIGhhbmRsZXIgd2hlbiBubyBhdWdtZW50YXRpb24gbmVlZGVkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHsgYm9keTogMSB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5ib2R5KS50b0VxdWFsKDEpO1xuICAgICAgZXhwZWN0KHJlcy5ib2R5Mikubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCByZXR1cm4gdGhlIHNhbWUgaGFuZGxlciB3aGVuIG5vIGF1Z21lbnRhdGlvbiBuZWVkZWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoeyB0aHJlZTogMSB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5ib2R5KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgZXh0ZW5kIFwiZXZlbnRcIiBieSBhZGRpbmcgQXV0aCBDbGFpbXNgLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZXZlbnQsIHNldEV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgICAgICAgIHNldEV2ZW50KHtcbiAgICAgICAgICAgICAgY2xhaW1zOiB7IGVtYWlsOiBcInR5cnR5clwiIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIGhlYWRlcjogXCJleTEyM1wiLFxuICAgICAgICBib2R5OiAne1wic3RyaW5nXCI6IFwidG9PYmpcIn0nXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5jbGFpbXMuZW1haWwpLnRvRXF1YWwoXCJ0eXJ0eXJcIik7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGV4dGVuZCBcImV2ZW50XCIgYnkgbWFueSBtaWRkbGV3YXJlc2AsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IEJhc2VNaWRkbGV3YXJlV3JhcHBlciA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiAoeyBnZXRQYXJhbXMgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHRva2VuOiAxMjMgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHBsYW5fY29kZSA9IGV2ZW50LmJvZHkucGxhbl9jb2RlO1xuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudG9rZW4gPT09IDEyMyA/IFwidHlyb1wiIDogbnVsbDtcbiAgICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHsgc3RhdHVzQ29kZTogMjAxLCBuYW1lLCBwbGFuX2NvZGUgfSk7XG4gICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpXG4gICAgICAgIC51c2UoQmFzZU1pZGRsZXdhcmVXcmFwcGVyKCkpXG4gICAgICAgIC51c2UoQm9keVBhcnNlck1pZGRsZXdhcmUoKSk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIHRva2VuOiBcImV5MTIzXCIsXG4gICAgICAgIGJvZHk6ICd7XCJzdHJpbmdcIjogXCJ0b09iajJcIiwgXCJwbGFuX2NvZGVcIjogXCJzb21lcGxhbmNvZGVcIn0nXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5zdGF0dXNDb2RlKS50b0VxdWFsKDIwMSk7XG4gICAgICBleHBlY3QocmVzLm5hbWUpLnRvRXF1YWwoXCJ0eXJvXCIpO1xuICAgICAgZXhwZWN0KHJlcy5wbGFuX2NvZGUpLnRvRXF1YWwoXCJzb21lcGxhbmNvZGVcIik7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIHJldHVybiBuZXcgaW5zdGFuY2UgaWYgaW5zdGFuY2UgaXMgcmV1c2VkIGJ5IHBhc3NpbmcgZGlmZmVyZW50IGhhbmRsZXJgLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBCYXNlTWlkZGxld2FyZVdyYXBwZXIgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogKHsgZ2V0UGFyYW1zIH0pID0+IGdldFBhcmFtcygpLnNldEV2ZW50KHsgdG9rZW46IDEyNCB9KVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHBsYW5fY29kZSA9IGV2ZW50LmJvZHkucGxhbl9jb2RlO1xuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudG9rZW4gPT09IDEyNCA/IFwidHlybzJcIiA6IG51bGw7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHsgc3RhdHVzQ29kZTogMjAyLCBuYW1lLCBwbGFuX2NvZGUgfSk7XG4gICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlcjIgPSBhc3luYyBldmVudCA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcGxhbl9jb2RlID1cbiAgICAgICAgICAgIGV2ZW50ICYmIGV2ZW50LmJvZHkgJiYgZXZlbnQuYm9keS5wbGFuX2NvZGVcbiAgICAgICAgICAgICAgPyBldmVudC5ib2R5LnBsYW5fY29kZVxuICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudG9rZW4gPT09IDEyNCA/IFwidHlybzJcIiA6IG51bGw7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHsgc3RhdHVzQ29kZTogMjAzLCBuYW1lLCBwbGFuX2NvZGUgfSk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBlLm1lc3NhZ2VcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcilcbiAgICAgICAgLnVzZShCYXNlTWlkZGxld2FyZVdyYXBwZXIoKSlcbiAgICAgICAgLnVzZShCb2R5UGFyc2VyTWlkZGxld2FyZSgpKTtcblxuICAgICAgY29uc3QgaGFuZGxlcldpdGhObyA9IGluc3RhbmNlMShoYW5kbGVyMikudXNlKEJvZHlQYXJzZXJNaWRkbGV3YXJlKCkpO1xuXG4gICAgICBjb25zdCByZXMyID0gYXdhaXQgaGFuZGxlcldpdGhObyh7XG4gICAgICAgIHRva2VuOiBcImV5MTIzXCIsXG4gICAgICAgIGJvZHk6IHt9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgdG9rZW46IFwiZXkxMjNcIixcbiAgICAgICAgYm9keTogJ3tcInN0cmluZ1wiOiBcInRvT2JqMlwiLCBcInBsYW5fY29kZVwiOiBcInNvbWVwbGFuY29kZVwifSdcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzMi5zdGF0dXNDb2RlKS50b0VxdWFsKDIwMyk7XG4gICAgICBleHBlY3QocmVzMi5wbGFuX2NvZGUpLnRvQmVOdWxsKCk7XG5cbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCgyMDIpO1xuICAgICAgZXhwZWN0KHJlcy5uYW1lKS50b0VxdWFsKFwidHlybzJcIik7XG4gICAgICBleHBlY3QocmVzLnBsYW5fY29kZSkudG9FcXVhbChcInNvbWVwbGFuY29kZVwiKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJCb2R5UGFyc2VyIE1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGxldCBpbnN0YW5jZTE7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBleHRlbmQgXCJldmVudFwiIGJ5IHBhcnNpbmcgYm9keWAsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiB7IHByZWZpeDogZXZlbnQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJvZHlQYXJzZXJNaWRkbGV3YXJlKClcbiAgICAgICk7XG5cbiAgICAgIGxldCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoe1xuICAgICAgICBoZWFkZXI6IFwiZXkxMjNcIlxuICAgICAgfSk7XG4gICAgICBleHBlY3QocmVzLnByZWZpeC5ib2R5KS5ub3QudG9CZURlZmluZWQoKTtcblxuICAgICAgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgYm9keTogXCJcIlxuICAgICAgfSk7XG4gICAgICBleHBlY3QocmVzLnByZWZpeC5ib2R5KS50b0VxdWFsKFwiXCIpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZShgQ29uZmlndXJlIHRvIGJlIGNvbXBhdGlibGUgd2l0aCBFeHByZXNzYCwgKCkgPT4ge1xuICBkZXNjcmliZShgV2hlbiBhbiBlcnJvciBvciByZXR1cm5BbmRTZW5kUmVzcG9uc2UgaXMgY2FsbGVkLCB3ZSBjYWxsIG9uQ2F0Y2hgLCAoKSA9PiB7XG4gICAgbGV0IGluc3RhbmNlMTtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKHtcbiAgICAgICAgREVCVUc6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyZToge1xuICAgICAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgICAgICBvbkNhdGNoOiAocHJldk1ldGhvZHdpdGhBcmdzLCB7IHByZXZSYXdNZXRob2QsIGFyZyB9ID0ge30pID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHByZXZNZXRob2R3aXRoQXJncygpKS50b1N0cmljdEVxdWFsKHByZXZSYXdNZXRob2QoYXJnKSk7XG4gICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBwcmV2UmF3TWV0aG9kKGFyZyksIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIG5vdCBiZSBjYWxsZWQgd2hlbiB0aGVyZSBpcyBubyBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmbiA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIGNvbnRleHRcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvb2tlZEhhbmRsZXIgPSBpbnN0YW5jZTEoZm4pO1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaG9va2VkSGFuZGxlcih7IGJvZHk6IDEyMyB9LCB7fSk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgICBldmVudDoge1xuICAgICAgICAgIGJvZHk6IDEyM1xuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0OiB7fVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBiZSBhYmxlIHRvIGNhbGwgcmVzLmpzb24gdXBvbiBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSh7XG4gICAgICAgIERFQlVHOiB0cnVlLFxuICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgb25DYXRjaDogKFxuICAgICAgICAgICAgICBwcmV2TWV0aG9kd2l0aEFyZ3MsXG4gICAgICAgICAgICAgIHsgcHJldlJhd01ldGhvZCwgYXJnLCBjb250ZXh0IH0gPSB7fVxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChwcmV2TWV0aG9kd2l0aEFyZ3MoKSkudG9TdHJpY3RFcXVhbChwcmV2UmF3TWV0aG9kKGFyZykpO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHJlcyA9IE9iamVjdC5hc3NpZ24oe30sIHByZXZSYXdNZXRob2QoYXJnKSwge1xuICAgICAgICAgICAgICAgIGV4dHJhOiBcImZpZWxkX2FkZGVkXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lmpzb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dC5qc29uKHJlcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGZuID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnRcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvb2tlZEhhbmRsZXIgPSBpbnN0YW5jZTEoZm4pLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jICh7IGdldFBhcmFtcywgZ2V0SGVscGVycyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgICBnZXRIZWxwZXJzKCkucmV0dXJuQW5kU2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAuLi5ldmVudFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaG9va2VkSGFuZGxlcih7IGJvZHk6IDEyMyB9LCBtb2NrZWRFeHByZXNzUmVzcG9uc2UoKSk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgICByZXNKc29uZWQ6IHRydWUsXG4gICAgICAgIGJvZHk6IDEyMyxcbiAgICAgICAgZXh0cmE6IFwiZmllbGRfYWRkZWRcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGl0KFwic2hvdWxkIGJlIGNhbGxlZCBhZnRlciBvbkNhdGNoXCIsIGFzeW5jICgpID0+IHtcbiAgICAvLyBpdChcInNob3VsZCBiZSBhYmxlIHRvIG92ZXJyaWRlL2F1Z21lbnQgb25DYXRjaFwiLCBhc3luYyAoKSA9PiB7XG4gIH0pO1xufSk7XG4iXX0=
