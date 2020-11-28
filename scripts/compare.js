d3.csv("../data/election-2016.csv",function(election){
		d3.csv("../data/COVID-19_Cases.csv",function(covid){
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
					.attr("transform", "translate(1," + (-25) + ")")

					var handle = slider.insert("circle", ".track-overlay")
					.attr("class", "handle")
					.attr("r", 9);

				var date =currVal;
				var data = covid.filter(function(d){return d.submission_date == date});
				var covidDateFormat = d3.timeFormat("%m/%d/%Y"); 
				function update(h) {
					handle.attr("cx", x(h));
					label
						.attr("x", x(h))
						.text(dateFormat(h));
					var newData = covid.filter(function(d){return d.submission_date == covidDateFormat(h)});
					drawPie(newData);
				}

				drawPie(data);

				function drawPie(data){

					var demo = 0;
					var repub = 0;
					if(data.length == 0){
						repub++;
					}
					for(var i = 0; i < election.length; i++){
						var post = election[i].Postal;
						for( var j = 0; j < data.length; j++){
							if(post == data[j].state){
								if(election[i].Winner == 'Democratic'){
									repub += +data[i].tot_cases;
								}else{
									demo += +data[i].tot_cases;
								}
								break;
							}
						}
					}
					var width = 450;
					var height = 450;
					margin = 50;
					var radius = Math.min(width,height)/2 - margin;
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
						.style("fill","white")
				}
		});
});


