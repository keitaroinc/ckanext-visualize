/* This CKAN module handles the creation of the Data Viewer. Data is rendered
on a chart based on the resource that has been provided. The resource must be
uploaded to DataStore. */

ckan.module('visualize-data', function($) {
  var colorPalette = [];
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
      var columns = {};

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

      this.drawChart(columns);
    },
    drawChart: function(columns) {
      var barChartData = {
        labels: [],
        datasets: [
          {
            label: 'Some dataset label',
            data: [],
            backgroundColor: colorPalette[0]
          }
        ]
      };

      var ctx = document.getElementById('barChart').getContext('2d');

      var barChart = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
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

      this.initDragging(barChart, barChartData, columns);
    },
    initDragging: function(chart, data, columns) {
      Sortable.create(document.getElementById('all-columns'), {
        group: {
          name: 'columns',
          pull: 'clone',
          put: ['x-axis', 'y-axis', 'colour-attr']
        },
        animation: 150
      });

      Sortable.create(document.getElementById('x-axis'), {
        group: {
          name: 'x-axis',
          put: ['columns']
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
          put: ['columns']
        },
        animation: 150,
        onAdd: function onAdd(evt) {
          onColumnAdd(evt);
        },
        onRemove: function onRemove(evt) {
          onColumnRemove(evt);
        }
      });

      Sortable.create(document.getElementById('colour-attr'), {
        group: {
          name: 'colour-attr',
          put: ['columns']
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
        var to = $(evt.to).attr('id');
        if (columns[column]) {
          if (to === 'x-axis') {
            $.each(columns[column], function(i, item) {
              data.labels.push(item);
            });
          } else if (to === 'y-axis') {
            $.each(columns[column], function(i, item) {
              data.datasets[0].data.push(item);
            });
          } else if (to === 'colour-attr') {
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
            data.datasets[0].backgroundColor = colors;
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
            data.labels = [];
          } else if (from === 'y-axis') {
            data.datasets[0].data = [];
          } else if (from === 'colour-attr') {
            data.datasets[0].backgroundColor = colorPalette[0];
          }
          item.remove();
          chart.update();
        }
      }
    }
  };
});
