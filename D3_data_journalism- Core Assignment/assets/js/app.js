// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("#scatter").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth/2;
    var svgHeight = svgWidth*9/16;
  
    var margin = {
      top: 50,
      bottom: 50,
      right: 50,
      left: 50
    };
  
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
  
    // Append SVG element
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth);
  
    // Append group element
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Read CSV
    d3.csv("assets/js/data.csv").then(function(liveData) {
        
    console.log(liveData);
            // parse data
        liveData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
      });
  
      // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(liveData, d => d.poverty)*0.9, d3.max(liveData, d => d.poverty)*1.1])
        .range([0, width]);
  
      var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(liveData, d => d.healthcare)])
        .range([height, 0]);
  
      // create axes
      var xAxis = d3.axisBottom(xLinearScale);
      var yAxis = d3.axisLeft(yLinearScale).ticks(6);
  
      // append axes
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
  
      chartGroup.append("g")
        .call(yAxis);
  
      // append circles
      var circlesGroup = chartGroup.selectAll("circle")
        .data(liveData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare)-3)
        .attr("r", "10")
        .attr("fill", "#96C7DE")
        .attr("stroke-width", "1")
        .attr("stroke", "white");

        var stateGroup = chartGroup.selectAll("anything")
        .data(liveData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .classed("stateText",true)
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text(function(d) {
            return (`${d.abbr}`)
        })
    }).catch(function(error) {
      console.log(error);
    });
  }
  
  // When the browser loads, makeResponsive() is called.
  makeResponsive();
  
  // When the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);
  