exports.isLat = (value) => this.inRange(value, -90, 90);

exports.isLng = (value) => this.inRange(value, -180, 180);

exports.inRange = (value, min, max) => value >= min && value <= max;
