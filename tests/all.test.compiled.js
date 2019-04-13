"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("source-map-support/register");

var _util = require("util");

var _index = require("../index.js");

var CognitoDecodeVerifyJWTInit = require("./token-decode-test");

var jwt_decode = require("jwt-decode");

var jwtdecodeAsyncHandler = CognitoDecodeVerifyJWTInit({
  jwt_decode: jwt_decode
}).UNSAFE_BUT_FAST_handler;
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
        var _ref = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee(event, context) {
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", {});

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function hello(_x, _x2) {
          return _ref.apply(this, arguments);
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
        })));
      }).not.toThrow();
    });
    it("should not throw when handler is a basic async fn",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4() {
      var basicAsyncHandler, asyncHandlerWithCW, res1;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              basicAsyncHandler =
              /*#__PURE__*/
              function () {
                var _ref4 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee3(event, context) {
                  return _regenerator["default"].wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          return _context3.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee3);
                }));

                return function basicAsyncHandler(_x3, _x4) {
                  return _ref4.apply(this, arguments);
                };
              }();

              _context4.next = 3;
              return expect(function () {
                return instance1(basicAsyncHandler).not.toThrow();
              });

            case 3:
              asyncHandlerWithCW = instance1(basicAsyncHandler);
              _context4.next = 6;
              return asyncHandlerWithCW({
                eventProperty1: "some value1"
              }, {
                contextProperty1: "some value2"
              });

            case 6:
              res1 = _context4.sent;
              expect(res1.event.eventProperty1).toEqual("some value1");
              expect(res1.event.eventProperty1).not.toEqual("");
              expect(res1.context.contextProperty1).toEqual("some value2");

            case 10:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
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
          var _handler = (0, _asyncToGenerator2["default"])(
          /*#__PURE__*/
          _regenerator["default"].mark(function _callee5(_ref5) {
            var getParams, _getParams, event, setEvent, promisify, promised, claims;

            return _regenerator["default"].wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    getParams = _ref5.getParams;
                    _getParams = getParams(), event = _getParams.event, setEvent = _getParams.setEvent;
                    promisify = require("util").promisify;

                    if (!(!event || !event.headers)) {
                      _context5.next = 5;
                      break;
                    }

                    return _context5.abrupt("return", {});

                  case 5:
                    event.headers.Authorization = !event.headers.Authorization ? event.headers.authorization : event.headers.Authorization;
                    promised = promisify(jwtdecodeAsyncHandler);
                    _context5.next = 9;
                    return promised(event, context);

                  case 9:
                    claims = _context5.sent;

                    if (claims && claims.sub && typeof claims.sub === "string") {
                      setEvent({
                        user: claims
                      });
                    }

                  case 11:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          function handler(_x5) {
            return _handler.apply(this, arguments);
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
        _regenerator["default"].mark(function _callee6() {
          return _regenerator["default"].wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        }))).use(inv)();
      }).not.toThrow();
    });
    it("should not throw when handler is a basic async fn",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee8() {
      var basicAsyncHandler, asyncHandlerWithCW, res1;
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              basicAsyncHandler =
              /*#__PURE__*/
              function () {
                var _ref8 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee7(event, context) {
                  return _regenerator["default"].wrap(function _callee7$(_context7) {
                    while (1) {
                      switch (_context7.prev = _context7.next) {
                        case 0:
                          return _context7.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context7.stop();
                      }
                    }
                  }, _callee7);
                }));

                return function basicAsyncHandler(_x6, _x7) {
                  return _ref8.apply(this, arguments);
                };
              }();

              _context8.next = 3;
              return expect(function () {
                return instance1(basicAsyncHandler).not.toThrow();
              });

            case 3:
              asyncHandlerWithCW = instance1(basicAsyncHandler);
              _context8.next = 6;
              return asyncHandlerWithCW({
                eventProperty1: "some value1"
              }, {
                contextProperty1: "some value2"
              });

            case 6:
              res1 = _context8.sent;
              expect(res1.event.eventProperty1).toEqual("some value1");
              expect(res1.event.eventProperty1).not.toEqual("");
              expect(res1.context.contextProperty1).toEqual("some value2");

            case 10:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    })));
    it("should work with async middleware",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee11() {
      var inv, h, newHn, res1;
      return _regenerator["default"].wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              inv = (0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler2 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee9(_ref10) {
                    var getParams;
                    return _regenerator["default"].wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            getParams = _ref10.getParams;
                            return _context9.abrupt("return", new Promise(function (resolve) {
                              setTimeout(function () {
                                var _getParams2 = getParams(),
                                    setEvent = _getParams2.setEvent;

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
                            return _context9.stop();
                        }
                      }
                    }, _callee9);
                  }));

                  function handler(_x8) {
                    return _handler2.apply(this, arguments);
                  }

                  return handler;
                }()
              });

              h =
              /*#__PURE__*/
              function () {
                var _ref11 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee10(event, context) {
                  return _regenerator["default"].wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          return _context10.abrupt("return", {
                            e: event,
                            c: context
                          });

                        case 1:
                        case "end":
                          return _context10.stop();
                      }
                    }
                  }, _callee10);
                }));

                return function h(_x9, _x10) {
                  return _ref11.apply(this, arguments);
                };
              }();

              newHn = instance1(h).use(inv);
              _context11.next = 5;
              return newHn({
                headers: {
                  Authorization: "token1"
                }
              });

            case 5:
              res1 = _context11.sent;
              expect(res1.e.user).toBeDefined();
              expect(res1.e.user.email).toEqual("email@example.com");

            case 8:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11);
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
            onCatchHandler: function onCatchHandler(prevMethodwithArgs) {
              var _ref12 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                  prevMethodwithNoArgs = _ref12.prevMethodwithNoArgs,
                  arg = _ref12.arg;

              expect(prevMethodwithArgs()).toStrictEqual(prevMethodwithNoArgs(arg));
              return Object.assign({}, prevMethodwithNoArgs(arg), {
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
    _regenerator["default"].mark(function _callee15() {
      var handler, preHooked, res;
      return _regenerator["default"].wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref14 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee12(event, context) {
                  return _regenerator["default"].wrap(function _callee12$(_context12) {
                    while (1) {
                      switch (_context12.prev = _context12.next) {
                        case 0:
                          return _context12.abrupt("return", {
                            result: 2 + event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context12.stop();
                      }
                    }
                  }, _callee12);
                }));

                return function handler(_x11, _x12) {
                  return _ref14.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler3 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee13(_ref15) {
                    var getHelpers, _getHelpers, returnAndSendResponse;

                    return _regenerator["default"].wrap(function _callee13$(_context13) {
                      while (1) {
                        switch (_context13.prev = _context13.next) {
                          case 0:
                            getHelpers = _ref15.getHelpers;
                            _getHelpers = getHelpers(), returnAndSendResponse = _getHelpers.returnAndSendResponse;

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
                            return _context13.stop();
                        }
                      }
                    }, _callee13);
                  }));

                  function handler(_x13) {
                    return _handler3.apply(this, arguments);
                  }

                  return handler;
                }()
              })).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler4 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee14(_ref16) {
                    var getHelpers, _getHelpers2, returnAndSendResponse;

                    return _regenerator["default"].wrap(function _callee14$(_context14) {
                      while (1) {
                        switch (_context14.prev = _context14.next) {
                          case 0:
                            getHelpers = _ref16.getHelpers;
                            _getHelpers2 = getHelpers(), returnAndSendResponse = _getHelpers2.returnAndSendResponse;

                            if (returnAndSendResponse || !returnAndSendResponse) {
                              returnAndSendResponse({
                                statusCode: 500,
                                body: "testt"
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
              }));
              _context15.next = 4;
              return preHooked({
                multiplier: 1
              });

            case 4:
              res = _context15.sent;
              expect(res.statusCode).toEqual(1234);
              expect(res.obj.obj2.arr.length).toEqual(4);

            case 7:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15);
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
    _regenerator["default"].mark(function _callee18() {
      var handler, preHooked, res;
      return _regenerator["default"].wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref18 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee16(event, context) {
                  return _regenerator["default"].wrap(function _callee16$(_context16) {
                    while (1) {
                      switch (_context16.prev = _context16.next) {
                        case 0:
                          return _context16.abrupt("return", {
                            result: 2 + event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context16.stop();
                      }
                    }
                  }, _callee16);
                }));

                return function handler(_x15, _x16) {
                  return _ref18.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler5 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee17(e) {
                    return _regenerator["default"].wrap(function _callee17$(_context17) {
                      while (1) {
                        switch (_context17.prev = _context17.next) {
                          case 0:
                            if (!(e || !e)) {
                              _context17.next = 2;
                              break;
                            }

                            throw Error("Forced . Lorem ipsum");

                          case 2:
                          case "end":
                            return _context17.stop();
                        }
                      }
                    }, _callee17);
                  }));

                  function handler(_x17) {
                    return _handler5.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context18.next = 4;
              return preHooked({
                multiplier: 1
              });

            case 4:
              res = _context18.sent;
              expect(res.statusCode).toEqual(500);
              expect(res.body).toMatch("Forced . Lorem ipsum");

            case 7:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18);
    })));
  });
  describe("CreateInstance configure method and override with middleware's", function () {
    beforeEach(function () {
      instance12 = (0, _index.CreateInstance)({
        configure: {
          augmentMethods: {
            onCatchHandler: function onCatchHandler(fn) {
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
    _regenerator["default"].mark(function _callee21() {
      var handler, preHooked, res;
      return _regenerator["default"].wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref20 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee19(event, context) {
                  return _regenerator["default"].wrap(function _callee19$(_context19) {
                    while (1) {
                      switch (_context19.prev = _context19.next) {
                        case 0:
                          return _context19.abrupt("return", {
                            result: 2 + event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context19.stop();
                      }
                    }
                  }, _callee19);
                }));

                return function handler(_x18, _x19) {
                  return _ref20.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                configure: {
                  augmentMethods: {
                    onCatchHandler: function onCatchHandler(fn) {
                      return Object.assign({}, fn(), {
                        statusCode: 403
                      });
                    }
                  }
                },
                handler: function () {
                  var _handler6 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee20(e) {
                    return _regenerator["default"].wrap(function _callee20$(_context20) {
                      while (1) {
                        switch (_context20.prev = _context20.next) {
                          case 0:
                            if (!(e || !e)) {
                              _context20.next = 2;
                              break;
                            }

                            throw Error("Bacon ipsum");

                          case 2:
                          case "end":
                            return _context20.stop();
                        }
                      }
                    }, _callee20);
                  }));

                  function handler(_x20) {
                    return _handler6.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context21.next = 4;
              return preHooked({
                multiplier: 1
              });

            case 4:
              res = _context21.sent;
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
              return _context21.stop();
          }
        }
      }, _callee21);
    })));
    it("should not override/augment other middleware's",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee27() {
      var handler, preHooked, res, handler2, beforeHookThatThrows, res2;
      return _regenerator["default"].wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref22 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee22(event, context) {
                  return _regenerator["default"].wrap(function _callee22$(_context22) {
                    while (1) {
                      switch (_context22.prev = _context22.next) {
                        case 0:
                          return _context22.abrupt("return", {
                            result: 2 * event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context22.stop();
                      }
                    }
                  }, _callee22);
                }));

                return function handler(_x21, _x22) {
                  return _ref22.apply(this, arguments);
                };
              }();

              preHooked = instance12(handler).use((0, _index.BaseMiddleware)({
                configure: {
                  augmentMethods: {
                    onCatchHandler: function onCatchHandler(fn) {
                      return Object.assign({}, fn(), {
                        statusCode: 403
                      });
                    }
                  }
                },
                handler: function () {
                  var _handler7 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee23(e) {
                    return _regenerator["default"].wrap(function _callee23$(_context23) {
                      while (1) {
                        switch (_context23.prev = _context23.next) {
                          case 0:
                          case "end":
                            return _context23.stop();
                        }
                      }
                    }, _callee23);
                  }));

                  function handler(_x23) {
                    return _handler7.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              _context27.next = 4;
              return preHooked({
                multiplier: 2
              });

            case 4:
              res = _context27.sent;
              expect(res.result).toEqual(4);

              handler2 =
              /*#__PURE__*/
              function () {
                var _ref23 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee24(event, context) {
                  return _regenerator["default"].wrap(function _callee24$(_context24) {
                    while (1) {
                      switch (_context24.prev = _context24.next) {
                        case 0:
                          return _context24.abrupt("return", {
                            result: 2 * event.multiplier
                          });

                        case 1:
                        case "end":
                          return _context24.stop();
                      }
                    }
                  }, _callee24);
                }));

                return function handler2(_x24, _x25) {
                  return _ref23.apply(this, arguments);
                };
              }();

              beforeHookThatThrows = instance12(handler2).use((0, _index.BaseMiddleware)({
                configure: {
                  augmentMethods: {
                    onCatchHandler: function onCatchHandler(fn) {
                      return Object.assign({}, fn(), {
                        statusCode: 123
                      });
                    }
                  }
                },
                handler: function () {
                  var _handler8 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee25(e) {
                    return _regenerator["default"].wrap(function _callee25$(_context25) {
                      while (1) {
                        switch (_context25.prev = _context25.next) {
                          case 0:
                          case "end":
                            return _context25.stop();
                        }
                      }
                    }, _callee25);
                  }));

                  function handler(_x26) {
                    return _handler8.apply(this, arguments);
                  }

                  return handler;
                }()
              })).use((0, _index.BaseMiddleware)({
                configure: {// augmentMethods: {
                  //   onCatchHandler: (fn, ...args) => {
                  //     return Object.assign({}, fn(...args), {
                  //       statusCode: 403,
                  //       headers: { "Access-Control-Allow-Origin": "*" }
                  //     });
                  //   }
                  // }
                },
                handler: function () {
                  var _handler9 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee26(e) {
                    return _regenerator["default"].wrap(function _callee26$(_context26) {
                      while (1) {
                        switch (_context26.prev = _context26.next) {
                          case 0:
                            if (!(e || !e)) {
                              _context26.next = 2;
                              break;
                            }

                            throw Error("Bacon ipsum23");

                          case 2:
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
              }));
              _context27.next = 10;
              return beforeHookThatThrows({
                multiplier: 7
              });

            case 10:
              res2 = _context27.sent;
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
              return _context27.stop();
          }
        }
      }, _callee27);
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
  //         onCatchHandler: async (fn, ...args) => {
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
    _regenerator["default"].mark(function _callee30() {
      var handler, handlerPlusMiddleware, eventFromServerless, contextFromServerless, res;
      return _regenerator["default"].wrap(function _callee30$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref25 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee28(event, context) {
                  return _regenerator["default"].wrap(function _callee28$(_context28) {
                    while (1) {
                      switch (_context28.prev = _context28.next) {
                        case 0:
                          return _context28.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context28.stop();
                      }
                    }
                  }, _callee28);
                }));

                return function handler(_x28, _x29) {
                  return _ref25.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler10 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee29() {
                    return _regenerator["default"].wrap(function _callee29$(_context29) {
                      while (1) {
                        switch (_context29.prev = _context29.next) {
                          case 0:
                          case "end":
                            return _context29.stop();
                        }
                      }
                    }, _callee29);
                  }));

                  function handler() {
                    return _handler10.apply(this, arguments);
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
              _context30.next = 5;
              return handlerPlusMiddleware(eventFromServerless, contextFromServerless);

            case 5:
              res = _context30.sent;
              expect(res.event).toBeDefined();
              expect(res.event.headers).toBeDefined();
              expect(res.event.headers.Authorization).toEqual("dummy123");
              expect(res.context).toBeDefined();
              expect(res.context.requestContext).toEqual(321);

            case 11:
            case "end":
              return _context30.stop();
          }
        }
      }, _callee30);
    })));
    it("should get handler argument object and increment it",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee33() {
      var handler, handlerPlusMiddleware, eventFromServerless, res;
      return _regenerator["default"].wrap(function _callee33$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref27 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee31(event, context) {
                  return _regenerator["default"].wrap(function _callee31$(_context31) {
                    while (1) {
                      switch (_context31.prev = _context31.next) {
                        case 0:
                          return _context31.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context31.stop();
                      }
                    }
                  }, _callee31);
                }));

                return function handler(_x30, _x31) {
                  return _ref27.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function () {
                  var _handler11 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee32(_ref28) {
                    var getParams, _getParams3, event, setEvent;

                    return _regenerator["default"].wrap(function _callee32$(_context32) {
                      while (1) {
                        switch (_context32.prev = _context32.next) {
                          case 0:
                            getParams = _ref28.getParams;
                            _getParams3 = getParams(), event = _getParams3.event, setEvent = _getParams3.setEvent;
                            setEvent({
                              views: event.views + 1
                            });

                          case 3:
                          case "end":
                            return _context32.stop();
                        }
                      }
                    }, _callee32);
                  }));

                  function handler(_x32) {
                    return _handler11.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              eventFromServerless = {
                views: 1
              };
              _context33.next = 5;
              return handlerPlusMiddleware(eventFromServerless, {});

            case 5:
              res = _context33.sent;
              expect(res.event).toBeDefined();
              expect(res.event.views).toEqual(2);
              expect(res.context).toBeDefined();
              expect(res.context.requestContext).not.toBeDefined();

            case 10:
            case "end":
              return _context33.stop();
          }
        }
      }, _callee33);
    })));
    it("should get context argument object, increment it and return as http response",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee36() {
      var handler, getP, handlerPlusMiddleware, eventFromServerless, res;
      return _regenerator["default"].wrap(function _callee36$(_context36) {
        while (1) {
          switch (_context36.prev = _context36.next) {
            case 0:
              handler =
              /*#__PURE__*/
              function () {
                var _ref30 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee34(event, context) {
                  return _regenerator["default"].wrap(function _callee34$(_context34) {
                    while (1) {
                      switch (_context34.prev = _context34.next) {
                        case 0:
                          return _context34.abrupt("return", {
                            event: event,
                            context: context
                          });

                        case 1:
                        case "end":
                          return _context34.stop();
                      }
                    }
                  }, _callee34);
                }));

                return function handler(_x33, _x34) {
                  return _ref30.apply(this, arguments);
                };
              }();

              getP = function getP(getParams, getHelpers) {
                return new Promise(function (resolve, reject) {
                  setTimeout(function () {
                    try {
                      var _getParams4 = getParams(),
                          event = _getParams4.event,
                          setEvent = _getParams4.setEvent;

                      var _getHelpers3 = getHelpers(),
                          returnAndSendResponse = _getHelpers3.returnAndSendResponse;

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
                  var _handler12 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee35(_ref31) {
                    var getParams, getHelpers;
                    return _regenerator["default"].wrap(function _callee35$(_context35) {
                      while (1) {
                        switch (_context35.prev = _context35.next) {
                          case 0:
                            getParams = _ref31.getParams, getHelpers = _ref31.getHelpers;
                            _context35.next = 3;
                            return getP(getParams, getHelpers);

                          case 3:
                          case "end":
                            return _context35.stop();
                        }
                      }
                    }, _callee35);
                  }));

                  function handler(_x35) {
                    return _handler12.apply(this, arguments);
                  }

                  return handler;
                }()
              }));
              eventFromServerless = {
                views: 2
              };
              _context36.next = 6;
              return handlerPlusMiddleware(eventFromServerless, {});

            case 6:
              res = _context36.sent;
              expect(res).toStrictEqual({
                statusCode: 403,
                message: "event views should be 3 and we got 3"
              });

            case 8:
            case "end":
              return _context36.stop();
          }
        }
      }, _callee36);
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
    _regenerator["default"].mark(function _callee37() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee37$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              handler = function handler(event) {
                return {
                  event: event
                };
              };

              handlerPlusMiddleware = instance1(handler).use((0, _index.AuthMiddleware)({
                promisify: _util.promisify,
                cognitoJWTDecodeHandler: jwtdecodeAsyncHandler
              }));
              _context37.next = 4;
              return handlerPlusMiddleware({
                headers: {
                  Authorization: "token"
                }
              });

            case 4:
              res = _context37.sent;
              expect(res).toBeDefined();
              expect(res.statusCode).toEqual(403);

            case 7:
            case "end":
              return _context37.stop();
          }
        }
      }, _callee37);
    })));
    it("should return 500 upon syntax error",
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

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function handler(_ref34) {
                  var getParams = _ref34.getParams;
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
              _context38.next = 4;
              return handlerPlusMiddleware({
                headers: {
                  Authorization: "token"
                }
              });

            case 4:
              res = _context38.sent;
              console.log("res", res);
              expect(res).toBeDefined();
              expect(res.statusCode).toEqual(500);

            case 8:
            case "end":
              return _context38.stop();
          }
        }
      }, _callee38);
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
    _regenerator["default"].mark(function _callee39() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee39$(_context39) {
        while (1) {
          switch (_context39.prev = _context39.next) {
            case 0:
              handler = function handler(event) {
                return event;
              };

              handlerPlusMiddleware = instance1(handler);
              _context39.next = 4;
              return handlerPlusMiddleware({
                body: 1
              });

            case 4:
              res = _context39.sent;
              expect(res.body).toEqual(1);
              expect(res.body2).not.toBeDefined();

            case 7:
            case "end":
              return _context39.stop();
          }
        }
      }, _callee39);
    })));
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
                three: 1
              });

            case 4:
              res = _context40.sent;
              expect(res.body).not.toBeDefined();

            case 6:
            case "end":
              return _context40.stop();
          }
        }
      }, _callee40);
    })));
    it("should extend \"event\" by adding Auth Claims",
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

              handlerPlusMiddleware = instance1(handler).use((0, _index.BaseMiddleware)({
                handler: function handler(_ref38) {
                  var getParams = _ref38.getParams;

                  var _getParams5 = getParams(),
                      event = _getParams5.event,
                      setEvent = _getParams5.setEvent;

                  setEvent({
                    claims: {
                      email: "tyrtyr"
                    }
                  });
                }
              }));
              _context41.next = 4;
              return handlerPlusMiddleware({
                header: "ey123",
                body: '{"string": "toObj"}'
              });

            case 4:
              res = _context41.sent;
              expect(res.claims.email).toEqual("tyrtyr");

            case 6:
            case "end":
              return _context41.stop();
          }
        }
      }, _callee41);
    })));
    it("should extend \"event\" by many middlewares",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee43() {
      var BaseMiddlewareWrapper, handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee43$(_context43) {
        while (1) {
          switch (_context43.prev = _context43.next) {
            case 0:
              BaseMiddlewareWrapper = function BaseMiddlewareWrapper() {
                return (0, _index.BaseMiddleware)({
                  handler: function handler(_ref40) {
                    var getParams = _ref40.getParams;

                    var _getParams6 = getParams(),
                        setEvent = _getParams6.setEvent;

                    setEvent({
                      token: 123
                    });
                  }
                });
              };

              handler =
              /*#__PURE__*/
              function () {
                var _ref41 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee42(event) {
                  var plan_code, name, p;
                  return _regenerator["default"].wrap(function _callee42$(_context42) {
                    while (1) {
                      switch (_context42.prev = _context42.next) {
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
                          return _context42.abrupt("return", p);

                        case 4:
                        case "end":
                          return _context42.stop();
                      }
                    }
                  }, _callee42);
                }));

                return function handler(_x36) {
                  return _ref41.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use(BaseMiddlewareWrapper()).use((0, _index.BodyParserMiddleware)());
              _context43.next = 5;
              return handlerPlusMiddleware({
                token: "ey123",
                body: '{"string": "toObj2", "plan_code": "someplancode"}'
              });

            case 5:
              res = _context43.sent;
              expect(res.statusCode).toEqual(201);
              expect(res.name).toEqual("tyro");
              expect(res.plan_code).toEqual("someplancode");

            case 9:
            case "end":
              return _context43.stop();
          }
        }
      }, _callee43);
    })));
    it("should return new instance if instance is reused by passing different handler",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee46() {
      var BaseMiddlewareWrapper, handler, handler2, handlerPlusMiddleware, handlerWithNo, res2, res;
      return _regenerator["default"].wrap(function _callee46$(_context46) {
        while (1) {
          switch (_context46.prev = _context46.next) {
            case 0:
              BaseMiddlewareWrapper = function BaseMiddlewareWrapper() {
                return (0, _index.BaseMiddleware)({
                  handler: function handler(_ref43) {
                    var getParams = _ref43.getParams;
                    return getParams().setEvent({
                      token: 124
                    });
                  }
                });
              };

              handler =
              /*#__PURE__*/
              function () {
                var _ref44 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee44(event) {
                  var plan_code, name;
                  return _regenerator["default"].wrap(function _callee44$(_context44) {
                    while (1) {
                      switch (_context44.prev = _context44.next) {
                        case 0:
                          plan_code = event.body.plan_code;
                          name = event.token === 124 ? "tyro2" : null;
                          return _context44.abrupt("return", new Promise(function (resolve) {
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
                          return _context44.stop();
                      }
                    }
                  }, _callee44);
                }));

                return function handler(_x37) {
                  return _ref44.apply(this, arguments);
                };
              }();

              handler2 =
              /*#__PURE__*/
              function () {
                var _ref45 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee45(event) {
                  var plan_code, name;
                  return _regenerator["default"].wrap(function _callee45$(_context45) {
                    while (1) {
                      switch (_context45.prev = _context45.next) {
                        case 0:
                          _context45.prev = 0;
                          plan_code = event && event.body && event.body.plan_code ? event.body.plan_code : null;
                          name = event.token === 124 ? "tyro2" : null;
                          return _context45.abrupt("return", new Promise(function (resolve) {
                            setTimeout(function () {
                              return resolve({
                                statusCode: 203,
                                name: name,
                                plan_code: plan_code
                              });
                            }, 1);
                          }));

                        case 6:
                          _context45.prev = 6;
                          _context45.t0 = _context45["catch"](0);
                          return _context45.abrupt("return", {
                            statusCode: 500,
                            body: _context45.t0.message
                          });

                        case 9:
                        case "end":
                          return _context45.stop();
                      }
                    }
                  }, _callee45, null, [[0, 6]]);
                }));

                return function handler2(_x38) {
                  return _ref45.apply(this, arguments);
                };
              }();

              handlerPlusMiddleware = instance1(handler).use(BaseMiddlewareWrapper()).use((0, _index.BodyParserMiddleware)());
              handlerWithNo = instance1(handler2).use((0, _index.BodyParserMiddleware)());
              _context46.next = 7;
              return handlerWithNo({
                token: "ey123",
                body: {}
              });

            case 7:
              res2 = _context46.sent;
              _context46.next = 10;
              return handlerPlusMiddleware({
                token: "ey123",
                body: '{"string": "toObj2", "plan_code": "someplancode"}'
              });

            case 10:
              res = _context46.sent;
              expect(res2.statusCode).toEqual(203);
              expect(res2.plan_code).toBeNull();
              expect(res.statusCode).toEqual(202);
              expect(res.name).toEqual("tyro2");
              expect(res.plan_code).toEqual("someplancode");

            case 16:
            case "end":
              return _context46.stop();
          }
        }
      }, _callee46);
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
    _regenerator["default"].mark(function _callee47() {
      var handler, handlerPlusMiddleware, res;
      return _regenerator["default"].wrap(function _callee47$(_context47) {
        while (1) {
          switch (_context47.prev = _context47.next) {
            case 0:
              handler = function handler(event) {
                return {
                  prefix: event
                };
              };

              handlerPlusMiddleware = instance1(handler).use((0, _index.BodyParserMiddleware)());
              _context47.next = 4;
              return handlerPlusMiddleware({
                header: "ey123"
              });

            case 4:
              res = _context47.sent;
              expect(res.prefix.body).not.toBeDefined();
              _context47.next = 8;
              return handlerPlusMiddleware({
                body: ""
              });

            case 8:
              res = _context47.sent;
              expect(res.prefix.body).toEqual("");

            case 10:
            case "end":
              return _context47.stop();
          }
        }
      }, _callee47);
    })));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFsbC10ZXN0LmpzIl0sIm5hbWVzIjpbIkNvZ25pdG9EZWNvZGVWZXJpZnlKV1RJbml0IiwicmVxdWlyZSIsImp3dF9kZWNvZGUiLCJqd3RkZWNvZGVBc3luY0hhbmRsZXIiLCJVTlNBRkVfQlVUX0ZBU1RfaGFuZGxlciIsInRlc3QxIiwiaGFuZGxlciIsInJlc3VsdCIsIm1zZyIsInRlc3QyIiwiZXZlbnQiLCJ0ZXN0MyIsImUiLCJ0ZXN0NCIsImV2ZW50cyIsInRlc3Q1IiwiY29udGV4dCIsInRlc3Q2IiwiY29udGV4dDEyMyIsInRlc3Q3IiwiY2FsbGJhY2siLCJ0ZXN0OCIsImNhbGxiYWMiLCJkZXNjcmliZSIsIml0IiwidG9TdHJpbmciLCJleHBlY3QiLCJ0b0VxdWFsIiwic2tpcCIsImZuMSIsInRvVGhyb3ciLCJFcnJvciIsImZuMiIsIkNhbGxiYWNrIiwiaGVsbG8iLCJjb25zb2xlIiwibG9nIiwiaW5zdGFuY2UxIiwiZXhwZWN0ZWQiLCJtZXNzYWdlIiwic3RyaW5nQ29udGFpbmluZyIsImJlZm9yZUVhY2giLCJiZWZvcmVBbGwiLCJub3QiLCJiYXNpY0FzeW5jSGFuZGxlciIsImFzeW5jSGFuZGxlcldpdGhDVyIsImV2ZW50UHJvcGVydHkxIiwiY29udGV4dFByb3BlcnR5MSIsInJlczEiLCJpbnYiLCJnZXRQYXJhbXMiLCJzZXRFdmVudCIsInByb21pc2lmeSIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiYXV0aG9yaXphdGlvbiIsInByb21pc2VkIiwiY2xhaW1zIiwic3ViIiwidXNlciIsImlzSG9va01pZGRsZXdhcmUiLCJ1c2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJlbWFpbCIsImgiLCJjIiwibmV3SG4iLCJ0b0JlRGVmaW5lZCIsImluc3RhbmNlMTIiLCJERUJVRyIsImNvbmZpZ3VyZSIsImF1Z21lbnRNZXRob2RzIiwib25DYXRjaEhhbmRsZXIiLCJwcmV2TWV0aG9kd2l0aEFyZ3MiLCJwcmV2TWV0aG9kd2l0aE5vQXJncyIsImFyZyIsInRvU3RyaWN0RXF1YWwiLCJPYmplY3QiLCJhc3NpZ24iLCJtdWx0aXBsaWVyIiwicHJlSG9va2VkIiwiZ2V0SGVscGVycyIsInJldHVybkFuZFNlbmRSZXNwb25zZSIsInN0YXR1c0NvZGUiLCJib2R5Iiwib2JqIiwibnUiLCJvYmoyIiwiYXJyIiwicmVzIiwibGVuZ3RoIiwidG9NYXRjaCIsImZuIiwiaGFuZGxlcjIiLCJiZWZvcmVIb29rVGhhdFRocm93cyIsInJlczIiLCJoYW5kbGVyUGx1c01pZGRsZXdhcmUiLCJldmVudEZyb21TZXJ2ZXJsZXNzIiwiY29udGV4dEZyb21TZXJ2ZXJsZXNzIiwicmVxdWVzdENvbnRleHQiLCJ2aWV3cyIsImdldFAiLCJyZWplY3QiLCJjb2duaXRvSldURGVjb2RlSGFuZGxlciIsImV4cCIsImF1ZCIsImJvZHkyIiwidGhyZWUiLCJoZWFkZXIiLCJCYXNlTWlkZGxld2FyZVdyYXBwZXIiLCJ0b2tlbiIsInBsYW5fY29kZSIsIm5hbWUiLCJwIiwiaGFuZGxlcldpdGhObyIsInRvQmVOdWxsIiwicHJlZml4Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBTUE7O0FBRUE7O0FBUkEsSUFBTUEsMEJBQTBCLEdBQUdDLE9BQU8sQ0FBQyxxQkFBRCxDQUExQzs7QUFFQSxJQUFNQyxVQUFVLEdBQUdELE9BQU8sQ0FBQyxZQUFELENBQTFCOztBQUNBLElBQU1FLHFCQUFxQixHQUFHSCwwQkFBMEIsQ0FBQztBQUN2REUsRUFBQUEsVUFBVSxFQUFWQTtBQUR1RCxDQUFELENBQTFCLENBRTNCRSx1QkFGSDtBQWNBLElBQU1DLEtBQUssR0FBRztBQUNaQyxFQUFBQSxPQUFPLEVBQUUsbUJBQU0sQ0FBRSxDQURMO0FBQ087QUFDbkJDLEVBQUFBLE1BQU0sRUFBRSxDQUZJO0FBR1pDLEVBQUFBLEdBQUc7QUFIUyxDQUFkO0FBTUEsSUFBTUMsS0FBSyxHQUFHO0FBQ1pILEVBQUFBLE9BQU8sRUFBRSxpQkFBQUksS0FBSyxFQUFJLENBQUUsQ0FEUjtB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LEVBQUU7QUFENEIsZUFBRCxDQVRLOztBQUFBO0FBU3RDbkIsY0FBQUEsR0FUc0M7QUFZMUNqRSxjQUFBQSxNQUFNLENBQUNpRSxHQUFHLENBQUMyQixNQUFKLENBQVdoQyxJQUFaLENBQU4sQ0FBd0IzQyxHQUF4QixDQUE0QjBCLFdBQTVCO0FBWjBDO0FBQUEscUJBYzlCNkIscUJBQXFCLENBQUM7QUFDaENaLGdCQUFBQSxJQUFJLEVBQUU7QUFEMEIsZUFBRCxDQWRTOztBQUFBO0FBYzFDSyxjQUFBQSxHQWQwQztBQWlCMUNqRSxjQUFBQSxNQUFNLENBQUNpRSxHQUFHLENBQUMyQixNQUFKLENBQVdoQyxJQUFaLENBQU4sQ0FBd0IzRCxPQUF4QixDQUFnQyxFQUFoQzs7QUFqQjBDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQTFDLEdBQUY7QUFtQkQsR0F6Qk8sQ0FBUjtBQTBCRCxDQXhQTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ29nbml0b0RlY29kZVZlcmlmeUpXVEluaXQgPSByZXF1aXJlKFwiLi90b2tlbi1kZWNvZGUtdGVzdFwiKTtcblxuY29uc3Qgand0X2RlY29kZSA9IHJlcXVpcmUoXCJqd3QtZGVjb2RlXCIpO1xuY29uc3Qgand0ZGVjb2RlQXN5bmNIYW5kbGVyID0gQ29nbml0b0RlY29kZVZlcmlmeUpXVEluaXQoe1xuICBqd3RfZGVjb2RlXG59KS5VTlNBRkVfQlVUX0ZBU1RfaGFuZGxlcjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5cbmltcG9ydCB7XG4gIENyZWF0ZUluc3RhbmNlLFxuICB2YWxpZGF0ZUhhbmRsZXIsXG4gIGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgsXG4gIEF1dGhNaWRkbGV3YXJlLFxuICBCYXNlTWlkZGxld2FyZSxcbiAgQm9keVBhcnNlck1pZGRsZXdhcmVcbn0gZnJvbSBcIi4uL2luZGV4LmpzXCI7XG5cbmNvbnN0IHRlc3QxID0ge1xuICBoYW5kbGVyOiAoKSA9PiB7fSwgLy8gcGFyYW1zIGFyZSBvcHRpb25hbFxuICByZXN1bHQ6IDAsXG4gIG1zZzogYHBhcmFtcyBhcmUgb3B0aW9uYWxgXG59O1xuXG5jb25zdCB0ZXN0MiA9IHtcbiAgaGFuZGxlcjogZXZlbnQgPT4ge30sXG4gIHJlc3VsdDogMSxcbiAgbXNnOiBgcGFyYW1zIGFyZSBvcHRpb25hbGBcbn07XG5cbmNvbnN0IHRlc3QzID0ge1xuICBoYW5kbGVyOiBlID0+IHt9LFxuICByZXN1bHQ6IDEsXG4gIG1zZzogYDFzdCBwYXJhbSBuZWVkIHRvIGJlIGV2ZW50IGFuZCBub3QgZWBcbn07XG5cbmNvbnN0IHRlc3Q0ID0ge1xuICBoYW5kbGVyOiBldmVudHMgPT4ge30sXG4gIHJlc3VsdDogMSxcbiAgbXNnOiBgMXN0IHBhcmFtIG5lZWQgdG8gYmUgZXZlbnQgYW5kIG5vdCBldmVudHNgXG59O1xuXG5jb25zdCB0ZXN0NSA9IHtcbiAgaGFuZGxlcjogKGV2ZW50LCBjb250ZXh0KSA9PiB7fSxcbiAgcmVzdWx0OiAyLFxuICBtc2c6IGBwYXJhbXMgYXJlIG9wdGlvbmFsYFxufTtcblxuY29uc3QgdGVzdDYgPSB7XG4gIGhhbmRsZXI6IChldmVudCwgY29udGV4dDEyMykgPT4ge30sXG4gIHJlc3VsdDogMixcbiAgbXNnOiBgMm5kIHBhcmFtIG5lZWQgdG8gYmUgY29udGV4dCBhbmQgbm90IGNvbnRleHQxMjNgXG59O1xuXG5jb25zdCB0ZXN0NyA9IHtcbiAgaGFuZGxlcjogKGV2ZW50LCBjb250ZXh0LCBjYWxsYmFjaykgPT4ge30sXG4gIHJlc3VsdDogMyxcbiAgbXNnOiBgcGFyYW1zIGFyZSBvcHRpb25hbGBcbn07XG5cbmNvbnN0IHRlc3Q4ID0ge1xuICBoYW5kbGVyOiAoZXZlbnQsIGNvbnRleHQsIGNhbGxiYWMpID0+IHt9LFxuICByZXN1bHQ6IDMsXG4gIG1zZzogYDNyZCBwYXJhbSBuZWVkIHRvIGJlIGNhbGxiYWNrIGFuZCBub3QgY2FsbGJhY2Bcbn07XG5cbmRlc2NyaWJlKGBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoYCwgKCkgPT4ge1xuICBkZXNjcmliZShgdGVzdCBnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoIGNvcnJlY3RuZXNzYCwgKCkgPT4ge1xuICAgIGl0KGBzaG91bGQgYWNjZXB0IH4gJHt0ZXN0MS5tc2d9ID0gJHtcbiAgICAgIHRlc3QxLnJlc3VsdFxuICAgIH0gbGVuZ3RoLiAke3Rlc3QxLmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDEuaGFuZGxlcjtcbiAgICAgIGV4cGVjdChnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoKGhhbmRsZXIpKS50b0VxdWFsKHRlc3QxLnJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGFjY2VwdCB+ICR7dGVzdDIubXNnfSA9ICR7XG4gICAgICB0ZXN0Mi5yZXN1bHRcbiAgICB9IGxlbmd0aC4gJHt0ZXN0Mi5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3QyLmhhbmRsZXI7XG4gICAgICBleHBlY3QoZ2V0SGFuZGxlckFyZ3VtZW50c0xlbmd0aChoYW5kbGVyKSkudG9FcXVhbCh0ZXN0Mi5yZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBhY2NlcHQgfiAke3Rlc3Q1Lm1zZ30gPSAke1xuICAgICAgdGVzdDUucmVzdWx0XG4gICAgfSBsZW5ndGguICR7dGVzdDUuaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0NS5oYW5kbGVyO1xuICAgICAgZXhwZWN0KGdldEhhbmRsZXJBcmd1bWVudHNMZW5ndGgoaGFuZGxlcikpLnRvRXF1YWwodGVzdDUucmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgYWNjZXB0IH4gJHt0ZXN0Ny5tc2d9ID0gJHtcbiAgICAgIHRlc3Q3LnJlc3VsdFxuICAgIH0gbGVuZ3RoLiAke3Rlc3Q3LmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDcuaGFuZGxlcjtcbiAgICAgIGV4cGVjdChnZXRIYW5kbGVyQXJndW1lbnRzTGVuZ3RoKGhhbmRsZXIpKS50b0VxdWFsKHRlc3Q3LnJlc3VsdCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlLnNraXAoYHRlc3QgdmFsaWRhdGVIYW5kbGVyIElOVkFMSUQgc2NlbmFyaW9gLCAoKSA9PiB7XG4gICAgaXQoYHNob3VsZCBOT1QgYWNjZXB0IH4gJHt0ZXN0My5tc2d9ICR7dGVzdDMuaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0My5oYW5kbGVyO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIE5PVCBhY2NlcHQgfiAke3Rlc3Q0Lm1zZ30gJHt0ZXN0NC5oYW5kbGVyLnRvU3RyaW5nKCl9YCwgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRlc3Q0LmhhbmRsZXI7XG4gICAgICBleHBlY3QodmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b0VxdWFsKGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgTk9UIGFjY2VwdCB+ICR7dGVzdDYubXNnfSAke3Rlc3Q2LmhhbmRsZXIudG9TdHJpbmcoKX1gLCAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGVzdDYuaGFuZGxlcjtcbiAgICAgIGV4cGVjdCh2YWxpZGF0ZUhhbmRsZXIoaGFuZGxlcikpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBOT1QgYWNjZXB0IH4gJHt0ZXN0OC5tc2d9ICR7dGVzdDguaGFuZGxlci50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0ZXN0OC5oYW5kbGVyO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoYW5kbGVyKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlLnNraXAoYHRlc3QgdmFsaWRhdGVIYW5kbGVyIEVER0UgY2FzZXNgLCAoKSA9PiB7XG4gICAgY29uc3QgZm4xID0gKGV2ZW50LCAvKiBjb21tZW50cywgKi8gY29udGV4dCwgY2FsbGJhY2spID0+IHt9O1xuICAgIGl0KGBzaG91bGQgYWNjZXB0IHdpdGggY29tbWVudHMgfiAke2ZuMS50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBmbjE7XG5cbiAgICAgIC8qIEZ1dHVyZSBGZWF0dXJlXG4gICAgICAgKiBleHBlY3QodmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b0VxdWFsKHRydWUpO1xuICAgICAgICovXG4gICAgICBleHBlY3QoKCkgPT4gdmFsaWRhdGVIYW5kbGVyKGhhbmRsZXIpKS50b1Rocm93KEVycm9yKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGZuMiA9IChldmVudCwgLyogY29tbWVudHMsICovIGNvbnRleHQsIENhbGxiYWNrKSA9PiB7fTtcbiAgICBpdChgc2hvdWxkIE5vVCBhY2NlcHQgY2FzZSBzZW5zaXRpdmUgfiAke2ZuMi50b1N0cmluZygpfWAsICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBmbjI7XG5cbiAgICAgIGV4cGVjdCh2YWxpZGF0ZUhhbmRsZXIoaGFuZGxlcikpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBhY2NlcHQgY29uc3QgaGVsbG8gPSAoZXZlbnQsIGNvbnRleHQpID0+IHtgLCAoKSA9PiB7XG4gICAgICBjb25zdCBoZWxsbyA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhcImhlbGxvIHRvc3RyXCIsIGhlbGxvLnRvU3RyaW5nKCkpO1xuICAgICAgZXhwZWN0KHZhbGlkYXRlSGFuZGxlcihoZWxsbykpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBDcmVhdGVJbnN0YW5jZWAsICgpID0+IHtcbiAgbGV0IGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJUZXN0IGVycm9ycyBvciB0aHJvd3NcIiwgKCkgPT4ge1xuICAgIGl0KFwic2hvdWxkIHNob3cgZXJyb3IgbWVzc2FnZVwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiLnVzZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IGVycm9yIHVwb24gaW5pdGlhbHNhdGlvblwiLCAoKSA9PiB7XG4gICAgICAvLyBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgLy8gICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICAvLyB9XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBvbmx5IHRocm93IGV4Y2VwdGlvbiBvbmNlIHRoZSBoYW5kbGVyIGlzIGNhbGxlZFwiLCAoKSA9PiB7XG4gICAgICAvLyBjb25zdCBleHBlY3RlZCA9IGBQbGVhc2UgdXNlIHRoZSBleGFjdCBhcmd1bWVudCBuYW1lcyBvZiB0aGUgaGFuZGxlciBhcyB0aGUgZm9sbG93aW5nIGV2ZW50LGNvbnRleHQsY2FsbGJhY2sgb3Igc2ltcGx5IChldmVudCwgY29udGV4dCkgPT4ge30gb3IgKCkgPT4ge31gO1xuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgaW5zdGFuY2UxKGUgPT4ge30pO1xuICAgICAgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgLy8gICBleHBlY3QoZS5tZXNzYWdlKS50b0VxdWFsKGV4cGVjdC5zdHJpbmdDb250YWluaW5nKGV4cGVjdGVkKSk7XG4gICAgICAvLyB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBBc3luY0Z1bmN0aW9uIHN1cHBvcnRgLCAoKSA9PiB7XG4gIGRlc2NyaWJlKFwiQXN5bmNGdW5jdGlvbiBoYW5kbGVyXCIsICgpID0+IHtcbiAgICBsZXQgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICBiZWZvcmVBbGwoKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIGFjY2VwdGVkXCIsICgpID0+IHtcbiAgICAgIGV4cGVjdCgoKSA9PiBpbnN0YW5jZTEoYXN5bmMgKCkgPT4ge30pKS5ub3QudG9UaHJvdygpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IHdoZW4gaGFuZGxlciBpcyBhIGJhc2ljIGFzeW5jIGZuXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2ljQXN5bmNIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgYXdhaXQgZXhwZWN0KCgpID0+IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcikubm90LnRvVGhyb3coKSk7XG5cbiAgICAgIGNvbnN0IGFzeW5jSGFuZGxlcldpdGhDVyA9IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcik7XG4gICAgICBjb25zdCByZXMxID0gYXdhaXQgYXN5bmNIYW5kbGVyV2l0aENXKFxuICAgICAgICB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0eTE6IFwic29tZSB2YWx1ZTFcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY29udGV4dFByb3BlcnR5MTogXCJzb21lIHZhbHVlMlwiXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMxLmV2ZW50LmV2ZW50UHJvcGVydHkxKS50b0VxdWFsKFwic29tZSB2YWx1ZTFcIik7XG4gICAgICBleHBlY3QocmVzMS5ldmVudC5ldmVudFByb3BlcnR5MSkubm90LnRvRXF1YWwoXCJcIik7XG4gICAgICBleHBlY3QocmVzMS5jb250ZXh0LmNvbnRleHRQcm9wZXJ0eTEpLnRvRXF1YWwoXCJzb21lIHZhbHVlMlwiKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJBc3luY0Z1bmN0aW9uIGhhbmRsZXIgKyBBc3luY0Z1bmN0aW9uIG1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGxldCBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIGFjY2VwdGVkXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGludiA9IEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgY29uc3QgcHJvbWlzaWZ5ID0gcmVxdWlyZShcInV0aWxcIikucHJvbWlzaWZ5O1xuICAgICAgICAgIGlmICghZXZlbnQgfHwgIWV2ZW50LmhlYWRlcnMpIHJldHVybiB7fTtcbiAgICAgICAgICBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSAhZXZlbnQuaGVhZGVycy5BdXRob3JpemF0aW9uXG4gICAgICAgICAgICA/IGV2ZW50LmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgICAgICAgICAgOiBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb247XG4gICAgICAgICAgY29uc3QgcHJvbWlzZWQgPSBwcm9taXNpZnkoand0ZGVjb2RlQXN5bmNIYW5kbGVyKTtcbiAgICAgICAgICBjb25zdCBjbGFpbXMgPSBhd2FpdCBwcm9taXNlZChldmVudCwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGNsYWltcyAmJiBjbGFpbXMuc3ViICYmIHR5cGVvZiBjbGFpbXMuc3ViID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBzZXRFdmVudCh7IHVzZXI6IGNsYWltcyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaW52LmlzSG9va01pZGRsZXdhcmUgPSB0cnVlO1xuXG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBpbnN0YW5jZTEoYXN5bmMgKCkgPT4ge30pLnVzZShpbnYpKCk7XG4gICAgICB9KS5ub3QudG9UaHJvdygpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IHRocm93IHdoZW4gaGFuZGxlciBpcyBhIGJhc2ljIGFzeW5jIGZuXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2ljQXN5bmNIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgYXdhaXQgZXhwZWN0KCgpID0+IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcikubm90LnRvVGhyb3coKSk7XG5cbiAgICAgIGNvbnN0IGFzeW5jSGFuZGxlcldpdGhDVyA9IGluc3RhbmNlMShiYXNpY0FzeW5jSGFuZGxlcik7XG4gICAgICBjb25zdCByZXMxID0gYXdhaXQgYXN5bmNIYW5kbGVyV2l0aENXKFxuICAgICAgICB7XG4gICAgICAgICAgZXZlbnRQcm9wZXJ0eTE6IFwic29tZSB2YWx1ZTFcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY29udGV4dFByb3BlcnR5MTogXCJzb21lIHZhbHVlMlwiXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMxLmV2ZW50LmV2ZW50UHJvcGVydHkxKS50b0VxdWFsKFwic29tZSB2YWx1ZTFcIik7XG4gICAgICBleHBlY3QocmVzMS5ldmVudC5ldmVudFByb3BlcnR5MSkubm90LnRvRXF1YWwoXCJcIik7XG4gICAgICBleHBlY3QocmVzMS5jb250ZXh0LmNvbnRleHRQcm9wZXJ0eTEpLnRvRXF1YWwoXCJzb21lIHZhbHVlMlwiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHdvcmsgd2l0aCBhc3luYyBtaWRkbGV3YXJlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGludiA9IEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG5cbiAgICAgICAgICAgICAgc2V0RXZlbnQoe1xuICAgICAgICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgICAgICAgIGVtYWlsOiBcImVtYWlsQGV4YW1wbGUuY29tXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGggPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlOiBldmVudCxcbiAgICAgICAgICBjOiBjb250ZXh0XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBuZXdIbiA9IGluc3RhbmNlMShoKS51c2UoaW52KTtcbiAgICAgIGNvbnN0IHJlczEgPSBhd2FpdCBuZXdIbih7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBcInRva2VuMVwiXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzMS5lLnVzZXIpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzMS5lLnVzZXIuZW1haWwpLnRvRXF1YWwoXCJlbWFpbEBleGFtcGxlLmNvbVwiKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoYEVycm9yIEhhbmRsaW5nYCwgKCkgPT4ge1xuICBsZXQgaW5zdGFuY2UxMiA9IENyZWF0ZUluc3RhbmNlKCk7XG5cbiAgZGVzY3JpYmUoXCJDcmVhdGVJbnN0YW5jZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbnN0YW5jZTEyID0gQ3JlYXRlSW5zdGFuY2Uoe1xuICAgICAgICBERUJVRzogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgIG9uQ2F0Y2hIYW5kbGVyOiAoXG4gICAgICAgICAgICAgIHByZXZNZXRob2R3aXRoQXJncyxcbiAgICAgICAgICAgICAgeyBwcmV2TWV0aG9kd2l0aE5vQXJncywgYXJnIH0gPSB7fVxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChwcmV2TWV0aG9kd2l0aEFyZ3MoKSkudG9TdHJpY3RFcXVhbChcbiAgICAgICAgICAgICAgICBwcmV2TWV0aG9kd2l0aE5vQXJncyhhcmcpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBwcmV2TWV0aG9kd2l0aE5vQXJncyhhcmcpLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGNhdXNlIHRoZSBoYW5kbGVyIGNhbGwgdG8gc3RvcCBhbmQgcmV0dXJuIHJlc3BvbnNlIGF0IHRoZSBtaWRkbGV3YXJlIHdoaWNoIGludm9rZWQgcmV0dXJuQW5kU2VuZFJlc3BvbnNlYCwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3VsdDogMiArIGV2ZW50Lm11bHRpcGxpZXJcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHByZUhvb2tlZCA9IGluc3RhbmNlMTIoaGFuZGxlcilcbiAgICAgICAgLnVzZShcbiAgICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRIZWxwZXJzIH0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyByZXR1cm5BbmRTZW5kUmVzcG9uc2UgfSA9IGdldEhlbHBlcnMoKTtcbiAgICAgICAgICAgICAgaWYgKHJldHVybkFuZFNlbmRSZXNwb25zZSB8fCAhcmV0dXJuQW5kU2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuQW5kU2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDEyMzQsXG4gICAgICAgICAgICAgICAgICBib2R5OiBcIm15IGN1c3RvbSBkYXRhXCIsXG4gICAgICAgICAgICAgICAgICBvYmo6IHtcbiAgICAgICAgICAgICAgICAgICAgbnU6IDEyMzUsXG4gICAgICAgICAgICAgICAgICAgIG9iajI6IHtcbiAgICAgICAgICAgICAgICAgICAgICBhcnI6IFsxLCAyLCAzLCAzMzNdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgLnVzZShcbiAgICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRIZWxwZXJzIH0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyByZXR1cm5BbmRTZW5kUmVzcG9uc2UgfSA9IGdldEhlbHBlcnMoKTtcbiAgICAgICAgICAgICAgaWYgKHJldHVybkFuZFNlbmRSZXNwb25zZSB8fCAhcmV0dXJuQW5kU2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuQW5kU2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgIGJvZHk6IFwidGVzdHRcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcHJlSG9va2VkKHtcbiAgICAgICAgbXVsdGlwbGllcjogMVxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCgxMjM0KTtcbiAgICAgIGV4cGVjdChyZXMub2JqLm9iajIuYXJyLmxlbmd0aCkudG9FcXVhbCg0KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJDcmVhdGVJbnN0YW5jZSBjb25maWd1cmUgbWV0aG9kXCIsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGluc3RhbmNlMTIgPSBDcmVhdGVJbnN0YW5jZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIGJ5IGRlZmF1bHRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3VsdDogMiArIGV2ZW50Lm11bHRpcGxpZXJcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHByZUhvb2tlZCA9IGluc3RhbmNlMTIoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICBpZiAoZSB8fCAhZSkgdGhyb3cgRXJyb3IoXCJGb3JjZWQgLiBMb3JlbSBpcHN1bVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBwcmVIb29rZWQoe1xuICAgICAgICBtdWx0aXBsaWVyOiAxXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlcy5zdGF0dXNDb2RlKS50b0VxdWFsKDUwMCk7XG4gICAgICBleHBlY3QocmVzLmJvZHkpLnRvTWF0Y2goYEZvcmNlZCAuIExvcmVtIGlwc3VtYCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKGBDcmVhdGVJbnN0YW5jZSBjb25maWd1cmUgbWV0aG9kIGFuZCBvdmVycmlkZSB3aXRoIG1pZGRsZXdhcmUnc2AsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGluc3RhbmNlMTIgPSBDcmVhdGVJbnN0YW5jZSh7XG4gICAgICAgIGNvbmZpZ3VyZToge1xuICAgICAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgICAgICBvbkNhdGNoSGFuZGxlcjogKGZuKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmbigpLCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuQW5kU2VuZFJlc3BvbnNlIGJ5IGRlZmF1bHRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3VsdDogMiArIGV2ZW50Lm11bHRpcGxpZXJcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHByZUhvb2tlZCA9IGluc3RhbmNlMTIoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgY29uZmlndXJlOiB7XG4gICAgICAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgICBvbkNhdGNoSGFuZGxlcjogKGZuKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGZuKCksIHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwM1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyBlID0+IHtcbiAgICAgICAgICAgIGlmIChlIHx8ICFlKSB0aHJvdyBFcnJvcihcIkJhY29uIGlwc3VtXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByZUhvb2tlZCh7XG4gICAgICAgIG11bHRpcGxpZXI6IDFcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoNDAzKTtcbiAgICAgIGV4cGVjdChyZXMuYm9keSkudG9FcXVhbChcbiAgICAgICAgYEJhY29uIGlwc3VtIC0gVW5leHBlY3RlZCB0b2tlbiBCIGluIEpTT04gYXQgcG9zaXRpb24gMGBcbiAgICAgICk7XG4gICAgICBleHBlY3QocmVzKS50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgYm9keTogYEJhY29uIGlwc3VtIC0gVW5leHBlY3RlZCB0b2tlbiBCIGluIEpTT04gYXQgcG9zaXRpb24gMGAsXG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMyxcbiAgICAgICAgaGVhZGVyczogeyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIG5vdCBvdmVycmlkZS9hdWdtZW50IG90aGVyIG1pZGRsZXdhcmUnc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVzdWx0OiAyICogZXZlbnQubXVsdGlwbGllclxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgcHJlSG9va2VkID0gaW5zdGFuY2UxMihoYW5kbGVyKS51c2UoXG4gICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICAgIGF1Z21lbnRNZXRob2RzOiB7XG4gICAgICAgICAgICAgIG9uQ2F0Y2hIYW5kbGVyOiAoZm4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZm4oKSwge1xuICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGhhbmRsZXI6IGFzeW5jIGUgPT4ge1xuICAgICAgICAgICAgLy8gaWYgKGUgfHwgIWUpIHRocm93IEVycm9yKFwiQmFjb24gaXBzdW1cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcHJlSG9va2VkKHtcbiAgICAgICAgbXVsdGlwbGllcjogMlxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMucmVzdWx0KS50b0VxdWFsKDQpO1xuXG4gICAgICBjb25zdCBoYW5kbGVyMiA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3VsdDogMiAqIGV2ZW50Lm11bHRpcGxpZXJcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGJlZm9yZUhvb2tUaGF0VGhyb3dzID0gaW5zdGFuY2UxMihoYW5kbGVyMilcbiAgICAgICAgLnVzZShcbiAgICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgICBjb25maWd1cmU6IHtcbiAgICAgICAgICAgICAgYXVnbWVudE1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICBvbkNhdGNoSGFuZGxlcjogKGZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZm4oKSwge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAxMjNcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZXI6IGFzeW5jIGUgPT4ge1xuICAgICAgICAgICAgICAvLyBpZiAoZSB8fCAhZSkgdGhyb3cgRXJyb3IoXCJCYWNvbiBpcHN1bTJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgICAudXNlKFxuICAgICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICAgIGNvbmZpZ3VyZToge1xuICAgICAgICAgICAgICAvLyBhdWdtZW50TWV0aG9kczoge1xuICAgICAgICAgICAgICAvLyAgIG9uQ2F0Y2hIYW5kbGVyOiAoZm4sIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmbiguLi5hcmdzKSwge1xuICAgICAgICAgICAgICAvLyAgICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICAgICAgICAgIC8vICAgICAgIGhlYWRlcnM6IHsgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIgfVxuICAgICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlcjogYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlIHx8ICFlKSB0aHJvdyBFcnJvcihcIkJhY29uIGlwc3VtMjNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgY29uc3QgcmVzMiA9IGF3YWl0IGJlZm9yZUhvb2tUaGF0VGhyb3dzKHtcbiAgICAgICAgbXVsdGlwbGllcjogN1xuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMyLnN0YXR1c0NvZGUpLnRvRXF1YWwoNTAwKTtcbiAgICAgIGV4cGVjdChyZXMyKS50b1N0cmljdEVxdWFsKHtcbiAgICAgICAgYm9keTogYEJhY29uIGlwc3VtMjMgLSBVbmV4cGVjdGVkIHRva2VuIEIgaW4gSlNPTiBhdCBwb3NpdGlvbiAwYCxcbiAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShgQXN5bmNGdW5jdGlvbiBhdWdtZW50IC0gQ3JlYXRlSW5zdGFuY2UgY29uZmlndXJlIG1ldGhvZCBhbmQgb3ZlcnJpZGUgd2l0aCBtaWRkbGV3YXJlJ3NgLCAoKSA9PiB7XG4gICAgaXQoXCIvLyBUT0RPXCIsICgpID0+IHtcbiAgICAgIGV4cGVjdCgxKS50b0VxdWFsKDEpO1xuICAgIH0pO1xuICB9KTtcbiAgLy8gYmVmb3JlRWFjaCgoKSA9PiB7XG4gIC8vICAgaW5zdGFuY2UxMiA9IENyZWF0ZUluc3RhbmNlKHtcbiAgLy8gICAgIGNvbmZpZ3VyZToge1xuICAvLyAgICAgICBhdWdtZW50TWV0aG9kczoge1xuICAvLyAgICAgICAgIG9uQ2F0Y2hIYW5kbGVyOiBhc3luYyAoZm4sIC4uLmFyZ3MpID0+IHtcbn0pO1xuXG5kZXNjcmliZShgUG9zdCBIb29rYCwgKCkgPT4ge1xuICBsZXQgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcblxuICBkZXNjcmliZShcIkJhc2VNaWRkbGV3YXJlIGhhbmRsZXIgbWV0aG9kXCIsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGluc3RhbmNlMSA9IENyZWF0ZUluc3RhbmNlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBpdC5vbmx5KFwic2hvdWxkIHNob3VsZCBmb3JjZSBjb25zdW1lIG1ldGhvZHMgaW52b2NhdGlvbiAoc2V0RXZlbnQsIHNldENvbnRleHQsIHJlc3BvbnNlT2JqZWN0VG9UaHJvdylcIiwgYXN5bmMgKCkgPT4ge1xuXG4gICAgaXQoXCJzaG91bGQga2VlcCBvd24gc3RhdGUgb2YgZXZlbnQgYW5kIGNvbnRleHQgYW5kIGF1dG8gcmV0cnVuIGl0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgZXZlbnQsIGNvbnRleHQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyAoKSA9PiB7fVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgZXZlbnRGcm9tU2VydmVybGVzcyA9IHtcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBcImR1bW15MTIzXCJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRleHRGcm9tU2VydmVybGVzcyA9IHsgcmVxdWVzdENvbnRleHQ6IDMyMSB9O1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKFxuICAgICAgICBldmVudEZyb21TZXJ2ZXJsZXNzLFxuICAgICAgICBjb250ZXh0RnJvbVNlcnZlcmxlc3NcbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXMuZXZlbnQpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzLmV2ZW50LmhlYWRlcnMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzLmV2ZW50LmhlYWRlcnMuQXV0aG9yaXphdGlvbikudG9FcXVhbChcImR1bW15MTIzXCIpO1xuXG4gICAgICBleHBlY3QocmVzLmNvbnRleHQpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzLmNvbnRleHQucmVxdWVzdENvbnRleHQpLnRvRXF1YWwoMzIxKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGdldCBoYW5kbGVyIGFyZ3VtZW50IG9iamVjdCBhbmQgaW5jcmVtZW50IGl0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgZXZlbnQsIGNvbnRleHQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiBhc3luYyAoeyBnZXRQYXJhbXMgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBldmVudCwgc2V0RXZlbnQgfSA9IGdldFBhcmFtcygpO1xuICAgICAgICAgICAgc2V0RXZlbnQoeyB2aWV3czogZXZlbnQudmlld3MgKyAxIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGV2ZW50RnJvbVNlcnZlcmxlc3MgPSB7XG4gICAgICAgIHZpZXdzOiAxXG4gICAgICB9O1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKGV2ZW50RnJvbVNlcnZlcmxlc3MsIHt9KTtcblxuICAgICAgZXhwZWN0KHJlcy5ldmVudCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuZXZlbnQudmlld3MpLnRvRXF1YWwoMik7XG5cbiAgICAgIGV4cGVjdChyZXMuY29udGV4dCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXMuY29udGV4dC5yZXF1ZXN0Q29udGV4dCkubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBnZXQgY29udGV4dCBhcmd1bWVudCBvYmplY3QsIGluY3JlbWVudCBpdCBhbmQgcmV0dXJuIGFzIGh0dHAgcmVzcG9uc2VcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudCwgY29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4geyBldmVudCwgY29udGV4dCB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgZ2V0UCA9IChnZXRQYXJhbXMsIGdldEhlbHBlcnMpID0+XG4gICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgZXZlbnQsIHNldEV2ZW50IH0gPSBnZXRQYXJhbXMoKTtcbiAgICAgICAgICAgICAgY29uc3QgeyByZXR1cm5BbmRTZW5kUmVzcG9uc2UgfSA9IGdldEhlbHBlcnMoKTtcblxuICAgICAgICAgICAgICBzZXRFdmVudCh7IHZpZXdzOiBldmVudC52aWV3cyArIDEgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXR1cm5BbmRTZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgZXZlbnQgdmlld3Mgc2hvdWxkIGJlIDMgYW5kIHdlIGdvdCAke2V2ZW50LnZpZXdzfWBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIC8vIHJlc29sdmUoe30pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcikudXNlKFxuICAgICAgICBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogYXN5bmMgKHsgZ2V0UGFyYW1zLCBnZXRIZWxwZXJzIH0pID0+IHtcbiAgICAgICAgICAgIGF3YWl0IGdldFAoZ2V0UGFyYW1zLCBnZXRIZWxwZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCBldmVudEZyb21TZXJ2ZXJsZXNzID0ge1xuICAgICAgICB2aWV3czogMlxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKGV2ZW50RnJvbVNlcnZlcmxlc3MsIHt9KTtcblxuICAgICAgZXhwZWN0KHJlcykudG9TdHJpY3RFcXVhbCh7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMyxcbiAgICAgICAgbWVzc2FnZTogXCJldmVudCB2aWV3cyBzaG91bGQgYmUgMyBhbmQgd2UgZ290IDNcIlxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKGBBdXRoIE1pZGRsZXdhcmVgLCAoKSA9PiB7XG4gIGxldCBpbnN0YW5jZTEgPSBDcmVhdGVJbnN0YW5jZSgpO1xuXG4gIGRlc2NyaWJlKFwiQXV0aE1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoeyBERUJVRzogdHJ1ZSB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybiBlbXB0eSBldmVudC51c2VyIHdoZW4gYXV0aCBmYWlsZWQgYW5kIHN0YXR1c0NvZGUgNDAzXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiB7IGV2ZW50IH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcikudXNlKFxuICAgICAgICBBdXRoTWlkZGxld2FyZSh7XG4gICAgICAgICAgcHJvbWlzaWZ5LFxuICAgICAgICAgIGNvZ25pdG9KV1REZWNvZGVIYW5kbGVyOiBqd3RkZWNvZGVBc3luY0hhbmRsZXJcbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBcInRva2VuXCJcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoNDAzKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybiA1MDAgdXBvbiBzeW50YXggZXJyb3JcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIHsgZXZlbnQgfTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKS51c2UoXG4gICAgICAgIEJhc2VNaWRkbGV3YXJlKHtcbiAgICAgICAgICBoYW5kbGVyOiAoeyBnZXRQYXJhbXMgfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNsYWltcyA9IGp3dF9kZWNvZGUoYHRva2VuYCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY2xhaW1zICYmIGNsYWltcy5leHAgJiYgY2xhaW1zLmF1ZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsLCBjbGFpbXMpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcImludmFsaWQgY1wiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBlICYmIGUubWVzc2FnZSA/IGAke2UubWVzc2FnZX1gIDogZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobXNnLCBtc2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoe1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogXCJ0b2tlblwiXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zb2xlLmxvZyhcInJlc1wiLCByZXMpO1xuXG4gICAgICBleHBlY3QocmVzKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlcy5zdGF0dXNDb2RlKS50b0VxdWFsKDUwMCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiQmFzZU1pZGRsZXdhcmVcIiwgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybiB0aGUgc2FtZSBoYW5kbGVyIHdoZW4gbm8gYXVnbWVudGF0aW9uIG5lZWRlZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcik7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7IGJvZHk6IDEgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuYm9keSkudG9FcXVhbCgxKTtcbiAgICAgIGV4cGVjdChyZXMuYm9keTIpLm5vdC50b0JlRGVmaW5lZCgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIHRoZSBzYW1lIGhhbmRsZXIgd2hlbiBubyBhdWdtZW50YXRpb24gbmVlZGVkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKTtcblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHsgdGhyZWU6IDEgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuYm9keSkubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG5cbiAgICBpdChgc2hvdWxkIGV4dGVuZCBcImV2ZW50XCIgYnkgYWRkaW5nIEF1dGggQ2xhaW1zYCwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpLnVzZShcbiAgICAgICAgQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6ICh7IGdldFBhcmFtcyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50LCBzZXRFdmVudCB9ID0gZ2V0UGFyYW1zKCk7XG4gICAgICAgICAgICBzZXRFdmVudCh7XG4gICAgICAgICAgICAgIGNsYWltczogeyBlbWFpbDogXCJ0eXJ0eXJcIiB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoe1xuICAgICAgICBoZWFkZXI6IFwiZXkxMjNcIixcbiAgICAgICAgYm9keTogJ3tcInN0cmluZ1wiOiBcInRvT2JqXCJ9J1xuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuY2xhaW1zLmVtYWlsKS50b0VxdWFsKFwidHlydHlyXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCBleHRlbmQgXCJldmVudFwiIGJ5IG1hbnkgbWlkZGxld2FyZXNgLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBCYXNlTWlkZGxld2FyZVdyYXBwZXIgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBCYXNlTWlkZGxld2FyZSh7XG4gICAgICAgICAgaGFuZGxlcjogKHsgZ2V0UGFyYW1zIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgc2V0RXZlbnQgfSA9IGdldFBhcmFtcygpO1xuICAgICAgICAgICAgc2V0RXZlbnQoeyB0b2tlbjogMTIzIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyID0gYXN5bmMgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBwbGFuX2NvZGUgPSBldmVudC5ib2R5LnBsYW5fY29kZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRva2VuID09PSAxMjMgPyBcInR5cm9cIiA6IG51bGw7XG4gICAgICAgIGNvbnN0IHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7IHN0YXR1c0NvZGU6IDIwMSwgbmFtZSwgcGxhbl9jb2RlIH0pO1xuICAgICAgICAgIH0sIDEpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSA9IGluc3RhbmNlMShoYW5kbGVyKVxuICAgICAgICAudXNlKEJhc2VNaWRkbGV3YXJlV3JhcHBlcigpKVxuICAgICAgICAudXNlKEJvZHlQYXJzZXJNaWRkbGV3YXJlKCkpO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUoe1xuICAgICAgICB0b2tlbjogXCJleTEyM1wiLFxuICAgICAgICBib2R5OiAne1wic3RyaW5nXCI6IFwidG9PYmoyXCIsIFwicGxhbl9jb2RlXCI6IFwic29tZXBsYW5jb2RlXCJ9J1xuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXMuc3RhdHVzQ29kZSkudG9FcXVhbCgyMDEpO1xuICAgICAgZXhwZWN0KHJlcy5uYW1lKS50b0VxdWFsKFwidHlyb1wiKTtcbiAgICAgIGV4cGVjdChyZXMucGxhbl9jb2RlKS50b0VxdWFsKFwic29tZXBsYW5jb2RlXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoYHNob3VsZCByZXR1cm4gbmV3IGluc3RhbmNlIGlmIGluc3RhbmNlIGlzIHJldXNlZCBieSBwYXNzaW5nIGRpZmZlcmVudCBoYW5kbGVyYCwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgQmFzZU1pZGRsZXdhcmVXcmFwcGVyID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gQmFzZU1pZGRsZXdhcmUoe1xuICAgICAgICAgIGhhbmRsZXI6ICh7IGdldFBhcmFtcyB9KSA9PiBnZXRQYXJhbXMoKS5zZXRFdmVudCh7IHRva2VuOiAxMjQgfSlcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyID0gYXN5bmMgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBwbGFuX2NvZGUgPSBldmVudC5ib2R5LnBsYW5fY29kZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRva2VuID09PSAxMjQgPyBcInR5cm8yXCIgOiBudWxsO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7IHN0YXR1c0NvZGU6IDIwMiwgbmFtZSwgcGxhbl9jb2RlIH0pO1xuICAgICAgICAgIH0sIDEpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIyID0gYXN5bmMgZXZlbnQgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHBsYW5fY29kZSA9XG4gICAgICAgICAgICBldmVudCAmJiBldmVudC5ib2R5ICYmIGV2ZW50LmJvZHkucGxhbl9jb2RlXG4gICAgICAgICAgICAgID8gZXZlbnQuYm9keS5wbGFuX2NvZGVcbiAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRva2VuID09PSAxMjQgPyBcInR5cm8yXCIgOiBudWxsO1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7IHN0YXR1c0NvZGU6IDIwMywgbmFtZSwgcGxhbl9jb2RlIH0pO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgYm9keTogZS5tZXNzYWdlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlclBsdXNNaWRkbGV3YXJlID0gaW5zdGFuY2UxKGhhbmRsZXIpXG4gICAgICAgIC51c2UoQmFzZU1pZGRsZXdhcmVXcmFwcGVyKCkpXG4gICAgICAgIC51c2UoQm9keVBhcnNlck1pZGRsZXdhcmUoKSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZXJXaXRoTm8gPSBpbnN0YW5jZTEoaGFuZGxlcjIpLnVzZShCb2R5UGFyc2VyTWlkZGxld2FyZSgpKTtcblxuICAgICAgY29uc3QgcmVzMiA9IGF3YWl0IGhhbmRsZXJXaXRoTm8oe1xuICAgICAgICB0b2tlbjogXCJleTEyM1wiLFxuICAgICAgICBib2R5OiB7fVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIHRva2VuOiBcImV5MTIzXCIsXG4gICAgICAgIGJvZHk6ICd7XCJzdHJpbmdcIjogXCJ0b09iajJcIiwgXCJwbGFuX2NvZGVcIjogXCJzb21lcGxhbmNvZGVcIn0nXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlczIuc3RhdHVzQ29kZSkudG9FcXVhbCgyMDMpO1xuICAgICAgZXhwZWN0KHJlczIucGxhbl9jb2RlKS50b0JlTnVsbCgpO1xuXG4gICAgICBleHBlY3QocmVzLnN0YXR1c0NvZGUpLnRvRXF1YWwoMjAyKTtcbiAgICAgIGV4cGVjdChyZXMubmFtZSkudG9FcXVhbChcInR5cm8yXCIpO1xuICAgICAgZXhwZWN0KHJlcy5wbGFuX2NvZGUpLnRvRXF1YWwoXCJzb21lcGxhbmNvZGVcIik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiQm9keVBhcnNlciBNaWRkbGV3YXJlXCIsICgpID0+IHtcbiAgICBsZXQgaW5zdGFuY2UxO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW5zdGFuY2UxID0gQ3JlYXRlSW5zdGFuY2UoKTtcbiAgICB9KTtcblxuICAgIGl0KGBzaG91bGQgZXh0ZW5kIFwiZXZlbnRcIiBieSBwYXJzaW5nIGJvZHlgLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4geyBwcmVmaXg6IGV2ZW50IH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVyUGx1c01pZGRsZXdhcmUgPSBpbnN0YW5jZTEoaGFuZGxlcikudXNlKFxuICAgICAgICBCb2R5UGFyc2VyTWlkZGxld2FyZSgpXG4gICAgICApO1xuXG4gICAgICBsZXQgcmVzID0gYXdhaXQgaGFuZGxlclBsdXNNaWRkbGV3YXJlKHtcbiAgICAgICAgaGVhZGVyOiBcImV5MTIzXCJcbiAgICAgIH0pO1xuICAgICAgZXhwZWN0KHJlcy5wcmVmaXguYm9keSkubm90LnRvQmVEZWZpbmVkKCk7XG5cbiAgICAgIHJlcyA9IGF3YWl0IGhhbmRsZXJQbHVzTWlkZGxld2FyZSh7XG4gICAgICAgIGJvZHk6IFwiXCJcbiAgICAgIH0pO1xuICAgICAgZXhwZWN0KHJlcy5wcmVmaXguYm9keSkudG9FcXVhbChcIlwiKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
