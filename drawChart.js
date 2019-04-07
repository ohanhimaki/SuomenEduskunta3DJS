//PlaySpeed is delay for showing new data when using play button. animationspeed is animation duration. both in ms.
let playSpeed = 1000;
let animationSpeed = 1000;

let column = 2;
let svg = d3.select("svg"),
  margin = 220,
  width = svg.attr("width") - margin,
  height = svg.attr("height") - margin;
let data = [];

//Prev button calls this
function prev() {
  if (column > 2) {
    column--;
  }
  drawGraph();
}
//Next button calls this
function next() {
  if (column < data.columns.length) {
    column++;
  }

  drawGraph();
}
//Play button calls this
function play() {
  window.setInterval(function() {
    column++;
    drawGraph();
  }, playSpeed);
}

//YAxis
let yScale = d3
  .scaleBand()
  .range([height, 0])
  .padding(0);
//XAxis
let xScale = d3.scaleLinear().range([0, width]);

//translate changes position where graph is drawn, starts from topleft (x,y)
let g = svg.append("g").attr("transform", "translate(" + 150 + "," + 100 + ")");

//Load exampleCSV
function loadData() {
  document.getElementById("chartTitle").value = "Suomen eduskunta vuonna:";
  //reset column
  column = 2;
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
//Load csv to string from imported file.
function readCsv(file) {
  let reader = new FileReader();
  reader.onload = function(e) {
    content = reader.result;
    importData(content);
  };
  reader.readAsText(file.files[0]);
}

function readTextbox() {
  content = document.getElementById("csvTextInput").value;
  importData(content);
}

//Parse data with d3 csvparse. strings to int.
function importData(csv) {
  //reset column
  column = 2;
  data = d3.csvParse(csv);
  data.forEach(function(d) {
    let i = 0;
    while (i < data.columns.length) {
      if (i > 1) {
        d[data.columns[i]] = +d[data.columns[i]];
      }

      i++;
    }
  });

  drawGraph();
}

//start drawGraph
function drawGraph() {
  //Check if 2nd column is used for bar color.
  if (document.getElementById("columnIsColor").checked == true) {
    usecolumn = column;
  } else {
    usecolumn = column - 1;
  }
  //Stops drawGraph function if no data for selected column.
  if (column >= data.columns.length || column < 2) {
    console.log(data.columns.length);
    return;
  }
  // update chart Title
  g.selectAll(".ChartTitle").remove();
  g.append("text")
    .attr("class", "ChartTitle")
    .attr("y", -20)
    .text(
      document.getElementById("chartTitle").value + data.columns[usecolumn]
    );

  //sort data by value
  let datasorted = data.sort(function(a, b) {
    return a[data.columns[usecolumn]] - b[data.columns[usecolumn]];
  });
  // drop 0 values
  let topOfSortedData = datasorted.filter(function(d) {
    return d[data.columns[usecolumn]] != 0;
  });

  //yScale axis titles, returns value of first column from every row in sorted and filtered list
  yScale.domain(
    topOfSortedData.map(function(d) {
      return d[data.columns[0]];
    })
  );
  //xScale axis titles: 0, max gives titles from 0 to highest value.
  xScale.domain([
    0,
    d3.max(topOfSortedData, function(d) {
      return d[data.columns[usecolumn]];
    })
  ]);

  if (d3.selectAll(".bar").size() < 1) {
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
      return d[data.columns[0]];
    })
    .attr("class", "bar");
  // UPDATE BARS
  bars
    .transition()
    .duration(animationSpeed)
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d[data.columns[0]]);
    })
    .attr("width", function(d) {
      return xScale(d[data.columns[usecolumn]]);
    })
    .attr("height", yScale.bandwidth())
    .attr("fill", function(d) {
      if (document.getElementById("columnIsColor").checked == true) {
        return "#" + d[data.columns[1]];
      } else {
        return "#9A99FF";
      }
    });
  // CREATE NEW BARS
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d[data.columns[0]]);
    })
    .transition()
    .duration(animationSpeed)
    .attr("width", function(d) {
      return xScale(d[data.columns[usecolumn]]);
    })
    .attr("height", yScale.bandwidth())
    .attr("fill", function(d) {
      if (document.getElementById("columnIsColor").checked == true) {
        return "#" + d[data.columns[1]];
      } else {
        return "#9A99FF";
      }
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
      return d[data.columns[0]];
    })
    .attr("class", "label");

  // UPDATE LABELS
  labels
    .transition()
    .duration(animationSpeed)
    .attr("x", function(d) {
      return 5 + xScale(d[data.columns[usecolumn]]);
    })
    .attr("y", function(d) {
      return yScale(d[data.columns[0]]) + 0.5 * yScale.bandwidth();
    })
    .tween("text", function(d) {
      let node = this;
      //keep a reference to 'this'
      let i = d3.interpolateRound(node.textContent, d[data.columns[usecolumn]]);
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
      return 5 + xScale(d[data.columns[usecolumn]]);
    })
    .attr("y", function(d) {
      return yScale(d[data.columns[0]]) + 0.5 * yScale.bandwidth();
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .transition()
    .duration(animationSpeed)
    .tween("text", function(d) {
      let node = this;
      //keep a reference to 'this'
      let i = d3.interpolateRound(node.textContent, d[data.columns[usecolumn]]);
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
