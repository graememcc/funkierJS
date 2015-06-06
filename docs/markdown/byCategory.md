# funkierJS API: By Category #

## Array##
### all ###
See `every`
***
### any ###
See `some`
***
### append ###
**Usage:** `var result = append(value, arr);`

Parameters:  
value `any`  
arr `arrayLike`

Returns: `arrayLike`

Takes a value, and an array, string or arrayLike, and returns a new array or string with the given value appended.

Throws a TypeError if the second argument is not an arrayLike.

Note: if the second argument is a string and the first is not, the value will be coerced to a string; you may not
get the result you expect.

#### Examples ####
    var a = [1, 2, 3];
    funkierJS.append(4, a); // => [1, 2, 3, 4]
    a; // => [1, 2, 3] (a is not changed)
***
### concat ###
**Usage:** `var result = concat(arr1, arr2);`

Parameters:  
arr1 `arrayLike`  
arr2 `arrayLike`

Returns: `arrayLike`

Takes two arrays, arrayLikes or strings, and returns their concatenation.

Throws a TypeError if either argument is not an arrayLike.

If both arguments are the same type and are either arrays or strings, then the result will be the same type,
otherwise it will be an array.

#### Examples ####
    funkierJS.concat([1, 2], [3, 4, 5]); // => [1, 2, 3, 4, 5]
    funkierJS.concat('abc', 'def'); // => 'abcdef'
    funkierJS.concat('abc', [1, 2, 3]); // => ['a', 'b', 'c', 1, 2, 3]
