# funkierJS API: By Category #

## Function##
### arity ###
See `arityOf`
***
### arityOf ###
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### bind ###
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

`bind` will accept functions that have been previously been curried to the same execution context, as that being
provided, but will effectively be an identity function in such cases. However, attempting to curry a function
known to be bound to a different execution context is an error. In particular, functions curried
with [`curry`](#curry) or [`curryWithArity`](#curryWithArity) cannot be curried with an execution context: they
have already been bound with an implicit `null` execution context. Equally, functions curried with
[`objectCurry`](#objectCurry) and [`objectCurryWithArity`](#objectCurryWithArity) cannot be passed to `bind`, due
to the different way in which they acquire an execution context. `bind` will throw in such cases.

Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
curry such functions won't throw, but they will not work as expected.

#### Examples ####
    var obj = {foo: 42};
    
    var f = function(x, y) { return this.foo + x; };
    
    var g = funkierJS.bind(obj, f);
    
    g(3)(2); // returns 45
    
    g(5, 2); // returns 47
    
    var obj2 = {foo: 10};
    var h = funkierJS.bindWithContextAndArity(3, obj2, f);
    var j = funkierJS.bind(obj2, h); // OK, same context object
    
    var err = funkierJS.bind({foo: 1}, g); // throws: execution contexts don't match
***
### bindWithContext ###
See `bind`
***
### bindWithContextAndArity ###
**Usage:** `var result = bindWithContextAndArity(n, ctx, f);`

Parameters:  
n `strictNatural`  
ctx `objectlike`  
f `function`

Returns: `function`

Given an arity, object and function, returns a curried function whose execution context is permanently bound to
the supplied object, and whose arity equals the arity given. The supplied arity need not equal the function's
length. The function will be only called when the specified number of arguments have been supplied. Superfluous
arguments are discarded. It is possible to partially apply the resulting function, and indeed the further
resulting function(s). The resulting function and its partial applications will throw if they require at least
one argument, but are invoked without any. `bindWithContextAndArity` throws if the arity is not a natural
number, if the second parameter is not an acceptable type for an execution context, or if the last parameter is
not a function.

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
have already been bound with an implicit `null` execution context. Likewise, functions that have been curried
using either [`objectCurry`](#objectCurry) or [`objectCurryWithArity`](#objectCurryWithArity) cannot be curried
using `bindWithContextAndArity`, due to the different mechanism they use to acquire an execution context.
`bindWithContextAndArity` will throw in that such cases.

Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
curry such functions won't throw, but they will not work as expected.

#### Examples ####
    var obj = {foo: 42};
    
    var f = function(x, y) { return this.foo + x; };
    
    var g = funkierJS.bindWithContextAndArity(1, obj, f);
    
    g(3); // returns 45
    
    var h = funkierJS.bindWithContextAndArity(3, obj, g); // OK, same context object
    h(2)(3, 4); // returns 44
    
    var err = funkierJS.bindWithContextAndArity(2, {foo: 1}, g); // throws: execution contexts don't match
    
    var ok = funkierJS.bindWithContextAndArity(2, {foo: 1}, f); // still ok to bind the original function though
***
### constant ###
**Usage:** `var result = constant(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `any`

Intended to be partially applied, first taking a value, returning a function that takes another parameter
and which always returns the first value.

#### Examples ####
    var f = funkierJS.constant(42);
    f(10); // => 42
***
### constant0 ###
**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### curry ###
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

Currying a function that has already been curried will return the exact same function, unless the function was
curried with a different mechanism - see below.

The returned function will have a length of 1, unless the original function will have length 0, in which case
the result also has length 0. Note that when currying functions of length 0 and 1 that the results will be
different functions from those passed in.

If you need a function which accepts an argument count that differs from the function's length property,
use `curryWithArity`.

Note that you cannot pass in functions that have been bound to a specific execution context using [`bind`](#bind),
or [`bindWithContextAndArity`](#bindWithContextAndArity): allowing those would break the invariant that functions
curried with `curry` are invoked with a null execution context. Similarly, functions curried with
[`objectCurry`](#objectCurry) and [`objectCurryWithArity`](#objectCurryWithArity) cannot be recurried through
`curryWithArity`. Thus an error is thrown in such cases. (However, funkierJS cannot tell if a function has been
bound with the native `bind` method. Currying such functions might lead to unexpected results).

#### Examples ####
    var f = function(x, y, z) { console.log(x, y, z); }
    
    var g = funkierJS.curry(f);
    
    g(4);  // => a function awaiting two arguments
    
    g(4)(2); // => a function awaiting one argument
    
    g(4)(2)('z'); // => 4, 2, 'z' logged
    
    g('a', 'b')('c'); // => 'a', 'b' 'c' logged
    
    g('x')('y', 'z'); // => 'x', 'y' 'z' logged
    
    g('d', 'e', 'f'); // => 'd', 'e' 'f' logged
    
    funkierJS.curry(g) === g;  // => true
***
### curryWithArity ###
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
execution context, but those functions have a fixed execution context that cannot be overridden. For similar
reasons, functions curried with [`objectCurry`](#objectCurry) or [`objectCurryWithArity`](#objectCurryWithArity)
cannot be curried. An error is thrown if the function has been bound to an execution context in this way.

Note however that funkierJS has no visibility into the execution contexts of functions bound using the native
function `bind` method. Attempting to curry these might lead to surprising results, and should be avoided.

#### Examples ####
    var f = function(x, y) { console.log(x, y); }
    
    var g = funkierJS.curryWithArity(1, f);
    
    g(7);  // => 1, undefined logged
    
    var h = funkierJS.curryWithArity(3, f);
    
    var j = h(2, 'a');
    
    j(9);  // => 2, 'a' logged
    
    h('fizz')('buzz', 'foo') // => 'fizz', 'buzz' logged
***
### flip ###
**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### objectCurry ###
**Usage:** `var result = objectCurry(f);`

Parameters:  
f `function`

Returns: `function`

Given a function, returns a curried function which calls the underlying with the execution context active when the
first arguments are supplied. This means that when partially applying the function, the resulting functions will
have their execution context permanently bound. This method of binding is designed for currying functions that
exist on an object's prototype. The function will be only called when sufficient arguments have been supplied.
Superfluous arguments are discarded. The resulting function and its partial applications will throw if they
require at least one argument, but are invoked without any. `objectCurry` throws if its parameter is not a
function. The resulting function will throw if invoked with an undefined execution context.

The returned function will have a length of 1, unless a function of arity of 0 was supplied, in which case this
will be the length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required
before the wrapped function will be invoked.

One can pass in a function created by `objectCurry` or [`objectCurryWithArity`](#objectCurryWithArity) providing
it has not been partially applied. This will effectively be an identity operation. However, passing in a partially
applied function derived from an earlier currying call is an error, as the execution context has now been bound.
Similarly, functions returned from [`curry`](#curry), [`curryWithArity`](#curryWithArity), [`bind`](#bind) and
[`bindWithContextAndArity`](#bindWithContextAndArity) cannot be curried with this function, and will throw an
error, just as those functions curry functions and their partial applications returned from `objectCurry`.
`objectCurry` will throw when provided with an invalid function.

Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
curry such functions won't throw, but they will not work as expected.

#### Examples ####
    var proto = {foo: function(x, y) { return x + y + this.bar; }};
    proto.foo = funkierJS.objectCurry(proto.foo);
    
    var obj1 = Object.create(proto);
    obj1.bar = 10;
    
    var g = obj1.foo(10);
    g(22); // => 42
    
    var obj2 = Object.create(proto);
    obj2.bar = 100;
    obj2.foo(10)(10); // => 120
    g(1); // => 21, the application using obj2 didn't affect the execution context of g
    
    var err = obj1.foo;
    err(1, 2);  // => throws
***
### objectCurryWithArity ###
**Usage:** `var result = objectCurryWithArity(n, f);`

Parameters:  
n `strictNatural`  
f `function`

Returns: `function`

Given an arity and function, returns a curried function which calls the underlying with the execution context
active when the first arguments are supplied. This means that when partially applying the function, the
resulting functions will have their execution context permanently bound. This method of binding is designed for
currying functions that exist on an object's prototype. The function will be only called when the specified number
of arguments have been supplied. Superfluous arguments are discarded. The resulting function and its partial
applications throw if they require at least one argument, but are invoked without any. `objectCurryWithArity`
throws if the arity is not a natural number or if the second parameter is not a function. The resulting function
will throw if invoked with an undefined execution context.

The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required before the
wrapped function will be invoked.

As noted above, you are permitted to curry a function to a smaller arity than its length. Whether the resulting
function behaves in a useful manner will of course depend on the function.

If one has a function that has been returned from [`objectCurry`](#objectCurry) or `objectCurryWithArity`, one can
recurry it to a different arity if required. However, one cannot recurry any partial applications derived from it,
as the execution context has now been bound. `objectCurryWithArity` also cannot curry functions returned from
[`curry`](#curry), [`curryWithArity`](#curryWithArity), [`bind`](#bind) or
[`bindWithContextAndArity`](#bindWithContextAndArity), and nor can those functions curry functions returned from
`objectCurryWithArity`, or their subsequent partial applications. `objectCurryWithArity` will throw when provided
with such a function.

Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
curry such functions won't throw, but they will not work as expected.

#### Examples ####
    var proto = {foo: function(x, y, z) { return x + y + this.bar; }};
    proto.foo = funkierJS.objectCurryWithArity(2, proto.foo);
    
    var obj1 = Object.create(proto);
    obj1.bar = 10;
    
    var g = obj1.foo(10);
    g(22); // => 42
    
    var obj2 = Object.create(proto);
    obj2.bar = 100;
    obj2.foo(10)(10); // => 120
    g(1); // => 21, the application using obj2 didn't affect the execution context of g
    
    var err = obj1.foo;
    err(1, 2);  // => throws
***
## Functions##
### compose ###
**Usage:** `var result = compose(f, g);`

Parameters:  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes one argument, which is passed to `g`. The result
of that call is then passed to `f`. That result is then returned. Throws if either parameter is not a function, or
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

#### Examples ####
    var f1 = function(a) {return a + 1;};
    var f2 = function(b) {return b * 2;};
    var f = funkierJS.compose(f1, f2); // => f(x) = 2(x + 1)',
***
## Logical##
### and ###
**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### not ###
**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### or ###
**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### xor ###
**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
## Maths##
### add ###
**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### bitwiseAnd ###
**Usage:** `var result = bitwiseAnd(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise and (&) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 21); // => 5;
***
### bitwiseNot ###
**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
**Usage:** `var result = bitwiseOr(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise or (&) operator.

#### Examples ####
    funkierJS.bitwiseOr(7, 8); // => 15;
***
### bitwiseXor ###
**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### div ###
**Usage:** `var result = div(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

Returns the quotient on dividing x by y.

#### Examples ####
    funkierJS.div(5, 2); // => 2
***
### divide ###
**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### even ###
**Usage:** `var result = even(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.even(2); // => true
    funkierJS.even(3); // => false
***
### exp ###
*Synonyms:* `pow`

**Usage:** `var result = exp(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.pow.

#### Examples ####
    funkierJS.exp(2, 3); // => 8
***
### greaterThan ###
*Synonyms:* `gt`

**Usage:** `var result = greaterThan(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `boolean`

A wrapper around the less than or equal (<=) operator.

#### Examples ####
    funkierJS.greaterThan(5, 2); // => true;
***
### greaterThanEqual ###
*Synonyms:* `gte`

**Usage:** `var result = greaterThanEqual(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `boolean`

A wrapper around the greater than or equal (=>) operator.

#### Examples ####
    funkierJS.greaterThanEqual(2, 2); // => true;
***
### gt ###
See `greaterThan`
***
### gte ###
See `greaterThanEqual`
***
### leftShift ###
**Usage:** `var result = leftShift(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (<<) operator.

#### Examples ####
    funkierJS.leftShift(1, 2); // => 4;
***
### lessThan ###
*Synonyms:* `lt`

**Usage:** `var result = lessThan(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `boolean`

A wrapper around the less than (<) operator.

#### Examples ####
    funkierJS.lessThan(5, 2); // => false;
***
### lessThanEqual ###
*Synonyms:* `lte`

**Usage:** `var result = lessThanEqual(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `boolean`

A wrapper around the less than or equal (<=) operator.

#### Examples ####
    funkierJS.lessThanEqual(2, 2); // => true;
***
### log ###
**Usage:** `var result = log(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

Returns the logarithm of y in the given base x. Note that this function uses the change of base formula, so may
be subject to rounding errors.

#### Examples ####
    funkierJS.log(2, 8); // => 3;
***
### lt ###
See `lessThan`
***
### lte ###
See `lessThanEqual`
***
### max ###
**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### min ###
**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### multiply ###
**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### odd ###
**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### pow ###
See `exp`
***
### rem ###
**Usage:** `var result = rem(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the remainder (%) operator.

#### Examples ####
    funkierJS.rem(5, 2); // => 1;
***
### rightShift ###
**Usage:** `var result = rightShift(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the right shift (>>) operator.

#### Examples ####
    funkierJS.rightShift(-4, 2); // => -1;
***
### rightShiftZero ###
**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### subtract ###
**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
## Types##
### deepEqual ###
*Synonyms:* `deepEquals`

**Usage:** `var result = deepEqual(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

Check two values for deep equality. Deep equality holds if any of the following if the two values are the same
object, if both values are objects with the same object, the same prototype, the same enumerable properties
and those properties are themselves deeply equal (non-enumerable properties are not checked), or if both values
are arrays with the same length, any additional properties installed on the arrays are deeply equal, and the items
at each index are themselves deeply equal.

#### Examples ####
    funkierJS.deepEqual({foo: 1, bar: [2, 3]}, {bar: [2, 3], foo: 1}); // => true
***
### deepEquals ###
See `deepEqual`
***
### equals ###
**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### getType ###
**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### hasType ###
See `is`
***
### id ###
**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### is ###
*Synonyms:* `hasType`

**Usage:** `var result = is(type, value);`

Parameters:  
type `string`  
value `any`

Returns: `boolean`

Given a string that could be returned by the `typeof` operator, and a value, returns true if typeof the given
object equals the given string. Throws if the first argument is not a string.

#### Examples ####
    funkierJS.is('number', 1); // => true
***
### isArray ###
**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isNull ###
**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isRealObject ###
**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isString ###
**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### notEqual ###
*Synonyms:* `notEquals`

**Usage:** `var result = notEqual(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the inequality (!=) operator.

#### Examples ####
    funkierJS.notEqual({}, {}); // => true
***
### notEquals ###
See `notEqual`
***
### strictEquals ###
**Usage:** `var result = strictEquals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the strict equality (===) operator.

#### Examples ####
    funkierJS.strictEquals(1, '1'); // => false
***
### strictInequality ###
See `strictNotEqual`
***
### strictNotEqual ###
*Synonyms:* `strictNotEquals` | `strictInequality`

**Usage:** `var result = strictNotEqual(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the strict inequality (!==) operator.

#### Examples ####
    funkierJS.strictNotEqual(1, '1'); // => true
***
### strictNotEquals ###
See `strictNotEqual`
***
