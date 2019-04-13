# npm install before-hook

A modern pre-hook JS library that's just easy.

## Getting Started

Basically, you have found this library because you are looking for a way to re-use code or middlewares for your functions (probably serverless lambdas).

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
  * Synchronous and vanilla feel
    * Forces you to use `try catch` and `async/await`
  * Granularity and Composability
    * Write your own middlewares, short, testable and easy to use.

## Authors

* **Tyro Hunter Tan** - *Initial work* - [before-hook](https://github.com/slugs99)

## License

Copyright (c) 2019, Tyro Hunter Tan

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
