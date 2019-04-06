//PlaySpeed is delay for showing new data when using play button. animationspeed is animation duration. both in ms.
const playSpeed = 1000;
const animationSpeed = 1000;

let testi = 0;
let year = 2;
let svg = d3.select("svg"),
  margin = 220,
  width = svg.attr("width") - margin,
  height = svg.attr("height") - margin;
let data = [];

//Prev button calls this
function prev() {
  year--;
  drawGraph();
}
//Next button calls this
function next() {
  year++;
  drawGraph();
}
//Play button calls this
function play() {
  window.setInterval(function() {
    year++;
    drawGraph();
  }, playSpeed);
}

let yScale = d3
    .scaleBand()
    .range([height, 0])
    .padding(0),
  xScale = d3.scaleLinear().range([0, width]);

let g = svg.append("g").attr("transform", "translate(" + 150 + "," + 100 + ")");

//Load CSV
function loadData() {
  d3.csv("PaikkaJako.csv", function(error, rows) {
    if (error) {
      throw error;
    }
    rows.forEach(function(d) {
      let i = 0;
      while (i < rows.columns.length) {
        if (i > 1) {
          d[rows.columns[i]] = +d[rows.columns[i]];
        }

        i++;
      }
    });

    data = rows;
    drawGraph();
  });
}

function drawGraph() {
  g.selectAll(".YearTitle").remove();
  g.append("text")
    .attr("class", "YearTitle")
    .attr("y", -20)
    .text("Suomen eduskunta vuonna:" + data.columns[year]);

  let datasorted = data.sort(function(a, b) {
    return a[data.columns[year]] - b[data.columns[year]];
  });

  let topOfSortedData = datasorted.filter(function(d) {
    return d[data.columns[year]] != 0;
  });

  yScale.domain(
    topOfSortedData.map(function(d) {
      return d.Vaalit;
    })
  );
  xScale.domain([
    0,
    d3.max(topOfSortedData, function(d) {
      return d[data.columns[year]];
    })
  ]);
  if (testi < 1) {
    d3.selectAll(".x.axis").remove();
    d3.selectAll(".y.axis").remove();
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .transition()
      .duration(animationSpeed)

      .call(d3.axisBottom(xScale));

    g.append("g")
      .transition()
      .duration(animationSpeed)
      .attr("class", "y axis")
      .call(
        d3.axisLeft(yScale).tickFormat(function(d) {
          return d;
        })
      );
    testi++;
  } else {
    g.selectAll(".x.axis")
      .transition()
      .duration(animationSpeed)
      .call(d3.axisBottom(xScale));
    g.selectAll(".y.axis")
      .transition()
      .duration(animationSpeed)
      .call(
        d3.axisLeft(yScale).tickFormat(function(d) {
          return d;
        })
      );
  }

  // BARS
  let bars = g
    .selectAll(".bar")
    .data(topOfSortedData, function(d) {
      return d.Vaalit;
    })
    .attr("class", "bar");
  // UPDATE BARS
  bars
    .transition()
    .duration(animationSpeed)
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d.Vaalit);
    })
    .attr("width", function(d) {
      return xScale(d[data.columns[year]]);
    })
    .attr("height", yScale.bandwidth())
    .attr("fill", function(d) {
      return "#" + d[data.columns[1]];
    });
  // CREATE NEW BARS
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d.Vaalit);
    })
    .transition()
    .duration(animationSpeed)
    .attr("width", function(d) {
      return xScale(d[data.columns[year]]);
    })
    .attr("height", yScale.bandwidth())
    .attr("fill", function(d) {
      return "#" + d[data.columns[1]];
    });

  //REMOVE BARS

  bars
    .exit()
    .transition()
    .duration(animationSpeed)
    .attr("y", animationSpeed)
    .remove();

  //LABELS
  let labels = g
    .selectAll(".label")
    .data(topOfSortedData, function(d) {
      return d.Vaalit;
    })
    .attr("class", "label");

  // UPDATE LABELS
  labels
    .transition()
    .duration(animationSpeed)
    .attr("x", function(d) {
      return 5 + xScale(d[data.columns[year]]);
    })
    .attr("y", function(d) {
      return yScale(d.Vaalit) + 0.5 * yScale.bandwidth();
    })
    .tween("text", function(d) {
      let node = this;
      //keep a reference to 'this'
      let i = d3.interpolateRound(node.textContent, d[data.columns[year]]);
      return function(t) {
        node.textContent = i(t);
        //use that reference in the inner function
      };
    });
  //NEW LABELS

  labels
    .enter()
    .append("text")
    .attr("class", "label")
    .text(0)
    .attr("x", function(d) {
      return 5 + xScale(d[data.columns[year]]);
    })
    .attr("y", function(d) {
      return yScale(d.Vaalit) + 0.5 * yScale.bandwidth();
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .transition()
    .duration(animationSpeed)
    .tween("text", function(d) {
      let node = this;
      //keep a reference to 'this'
      let i = d3.interpolateRound(node.textContent, d[data.columns[year]]);
      return function(t) {
        node.textContent = i(t);
        //use that reference in the inner function
      };
    });

  // REMOVE LABELS
  labels
    .exit()
    .transition()
    .duration(animationSpeed)
    .attr("y", 1000)
    .remove();
}

loadData();
