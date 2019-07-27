

class Node {
    constructor(position, velocity, color) {
        this.position = position
        this.velocity = velocity
        this.color = color
    }
}

class Graph {
    constructor(nodes, adj_list) {
        this.nodes = nodes
        this.adj_list = adj_list
    }
}

function generate_random_graph(num_nodes) {
    var nodes = []
    var adj_list = []
    var colors = ["#9B7EDE", "#9AEA23", "#f7a278"]
    for (var i = 0; i<num_nodes; i++) {
        position = {x:Math.random()*500, y:Math.random()*500}
        velocity = {x:0, y:0}
        //color = "#9AEA23"
        color =  colors[Math.floor(Math.random()*colors.length)]
        nodes.push(new Node(position, velocity, color))
        adj_list.push([])
    }

    for (var j = 0; j<num_nodes; j++) {
        index1 = Math.floor(Math.random()*num_nodes)
        index2 = Math.floor(Math.random()*num_nodes)
        if (!adj_list[index1].includes(index2)) {
            adj_list[index1].push(index2)
            adj_list[index2].push(index1)
        }
    }

    return new Graph(nodes, adj_list)
}

function setup() {
    var graph = generate_random_graph(20)
    process(graph);
}

function process(graph) {
    setInterval(function() {
        draw(graph)
        spread(graph)
        //preserve_edges(graph)
        dampen_speeds(graph)
        update_positions(graph)
        //console.log(graph)
    }, 10)
}

function draw(graph) {
    //console.log("Drawing...")
    svg = d3.select("#drawing_area");
    svg.selectAll("*").remove();

    // Draw Nodes
    //console.log(graph.adj_list)
    for (var i = 0; i<graph.adj_list.length; i++) {
        //console.log(graph.nodes[i].position.x, graph.nodes[i].position.y)
        row = graph.adj_list[i];
        for (var j = 0; j<row.length; j++) {
            svg.append("line")
                    .attr("stroke-width", "1.5")
                    .attr("stroke", "#888888")
                    .attr("x1", graph.nodes[i].position.x+"")
                    .attr("y1", graph.nodes[i].position.y+"")
                    .attr("x2", graph.nodes[row[j]].position.x+"")
                    .attr("y2", graph.nodes[row[j]].position.y+"");
        }
    }

    // Draw Edges
    for (var i = 0; i<graph.nodes.length; i++) {
        svg.append("circle").attr("cx", graph.nodes[i].position.x+"")
                .attr("cy", graph.nodes[i].position.y+"")
                .attr("fill", graph.nodes[i].color)
                .attr("r", "6");
    }

    // Make sure SVG is updated
    document.getElementById("container").innerHTML += ""
    //console.log(graph)
}

function spread(graph) {
    scaling_factor = 100
    for (var i = 0; i<graph.nodes.length; i++) {
        var a = graph.nodes[i]
        //console.log(a)
        for (var j = 0; j<graph.nodes.length; j++) {
            var b = graph.nodes[j]
            if (i < j) {
                if (!graph.adj_list[i].includes(j)) {
                    var magnitude = scaling_factor / Math.pow(distance(a.position, b.position), 2)
                    var direction = {x: a.position.x-b.position.x, y: a.position.y-b.position.y}
                    normalize(direction)

                    a.velocity.x += magnitude * direction.x
                    a.velocity.y += magnitude * direction.y
                    b.velocity.y += -magnitude * direction.y
                    b.velocity.y += -magnitude * direction.y
                } else {
                    var magnitude = ((40-distance(a.position, b.position)) / scaling_factor)*3
                    console.log(distance(a.position, b.position))
                    var direction = {x: a.position.x-b.position.x, y: a.position.y-b.position.y}
                    normalize(direction)

                    a.velocity.x += magnitude * direction.x
                    a.velocity.y += magnitude * direction.y
                    b.velocity.x += -magnitude * direction.x
                    b.velocity.y += -magnitude * direction.y
                }
            }
        }
    }
}

function normalize(vec) {
    var mag = magnitude(vec)
    vec.x /= mag
    vec.y /= mag
}

function dampen_speeds(graph) {
    for (var i = 0; i<graph.nodes.length; i++) {
        node = graph.nodes[i]
        node.velocity.x *= 0.85;
        node.velocity.y *= 0.85;
    }
}

function update_positions(graph) {
    for (var i = 0; i<graph.nodes.length; i++) {
        node = graph.nodes[i]
        node.position.x += node.velocity.x
        node.position.y += node.velocity.y
    }
}

function distance(a, b) {
    //console.log("a, b", a, b)
    return Math.sqrt(Math.pow((a.x-b.x), 2) + Math.pow((a.y-b.y), 2))
}

function magnitude(a) {
    return distance(a, {x:0, y:0})
}
