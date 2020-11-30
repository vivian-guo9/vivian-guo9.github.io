function initData(covid){
	var lineData = [];
	var timeParse = d3.timeParse("%m/%d/%Y");
	var dateFormat = d3.timeFormat("%m/%d/%Y");
	var start = timeParse(covid[0].submission_date);
	var end = timeParse(covid[covid.length-1].submission_date);
	var curr = start;
	var k = 0;
	while(curr < end){
		var date = dateFormat(curr);
		var data = covid.filter(function(d){return d.submission_date == date});
		var total = 0;
		for(var i =0; i < data.length; i++){
			total = +total + +data[i].tot_cases;
		}
		date = timeParse(date);
		lineData[k] = {date,total};
		k++;
		curr.setDate(curr.getDate()+1);
	}
	return lineData;
}

d3.csv("../data/COVID-19_Cases.csv",function(covid){
		var data = initData(covid);
		console.log(data);
		var margin = {top:30, left:60, bottom:10, right:30};
		var width = 500 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;

		var line = d3.select("#total");		
		var x = d3.scaleTime().range([0,width]);
		var y = d3.scaleLinear().range([height,0]);

		var lineGraph = d3.line()
		.x(function(d){return x(d.date)})
		.y(function(d){return y(d.total)});

		x.domain(d3.extent(data, function(d){ return d.date}));
		y.domain([0,d3.max(data,function(d){return +d.total})]);

		line
		.style("width", "600px")
		.style("height", "500px")

		line.append("g")
		.attr("transform", "translate(" + margin.left+ "," + height + ")")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

		line.append("g")
			.attr("transform", "translate(" + margin.left + ",0)")	
			.call(d3.axisLeft(y));

		line.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "#69b3a2")
			.attr("stroke-width", 2)
			.attr("transform", "translate(" + margin.left + ",0)")
			.attr("d", lineGraph)

			var focus = line.append("g")
			.attr("class", "focus")
			.style("display", "none");

		focus.append("circle")
			.attr("transform", "translate(" + margin.left + ",0)")
			.attr("r", 3);


		focus.append("rect")
			.attr("class", "tooltip")
			.attr("transform", "translate(" + margin.left + ",0)")
			.attr("width", 110)
			.attr("height", 50)
			.attr("x", 10)
			.attr("y", -22)
			.attr("rx", 4)
			.attr("ry", 4)
			.style("fill", "white")
			.style("opacity", "1");

		focus.append("text")
			.attr("transform", "translate(" + margin.left + ",0)")
			.attr("class", "tooltip-date")
			.attr("x", 18)
			.attr("y", -2);

		focus.append("text")
			.attr("transform", "translate(" + margin.left + ",0)")
			.attr("x", 18)
			.attr("y", 18)
			.text("Cases:");

		focus.append("text")
			.attr("transform", "translate(" + margin.left + ",0)")
			.attr("class", "tooltip-cases")
			.attr("x", 55)
			.attr("y", 18);

		line.append("rect")
			.attr("class", "overlay")
			.attr("width", width)
			.attr("height",height)
			.attr("transform", "translate(" + margin.left + ",0)")
			.on("mouseover", function() { focus.style("display", null); })
			.on("mouseout", function() { focus.style("display", "none"); })
			.on("mousemove", mousemove);

		var formatValue = d3.format(",");
		var dateFormatter = d3.timeFormat("%m/%d/%y");
		const bisectDate = d3.bisector(d => d.date).left;

		function mousemove() {
			var x0 = x.invert(d3.mouse(this)[0]);
			var i = bisectDate(data, x0, 1);
			var d = data[i - 1];
			focus.attr("transform", "translate(" + x(d.date) + "," + y(d.total) + ")");
			focus.select(".tooltip-date").text(dateFormatter(d.date));
			focus.select(".tooltip-cases").text(formatValue(d.total));
			focus.style("opacity","1");
		}


});
