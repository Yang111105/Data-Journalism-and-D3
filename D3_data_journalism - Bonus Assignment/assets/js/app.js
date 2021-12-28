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
      bottom: 70,
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
  
    // Initial Params
    var chosenXAxis = "poverty";


    // function used for updating x-scale var upon click on axis label
    function xScale(liveData, chosenXAxis) {
      // create scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(liveData, d => d[chosenXAxis]) * 0.9,
          d3.max(liveData, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);
    
      return xLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
         .duration(1000)
          .call(bottomAxis);

      return xAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {

      circlesGroup.transition()
      .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

      return circlesGroup;
    }

    function renderStates(stateGroup, newXScale, chosenXAxis) {

      stateGroup.transition()
      .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

      return stateGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {

      var label;

      if (chosenXAxis === "poverty") {
        label = "In Poverty (%)";
      }
      else if (chosenXAxis === "age") {
        label = "Age (Median)";
      }
      else {
        label = "Household Income (Median)";
      }

      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80,-60])
        .html(function(d) {
          return (`${label} ${d[chosenXAxis]}`);
        });

      circlesGroup.call(toolTip);

      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });

      return circlesGroup;
    }

    
      // Read CSV
    d3.csv("assets/js/data.csv").then(function(liveData) {
        
        console.log(liveData);
        
        // parse data
        liveData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
      });
  
        // xLinearScale function above csv import
        var xLinearScale = xScale(liveData, chosenXAxis);

        // Create y scale function
        var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(liveData, d => d.healthcare)])
        .range([height, 0]);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
          .call(leftAxis);
          
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
        .data(liveData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare)-3)
        .attr("r", "10")
        .attr("fill", "#96C7DE")
        .attr("stroke-width", "1")
        .attr("stroke", "white");

        var stateGroup = chartGroup.selectAll("anything")
        .data(liveData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.healthcare))
        .classed("stateText",true)
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text(function(d) {
            return (`${d.abbr}`)
        })

        // Create group for multiple x-axis labels
        var labelsGroup = chartGroup.append("g");

        var inPovertyLabel = labelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top-15})`)
        .attr("class", "axisText")
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

        var ageLabel = labelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top+3})`)
        .attr("class", "axisText")
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

        var householdIncomeLabel = labelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top+18})`)
        .attr("class", "axisText")
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");        

          // Create left axes labels
        chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "14px")
        .text("Lacks Healthcare (%)");
    
      // updateToolTip function above csv import
      var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // x axis labels event listener
      labelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          // console.log(value);

          if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(liveData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // updates circles with new x values
            stateGroup = renderStates(stateGroup, xLinearScale, chosenXAxis);

            // changes classes to change bold text
            if (chosenXAxis === "age") {
              inPovertyLabel
                .classed("active", false)
                .classed("inactive", true);              
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              householdIncomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "income") {
              inPovertyLabel
                .classed("active", false)
                .classed("inactive", true);  
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              householdIncomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
            else {
              inPovertyLabel
                .classed("active", true)
                .classed("inactive", false);  
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              householdIncomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
          }
        });
        
    }).catch(function(error) {
      console.log(error);
    });
  }
  
  // When the browser loads, makeResponsive() is called.
  makeResponsive();
  
  // When the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);
  