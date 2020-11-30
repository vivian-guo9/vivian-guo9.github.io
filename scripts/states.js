var svg = d3.select("#usmap");
var path = d3.geoPath();

function combinePolicy(election,policy){
	for(var i = 0; i < policy.length; i++){
		var name = policy[i].state;
		for(var j = 0; j < election.length; j++){
			if(name == election[j].State){
				policy[i].winner = election[j].Winner;
				policy[i].Postal = election[j].Postal;
			}
		}
	}
}

d3.csv("../data/election-2016.csv",function(election){
d3.csv("../data/state_policy.csv",function(policy){
	combinePolicy(election,policy);
d3.json("../data/us-10m.v2.json", function(us) {
//	if (error) throw error;
	for(var i = 0; i < policy.length; i++){
		for(var j = 0; j < us.objects.states.geometries.length; j++){
			var state = us.objects.states.geometries[j].properties.name;
			if(state == policy[i].state){
				us.objects.states.geometries[j].properties.color = policy[i].winner;
				us.objects.states.geometries[j].properties.mask = policy[i].mask;
				us.objects.states.geometries[j].properties.lockdown = policy[i].lockdown;
				us.objects.states.geometries[j].properties.start = policy[i].start;
				us.objects.states.geometries[j].properties.end = policy[i].end;				
				us.objects.states.geometries[j].properties.postal = policy[i].Postal;
				break;

			}
		}
	}

	svg.append("g")
	.attr("class", "states")
    	.selectAll("path")
    	.data(topojson.feature(us, us.objects.states).features)
    	.enter().append("path")
      	.attr("d", path)
	.style("fill", function(d){
		var value = d.properties.color;
		if(value == 'Republican'){
			return "#DE0100";
		}else{
			return "#0015BC";
		}
	})
	.on("click", function(d){
		//console.log(d.properties);
		var name = d3.select("#state_name")
			.text(d.properties.name);
		var mask = d3.select("#mask")
			.text(d.properties.mask);
		var lockdown_time = d.properties.start + "-" + (d.properties.end == "" ? "continuing": d.properties.end);
		var lockdown = d3.select("#lockdown")
			.text(d.properties.lockdown == "yes"?lockdown_time: "no");
		d3.csv("../data/COVID-19_Cases.csv",function(covid){
			var timeParseshort = d3.timeParse("%-m/%-d/%y");
			var timeParse = d3.timeParse("%-m/%-d/%Y");
			var dateFormat = d3.timeFormat("%m/%d/%Y");	
			var state = d.properties.postal;
			var data  = covid.filter(function(d){ return d.state == state});
		
			for(var i =0; i < data.length; i++){
				data[i].date = timeParse(data[i].submission_date);
				data[i].tot_cases = +data[i].tot_cases;
			}

			var start = dateFormat(timeParseshort(d.properties.start));
			var end = dateFormat(timeParseshort(d.properties.end));
			var startData = data.filter(function(d){return d.submission_date === start});
			var endData = data.filter(function(d){return d.submission_date === end});
			var lock = {};
			if(startData.length != 0){
				if(endData.length == 0){
					lock = {startData};
				}else{
					lock = {startData,endData};
				}
			}
			var tot = data[data.length - 1].tot_cases;
			var total = d3.select("#total_cases")
				.text(tot);
			var deaths = data[data.length-1].tot_death;
			var tot_deaths = d3.select("#total_deaths")
				.text(deaths);
			var margin = {top:30, left:50, bottom:0, right:30};
			var width = 450 - margin.left - margin.right;			
			var height = 400 - margin.top - margin.bottom;

			var line = d3.select("#linechart");
			line.selectAll("g").remove();
			line.selectAll("path").remove();
			line.selectAll(".line").remove();
			
			var x = d3.scaleTime().range([0,width]);
			var y = d3.scaleLinear().range([height,0]);

			var lineGraph = d3.line()
				.x(function(d){return x(d.date)})
				.y(function(d){return y(d.tot_cases)});
			
			x.domain(d3.extent(data, function(d){return d.date;}));
			y.domain([0,d3.max(data,function(d){return d.tot_cases})]);

			line.append("g")
				.attr("transform", "translate(" + margin.left+ "," + height + ")")
				.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));
		
			line.append("g")
				.attr("transform", "translate(" + margin.left + ",0)")	
				.call(d3.axisLeft(y));
			
			line.append("path")
				.data([data])
				.attr("transform", "translate(" + margin.left + ",0)")
				.attr("class", "line")
				.attr("d", lineGraph)

			line.selectAll("circle")
				.data(lock)
				.enter()
				.attr("transform", "translate(" + margin.left + ",0)")
				.append("circle")
				.attr("fill", "red")
				//.attr("stroke", "none")
				.attr("cx", function(d) { return x(d.date)})
				.attr("cy",function(d){return y(d.tot_cases)})
				.attr("r",5);
		});
		//update card state name, total cases, mask mandate, lockdown policies 
	});

	svg.append("circle").attr("cx",850).attr("cy",500).attr("r", 6).style("fill", "#DE1001")
	svg.append("circle").attr("cx",850).attr("cy",520).attr("r", 6).style("fill", "#0015BC")
	svg.append("text").attr("x", 870).attr("y", 500).text("Republican").style("font-size", "15px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 870).attr("y", 520).text("Democratic").style("font-size", "15px").attr("alignment-baseline","middle")	

});
});
});
