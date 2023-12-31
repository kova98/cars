let whitePoints = [];
const width = 800;
const height = 800;
const minDistance = 15;

const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim();

let goalPoint;
let startPoint;

const stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
});

const layer = new Konva.Layer();

let car;

const cars = [];
// function loop() {
//   cars.forEach((car) => {
//     if (!car.isMoving) {
//       const randomPoint = whitePoints[Math.floor(Math.random() * whitePoints.length)];
//       const randomNode = layer.find((node) => node.attrs.x === randomPoint.x && node.attrs.y === randomPoint.y)[0];
//       const startNode = whitePoints.find(
//         (p) => p.x === car.carElement.attrs.x + 20 && p.y === car.carElement.attrs.y + 20
//       );
//       const path = aStar(startNode, randomNode);
//       car.moveAlongPath(path);
//     }
//   });
// }

// setInterval(loop, 2000);

document.getElementById("container").addEventListener("click", function (event) {
  var rect = this.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  var closestPoint = findClosestPoint(whitePoints, x, y);

  const randomCar = cars[Math.floor(Math.random() * cars.length)];
  const startPoint = whitePoints.find(
    (p) => p.x === randomCar.carElement.attrs.x + 20 && p.y === randomCar.carElement.attrs.y + 20
  );

  const path = aStar(startPoint, closestPoint);
  randomCar.moveAlongPath(path);
});

function findClosestPoint(points, clickX, clickY) {
  var closest = null;
  var closestDistance = Infinity;
  points.forEach(function (point) {
    var distance = Math.hypot(point.x - clickX, point.y - clickY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = point;
    }
  });

  return closest;
}

document.addEventListener("DOMContentLoaded", function () {
  var imageObj = new Image();
  imageObj.onload = function () {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    context.drawImage(imageObj, 0, 0);

    var imageData = context.getImageData(0, 0, imageObj.width, imageObj.height);
    var data = imageData.data; // the raw pixel data

    for (var i = 0; i < data.length; i += 4) {
      var red = data[i];
      var green = data[i + 1];
      var blue = data[i + 2];
      var alpha = data[i + 3];
      if (red > 250 && green > 250 && blue > 250 && alpha > 250) {
        // Calculate the x and y coordinates
        var x = (i / 4) % imageObj.width;
        var y = Math.floor(i / 4 / imageObj.width);
        var newPoint = { x, y };
        if (isFarEnough(newPoint, whitePoints)) {
          whitePoints.push(newPoint);
        }
      }
    }

    function isFarEnough(point, points) {
      return points.every((p) => Math.hypot(p.x - point.x, p.y - point.y) > minDistance);
    }

    var map = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width: width,
      height: height,
    });

    layer.add(map);

    // Draw pathfinding nodes
    // for (var i = 0; i < whitePoints.length; i += 1) {
    //   var point = whitePoints[i];
    //   const dot = new Konva.Circle({
    //     x: point.x,
    //     y: point.y,
    //     radius: 2,
    //     fill: accentColor,
    //   });
    //   layer.add(dot);
    // }

    const centerPoint = findClosestPoint(whitePoints, width / 2, height / 2);
    var carElement = new Konva.Text({
      x: centerPoint.x - 20,
      y: centerPoint.y - 20,
      text: "🚗",
      fontSize: 30,
      align: "right",
      id: "car",
    });

    layer.add(carElement);

    car = new Car(carElement, "car", 10);

    const carModels = ["🚗", "🚙", "🚕", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜"];

    for (let i = 0; i < 10; i++) {
      const randomPoint = whitePoints[Math.floor(Math.random() * whitePoints.length)];
      const randomModel = carModels[Math.floor(Math.random() * carModels.length)];

      const carElement = new Konva.Text({
        x: randomPoint.x - 20,
        y: randomPoint.y - 20,
        text: randomModel,
        fontSize: 30,
        align: "right",
        id: "car" + i,
      });

      layer.add(carElement);

      const car = new Car(carElement, "car" + i, 10);
      cars.push(car);
    }

    layer.draw();
    stage.add(layer);

    const startNode = whitePoints[4];
    const goalNode = whitePoints[8];

    startPoint = layer.find((node) => node.attrs.x === centerPoint.x && node.attrs.y === centerPoint.y)[0];
    goalPoint = layer.find((node) => node.attrs.x === goalNode.x && node.attrs.y === goalNode.y)[0];
  };
  imageObj.src = "./map.jpg";
});

function aStar(startNode, goalNode) {
  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  let openSet = [startNode];

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start to n currently known.
  let cameFrom = new Map();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  let gScore = new Map();
  gScore.set(startNode, 0);

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  let fScore = new Map();
  fScore.set(startNode, heuristic(startNode, goalNode));

  while (openSet.length > 0) {
    // Get the node in openSet having the lowest fScore[] value
    let current = openSet.reduce((a, b) => (fScore.get(a) < fScore.get(b) ? a : b));

    // console.log("openSet length: " + openSet.length);
    // console.log("current:" + "x:" + current.x + " y:" + current.y);

    if (current === goalNode) {
      // The path has been found, reconstruct it and return.
      //   return "found";
      return reconstructPath(cameFrom, current);
    }

    openSet = openSet.filter((node) => !nodesAreEqual(node, current));

    const neighbors = getNeighbors(current);
    for (let neighbor of neighbors) {
      //   console.log("checking neighbor:" + "x:" + neighbor.x + " y:" + neighbor.y);

      if (neighbor.x === current.x && neighbor.y === current.y) {
        continue; // Skip adding the current node again
      }

      // tentative_gScore is the distance from start to the neighbor through current
      let tentative_gScore = gScore.get(current) + distBetween(current, neighbor);

      if (tentative_gScore < (gScore.get(neighbor) || Infinity)) {
        // Prevent circular reference in cameFrom
        if (!cameFrom.has(current) || !nodesAreEqual(cameFrom.get(current), neighbor)) {
          //   console.log("adding neighbor:" + "x:" + neighbor.x + " y:" + neighbor.y);
          // This path to neighbor is better than any previous one. Record it!
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentative_gScore);
          fScore.set(neighbor, tentative_gScore + heuristic(neighbor, goalNode));

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  }

  // Open set is empty but goal was never reached
  throw "A* failed to find a solution";
}

function nodesAreEqual(nodeA, nodeB) {
  return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
}

function reconstructPath(cameFrom, current) {
  let totalPath = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    totalPath.unshift(current);
  }
  return totalPath;
}

function getNeighbors(node) {
  // We need a reasonable distance to consider a point a neighbor.
  // It shouldn't be too large; otherwise, it might skip potential paths.
  let neighborDistance = minDistance * 2;
  let neighbors = [];

  // Iterate through all white points to find neighbors
  for (let i = 0; i < whitePoints.length; i++) {
    const potentialNeighbor = whitePoints[i];
    const areClose = Math.hypot(node.x - potentialNeighbor.x, node.y - potentialNeighbor.y) <= neighborDistance;
    if (areClose && !nodesAreEqual(node, potentialNeighbor)) {
      neighbors.push(potentialNeighbor);
    }
  }

  return neighbors;
}

function distBetween(nodeA, nodeB) {
  // Euclidean distance
  return Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y);
}

function heuristic(nodeA, nodeB) {
  // Euclidean distance as a heuristic
  return Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y);
}
