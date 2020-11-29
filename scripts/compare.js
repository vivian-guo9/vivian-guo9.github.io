d3.csv("../data/election-2016.csv",function(election){
		d3.csv("../data/COVID-19_Cases.csv",function(covid){
				d3.csv("../data/population.csv",function(pop){
				var cleanedData = initData(covid, election, pop);
				var pieData = cleanedData.pie;
				var barData = cleanedData.bar;
				var timeParse = d3.timeParse("%m/%d/%Y");
				var dateFormat = d3.timeFormat("%b%e %Y");
				var startDate = timeParse(covid[0].submission_date);
				var endDate = timeParse(covid[covid.length-1].submission_date);
				var sliderMargin = {top:15, right:60, bottom:15, left:60};
				var sliderWidth = 960-sliderMargin.left - sliderMargin.right;
				var sliderHeight = 100 - sliderMargin.top - sliderMargin.bottom;
				var currVal = 0;

				var targetVal = sliderWidth;
				var sliderSvg = d3.select("#slider")
				.append("svg")
				.attr("width", sliderWidth + sliderMargin.left + sliderMargin.right)
				.attr("height", sliderHeight + sliderMargin.top + sliderMargin.bottom)
				var x = d3.scaleTime()
				.domain([startDate, endDate])
				.range([0,targetVal])
				.clamp(true);
				var slider = sliderSvg.append("g")
					.attr("class","slider")
					.attr("transform","translate(" + sliderMargin.left + "," + sliderHeight/2 + ")");
				slider.append("line")
					.attr("class","track")
					.attr("x1",x.range()[0])
					.attr("x2",x.range()[1])
					.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
					.attr("class", "track-inset")
					.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
					.attr("class", "track-overlay")
					.call(d3.drag()
							.on("start.interrupt", function() { slider.interrupt(); })
							.on("start drag", function() {
								currVal=(d3.event.x);
								update(x.invert(currVal)); })
					     );

				slider.insert("g", ".track-overlay")
					.attr("class", "ticks")
					.attr("transform", "translate(0," + 18 + ")")
					.selectAll("text")
					.data(x.ticks(10))
					.enter()
					.append("text")
					.attr("x", x)
					.attr("y", 10)
					.attr("text-anchor", "middle")
					.text(function(d) { return dateFormat(d) });

				var label = slider.append("text")  
					.attr("class", "label")
					.attr("text-anchor", "middle")
					.text(dateFormat(startDate))
					.attr("transform", "translate(1," + (-25) + ")");

				var handle = slider.insert("circle", ".track-overlay")
					.attr("class", "handle")
					.attr("r", 9);

				var date =currVal;
				if(currVal == 0){
					date = covid[0].submission_date;
				}
				drawPie(pieData,date);
				drawBar(barData,date);
				var normalFormat = d3.timeFormat("%m/%d/%Y"); 
				function update(h) {
					handle.attr("cx", x(h));
					label
						.attr("x", x(h))
						.text(dateFormat(h));
					drawPie(pieData,normalFormat(h));
					drawBar(barData,normalFormat(h));
				}
		});
		});
});

