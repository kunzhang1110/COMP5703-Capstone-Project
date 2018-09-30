// TODO add animation

google.load('visualization', '1.1', {
    'packages': ['gauge']
});
google.setOnLoadCallback(drawStuff);


    var gaugeOptions = {min: 0, max: 100, yellowFrom: 0, yellowTo: 10,
  };

function drawStuff() {
  // Create and populate the data table.
  var data = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Early', 10],
    ['CPU', 55],
    ['Network', 68]
  ]);
var formatter = new google.visualization.NumberFormat(
    {suffix: '%',pattern:'#'}
);
    formatter.format(data,1);
  // Create and draw the visualization.
  new google.visualization.Gauge(document.getElementById('chart_div')).
      draw(data,gaugeOptions);
};
