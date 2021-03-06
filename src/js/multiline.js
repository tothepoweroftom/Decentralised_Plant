
//Here we should calculate the new mintcoin price.
//Saving it to the node storage.

function Chart(data, divId, title) {

  ///////////////////////////////////////////////////
  //////////// Initialize variables /////////////////
  ///////////////////////////////////////////////////

  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  };

  var clientWidth = document.getElementById(divId).clientWidth;
  var clientHeight = document.getElementById(divId).clientHeight;

  // Set the dimensions of the canvas / graph
  var margin = {
      top: 100,
      right: 80,
      bottom: 50,
      left: 80
    },
    width = clientWidth - margin.left - margin.right,
    height = clientHeight - margin.top - margin.bottom;

  // Parse the date / time
  var parseDate = d3.time.format("%H:%M:%S %d/%m/%Y").parse, //%H:%M:%S %d/%m/%Y "%d-%b-%y"
    formatDate = d3.time.format("%H:%M:%S"), //        formatDateCursor = d3.time.format("%a %b %e %H:%M:%S"),
    bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;

  ///////////////////////////////////////////////////
  /////////////// Set the scales ////////////////////
  ///////////////////////////////////////////////////

  // Set the ranges
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10).outerTickSize(10);

  // Define the line
  var valueline = d3.svg.line()
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.close);
    });

  //Initiate the area line function
  var areaFunction = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) {
      return x(d.date);
    })
    .y0(height)
    .y1(function(d) {
      return y(d.close);
    });

  ///////////////////////////////////////////////////
  ///////////// Initialize the SVG //////////////////
  ///////////////////////////////////////////////////

  // Adds the svg canvas
  var svg = d3.select("#" + divId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
    .attr("class", "title")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(title);

  var lineSvg = svg.append("g");



  ///////////////////////////////////////////////////
  ///////////// Create the Gradient /////////////////
  ///////////////////////////////////////////////////


  var areaGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "areaGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");

  //Append the first stop - the color at the top
  areaGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "white")
    .attr("stop-opacity", 0.6);

  //Append the second stop - white transparant almost at the end
  areaGradient.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", "#282828")
    .attr("stop-opacity", 0);

  var focus = svg.append("g")
    .style("display", "none");


  ///////////////////////////////////////////////////
  ////////////// Update The Graph ///////////////////
  ///////////////////////////////////////////////////
 if (divId != 'graph3') {
  var inter = setInterval(function() {
    updateData(data, divId);
  }, 1000);
}

  function updateData(data, divId) {
    console.log(data);
    // Get the data again
    d3.csv(data, function(error, data) {
      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.close = +d.close;
      });

      // Scale the range of the data again
      x.domain(d3.extent(data, function(d) {
        return d.date;
      }));
      y.domain([0, d3.max(data, function(d) {
        return d.close;
      })]);

      // Select the section we want to apply our changes to
      var svg = d3.select("#" + divId).transition();

      // Make the changes
      svg.select(".line") // change the line
        .duration(750)
        .attr("d", valueline(data));
      svg.select(".x.axis") // change the x axis
        .duration(750)
        .call(xAxis);
      svg.select(".area") // change the y axis
        .duration(750)
        .attr("d", areaFunction(data));

    });
  }



  ///////////////////////////////////////////////////
  ////////////// Create the Graph ///////////////////
  ///////////////////////////////////////////////////

  // Get the data
  d3.csv(data, function(error, data) {
    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.close = +d.close;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
      return d.date;
    }));
    y.domain([0, d3.max(data, function(d) {
      return d.close;
    })]);

    // Add the X Axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.tickFormat(d3.time.format("%b %e")));

    //Draw the underlying area chart filled with the gradient
    lineSvg.append("path")
      .attr("class", "area")
      .style("fill", "url(#areaGradient)")
      .attr("d", areaFunction(data));

    // Add the valueline path.
    lineSvg.append("path")
      .attr("class", "line")
      .attr("d", valueline(data));

    // // Add the dots on each reading
    // svg.selectAll("dot")
    //   .data(data)
    //   .enter().append("circle")
    //   .attr("r", 3)
    //   .attr("cx", function(d) {
    //     return x(d.date);
    //   })
    //   .attr("cy", function(d) {
    //     return y(d.close);
    //   })
    //   .attr("class", "title");

    // append the rectangle to capture mouse
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() {
        focus.style("display", null);
      })
      .on("mouseout", function() {
        focus.style("display", "none");
      })
      .on("mousemove", mousemove);

    // append the circle at the intersection
    focus.append("circle")
      .attr("class", "y")
      .style("fill", "none")
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("r", 5);

    // append the x line
    focus.append("line")
      .attr("class", "x")
      .style("stroke", "white")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("y1", 0)
      .attr("y2", height);

    // place the value at the intersection
    focus.append("text")
      .attr("class", "y1")
      .attr("dx", width - 100)
      .attr("dy", -30)
      .style("fill", "white");

    // place the date at the intersection
    focus.append("text")
      .attr("class", "y2")
      .attr("dx", width - 100)
      .attr("dy", -15)
      .style("fill", "white");

    // Function for interactivity
    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select("circle.y")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")");

      focus.select("text.y1")
        .text("Price: " + d.close);

      focus.select("text.y2")
        .text("Date: " + formatDate(d.date));

      focus.select(".x")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")")
        .attr("y2", height - y(d.close));
    }

  });

  this.setLabelY = function(title) {
    svg.append("text")
      .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (-margin.left * 0.6) + "," + (height / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
      .text(title)
      .attr("class", "axis");
  }

  this.setLabelX = function(title) {
    svg.append("text")
      .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (width / 2) + "," + (height + (margin.bottom * 0.7)) + ")") // centre below axis
      .text("Date")
      .attr("class", "axis");
  }



}



function stringifyDate() {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date();
  var hh = today.getHours();
  var ms = today.getMinutes();
  var ss = today.getSeconds();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear() - 2000;


  if (dd < 10) {
    dd = '0' + dd
  }

  if (ss < 10) {
    ss = '0' + ss
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  if (ms < 10) {
    ms = '0' + ms
  }

  today = hh + ":" + ms + ":" + ss + " " + dd + "/" + mm + "/" + yyyy;
  return today;
}
