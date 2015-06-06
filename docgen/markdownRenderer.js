module.exports = (function() {
  "use strict";


  var marked = require('marked');


  /*
   * Output a synonym's link to the underlying function.
   *
   */

  var renderSeeAlso = function(text) {
    var innerCode = text.slice('See <code>'.length);
    innerCode = innerCode.slice(0, innerCode.indexOf('<'));
    return '<p class="see">See <a class="synonymLink" href="#' + innerCode + '"><code class="synonymCode">' +
           innerCode + '</code></a></p>\n';
  };



  /*
   * Output a paragraph denoting a value's category. Throws if options.isCategory is undefined or false and
   * options.categoryFile is also false
   *
   */

  var renderCategory = function(text, options) {
    var catName = text.slice('Category: '.length).trim();

    if (options.isCategory)
      return '<p class="category">Category: <a class="categoryLink" href="#' + catName + '">' +
             catName + '</a></p>\n';

    if (options.categoryFile === undefined)
      throw new Error('Cannot link to category: no category file specified!');

    return '<p class="category">Category: <a class="categoryLink" href="' + options.categoryFile + '#' +
           catName + '">' + catName + '</a></p>\n';
  };


  var renderUsage = function(text) {
    text = text.slice('<strong>Usage:</strong> '.length).trim();
    return '<p class="usage"><strong>Usage:</strong> <code class="usageCode">' + text.split('<code>')[1] + '</p>\n';
  };


  var renderReturns = function(text, options) {
    var links = Array.isArray(options.toLink) ? options.toLink.map(function(s) { return s.toLowerCase(); }) : [];

    text = text.slice('Returns: <code>'.length).trim();
    var types = text.split(/<\/code>(?: \| <code>)?/).filter(function(s) { return s !== ''; });

    return '<div class="returns">Returns: <ul class="returnTypes"><li class="returnItem">' + types.map(function(t) {
      var shouldLink = links.indexOf(t.toLowerCase()) !== -1;
      return (shouldLink ? '<a class="typeLink" href="#' + t.toLowerCase() + '">' : '') +
             '<code class="returnType type">' + t + '</code>' +
             (shouldLink ? '</a>' : '');
    }).join('</li><li class="returnItem">') + '</li></ul></div>\n';
  };


  var renderSynonyms = function(text) {
    text = text.slice('<em>Synonyms:</em> <code>'.length).trim();
    var names = text.split(/<\/code>(?: \| <code>)?/).filter(function(s) { return s !== ''; });

    return '<div class="synonyms"><em>Synonyms:</em> <ul class="synonymsList">' +
      names.map(function(n) {
        return '<li class="synonym"><code class="synonymName">' + n + '</code></li>';
      }).join('') + '</ul></div>\n';
  };


  var renderParameters = function(text, options) {
    var links = Array.isArray(options.toLink) ? options.toLink.map(function(s) { return s.toLowerCase(); }) : [];

    text = text.slice('Parameters:<br>'.length).trim();
    var lines = text.split('<br>');
    return '<section class="parameters"><h4 class="parametersHeader">Parameters</h4>' +
      '<ol class="parameterList"><li class="param">' + lines.map(function(line) {
        var splitPoint = line.indexOf(' ');
        var name = line.slice(0, splitPoint);
        var remaining = line.slice(splitPoint + ' <code>'.length);
        var types = remaining.split(/<\/code>(?: \| <code>)?/).filter(function(s) { return s !== ''; });

        return name + ': <ul class="paramTypes"><li class="paramsItem">' + types.map(function(t) {
          var shouldLink = links.indexOf(t.toLowerCase()) !== -1;
          return (shouldLink ? '<a class="typeLink" href="#' + t.toLowerCase() + '">' : '') +
            '<code class="paramType type">' + t + '</code>' + (shouldLink ? '</a>' : '');
        }).join('</li><li class="paramsItem">') + '</li></ul>';
      }).join('</li><li class="param">') + '</li></ol></section>\n';
  };


  var renderParagraph = function(text, options) {
    if (/^See\s</.test(text))
      return renderSeeAlso(text);

    if (/^Category:\s/.test(text))
      return renderCategory(text, options);

    if (/<strong>Usage:</.test(text))
      return renderUsage(text);

    if (/Returns:/.test(text))
      return renderReturns(text, options);

    if (/Synonyms:/.test(text))
      return renderSynonyms(text);

    if (/Parameters:/.test(text))
      return renderParameters(text, options);

    return new marked.Renderer().paragraph(text);
  };


  var makeMarkdownRenderer = function(toLink, options) {
    options = options || {};
    var renderer = new marked.Renderer();


    var categoryOpened = false;

    renderer.heading = function(text, level, raw) {
      if (level === 2) {
        var pre = categoryOpened ? '</section>\n' : '';
        categoryOpened = true;
        return pre + '<section class="categoryRef" id="' + text + '">\n' +
               '<h2 class="categoryName">' + text + '</h2>\n';
      } else if (level === 3) {
        return '<section class="functionRef" id="' + text + '">\n' +
               '<h3 class="functionName">' + text + '</h3>\n';
      } else if (level === 4) {
        return '<section class="examples"><h4>' + text + '</h4>\n';
      } else {
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      }
    };


    renderer.paragraph = function(text) {
      return renderParagraph(text, options);
    };


    renderer.code = function(code) {
      return new marked.Renderer().code(code) + '</section>\n';
    };


    renderer.hr = function() { return '</section>\n'; };


    return renderer;
  };


  return makeMarkdownRenderer;
})();
