
//This should be done before loading AngularJs
//Add jQuery, Backbone and lodash into window
//as they are all exposed in Webpck bundle in webpack.config.js
//BUT not globally so it means they are not accessible external to the bunle
//to file such as joint.js
window.$ = window.jQuery = require("jquery");
window.Backbone = require("backbone");
window['_'] = require("lodash");
window['underscore'] = require("underscore");