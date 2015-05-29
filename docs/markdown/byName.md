# funkierJS API #

### arity ###
See `arityOf`
***
### arityOf ###
Category: Function

*Synonyms:* `arity`

**Usage:** `var result = arityOf(f);`

Parameters:  
f `function`

Returns: `number`

Reports the real arity of a function. If the function has not been curried by funkier.js, this simply returns the
function's length property. For a function that has been curried, the arity of the original function will be
reported (the function's length property will always be 0 or 1 in this case). For a partially applied function,
the amount of arguments not yet supplied will be returned.

#### Examples ####
    arityOf(function(x) {}); // => 1;
***
### bind ###
Category: Function

*Synonyms:* `bindWithContext`

**Usage:** `var result = bind(ctx, f);`

Parameters:  
ctx `objectlike`  
f `function`

Returns: `function`

Given an object and function, returns a curried function with the same arity as the original, and whose execution
context is permanently bound to the supplied object. The function will be called when sufficient arguments have
been supplied. Superfluous arguments are discarded. It is possible to partially apply the resulting function, and
indeed the further resulting function(s). The resulting function and its partial applications will throw if they
require at least one argument, but are invoked without any. `bind` throws if the first parameter is not an
an acceptable type for an execution context, or if the last parameter is not a function.

The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required before the
wrapped function will be invoked.

In some limited circumstances, it is possible to recurry previously curried functions, however generally it only
makes sense to recurry a function that has not been partially applied: this will be equivalent to currying the
original function. To be able to recurry a curried function to a different arity, the execution context given
must be the exact object that was previously used to create the function being recurried. It is an error to
try and recurry a curried function bound to one execution context to another. In particular, functions curried
with [`curry`](#curry) or [`curryWithArity`](#curryWithArity) cannot be curried with an execution context: they
have already been bound with an implicit `null` execution context. `bind` will throw in that case.

Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
curry such functions won't throw, but they will not work as expected.

#### Examples ####
    var obj = {foo: 42};
    
    var f = function(x, y) { return this.foo + x; };
    
    var g = bind(obj, f);
    
    g(3)(2); // returns 45
    
    g(5, 2); // returns 47
    
    var obj2 = {foo: 10};
    var h = bindWithContextAndArity(3, obj2, f);
    var j = bind(obj2, h); // OK, same context object
    
    var err = bind({foo: 1}, g); // throws: execution contexts don't match
***
### bindWithContext ###
See `bind`
***
### bindWithContextAndArity ###
Category: Function

**Usage:** `var result = bindWithContextAndArity(n, ctx, f);`

Parameters:  
n `strictNatural`  
ctx `objectlike`  
f `function`

Returns: `function`

Given an arity, object and function, returns a curried function whose execution context is permanently bound to
the supplied execution context, and whose arity equals the arity given. The supplied arity need not equal the
function's length. The function will be only called when the specified number of arguments have been supplied.
Superfluous arguments are discarded. It is possible to partially apply the resulting function, and indeed the
further resulting function(s). The resulting function and its partial applications will throw if they require at
least one argument, but are invoked without any. `bind` throws if the arity is not a natural number, if the second
parameter is not an acceptable type for an execution context, or if the last parameter is not a function.

The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required before the
wrapped function will be invoked.

As noted above, you are permitted to curry a function to a smaller arity than its length. Whether the resulting
function behaves in a useful manner will of course depend on the function.

In some limited circumstances, it is possible to recurry previously curried functions, however generally it only
makes sense to recurry a function that has not been partially applied: this will be equivalent to currying the
original function. To be able to recurry a curried function to a different arity, the execution context given
must be the exact object that was previously used to create the function being recurried. It is an error to
try and recurry a curried function bound to one execution context to another. In particular, functions curried
with [`curry`](#curry) or [`curryWithArity`](#curryWithArity) cannot be curried with an execution context: they
have already been bound with an implicit `null` execution context. `bindWithContextAndArity` will throw in that
case.

Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
curry such functions won't throw, but they will not work as expected.

#### Examples ####
    var obj = {foo: 42};
    
    var f = function(x, y) { return this.foo + x; };
    
    var g = bindWithContextAndArity(1, obj, f);
    
    g(3); // returns 45
    
    var h = bindWithContextAndArity(3, obj, g); // OK, same context object
    h(2)(3, 4); // returns 44
    
    var err = bindWithContextAndArity(2, {foo: 1}, g); // throws: execution contexts don't match
    
    var ok = bindWithContextAndArity(2, {foo: 1}, f); // still ok to bind the original function though
***
### curry ###
Category: Function

**Usage:** `var result = curry(f);`

Parameters:  
f `function`

Returns: `function`

Curries the given function f, returning a function which accepts the same number of arguments as the original
function's length property, but which may be partially applied. The function can be partially applied by passing
arguments one at a time, or by passing several arguments at once. The function can also be called with more
arguments than the given function's length, but the superfluous arguments will be ignored, and will not be
passed to the original function. If the curried function or any subsequent partial applications require at least
one argument, then calling the function with no arguments will throw. `curry` throws if its argument is not a
function. It will also throw if the function is known to be bound to a specific execution context.

Currying a function that has already been curried will return the exact same function.

The returned function will have a length of 1, unless the original function will have length 0, in which case
the result also has length 0. Note that when currying functions of length 0 and 1 that the results will be
different functions from those passed in.

If you need a function which accepts an argument count that differs from the function's length property,
use `curryWithArity`.

Note that you cannot pass in functions that have been bound to a specific execution context using [`bind`](#bind),
or [`bindWithContextAndArity`](#bindWithContextAndArity): allowing those would break the invariant that functions
curried with `curry` are invoked with a null execution context. Thus an error is thrown in such cases. (However,
funkierJS cannot tell if a function has been bound with the native `bind` method. Currying such functions might
lead to unexpected results).

#### Examples ####
    var f = function(x, y, z) { console.log(x, y, z); }
    
    var g = curry(f);
    
    g(4);  // => a function awaiting two arguments
    
    g(4)(2); // => a function awaiting one argument
    
    g(4)(2)('z'); // => 4, 2, 'z' logged
    
    g('a', 'b')('c'); // => 'a', 'b' 'c' logged
    
    g('x')('y', 'z'); // => 'x', 'y' 'z' logged
    
    g('d', 'e', 'f'); // => 'd', 'e' 'f' logged
    
    curry(g) === g;  // => true
***
### curryWithArity ###
Category: Function

**Usage:** `var result = curryWithArity(n, f);`

Parameters:  
n `strictNatural`  
f `function`

Returns: `function`

Curries the given function f to the supplied arity, which need not equal the function's length. The function will
be called when that number of arguments have been supplied. Superfluous arguments are discarded. The original
function will be called with a null execution context. It is possible to partially apply the resulting function,
and indeed the further resulting function(s). The resulting function and its partial applications will throw if
they require at least one argument, but are invoked without any. `curryWithArity` throws if the arity is not a
natural number, or if the second parameter is not a function. It will also throw if the given function is known
to be bound to a specific execution context.

The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
length. The [arityOf](#arityOf) function can be used to determine how many arguments are required before the
wrapped function will be invoked.

As noted above, you are permitted to curry a function to a smaller arity than its length. Whether the resulting
function behaves in a useful manner will of course depend on the function. One use case of `curryWithArity` is
to create unique functions from functions that accept optional arguments. For example, one common error involves
mapping over an array with `parseInt`, which has an optional *radix* parameter. `Array.prototype.map` invokes
the mapping function with additional metadata such as the position of the current element; when these factors
collide, one ends up trying to convert to numbers whose radix equals the array index. Instead, one could use
`curryWithArity` with an arity of 1 to create a new function that guarantees `parseInt` will be called with only
one argument.

It is possible to recurry functions that have been previously curried with [`curry`](#curry) or `curryWithArity`,
however generally it only makes sense to recurry a function that has not been partially applied: this will be
equivalent to currying the original function. Recurrying a partially applied function will likely not work as you
expect: the new function will be one that requires the given number of arguments before calling the original
function with the partially applied arguments and some of the ones supplied to the recurried function.

You cannot however pass in functions that have been bound to a specific execution context using [`bind`](#bind),
or [`bindWithContextAndArity`](#bindWithContextAndArity): `curryWithArity` promises to invoke functions with a null
execution context, but those functions have a fixed execution context that cannot be overridden. An error is
thrown if the function has been bound to an execution context in this way.

Note however that funkierJS has no visibility into the execution contexts of functions bound using the native
function `bind` method. Attempting to curry these might lead to surprising results, and should be avoided.

#### Examples ####
    var f = function(x, y) { console.log(x, y); }
    
    var g = curryWithArity(1, f);
    
    g(7);  // => 1, undefined logged
    
    var h = curryWithArity(3, f);
    
    var j = h(2, 'a');
    
    j(9);  // => 2, 'a' logged
    
    h('fizz')('buzz', 'foo') // => 'fizz', 'buzz' logged
***
