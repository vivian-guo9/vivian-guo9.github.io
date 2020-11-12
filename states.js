var path = d3.geoPath();
let usmap = d3.select("#usmap")

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  usmap.append("g")
      .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path);

  usmap.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
});

