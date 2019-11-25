/* This CKAN module handles the creation of the Data Viewer. Data is rendered
on a chart based on the resource that has been provided. The resource must be
uploaded to DataStore. */

ckan.module('visualize-data', function($) {
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
  var chart;
  var chartData = {
    labels: [],
    datasets: [
      {
        label: 'Some dataset label',
        data: [],
        fill: false
      }
    ]
  };
  var columns = {};
  var ctx = document.getElementById('chart-canvas').getContext('2d');
  var chartContainer = $('.chart-container');
  var noChartContainer = $('.no-chart-container');
  var xAxisList = $('.x-axis-list');
  var yAxisList = $('.y-axis-list');
  var chartIcon = $('#chart-icon');
  var lastxAxisEvent;
  var lastyAxisEvent;

  function initChart() {
    chartData.datasets[0].backgroundColor = colorPalette[0];
    chartData.datasets[0].borderColor = colorPalette[0];
    chart = new Chart(ctx, {
      type: currentChartType,
      data: chartData,
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          position: 'bottom'
        }
      }
    });
    updateChartIcon();
  }

  function updateChartIcon() {
    if (currentChartType === 'bar') {
      chartIcon.attr('src', '/base/images/Bar-symbol.png');
    } else if (currentChartType === 'line') {
      chartIcon.attr('src', '/base/images/Line-symbol.png');
    } else if (currentChartType === 'scatter') {
      chartIcon.attr('src', '/base/images/Point-symbol.png');
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

  return {
    initialize: function() {
      var resourceView = this.options.resourceView;
      var resource = {
        id: this.options.resourceId,
        endpoint: this.sandbox.client.endpoint + '/api'
      };
      colorPalette = this.options.colorPalette;
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
      initChart();
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
        if (columns[column]) {
          if (to === 'x-axis') {
            lastxAxisEvent = { item: evt.item, to: evt.to };
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
              var unique = columns[column].filter(
                (v, i, a) => a.indexOf(v) === i
              );
              $.each(unique, function(i, item) {
                chartData.labels.push(item);
              });
            }
            chart.destroy();
            initChart();

            chartContainer.removeClass('hidden');
            noChartContainer.addClass('hidden');
          } else if (to === 'y-axis') {
            lastyAxisEvent = { item: evt.item, to: evt.to };
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
              // Extract the unique values from the x-axis column
              var uniqueLabels = columns[currentxAxis].filter(
                (v, i, a) => a.indexOf(v) === i
              );
              var j = 0;
              $.each(uniqueLabels, function(x, label) {
                var countRows = 0;
                for (var i = j; i < columns[currentxAxis].length; i++) {
                  if (label === columns[currentxAxis][i]) {
                    countRows++;
                  } else {
                    chartData.datasets[0].data.push(countRows);
                    countRows = 0;
                    j = i;
                    break;
                  }

                  if (i === columns[currentxAxis].length - 1) {
                    chartData.datasets[0].data.push(countRows);
                  }
                }
              });
            }
            chart.destroy();
            initChart();

            chartContainer.removeClass('hidden');
            noChartContainer.addClass('hidden');
          } else if (to === 'color-attr') {
            if (
              currentChartType === CHART_TYPES.BAR ||
              currentChartType === CHART_TYPES.POINT
            ) {
              var colors = [];

              // Extract the unique values from the selected column
              var unique = columns[column].filter(
                (v, i, a) => a.indexOf(v) === i
              );

              var columnColorsMapping = {};
              var colorsIndex = 0;

              // For each value assign a color
              unique.forEach(function(value, i) {
                var currentColor = colorPalette[i];

                if (!currentColor) {
                  currentColor = colorPalette[colorsIndex];
                  colorsIndex++;
                }

                columnColorsMapping[value] = currentColor;
              });

              columns[column].forEach(function(value) {
                colors.push(columnColorsMapping[value]);
              });
              chartData.datasets[0].backgroundColor = colors;
            } else {
              // Extract the unique values from the selected column
              var unique = columns[column].filter(
                (v, i, a) => a.indexOf(v) === i
              );

              var columnColorsMapping = {};
              var colorsIndex = 0;

              // For each value assign a color
              unique.forEach(function(value, i) {
                var currentColor = colorPalette[i];

                if (!currentColor) {
                  currentColor = colorPalette[colorsIndex];
                  colorsIndex++;
                }

                columnColorsMapping[value] = currentColor;
              });

              chartData.datasets = [];
              var uniqueLabels = columns[currentxAxis].filter(
                (v, i, a) => a.indexOf(v) === i
              );

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
          chart.update();
        }
      }

      function onColumnRemove(evt) {
        var item = $(evt.item);
        var column = item.attr('data-column');
        var from = $(evt.from).attr('id');
        if (columns[column]) {
          if (from === 'x-axis') {
            chartData.labels = [];
            currentxAxisType = null;
            currentxAxis = null;
            if (yAxisList.find('li').length === 0) {
              chartContainer.addClass('hidden');
              noChartContainer.removeClass('hidden');
            }
          } else if (from === 'y-axis') {
            chartData.datasets[0].data = [];
            currentyAxisType = null;
            currentyAxis = null;
            if (xAxisList.find('li').length === 0) {
              chartContainer.addClass('hidden');
              noChartContainer.removeClass('hidden');
            }
          } else if (from === 'color-attr') {
            chartData = {
              labels: [],
              datasets: [
                {
                  label: 'Some dataset label',
                  data: [],
                  fill: false
                }
              ]
            };

            chart.destroy();
            initChart();

            onColumnAdd(lastxAxisEvent);
            onColumnAdd(lastyAxisEvent);
          }
          currentChartType =
            getChartType(currentxAxisType, currentyAxisType) || 'bar';
          item.remove();
          chart.update();
        }
      }
    }
  };
});
