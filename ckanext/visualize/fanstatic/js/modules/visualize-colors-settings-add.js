/* This CKAN module handles adding a color from the admin settings. */

ckan.module('visualize-colors-settings-add', function($) {
  return {
    initialize: function() {
      var colorPallet = $('#color-pallet');
      var inputGroup = [
        '<div class="input-group">',
        '<div class="form-group item-color">',
        '<label class="control-label" for="color_$id$">Color #$id$</label>',
        '<div class="controls">',
        '<input id="color_$id$" type="color" name="color_$id$" value="#000000" placeholder="" class="form-control">',
        '</div>',
        '</div>',
        '<div class="input-group-btn">',
        '<button class="btn btn-default color-remove" type="button">',
        '<i class="fa fa-times"></i>',
        '</button>',
        '</div>',
        '</div>'
      ].join('');
      var colorsContainer = $('#color-pallet');

      this.el.on('click', function(e) {
        colorsContainer.append(
          inputGroup.replace(
            new RegExp('\\$id\\$', 'g'),
            String(colorsContainer.children().length + 1)
          )
        );
        window.ckan.module.initializeElement(colorPallet[0]);
      });
    }
  };
});
