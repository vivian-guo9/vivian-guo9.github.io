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
d3.json("../data/us-states.json", function(error,us) {
	if (error) throw error;
	console.log(us);
	for(var i = 0; i < policy.length; i++){
		for(var j = 0; j < us.features.length; j++){
			var state = us.features[j].properties.NAME;
			if(state == policy[i].state){
				us.features[j].properties.color = policy[i].winner;	
				us.features[j].properties.mask = policy[i].mask;
				us.features[j].properties.lockdown = policy[i].lockdown;
				us.features[j].properties.start = policy[i].start;
				us.features[j].properties.end = policy[i].end;				
				us.features[j].properties.postal = policy[i].Postal;
				break;
			}
		}
	}

	var mapWidth = 700;
	var mapHeight = 500;
	var projection = d3.geoAlbersUsa()
		.translate([mapWidth/2, mapHeight/2-25])
		.scale([mapWidth*1.4])
	var path=d3.geoPath()
		.projection(projection);
	var map = d3.select("#usmap")
		.attr("width", mapWidth)
		.attr("height", mapHeight)

	map.append("g")
		.attr("class","states")
		.selectAll("path")
		.data(us.features)
		.enter()
		.append("path")
		.attr("d",path)
		.style("stroke", "#ffffff")
		.style("stroke-width", "1")
		.style("fill", function(d){
		//	console.log(d);
			var value = d.properties.color;
			if(value == 'Republican'){
				return "#DE0100";
			}else{
				return "#0015BC";
			}
		})
	.on("click", function(d){
		//console.log(d.properties);
		var card = d3.select("#details");
		var name = d3.select("#state_name")
			.text(d.properties.NAME);
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
			var width = 350 - margin.left - margin.right;			
			var height = 350 - margin.top - margin.bottom;

			var line = d3.select("#linechart");
			line.selectAll("g").remove();
			line.selectAll("path").remove();
			line.selectAll(".line").remove();
		
			line.style("width","350px");
			line.style("height","350px");	
			var x = d3.scaleTime().range([0,width]);
			var y = d3.scaleLinear().range([height,0]);

			var lineGraph = d3.line()
				.x(function(d){return x(d.date)})
				.y(function(d){return y(d.tot_cases)});
			
			x.domain(d3.extent(data, function(d){return d.date;}));
			y.domain([0,d3.max(data,function(d){return d.tot_cases})]);

			line.append("g")
				.attr("transform", "translate(" + margin.left+ "," + (height+10) + ")")
				.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));
		
			line.append("g")
				.attr("transform", "translate(" + margin.left + ",10)")	
				.call(d3.axisLeft(y));
			
			line.append("path")
				.data([data])
				.attr("transform", "translate(" + margin.left + ",10)")
				.attr("class", "line")
				.attr("d", lineGraph)
			
			console.log(lock);
			line.selectAll("circle")
				.data(lock)
				.enter()
				.attr("transform", "translate(" + margin.left + ",10)")
				.append("circle")
				.attr("fill", "red")
				//.attr("stroke", "none")
				.attr("cx", function(d) { return x(d.date)})
				.attr("cy",function(d){return y(d.tot_cases)})
				.attr("r",5);
			card.style("opacity","1");
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
