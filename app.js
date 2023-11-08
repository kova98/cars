document.addEventListener("DOMContentLoaded", function () {
  const width = 800;
  const height = 800;

  const stage = new Konva.Stage({
    container: "container",
    width: width,
    height: height,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const dot = new Konva.Circle({
    x: width / 2,
    y: height / 2,
    radius: 5,
    fill: getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim(),
  });

  var imageObj = new Image();
  imageObj.onload = function () {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    context.drawImage(imageObj, 0, 0);

    var imageData = context.getImageData(0, 0, imageObj.width, imageObj.height);
    var data = imageData.data; // the raw pixel data

    var whitePoints = [];
    for (var i = 0; i < data.length; i += 4) {
      var red = data[i];
      var green = data[i + 1];
      var blue = data[i + 2];
      var alpha = data[i + 3];
      if (red === 255 && green === 255 && blue === 255 && alpha === 255) {
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
      const minDistance = 10;
      return points.every((p) => Math.hypot(p.x - point.x, p.y - point.y) > minDistance);
    }

    var map = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width: width,
      height: height,
    });

    console.log(whitePoints.length);

    layer.add(map);

    for (var i = 0; i < whitePoints.length; i += 1) {
      console.log(i);
      var point = whitePoints[i];
      const dot = new Konva.Circle({
        x: point.x,
        y: point.y,
        radius: 2,
        fill: getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim(),
      });
      layer.add(dot);
    }

    layer.add(dot);
    layer.draw();
  };
  imageObj.src = "/map.jpg";
});
