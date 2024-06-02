d3.csv("preventable_mortality_cleaned (8).csv", function(d) {
  return {
    year: d3.timeParse("%Y")(d.Year), // Parses the year string into a date object
    country: d.Country, // Uses country name
    value: +d.Value // Converts value to number
  };
}).then(function(data) {
  const sumstat = d3.group(data, d => d.country); // Group the data by country

  const margin = {top: 10, right: 70, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g") // Svg group element
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.year)) // Compute the minimum and maximum values of the years in the dataset
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)); // Add X axis

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  const color = d3.scaleOrdinal()
    .domain(Array.from(sumstat.keys())) // Group by country
    .range(d3.schemeCategory10); // Default 10 colors

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

  const lines = svg.selectAll(".line")
    .data(sumstat)
    .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", d => color(d[0]))
      .attr("stroke-width", 1.5)
      .attr("d", d => line(d[1]));

  svg.selectAll(".label")
    .data(sumstat)
    .enter()
    .append("text")
      .attr("class", "label")
      .attr("transform", function(d) {
        const lastYear = d3.max(data, d => d.year); // Find the last year in the data
        const lastPoint = d[1].find(point => point.year.getFullYear() === lastYear.getFullYear()); // Find the data point for the country in the last year
        return `translate(${x(lastYear)}, ${y(lastPoint.value)})`;
      })
      .attr("x", 5) // Shift the text a little bit right
      .attr("dy", ".35em") // Vertically center text
      .attr("text-anchor", "start")
      .text(d => d[0])
      .style("fill", d => color(d[0]));

  const tooltip = d3.select("#tooltip");

  function addTooltip(selection) {
    selection
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9); // Set tooltip opacity to visible
        tooltip.html("Country: " + d.country + "<br/>Year: " + d3.timeFormat("%Y")(d.year) + "<br/>Value: " + d.value)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0); // Hide tooltip
      });
  }

  svg.selectAll(".line-point")
    .data(data) // Bind data
    .enter()
    .append("circle")
      .attr("class", "line-point")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("r", 3)
      .attr("fill", d => color(d.country))
      .call(addTooltip); // Call the tooltip function

  // Add zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(event) {
    const transform = event.transform;
    const newX = transform.rescaleX(x);
    const newY = transform.rescaleY(y);

    svg.selectAll(".line")
      .attr("d", d => line(d[1]));

    svg.selectAll("g.x.axis")
      .call(d3.axisBottom(newX));
    svg.selectAll("g.y.axis")
      .call(d3.axisLeft(newY));
  }

  // Add interactive legend
  const legend = d3.select("#legend")
    .selectAll("div")
    .data(Array.from(sumstat.keys()))
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("background-color", d => color(d))
    .text(d => d)
    .on("click", function(event, d) {
      // Toggle the visibility of the line
      const isActive = d3.select(this).classed("active");
      d3.select(this).classed("active", !isActive);
      svg.selectAll(".line")
        .filter(line => line[0] === d)
        .attr("opacity", isActive ? 1 : 0);
    });

  // Populate country filter dropdown
  const countryFilter = d3.select("#countryFilter");
  countryFilter.selectAll("option")
    .data(Array.from(sumstat.keys()))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  countryFilter.on("change", function(event) {
    const selectedCountry = event.target.value;
    const filteredData = selectedCountry === "all" ? data : data.filter(d => d.country === selectedCountry);
    updateChart(filteredData);
  });

  // Year range filter
  const yearRange = d3.select("#yearRange");
  const yearLabel = d3.select("#yearLabel");

  yearRange.on("input", function() {
    const selectedYear = +this.value;
    yearLabel.text("Year: " + selectedYear);
    const filteredData = data.filter(d => d.year.getFullYear() <= selectedYear);
    updateChart(filteredData);
  });

  function updateChart(filteredData) {
    const filteredSumstat = d3.group(filteredData, d => d.country);

    svg.selectAll(".line")
      .data(filteredSumstat)
      .join("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => color(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d => line(d[1]));

    svg.selectAll(".line-point")
      .data(filteredData)
      .join("circle")
        .attr("class", "line-point")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("fill", d => color(d.country))
        .call(addTooltip); // Rebind the tooltip function

    svg.selectAll(".label")
      .data(filteredSumstat)
      .join("text")
        .attr("class", "label")
        .attr("transform", function(d) {
          const lastYear = d3.max(filteredData, d => d.year); // Find the last year in the data
          const lastPoint = d[1].find(point => point.year.getFullYear() === lastYear.getFullYear()); // Find the data point for the country in the last year
          return `translate(${x(lastYear)}, ${y(lastPoint.value)})`;
        })
        .attr("x", 5) // Shift the text a little bit right
        .attr("dy", ".35em") // Vertically center text
        .attr("text-anchor", "start")
        .text(d => d[0])
        .style("fill", d => color(d[0]));
  }

  updateChart(data);
});
