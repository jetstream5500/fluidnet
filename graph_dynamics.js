class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    magnitude() {
        return this.distance(new Vector(0, 0));
    }

    normalize() {
        return this.scale(1/this.magnitude());
    }

    scale(c) {
        return new Vector(c * this.x, c * this.y);
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    distance(v) {
        return Math.sqrt(Math.pow((this.x-v.x), 2) + Math.pow((this.y-v.y), 2));
    }
}

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
    // Initializing Lists
    var nodes = []
    var adj_list = []
    var colors = ["#9B7EDE", "#9AEA23", "#f7a278"]

    // Making Nodes
    for (var i = 0; i<num_nodes; i++) {
        var position = new Vector(Math.random()*500, Math.random()*500)
        var velocity = new Vector(0, 0)
        var color =  colors[Math.floor(Math.random()*colors.length)]

        nodes.push(new Node(position, velocity, color))
        adj_list.push([])
    }

    // Add Connections
    for (var j = 0; j<num_nodes; j++) {
        index1 = Math.floor(Math.random()*num_nodes)
        index2 = Math.floor(Math.random()*num_nodes)
        if (!adj_list[index1].includes(index2)) {
            adj_list[index1].push(index2)
            adj_list[index2].push(index1)
        }
    }

    // Generate Graph
    return new Graph(nodes, adj_list)
}

function setup() {
    var graph = generate_random_graph(40)
    process(graph);
}

function process(graph) {
    setInterval(function() {
        draw(graph)
        spread(graph, 100)
        dampen_speeds(graph)
        update_positions(graph)
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

function spread(graph, scaling_factor) {
    for (var i = 0; i<graph.nodes.length; i++) {
        var a = graph.nodes[i]
        for (var j = 0; j<graph.nodes.length; j++) {
            var b = graph.nodes[j]
            if (i < j) {
                if (!graph.adj_list[i].includes(j)) {
                    // Pushes away disconnected pieces
                    var magnitude = scaling_factor / Math.pow(a.position.distance(b.position), 2)
                } else {
                    // Forces unit seperation with connected pieces
                    var magnitude = ((35-a.position.distance(b.position)) / scaling_factor)
                }
                var direction = a.position.add(b.position.scale(-1)).normalize()

                a.velocity = a.velocity.add(direction.scale(magnitude))
                b.velocity = b.velocity.add(direction.scale(-magnitude))
            }
        }
    }
}

function dampen_speeds(graph) {
    for (var i = 0; i<graph.nodes.length; i++) {
        node = graph.nodes[i]
        node.velocity = node.velocity.scale(0.9)
    }
}

function update_positions(graph) {
    for (var i = 0; i<graph.nodes.length; i++) {
        node = graph.nodes[i]
        node.position = node.position.add(node.velocity)
    }
}
