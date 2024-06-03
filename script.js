d3.csv("avoidable_mortality_cleaned.csv", function(d) {
  return {
    year: d3.timeParse("%Y")(d.Year),
    country: d.Country,
    value: +d.Value
  };
}).then(function(data) {
  const sumstat = d3.group(data, d => d.country);

  const margin = {top: 10, right: 70, bottom: 50, left: 70},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const xAxisGroup = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

  const yAxisGroup = svg.append("g")
    .call(d3.axisLeft(y));

  const color = d3.scaleOrdinal()
    .domain(Array.from(sumstat.keys()))
    .range(d3.schemeCategory10);

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

  svg.selectAll(".line")
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
        const lastYear = d3.max(data, d => d.year);
        const lastPoint = d[1].find(point => point.year.getFullYear() === lastYear.getFullYear());
        return `translate(${x(lastYear)}, ${y(lastPoint.value)})`;
      })
      .attr("x", 5)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(d => d[0])
      .style("fill", d => color(d[0]));

  const tooltip = d3.select("#tooltip");

  function addTooltip(selection) {
    selection
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html("Country: " + d.country + "<br/>Year: " + d3.timeFormat("%Y")(d.year) + "<br/>Value: " + d.value)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  svg.selectAll(".line-point")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "line-point")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("r", 3)
      .attr("fill", d => color(d.country))
      .call(addTooltip);

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

    xAxisGroup.call(d3.axisBottom(newX));
    yAxisGroup.call(d3.axisLeft(newY));
  }

  const legend = d3.select("#legend")
    .selectAll("div")
    .data(Array.from(sumstat.keys()))
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("background-color", d => color(d))
    .text(d => d)
    .on("click", function(event, d) {
      const isActive = d3.select(this).classed("active");
      d3.select(this).classed("active", !isActive);
      svg.selectAll(".line")
        .filter(line => line[0] === d)
        .attr("opacity", isActive ? 1 : 0);
    });

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
        .call(addTooltip);

    svg.selectAll(".label")
      .data(filteredSumstat)
      .join("text")
        .attr("class", "label")
        .attr("transform", function(d) {
          const lastYear = d3.max(filteredData, d => d.year);
          const lastPoint = d[1].find(point => point.year.getFullYear() === lastYear.getFullYear());
          return `translate(${x(lastYear)}, ${y(lastPoint.value)})`;
        })
        .attr("x", 5)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(d => d[0])
        .style("fill", d => color(d[0]));
  }

  // Append axis labels again to ensure they are on top
  xAxisGroup.append("text")
    .attr("class", "axis-label")
    .attr("y", 40)
    .attr("x", width / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Year");

  yAxisGroup.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("dy", "-4em")
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Deaths per 100 000 population (standardised rates)");

  updateChart(data);
});
