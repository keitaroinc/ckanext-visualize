/* This CKAN module handles showing image preview when choosing an image for chart type. */

ckan.module('visualize-chart-type', function($) {
  return {
    initialize: function() {
      var chartType = this.options.type;
      var chartUpload = this.el.find(
        'input[name="' + chartType + '_chart_upload"]'
      );
      $(chartUpload).on('change', function(e) {
        var input = this;
        var url = $(this).val();
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (
          input.files &&
          input.files[0] &&
          (ext == 'svg' || ext == 'png' || ext == 'jpeg' || ext == 'jpg')
        ) {
          var reader = new FileReader();
          var img = $('#' + chartType + '-chart-icon').find('img');

          reader.onload = function(e) {
            img.attr('src', e.target.result);
          };
          reader.readAsDataURL(input.files[0]);
        } else {
          alert('You must provide an image in SVG, PNG, JPG or JPEG format.');
        }
      });
    }
  };
});