function initData(covid,election, pop ){
	var timeParse = d3.timeParse("%m/%d/%Y");
	var dateFormat = d3.timeFormat("%m/%d/%Y");
	var startDate = timeParse(covid[0].submission_date);
	var endDate = timeParse(covid[covid.length-1].submission_date);
	var currDate = startDate;
	var dict = {};
	var pie = {};
	var bar = {};
			while(currDate <= endDate){
				var date = dateFormat(currDate);
				var data = covid.filter(function(d){return d.submission_date == date});
				var repub = 0;
				var demo = 0;
				var barElements = [];
					var k = 0;
					for(var j = 0; j < data.length; j++){
						var state = data[j].state;
						var found = false;
						for(var i = 0; i < election.length; i++){
							if(state == election[i].Postal){
								data[j].name = election[i].State;
								data[j].winner = election[i].Winner;
								if(election[i].Winner == 'Democratic'){
									demo += +data[j].tot_cases;
								}else{
									repub += +data[j].tot_cases;
								}
								found = true;
								break;
							}
						}
						if(found){
							barElements[k] = data[j];
							k++;
						}
					}
				var num = [repub, demo];
				pie[date] = num;
				/*for(var i = 0; i < data.length; i++){
					for(var j = 0; j < pop.length; j++){
						if(typeof(data[i]) !== "undefined"){
						if(data[i].name.localeCompare(pop[j].NAME)){
							data[i].percent = data[i].tot_cases/pop[j].POPESTIMATE2019;
							break;
						}	
						}
					}
				}*/
				bar[date] = barElements;
				currDate.setDate(currDate.getDate() + 1);
			}
			dict["pie"] = pie;
			dict["bar"] = bar;
	//		console.log(dict);
	return dict;			

}


function drawPie(data, date){
	var width = 450;
	var height = 450;
	var margin = 50;
	var radius = Math.min(width,height)/2 - margin;
	var repub = data[date][0];
	var demo = data[date][1];
	
	var pieData = {"republican": repub, "democratic":demo}

	var svg = d3.select("#pie")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width/2 + "," + height/2 + ")");
	var pieChart = d3.pie()
		.sort(null)
		.value(function(d){return d.value;});
	var dataReady = pieChart(d3.entries(pieData));
	var arcGenerator=d3.arc()
		.innerRadius(0)
		.outerRadius(radius)		
		svg.selectAll("arcs")
		.data(dataReady)
		.enter()
		.append('path')
		.attr('d', arcGenerator)
		.attr('fill', function(d){
				var party = d.data.key;
				if(party == 'republican'){
				return "#DE0100";
				}else{
				return "#0015BC";
				}
				})
	.attr("stroke","black")
		.style("stroke-width", "2px")
		svg.selectAll("arcs")
		.data(dataReady)
		.enter()
		.append('text')
		.text(function(d){return d.data.key + ": " + d.data.value})
		.attr("transform", function(d){return "translate(" + arcGenerator.centroid(d) + ")"; })
		.style("text-anchor", "middle")
		.style("font-size",16)
		.style("fill","white");
}

function drawBar(totData,date){
	var data = totData[date];
	console.log(data);
	data = data.sort(function(a,b){
		return a.tot_cases - b.tot_cases;
	});
	
	var margin = {
		top:40,
		right:40,
		bottom:20,
		left:100
	};
	var width = 800 - margin.left - margin.right;
	var height = 600 - margin.top - margin.bottom;

	var x = d3.scaleLinear()
		.range([0,width])
	
	var y = d3.scaleBand()
		.rangeRound([height,0])

	var svg = d3.select("#bar")
	svg.selectAll(".bar").remove();
	svg.selectAll("g").remove();
	svg
		.attr("width",width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	data.forEach(function(d){
		d.tot_cases = +d.tot_cases;
	});
	

	x.domain([0, d3.max(data, function(d){ return d.tot_cases; })]);
	y.domain(data.map(function(d) {return d.name; })).padding(0.1);

	svg.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.attr("transform", "translate(" + margin.left+ ",0)")
		.attr("class","bar")
		.attr("width", function(d) {return x(d.tot_cases);})
		.attr("y", function(d) {return y(d.name); })
		.attr("height", y.bandwidth())	
		.attr('fill', function(d){
				var party = d.winner;
				console.log(d);
				if(party == 'Republican'){
				return "#DE0100";
				}else{
				return "#0015BC";
				}
				});

	svg.append("g")
		.attr("transform", "translate("  + margin.left +  "," + height + ")")
		.call(d3.axisBottom(x))
	svg.append("g")
		.attr("transform", "translate("+ margin.left+ ",0)")
		.call(d3.axisLeft(y));
}
