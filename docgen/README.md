The funkierJS documentation system parses the comments of each file to produce the API documentation contained in
block comments. Within a block comment it looks for a `<apifunction>` or `<apiobject>` tag. The remainder of th
comment, or the comment up to a closing `</apifunction>` or `</apiobject>` tag will be consumed as the contents of the
API documentation for the given function or object. The opening and closing tags should be the only content on their
line (although a single asterisk is allowed to preserve block comment formatting). It is an error if there is more than
one opening or closing tag within one comment, or for an `<apifunction>` and an `<apiobject>` tag to appear in the same
comment.

The next non-degenerate line after the opening tag is expected to be the name of the function or value being described.
The name should be the only word on its line. The indentation of the name establishes the expected amount of
indentation: that level of indentation will be stripped from all following lines. Inconsistent indentation is an error.

Following the name, there should be a line starting with the word "Category: " which defines which category the function
belongs to. All category names will be normalized by having their first letter capitalized. Thus, "foo" and "Foo" are
considered to be the same category. It is an error to omit the category.

The final required line is the summary: a short free-form text paragraph quickly describing the functionality of the
value being described. The summary should not contain any Markdown. It is an error to omit the summary.

One can optionally add further detail in subsequent paragraphs, though this will not be output in any generated
in-library help.

One can also add code samples, that will be formatted appropriately in generated Markdown and HTML. To do this, add
a line containing only "Examples:". The first line of the examples shall establish the indent level for the remaining
example lines: this should at least equal the indentation established by the name line.

Functions can have additional special lines between the name and the start of the summary. It is an error if these
appear between `<apiobject>` tags.

There can be multiple `Parameter:` lines. Each such line should have the name of the parameter, followed by a colon,
followed by the possible types that the parameter will accept, separated by pipe characters, commas, or the word "or".

There can be a "Returns:" line, which denotes the types that can be returned by the function. The type list follows
the same conventions as the type lists for parameters.

If supplying a returns line, there must be no other "special" lines between it and the last parameter line.
Similarly, the parameter lines should be contiguous.

One can also supply a synonyms line, listing alternate names for the function. Such a line should begin with
"Synonyms:", and the list of synonyms should be separated by pipes, commas, or the word "or".
