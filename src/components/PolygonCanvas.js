class PolygonCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
      <canvas id="canvas" width="500" height="500"></canvas>
      <style>
        canvas {
          background-color: #999;
        }
      </style>
    `;
        this.canvas = this.shadowRoot.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.polygonDrawn = false;
        this.firstPoint = null;
        this.secondPoint = null;
    }

    connectedCallback() {
        this.canvas.addEventListener('click', this.addPoint.bind(this));
    }

    addPoint(event) {
        if (this.polygonDrawn) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.points.length < 15) {
            this.points.push({ x, y });
            this.drawPoint(x, y, this.points.length);
            this.updatePointsCreated();
        }
    }

    drawPoint(x, y, index) {
        this.ctx.fillStyle = 'yellow';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeText(`p${index}`, x + 8, y - 8);
    }

    drawPolygon() {
        if (this.points.length < 3) return;

        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        this.points.forEach((point, index) => {
            if (index > 0) this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.closePath();
        this.ctx.stroke();
        this.polygonDrawn = true;
    }

    highlightPath(first, second, clockwise = true) {
        if (!this.polygonDrawn) return;

        const path = [];
        let index = this.points.findIndex((p) => p === first);
        let target = this.points.findIndex((p) => p === second);

        while (index !== target) {
            path.push(this.points[index]);
            index = clockwise ? (index + 1) % this.points.length : (index - 1 + this.points.length) % this.points.length;
        }
        path.push(this.points[target]);

        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        path.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.stroke();
    }

    updatePointsCreated() {
        const event = new CustomEvent('pointsUpdated', { detail: this.points.length });
        this.dispatchEvent(event);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
        this.polygonDrawn = false;
        this.firstPoint = null;
        this.secondPoint = null;
    }
}

customElements.define('polygon-canvas', PolygonCanvas);
