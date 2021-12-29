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
      left: 70
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
    var chosenYAxis = "healthcare";

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

    // function used for updating y-scale var upon click on axis label
    function yScale(liveData, chosenYAxis) {
      // create scales
      var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(liveData, d => d[chosenYAxis])*1.1])
      .range([height, 0]);
    
      return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
         .duration(1000)
          .call(bottomAxis);

      return xAxis;
    }

    function renderYAxes(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
         .duration(1000)
          .call(leftAxis);

      return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

      circlesGroup.transition()
      .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

      return circlesGroup;
    }

    function renderStates(stateGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

      stateGroup.transition()
      .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

      return stateGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

      var xlabel;
      var ylabel;

      if (chosenXAxis === "poverty") {
        xlabel = "In Poverty (%)";
      }
      else if (chosenXAxis === "age") {
        xlabel = "Age (Median)";
      }
      else {
        xlabel = "Household Income (Median)";
      }

      if (chosenYAxis === "healthcare") {
        ylabel = "Lacks Healthcare (%)";
      }
      else if (chosenYAxis === "obesity") {
        ylabel = "Obese %";
      }
      else {
        ylabel = "Smokes (%)";
      }

      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80,-60])
        .html(function(d) {
          return (`State: ${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
        });

      circlesGroup.call(toolTip);

      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // mouseout event
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
        var yLinearScale = yScale(liveData, chosenYAxis)

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
          .call(leftAxis);
          
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
        .data(liveData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis])-3)
        .attr("r", "10")
        .attr("fill", "#96C7DE")
        .attr("stroke-width", "1")
        .attr("stroke", "white");

        var stateGroup = chartGroup.selectAll("anything")
        .data(liveData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText",true)
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text(function(d) {
            return (`${d.abbr}`)
        })

        // Create group for multiple x-axis labels
        var xlabelsGroup = chartGroup.append("g");

        var inPovertyLabel = xlabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top-15})`)
        .attr("class", "axisText")
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top+3})`)
        .attr("class", "axisText")
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

        var householdIncomeLabel = xlabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top+18})`)
        .attr("class", "axisText")
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");        

        // Create group for left axes labels
        var ylabelsGroup = chartGroup.append("g");

        var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

        var smokeLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

        var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 5)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");
    
      // updateToolTip function above csv import
      var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

      // x axis labels event listener
      xlabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          // console.log(value);

          if (value !== chosenXAxis && (value === "age" || value === "income" || value === "poverty")) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(liveData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // updates circles with new x values
            stateGroup = renderStates(stateGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // changes xaxis classes to change bold text
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

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value);

        if (value !== chosenYAxis && (value === "smokes" || value === "obesity" || value === "healthcare")) {

          // replaces chosenXAxis with value
          chosenYAxis = value;

          console.log(chosenYAxis)

          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(liveData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // updates circles with new x values
          stateGroup = renderStates(stateGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // changes yaxis classes to change bold text
          if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);              
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);  
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);  
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
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
  