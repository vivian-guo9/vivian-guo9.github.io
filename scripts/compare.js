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
				var sliderMargin = {top:20, right:20, bottom:10, left:60};
				var sliderWidth = 1000-sliderMargin.left - sliderMargin.right;
				var sliderHeight = 100 - sliderMargin.top - sliderMargin.bottom;
				var currVal = 0;
				var clicked = false;
				var playButton = d3.select("#play");
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
				var options = ["total cases","new cases", "total cases as a percent of state population", "total deaths", "new deaths"]
				var selected = "tot_cases";
				drawPie(pieData,date);
				drawBar(barData,date, selected);
							
				playButton.on("click", function(){
					var button = d3.select(this);
					if(button.text() == "Pause"){
						clicked = false;
						clearInterval(timer);
						button.text("Play");
					}else{
						clicked = true;
						timer = setInterval(step, 80);
						button.text("Pause");
					}
				});
				var dropdownChange = function(){
					var newSelection = d3.select(this).property('value');
					if(newSelection == "total cases"){
						newSelection = "tot_cases";
					}else if(newSelection =="new cases"){
						newSelection = "new_case";
					}else if(newSelection == "total deaths"){
						newSelection = "tot_death";
					}else if(newSelection == "new deaths"){
						newSelection = "new_death";
					}else{
						newSelection = "percent"
					}
					selected=newSelection;
					drawBar(barData, date, newSelection);
				
				}
				
				var dropdown = d3.select("#dropdown").on("change",dropdownChange);
				
				dropdown.selectAll("option")
					.data(options)
					.enter()
					.append("option")
					.attr("value", function(d) {return d;})
					.text(function(d){
						return d[0].toUpperCase() + d.slice(1,d.length);
					});
				

				function step(){
					update(x.invert(currVal));
					currVal = currVal + targetVal/200;
					if(currVal > targetVal){
						clicked = false;
						currVal = 0;
						clearInterval(timer);
						playButton.text("Play");
					}
				}

				var normalFormat = d3.timeFormat("%m/%d/%Y"); 
				function update(h) {
					handle.attr("cx", x(h));
					label
						.attr("x", x(h))
						.text(dateFormat(h));
					drawPie(pieData,normalFormat(h));
					drawBar(barData,normalFormat(h),selected);
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
							//console.log(state, typeof(state), election[i].Postal, typeof(election[i].Postal));
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
				for(var i = 0; i < barElements.length; i++){
					for(var j = 0; j < pop.length; j++){
						if(barElements[i].name.localeCompare(pop[j].NAME)){
							barElements[i].percent = barElements[i].tot_cases/pop[j].POPESTIMATE2019;
							break;
						}
					}
				}
				bar[date] = barElements;
				currDate.setDate(currDate.getDate() + 1);
			}
			dict["pie"] = pie;
			dict["bar"] = bar;
	//		console.log(dict);
	return dict;			

}


function drawPie(data, date){
	var width = 350;
	var height = 450;
	var margin = 20;
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

function drawBar(totData,date, selected){
	var data = totData[date];
	//console.log(selected);	
	data = data.sort(function(a,b){
		return a[selected] - b[selected];
	});
	
	var margin = {
		top:40,
		right:20,
		bottom:10,
		left:100
	};
	var width = 700 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;

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
		d[selected] = +d[selected];
	});

	var max = 0;
	for( var [key,value] of Object.entries(totData)){
//		console.log(key,value);
		var temp = +d3.max(value, function(d){return d[selected]});
		//console.log(key, temp);
		if( max < temp){
			//console.log(key,temp);
			max = temp;
		}
	}
//	console.log(max);
	x.domain([0, max]);
	//x.domain([0, d3.max(data, function(d){ return d[selected].toFixed(7); })]);
	y.domain(data.map(function(d) {return d.name; })).padding(0.1);
	
	var tooltip = svg.append("g").attr("class","toolTip");
	svg.append("g")
		.attr("class","x")
		.attr("transform", "translate("  + margin.left +  "," + height + ")")
		.call(d3.axisBottom(x))
	svg.append("g")
		.attr("class","y")
		.attr("transform", "translate("+ margin.left+ ",0)")
		.call(d3.axisLeft(y));


	svg.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.attr("transform", "translate(" + margin.left+ ",0)")
		.attr("class","bar")
		.attr("width", function(d) { return x(d[selected]);})
		.attr("y", function(d) {return y(d.name); })
		.attr("height", y.bandwidth())	
		.attr('fill', function(d){
				var party = d.winner;
				if(party == 'Republican'){
				return "#DE0100";
				}else{
				return "#0015BC";
				}
				})
		.on("mousemove",function(d){
			console.log(d);
			tooltip
				.attr("transform", "translate(" +margin.left+",0)")
				.style("display", "inline-block")
				.style("opacity", "1")
				.html((d.name) + "<br>" + ": " + d[selected])});

/*	svg.append("g")
		.attr("transform", "translate("  + margin.left +  "," + height + ")")
		.call(d3.axisBottom(x))
	svg.append("g")
		.attr("transform", "translate("+ margin.left+ ",0)")
		.call(d3.axisLeft(y));
*//*	tooltip.append("rect")
		.attr("class","tooltip")
		.attr("transform","translate(" +margin.left+",0)")
		.attr("width", 110)
		.attr("height", 50)
		.attr("x",10)
		.attr("y",-22)
		.attr("rx",4)
		.attr("ry",4)
		.style("fill","white")
		.style("opacity","1")
	tooltip.append("text")
		.attr("transform", "translate(" + margin.left + ",0)")
		.attr("class", "tooltip-name")
		.attr("x",18)
		.attr("y",2)
	tooltip.append("text")
		.attr("transform", "translate(" + margin.left + ",0)")
		.attr("class", "tooltip-num")
		.attr("x",18)
		.attr("y",18)
	tooltip.append("rect")
		.attr("class","overlay")
		.attr("width",width)	
		.attr("height",height)
		.attr("transform", "translate(" + margin.left+ ",0)")
		.on("mouseover", function(){focus.style("display", null);})
		.on("mouseout", function(){focus.style("display", "none");})
		.on("mousemove",mousemove);
	function mousemove(){
		var x0 = x.invert(d3.mouse(this)[0]);
		console.log(x0);
	}*/
}
