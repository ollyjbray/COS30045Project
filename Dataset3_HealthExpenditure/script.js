function init() {
    // set up the SVG canvas dimensions
    const margin = { top: 50, right: 100, bottom: 100, left: 150 },
        w = 1000 - margin.left - margin.right,
        h = 800 - margin.top - margin.bottom; // increased height for larger boxes

    d3.csv("health_expenditure_cleaned.csv").then(data => { // importing csv data
        data.forEach(d => {
            d.Year = +d.Year;
            d.Value = +d.Value;
        });

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", w + margin.left + margin.right + 100)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // create the scales
        const xScale = d3.scaleBand()
            .range([0, w])
            .domain(data.map(d => d.Year))
            .padding(0.1); // reduced padding for larger boxes

        const yScale = d3.scaleBand()
            .range([h, 0])
            .domain(data.map(d => d.Country))
            .padding(0.1); // reduced padding for larger boxes

        const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
            .domain([0, d3.max(data, d => d.Value)]);

        // append the rectangles for the heatmap
        svg.selectAll()
            .data(data, d => d.Country + ':' + d.Year)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.Year))
            .attr("y", d => yScale(d.Country))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d.Value));

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

        // add labels to the heatmap cells
        // svg.selectAll(".text")
        //     .data(data, d => d.Country + ':' + d.Year)
        //     .enter()
        //     .append("text")
        //     .attr("x", d => xScale(d.Year) + xScale.bandwidth() / 2)
        //     .attr("y", d => yScale(d.Country) + yScale.bandwidth() / 2)
        //     .attr("dy", ".35em")
        //     .attr("text-anchor", "middle")
        //     .text(d => d.Value.toFixed(2))
        //     .style("fill", "black")
        //     .style("font-size", "12px")
        //     .style("font-family", "Oswald, sans-serif")

        // add color key/legend
        const legendWidth = 20;
        const legendHeight = h;
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${w + 40}, 0)`);

        const legendScale = d3.scaleLinear()
            .range([legendHeight, 0])
            .domain([0, d3.max(data, d => d.Value)]);

        const numBoxes = 100; // number of color boxes in the legend
        legend.selectAll("rect")
            .data(d3.range(numBoxes), d => d)
            .enter()
            .append("rect")
            .attr("y", (i) => i * (legendHeight / numBoxes))
            .attr("height", legendHeight / numBoxes)
            .attr("width", legendWidth)
            .attr("fill", d => colorScale(legendScale.invert(d * (legendHeight / numBoxes))));

        // add legend axis
        const legendAxis = d3.axisRight(legendScale)
            .ticks(6)
            .tickFormat(d => d + "%")

        legend.append("g")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis)
            .selectAll("text")
            .style("font-family", "Oswald, sans-serif");
    });
}

window.onload = init;
