/* This CKAN module handles removing a color from the admin settings. */

ckan.module('visualize-colors-settings-remove', function($) {
  return {
    initialize: function() {
      var colorRemoveButton = this.el.find('.color-remove');
      $(colorRemoveButton).on(
        'click',
        function(e) {
          $(e.currentTarget)
            .closest('.input-group')
            .remove();
          this.normalizeInputs();
        }.bind(this)
      );
    },
    normalizeInputs: function() {
      $.each(this.el.children(), function(i, inputGroup) {
        var label = $(inputGroup).find('.control-label');
        label.attr('for', 'color_' + (i + 1));
        label.text('Color #' + (i + 1));

        var input = $(inputGroup).find('input[type="color"]');
        input.attr('id', 'color_' + (i + 1));
        input.attr('name', 'color_' + (i + 1));
      });
    }
  };
});