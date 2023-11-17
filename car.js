class Car {
  constructor(layer, id, speed) {
    this.layer = layer;
    this.id = id;
    this.speed = speed;
    this.taxiNode = this.layer.find((node) => node.attrs.id === this.id)[0];
  }

  moveTo(point, callback) {
    this.taxiNode.to({
      x: point.x - 20,
      y: point.y - 20,
      duration: 1 / this.speed,
      easing: Konva.Easings.Linear,
      onFinish: callback,
    });
  }

  moveAlongPath(path) {
    if (path.length === 0) {
      return; // End of path
    }

    const nextPoint = path.shift();
    this.moveTo(nextPoint, () => this.moveAlongPath(path));
  }
}
