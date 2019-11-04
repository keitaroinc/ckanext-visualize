$(document).ready(function() {
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

})
