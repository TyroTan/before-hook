# npm install before-hook

A modern pre-hook JS library that's just easy.

## Getting Started

Basically, you have found this library because you are looking for a way to re-use code or middlewares for your functions (Probably serverless lambdas).

```

import { Create } from 'before-hook';

const toBeAuthenticatedHandler = async (event, context) => {
  // event.user will be set by the middleware
  // if it’s null, the middleware returns a 403 response and this handler will not be reached at all

  const { email } = event.user;
  const data = await User.findByEmail(email);

  return response(data);
};

const beforeHook = Create(); // provide configs if necessary
const authenticatedHandler = beforeHook(toBeAuthenticatedHandler).use(
  AuthenticationMiddleware()
);

export { authenticatedHandler };

```


## Running the tests

  npm run test

## Design Philosophies

  * Building blocks are Function Object - Functions that have properties augmented
    * Core components will have consistent "form"
  * Functional, no `new` and `this`
  * Maintainable, framework agnostic and extensible
    * Written in its `simplest javascript way` so everyone can follow and contribute.
  * Easy, Light weight and Fast
    * Simple and short, no other dependencies. Perfect for `serverless` apps.
  * Synchronous and Vanilla feel
    * Forces you to use `try catch` and `async/await`
  * Granularity and Composability
    * Write your own middlewares, short, testable and easy to use.

## Authors

* **Tyro Hunter Tan** - *Initial work* - [before-hook](https://github.com/slugs99)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

ISC

