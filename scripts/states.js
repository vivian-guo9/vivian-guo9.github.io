/*var width = 960;
var height = 500;
console.log("script");
var projection = d3.geoAlbersUsa()
            .translate([width/2, height/2])
            .scale([width * 1.36]);
var us = d3.select("#usmap")

var path = d3.geoPath().projection(projection);

var legendText = ["Republican", "Democratic"];
var pathgroup = us.append("g")
            .attr("id", "path");

d3.json("../data/us-states.json", function(json) {
	pathgroup.selectAll("path")
	.data(json.features)
	.enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
	.style("stroke-width", "1");
});
*/
console.log("script2");
var svg = d3.select("#usmap");

var path = d3.geoPath();

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path);

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
});

