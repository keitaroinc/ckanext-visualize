/*
Copyright (c) 2019 Keitaro AB

Use of this source code is governed by an MIT license
that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
*/

/* This CKAN module handles setting the chart type icon to the default one. */

ckan.module('visualize-chart-icon-reset', function($) {
  return {
    initialize: function() {
      var chartType = this.options.type;
      var chartIconImage = $('#' + chartType + '-chart-icon').find('img');
      var chartInput = $('input[name="' + chartType + '_chart"]');
      var imageURL = null;

      if (chartType === 'bar') {
        imageURL = '/base/images/Bar-symbol.png';
      } else if (chartType === 'line') {
        imageURL = '/base/images/Line-symbol.png';
      } else if (chartType === 'point') {
        imageURL = '/base/images/Point-symbol.png';
      }

      this.el.on('click', function(e) {
        chartIconImage.attr('src', imageURL);
        chartInput.val(imageURL);
      });
    }
  };
});

