const ResponseResource = () => ({ getParams, addTree }) => {
  const headersState = {};

  /* eslint-disable-next-line no-unused-vars */
  const [event, context] = getParams();

  if (context && typeof context.json === "function") {
    // this is probably expressJS environment
  } else {
    addTree("response", {
      /* end: TODO */
      /* status: TODO */
      json: obj => {
        try {
          return {
            "Content-Type": "application/json",
            ...headersState,
            body:
              typeof obj === "string"
                ? obj
                : JSON.stringify({
                    ...obj
                  })
          };
        } catch (e) {
          /* eslint-disable-next-line no-console */
          console.error(`ResponseResource -> response -> json `, e.message);

          /* eslint-disable-next-line no-console */
          console.error(e);

          return {
            "Content-Type": "application/json",
            ...headersState,
            body: null
          };
        }
      },
      getHeader: key => headersState[key],
      setHeader: (key, val) => {
        headersState[key] = val;
      }
      //   getHeaders: () => headersState
    });
  }
};

export default {};
export { ResponseResource };
