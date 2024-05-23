function init() {
    // set up the SVG canvas dimensions
    var margin = { top: 50, right: 100, bottom: 100, left: 150 },
        w = 1000 - margin.left - margin.right,
        h = 800 - margin.top - margin.bottom; // increased height for larger boxes

    d3.csv("health_expenditure_cleaned.csv").then(data => { // importing csv data
        data.forEach(d => {
            d.Year = +d.Year;
            d.Value = +d.Value;
        });

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w + margin.left + margin.right + 100)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // create the scales
        var xScale = d3.scaleBand()
            .range([0, w])
            .domain(data.map(d => d.Year))
            .padding(0.1); // reduced padding for larger boxes

        var yScale = d3.scaleBand()
            .range([h, 0])
            .domain(data.map(d => d.Country))
            .padding(0.1); // reduced padding for larger boxes

        var colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
            .domain([0, d3.max(data, d => d.Value)]);

        var Tooltip = d3.select("#chart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        // Three functions that change the tooltip when user hover / move / leave a cell
        var mouseover = function(event, d) {
            Tooltip.style("opacity", 1);
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
        };
        var mousemove = function(event, d) {
            Tooltip
                .html("Country: " + d.Country + "<br>Year: " + d.Year + "<br>Value: " + d.Value.toFixed(2) + "%")
                .style("left", (event.pageX + 10) + "px") // 10px offset to the right of the cursor
                .style("top", (event.pageY - 20) + "px"); // 20px offset above the cursor
        };
        var mouseleave = function(event, d) {
            Tooltip.style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        };

        // append the rectangles for the heatmap
        svg.selectAll()
            .data(data, d => d.Country + ':' + d.Year)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.Year))
            .attr("y", d => yScale(d.Country))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d.Value))
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // add the x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale).tickSize(0))
            .selectAll("text")
            .style("font-family", "Oswald, sans-serif")
            .style("font-size", "14px");

        // add the y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale).tickSize(0))
            .selectAll("text")
            .style("font-family", "Oswald, sans-serif")
            .style("font-size", "14px");

        // add color key/legend
        var legendWidth = 20;
        var legendHeight = h;
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${w + 40}, 0)`);

        var legendScale = d3.scaleLinear()
            .range([legendHeight, 0])
            .domain([0, d3.max(data, d => d.Value)]);

        var numBoxes = 100; // number of color boxes in the legend
        legend.selectAll("rect")
            .data(d3.range(numBoxes), d => d)
            .enter()
            .append("rect")
            .attr("y", (i) => i * (legendHeight / numBoxes))
            .attr("height", legendHeight / numBoxes)
            .attr("width", legendWidth)
            .attr("fill", d => colorScale(legendScale.invert(d * (legendHeight / numBoxes))));

        // add legend axis
        var legendAxis = d3.axisRight(legendScale)
            .ticks(6)
            .tickFormat(d => d + "%");

        legend.append("g")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis)
            .selectAll("text")
            .style("font-family", "Oswald, sans-serif");
    });
}

window.onload = init;
