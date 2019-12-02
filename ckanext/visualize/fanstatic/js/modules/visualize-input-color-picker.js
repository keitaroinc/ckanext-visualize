/* This CKAN module integrates the Internet Explorer polyfill for <input type="color">. */

ckan.module('visualize-input-color-picker', function($) {
  return {
    initialize: function() {
      window.nativeColorPicker.init(this.el.attr('id'));
    }
  };
});
