"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResponseResource = exports.default = void 0;

require("source-map-support/register");

const ResponseResource = () => ({
  getParams,
  addTree
}) => {
  const headersState = {};
  /* eslint-disable-next-line no-unused-vars */

  const [event, context] = getParams();

  if (context && typeof context.json === "function") {// this is probably expressJS environment
  } else {
    addTree("response", {
      /* end: TODO */

      /* status: TODO */
      json: obj => {
        try {
          return {
            "Content-Type": "application/json",
            ...headersState,
            body: typeof obj === "string" ? obj : JSON.stringify({ ...obj
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
      } //   getHeaders: () => headersState

    });
  }
};

exports.ResponseResource = ResponseResource;
var _default = {};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnNvdXJjZS5qcyJdLCJuYW1lcyI6WyJSZXNwb25zZVJlc291cmNlIiwiZ2V0UGFyYW1zIiwiYWRkVHJlZSIsImhlYWRlcnNTdGF0ZSIsImV2ZW50IiwiY29udGV4dCIsImpzb24iLCJvYmoiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIiwiZ2V0SGVhZGVyIiwia2V5Iiwic2V0SGVhZGVyIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFNQSxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7QUFBRUMsRUFBQUEsU0FBRjtBQUFhQyxFQUFBQTtBQUFiLENBQUQsS0FBNEI7QUFDekQsUUFBTUMsWUFBWSxHQUFHLEVBQXJCO0FBRUE7O0FBQ0EsUUFBTSxDQUFDQyxLQUFELEVBQVFDLE9BQVIsSUFBbUJKLFNBQVMsRUFBbEM7O0FBRUEsTUFBSUksT0FBTyxJQUFJLE9BQU9BLE9BQU8sQ0FBQ0MsSUFBZixLQUF3QixVQUF2QyxFQUFtRCxDQUNqRDtBQUNELEdBRkQsTUFFTztBQUNMSixJQUFBQSxPQUFPLENBQUMsVUFBRCxFQUFhO0FBQ2xCOztBQUNBO0FBQ0FJLE1BQUFBLElBQUksRUFBRUMsR0FBRyxJQUFJO0FBQ1gsWUFBSTtBQUNGLGlCQUFPO0FBQ0wsNEJBQWdCLGtCQURYO0FBRUwsZUFBR0osWUFGRTtBQUdMSyxZQUFBQSxJQUFJLEVBQ0YsT0FBT0QsR0FBUCxLQUFlLFFBQWYsR0FDSUEsR0FESixHQUVJRSxJQUFJLENBQUNDLFNBQUwsQ0FBZSxFQUNiLEdBQUdIO0FBRFUsYUFBZjtBQU5ELFdBQVA7QUFVRCxTQVhELENBV0UsT0FBT0ksQ0FBUCxFQUFVO0FBQ1Y7QUFDQUMsVUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWUsdUNBQWYsRUFBdURGLENBQUMsQ0FBQ0csT0FBekQ7QUFFQTs7QUFDQUYsVUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWNGLENBQWQ7QUFFQSxpQkFBTztBQUNMLDRCQUFnQixrQkFEWDtBQUVMLGVBQUdSLFlBRkU7QUFHTEssWUFBQUEsSUFBSSxFQUFFO0FBSEQsV0FBUDtBQUtEO0FBQ0YsT0E1QmlCO0FBNkJsQk8sTUFBQUEsU0FBUyxFQUFFQyxHQUFHLElBQUliLFlBQVksQ0FBQ2EsR0FBRCxDQTdCWjtBQThCbEJDLE1BQUFBLFNBQVMsRUFBRSxDQUFDRCxHQUFELEVBQU1FLEdBQU4sS0FBYztBQUN2QmYsUUFBQUEsWUFBWSxDQUFDYSxHQUFELENBQVosR0FBb0JFLEdBQXBCO0FBQ0QsT0FoQ2lCLENBaUNsQjs7QUFqQ2tCLEtBQWIsQ0FBUDtBQW1DRDtBQUNGLENBN0NEOzs7ZUErQ2UsRSIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFJlc3BvbnNlUmVzb3VyY2UgPSAoKSA9PiAoeyBnZXRQYXJhbXMsIGFkZFRyZWUgfSkgPT4ge1xuICBjb25zdCBoZWFkZXJzU3RhdGUgPSB7fTtcblxuICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnMgKi9cbiAgY29uc3QgW2V2ZW50LCBjb250ZXh0XSA9IGdldFBhcmFtcygpO1xuXG4gIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0Lmpzb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgIC8vIHRoaXMgaXMgcHJvYmFibHkgZXhwcmVzc0pTIGVudmlyb25tZW50XG4gIH0gZWxzZSB7XG4gICAgYWRkVHJlZShcInJlc3BvbnNlXCIsIHtcbiAgICAgIC8qIGVuZDogVE9ETyAqL1xuICAgICAgLyogc3RhdHVzOiBUT0RPICovXG4gICAgICBqc29uOiBvYmogPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIC4uLmhlYWRlcnNTdGF0ZSxcbiAgICAgICAgICAgIGJvZHk6XG4gICAgICAgICAgICAgIHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICA/IG9ialxuICAgICAgICAgICAgICAgIDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAuLi5vYmpcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlICovXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgUmVzcG9uc2VSZXNvdXJjZSAtPiByZXNwb25zZSAtPiBqc29uIGAsIGUubWVzc2FnZSk7XG5cbiAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZSAqL1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAuLi5oZWFkZXJzU3RhdGUsXG4gICAgICAgICAgICBib2R5OiBudWxsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldEhlYWRlcjoga2V5ID0+IGhlYWRlcnNTdGF0ZVtrZXldLFxuICAgICAgc2V0SGVhZGVyOiAoa2V5LCB2YWwpID0+IHtcbiAgICAgICAgaGVhZGVyc1N0YXRlW2tleV0gPSB2YWw7XG4gICAgICB9XG4gICAgICAvLyAgIGdldEhlYWRlcnM6ICgpID0+IGhlYWRlcnNTdGF0ZVxuICAgIH0pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7fTtcbmV4cG9ydCB7IFJlc3BvbnNlUmVzb3VyY2UgfTtcbiJdfQ==
