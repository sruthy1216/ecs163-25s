// main.js for Pokemon Dataset Dashboard
const width = 1200;
const height = 1200;

let barLeft = 0, barTop = 0;
let barMargin = {top: 10, right: 30, bottom: 50, left: 60},
    barWidth = 800 - barMargin.left - barMargin.right,
    barHeight = 250 - barMargin.top - barMargin.bottom;

let scatterLeft = 0, scatterTop = 300;
let scatterMargin = {top: 10, right: 30, bottom: 50, left: 60},
    scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let parallelLeft = 0, parallelTop = 700;
let parallelMargin = {top: 10, right: 30, bottom: 50, left: 60},
    parallelWidth = width - parallelMargin.left - parallelMargin.right,
    parallelHeight = height - 850 - parallelMargin.top - parallelMargin.bottom;

d3.csv("data/pokemon_alopez247.csv").then(data => {
    console.log("Loaded data", data);

    data.forEach(d => {
        d.HP = +d.HP;
        d.Attack = +d.Attack;
        d.Defense = +d.Defense;
        d.Sp_Atk = +d.Sp_Atk;
        d.Sp_Def = +d.Sp_Def;
        d.Speed = +d.Speed;
    });

    const svg = d3.select("svg").attr("width", width).attr("height", height);
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // BAR CHART
    console.log("Rendering bar chart");
    const g2 = svg.append("g")
        .attr("transform", `translate(${barLeft + barMargin.left}, ${barTop + barMargin.top})`);

    const typeCounts = Array.from(d3.rollup(data, v => v.length, d => d.Type_1), ([key, value]) => ({type: key, count: value}));
    const x2 = d3.scaleBand().domain(typeCounts.map(d => d.type)).range([0, barWidth]).padding(0.2);
    const y2 = d3.scaleLinear().domain([0, d3.max(typeCounts, d => d.count)]).range([barHeight, 0]);

    g2.append("g").attr("transform", `translate(0,${barHeight})`).call(d3.axisBottom(x2)).selectAll("text")
        .attr("transform", "rotate(-40)").style("text-anchor", "end");
    g2.append("g").call(d3.axisLeft(y2));

    g2.append("text").attr("x", barWidth / 2).attr("y", barHeight + 40)
        .style("text-anchor", "middle").text("Type 1");
    g2.append("text").attr("transform", "rotate(-90)").attr("x", -barHeight / 2).attr("y", -40)
        .style("text-anchor", "middle").text("Count");

    g2.selectAll("rect").data(typeCounts).enter().append("rect")
        .attr("x", d => x2(d.type)).attr("y", d => y2(d.count))
        .attr("width", x2.bandwidth()).attr("height", d => barHeight - y2(d.count))
        .style("fill", "steelblue");

    // SCATTER PLOT
    console.log("Rendering scatter plot");
    const g1 = svg.append("g")
        .attr("transform", `translate(${scatterLeft + scatterMargin.left}, ${scatterTop + scatterMargin.top})`);

    const x1 = d3.scaleLinear().domain([0, d3.max(data, d => d.HP)]).range([0, scatterWidth]);
    const y1 = d3.scaleLinear().domain([0, d3.max(data, d => d.Attack)]).range([scatterHeight, 0]);

    g1.append("g").attr("transform", `translate(0,${scatterHeight})`).call(d3.axisBottom(x1));
    g1.append("g").call(d3.axisLeft(y1));

    g1.append("text").attr("x", scatterWidth / 2).attr("y", scatterHeight + 40)
        .style("text-anchor", "middle").text("HP");
    g1.append("text").attr("transform", "rotate(-90)").attr("x", -scatterHeight / 2).attr("y", -40)
        .style("text-anchor", "middle").text("Attack");

    g1.selectAll("circle").data(data).enter().append("circle")
        .attr("cx", d => x1(d.HP)).attr("cy", d => y1(d.Attack)).attr("r", 4)
        .style("fill", d => color(d.Type_1)).style("opacity", 0.7);

    // PARALLEL COORDINATES
    console.log("Rendering parallel coordinates");
    const g3 = svg.append("g")
        .attr("transform", `translate(${parallelLeft + parallelMargin.left}, ${parallelTop + parallelMargin.top})`);

    const dimensions = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
    const y3 = {};
    for (let dim of dimensions) {
        y3[dim] = d3.scaleLinear().domain([0, d3.max(data, d => d[dim])]).range([parallelHeight, 0]);
    }
    const x3 = d3.scalePoint().domain(dimensions).range([0, parallelWidth]);

    function path(d) {
        return d3.line()(dimensions.map(p => [x3(p), y3[p](d[p])]));
    }

    g3.selectAll("path").data(data).enter().append("path")
        .attr("d", path).style("fill", "none").style("stroke", d => color(d.Type_1)).style("opacity", 0.3);

    g3.selectAll("g.axis").data(dimensions).enter().append("g")
        .attr("transform", d => `translate(${x3(d)},0)`).each(function(d) {
            d3.select(this).call(d3.axisLeft(y3[d]));
        }).append("text")
        .attr("y", -9).attr("text-anchor", "middle").text(d => d).style("fill", "black");

    g3.append("text").attr("x", parallelWidth / 2).attr("y", -20)
        .style("text-anchor", "middle").text("Parallel Coordinates of Stats");

}).catch(console.error);
