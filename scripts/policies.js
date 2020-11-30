var svg = d3.select("#usmap");
var path = d3.geoPath();
function combinePolicy(){
	d3.csv("../data/election-2016.csv", function(election){
	d3.csv("../data/state_policy.csv", function(policy){
		for(var i = 0; i < policy.length; i++){
			var name = policy[i].state;
			for(var j = 0; j < election.length; j++){
				if(name == election[j].State){
					policy[i].winner = election[j].Winner;
				}
			}
		}
		console.log(policy);	
		return policy;	
	});
	});
}
function initData(states){
	var policy = combinePolicy();	
	console.log(policy);	
}

d3.json("../data/us-10m.v2.json",function(us){
	initData(us);
});
/*
d3.csv("../data/election-2016.csv",function(data){
d3.csv("../data/state_policy.csv",function(policy){
d3.json("../data/us-10m.v2.json", function(error, us) {
	
	
	for(var i = 0; i < data.length ; i++){
		var name = data[i].State;
		var val;
		for(var j = 0; j < policy.length; j++){
			if(name == policy[j].state){
				data[i].mask = policy[j].mask;
				data[i].lockdown = policy[j].lockdown;
				data[i].start = policy[j].start;
				data[i].end = policy[j].end;
				break;
			}
		}
		if(data[i].Winner == 'Republican'){
			val = 'Red';
		}else{
			val = 'Blue';
		}
		for(var j = 0; j < us.objects.states.geometries.length; j++){
			var jsonState = us.objects.states.geometries[j].properties.name;
			if(jsonState == name){
				us.objects.states.geometries[j].properties.color = val;
				us.objects.states.geometries[j].properties.mask = data[i].mask;
				us.objects.states.geometries[j].properties.lockdown = data[i].lockdown;
				us.objects.states.geometries[j].properties.start = data[i].start;
				us.objects.states.geometries[j].properties.end = data[i].end;				
				us.objects.states.geometries[j].properties.postal = data[i].Postal;
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
		if(value == 'Red'){
			return "#DE0100";
		}else{
			return "#0015BC";
		}
	})
	.on("click", function(d){
		console.log(d.properties);
		var name = d3.select("#state_name")
			.text(d.properties.name);
		var mask = d3.select("#mask")
			.text(d.properties.mask);
		var lockdown_time = d.properties.start + "-" + (d.properties.end == "" ? "continuing": d.properties.end);
		var lockdown = d3.select("#lockdown")
			.text(d.properties.lockdown == "yes"?lockdown_time: "no");
		d3.csv("../data/COVID-19_Cases.csv",function(covid_parse){
//			console.log(covid_parse);
			return{ state: covid_parse.state, 
				tot_cases: covid_parse.tot_cases,
				tot_death: covid_parse.tot_death,
				date: d3.timeParse("%-m/%-d/%Y")(covid_parse.submission_date),
				value:covid_parse.new_case}
		},function(covid){
			var start = 0;
			var end;
			var post = d.properties.postal;
			while(post != covid[start].state){
				start++;
			}
			end = start;
			while(post == covid[end].state){
				end++;
			}
			var state_covid=covid.slice(start,end)
			console.log(state_covid);
			var tot = state_covid[state_covid.length - 1].tot_cases;
			var total = d3.select("#total_cases")
				.text(tot);
			var deaths = state_covid[state_covid.length-1].tot_death;
			var tot_deaths = d3.select("#total_deaths")
				.text(deaths);
			var width = 400;
			var height = 400;
		
			d3.select("#line").selectAll("g").remove();
			d3.select("#line").selectAll("path").remove();
			var line = d3.select("#line");
			var x = d3.scaleTime()
				.domain(state_covid[0].date, state_covid[state_covid.length-1].date)
				.range([0,width]);
			line.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));
			var y = d3.scaleLinear()
				.domain([0,d3.max(state_covid, function(covid_parse){return covid_parse.value;})])
				.range([height,0]);
			line.append("g")
				.call(d3.axisLeft(y));
			
			line.append("path")
				.datum(covid)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-width", 1)
				.attr("d", d3.line()
					.x(function(d2){return x(d2.date) })
					.y(function(covid_parse){return y(covid_parse.value) })
				);
	
		});
		//update card state name, total cases, mask mandate, lockdown policies 
	});

	svg.append("circle").attr("cx",850).attr("cy",500).attr("r", 6).style("fill", "#DE1001")
	svg.append("circle").attr("cx",850).attr("cy",520).attr("r", 6).style("fill", "#0015BC")
	svg.append("text").attr("x", 870).attr("y", 500).text("Republican").style("font-size", "15px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 870).attr("y", 520).text("Democratic").style("font-size", "15px").attr("alignment-baseline","middle")	

});
});
});*/
