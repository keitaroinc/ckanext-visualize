/* This CKAN module handles adding a color from the admin settings. */

ckan.module('visualize-colors-settings-add', function ($) {
  return {
    initialize: function () {
      var colorPallet = $('#color-pallete');
      var inputGroup = [
        '<div class="color-input">',
        '<div class="form-group item-color">',
        '<label class="control-label" for="color_$id$">Color #$id$</label>',
        '<div class="controls">',
        '<input id="color_$id$" type="color" name="color_$id$" value="#000000" placeholder="" class="form-control">',
        '</div>',
        '</div>',
        '<button class="btn btn-sm btn-default color-remove" type="button">',
        '<i class="fa fa-times"></i>',
        '</button>',
        '</div>'
      ].join('');
      var colorsContainer = $('#color-pallete');

      this.el.on('click', function (e) {
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
