ckan.module('visualize-data', function($) {
  return {
    initialize: function() {
      var resourceView = this.options.resourceView;
      var resource = {
        id: this.options.resourceId,
        endpoint: this.sandbox.client.endpoint + '/api'
      };
      var filters = resourceView.filters || [];
      var queryParams = {
        filters: [],
        sort: [],
        size: 100
      };

      $.each(filters, function(field, values) {
        queryParams.filters.push({ type: 'term', field: field, term: values });
      });

      $.when(
        recline.Backend.Ckan.fetch(resource),
        recline.Backend.Ckan.query(queryParams, resource)
      ).done(function(fetch, query) {
        var barChartData = {
          labels: [],
          datasets: [
            {
              label: 'Some dataset label',
              data: [],
              backgroundColor: [
                '#332288',
                '#117733',
                '#44AA99',
                '#88CCEE',
                '#DDCC77',
                '#CC6677',
                '#AA4499',
                '#882255'
              ]
            }
          ]
        };

        var columns = {};

        $.each(fetch.fields, function(i, item) {
          if (item.id !== '_id') {
            columns[item.id] = [];
          }
        });

        $.each(query.hits, function(i, item) {
          $.each(item, function(field, value) {
            if (field !== '_id') {
              columns[field].push(value);
            }
          });
        });

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
          animation: 150
        });

        function onColumnAdd(evt) {
          var item = $(evt.item);
          var column = item.attr('data-column');
          var to = $(evt.to).attr('id');
          if (columns[column]) {
            if (to === 'x-axis') {
              barChartData.labels.push(...columns[column]);
            } else if (to === 'y-axis') {
              barChartData.datasets[0].data.push(...columns[column]);
            }
            barChart.update();
          }
        }

        function onColumnRemove(evt) {
          var item = $(evt.item);
          var column = item.attr('data-column');
          var from = $(evt.from).attr('id');
          if (columns[column]) {
            if (from === 'x-axis') {
              barChartData.labels = [];
            } else if (from === 'y-axis') {
              barChartData.datasets[0].data = [];
            }
            item.remove();
            barChart.update();
          }
        }
      });
    }
  };
});
