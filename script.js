var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var y = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .1, 1);

var x = d3.scale.linear()
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(formatPercent);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data.tsv", function(error, data) {

  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });

  y.domain(data.map(function(d) { return d.letter; }));
  x.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("transform", "translate(" + (width - 95) + ",-5)")
      .text("Frequency");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Letter");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return y(d.letter); })
      .attr("height", y.rangeBand())
      .attr("x", function(d) { return 0; })
      .attr("width", function(d) { return x(d.frequency); });

  d3.select("input").on("change", change);

  function change() {

    // Copy-on-write since tweens are evaluated after a delay.
    var y0 = y.domain(data.sort(this.checked
        ? function(a, b) { return b.frequency - a.frequency; }
        : function(a, b) { return d3.ascending(a.letter, b.letter); })
        .map(function(d) { return d.letter; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return y0(a.letter) - y0(b.letter); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("y", function(d) { return y0(d.letter); });

    transition.select(".y.axis")
        .call(yAxis)
      .selectAll("g")
        .delay(delay);
  }
});

function color_change() {
    var percent = document.body.scrollTop /
                  (document.documentElement.scrollHeight -
                  document.documentElement.clientHeight); 
    var color =  'rgb(' + Math.floor(255 * percent).toString() + ','
                 + Math.floor(255 * (1.0 - percent)).toString()+ ',' + '0)';

    d3.selectAll(".bar").style('fill', color);
}

window.onscroll = color_change;

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}
