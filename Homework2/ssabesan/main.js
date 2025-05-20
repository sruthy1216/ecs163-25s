// Set the margins around the visualizations
const margin = { top: 20, right: 20, bottom: 50, left: 60 };

// Define a color scale for Pokémon types using a consistent categorical palette
const color = d3.scaleOrdinal(d3.schemeTableau10);

// Load Pokémon dataset from CSV
d3.csv("data/pokemon_alopez247.csv").then(data => {

    // Convert relevant string fields to numbers for plotting
    data.forEach(d => {
        d.HP = +d.HP;
        d.Attack = +d.Attack;
        d.Defense = +d.Defense;
        d.Sp_Atk = +d.Sp_Atk;
        d.Sp_Def = +d.Sp_Def;
        d.Speed = +d.Speed;
    });

    // Create the main SVG container that will hold all views
    const container = d3.select("#dashboard")
        .append("svg")
        .attr("viewBox", "0 0 1200 800")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    // ========== BAR CHART ========== //
    const barWidth = 350, barHeight = 250;

    // Create group for bar chart and position it
    const gBar = container.append("g")
        .attr("transform", `translate(${margin.left}, ${100})`);

    // Add title to bar chart
    gBar.append("text")
        .attr("x", barWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Count of Pokémon by Primary Type");

    // Count how many Pokémon are in each primary type
    const typeCounts = Array.from(d3.rollup(data, v => v.length, d => d.Type_1), 
                                  ([key, value]) => ({ type: key, count: value }));

    // X and Y scales for bar chart
    const xBar = d3.scaleBand().domain(typeCounts.map(d => d.type)).range([0, barWidth]).padding(0.2);
    const yBar = d3.scaleLinear().domain([0, d3.max(typeCounts, d => d.count)]).range([barHeight, 0]);

    // Add x-axis with rotated labels
    gBar.append("g")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    // Add y-axis
    gBar.append("g").call(d3.axisLeft(yBar));

    // Axis labels
    gBar.append("text")
        .attr("x", barWidth / 2)
        .attr("y", barHeight + 40)
        .attr("text-anchor", "middle")
        .text("Type");

    gBar.append("text")
        .attr("x", -barHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Count");

    // Create bars
    gBar.selectAll("rect")
        .data(typeCounts)
        .enter()
        .append("rect")
        .attr("x", d => xBar(d.type))
        .attr("y", d => yBar(d.count))
        .attr("width", xBar.bandwidth())
        .attr("height", d => barHeight - yBar(d.count))
        .style("fill", d => color(d.type));

    // ========== SCATTER PLOT ========== //
    const scatterWidth = 350, scatterHeight = 250;

    // Create group for scatter plot
    const gScatter = container.append("g")
        .attr("transform", `translate(${barWidth + margin.left * 3}, 100)`);

    // Add title to scatter plot
    gScatter.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("HP vs. Attack");

    // Define x and y scales
    const xScatter = d3.scaleLinear().domain([0, d3.max(data, d => d.HP)]).range([0, scatterWidth]);
    const yScatter = d3.scaleLinear().domain([0, d3.max(data, d => d.Attack)]).range([scatterHeight, 0]);

    // Add axes
    gScatter.append("g")
        .attr("transform", `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(xScatter));

    gScatter.append("g").call(d3.axisLeft(yScatter));

    // Axis labels
    gScatter.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("text-anchor", "middle")
        .text("HP");

    gScatter.append("text")
        .attr("x", -scatterHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Attack");

    // Draw scatter plot circles
    gScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScatter(d.HP))
        .attr("cy", d => yScatter(d.Attack))
        .attr("r", 4)
        .style("fill", d => color(d.Type_1))
        .style("opacity", 0.7);

    // ========== PARALLEL COORDINATES ========== //
    const parallelWidth = 1100, parallelHeight = 250;

    // Create group for parallel coordinates plot
    const gParallel = container.append("g")
        .attr("transform", `translate(${margin.left}, ${scatterHeight + 220})`);

    // Add title
    gParallel.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Parallel Coordinates of Pokémon Stats");

    // Define dimensions and scales for each axis
    const dimensions = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
    const yParallel = {};
    for (let dim of dimensions) {
        yParallel[dim] = d3.scaleLinear().domain([0, d3.max(data, d => d[dim])]).range([parallelHeight, 0]);
    }

    // X scale for positioning dimensions
    const xParallel = d3.scalePoint().domain(dimensions).range([0, parallelWidth]);

    // Function to draw path for a Pokémon's stats
    function path(d) {
        return d3.line()(dimensions.map(p => [xParallel(p), yParallel[p](d[p])]));
    }

    // Draw one path per Pokémon
    gParallel.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", d => color(d.Type_1))
        .style("opacity", 0.3);

    // Draw axes and labels for each stat dimension
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

    // ========== LEGEND ========== //

    // Create a group for the legend and position it
    const legend = container.append("g")
        .attr("transform", `translate(${barWidth + scatterWidth + margin.left * 5}, 20)`);

    // Get all unique types and draw color swatches + labels
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

}).catch(console.error); // Handle CSV loading errors