const assert = require("assert");
const { CreateInstance, BaseHook } = require("../index");

const beforeHook = CreateInstance();

const handler = (event, context) => {
  return {
    event,
    context
  };
};

const newHandler = beforeHook(handler).use(
  BaseHook({
    handler: ({ getParams }) => {
      const { event, setEvent } = getParams();

      setEvent({
        number: ++event.number
      });
    }
  })
);

newHandler({
  number: 2
}).then(x => {
  assert(x.event.number === 3);
});

// console.log("hers", result);
