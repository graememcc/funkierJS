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
function.

Currying a function that has already been curried will return the exact same function.

The returned function will have a length of 1, unless the original function will have length 0, in which case
the result also has length 0. Note that when currying functions of length 0 and 1 that the results will be
different functions from those passed in.

If you need a function which accepts an argument count that differs from the function's length property,
use `curryWithArity`.

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
natural number, or if the second parameter is not a function.

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

It is possible to recurry previously curried functions, however generally it only makes sense to recurry a
function that has not been partially applied: this will be equivalent to currying the original function.
Recurrying a partially applied function will likely not work as you expect: the new function will be one that
requires the given number of arguments before calling the original function with the partially applied arguments
and some of the ones supplied to the recurried function.

#### Examples ####
    var f = function(x, y) { console.log(x, y); }
    
    var g = curryWithArity(1, f);
    
    g(7);  // => 1, undefined logged
    
    var h = curryWithArity(3, f);
    
    var j = h(2, 'a');
    
    j(9);  // => 2, 'a' logged
    
    h('fizz')('buzz', 'foo') // => 'fizz', 'buzz' logged
***
