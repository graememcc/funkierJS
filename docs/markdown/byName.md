# funkierJS API #

### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
### Err ###
Category: DataTypes

**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
Category: DataTypes

**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
Category: DataTypes

**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
Category: DataTypes

A Nothing is a type of Maybe representing an unsuccessful computation.
***
### Ok ###
Category: DataTypes

**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
Category: DataTypes

**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
respectively. The constructor is new-agnostic.

The constructor is curried: when called with one argument, a function will be returned that expects a second
argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
outside of the usual mechanisms.

Throws a TypeError if called with zero arguments.

#### Examples ####
    var p1 = new funkierJS.Pair(2, 3);
    var p2 = funkierJS.Pair(2)(3);
    var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
***
### Result ###
Category: DataTypes

**Usage:** `Result();`

The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
datatype from Haskell, or the Result type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### add ###
Category: Maths

*Synonyms:* `plus`

**Usage:** `var result = add(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the addition operator.

#### Examples ####
    funkierJS.add(1, 1); // => 2
***
### and ###
Category: Logical

**Usage:** `var result = and(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments

#### Examples ####
    funkierJS.and(true, true); // => true
***
### andPred ###
Category: Logical

**Usage:** `var result = andPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically and their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => false',
***
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
    funkierJS.arityOf(function(x) {}); // => 1;
***
### asArray ###
Category: DataTypes

**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
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
Category: Function

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
### bitwiseAnd ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseNot(x);`

Parameters:  
x `number`

Returns: `number`

A wrapper around the bitwise not (~) operator.

#### Examples ####
    funkierJS.bitwiseNot(5); // => -6;
***
### bitwiseOr ###
Category: Maths

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
Category: Maths

**Usage:** `var result = bitwiseXor(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the bitwise xor (^) operator.

#### Examples ####
    funkierJS.bitwiseAnd(7, 3); // => 4;
***
### callProp ###
Category: Object

**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
Category: Object

**Usage:** `var result = callPropWithArity(prop, arity);`

Parameters:  
prop `string`  
arity `natural`

Returns: `function`

Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
requires all the original arguments in their original order, and an object as its final parameter. The returned
function will then try to call the named property on the given object,

Note that the function is curried in the standard sense. In particular the function is not object curried.

#### Examples ####
    var myMap = funkierJS.callPropWithArity('map', 1);
    myMap(f, arr); // => returns arr.map(f);
    
    var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
    myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
***
### clone ###
Category: Object

*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### compose ###
Category: Function

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
### composeMany ###
Category: Types

**Usage:** `var result = composeMany(fns);`

Parameters:  
fns `array`

Returns: `function`

Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
zero, or if the value supplied is not an array.

The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).

#### Examples ####
    var square = function(x) {return x * x;};
    var double = function(x) {return 2 * x;};
    var plusOne = funkierJS.plus(1);
    var f = funkierJS.composeMany([square, double, plusOne]);
    f(2); // => 36
***
### composeOn ###
Category: Function

**Usage:** `var result = composeOn(argCount, f, g);`

Parameters:  
argCount `positive`  
f `function`  
g `function`

Returns: `function`

Composes the two functions, returning a new function that consumes the specified number of arguments, which are
then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
has arity 0.

The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
argument: `f` will recieve a partially applied `g`, and any remaining arguments.

If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
***
### constant ###
Category: Function

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
Category: Function

**Usage:** `var result = constant0(a);`

Parameters:  
a `any`

Returns: `function`

Returns a function of arity zero that when called always returns the supplied value.

#### Examples ####
    var f = funkierJS.constant0(42);
    f(); // => 42
***
### createObject ###
Category: Object

**Usage:** `var result = createObject(protoObject);`

Parameters:  
protoObject `objectLike`

Returns: `object`

Returns a new object whose internal prototype property is the given object protoObject.

Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
to the created object, use [createObjectWithProps](#createObjectWithProps).

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObject(obj);
    funkierJS.isPrototypeOf(obj, newObj); // => true
***
### createObjectWithProps ###
Category: Object

**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by Object.create, Object.defineProperties etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
Category: Object

**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
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
### curryOwn ###
Category: Object

**Usage:** `var result = curryOwn(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
in their descriptor are ignored.

The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
the client would be left having to manually enumerate the functions to see which ones did get curried. The
avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
ambiguities.

#### Examples ####
    var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
    funkierJS.curryOwn(obj);
    obj.foo(2)(3); // => 15
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
one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).

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
### deepEqual ###
Category: Types

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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
Category: Object

**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
Category: Object

**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
Category: Object

**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
Category: Object

**Usage:** `var result = descriptors(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is its property descriptor. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
                                                             value: 1}]
***
### div ###
Category: Maths

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
Category: Maths

**Usage:** `var result = divide(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the division operator.

#### Examples ####
    funkierJS.arityOf(4, 2); // => 2;
***
### either ###
Category: DataTypes

**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
with the unwrapped value. In either case, the result of of the called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### equals ###
Category: Types

**Usage:** `var result = equals(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `boolean`

A wrapper around the non-strict equality (==) operator.

#### Examples ####
    funkierJS.equals(1, '1'); // => true
***
### even ###
Category: Maths

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
Category: Maths

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
### extend ###
Category: Object

**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
Category: Object

**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
source whose value is an object, then afterwards source.foo === dest.foo will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
Category: Object

*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating obj[prop].

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
Category: Object

*Synonyms:* `defaultTap`

**Usage:** `var result = extractOrDefault(prop, default, obj);`

Parameters:  
prop `string`  
default `any`  
obj `object`

Returns: `any`

Extracts the given property from the given object, unless the property is not found in the object or its prototype
chain, in which case the specified default value is returned.

#### Examples ####
    funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
***
### first ###
See `fst`
***
### flip ###
Category: Function

**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fst ###
Category: DataTypes

*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getCurrentTimeString ###
Category: Date

**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the 'new' operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
Category: Date

**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer representing the day of the
month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
Category: Date

**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getErrValue ###
Category: DataTypes

**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
Err.

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getFullYear ###
Category: Date

**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4-digit integer representing the
year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
Category: Date

**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getHours. Takes a date object, and returns a integer representing the hour field
(0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getJustValue ###
Category: DataTypes

**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
Just.

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getMilliseconds ###
Category: Date

**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
Category: Date

**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMinutes. Takes a date object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
Category: Date

**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getMonths. Takes a date object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getOkValue ###
Category: DataTypes

**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
Ok.

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### getOwnPropertyDescriptor ###
Category: Object

**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
Category: Object

**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### getSeconds ###
Category: Date

**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getSeconds. Takes a date object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
Category: Date

**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta in minutes between
the Javascript environment and UTC.
***
### getType ###
Category: Types

**Usage:** `var result = getType(a);`

Parameters:  
a `any`

Returns: `string`

A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

#### Examples ####
    funkierJS.getType({}); // => "object"
***
### getUTCDayOfMonth ###
Category: Date

**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
Category: Date

**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
Category: Date

**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
Category: Date

**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
Category: Date

**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an integer representing the
milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
Category: Date

**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
Category: Date

**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
Category: Date

**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### greaterThan ###
Category: Maths

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
Category: Maths

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
### hasOwnProperty ###
Category: Object

**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
Category: Object

**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### hasType ###
See `is`
***
### id ###
Category: Types

**Usage:** `var result = id(a);`

Parameters:  
a `any`

Returns: `any`

Returns the supplied value. Superfluous values are ignored.

#### Examples ####
    funkierJS.id([1, 2]); // => [1, 2]
***
### instanceOf ###
Category: Object

**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### is ###
Category: Types

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
Category: Types

**Usage:** `var result = isArray(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is an array, false otherwise

#### Examples ####
    funkierJS.isArray([]); // => true
***
### isBoolean ###
Category: Types

**Usage:** `var result = isBoolean(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "boolean", false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isErr ###
Category: DataTypes

**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Err object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
Category: DataTypes

**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Just object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
Category: DataTypes

**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Maybe object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
Category: DataTypes

**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the Nothing object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isNull ###
Category: Types

**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is null, false otherwise

#### Examples ####
    funkierJS.isNull(null); // => true
***
### isNumber ###
Category: Types

**Usage:** `var result = isNumber(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "number", false otherwise.

#### Examples ####
    funkierJS.isNumber(1); // => true
***
### isObject ###
Category: Types

**Usage:** `var result = isObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "object", false otherwise.

#### Examples ####
    funkierJS.isObject(null); // => true
***
### isOk ###
Category: DataTypes

**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Ok object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
Category: DataTypes

**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a Pair, and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isPrototypeOf ###
Category: Object

**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### isRealObject ###
Category: Types

**Usage:** `var result = isRealObject(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.

#### Examples ####
    funkierJS.isRealObject(null); // => false
***
### isResult ###
Category: DataTypes

**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a Result object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### isString ###
Category: Types

**Usage:** `var result = isString(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "string", false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
Category: Types

**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals "undefined", false otherwise.

#### Examples ####
    funkierJS.isUndefined(1); // => false
***
### keyValues ###
Category: Object

**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
                                           // native environment
***
### keys ###
Category: Object

**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### leftShift ###
Category: Maths

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
Category: Maths

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
Category: Maths

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
Category: Maths

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
### makeDateFromMilliseconds ###
Category: Date

**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new Date object whose value represents the Date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
Category: Date

**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `date`

A wrapper around calling the Date constructor with a single string argument. Throws a TypeError when called with a
non-string argument, or a string that cannot be parsed as a date. Returns a new Date object whose value represents
that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
Category: Date

**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date
are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
Category: Date

**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `date`

A curried wrapper around calling the Date constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMaybeReturner ###
Category: DataTypes

**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a Just and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeMaybeReturner(g);
    f(11); // => Just(11)
    f(5); // => Nothing
***
### makeMillisecondDate ###
Category: Date

**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `date`

A curried wrapper around calling the Date constructor with seven arguments: the year, the month, the day, the hour,
the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters. Returns
the new Date.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
Category: Date

**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `date`

A curried wrapper around calling the Date constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
Category: Date

**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `date`

A curried wrapper around calling the Date constructor with two arguments: the year and the month. No validation or
type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the Date are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeResultReturner ###
Category: DataTypes

**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an Err object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.

The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
curried.

#### Examples ####
    var g = function(x) {
      if (x < 10)
        throw new Error('Bad value');
      return x;
    };
    
    var f = funkierJS.makeResultReturner(g);
    f(11); // => Ok(11)
    f(5); // => Err(Error('Bad value');
***
### makeSecondDate ###
Category: Date

**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `date`

A curried wrapper around calling the Date constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the Date are initialized to zero. Returns the new Date.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### max ###
Category: Maths

**Usage:** `var result = max(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.max. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
Category: Object

*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
either in the object, or its prototype chain, then Nothing is returned.

#### Examples ####
    funkierJS.maybeExtract('foo', {}); // => Nothing
***
### maybeModify ###
See `safeModify`
***
### maybeModifyProp ###
See `safeModify`
***
### maybeSet ###
See `safeSet`
***
### maybeSetProp ###
See `safeSet`
***
### maybeTap ###
See `maybeExtract`
***
### min ###
Category: Maths

**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around Math.min. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 2;
***
### modify ###
Category: Object

*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### multiply ###
Category: Maths

**Usage:** `var result = multiply(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the multiplication operator.

#### Examples ####
    funkierJS.multiply(2, 2); // => 4;
***
### not ###
Category: Logical

**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notEqual ###
Category: Types

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
### notPred ###
Category: Logical

**Usage:** `var result = notPred(f);`

Parameters:  
f `function`

Returns: `function`

Takes a unary predicate function, and returns a new unary function that, when called, will call the original
function with the given argument, and return the negated result. Throws if f is not a function, or has an
arity other than 1.

If the supplied predicate has been previously curried, then the resulting function will replicate the currying
style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
then the resulting function will be too, and where necessary will supply the execution context to the wrapped
function.

#### Examples ####
    var c = funkierJS.constant(true);',
    var f = funkierJS.notPred(c);',
    f("foo"); // => false',
***
### objectCurry ###
Category: Function

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
Category: Function

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
### odd ###
Category: Maths

**Usage:** `var result = odd(x);`

Parameters:  
x `number`

Returns: `boolean`

Given a number, returns true if it is not divisible by 2, and false otherwise.

#### Examples ####
    funkierJS.odd(2); // => false
    funkierJS.odd(3); // => true
***
### or ###
Category: Logical

**Usage:** `var result = or(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical or (||) operator. Returns the logical or of the given arguments

#### Examples ####
    funkierJS.or(true, false); // => true
***
### orPred ###
Category: Logical

**Usage:** `var result = orPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically or their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(false);',
    var f = funkierJS.andPred(c, d);',
    f("foo"); // => true',
***
### parseInt ###
Category: Maths

**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.

#### Examples ####
    funkierJS.parseInt(101); // => 101
***
### parseIntInBase ###
See `stringToInt`
***
### plus ###
See `add`
***
### pow ###
See `exp`
***
### rem ###
Category: Maths

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
Category: Maths

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
Category: Maths

**Usage:** `var result = rightShiftZero(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the left shift (>>>) operator.

#### Examples ####
    funkierJS.rightShiftZero(-4, 2); // => 1073741823;
***
### safeCreateProp ###
Category: Object

*Synonyms:* `maybeCreate`

**Usage:** `var result = safeCreateProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Creates the given property to the given value on the given object, returning the object wrapped in a Just.
Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
cannot be extended. Note that the property will be successfully created when it already exists, but only in the
prototype chain.

Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
[`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
required.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
    a.foo // => undefined
***
### safeDeleteProp ###
Category: Object

*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a Just value.
Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
descriptor or the object being frozen or sealed) then Nothing will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
Category: Object

*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
has no setter function, or when the object is frozen. In such cases, Nothing will be returned.

Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeModify('foo', 42, a); // => Nothing
    a.foo // => 1
***
### safeModifyProp ###
See `safeModify`
***
### safeSet ###
Category: Object

*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
object. If unable to modify or create the property, then Nothing will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    Object.freeze(a);
    funkierJS.safeSet('foo', 42, a); // => returns Nothing
    a.foo // => 1
***
### safeSetProp ###
See `safeSet`
***
### safeTap ###
See `maybeExtract`
***
### second ###
See `snd`
***
### sectionLeft ###
Category: Function

**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
Category: Function

**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### set ###
Category: Object

*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setDayOfMonth ###
Category: Date

**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the given value. Invalid values will cause a change in other fields: for example, changing the day to 31
in a month with 30 days will increment the month, which may in turn increment the year. Returns the given date
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
Category: Date

**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setFullYear. Takes a value and a Date object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
Category: Date

**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
Category: Date

**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
Category: Date

**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
Category: Date

**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setProp ###
See `set`
***
### setSeconds ###
Category: Date

**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given date object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
Category: Date

**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setTime. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
Category: Date

**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and sets the day of the
month to the local equivalent of the given value. Invalid values will cause a change in other fields: for example,
changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the year.
Returns the given date object.
***
### setUTCFullYear ###
Category: Date

**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCFullYear. Takes a value and a Date object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given date object.
***
### setUTCHours ###
Category: Date

**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCHours. Takes a value between 0 and 23 representing the hour of the day, and
a Date object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade
of increments to other fields. Returns the given date object.
***
### setUTCMilliseconds ###
Category: Date

**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0 and 999 representing the milliseconds,
and a Date object, and sets the milliseconds to the local equivalent of the given value. Invalid values will cause
a change in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This
may in turn cause a cascade of increments to other fields. Returns the given date object.
***
### setUTCMinutes ###
Category: Date

**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0 and 59 representing the minutes, and a Date
object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given date object.
***
### setUTCMonth ###
Category: Date

**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCMonth. Takes a value between 0 and 11 representing the month, and a Date
object, and sets the month to the local equivalent of the given value. Invalid values will cause a change in other
fields: if the value > 11, then the year will be incremented by month div 12. Returns the given date object.
***
### setUTCSeconds ###
Category: Date

**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0 and 59 representing the seconds, and a Date
object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change in
other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a
cascade of increments to other fields. Returns the local equivalent of the given date object.
***
### shallowClone ###
See `clone`
***
### snd ###
Category: DataTypes

*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
### strictEquals ###
Category: Types

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
Category: Types

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
### stringToInt ###
Category: Maths

*Synonyms:* `parseIntInBase`

**Usage:** `var result = stringToInt(base, s);`

Parameters:  
base `number`  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
not represent a valid number in the given base.

#### Examples ####
    funkierJS.stringToInt(16, "80"); // => 128
***
### subtract ###
Category: Maths

**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### tap ###
See `extract`
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
Category: Maths

*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.
of significant digits.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toDateString ###
Category: Date

**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toDateString. Takes a date object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
Category: Date

**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of milliseconds elapsed since
midnight, January 1 1970.
***
### toExponential ###
Category: Maths

**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
Category: Maths

**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toISOString ###
Category: Date

**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toISOString. Takes a date object, and returns a string representation of the date
in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
Category: Date

**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toPrecision ###
Category: Maths

**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
### toTimeString ###
Category: Date

**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
Category: Date

**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a string representation of the
equivalent date in UTC.
***
### xor ###
Category: Logical

**Usage:** `var result = xor(x, y);`

Parameters:  
x `boolean`  
y `boolean`

Returns: `boolean`

A wrapper around the logical xor operator. Returns the logical xor of the given arguments

#### Examples ####
    funkierJS.xor(true, true); // => false
***
### xorPred ###
Category: Logical

**Usage:** `var result = xorPred(f1, f2);`

Parameters:  
f1 `function`  
f2 `function`

Returns: `function`

Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
functions with the given argument, and logically xor their results, returning that value. Throws if either
argument is not a function of arity 1.

Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
curried, and supply the correct execution context to the supplied functions. If neither was curried in that
manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
in case you need to give the resulting function to one of the `withArity` functions to change the arity).

#### Examples ####
    var c = funkierJS.constant(true);',
    var d = funkierJS.constant(true);',
    var f = funkierJS.xorPred(c, d);',
    f("foo"); // false',
***
