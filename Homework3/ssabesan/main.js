// set the margins around the visualizations
const margin = { top: 20, right: 20, bottom: 50, left: 60 };

// define a color scale using a preset color palette (tableau10)
const color = d3.scaleOrdinal(d3.schemeTableau10);

// load the csv data file asynchronously
d3.csv("data/pokemon_alopez247.csv").then(data => {

    // convert numeric fields from strings to numbers
    data.forEach(d => {
        d.HP = +d.HP;
        d.Attack = +d.Attack;
        d.Defense = +d.Defense;
        d.Sp_Atk = +d.Sp_Atk;
        d.Sp_Def = +d.Sp_Def;
        d.Speed = +d.Speed;
    });

    // create the main svg element and attach it to the #dashboard div
    const container = d3.select("#dashboard")
        .append("svg") // create the svg element
        .attr("viewBox", "0 0 1200 800") // make svg responsive
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    // ================= bar chart =================

    const barWidth = 350, barHeight = 250;

    // create a group element for the bar chart
    const gBar = container.append("g")
        .attr("transform", `translate(${margin.left}, ${100})`);

    // add chart title
    gBar.append("text")
        .attr("x", barWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Count of Pokémon by Primary Type");

    // group and count data by type using d3.rollup
    const typeCounts = Array.from(d3.rollup(data, v => v.length, d => d.Type_1), 
        ([key, value]) => ({ type: key, count: value }));

    // create a band scale for x-axis (categorical)
    const xBar = d3.scaleBand()
        .domain(typeCounts.map(d => d.type)) // get all type names
        .range([0, barWidth]) // map to pixel range
        .padding(0.2); // space between bars

    // create a linear scale for y-axis (counts)
    const yBar = d3.scaleLinear()
        .domain([0, d3.max(typeCounts, d => d.count)])
        .range([barHeight, 0]);

    // create bottom x-axis
    gBar.append("g")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(xBar)) // generate axis from scale
        .selectAll("text")
        .attr("transform", "rotate(-40)") // tilt labels
        .style("text-anchor", "end");

    // create left y-axis
    gBar.append("g").call(d3.axisLeft(yBar));

    // add x-axis label
    gBar.append("text")
        .attr("x", barWidth / 2)
        .attr("y", barHeight + 40)
        .attr("text-anchor", "middle")
        .text("Type");

    // add y-axis label
    gBar.append("text")
        .attr("x", -barHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Count");

    // create bars for each type
    gBar.selectAll("rect")
        .data(typeCounts)
        .enter()
        .append("rect")
        .attr("x", d => xBar(d.type)) // x position of bar
        .attr("y", d => yBar(d.count)) // top y position
        .attr("width", xBar.bandwidth()) // bar width from scale
        .attr("height", d => barHeight - yBar(d.count)) // calculate height
        .style("fill", d => color(d.type)) // fill color by type
        .style("cursor", "pointer") // cursor changes on hover
        .on("click", function (event, d) {
            // highlight same-type elements in other views
            const selectedType = d.type;

            // update scatter plot circles
            gScatter.selectAll("circle")
                .transition().duration(500)
                .style("opacity", c => c.Type_1 === selectedType ? 0.8 : 0.05)
                .attr("r", c => c.Type_1 === selectedType ? 6 : 3);

            // update parallel lines
            gParallel.selectAll("path")
                .transition().duration(500)
                .style("stroke", p => p.Type_1 === selectedType ? color(p.Type_1) : "#ccc")
                .style("opacity", p => p.Type_1 === selectedType ? 0.8 : 0.1);
        });

    // ================= scatter plot =================

    const scatterWidth = 350, scatterHeight = 250;

    // group for scatter plot
    const gScatter = container.append("g")
        .attr("transform", `translate(${barWidth + margin.left * 3}, 100)`);

    // add title
    gScatter.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("HP vs. Attack");

    // x-axis: hp values
    const xScatter = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.HP)])
        .range([0, scatterWidth]);

    // y-axis: attack values
    const yScatter = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Attack)])
        .range([scatterHeight, 0]);

    // append x-axis
    gScatter.append("g")
        .attr("transform", `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(xScatter));

    // append y-axis
    gScatter.append("g").call(d3.axisLeft(yScatter));

    // x-axis label
    gScatter.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("text-anchor", "middle")
        .text("HP");

    // y-axis label
    gScatter.append("text")
        .attr("x", -scatterHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Attack");

    // draw circles for each pokémon
    gScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScatter(d.HP))
        .attr("cy", d => yScatter(d.Attack))
        .attr("r", 4)
        .style("fill", d => color(d.Type_1))
        .style("opacity", 0.7);

    // create a brush for selecting points
    const brush = d3.brush()
        .extent([[0, 0], [scatterWidth, scatterHeight]])
        .on("brush end", brushed); // attach event handler

    gScatter.append("g")
        .attr("class", "brush")
        .call(brush);

    // brushed function updates the parallel coordinates view
    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        // filter data points inside brush area
        const selectedPoints = data.filter(d =>
            xScatter(d.HP) >= x0 && xScatter(d.HP) <= x1 &&
            yScatter(d.Attack) >= y0 && yScatter(d.Attack) <= y1
        );

        // create a set of selected data references
        const selectedSet = new Set(selectedPoints);

        // highlight lines in parallel plot
        gParallel.selectAll("path")
            .transition().duration(500)
            .style("stroke", d => selectedSet.has(d) ? color(d.Type_1) : "#ccc")
            .style("opacity", d => selectedSet.has(d) ? 0.8 : 0.1);
    }

    // ================= parallel coordinates =================

    const parallelWidth = 1100, parallelHeight = 250;

    const gParallel = container.append("g")
        .attr("transform", `translate(${margin.left}, ${scatterHeight + 220})`);

    // chart title
    gParallel.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Parallel Coordinates of Pokémon Stats");

    const dimensions = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
    const yParallel = {};

    // create y-scale for each stat
    for (let dim of dimensions) {
        yParallel[dim] = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[dim])])
            .range([parallelHeight, 0]);
    }

    // x-position for each dimension label
    const xParallel = d3.scalePoint()
        .domain(dimensions)
        .range([0, parallelWidth]);

    // generate a path for a pokémon's stats
    function path(d) {
        return d3.line()(dimensions.map(p => [xParallel(p), yParallel[p](d[p])]));
    }

    // draw all stat lines
    gParallel.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", d => color(d.Type_1))
        .style("opacity", 0.3);

    // create a y-axis for each stat dimension
    gParallel.selectAll("g.axis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xParallel(d)},0)`)
        .each(function(d) {
            d3.select(this).call(d3.axisLeft(yParallel[d]));
        })
        .append("text")
        .attr("y", -9)
        .attr("text-anchor", "middle")
        .text(d => d)
        .style("fill", "black");

    // ================= legend =================

    const legend = container.append("g")
        .attr("transform", `translate(${barWidth + scatterWidth + margin.left * 5}, 20)`);

    // create one row per type in the legend
    const types = [...new Set(data.map(d => d.Type_1))];
    types.forEach((type, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);

        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(type));

        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(type)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });

}).catch(console.error);

// reset function for clearing all interactions
function resetSelection() {
    // reset all scatter plot circles to default appearance
    d3.selectAll("circle")
        .transition() // animate the change
        .duration(500) // transition lasts 500ms
        .style("opacity", 0.7) // reset opacity to default
        .attr("r", 4); // reset circle radius to default size

    // reset all parallel coordinate lines to default appearance
    d3.selectAll("path")
        .transition() // animate the change
        .duration(500) // transition lasts 500ms
        .style("stroke", d => color(d.Type_1)) // restore original stroke color
        .style("opacity", 0.3); // reset line transparency to default
}
