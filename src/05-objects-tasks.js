/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea: () => width * height,
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CSSSelector {
  constructor() {
    this.classes = [];
    this.attributes = [];
    this.pseudoClasses = [];
    this.combined = [];
    this.tag = '';
    this.idValue = '';
    this.pseudoElementValue = '';
  }

  element(value) {
    if (this.tag) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (this.idValue || this.pseudoElementValue || this.classes.length > 0 || this.pseudoClasses.length > 0 || this.attributes.length > 0) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    this.tag = value;
    return this;
  }

  id(value) {
    if (this.idValue) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (this.pseudoElementValue || this.classes.length > 0 || this.pseudoClasses.length > 0 || this.attributes.length > 0) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    this.idValue = `#${value}`;
    return this;
  }

  pseudoElement(value) {
    if (this.pseudoElementValue) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    this.pseudoElementValue = `::${value}`;
    return this;
  }

  class(className) {
    if (this.pseudoElementValue || this.attributes.length > 0 || this.pseudoClasses.length > 0) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    this.classes.push(`.${className}`);
    return this;
  }

  pseudoClass(name) {
    if (this.pseudoElementValue) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    this.pseudoClasses.push(`:${name}`);
    return this;
  }

  attr(attr) {
    if (this.pseudoElementValue || this.pseudoClasses.length > 0) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    this.attributes.push(`[${attr}]`);
    return this;
  }

  combineWith(combinator, selector) {
    this.combined.push([combinator, selector]);
    return this;
  }

  stringify() {
    let result = `${this.tag}${this.idValue}`;
    this.classes.forEach((className) => { result += className; });
    this.attributes.forEach((attribute) => { result += attribute; });
    this.pseudoClasses.forEach((pseudoClass) => { result += pseudoClass; });
    this.combined.forEach((selector) => { result += ` ${selector[0]} ${selector[1].stringify()}`; });
    result += this.pseudoElementValue;
    return result;
  }
}

const cssSelectorBuilder = {
  stringValue: '',

  element(value) {
    const selector = new CSSSelector();
    selector.element(value);
    return selector;
  },

  id(value) {
    const selector = new CSSSelector();
    selector.id(value);
    return selector;
  },

  class(value) {
    const selector = new CSSSelector();
    selector.class(value);
    return selector;
  },

  attr(value) {
    const selector = new CSSSelector();
    selector.attr(value);
    return selector;
  },

  pseudoClass(value) {
    const selector = new CSSSelector();
    selector.pseudoClass(value);
    return selector;
  },

  pseudoElement(value) {
    const selector = new CSSSelector();
    selector.pseudoElement(value);
    return selector;
  },

  combine(selector1, combinator, selector2) {
    selector1.combineWith(combinator, selector2);
    return selector1;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
