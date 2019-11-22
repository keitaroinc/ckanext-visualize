/* This CKAN module handles resetting colors to default from the admin settings. */

ckan.module('visualize-colors-settings-reset', function($) {
  return {
    initialize: function() {
      var DEFAULT_COLORS = [
        '#332288',
        '#117733',
        '#44aa99',
        '#88ccee',
        '#ddcc77',
        '#cc6677',
        '#aa4499',
        '#882255',
        '#dd4444'
      ];
      var inputGroup = [
        '<div class="color-input">',
        '<div class="form-group item-color">',
        '<label class="control-label" for="color_$id$">Color #$id$</label>',
        '<div class="controls">',
        '<input id="color_$id$" type="color" name="color_$id$" value="$color$" placeholder="" class="form-control">',
        '</div>',
        '</div>',
        '<button class="btn btn-sm btn-default color-remove" type="button">',
        '<i class="fa fa-times"></i>',
        '</button>',
        '</div>'
      ].join('');
      var colorsContainer = $('#color-pallete');
      this.el.on('click', function(e) {
        colorsContainer.html('');

        DEFAULT_COLORS.forEach(function(color, i) {
          colorsContainer.append(
            inputGroup
              .replace(new RegExp('\\$id\\$', 'g'), i + 1)
              .replace(new RegExp('\\$color\\$', 'g'), color)
          );
        });
      });
    }
  };
});
