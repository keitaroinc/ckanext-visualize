/* This CKAN module handles the creation of the Data Viewer. Data is rendered
on a chart based on the resource that has been provided. The resource must be
uploaded to DataStore. */

ckan.module('visualize-data', function($) {
  if (document.getElementById('chart-canvas')) {
    var colorPalette = [];
    var CHART_TYPES = {
      BAR: 'bar',
      LINE: 'line',
      POINT: 'scatter'
    };
    var currentChartType = 'bar';
    var currentxAxisType = '';
    var currentyAxisType = '';
    var currentxAxis = '';
    var currentyAxis = '';
    var currentColorAttr = '';
    var chart;
    var chartData = {
      labels: [],
      datasets: [
        {
          label: '',
          data: [],
          fill: false
        }
      ]
    };
    var columns = {};
    var ctx = document.getElementById('chart-canvas').getContext('2d');
    var chartContainer = $('.chart-container');
    var noChartContainer = $('.no-chart-container');
    var unsupportedContainer = $('.chart-unsupported');
    var isSupported = true;
    var xAxisList = $('.x-axis-list');
    var yAxisList = $('.y-axis-list');
    var chartIcon = $('#chart-icon');
    var xAxisHiddenInput = $('input[name="visualize_x_axis"]');
    var yAxisHiddenInput = $('input[name="visualize_y_axis"]');
    var colorAttrHiddenInput = $('input[name="visualize_color_attr"]');
    var lastxAxisEvent;
    var lastyAxisEvent;
    var lastColorAttrEvent;
    var barChartIcon;
    var lineChartIcon;
    var pointChartIcon;
    function getUniqueValues(arr) {
      if (isIE()) {
        var a = [];
        for (var i = 0, l = arr.length; i < l; i++)
          if (a.indexOf(arr[i]) === -1 && arr[i] !== '') a.push(arr[i]);
        return a;
      } else {
        var set = new Set(arr);
        var arr = [];
        set.forEach(function(item) {
          arr.push(item);
        });
        return arr;
      }
    }
  }

  function isIE() {
    var ua = window.navigator.userAgent;
    return /MSIE|Trident/.test(ua);
  }

  function initChart(xAxisType) {
    var chartOptions = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
            }
          }
        ]
      },
      legend: {
        position: 'bottom',
        display: true
      }
    };

    // Use different options for timestamps:
    if (xAxisType) {
      if (xAxisType == 'timestamp') {
        chartOptions.scales.xAxes = [
          {
            type: "time",
            ticks: {
              maxTicksLimit: 8,
              maxRotation: 0,
              minRotation: 0
            }
          }
        ]
      }
    }

    chartData.datasets[0].backgroundColor = colorPalette[0];
    chartData.datasets[0].borderColor = colorPalette[0];

    if (currentColorAttr && currentChartType === CHART_TYPES.BAR) {
      chartOptions.scales.yAxes[0].stacked = true;
      chartOptions.scales.xAxes[0].stacked = true;
    }

    if(!currentColorAttr || (currentColorAttr && currentxAxis && !currentyAxis) || (currentColorAttr && !currentxAxis && currentyAxis)) {
      chartOptions.legend.display = false;
    }

    chart = new Chart(ctx, {
      type: currentChartType,
      data: chartData,
      options: chartOptions
    });
    updateChartIcon();
  }

  function updateChartIcon() {
    if (currentChartType === 'bar') {
      chartIcon.attr('src', barChartIcon);
    } else if (currentChartType === 'line') {
      chartIcon.attr('src', lineChartIcon);
    } else if (currentChartType === 'scatter') {
      chartIcon.attr('src', pointChartIcon);
    }
  }

  function getChartType(xAxisType, yAxisType) {
    if (
      (xAxisType === 'date' || xAxisType === 'timestamp') &&
      yAxisType === 'numeric'
    ) {
      return CHART_TYPES.LINE;
    } else if (xAxisType === 'numeric' && yAxisType === 'numeric') {
      return CHART_TYPES.POINT;
    } else if (
      xAxisType === 'numeric' ||
      xAxisType === 'text' ||
      xAxisType === 'date' ||
      xAxisType === 'numeric' ||
      xAxisType === 'text' ||
      yAxisType === 'text' ||
      yAxisType === 'numeric' ||
      yAxisType === 'date' ||
      (xAxisType === 'numeric' && yAxisType === 'text') ||
      (xAxisType === 'text' && yAxisType === 'numeric')
    ) {
      return CHART_TYPES.BAR;
    }
  }

  function isSupportedGraphType(xAxisType, yAxisType) {
    if (
      // Unsupported graph types
      (xAxisType === "text" && yAxisType === "text") ||
      (xAxisType === ("timestamp" || "date") &&
        yAxisType === ("timestamp" || "date")) ||
      (xAxisType === "text" &&
        yAxisType === ("timestamp" || "date")) ||
      (xAxisType === ("timestamp" || "date") &&
        yAxisType === "text") ||
      (xAxisType === "numeric" &&
        yAxisType === ("timestamp" || "date"))
    ) {
      return false;
    } else return true;
  }

  return {
    initialize: function() {
      var resourceView = this.options.resourceView;
      var resource = {
        id: this.options.resourceId,
        endpoint: this.sandbox.client.endpoint + '/api'
      };
      colorPalette = this.options.colorPalette;

      if (this.options.barChartIcon.indexOf('http') > -1) {
        barChartIcon = this.options.barChartIcon;
      } else if (this.options.barChartIcon.indexOf('/base/images') > -1) {
        barChartIcon = window.ckan.SITE_ROOT + this.options.barChartIcon;
      } else {
        barChartIcon =
          window.ckan.SITE_ROOT +
          '/uploads/chart_icons/' +
          this.options.barChartIcon;
      }

      if (this.options.lineChartIcon.indexOf('http') > -1) {
        lineChartIcon = this.options.lineChartIcon;
      } else if (this.options.lineChartIcon.indexOf('/base/images') > -1) {
        lineChartIcon = window.ckan.SITE_ROOT + this.options.lineChartIcon;
      } else {
        lineChartIcon =
          window.ckan.SITE_ROOT +
          '/uploads/chart_icons/' +
          this.options.lineChartIcon;
      }

      if (this.options.pointChartIcon.indexOf('http') > -1) {
        pointChartIcon = this.options.pointChartIcon;
      } else if (this.options.pointChartIcon.indexOf('/base/images') > -1) {
        pointChartIcon = window.ckan.SITE_ROOT + this.options.pointChartIcon;
      } else {
        pointChartIcon =
          window.ckan.SITE_ROOT +
          '/uploads/chart_icons/' +
          this.options.pointChartIcon;
      }

      var filters = resourceView.filters || [];
      var queryParams = {
        filters: [],
        sort: [],
        size: 100000
      };

      $.each(filters, function(field, values) {
        queryParams.filters.push({ type: 'term', field: field, term: values });
      });

      this.fetchData(
        resource,
        queryParams,
        this.prepareDataForChart.bind(this)
      );
    },
    fetchData: function(resource, queryParams, callback) {
      $.when(
        recline.Backend.Ckan.fetch(resource),
        recline.Backend.Ckan.query(queryParams, resource)
      ).done(function(fetch, query) {
        callback({ fields: fetch.fields, hits: query.hits });
      });
    },
    prepareDataForChart: function(data) {
      $.each(data.fields, function(i, item) {
        if (item.id !== '_id') {
          columns[item.id] = [];
        }
      });

      $.each(data.hits, function(i, item) {
        $.each(item, function(field, value) {
          if (field !== '_id') {
            columns[field].push(value);
          }
        });
      });

      this.drawChart();
    },
    drawChart: function() {
      var xAxisType = null
      initChart(xAxisType);
      this.initDragging(columns);
    },
    initDragging: function(columns) {
      Sortable.create(document.getElementById('all-columns'), {
        group: {
          name: 'columns',
          pull: 'clone',
          put: ['x-axis', 'y-axis', 'color-attr']
        },
        animation: 150
      });

      Sortable.create(document.getElementById('x-axis'), {
        group: {
          name: 'x-axis',
          put: function(to) {
            return to.el.children.length <= 1;
          }
        },
        animation: 150,
        onAdd: function onAdd(evt) {
          onColumnAdd(evt);
        },
        onRemove: function onRemove(evt) {
          onColumnRemove(evt);
        }
      });

      Sortable.create(document.getElementById('y-axis'), {
        group: {
          name: 'y-axis',
          put: function(to) {
            return to.el.children.length <= 1;
          }
        },
        animation: 150,
        onAdd: function onAdd(evt) {
          onColumnAdd(evt);
        },
        onRemove: function onRemove(evt) {
          onColumnRemove(evt);
        }
      });

      Sortable.create(document.getElementById('color-attr'), {
        group: {
          name: 'color-attr',
          put: function(to) {
            return to.el.children.length <= 1;
          }
        },
        animation: 150,
        onAdd: function onAdd(evt) {
          onColumnAdd(evt);
        },
        onRemove: function onRemove(evt) {
          onColumnRemove(evt);
        }
      });

      function onColumnAdd(evt) {
        var item = $(evt.item);
        var column = item.attr('data-column');
        var columnType = item.attr('data-column-type');
        var to = $(evt.to).attr('id');
        unsupportedContainer.addClass('hidden');
        isSupported = true;
        if(to === 'y-axis') {
          lastyAxisEvent = { item: evt.item, to: evt.to };
          currentyAxisType = columnType;
          currentyAxis = column;
        }
        if(to === 'x-axis') {
          lastxAxisEvent = { item: evt.item, to: evt.to };
          currentxAxisType = columnType;
          currentxAxis = column;
        }
        isSupported = isSupportedGraphType(currentxAxisType, currentyAxisType);
        if(!isSupported) {
          chartContainer.addClass('hidden');
          noChartContainer.removeClass('hidden');
          unsupportedContainer.removeClass('hidden');
        }
        if (columns[column] && isSupported) {
          if (to === 'x-axis') {
            currentxAxisType = columnType;
            currentxAxis = column;
            currentChartType =
              getChartType(currentxAxisType, currentyAxisType) || 'bar';
            if (currentChartType === CHART_TYPES.POINT) {
              if (chartData.datasets[0].data.length === 0) {
                chartData.datasets[0].data = columns[currentxAxis].map(function(
                  num
                ) {
                  return {
                    x: num
                  };
                });
                chartData.datasets[0].data = columns[currentyAxis].map(function(
                  num,
                  i
                ) {
                  return $.extend({}, chartData.datasets[0].data[i], {
                    y: num
                  });
                });
              } else {
                chartData.datasets[0].data = columns[currentxAxis].map(function(
                  num,
                  i
                ) {
                  return $.extend({}, chartData.datasets[0].data[i], {
                    x: num
                  });
                });
                chartData.datasets[0].data = columns[currentyAxis].map(function(
                  num,
                  i
                ) {
                  return $.extend({}, chartData.datasets[0].data[i], {
                    y: num
                  });
                });
              }
            } else {
              // Extract the unique values from the selected column
              var unique = getUniqueValues(columns[column]);
              $.each(unique, function(i, item) {
                chartData.labels.push(item);
              });

              if (currentyAxis) {
                // Extract the unique values from the x-axis column
                var uniqueLabels = getUniqueValues(columns[currentxAxis]);
                var dict = [];
                for(var label in uniqueLabels) {
                  dict.push({
                    key: uniqueLabels[label],
                    value: 0
                  })
                }
                for (var i = 0; i < columns[currentxAxis].length; i++) {
                  for(var k in dict) {
                    if (dict[k].key === columns[currentxAxis][i]) {                       
                      dict[k].value = columns[currentyAxis][i];
                    }
                  }   
                }
                for(var k in dict) {
                  chartData.datasets[0].data.push(dict[k].value)
                }
              }

              if (currentyAxis && lastColorAttrEvent) {
                onColumnAdd(lastColorAttrEvent);
              }
            }

            chart.destroy();
            initChart(currentxAxisType);

            chartContainer.removeClass('hidden');
            noChartContainer.addClass('hidden');

            xAxisHiddenInput.val(currentxAxis);
          } else if (to === 'y-axis') {
            currentyAxisType = columnType;
            currentyAxis = column;
            currentChartType =
              getChartType(currentxAxisType, currentyAxisType) || 'bar';

            if (currentChartType === CHART_TYPES.POINT) {
              if (chartData.datasets[0].data.length === 0) {
                chartData.datasets[0].data = columns[currentxAxis].map(function(
                  num
                ) {
                  return {
                    x: num
                  };
                });
                chartData.datasets[0].data = columns[currentyAxis].map(function(
                  num,
                  i
                ) {
                  return $.extend({}, chartData.datasets[0].data[i], {
                    y: num
                  });
                });
              } else {
                chartData.datasets[0].data = columns[currentxAxis].map(function(
                  num,
                  i
                ) {
                  return $.extend({}, chartData.datasets[0].data[i], {
                    x: num
                  });
                });
                chartData.datasets[0].data = columns[currentyAxis].map(function(
                  num,
                  i
                ) {
                  return $.extend({}, chartData.datasets[0].data[i], {
                    y: num
                  });
                });
              }
            } else {
              if (currentxAxis) {
                // Extract the unique values from the x-axis column
                var uniqueLabels = getUniqueValues(columns[currentxAxis]);
                var dict = [];
                for(var label in uniqueLabels) {
                  dict.push({
                    key: uniqueLabels[label],
                    value: 0
                  })
                }
                for (var i = 0; i < columns[currentxAxis].length; i++) {
                  for(var k in dict) {
                    if (dict[k].key === columns[currentxAxis][i]) {
                      dict[k].value = columns[currentyAxis][i];
                    }
                  }
                }
                for(var k in dict) {
                  chartData.datasets[0].data.push(dict[k].value)
                }
              }
              if (currentxAxis && lastColorAttrEvent) {
                onColumnAdd(lastColorAttrEvent);
              }
            }
            chart.destroy();
            initChart(currentxAxisType);

            chartContainer.removeClass('hidden');
            noChartContainer.addClass('hidden');

            yAxisHiddenInput.val(currentyAxis);
          } else if (to === 'color-attr') {
            currentColorAttr = column;
            lastColorAttrEvent = { item: evt.item, to: evt.to };

            if (currentxAxis && currentyAxis) {
              if (currentChartType === CHART_TYPES.BAR) {
                chartData.datasets = [];

                // Extract the unique values from the selected column
                var uniqueLabels = getUniqueValues(columns[column]);

                var valuesMapping = {};
                uniqueLabels.forEach(function(label, i) {
                  valuesMapping[label] = [];
                });

                var currentIndex = 0;

                columns[column].forEach(function(value, i) {
                  valuesMapping[value].push(1);
                });

                var colorsIndex = 0;

                uniqueLabels.forEach(function(label, i) {
                  var currentColor = colorPalette[i];

                  if (!currentColor) {
                    currentColor = colorPalette[colorsIndex];
                    if (!currentColor) {
                      currentIndex = 0;
                      currentColor = colorPalette[colorsIndex];
                    } else {
                      colorsIndex++;
                    }
                  }
                  chartData.datasets.push({
                    label: label,
                    backgroundColor: currentColor,
                    data: valuesMapping[label]
                  });
                });
              } else if (currentChartType === CHART_TYPES.POINT) {
                var colors = [];

                // Extract the unique values from the selected column
                var unique = getUniqueValues(columns[column]);

                var columnColorsMapping = {};
                var colorsIndex = 0;

                // For each value assign a color
                unique.forEach(function(value, i) {
                  var currentColor = colorPalette[i];

                  if (!currentColor) {
                    currentColor = colorPalette[colorsIndex];
                    if (!currentColor) {
                      currentIndex = 0;
                      currentColor = colorPalette[colorsIndex];
                    } else {
                      colorsIndex++;
                    }
                  }

                  columnColorsMapping[value] = currentColor;
                });

                columns[column].forEach(function(value) {
                  colors.push(columnColorsMapping[value]);
                });
                chartData.datasets[0].backgroundColor = colors;
              } else if (currentChartType === CHART_TYPES.LINE) {
                // Extract the unique values from the selected column
                var unique = getUniqueValues(columns[column]);

                var columnColorsMapping = {};
                var colorsIndex = 0;

                // For each value assign a color
                unique.forEach(function(value, i) {
                  var currentColor = colorPalette[i];

                  if (!currentColor) {
                    currentColor = colorPalette[colorsIndex];
                    if (!currentColor) {
                      currentIndex = 0;
                      currentColor = colorPalette[colorsIndex];
                    } else {
                      colorsIndex++;
                    }
                  }

                  columnColorsMapping[value] = currentColor;
                });

                chartData.datasets = [];
                var uniqueLabels = getUniqueValues(columns[currentxAxis]);
                chartData.labels = uniqueLabels;
                var currentIndex = 0;

                for (var key in columnColorsMapping) {
                  var dataset = {
                    label: key,
                    data: [],
                    backgroundColor: columnColorsMapping[key],
                    borderColor: columnColorsMapping[key],
                    fill: false
                  };
                  for (var i = 0; i < uniqueLabels.length; i++) {
                    dataset.data.push(columns[currentyAxis][currentIndex]);
                    currentIndex++;
                  }
                  uniqueLabels.forEach(function(label) {});
                  chartData.datasets.push(dataset);
                }
              }
            }

            colorAttrHiddenInput.val(column);

            chart.destroy();
            initChart(currentxAxisType);
          }

          chart.update();
        }
      }

      function onColumnRemove(evt) {
        var item = $(evt.item);
        var column = item.attr('data-column');
        var from = $(evt.from).attr('id');
        unsupportedContainer.addClass('hidden');
        if (columns[column]) {
          if (from === 'x-axis') {
            chartData.labels = [];
            chartData.datasets[0].data = [];
            currentxAxisType = null;
            currentxAxis = null;
            if (yAxisList.find('li').length === 0) {
              chartContainer.addClass('hidden');
              noChartContainer.removeClass('hidden');
            }
            xAxisHiddenInput.val('');
          } else if (from === 'y-axis') {
            chartData.datasets[0].data = [];
            currentyAxisType = null;
            currentyAxis = null;
            if (xAxisList.find('li').length === 0) {
              chartContainer.addClass('hidden');
              noChartContainer.removeClass('hidden');
            }
            yAxisHiddenInput.val('');
          } else if (from === 'color-attr') {
            chartData = {
              labels: [],
              datasets: [
                {
                  label: '',
                  data: [],
                  fill: false
                }
              ]
            };

            currentColorAttr = null;
            lastColorAttrEvent = null;

            chart.destroy();
            initChart(currentxAxisType);

            if (currentxAxis) {
              onColumnAdd(lastxAxisEvent);
            }

            if (currentyAxis) {
              onColumnAdd(lastyAxisEvent);
            }

            colorAttrHiddenInput.val('');
          }
          currentChartType =
            getChartType(currentxAxisType, currentyAxisType) || 'bar';
          item.remove();
          chart.update();
        }
      }

      this.drawChartFromPredefinedView(onColumnAdd);
    },
    drawChartFromPredefinedView: function(onColumnAdd) {
      var xAxisColumn = this.options.resourceView.visualize_x_axis;
      var yAxisColumn = this.options.resourceView.visualize_y_axis;
      var colorAttr = this.options.resourceView.visualize_color_attr;

      if (xAxisColumn) {
        var item = $('div[data-column="' + xAxisColumn + '"]');
        var to = $('#x-axis');
        const payload = { item: item[0], to: to[0] };
        item.clone().appendTo(to);
        onColumnAdd(payload);
      }

      if (yAxisColumn) {
        var item = $('div[data-column="' + yAxisColumn + '"]');
        var to = $('#y-axis');
        const payload = { item: item[0], to: to[0] };
        item.clone().appendTo(to);
        onColumnAdd(payload);
      }

      if (colorAttr) {
        var item = $('div[data-column="' + colorAttr + '"]');
        var to = $('#color-attr');
        const payload = { item: item[0], to: to[0] };
        item.clone().appendTo(to);
        onColumnAdd(payload);
      }
    }
  };
});
