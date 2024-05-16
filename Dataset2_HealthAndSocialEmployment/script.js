function init() {
    var w = 1300;
    var h = 500;
    var margin = { top: 20, right: 20, bottom: 50, left: 80 };

    var svg = d3.select("#chart").append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleBand()
                   .range([0, w - margin.left - margin.right])
                   .padding(0.1);

    var yScale = d3.scaleLinear()
                   .range([h - margin.top - margin.bottom, 0]);

    // create colour scale
    var colorScale = d3.scaleLinear()
                       .range(["lightgreen", "darkgreen"]);

    var xAxisGroup = svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (h - margin.top - margin.bottom) + ")");

    var yAxisGroup = svg.append("g")
                        .attr("class", "y axis");

    var fullData, globalMaxValue, currentYear, lastSortFunc;

    d3.csv("health_social_employment_cleaned.csv", function(d) {
        d.Value = +d.Value;
        d.Year = +d.Year;
        return d;
    }).then(function(data) {
        fullData = data;
        globalMaxValue = d3.max(data, function(d) { return d.Value; });
        currentYear = +d3.select("#yearSlider").property("value");
        colorScale.domain([0, globalMaxValue]);
        updateChart(); 
    });

    function updateChart() {
        svg.selectAll("rect").remove(); // existing bars are removed

        var yearData = fullData.filter(d => d.Year === currentYear);

        if (lastSortFunc) {
            yearData = lastSortFunc(yearData);
        }

        xScale.domain(yearData.map(d => d.Country));
        yScale.domain([0, globalMaxValue]);

        xAxisGroup.call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        yAxisGroup.call(d3.axisLeft(yScale));

        var bars = svg.selectAll("rect")
                      .data(yearData, d => d.Country);

        bars.enter()
            .append("rect")
            .attr("x", d => xScale(d.Country))
            .attr("y", d => yScale(d.Value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => h - margin.top - margin.bottom - yScale(d.Value))
            .attr("fill", d => colorScale(d.Value))
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(100).style("fill", "orange");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition().duration(100).style("fill", colorScale(d.Value));
            });
    }

    function applySortAndFilter(sortFunc) {
        lastSortFunc = sortFunc; // store the last sort function
        updateChart();
    }

    // button and slider event handlers
    d3.select("#allCountries").on("click", () => { lastSortFunc = null; updateChart(); });
    d3.select("#top10").on("click", () => applySortAndFilter(data => data.sort((a, b) => b.Value - a.Value).slice(0, 10)));
    d3.select("#bottom10").on("click", () => applySortAndFilter(data => data.sort((a, b) => a.Value - b.Value).slice(0, 10)));
    d3.select("#sortAscending").on("click", () => applySortAndFilter(data => data.sort((a, b) => a.Value - b.Value)));
    d3.select("#sortDescending").on("click", () => applySortAndFilter(data => data.sort((a, b) => b.Value - a.Value)));

    d3.select("#yearSlider").on("input", function() {
        currentYear = +this.value;
        d3.select("#yearLabel").text("Year: " + currentYear);
        updateChart(); // reapply last sort function
    });
}

window.onload = init;
