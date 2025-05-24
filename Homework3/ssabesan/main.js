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
    const gBar = container.append("g")
        .attr("transform", `translate(${margin.left}, ${100})`);

    gBar.append("text")
        .attr("x", barWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Count of Pokémon by Primary Type");

    const typeCounts = Array.from(d3.rollup(data, v => v.length, d => d.Type_1), 
                                  ([key, value]) => ({ type: key, count: value }));

    const xBar = d3.scaleBand().domain(typeCounts.map(d => d.type)).range([0, barWidth]).padding(0.2);
    const yBar = d3.scaleLinear().domain([0, d3.max(typeCounts, d => d.count)]).range([barHeight, 0]);

    gBar.append("g")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    gBar.append("g").call(d3.axisLeft(yBar));

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

    gBar.selectAll("rect")
        .data(typeCounts)
        .enter()
        .append("rect")
        .attr("x", d => xBar(d.type))
        .attr("y", d => yBar(d.count))
        .attr("width", xBar.bandwidth())
        .attr("height", d => barHeight - yBar(d.count))
        .style("fill", d => color(d.type))
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            const selectedType = d.type;
            gScatter.selectAll("circle")
                .transition().duration(500)
                .style("opacity", c => c.Type_1 === selectedType ? 0.8 : 0.05)
                .attr("r", c => c.Type_1 === selectedType ? 6 : 3);
            gParallel.selectAll("path")
                .transition().duration(500)
                .style("stroke", p => p.Type_1 === selectedType ? color(p.Type_1) : "#ccc")
                .style("opacity", p => p.Type_1 === selectedType ? 0.8 : 0.1);
        });

    // ========== SCATTER PLOT ========== //
    const scatterWidth = 350, scatterHeight = 250;
    const gScatter = container.append("g")
        .attr("transform", `translate(${barWidth + margin.left * 3}, 100)`);

    gScatter.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("HP vs. Attack");

    const xScatter = d3.scaleLinear().domain([0, d3.max(data, d => d.HP)]).range([0, scatterWidth]);
    const yScatter = d3.scaleLinear().domain([0, d3.max(data, d => d.Attack)]).range([scatterHeight, 0]);

    gScatter.append("g")
        .attr("transform", `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(xScatter));

    gScatter.append("g").call(d3.axisLeft(yScatter));

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

    gScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScatter(d.HP))
        .attr("cy", d => yScatter(d.Attack))
        .attr("r", 4)
        .style("fill", d => color(d.Type_1))
        .style("opacity", 0.7);

    const brush = d3.brush()
        .extent([[0, 0], [scatterWidth, scatterHeight]])
        .on("brush end", brushed);

    gScatter.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        const selectedPoints = data.filter(d =>
            xScatter(d.HP) >= x0 && xScatter(d.HP) <= x1 &&
            yScatter(d.Attack) >= y0 && yScatter(d.Attack) <= y1
        );

        // Use object references instead of relying on d.Name
        const selectedSet = new Set(selectedPoints);

        gParallel.selectAll("path")
            .transition().duration(500)
            .style("stroke", d => selectedSet.has(d) ? color(d.Type_1) : "#ccc")
            .style("opacity", d => selectedSet.has(d) ? 0.8 : 0.1);
    }


    // ========== PARALLEL COORDINATES ========== //
    const parallelWidth = 1100, parallelHeight = 250;
    const gParallel = container.append("g")
        .attr("transform", `translate(${margin.left}, ${scatterHeight + 220})`);

    gParallel.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Parallel Coordinates of Pokémon Stats");

    const dimensions = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
    const yParallel = {};
    for (let dim of dimensions) {
        yParallel[dim] = d3.scaleLinear().domain([0, d3.max(data, d => d[dim])]).range([parallelHeight, 0]);
    }

    const xParallel = d3.scalePoint().domain(dimensions).range([0, parallelWidth]);

    function path(d) {
        return d3.line()(dimensions.map(p => [xParallel(p), yParallel[p](d[p])]));
    }

    gParallel.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", d => color(d.Type_1))
        .style("opacity", 0.3);

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
    const legend = container.append("g")
        .attr("transform", `translate(${barWidth + scatterWidth + margin.left * 5}, 20)`);

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

function resetSelection() {
    d3.selectAll("circle")
        .transition().duration(500)
        .style("opacity", 0.7)
        .attr("r", 4);

    d3.selectAll("path")
        .transition().duration(500)
        .style("stroke", d => color(d.Type_1))
        .style("opacity", 0.3);
}
