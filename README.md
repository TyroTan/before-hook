## Warning - before-hook is still in 'alpha' stage.

## npm install before-hook

A modern pre-hook JS library that's just easy, built with love and style.

## Getting Started

Basically, you have found this library because you are looking for a way to re-use code or middlewares for your functions (probably serverless lambdas).

```

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
coming soon.
```

### MIT License

Copyright (c) 2019 ty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