***
### copy ###
**Usage:** `var result = copy(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an arrayLike, and returns a new array which is a shallow copy.

Throws a TypeError if the given value is not an arrayLike.

#### Examples ####
    var a = [1, 2, 3];]
    var b = funkierJS.copy(a); // => [1, 2, 3]
    b === a; // => false
***
### drop ###
**Usage:** `var result = drop(count, arr);`

Parameters:  
count `number`  
arr `arrayLike`

Returns: `arrayLike`

Takes a count, and an array, string or arrayLike. Returns an array or string containing the first count elements
removed from the given arrayLike.

Throws a TypeError if the count is not integral, or if the last argument is not an array or string.

#### Examples ####
    funkierJS.drop(3, 'banana'); // => 'anana'
***
### dropWhile ###
**Usage:** `var result = dropWhile(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `arrayLike`

Takes a predicate function p, and source, an array, string or arrayLike. Returns a new array or string containing
the remaining members our source upon removing the initial elements for which the predicate function returned true.

Throws a TypeError if p is not a function of arity 1, or if the given value is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `dropWhile` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    funkierJS.dropWhile(even, [2, 4, 3, 5, 7]; // => [3, 5, 7
***
### each ###
**Usage:** `each(f, arr);`

Parameters:  
f `function`  
arr `arrayLike`

Takes a function f, and an array, string or arrayLike arr. Calls f with each member of the array in sequence, and
returns undefined.

Throws a TypeError if the first argument is not a function, or if the second is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `each` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.each(function(e) {console.log(e);}, [1, 2]); // => Logs 1 then 2 to the console
***
### element ###
**Usage:** `var result = element(val, arr);`

Parameters:  
val `any`  
arr `arrayLike`

Returns: `boolean`

Takes a value and an array, string or arrayLike. Returns true if the value is in the arrayLike (checked for strict
identity) and false otherwise.

Throws a TypeError if the second argument is not an arrayLike.

#### Examples ####
    funkierJS.element('a', 'cable'); // => true
***
### elementWith ###
**Usage:** `var result = elementWith(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `boolean`

A generalised version of element. Takes a predicate function p of one argument, and an array, string or arrayLike.
Returns true if there is an element in the arrayLike for which p returns true, and returns false otherwise.

Throws a TypeError if the first argument is not a function of arity 1, or the second argument is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `element` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    var p = function(e) {return e.foo = 42;};
    funkierJS.elementWith(p, [{foo: 1}, {foo: 42}]); // => true
***
### every ###
*Synonyms:* `all`

**Usage:** `var result = every(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `boolean`

Takes two parameters: a predicate function p that takes one argument, and an array, string or arrayLike. Calls the
predicate with every element of the array or string, until either the predicate function returns false, or the end
of the array or string is reached.

Returns the last value returned by the predicate function.

Throws a TypeError if p is not a function of arity 1, or if the second argument is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `every` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.every(even, [2, 4, 6]); // => true
***
### filter ###
**Usage:** `var result = filter(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `arrayLike`

Takes a predicate function pred, and an array, string or arrayLike arr. Returns an array or string containing
those members of arr—in the same order as the original array—for which the predicate function returned true.

Throws a TypeError if pred does not have arity 1, or if arr is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `filter` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.filter(even, [2, 3, 4, 5, 6]); // => [2, 4, 6]
***
### flatten ###
**Usage:** `var result = flatten(arr);`

Parameters:  
arr `array`

Returns: `array`

Takes an array containing arrays or strings. Returns an array containing the concatenation of those arrays/strings.
Note that flatten only strips off one layer.

Throws a TypeError if the supplied value is not arrayLike, or if any of the values within it are not arrayLike.

#### Examples ####
    funkierJS.flatten([[1, 2], [3, 4]]); // => [1, 2, 3, 4]
***
### flattenMap ###
**Usage:** `var result = flattenMap(f, arr);`

Parameters:  
f `function`  
arr `arrayLike`

Returns: `array`

Takes a function of arity 1, and an array, string or arrayLike. Maps the function over the array/string and
flattens the result. The supplied function must be of arity 1, as it is expected to return an array or string; a
TypeError is thrown if this is not the case.

A TypeError will also be thrown if the last argument is not arrayLike, or if the first argument is not a function.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `flattenWith` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    var fn = function(n) {return [n, n * n];};
    funkierJS.flattenMap(fn, [1, 2, 3]); // => Returns [1, 1, 2, 4, 3, 9]
***
### foldl ###
*Synonyms:* `reduce`

**Usage:** `var result = foldl(f, initial, arr);`

Parameters:  
f `function`  
initial `any`  
arr `arrayLike`

Returns: `any`

Takes three parameters: a function f of two arguments, an initial value, and an array, string or arrayLike.
Traverses the array or string from left to right, calling the function with two arguments: the current accumulation
value, and the current element. The value returned will form the next accumulation value, and `foldl` returns the
value returned by the final call. The first call's accumulation parameter will be the given initial value.

Throws a TypeError if the first parameter is not a function of arity 2, or if the last parameter is not an array or
string.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `foldl` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.foldl(function(soFar, current) {return soFar*10 + (current - 0);}, 0, '123'); // 123
***
### foldl1 ###
*Synonyms:* `reduce1`

**Usage:** `var result = foldl1(f, arr);`

Parameters:  
f `function`  
arr `arrayLike`

Returns: `any`

Takes two parameters: a function f of two arguments, and an array, string or arrayLike value. Traverses the array
from left to right from the second element, calling the function with two arguments: the current accumulation
value, and the current element. The value returned will form the next accumulation value, and foldl1 returns
returns the value returned by the final call. The first call's accumulation parameter will be the first element of
the array or string.

Throws a TypeError if the first parameter is not a function of arity 2, if the last parameter is not an arrayLike,
or if the arrayLike is empty.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `foldl1` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.foldl1(multiply, [2, 3, 4]); // => 24
***
### foldr ###
*Synonyms:* `reduceRight`

**Usage:** `var result = foldr(f, initial, arr);`

Parameters:  
f `function`  
initial `any`  
arr `arrayLike`

Returns: `any`

Takes three parameters: a function f of two arguments, an initial value, and an array, string or arrayLike value.
Traverses the array or string from right to left, calling the function with two arguments: the current accumulation
value, and the current element. The value returned will form the next accumulation value, and foldr returns the
value returned by the final call. The first call's accumulation parameter willbe the given initial value.

Throws a TypeError if the first parameter is not a function of arity 2, or if the last parameter is not an
arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `foldr` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.foldr(subtract, 0, [2, 3, 4]); // => -9
***
### foldr1 ###
*Synonyms:* `reduceRight1`

**Usage:** `var result = foldr1(f, arr);`

Parameters:  
f `function`  
arr `arrayLike`

Returns: `any`

Takes two parameters: a function f of two arguments, and an array, string or arrayLike. Traverses the array from
right to left from the penultimate element, calling the function with two arguments: the current accumulation
value, and the current element. The value returned will form the next accumulation value, and foldr1 returns
returns the value returned by the final call. The first call's accumulation parameter will be the last element of
the array or string.

Throws a TypeError if the first parameter is not a function of arity 2, if the last parameter is not an array or
string, or if the array or string is empty.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `foldr1` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.foldr1(function(soFar, current) {return current + soFar;}, "banana"); // => ananab
***
### getIndex ###
**Usage:** `var result = getIndex(index, arr);`

Parameters:  
index `number`  
arr `arrayLike`

Returns: `any`

Takes an index and an array, string or other arrayLike value and returns the element at the given index. Throws a
TypeError if the index is outside the range for the given object.

#### Examples ####
    funkierJS.getIndex(1, "abcd"); 1
***
### head ###
**Usage:** `var result = head(arr);`

Parameters:  
arr `arrayLike`

Returns: `any`

Takes an array, string or other arrayLike value and returns the first element. Throws a TypeError when given an
empty arrayLike.

#### Examples ####
    funkierJS.head([1, 2, 3]); // => 1
***
### init ###
**Usage:** `var result = init(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike. Returns an array or string containing every element except the last.

Throws a TypeError if the arrayLike is empty, or if the given value is not an arrayLike.

#### Examples ####
    funkierJS.init([2, 3, 4, 5]); // => [2, 3, 4]
***
### inits ###
*Synonyms:* `prefixes`

**Usage:** `var result = inits(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike. Returns all the prefixes of the given arrayLike.

Throws a TypeError if the given value is not an arrayLike.

#### Examples ####
    funkierJS.inits([2, 3]); // => [[], [2], [2, 3]]
***
### intersperse ###
**Usage:** `var result = intersperse(val, arr);`

Parameters:  
val `any`  
arr `arrayLike`

Returns: `arrayLike`

Takes a value, and an array, string or arrayLike, and returns a new array or string with the value in between each
pair of elements of the original.

Note: if the second parameter is a string, the first parameter will be coerced to a string.

Throws a TypeError if the second argument is not arrayLike.

#### Examples ####
    funkierJS.intersperse(1, [2, 3, 4]); // => [2, 1, 3, 1, 4]
***
### isEmpty ###
**Usage:** `var result = isEmpty(arr);`

Parameters:  
arr `arraLike`

Returns: `boolean`

Returns true if the given array, arrayLike or string is empty, and false if not.

Throws a TypeError if the argument is not arrayLike.

#### Examples ####
    funkierJS.isEmpty([]); // => true
***
### join ###
**Usage:** `var result = join(separator, arr);`

Parameters:  
separator `any`  
arr `array`

Returns: `string`

Takes a separator value that can be coerced to a string, and an array. Returns a string, containing the toString
of each element in the array, separated by the toString of the given separator.

Throws a TypeError if the last element is not an array.

#### Examples ####
    funkierJS.join('-', [1, 2, 3]); // => '1-2-3'
***
### last ###
**Usage:** `var result = last(arr);`

Parameters:  
arr `arrayLike`

Returns: `any`

Takes an array, string or other arrayLike value, and returns the last element. Throws a TypeError when given an
empty arrayLike.

#### Examples ####
    funkierJS.last([1, 2, 3]); // => 3
***
### length ###
**Usage:** `var result = length(arr);`

Parameters:  
arr `arrayLike`

Returns: `number`

Takes an array, string or other arrayLike value, and returns its length. Throws a TypeError if the given value is not an arrayLike.

#### Examples ####
    funkierJS.length([1, 2, 3]); // => 3
***
### map ###
**Usage:** `var result = map(f, arr);`

Parameters:  
f `function`  
arr `arrayLike`

Returns: `array`

Takes a function f, and an array,string or other arrayLike. Returns an array arr2 where, for each element arr2[i],
we have arr2[i] === f(arr[i]). Throws a TypeError if the first argument is not a function, if the function does not
have an arity of at least 1, or if the last argument is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `map` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied to
this function.

#### Examples ####
    funkierJS.map(plus(1), [2, 3, 4]); // => [3, 4, 5]
***
### maximum ###
**Usage:** `var result = maximum(arr);`

Parameters:  
arr `arrayLike`

Returns: `any`

Returns the largest element of the given array, string or arrayLike.

Throws a TypeError if the value is not an arrayLike, or it is empty.

Note: this function is intended to be used with arrays containing numeric or character data. You are of course free
to abuse it, but it will likely not do what you expect.

#### Examples ####
    funkierJS.maximum([20, 10]); // => 20
***
### minimum ###
**Usage:** `var result = minimum(arr);`

Parameters:  
arr `arrayLike`

Returns: `any`

Returns the smallest element of the given array, string or arrayLike. Throws a TypeError if the value is not an
arrayLike, or it is empty.

Note: this function is intended to be used with arrays containing numeric or character data. You are of course
free to abuse it, but it will likely not do what you expect.

#### Examples ####
    funkierJS.minimum([20, 10]); // => 10
***
### nub ###
*Synonyms:* `uniq`

**Usage:** `var result = nub(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike. Returns a new array/string, with all duplicate elements—tested for strict
equality—removed. The order of elements is preserved.

Throws a TypeError if the given argument is not arrayLike.

#### Examples ####
    funkierJS.nub('banana'); // 'ban'
***
### nubWith ###
*Synonyms:* `uniqWith`

**Usage:** `var result = nubWith(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `arrayLike`

Takes a predicate function of arity 2, and an array, string or arrayLike. Returns a new array/string, with all
duplicate elements removed. A duplicate is defined as a value for which the predicate function returned true when
called with a previously encountered element and the element under consideration. The order of elements is
preserved.

Throws a TypeError if the first argument is not a function, or has an arity other than 2, or if the last argument
is not arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `nubWith` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    var pred = function(x, y) { return x.foo === y.foo; };
    funkierJS.nubWith(pred, [{foo: 12}, {foo: 42}, {foo: 42}, {foo: 12}]);
    // => [{foo: 12}, {foo: 42}]
***
### occurrences ###
**Usage:** `var result = occurrences(needle, haystack);`

Parameters:  
needle `any` | ``  
haystack `arrayLike`

Returns: `array`

Takes a value—needle—and haystack, an array, arrayLike or string. Searches for all occurrences of the value—tested
for strict equality—and returns an array containing all the indices into haystack where the values may be found.

Throws a TypeError if the haystack parameter is not arrayLike.

#### Examples ####
    funkierJS.occurrences(2, [1, 2, 2, 3, 2, 4]; // => [1, 2, 4]
***
### occurrencesWith ###
**Usage:** `var result = occurrencesWith(needle, haystack);`

Parameters:  
needle `any` | ``  
haystack `arrayLike`

Returns: `array`

Takes a predicate function pred, and haystack, an array, arrayLike or string. Searches for all occurrences of the
value—tested by the given predicate—and returns an array containing all the indices into haystack where the
predicate holds.

Throws a TypeError if pred is not a predicate function of arity 1, or if the haystack parameter is not arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `occurrences` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    var pred = function(e) {return e.foo === 42;};
    var arr = [{foo: 1}, {foo: 42}, {foo: 42}, {foo: 3}];
    funkierJS.occurrencesWith(pred, arr); // => [1, 2]
***
### prefixes ###
See `inits`
***
### prepend ###
**Usage:** `var result = prepend(value, arr);`

Parameters:  
value `any`  
arr `arrayLike`

Returns: `arrayLike`

Takes a value, and an array, string or arrayLike, and returns a new array or string with the given value prepended.

Throws a TypeError if the second argument is not an arrayLike.

Note: if the second argument is a string and the first is not, the value will be coerced to a string; you may not
get the result you expect.

#### Examples ####
    var a = [1, 2, 3];
    funkierJS.prepend(4, a); // => [4, 1, 2, 3]
    a; // => [1, 2, 3] (a is not changed)
***
### product ###
**Usage:** `var result = product(arr);`

Parameters:  
arr `arrayLike`

Returns: `number`

Returns the product of the elements of the given array, or arrayLike. Throws a TypeError if the value is not an
arrayLike, or it is empty.

Note: this function is intended to be used with arrays containing numeric data. You are of course free to abuse it,
but it will likely not do what you expect.

#### Examples ####
    funkierJS.product([20, 10]); // => 200
***
### range ###
**Usage:** `var result = range(a, b);`

Parameters:  
a `number`  
b `number`

Returns: `array`

Takes two numbers, a and b. Returns an array containing the arithmetic sequence of elements from a up to but not
including b, each element increasing by 1.

Throws a TypeError if b < a.

#### Examples ####
    funkierJS.range(2, 7); // => [2, 3, 4, 5, 6]
***
### rangeStep ###
See `rangeStride`
***
### rangeStride ###
*Synonyms:* `rangeStep`

**Usage:** `var result = rangeStride(a, stride, b);`

Parameters:  
a `number`  
stride `number`  
b `number`

Returns: `array`

Takes three numbers, a stride and b. Returns an array containing the arithmetic sequence of elements from a up to
but not including b, each element increasing by stride.

Throws a TypeError if the sequence will not terminate.

#### Examples ####
    funkierJS.rangeStep(2, 2, 7); // => [2, 4, 6]
***
### reduce ###
See `foldl`
***
### reduce1 ###
See `foldl1`
***
### reduceRight ###
See `foldr`
***
### reduceRight1 ###
See `foldr1`
***
### replicate ###
**Usage:** `var result = replicate(length, arr);`

Parameters:  
length `natural`  
arr `arrayLike`

Returns: `array`

Takes a length and a value, and returns an array of the given length, where each element is the given value. Throws
a TypeError if the given length is negative.

#### Examples ####
    funkierJS.replicate(5, 42); // => [42, 42, 42, 42, 42]
***
### reverse ###
**Usage:** `var result = reverse(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike, and returns a new array or string that is the reverse of the original.

Throws a TypeError if the argument is not arrayLike.

#### Examples ####
    funkierJS.reverse('banana'); 'ananab'
***
### slice ###
**Usage:** `var result = slice(from, to, arr);`

Parameters:  
from `number`  
to `number`  
arr `arrayLike`

Returns: `arrayLike`

Takes two numbers, from and to, and an array, string or arrayLike. Returns the subarray or string containing the
elements between these two points (inclusive at from, exclusive at to). If to is greater than the length of the
object, then all values from 'from' will be returned.

Throws a TypeError if from or to are not positive integers, or if the last argument is not an arrayLike.

#### Examples ####
    funkierJS.slice(1, 3, [1, 2, 3, 4, 5]; // => [2, 3]
***
### some ###
*Synonyms:* `any`

**Usage:** `var result = some(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `boolean`

Takes two parameters: a predicate function p that takes one argument, and an array, string or arrayLike. Calls the
predicate with every element of the array or string, until either the predicate function returns true, or the end
of the array or string is reached.

Returns the last value returned by the predicate function.

Throws a TypeError if p is not a function of arity 1, or if the second argument is not an array or string.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `some` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
to this function.

#### Examples ####
    funkierJS.some(odd, [2, 4, 5, 6]; // => true
***
### sort ###
**Usage:** `var result = sort(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike, and returns a new array, sorted in lexicographical order.

Throws a TypeError if the given argument is not arrayLike.

#### Examples ####
    funkierJS.sort([10, 1, 21, 2]); // => [1, 10, 2, 21]
***
### sortWith ###
**Usage:** `var result = sortWith(f, arr);`

Parameters:  
f `function`  
arr `arrayLike`

Returns: `arrayLike`

Takes a function of two arguments, and an array, string or arrayLike. Returns a new array/string, sorted per the
given function. The function should return a negative number if the first argument is "less than" the second, 0 if
the two arguments are "equal", and a positive number if the first argument is greater than the second.

Throws a TypeError if the first argument is not a function of arity 2, or if the second is not arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `sortWith` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    var sortFn = function(x, y) {return x - y;};
    funkierJS.sortWith(sortFn, [10, 1, 21, 2]); // => [1, 2, 10, 21]
***
### suffixes ###
See `tails`
***
### sum ###
**Usage:** `var result = sum(arr);`

Parameters:  
arr `arrayLike`

Returns: `number`

Returns the sum of the elements of the given array, or arrayLike. Throws a TypeError if the value is not an
arrayLike, or it is empty.

Note: this function is intended to be used with arrays containing numeric data. You are of course free to abuse it,
but it will likely not do what you expect.

#### Examples ####
    funkierJS.sum([20, 10]); // => 30
***
### tail ###
**Usage:** `var result = tail(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike. Returns an array or string containing every element except the first.

Throws a TypeError if the arrayLike is empty, or if the given value is not an arrayLike.

#### Examples ####
    funkierJS.tail('banana'); // => 'anana'
***
### tails ###
*Synonyms:* `suffixes`

**Usage:** `var result = tails(arr);`

Parameters:  
arr `arrayLike`

Returns: `arrayLike`

Takes an array, string or arrayLike. Returns all the suffixes of the given arrayLike.

Throws a TypeError if the given value is not an arrayLike.

#### Examples ####
    funkierJS.tails([2, 3]); // => [[2, 3], [3], []]
***
### take ###
**Usage:** `var result = take(count, arr);`

Parameters:  
count `number`  
arr `arrayLike`

Returns: `arrayLike`

Takes a count, and an array, string or arrayLike. Returns an array or string containing the first count elements
of the given arrayLike.

Throws a TypeError if the count is not integral, or if the last argument is not an arrayLike.

#### Examples ####
    funkierJS.take(3, 'banana'); // => 'ban'
***
### takeWhile ###
**Usage:** `var result = takeWhile(pred, arr);`

Parameters:  
pred `function`  
arr `arrayLike`

Returns: `arrayLike`

Takes a predicate function pred, and source, which should be an array, string or arrayLike. Returns a new array or
string containing the initial members of the given arrayLike for which the predicate returned true.

Throws a TypeError if pred is not a function of arity 1, or if the source value is not an arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `takeWhile` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    funkierJS.takeWhile(even, [2, 4, 3, 5, 7]; // => [2, 4]
***
### uniq ###
See `nub`
***
### uniqWith ###
See `nubWith`
***
### unzip ###
**Usage:** `var result = unzip(source);`

Parameters:  
source `array`

Returns: `Pair`

Takes an array of Pairs, and returns a [`Pair`](#Pair). The first element is an array containing the first element from each
pair, and likewise the second element is an array containing the second elements.

Throws a TypeError if the given argument is not an array, or if any element is not a Pair.

#### Examples ####
    funkierJS.unzip([Pair(1, 2), Pair(3, 4)]); // =>  Pair([1, 3], [2, 4])
***
### zip ###
**Usage:** `var result = zip(a, b);`

Parameters:  
a `arrayLike`  
b `arrayLike`

Returns: `array`

Takes two arrayLikes, a and b, and returns a new array. The new array has the same length as the smaller of the two
arguments. Each element is a [`Pair`](#Pair) p, such that `fst(p) === a[i]` and `snd(p) === b[i]` for each position
i in the result.

Throws a TypeError if neither argument is arrayLike.

#### Examples ####
    funkierJS.zip([1, 2], [3, 4]); // => [Pair(1, 3), Pair(2, 4)]
***
### zipWith ###
**Usage:** `zipWith(f, a, b);`

Parameters:  
f `function`  
a `arrayLike`  
b `arrayLike`

Returns array

Takes a function of arity 2, and a two arrays/arrayLikes/strings, a and b, and returns a new array. The new array
has the same length as the smaller of the two arguments. Each element is the result of calling the supplied
function with the elements at the corresponding position in the original arrayLikes.

Throws a TypeError if the first argument is not an argument of arity at least 2, or if neither of the last two
arguments is arrayLike.

Note that, if required, the function must already have its execution context set. Internally, the execution context
within `zipWith` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    var f = function(a, b) {return a + b;};
    funkierJS.zipWith(f, 'apple', 'banana'); // => ['ab', 'pa', 'pn', 'la', 'en']
***
## DataTypes##
### Err ###
**Usage:** `var result = Err(a);`

Parameters:  
a `any`

Returns: `Just`

An Err is a type of [`Result`](#Result) representing a unsuccessful computation. The constructor is new-agnostic.
Throws if called without any arguments

#### Examples ####
    var result = funkierJS.Err(new TypeError('boom');
***
### Just ###
**Usage:** `var result = Just(a);`

Parameters:  
a `any`

Returns: `Just`

A Just is a type of [`Maybe`](#Maybe) representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Just(42);
***
### Maybe ###
**Usage:** `Maybe();`

The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
Nothing object when an error occurs, or the computation is otherwise unsuccessful.

Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
operator.

It is an error to call Maybe.
***
### Nothing ###
A Nothing is a type of [`Maybe`](#Maybe) representing an unsuccessful computation.
***
### Ok ###
**Usage:** `var result = Ok(a);`

Parameters:  
a `any`

Returns: `Ok`

An Ok is a type of [`Result`](#Result) representing a successful computation. The constructor is new-agnostic.
Throws when called with no arguments.

#### Examples ####
    var result = funkierJS.Ok(42);
***
### Pair ###
**Usage:** `var result = Pair(a, b);`

Parameters:  
a `any`  
b `any`

Returns: `Pair`

A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
new immutable tuple. The contents of the tuple can be accessed with the accessor functions [`fst`](#fst) and
[`snd`](#snd) respectively. The constructor is new-agnostic.

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
**Usage:** `Result();`

The `Result` type encapsulates the idea of functions throwing errors. It can be considered equivalent to the
`Either` datatype from Haskell, or the `Result` type from Rust.

Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.

It is an error to call Result.
***
### asArray ###
**Usage:** `var result = asArray(p);`

Parameters:  
p `Pair`

Returns: `array`

Takes a pair, and returns a 2-element array containing the values contained in the given [`Pair`](#Pair) p.
Specifically, if the resulting array is named arr, then we have `arr[0] === fst(p)` and `arr[1] === snd(p)`.
Throws a TypeError if p is not a pair.

#### Examples ####
    funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
***
### either ###
**Usage:** `var result = either(f1, f2, r);`

Parameters:  
f1 `function`  
f2 `function`  
r `Result`

Returns: `function`

Takes two functions of arity 1 or greater, and a [`Result`](#Result). If the [`Result`](#Result) is an [`Ok`](#Ok)
value, the first function f1 will be called with the unwrapped value.  Otherwise, if the [`Result`](#Result) is an
[`Err`](#Err) value, the second function is called with the unwrapped value. In either case, the result of of the
called function is returned.

Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
is not a Result.

Note that, if required, the functions must already have their execution context set. Internally, the execution
context within `either` is `null`, so it cannot supply a useful execution context to any object-curried functions
supplied to this function.

#### Examples ####
    var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
    f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
    f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
***
### first ###
See `fst`
***
### fst ###
*Synonyms:* `first`

**Usage:** `var result = fst(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for [`Pair`](#Pair) tuples. Returns the first value that was supplied to the [`Pair`](#Pair)
constructor. Throws if called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.fst(p); // => 2',
***
### getErrValue ###
**Usage:** `var result = getErrValue(e);`

Parameters:  
e `Err`

Returns: `any`

Returns the value wrapped by the given [`Err`](#Err) instance e. Throws a TypeError if called with anything other
than an [`Err`](#Err).

#### Examples ####
    funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
***
### getJustValue ###
**Usage:** `var result = getJustValue(j);`

Parameters:  
j `Just`

Returns: `any`

Returns the value wrapped by the given [`Just`](#Just) instance j. Throws a TypeError if called with anything other
than a [`Just`](#Just).

#### Examples ####
    funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
***
### getOkValue ###
**Usage:** `var result = getOkValue(o);`

Parameters:  
o `Ok`

Returns: `any`

Returns the value wrapped by the given [`Ok`](#Ok) instance o. Throws a TypeError if called with anything other
than an [`Ok`](#Ok).

#### Examples ####
    funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
***
### isErr ###
**Usage:** `var result = isErr(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a [`Err`](#Err) object, and false otherwise.

#### Examples ####
    funkierJS.isErr(funkierJS.Err(4)); // => true
***
### isJust ###
**Usage:** `var result = isJust(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a [`Just`](#Just) object, and false otherwise.

#### Examples ####
    funkierJS.isJust(funkierJS.Just(42)); // => true
***
### isMaybe ###
**Usage:** `var result = isMaybe(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a [`Maybe`](#Maybe) object, and false otherwise.

#### Examples ####
    funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
***
### isNothing ###
**Usage:** `var result = isNothing(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is the [`Nothing`](#Nothing) object, and false otherwise.

#### Examples ####
    funkierJS.isNothing(funkierJS.Nothing); // => true
***
### isOk ###
**Usage:** `var result = isOk(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a [`Ok`](#Ok) object, and false otherwise.

#### Examples ####
    funkierJS.isOk(funkierJS.Ok('foo)); // => true
***
### isPair ###
**Usage:** `var result = isPair(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given value is a [`Pair`](#Pair), and false otherwise.

#### Examples ####
    funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
***
### isResult ###
**Usage:** `var result = isResult(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true when the given value is a [`Result`](#Result) object, and false otherwise.

#### Examples ####
    funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
***
### makeMaybeReturner ###
**Usage:** `var result = makeMaybeReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
the function is wrapped in a [`Just`](#Just) and returned.

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
### makeResultReturner ###
**Usage:** `var result = makeResultReturner(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
original. If the function f throws during execution, then the exception will be caught, and an [`Err`](#Err) object
wrapping the exception is returned. Otherwise the result of the function is wrapped in an [`Ok`](#Ok) and returned.

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
### second ###
See `snd`
***
### snd ###
*Synonyms:* `second`

**Usage:** `var result = snd(p);`

Parameters:  
p `Pair`

Returns: `any`

Accessor function for [`Pair`](#Pair) tuples. Returns the second value that was supplied to the [`Pair`](#Pair)
constructor. Throws if called with a non-pair value.

#### Examples ####
    var p = new funkierJS.Pair(2, 3);
    funkierJS.cnd(p); // => 3',
***
## Date##
### getCurrentTimeString ###
**Usage:** `var result = getCurrentTimeString();`

Returns: `string`

A wrapper around calling the Date constructor without the `new` operator. Returns a string representing the
current date and time.
***
### getDayOfMonth ###
**Usage:** `var result = getDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getDate`. Takes a `Date` object, and returns an integer representing the day of
the month (1-31) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfMonth(a); // => 15
***
### getDayOfWeek ###
**Usage:** `var result = getDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getDay`. Takes a `Date` object, and returns an integer representing the day of the
month (0-6) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getDayOfWeek(a); // => 2
***
### getFullYear ###
**Usage:** `var result = getFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getFullYear`. Takes a `Date` object, and returns a 4-digit integer representing
the year of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getFullYear(a); // => 2000
***
### getHours ###
**Usage:** `var result = getHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getHours`. Takes a `Date` object, and returns a integer representing the hour
field (0-23) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getHours(a); // => 10
***
### getMilliseconds ###
**Usage:** `var result = getMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getMilliseconds`. Takes a `Date` object, and returns a integer representing the
milliseconds field (0-999) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMilliseconds(a); // => 13
***
### getMinutes ###
**Usage:** `var result = getMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getMinutes`. Takes a `Date` object, and returns a integer representing the minutes
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMinutes(a); // => 11
***
### getMonth ###
**Usage:** `var result = getMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getMonths`. Takes a `Date` object, and returns a integer representing the month
field (0-11) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getMonth(a); // => 1
***
### getSeconds ###
**Usage:** `var result = getSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getSeconds`. Takes a `Date` object, and returns a integer representing the seconds
field (0-59) of the given date.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.getSeconds(a); // => 12
***
### getTimezoneOffset ###
**Usage:** `var result = getTimezoneOffset(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getTimezoneOffset`. Takes a `Date` object, and returns the delta in minutes
between the Javascript environment and UTC.
***
### getUTCDayOfMonth ###
**Usage:** `var result = getUTCDayOfMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCDate`. Takes a `Date` object, and returns an integer representing the day of
the month (1-31) of the given date, adjusted for UTC.
***
### getUTCDayOfWeek ###
**Usage:** `var result = getUTCDayOfWeek(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCDay`. Takes a `Date` object, and returns an integer representing the day of
the week (0-6) of the given date, adjusted for UTC.
***
### getUTCFullYear ###
**Usage:** `var result = getUTCFullYear(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCFullYear`. Takes a `Date` object, and returns a 4-digit integer representing
the year of the given date, adjusted for UTC.
***
### getUTCHours ###
**Usage:** `var result = getUTCHours(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCHours`. Takes a `Date` object, and returns an integer representing the hours
field of the given date (0-23), adjusted for UTC.
***
### getUTCMilliseconds ###
**Usage:** `var result = getUTCMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCMilliseconds`. Takes a `Date` object, and returns an integer representing
the milliseconds field of the given date (0-999), adjusted for UTC.
***
### getUTCMinutes ###
**Usage:** `var result = getUTCMinutes(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCMinutes`. Takes a `Date` object, and returns an integer representing the
minutes field of the given date (0-59), adjusted for UTC.
***
### getUTCMonth ###
**Usage:** `var result = getUTCMonth(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCMonth`. Takes a `Date` object, and returns an integer representing the month
field of the given date (0-11), adjusted for UTC.
***
### getUTCSeconds ###
**Usage:** `var result = getUTCSeconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getUTCSeconds`. Takes a `Date` object, and returns an integer representing the
seconds field of the given date (0-59), adjusted for UTC.
***
### makeDateFromMilliseconds ###
**Usage:** `var result = makeDateFromMilliseconds(milliseconds);`

Parameters:  
milliseconds `number`

Returns: `Date`

A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
non-numeric argument. Returns a new `Date` object whose value represents the date which is that many elapsed
milliseconds since the epoch.

#### Examples ####
    var d = funkierJS.makeDateFromMilliseconds(1400161244101);
***
### makeDateFromString ###
**Usage:** `var result = makeDateFromString(dateString);`

Parameters:  
dateString `string`

Returns: `Date`

A wrapper around calling the `Date` constructor with a single string argument. Throws a TypeError when called with
a non-string argument, or a string that cannot be parsed as a date. Returns a new `Date` object whose value
represents that given in the string.

#### Examples ####
    var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
***
### makeDayDate ###
**Usage:** `var result = makeDayDate(year, month, day);`

Parameters:  
year `number`  
month `number`  
day `number`

Returns: `Date`

A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the `Date`
are initialized to zero. Returns the new `Date`.

#### Examples ####
    var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
***
### makeHourDate ###
**Usage:** `var result = makeHourDate(year, month, day, hour);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`

Returns: `Date`

A curried wrapper around calling the `Date` constructor with four arguments: the year, the month, the day and the
hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
the `Date` are initialized to zero. Returns the new `Date`.

#### Examples ####
    var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
***
### makeMillisecondDate ###
**Usage:** `var result = makeMillisecondDate(year, month, day, hour, minute, second, millisecond);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`  
millisecond `number`

Returns: `Date`

A curried wrapper around calling the `Date` constructor with seven arguments: the year, the month, the day, the
hour, the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters.
Returns the new `Date`.

#### Examples ####
    var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
                                                                       //    January 2 2000
***
### makeMinuteDate ###
**Usage:** `var result = makeMinuteDate(year, month, day, hour, minute);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`

Returns: `Date`

A curried wrapper around calling the `Date` constructor with five arguments: the year, the month, the day, the hour
and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
fields in the `Date` are initialized to zero. Returns the new `Date`.

#### Examples ####
    var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
***
### makeMonthDate ###
**Usage:** `var result = makeMonthDate(year, month);`

Parameters:  
year `number`  
month `number`

Returns: `Date`

A curried wrapper around calling the `Date` constructor with two arguments: the year and the month. No validation
or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the `Date` are
initialized to zero, with the exception of the day, which is initialized to 1. Returns the new `Date`.

#### Examples ####
    var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
***
### makeSecondDate ###
**Usage:** `var result = makeSecondDate(year, month, day, hour, minute, second);`

Parameters:  
year `number`  
month `number`  
day `number`  
hour `number`  
minute `number`  
second `number`

Returns: `Date`

A curried wrapper around calling the `Date` constructor with six arguments: the year, the month, the day, the hour,
the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
All other fields in the `Date` are initialized to zero. Returns the new `Date`.

#### Examples ####
    var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
***
### setDayOfMonth ###
**Usage:** `var result = setDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `Date`

A wrapper around `Date.prototype.setDate`. Takes a value between 1 and 31, and a `Date` object, and sets the day of
the month to the given value. Invalid values will cause a change in other fields: for example, changing the day to
31 in a month with 30 days will increment the month, which may in turn increment the year. Returns the given 'Date`
object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
***
### setFullYear ###
**Usage:** `var result = setFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `Date`

A wrapper around `Date.prototype.setFullYear`. Takes a value and a `Date` object, and sets the year to the given
value. This may cause a change in other fields: for example, setting the year when the month and day represent
February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
Returns the given `Date` object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
***
### setHours ###
**Usage:** `var result = setHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setHours`. Takes a value between 0 and 23 representing the hour of the day, and
a `Date` object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
to other fields. Returns the given `Date` object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
***
### setMilliseconds ###
**Usage:** `var result = setMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setMilliseconds`. Takes a value between 0 and 999 representing the milliseconds,
and a `Date` object, and sets the milliseconds to the given value. Invalid values will cause a change in other
fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
a cascade of increments to other fields. Returns the given `Date` object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
***
### setMinutes ###
**Usage:** `var result = setMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setMinutes`. Takes a value between 0 and 59 representing the minutes, and a
`Date` object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
to other fields. Returns the given `Date` object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
***
### setMonth ###
**Usage:** `var result = setMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setMonth`. Takes a value between 0 and 11 representing the month, and a `Date`
object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
value > 11, then the year will be incremented by month div 12. Returns the given `Date` object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
***
### setSeconds ###
**Usage:** `var result = setSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setSeconds`. Takes a value between 0 and 59 representing the seconds, and a
`Date` object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
to other fields. Returns the given `Date` object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
***
### setTimeSinceEpoch ###
**Usage:** `var result = setTimeSinceEpoch(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setTime`. Takes a value representing the number of seconds since midnight,
January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
time that is that many seconds since the epoch. Returns the given `Date`.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
***
### setUTCDayOfMonth ###
**Usage:** `var result = setUTCDayOfMonth(day, d);`

Parameters:  
day `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCDate`. Takes a value between 1 and 31, and a `Date` object, and sets the day
of the month to the local equivalent of the given value. Invalid values will cause a change in other fields: for
example, changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the
year. Returns the given `Date` object.
***
### setUTCFullYear ###
**Usage:** `var result = setUTCFullYear(year, d);`

Parameters:  
year `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCFullYear`. Takes a value and a `Date` object, and sets the year to the local
equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
a leap year. Returns the given `Date` object.
***
### setUTCHours ###
**Usage:** `var result = setUTCHours(hours, d);`

Parameters:  
hours `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCHours`. Takes a value between 0 and 23 representing the hour of the day, and
a `Date` object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change
in other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a
cascade of increments to other fields. Returns the given `Date` object.
***
### setUTCMilliseconds ###
**Usage:** `var result = setUTCMilliseconds(milliseconds, d);`

Parameters:  
milliseconds `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCMilliseconds`. Takes a value between 0 and 999 representing the
milliseconds, and a `Date` object, and sets the milliseconds to the local equivalent of the given value. Invalid
values will cause a change in other fields: if the value > 999, then the seconds will be incremented by
milliseconds div 1000. This may in turn cause a cascade of increments to other fields. Returns the given `Date`
object.
***
### setUTCMinutes ###
**Usage:** `var result = setUTCMinutes(minutes, d);`

Parameters:  
minutes `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCMinutes`. Takes a value between 0 and 59 representing the minutes, and a
`Date` object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change
in other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
cascade of increments to other fields. Returns the given `Date` object.
***
### setUTCMonth ###
**Usage:** `var result = setUTCMonth(month, d);`

Parameters:  
month `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCMonth`. Takes a value between 0 and 11 representing the month, and a
`Date` object, and sets the month to the local equivalent of the given value. Invalid values will cause a change
in other fields: if the value > 11, then the year will be incremented by month div 12. Returns the given `Date`
object.
***
### setUTCSeconds ###
**Usage:** `var result = setUTCSeconds(seconds, d);`

Parameters:  
seconds `number`  
d `Date`

Returns: `date`

A wrapper around `Date.prototype.setUTCSeconds`. Takes a value between 0 and 59 representing the seconds, and a
`Date` object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change
in other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause
a cascade of increments to other fields. Returns the local equivalent of the given `Date` object.
***
### toDateString ###
**Usage:** `var result = toDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around `Date.prototype.toDateString`. Takes a `Date` object, and returns a string representing the date
portion of the object.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
***
### toEpochMilliseconds ###
**Usage:** `var result = toEpochMilliseconds(d);`

Parameters:  
d `Date`

Returns: `number`

A wrapper around `Date.prototype.getTime`. Takes a `Date` object, and returns the number of milliseconds elapsed
since midnight, January 1 1970.
***
### toISOString ###
**Usage:** `var result = toISOString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around `Date.prototype.toISOString`. Takes a `Date` object, and returns a string representation of the
date in ISO format.

#### Examples ####
    var a = new Date(2000, 1, 15, 10, 11, 12, 13);
    funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
***
### toLocaleDateString ###
**Usage:** `var result = toLocaleDateString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around `Date.prototype.toLocaleDateString`. Takes a `Date` object, and  a string representing the date
portion of the object, formatted according to locale conventions.
***
### toTimeString ###
**Usage:** `var result = toTimeString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around `Date.prototype.toTimeString`. Takes a `Date` object, and returns a string representing the time
portion of the object.
***
### toUTCString ###
**Usage:** `var result = toUTCString(d);`

Parameters:  
d `Date`

Returns: `string`

A wrapper around `Date.prototype.toUTCString`. Takes a `Date` object, and returns a string representation of the
equivalent date in UTC.
***
## Function##
### apply ###
**Usage:** `var result = apply(args, f);`

Parameters:  
args `array`  
f `function`

Returns: `any`

Applies the given function f with the arguments given in the array args. If the function is not curried, it will be
curried (using [`curry`](#curry)) and partially applied if necessary. If the function is object curried, and has
not yet acquired an execution context, then it will be invoked with a null execution context (as `apply` is itself
curried, and so will have no visibility into the execution context it was invoked with). The result of applying the
given arguments to the function is returned.  Throws a TypeError if args is not an array, or if f is not a
function.

#### Examples ####
    funkierJS.apply([1], id); // 1
***
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

Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
will curry the result in the same manner as the supplied functions, or otherwise will curry them using
[`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
This limitation may be removed in future versions of the library.

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

Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
will curry the result in the same manner as the supplied functions, or otherwise will curry them using
[`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
This limitation may be removed in future versions of the library.

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
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned
function will also be considered as having been curried that way, with the correct bound context.

#### Examples ####
    var f1 = function(a) {return a + 1;};
    var f2 = function(b) {return b * 2;};
    var f = funkierJS.compose(f1, f2); // => f(x) = 2(x + 1)',
***
### composeOn ###
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
supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned
function will also be considered as having been curried that way, with the correct bound context.

This function is intended to afford an approximation of writing functions in a point-free style.

#### Examples ####
    var f1 = function(a) {return a(2);};
    var f2 = function(c, d, e) {return c * d * e;};
    var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
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
### fMap ###
See `fmap`
***
### flip ###
**Usage:** `var result = flip(f);`

Parameters:  
f `function`

Returns: `function`

Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.

Note that the returned function will be curried in the extant style, or using [`curry`](#curry) if the function
is not curried. Thus, if you wish to flip a object-curried function on the object prototype, you must object-curry
before flipping; in the other order, the function will be curried in the standard manner, preventing later object
currying.

#### Examples ####
    var backwards = funkierJS.flip(funkierJS.subtract);
    backwards(2, 3); // => 1
***
### fmap ###
*Synonyms:* `fMap`

**Usage:** `var result = fmap(f, g);`

Parameters:  
f `function`  
g `any`

Returns: `any`

Takes a known Functor, and maps the given function over it. Known functors are currently arrays, strings,
[`Maybes`](#Maybe) and [`Results](#Result), although this may change in future versions. Throws if the
first value is not a function of arity 1, or the second is not a known functor.

The actions taken are as follows:
  - arrays/strings: the function is mapped over the array
  - Maybe: [`Just`](#Just) values yield a new Just value containing the result of applying the function to the
           contents of the Just. [`Nothing`](#Nothing) values yield Nothing.
  - Result: [`Ok`](#Ok) values yiels a new Ok value containing the result of applying the function to the contents
            of the Ok. [`Err`](#Err) values yield the Err value unchanged.

#### Examples ####
    fmap(function(x) { return x + 1; }, Just(10)); => Just 11
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
Superfluous arguments are discarded. The resulting function may be called without any arguments even when it has
non-zero arity, for the purposes of establishing an execution context (usually when passing the function to some
other function-manipulating function); however the partial applications of the result will throw if they
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

Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
will curry the result in the same manner as the supplied functions, or otherwise will curry them using
[`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
This limitation may be removed in future versions of the library.

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
of arguments have been supplied. Superfluous arguments are discarded. If the resulting function has non-zero
length, it may be called without any arguments for the purpose of establishing an execution context; however
its partial applications throw if they require at least one argument, but are invoked without any.
`objectCurryWithArity` throws if the arity is not a natural number or if the second parameter is not a function.
The resulting function will throw if invoked with an undefined execution context.

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

Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
will curry the result in the same manner as the supplied functions, or otherwise will curry them using
[`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
This limitation may be removed in future versions of the library.

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
### permuteLeft ###
*Synonyms:* `rotateLeft`

**Usage:** `var result = permuteLeft(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function, returns a curried function of the same arity which takes the same parameters, except in a
different position. The first parameter of the original function will be the last parameter of the new function,
the second parameter of the original will be the first parameter of the new function and so on. This function is
essentially a no-op for curried functions of arity 0 and 1, equivalent to [`curry`](#curry) for uncurried
functions of arities 0 and 1, and equivalent to flip for functions of arity 2.

If f is already curried, the currying style of f will be preserved.

Throws a TypeError if f is not a function.

#### Examples ####
    f = function(x, y, z) {return x + y + z;};
    g = permuteLeft(f);
    g('a', 'b', 'c'); // => 'bca'
***
### permuteRight ###
*Synonyms:* `rotateRight`

**Usage:** `var result = permuteRight(f);`

Parameters:  
f `function`

Returns: `function`

Takes a function, returns a curried function of the same arity which takes the same parameters, except in a
different position. The first parameter of the original function will be the second parameter of the new function,
the second parameter of the original will be the third parameter of the new function and so on. This function is
essentially a no-op for curried functions of arity 0 and 1, equivalent to [`curry`](#curry) for uncurried
functions of arities 0 and 1, and equivalent to flip for functions of arity 2.

If f is already curried, the currying style of f will be preserved.

Throws a TypeError if f is not a function.

#### Examples ####
    f = function(x, y, z) {return x + y + z;};
    g = permuteLeft(f);
    g('a', 'b', 'c'); // => 'cab'
***
### post ###
**Usage:** `var result = post(wrappingFunction, f);`

Parameters:  
wrappingFunction `function`  
f `function`

Returns: `function`

Takes two functions wrappingFunction, and f, and returns a new function with the same arity as the function f,
and curried in the same manner (or curried with [`curry`](#curry) if f was not curried). When this new function
is called, it will first call f with the same execution context and arguments that the new function was called
with. Its return value will be saved. Next, wrappingFunction will be called, again with the same execution
context, and two arguments: an array containing the arguments to f, and f's return value. Anything returned from
wrappingFunction will be discarded, and f's return value will be returned.

Throws a TypeError if either of the given values are not functions.

#### Examples ####
    var postLogger = function(args, result) {console.log('plus called with ', args.join(', '), 'returned', result);};
    var loggedPlus = post(postLogger, plus);
    loggedPlus(2, 2); // => outputs 'plus called with 2, 2 returned 4' to console
***
### pre ###
**Usage:** `var result = pre(wrappingFunction, f);`

Parameters:  
wrappingFunction `function`  
f `function`

Returns: `function`

Takes two functions wrappingFunction, and f, and returns a new function with the same arity as the function f,
and curried in the same manner (or curried with [`curry`](#curry) if f was not curried). When this new function
is called, it will first call wrappingFunction, with the same execution context, and a single argument: an array
containing all the arguments the function was called with. When wrappingFunction returns, its return value
will be discarded, and f will be called with the same execution context and invoked with the same arguments as the
new function was invoked with. The return value from f will be returned.

Throws a TypeError if neither of the given values are functions.

#### Examples ####
    var logger = function(args) {console.log('plus called with ', args.join(', '));};
    var loggedPlus = pre(logger, plus);
    loggedPlus(2, 2); // => outputs 'plus called with 2, 2' to console
***
### rotateLeft ###
See `permuteLeft`
***
### rotateRight ###
See `permuteRight`
***
### sectionLeft ###
**Usage:** `var result = sectionLeft(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the first argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

Note that object-curried functions should first be given a context before passing them into this function:
internally `this` is bound to null within `sectionLeft`, so it cannot supply a useful execution context to
the supplied function.

#### Examples ####
    var f = function(x, y) {return x * y;};',
    var g = funkierJS.sectionLeft(f, 2);
    g(3); // => 6 (i.e. 2 * 3)',
***
### sectionRight ###
**Usage:** `var result = sectionRight(f, x);`

Parameters:  
f `function`  
x `any`

Returns: `function`

Partially applies the binary function f with the given argument x, with x being supplied as the second argument
to f. The given function f will be curried if necessary. Throws if f is not a binary function.

Note that object-curried functions should first be given a context before passing them into this function:
internally `this` is bound to null within `sectionRight`, so it cannot supply a useful execution context to
the supplied function.

#### Examples ####
    var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
    fn(2); // => -1
***
### wrap ###
**Usage:** `var result = wrap(before, after, f);`

Parameters:  
before `function`  
after `function`  
f `function`

Returns: `function`

Takes 3 functions, before, after and f. Returns a new function with the same arity as f, and curried in the same
manner (or curried using [`curry`](#curry) if f was not curried. The functions before, f, and after will be called
when the returned function is invoked.

Specifically, when the returned function is called, the following will happen in sequence:
  -  before will be called with the execution context of the new function and one argument: an array containing
     the arguments the new function was invoked with

  -  f will be called with the execution context that the new function was called with, and the same arguments

  -  after will be called with the original execution context and two arguments: an array containing the arguments
     the new function was called with, and f's result

  -  f's result will be returned

Throws a TypeError if any argument is not a function.

This function is equivalent to calling [`post`](#post) and [`pre`](#pre) on some function.

#### Examples ####
    var logger = function(args) {console.log('plus called with ', args.join(', '));};
    var postLogger = function(args, result) {console.log('plus returned', result);};
    var loggedPlus = wrap(logger, postLogger, plus);
    loggedPlus(2, 2); // => outputs 'plus called with 2, 2' and 'plus returned 4' to console
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
### andPred ###
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
### not ###
**Usage:** `var result = not(b);`

Parameters:  
b `boolean`

Returns: `boolean`

A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.

#### Examples ####
    funkierJS.not(true); // => false
***
### notPred ###
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
### orPred ###
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
### xorPred ###
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
## Maths##
### add ###
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

A curried wrapper around `Math.max`. Takes exactly two arguments.

#### Examples ####
    funkierJS.min(5, 2); // => 5;
***
### min ###
**Usage:** `var result = min(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A curried wrapper around `Math.min`. Takes exactly two arguments.

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
### parseInt ###
**Usage:** `var result = parseInt(s);`

Parameters:  
s `string`

Returns: `number`

A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
assuming it represents a number in base 10. Returns `NaN` if the string does not represent a valid number in base
10.

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
### stringToInt ###
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
**Usage:** `var result = subtract(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `number`

A wrapper around the subtraction operator.

#### Examples ####
    funkierJS.subtract(3, 1); // => 2;
***
### toBaseAndRadix ###
See `toBaseAndString`
***
### toBaseAndString ###
*Synonyms:* `toBaseAndRadix`

**Usage:** `var result = toBaseAndString(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around `Number.prototype.toString`. Takes a base between 2 and 36, and a number. Returns a string
representing the given number in the given base.

#### Examples ####
    funkierJS.toBaseAndString(2, 5); // => "101"
***
### toExponential ###
**Usage:** `var result = toExponential(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around `Number.prototype.toExponential`. Takes the number of digits after the decimal point
(which should be between 0 and 20), and a number. Returns a string representing the number in exponential notation,
with the specified number of places after the decimal point.

#### Examples ####
    funkierJS.toExponential(3, 1); // => "1.000e+0"
***
### toFixed ###
**Usage:** `var result = toFixed(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around `Number.prototype.toFixed`. Takes the number of digits after the decimal point (which
should be between 0 and 20), and a number. Returns a string representing the number but with the specified number
of places after the decimal point.

#### Examples ####
    funkierJS.toFixed(2, 1); // => "1.00"
***
### toPrecision ###
**Usage:** `var result = toPrecision(x, y);`

Parameters:  
x `number`  
y `number`

Returns: `string`

A curried wrapper around `Number.prototype.toPrecision`. Takes the number of digits significant digits (which
should be between 1 and 21), and a number. Returns a string representing the number with the specified number
of significant digits.

#### Examples ####
    funkierJS.toPrecision(3, 1); // => "1.000"
***
## Object##
### callProp ###
**Usage:** `var result = callProp(prop);`

Parameters:  
prop `string`

Returns: `function`

A shorthand for `callPropWithArity(prop, 0)`. Returns a new function that takes an object, and calls the specified
property on the given object.

#### Examples ####
    var myObj = { return42: function() { return 42; }};
    var callReturn42 = funkierJS.callProp('return42');
    var callReturn42(myObj); // => 42
***
### callPropWithArity ###
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
*Synonyms:* `shallowClone`

**Usage:** `var result = clone(obj);`

Parameters:  
obj `objectLike`

Returns: `objectLike`

Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
from `Object.prototype`, `Array.prototype`, will not be copied, but those prototypes will be in the prototype chain
of the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
Non-primitive values are copied by reference.

Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
corresponding property in the original.
***
### createObject ###
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
**Usage:** `var result = createObjectWithProps(protoObject, descriptorsObject);`

Parameters:  
protoObject `objectLike`  
descriptorsObject `object`

Returns: `object`

Creates an object whose internal prototype property is protoObj, and which has the additional properties described
in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
form accepted by `Object.create`, `Object.defineProperties` etc.

#### Examples ####
    var obj = {};
    var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
                                                              writeable: true, value: 1}});
    funkierJS.isPrototypeOf(obj, newObj); // => true
    funkierJS.hasOwnProperty('prop', newObj); // => true',
***
### createProp ###
**Usage:** `var result = createProp(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
`o[prop] = value`. The property will be not be modified if it already exists; in that case this method will throw.
Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
successfully created when it already exists, but only in the prototype chain.

Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above
circumstances.  Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing
properties without creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or
create the property as required.

#### Examples ####
    var a = {foo: 1};
    funkierJS.create('bar', 42, a); // => returns a
    a.bar // => 42
***
### curryOwn ###
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
### defaultTap ###
See `extractOrDefault`
***
### defineProperties ###
**Usage:** `var result = defineProperties(descriptors, o);`

Parameters:  
descriptors `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around `Object.defineProperties`. Takes an object whose own properties map to property
descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperties({foo: {value: 42}}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### defineProperty ###
**Usage:** `var result = defineProperty(prop, descriptor, o);`

Parameters:  
prop `string`  
descriptor `object`  
o `objectLike`

Returns: `objectLike`

A curried wrapper around `Object.defineProperty`. Takes a property name string, a property descriptor object and
the object that the property hould be defined on. Returns the object o, after having defined the relevant property
per the descriptor. Throws a TypeError if the descriptor is not an object.

#### Examples ####
    var a = {};',
    funkierJS.hasOwnProperty('foo', a); // => false
    funkierJS.defineProperty('foo', {value: 42}, a);
    funkierJS.hasOwnProperty('foo', a); // => true
***
### deleteProp ###
**Usage:** `var result = deleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
`delete o[prop]`. Throws when the property is not configurable, including when the object is frozen or sealed.

Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
depending on the outcome of the operation.

#### Examples ####
    var a = {foo: 1};
    funkierJS.delete('foo',  a); // => returns a
    a.foo // => undefined
***
### descriptors ###
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
### extend ###
**Usage:** `var result = extend(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
properties are shallow-copied: in other words, if `foo` is a property of source whose value is an object, then
afterwards `source.foo === dest.foo` will be true.

#### Examples ####
    var a = {bar: 1};
    funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
***
### extendOwn ###
**Usage:** `var result = extendOwn(source, dest);`

Parameters:  
source `objectLike`  
dest `objectLike`

Returns: `objectLike`

Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
source's prototype chain are not copied. Any extant properties with the same name are overwritten.
Returns the modified dest object. All properties are shallow-copied: in other words, if `foo` is a property of
source whose value is an object, then afterwards `source.foo === dest.foo` will be true.

#### Examples ####
    var a = funkierJS.createObject({bar: 1});
    a.baz = 2;
    var b = {foo: 3};
    funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
***
### extract ###
*Synonyms:* `tap`

**Usage:** `var result = extract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `any`

Extracts the given property from the given object. Equivalent to evaluating `obj[prop]`.

#### Examples ####
    funkierJS.extract('foo', {foo: 42}); // => 42
***
### extractOrDefault ###
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
### getOwnPropertyDescriptor ###
**Usage:** `var result = getOwnPropertyDescriptor(prop, o);`

Parameters:  
prop `string`  
o `objectLike`

Returns: `object`

A curried wrapper around `Object.getOwnPropertyDescriptor`. Takes a property name and an object. If the object
itself has the given property, then the object's property descriptor for the given object is returned, otherwise
it returns undefined.

#### Examples ####
    var a = {foo: 42};',
    funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
                                                         value: 42}
    funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
***
### getOwnPropertyNames ###
**Usage:** `var result = getOwnPropertyNames(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around `Object.getOwnPropertyNames`. Takes an object, and returns an array containing the names of the
object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
the property names is not defined.

#### Examples ####
    funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
                                                     // native environment
***
### hasOwnProperty ###
**Usage:** `var result = hasOwnProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around `Object.prototype.hasOwnProperty`. Takes a string representing a property name and an
object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
property.

#### Examples ####
    funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
***
### hasProperty ###
**Usage:** `var result = hasProperty(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the `in` operator. Takes a string representing a property name and an object, and
returns true if the given object or some object in the prototype chain has the specified property.

#### Examples ####
    funkierJS.hasProperty('funkier', {funkier: 1}); // => true
    funkierJS.hasProperty('toString', {funkier: 1}); // => true
***
### instanceOf ###
**Usage:** `var result = instanceOf(constructor, obj);`

Parameters:  
constructor `function`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around the `instanceof` operator. Takes a constructor function and an object, and returns true
if the function's prototype property is in the prototype chain of the given object.

#### Examples ####
    var Constructor = function() {};
    funkierJS.instanceOf(Constructor, new Constructor()); // => true
    funkierJS.instanceOf(Function, {}); // => false
***
### isPrototypeOf ###
**Usage:** `var result = isPrototypeOf(protoObject, obj);`

Parameters:  
protoObject `objectLike`  
obj `objectLike`

Returns: `boolean`

A curried wrapper around `Object.prototype.isPrototypeOf`. Takes two objects: the prototype object, and the object
whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.

#### Examples ####
    var Constructor = function() {};
    funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
    funkierJS.isPrototypeOf(Function.prototype, {}); // => false
***
### keyValues ###
**Usage:** `var result = keyValues(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
of a property from the object, and the second element is the value of the property. This function only returns
key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
is not defined.

#### Examples ####
    funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]]
                                           // depending on native environment
***
### keys ###
**Usage:** `var result = keys(obj);`

Parameters:  
obj `objectLike`

Returns: `array`

A wrapper around `Object.keys`. Takes an object, and returns an array containing the names of the object's own
properties. Returns an empty array for non-objects.

#### Examples ####
    funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
                                      //    environment
***
### maybeCreate ###
See `safeCreateProp`
***
### maybeDelete ###
See `safeDeleteProp`
***
### maybeExtract ###
*Synonyms:* `safeExtract` | `maybeTap` | `safeTap`

**Usage:** `var result = maybeExtract(prop, obj);`

Parameters:  
prop `string`  
obj `object`

Returns: `Maybe`

Extracts the given property from the given object, and wraps it in a [`Just`](#Just) value. When the property is
not present, either in the object, or its prototype chain, then [`Nothing`](#Nothing) is returned.

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
### modify ###
*Synonyms:* `modifyProp`

**Usage:** `var result = modify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object.
Equivalent to evaluating `o[prop] = value`. The property will not be created when it doesn't exist on the object.
Throws when the property is not writable, when it has no setter function, or when the object is frozen.

Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above
circumstances.  Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties
and create them where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when
one wants to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.modify('foo', 42, a); // => returns a
    a.foo // => 42
***
### modifyProp ###
See `modify`
***
### safeCreateProp ###
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
*Synonyms:* `maybeDelete`

**Usage:** `var result = safeDeleteProp(prop, obj);`

Parameters:  
prop `string`  
obj `objectLike`

Returns: `objectLike`

Deletes the given property from the given the given object, returning the object wrapped as a [`Just`](#Just)
value. Equivalent to evaluating `delete o[prop]`. When the property is not configurable (either due to the
individual descriptor or the object being frozen or sealed) then [`Nothing`](#Nothing) will be returned.

Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.

#### Examples ####
    var a = {};
    funkierJS.delete('foo',  a); // => returns Nothing
***
### safeExtract ###
See `maybeExtract`
***
### safeModify ###
*Synonyms:* `maybeModify` | `maybeModifyProp` | `safeModifyProp`

**Usage:** `var result = safeModify(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, providing it exists, and returns the object,
wrapped in a [`Just`](#Just) value when successful. Equivalent to evaluating `o[prop] = value`. The property will
not be created when it doesn't exist on the object; nor will it be amended when the property is not writable, when
it has no setter function, or when the object is frozen. In such cases, [`Nothing`](#Nothing) will be returned.

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
*Synonyms:* `maybeSet` | `maybeSetProp` | `safeSetProp`

**Usage:** `var result = safeSet(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `Maybe`

Sets the given property to the given value on the given object, returning the object wrapped in a [`Just`](#Just)
value when successful. Equivalent to evaluating `o[prop] = value`. The property will be created if it doesn't exist
on the object. If unable to modify or create the property, then [`Nothing`](#Nothing) will be returned.

Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when
one wants to ensure existing values will not be changed.

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
### set ###
*Synonyms:* `setProp`

**Usage:** `var result = set(prop, val, obj);`

Parameters:  
prop `string`  
val `any`  
obj `objectLike`

Returns: `objectLike`

Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
`o[prop] = value`. The property will be created if it doesn't exist on the object. Throws when the property is
not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
is not already present.

Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when
one wants to ensure existing values will not be changed.

#### Examples ####
    var a = {foo: 1};
    funkierJS.set('foo', 42, a); // => returns a
    a.foo // => 42
***
### setProp ###
See `set`
***
### shallowClone ###
See `clone`
***
### tap ###
See `extract`
***
## String##
### chr ###
**Usage:** `var result = chr(n);`

Parameters:  
n `number`

Returns: `string`

Equivalent to `String.fromCharCode`. Takes a number n, and returns the character whose Unicode value is that
number.

#### Examples ####
    funkierJS.chr(69); // => 'E'
***
### firstMatch ###
**Usage:** `var result = firstMatch(r, s);`

Parameters:  
r `Regexp`  
s `string`

Returns: `object` | `null`

Finds the first match in a string for a given regular expression. Takes two parameters: a regular expression and a
string. Returns a single object or null.

If not null, the object has the following properties:
  - index: the index in the original string where the match was found
  - matchedText: the substring that matched the pattern
  - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
                    The substring matching the first parenthesised expression will be at position 0, the string
                    matching the second at position 1, and so on. If the regular expression did not contain any
                    parenthesised subexpressions, this array will be empty.

This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
is not affected by and does not change the lastIndex property of the regular expression if it exists.

Throws a TypeError if the first parameter is not a regular expression.

#### Examples ####
    funkierJS.firstMatch(/a/, \'banana\'); // => {index: 3, matchedText: \'a\', []}
***
### firstMatchFrom ###
**Usage:** `var result = firstMatchFrom(r, index, s);`

Parameters:  
r `Regexp`  
index `natural`  
s `string`

Returns: `object` | `null`

Finds the first match in a string for a given regular expression from a given index. Takes three parameters: a
regular expression an index, and a string. Returns a single object or null.

If not null, the object has the following properties:
  - index: the index in the original string where the match was found
  - matchedText: the substring that matched the pattern
  - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
                    The substring matching the first parenthesised expression will be at position 0, the string
                    matching the second at position 1, and so on. If the regular expression did not contain any
                    parenthesised subexpressions, this array will be empty.

This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
is not affected by and does not change the lastIndex property of the regular expression if it exists.

Throws a TypeError if the first parameter is not a regular expression.

#### Examples ####
    funkierJS.firstMatchFrom(/a/, 4, 'banana'); // => {index: 5, matchedText: 'a', []}
***
### matches ###
**Usage:** `var result = matches(r, s);`

Parameters:  
r `Regexp`  
s `string`

Returns: `array`

Finds all matches within a string for a given regular expression. Takes two parameters: a regular expression and a
string. Returns an array of objects, one object per match.

Each object has the following properties:
  - index: the index in the original string where the match was found
  - matchedText: the substring that matched the pattern
  - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
                    The substring matching the first parenthesised expression will be at position 0, the string
                    matching the second at position 1, and so on. If the regular expression did not contain any
                    parenthesised subexpressions, this array will be empty.

This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
is not affected by and does not change the lastIndex property of the regular expression if it exists.

Throws a TypeError if the first parameter is not a regular expression.

#### Examples ####
    funkierJS.matches(/a/, 'banana');
    // a => [{index: 1, matchedText: 'a', []}, {index: 3, matchedText: 'a', []},
    //       {index: 5, matchedText: 'a', []}]
***
### matchesFrom ###
**Usage:** `var result = matchesFrom(r, index, s);`

Parameters:  
r `Regexp`  
index `number`  
s `string`

Returns: `array`

Finds all matches within a string for a given regular expression from the given index. Takes three parameters: a
regular expression, an index and a string. Returns an array of objects, one object per match.

Each object has the following properties:
  - index: the index in the original string where the match was found
  - matchedText: the substring that matched the pattern
  - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
                    The substring matching the first parenthesised expression will be at position 0, the string
                    matching the second at position 1, and so on. If the regular expression did not contain any
                    parenthesised subexpressions, this array will be empty.

This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
is not affected by and does not change the lastIndex property of the regular expression if it exists.

If the index is negative, it is taken as an offset from the end of the string.

Throws a TypeError if the first parameter is not a regular expression.

#### Examples ####
    funkierJS.matchesFrom(/a/, 2, 'banana');
    // => [{index: 3, matchedText: 'a', []}, {index: 5, matchedText: 'a', []}]
***
### ord ###
**Usage:** `ord(s);`

Parameters:  
s `string`

Takes a string s, and returns the Unicode value of the character at index 0. Equivalent to `toCharCode(0, s)`.

#### Examples ####
    funkierJS.ord('A'); // => 65
***
### regExpSplit ###
*Synonyms:* `splitRegExp`

**Usage:** `var result = regExpSplit(delimiter, s);`

Parameters:  
delimiter `RegExp`  
s `string`

Returns: `array`

A curried wrapper around `String.prototype.split`. Takes a pattern regexp, and a target string s, and returns an
array containing the substrings of s that were separated by substrings matching the given pattern.

Throws a TypeError if the first parameter is not a RegExp or if the second parameter is not a string.

To specify the delimiter as a string, use [`split`](#split).
To specify an upper bound, use [`splitMax`](#splitMax')/[`regExpSplitMax`](#regExpSplitMax).

#### Examples ####
    regExpSplit/a/, 'banana'); // => ['b', 'n', 'n']
***
### regExpSplitCount ###
See `regExpSplitMax`
***
### regExpSplitLimit ###
See `regExpSplitMax`
***
### regExpSplitMax ###
*Synonyms:* `regExpSplitLimit` | `regExpSplitCount`

**Usage:** `var result = regExpSplitMax(delimiter, limit, s);`

Parameters:  
delimiter `RegExp`  
limit `natural`  
s `string`

Returns: `array`

A curried wrapper around `String.prototype.split`. Takes a RegExp delimiter, a count, and a target string s, and
returns an array containing the substrings of s that were separated by strings matching the given delimiter, the
returned array containing at most limit such substrings.

Throws a TypeError if the first parameter is not a RegExp, if the limit count is not integral, or if the last
parameter is not a string.

To specify the delimiter as a string, use [`splitMax`](#splitMax).
To split without an upper bound, use [`split`](#split')/[`regExpSplit`](#regExpSplit).

  funkierJS.splitRegExpLimit(/a/, 2, 'banana'); // => ['b', 'n']
***
### split ###
**Usage:** `var result = split(delimiter, s);`

Parameters:  
delimiter `string`  
s `string`

Returns: `array`

A curried wrapper around `String.prototype.split`. Takes a string delimiter, and a target string s, and returns an
array containing the substrings of s that were separated by the given delimiter.

Throws a TypeError if either parameter is not a string.

To specify the delimiter as a RegExp, use [`regExpSplit`](#regExpSplit).
To specify an upper bound, use [`splitMax`](#splitMax')/[`regExpSplitMax`](#regExpSplitMax).

#### Examples ####
    funkierJS.split('|', '1|2|3'); // => ['1', '2', '3']
***
### splitCount ###
See `splitMax`
***
### splitLimit ###
See `splitMax`
***
### splitMax ###
*Synonyms:* `splitLimit` | `splitCount`

**Usage:** `var result = splitMax(delimiter, limit, s);`

Parameters:  
delimiter `string`  
limit `natural`  
s `string`

Returns: `array`

A curried wrapper around `String.prototype.split`. Takes a string delimiter, a count, and a target string s, and
returns an array containing the substrings of s that were separated by the given delimiter, the returned array
containing at most limit such substrings.

Throws a TypeError if the first or last parameter is not a string, or if limit is not integral.

To specify the delimiter as a RegExp, use [`regExpSplitMax`](#regExpSplitMax).
To split without an upper bound, use [`split`](#split')/[`regExpSplit`](#regExpSplit).

#### Examples ####
    funkierJS.split('|', 2, '1|2|3'); // => ['1', '2']
***
### splitRegExp ###
See `regExpSplit`
***
### test ###
**Usage:** `var result = test(regexp, s);`

Parameters:  
regexp `RegExp`  
s `string`

Returns: `boolean`

A curried wrapper around `RegExp.prototype.test`. Takes a regexp, and a string s, and returns true if the string
contains a substring matching the given pattern, and false otherwise.

Throws a TypeError if regexp is not a RegExp, or if s is not a string.

#### Examples ####
    funkierJS.test(/a/, 'banana'); // => true
***
### toCharCode ###
**Usage:** `var result = toCharCode(i, s);`

Parameters:  
i `number`  
s `string`

Returns: `number`

A curried wrapper around `String.charCodeAt`. Takes an index i, and a string s, and returns the Unicode value of
the character at the given index in s.

#### Examples ####
    funkierJS.toCharCode(2, 'funkier'); // => 117
***
### toLocaleLowerCase ###
**Usage:** `var result = toLocaleLowerCase(s);`

Parameters:  
s `string`

Returns: `string`

Equivalent to `String.prototype.toLocaleLowerCase`. Takes a string s, and returns a lowercase version of s,
converted following locale conventions.

#### Examples ####
    funkierJS.toLocaleLowerCase('I LIKE TO SHOUT'); // => 'i like to shout'
***
### toLocaleString ###
**Usage:** `var result = toLocaleString(val);`

Parameters:  
val `any`

Returns: `string`

Calls val's `toLocaleString` property, and returns the result.

#### Examples ####
    funkierJS.toLocaleString(1000); // => '1000' (in some environments)
***
### toLocaleUpperCase ###
**Usage:** `toLocaleUpperCase(s);`

Parameters:  
s `string`

Equivalent to `String.prototype.toLocaleUpperCase`. Takes a string s, and returns a uppercase version of s,
converted following locale conventions.

#### Examples ####
    funkierJS.toLocaleUpperCase('i like to whisper'); // => 'I LIKE TO WHISPER'
***
### toLowerCase ###
**Usage:** `var result = toLowerCase(s);`

Parameters:  
s `string`

Returns: `string`

Equivalent to `String.prototype.toLowerCase`. Takes a string s, and returns a lowercase version of s.

#### Examples ####
    funkierJS.toLowerCase('I LIKE TO SHOUT'); // => 'i like to shout'
***
### toString ###
**Usage:** `toString(val);`

Parameters:  
val `any`

Calls val's `toString` property, and returns the result.

#### Examples ####
    funkierJS.toString({}); // => '[object Object]'
***
### toUpperCase ###
**Usage:** `var result = toUpperCase(s);`

Parameters:  
s `string`

Returns: `string`

Equivalent to `String.prototype.toUpperCase`. Takes a string s, and returns a uppercase version of s.

#### Examples ####
    funkierJS.oUpperCase('i like to whisper'); // => 'I LIKE TO WHISPER'
***
### trim ###
**Usage:** `var result = trim(s);`

Parameters:  
s `string`

Returns: `string`

Returns a string containing the contents of the original string, less any leading and trailing whitespace.

#### Examples ####
    funkierJS.trim(' abc   '); // 'abc'
***
## Types##
### composeMany ###
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
the object's type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".

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

Returns true if typeof the given value equals `"boolean"`, false otherwise.

#### Examples ####
    funkierJS.isBoolean(false); // => true
***
### isNull ###
**Usage:** `var result = isNull(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if the given object is `null`, false otherwise

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

Returns true if typeof the given value equals `"object"`, false otherwise.

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

Returns true if typeof the given value equals `"string"`, false otherwise.

#### Examples ####
    funkierJS.isString('a'); // => true
***
### isUndefined ###
**Usage:** `var result = isUndefined(a);`

Parameters:  
a `any`

Returns: `boolean`

Returns true if typeof the given value equals `"undefined"`, false otherwise.

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
