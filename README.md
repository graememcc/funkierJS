# funkierJS #

The functional toolbox for Javascript.
https://graememcc.github.io/funkierJS

    - Pragmatic curried functions—everywhere
    - Curried implementations of much of the standard Javascript library, leaving you free to concentrate on what matters
    - Type-checking when appropriate
    - In-library help

funkierJS is the toolbox you need to quickly start programming in a functional style in Javascript, wherever you need it: on Node or in the browser. Utterly pragmatic, it provides useful currying mechanisms to allow you to build your own functions, which also let you choose how to manage the reality of working in a non-pure environment. Its curried implementations of much of the ES5 standard library leave you free to concentrate on your business logic, rather than reinventing the wheel, whilst simultaneously removing some trip-hazards, and enabling functional idioms like treating strings as lists of characters. Its in-library help ensures you don't need to slow down to reach for API documentation—instead pull up a quick summary in your REPL! 


## Pragmatic curried functions ##

funkierJS works in terms of curried functions: where every function that takes more than one argument is notionally regarded as a function of 1 argument which returns a new function awaiting the remaining arguments. Whilst simple currying can be quickly emulated using Javascript's native Function.prototype.bind, one quickly drowns in a sea of parentheses as one translates calling a function of 3 arguments to f(1)(2)(3).

funkierJS provides pragmatic curried functions: yes, you can call funkierJS's pragmatic curried functions one argument at a time, but if you have more arguments available, then you can supply them all at once. Your three argument function can now be called using any of f(1)(2)(3), f(1, 2)(3), f(1)(2, 3) as well as plain old f(1, 2, 3).

funkierJS will keep you in the world of curried functions as much as possible. As well as supplying the means for you to curry your own functions, funkierJS always returns curried functions from its methods.

Furthermore, funkierJS lets you choose how to handle state. Purity is something to strive for, but we cannot deny the reality that Javascript is not a pure, functional language. funkierJS's currying choices let you specify how your functions handle the state of the world: curry them with curry when you are aiming for purity: this will be null inside such functions. Curry them with bind when you want to fix the value of this, regardless of what later partial applications try to do. Finally, curry methods on an object prototype with objectCurry, and you can enjoy all the benefits of partial application with your object methods, with functions that permanently bind the value of this on each first partial application. (In some circumstances, objectCurry can curry constructors too!)



## Everything you need to be productive ##

Many libraries provide you with the most basic building blocks, but still leave you needing to build too much scaffolding before you can get down to business. Not so with funkierJS. It provides curried implementations of most of the ECMAScript Standard mandated functions, and wrappers around other common operations. This enables you to quickly get to work on the tasks that are important to you. In doing so, funkierJS also provides other benefits, in particular blunting some sharp edges in the Standard. Functions with optional arguments become different functions with different signatures in funkierJS. Ever called Javascript's native map with parseInt? With funkierJS's reimplementations, such problems melt away. funkierJS takes a pragmatic approach to type-checking, not getting in your way unnecessarily, whilst alerting you when you were unlikely to be wanting a coercion. Finally, funkierJS's reimplementations enable common functional idioms, for example, allowing you to easily map, filter and reduce over both arrays and strings with its API functions.


## In-library help ##

funkierJS aims to make your life easier. To that end, it minimises your need to context-switch, and provides a help function, which accepts any of its API functions, and provides a quick summary of usage, right there in your REPL or web console. You can quickly find the information you need, and then get back to more interesting problems!


## Get funkierJS ##

    npm install funkierJS

or download a [browser build](#https://graememcc.github.io/funkierJS/funkierJS.js)
