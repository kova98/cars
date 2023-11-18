class Car {
  constructor(carElement, id, speed) {
    this.layer = layer;
    this.id = id;
    this.speed = speed;
    this.carElement = carElement;
    this.isMoving = false;
  }

  moveTo(point, callback) {
    this.carElement.to({
      x: point.x - 20,
      y: point.y - 20,
      duration: 1 / this.speed,
      easing: Konva.Easings.Linear,
      onFinish: callback,
    });
  }

  moveAlongPath(path) {
    this.isMoving = true;
    if (path.length === 0) {
      this.isMoving = false;
      return; // End of path
    }

    const nextPoint = path.shift();
    this.moveTo(nextPoint, () => this.moveAlongPath(path));
  }
}
