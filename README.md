# funkierJS #

The functional toolbox for Javascript.

funkierJS is a work in progress. It is intended to provide functional versions of most of the ECMAScript 5.1 API, along
with other useful functions for functional programming.

The principles that underpin funkierJS are:

  - Pragmatic curried functions everywhere
  - Proportionate type checking

What do I mean by pragmatic curried functions? A curried function regards a function taking 2 or more parameters as a
function of one parameter which, when supplied that parameter, yields a new function requiring one fewer parameter.
When all parameters have been supplied, the computation occurs. funkierJS's pragmatic curried functions tweak this
slightly: parameters are not required to be supplied one at a time. Instead, the functions, whilst nominally of length
1, will accept up to the required number of arguments. If the maximal number of arguments are not supplied, then the
returned function will similarly accept up to the outstanding number of arguments.

As an example, suppose we have a function `f` of arity 3. With strict currying, this would be invoked as follows:
    f(a)(b)(c)
In funkierJS, all of the following will additionally work:
    f(a, b, c)
    f(a, b)(c)
    f(a)(b, c)


## Current Status ##

I have recently reset this project, to enable me to review the API, smooth out inconsistencies, transition to a
Browserify build and possibly remove functions with limited utility. As functions are reviewed, they will be
uncommented and reinstated.

Currently I am reworking the documentation generation system (on the documentation branch). This work will merge
soon: work on the library proper will resume immediately after.
