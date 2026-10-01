let data;
let lines;

const renderVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0.01 * containerHeight,
        right: 0.01 * containerWidth,
        bottom: 0.01 * containerHeight,
        left: 0.01 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select(`#visualization`);
    const chartArea = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.places.length - 1)]).range([0, height]);
    const xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);

    const colourMap = {
        "me": "#6da34d",
        "mom": "#7d70ba",
        "dad": "#820000",
        "step mom": "#e3170a",
        "step dad": "#840057",
        "step brother 1": "#F1DB4B",
        "step sister 1": "#F3B132 ",
        "step brother 2": "#F68819",
        "step sister 2": "#F85E00",
        "step brother 3": "#af538f",
        "step brother 4": "#70486c",
        "half sister": "#0c57d1"
    };

    const lineWidth = width / 78;
    const modifiedData = JSON.parse(JSON.stringify(data));
    modifiedData.forEach((d, i) => {
        const xModifier = (i === 0) ? -5 * lineWidth : 0;
        d.places = d.places.map((p, j) => { return { x: xScale(p.x) + (6 - i) * lineWidth + (j < 3 ? xModifier : 0), y: yScale(p.y) } });
        previous = d.places[0];
        const newPlaces = [];
        d.places.forEach((p, j) => {
            newPlaces.push(previous);
            if (p.x > previous.x) {
                newPlaces.push({ x: previous.x, y: (previous.y + p.y) / 2 - ((6 - i) * lineWidth) * (i < 2 ? 1/6 : 1) * ((i === 7 || i === 8) && j > 10 ? 0 : 1)});
                newPlaces.push({ x: p.x, y: (previous.y + p.y) / 2 - ((6 - i) * lineWidth) * (i < 2 ? 1/6 : 1) * ((i === 7 || i === 8) && j > 10 ? 0 : 1)});
            } else if (p.x < previous.x) {
                newPlaces.push({ x: previous.x, y: (previous.y + p.y) / 2 + (6 - i) * lineWidth * ((i === 7 || i === 8) && j > 10 ? 0 : 1)});
                newPlaces.push({ x: p.x, y: (previous.y + p.y) / 2 + (6 - i) * lineWidth * ((i === 7 || i === 8) && j > 10 ? 0 : 1)});
            }
            previous = p;
        });
        newPlaces.push(previous);
        d.places = newPlaces;
    });

    chartArea.selectAll("path")
        .data(modifiedData)
        .join("path")
        .attr("fill", d => "none")
        .attr("stroke", d => colourMap[d.name])
        .attr("stroke-width", lineWidth)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", (d, i) => d3.line().x(p => p.x).y(p => p.y).curve(d3.curveLinear)(d.places));

    modifiedData.splice(7, 1);

    chartArea.selectAll(".legend-line")
        .data(modifiedData.reverse())
        .join("path")
        .attr("class", "legend-line")
        .attr("fill", "none")
        .attr("stroke", d => colourMap[d.name])
        .attr("stroke-width", lineWidth)
        .attr("stroke-linecap", "round")
        .attr("d", (_, i) => {
            const path = d3.path();
            path.moveTo(0, (i + 3) * height / 30);
            path.lineTo(width * 0.10, (i + 3) * height / 30);
            return path;
        });

    chartArea.selectAll(".legend-text")
        .data(modifiedData)
        .join("text")
        .attr("class", "legend-text")
        .attr("text-multiplier", 0.5)
        .attr("transform", (_, i) => `translate(${width * 0}, ${(i + 2.8) * height / 30})`)
        .attr("dominant-baseline", "bottom")
        .attr("text-anchor", "start")
        .text(d => d.name);
};

const resizeAndRender = () => {
    d3.selectAll("#visualization > *").remove();

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("visualization").clientHeight });
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/data.json')]).then(([_data]) => {
    data = _data;
    data.forEach(d => {
        d.places = d.places.map((p, i) => { return { x: p - 1, y: i + (20 - d.places.length) } });
    });

    resizeAndRender();
});