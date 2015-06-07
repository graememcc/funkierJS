(function() {
  "use strict";


  var expect = require('chai').expect;
  var marked = require('marked');
  var makeMarkdownRenderer = require('../../docgen/markdownRenderer');


  describe('Markdown renderer', function() {
    var renderer;

    beforeEach(function() {
      renderer = makeMarkdownRenderer([]);
    });


    it('Encountering a <h2> produces a section tag containing the <h2>', function() {
      var text = '## foo ##';
      var expected = '<section class="categoryRef" id="foo">\n<h2 class="categoryName categoryBanner catfoo">foo</h2>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Encountering a <h3> produces a section tag containing the <h3>', function() {
      var text = '### foo ###';
      var expected = '<section class="functionRef" id="foo">\n<div class="funcHeading"><h3 class="functionName">foo</h3>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Synonym reference lines should be returned essentially unchanged', function() {
      var text = 'See <code>bar</code>';
      var expected = '</div><p class="see">See <a class="synonymLink" href="#bar"><code class="synonymCode">bar</code>' +
                     '</a></p>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Renderer throws if no options given and category encountered', function() {
      var text = 'Category: Foo';
      var fn = function() {
        marked(text, {renderer: renderer});
      };

      expect(fn).to.throw();
    });


    it('Renderer throws if options do not contain a category filename and no isCategory flag', function() {
      var renderer = makeMarkdownRenderer([], {});
      var text = 'Category: Foo';
      var fn = function() {
        marked(text, {renderer: renderer});
      };

      expect(fn).to.throw();
    });


    it('Renderer throws if options do not contain a category filename and explicit false isCategory flag', function() {
      var renderer = makeMarkdownRenderer([], {isCategory: false});
      var text = 'Category: Foo';
      var fn = function() {
        marked(text, {renderer: renderer});
      };

      expect(fn).to.throw();
    });


    it('Renderer produces correct output when category encountered with category filename and no isCategory flag', function() {
      var renderer = makeMarkdownRenderer([], {categoryFile: 'a.html'});
      var text = 'Category: Foo';
      var expected = '<p class="category"><span class="catStart">Category: </span><a class="categoryLink catFoo" ' +
                     'href="a.html#Foo">Foo</a></p>\n</div>';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Renderer output correct when category encountered with category filename and explicit false isCategory flag',
      function() {
      var renderer = makeMarkdownRenderer([], {categoryFile: 'a.html', isCategory: false});
      var text = 'Category: Foo';
      var expected = '<p class="category"><span class="catStart">Category: </span><a class="categoryLink catFoo" href="a.html#Foo">Foo</a></p>\n</div>';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Renderer output correct when category encountered with category filename and explicit true isCategory flag',
      function() {
      var renderer = makeMarkdownRenderer([], {categoryFile: 'a.html', isCategory: true});
      var text = 'Category: Foo';
      var expected = '<p class="category categoryBanner"><span class="catStart">Category: </span><a class="categoryLink catFoo" href="#Foo">Foo</a></p>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Renderer output correct when category encountered with no category filename and explicit true isCategory flag',
      function() {
      var renderer = makeMarkdownRenderer([], {isCategory: true});
      var text = 'Category: Foo';
      var expected = '<p class="category categoryBanner"><span class="catStart">Category: </span><a class="categoryLink catFoo" href="#Foo">Foo</a></p>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Renderer output correct when category encountered with no category filename and explicit true isCategory flag',
      function() {
      var renderer = makeMarkdownRenderer([], {isCategory: true});
      var text = 'Category: Foo';
      var expected = '<p class="category categoryBanner"><span class="catStart">Category: </span><a class="categoryLink catFoo" href="#Foo">Foo</a></p>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Usage line rendered correctly', function() {
      var text = '**Usage:** `var result = arity(f);`';
      var expected = '<p class="usage"><strong class="usageStart">Usage: </strong>' +
                     '<code class="usageCode">var result = arity(f);</code></p>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Synonyms lines rendered correctly (1)', function() {
      var text = '*Synonyms:* `foo`';
      var expected = '<div class="synonyms"><em class="synonymsStart">Synonyms: </em><ul class="synonymsList"><li class="synonym">' +
                     '<code class="synonymName">foo</code></li></ul></div>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Synonyms lines rendered correctly (2)', function() {
      var text = '*Synonyms:* `foo` | `bar`';
      var expected = '<div class="synonyms"><em class="synonymsStart">Synonyms: </em><ul class="synonymsList"><li class="synonym">' +
                     '<code class="synonymName">foo</code></li>' +
                     '<li class="synonym"><code class="synonymName">bar</code></li></ul></div>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Return type rendered correctly when nothing linkable provided', function() {
      var text = 'Returns: `number`';
      var expected = '<div class="returns"><span class="returnsStart">Returns: </span><ul class="returnTypes"><li class="returnItem">' +
                     '<code class="returnType type">number</code></li></ul></div>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Return type rendered correctly when linkables provided but don\'t match', function() {
      var renderer = makeMarkdownRenderer([], {toLink: ['string']});
      var text = 'Returns: `number`';
      var expected = '<div class="returns"><span class="returnsStart">Returns: </span><ul class="returnTypes"><li class="returnItem">' +
                     '<code class="returnType type">number</code></li></ul></div>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Return type rendered correctly when linkables provided and match', function() {
      var renderer = makeMarkdownRenderer([], {toLink: ['number']});
      var text = 'Returns: `number`';
      var expected = '<div class="returns"><span class="returnsStart">Returns: </span><ul class="returnTypes"><li class="returnItem">' +
                     '<a class="typeLink" href="#number">' +
                     '<code class="returnType type">number</code></a></li></ul></div>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Return type rendered correctly when linkables provided and some match', function() {
      var renderer = makeMarkdownRenderer([], {toLink: ['string', 'Foo']});
      var text = 'Returns: `number` | `string` | `Foo`';
      var expected = '<div class="returns"><span class="returnsStart">Returns: ' +
                     '</span><ul class="returnTypes"><li class="returnItem"><code class="returnType type">number</code>' +
                     '</li><li class="returnItem"><a class="typeLink" href="#string">' +
                     '<code class="returnType type">string</code></a></li><li class="returnItem">' +
                     '<a class="typeLink" href="#foo"><code class="returnType type">Foo</code></a></li></ul></div>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Parameters rendered correctly when no linkables provided (1)', function() {
      var text = 'Parameters:  \nf `function`';
      var expected = '<section class="parameters"><h4 class="parametersHeader">Parameters</h4>' +
                     '<ol class="parameterList"><li class="param">f<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<code class="paramType type">function</code></li></ul>' +
                     '</li></ol></section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Parameters rendered correctly when no linkables provided (2)', function() {
      var text = 'Parameters:  \nf `function`  \ng `number`';
      var expected = '<section class="parameters"><h4 class="parametersHeader">Parameters</h4>' +
                     '<ol class="parameterList"><li class="param">f<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<code class="paramType type">function</code></li></ul>' +
                     '</li><li class="param">g<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<code class="paramType type">number</code></li></ul>' +
                     '</li></ol></section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Parameters rendered correctly when linkables provided but none match', function() {
      var renderer = makeMarkdownRenderer([], {toLink: ['string']});
      var text = 'Parameters:  \nf `function`';
      var expected = '<section class="parameters"><h4 class="parametersHeader">Parameters</h4>' +
                     '<ol class="parameterList"><li class="param">f<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<code class="paramType type">function</code></li></ul>' +
                     '</li></ol></section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Parameters rendered correctly when linkables provided and match', function() {
      var renderer = makeMarkdownRenderer([], {toLink: ['string']});
      var text = 'Parameters:  \nf `string`';
      var expected = '<section class="parameters"><h4 class="parametersHeader">Parameters</h4>' +
                     '<ol class="parameterList"><li class="param">f<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<a class="typeLink" href="#string">' +
                     '<code class="paramType type">string</code></a></li></ul></li></ol></section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Parameters rendered correctly when linkables provided and some match', function() {
      var renderer = makeMarkdownRenderer([], {toLink: ['Bar']});
      var text = 'Parameters:  \nf `function`  \ng `Bar`';
      var expected = '<section class="parameters"><h4 class="parametersHeader">Parameters</h4>' +
                     '<ol class="parameterList"><li class="param">f<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<code class="paramType type">function</code></li></ul>' +
                     '</li><li class="param">g<code>:</code> <ul class="paramTypes"><li class="paramsItem">' +
                     '<a class="typeLink" href="#bar"><code class="paramType type">Bar' +
                     '</code></a></li></ul></li></ol></section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Arbitrary paragraph rendered correctly', function() {
      var text = 'foo. bar. Whoopy doo.\nTum te tum';
      var expected = new marked.Renderer().paragraph(text);
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Examples rendered correctly', function() {
      var text = '#### Examples ####';
      var expected = '<section class="examples"><h4>Examples</h4>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Example code rendered correctly', function() {
      var text = '    var a = foo();';
      var expected = new marked.Renderer().code(text.slice(4)) + '</section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });


    it('Horizontal rules rendered correctly', function() {
      var text = '***';
      var expected = '</section>\n';
      var rendered = marked(text, {renderer: renderer});
      expect(rendered).to.equal(expected);
    });
  });
})();
