class ControlPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
      <div class="panel">
        <button id="createPoints">Create points</button>
        <div id="pointsInfo" class="points-info">Created 0 points</div>
        <button id="drawPolygon" disabled>Draw polygon</button>
        <button id="firstPoint" disabled>First point</button>
        <div id="firstPointInfo">p1</div>
        <button id="secondPoint" disabled>Second point</button>
        <div id="secondPointInfo">p2</div>
        <button id="toggleOrder" disabled>Clockwise order</button>
        <button id="clear">Clear</button>
        <div id="pathInfo" class="path-info">Path:</div>
      </div>
      <style>
        .panel {
          display: flex;
          flex-direction: column;
          color: white;
        }
        .points-info {
          margin-bottom: 10px;
        }
      </style>
    `;
        this.polygonCanvas = document.querySelector('polygon-canvas');
        this.createPointsButton = this.shadowRoot.getElementById('createPoints');
        this.drawPolygonButton = this.shadowRoot.getElementById('drawPolygon');
        this.firstPointButton = this.shadowRoot.getElementById('firstPoint');
        this.secondPointButton = this.shadowRoot.getElementById('secondPoint');
        this.toggleOrderButton = this.shadowRoot.getElementById('toggleOrder');
        this.clearButton = this.shadowRoot.getElementById('clear');
        this.pointsInfo = this.shadowRoot.getElementById('pointsInfo');
        this.firstPointInfo = this.shadowRoot.getElementById('firstPointInfo');
        this.secondPointInfo = this.shadowRoot.getElementById('secondPointInfo');
        this.pathInfo = this.shadowRoot.getElementById('pathInfo');

        this.selectedFirstPoint = null;
        this.selectedSecondPoint = null;
        this.clockwise = true;
    }

    connectedCallback() {
        this.createPointsButton.addEventListener('click', () => this.enablePolygonCreation());
        this.drawPolygonButton.addEventListener('click', () => this.drawPolygon());
        this.firstPointButton.addEventListener('click', () => this.selectFirstPoint());
        this.secondPointButton.addEventListener('click', () => this.selectSecondPoint());
        this.toggleOrderButton.addEventListener('click', () => this.toggleOrder());
        this.clearButton.addEventListener('click', () => this.clearAll());

        this.polygonCanvas.addEventListener('pointsUpdated', (e) => this.updatePointsInfo(e.detail));
        this.polygonCanvas.addEventListener('click', (event) => this.handlePointSelection(event));
    }

    enablePolygonCreation() {
        this.polygonCanvas.clearCanvas();
        this.createPointsButton.disabled = true;
    }

    updatePointsInfo(count) {
        this.pointsInfo.textContent = `Created ${count} points`;
        this.pointsInfo.style.color = count < 3 || count > 15 ? 'red' : 'green';
        this.drawPolygonButton.disabled = count < 3 || count > 15;
    }

    drawPolygon() {
        this.polygonCanvas.drawPolygon();
        this.drawPolygonButton.disabled = true;
        this.firstPointButton.disabled = false;
        this.secondPointButton.disabled = false;
        this.toggleOrderButton.disabled = false;
    }

    selectFirstPoint() {
        this.selectedFirstPoint = true;
    }

    selectSecondPoint() {
        this.selectedSecondPoint = true;
    }

    toggleOrder() {
        this.clockwise = !this.clockwise;
        this.toggleOrderButton.textContent = this.clockwise ? 'Clockwise order' : 'Counterclockwise order';
        this.polygonCanvas.highlightPath(this.selectedFirstPoint, this.selectedSecondPoint, this.clockwise);
    }

    handlePointSelection(event) {
        if (!this.polygonCanvas.polygonDrawn) return;

        const rect = this.polygonCanvas.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const selectedPoint = this.polygonCanvas.points.find((point, index) => {
            const dx = point.x - x;
            const dy = point.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 10;
        });

        if (selectedPoint) {
            if (this.selectedFirstPoint) {
                this.firstPointInfo.textContent = `p${this.polygonCanvas.points.indexOf(selectedPoint) + 1}`;
                this.selectedFirstPoint = selectedPoint;
                this.selectedFirstPoint = null;
            } else if (this.selectedSecondPoint) {
                this.secondPointInfo.textContent = `p${this.polygonCanvas.points.indexOf(selectedPoint) + 1}`;
                this.selectedSecondPoint = selectedPoint;
                this.selectedSecondPoint = null;
            }

            if (this.selectedFirstPoint && this.selectedSecondPoint) {
                this.polygonCanvas.highlightPath(this.selectedFirstPoint, this.selectedSecondPoint, this.clockwise);
                this.updatePathInfo();
            }
        }
    }

    updatePathInfo() {
        const firstIndex = this.polygonCanvas.points.indexOf(this.selectedFirstPoint) + 1;
        const secondIndex = this.polygonCanvas.points.indexOf(this.selectedSecondPoint) + 1;

        let path = '';
        let index = firstIndex - 1;
        const target = secondIndex - 1;
        const step = this.clockwise ? 1 : -1;

        while (index !== target) {
            path += `p${index + 1} - `;
            index = (index + step + this.polygonCanvas.points.length) % this.polygonCanvas.points.length;
        }
        path += `p${secondIndex}`;

        this.pathInfo.textContent = `Path: ${path}`;
    }

    clearAll() {
        this.polygonCanvas.clearCanvas();
        this.createPointsButton.disabled = false;
        this.drawPolygonButton.disabled = true;
        this.firstPointButton.disabled = true;
        this.secondPointButton.disabled = true;
        this.toggleOrderButton.disabled = true;
        this.pointsInfo.textContent = 'Created 0 points';
        this.pointsInfo.style.color = 'white';
        this.firstPointInfo.textContent = 'p1';
        this.secondPointInfo.textContent = 'p2';
        this.pathInfo.textContent = 'Path:';
        this.selectedFirstPoint = null;
        this.selectedSecondPoint = null;
    }
}

customElements.define('control-panel', ControlPanel);
