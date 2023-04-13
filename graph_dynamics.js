class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	magnitude() {
		return this.distance(new Vector(0, 0));
	}

	normalize() {
		return this.scale(1 / this.magnitude());
	}

	scale(c) {
		return new Vector(c * this.x, c * this.y);
	}

	add(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	distance(v) {
		return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
	}
}

class Node {
	constructor(position, velocity, color) {
		this.position = position;
		this.velocity = velocity;
		this.color = color;
		this.beingDragged = false;
	}
}

class Graph {
	constructor(nodes, adj_list) {
		this.nodes = nodes;
		this.adj_list = adj_list;
	}
}

function generate_random_graph(num_nodes) {
	// Initializing Lists
	var nodes = [];
	var adj_list = [];
	var colors = ["#9B7EDE", "#9AEA23", "#f7a278"];

	svgElement = document.getElementById("mainSVG");
	let width = mainSVG.clientWidth;
	let height = mainSVG.clientHeight;

	// Making Nodes
	for (var i = 0; i < num_nodes; i++) {
		var position = new Vector(
			Math.random() * width,
			Math.random() * height
		);
		var velocity = new Vector(0, 0);
		var color = colors[Math.floor(Math.random() * colors.length)];

		nodes.push(new Node(position, velocity, color));
		adj_list.push([]);
	}

	// Add Connections
	for (var j = 0; j < num_nodes; j++) {
		index1 = Math.floor(Math.random() * num_nodes);
		index2 = Math.floor(Math.random() * num_nodes);
		if (!adj_list[index1].includes(index2)) {
			adj_list[index1].push(index2);
			adj_list[index2].push(index1);
		}
	}

	// Generate Graph
	return new Graph(nodes, adj_list);
}

function setup() {
	var graph = generate_random_graph(40);
	process(graph);
}

function process(graph) {
	initial_draw(graph);
	setInterval(function () {
		spread(graph, 100);
		dampen_speeds(graph);
		update_positions(graph);
		draw(graph);
	}, 10);
}

function create_edge_list(graph) {
	let edge_list = [];

	for (let i = 0; i < graph.adj_list.length; i++) {
		for (let j = 0; j < graph.adj_list[i].length; j++) {
			let start = graph.nodes[i];
			let end = graph.nodes[graph.adj_list[i][j]];
			//console.log(start, end);
			if (i < graph.adj_list[i][j]) {
				edge_list.push({ start: start, end: end });
			}
		}
	}

	return edge_list;
}

function initial_draw(graph) {
	svg = d3.select("#drawing_area");

	// Draw Edges
	let edge_list = create_edge_list(graph);

	svg.selectAll("line")
		.data(edge_list)
		.enter()
		.append("line")
		.attr("stroke-width", "6")
		.attr("stroke", "#888888")
		.attr("x1", (d, _i) => {
			return String(d.start.position.x);
		})
		.attr("y1", (d, _i) => {
			return String(d.start.position.y);
		})
		.attr("x2", (d, _i) => {
			return String(d.end.position.x);
		})
		.attr("y2", (d, _i) => {
			return String(d.end.position.y);
		});

	// Draw Nodes
	svg.selectAll("circle")
		.data(graph.nodes)
		.enter()
		.append("circle")
		.attr("cx", (d, _i) => {
			return String(d.position.x);
		})
		.attr("cy", (d, _i) => {
			return String(d.position.y);
		})
		.attr("fill", (d, _i) => {
			return d.color;
		})
		.attr("r", "16")
		.on("mousedown", (d, _i) => {
			d.beingDragged = true;
		})
		.on("mouseup", (d, _i) => {
			d.beingDragged = false;
		});

	d3.select("#mainSVG").on("mousemove", () => {
		svg.selectAll("circle").each((d, _i) => {
			//console.log(d, i);
			if (d.beingDragged) {
				d.position.x = d3.event.x;
				d.position.y = d3.event.y;
			}
		});
	});
}

function draw(graph) {
	svg = d3.select("#drawing_area");

	// Redraw edges
	let edge_list = create_edge_list(graph);

	d3.selectAll("line")
		.data(edge_list)
		.each(function (d, _i) {
			//console.log(d.start.position, d.end.position);
			d3.select(this)
				.attr("x1", d.start.position.x)
				.attr("y1", d.start.position.y)
				.attr("x2", d.end.position.x)
				.attr("y2", d.end.position.y);
		});

	// Redraw Nodes
	d3.selectAll("circle")
		.data(graph.nodes)
		.each(function (d, _i) {
			//console.log(d);
			d3.select(this).attr("cx", d.position.x).attr("cy", d.position.y);
		});
}

function spread(graph, scaling_factor) {
	for (var i = 0; i < graph.nodes.length; i++) {
		var a = graph.nodes[i];
		for (var j = 0; j < graph.nodes.length; j++) {
			var b = graph.nodes[j];
			if (i < j) {
				if (!graph.adj_list[i].includes(j)) {
					// Pushes away disconnected pieces
					var magnitude =
						scaling_factor /
						Math.pow(a.position.distance(b.position), 1.8);
				} else {
					// Forces unit seperation with connected pieces
					var magnitude =
						(100 - a.position.distance(b.position)) /
						scaling_factor;
				}
				var direction = a.position
					.add(b.position.scale(-1))
					.normalize();

				a.velocity = a.velocity.add(direction.scale(magnitude));
				b.velocity = b.velocity.add(direction.scale(-magnitude));
			}
		}
	}
}

function dampen_speeds(graph) {
	for (var i = 0; i < graph.nodes.length; i++) {
		node = graph.nodes[i];
		node.velocity = node.velocity.scale(0.9);
	}
}

function update_positions(graph) {
	for (var i = 0; i < graph.nodes.length; i++) {
		node = graph.nodes[i];
		if (!node.beingDragged) {
			node.position = node.position.add(node.velocity);
		}
	}
}
