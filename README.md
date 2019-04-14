## Warning - before-hook is still in 'alpha' stage.

## npm install before-hook

A modern pre-hook JS library that's just easy, built with love and style.

## Getting Started

Basically, you have found this library because you are looking for a way to re-use code or middlewares for your functions (probably serverless lambdas).

```

import { CreateInstance } from 'before-hook';

const toBeAuthenticatedHandler = async (event, context) => {
  // event.user will be set by the middleware
  // if it’s null, the middleware returns a 403 response and this handler will not be reached at all

  const { email } = event.user;
  const data = await User.findByEmail(email);

  return response(data);
};

const beforeHook = CreateInstance(); // provide configs if necessary
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

### More Example - Creating a middleware for a third party api integration using `base` middleware

```
import { CreateInstance, BaseMiddleware } from 'before-hook';

const getColleaguesHandler = async (event, context) => {
  try {
    // event.user will be set by the middleware - AuthMiddleware
    // event.userFriends will be set by the 2nd custom middleware
    // if it’s null, the middleware returns a 403 response and this handler will not be reached at all

    const { friends } = event.user;
    const colleagues = friends.filter(friend => friend.groupId === 25);

    return response({
      statusCode: 200,
      data: colleagues
    });
  } catch (e) {
    return {
      statusCode: 500,
      message: e.message
    }
  }
};

const beforeHook = CreateInstance(); // provide configs if necessary
const getColleagues = beforeHook(getColleaguesHandler)
  .use(AuthMiddleware()) // sets event.user based from JWT token
  .use(
    BaseMiddleware({
      handler: async ({ getParams }) => {
        const { event, setEvent } = getParams();
        const { socialNetworkingSiteId } = event.user; // assuming we have this field from "claims"
        const friends = await THIRD_PARTY_API.getFriendsById(socialNetworkingSiteId);
        setEvent({
          userFriends: friends
        })
      }
    })
  );

export { getColleagues };

// http://localhost:3000/getColleagues
```

### License

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
