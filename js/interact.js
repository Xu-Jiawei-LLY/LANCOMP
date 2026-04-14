/* === Interaction Manager ===
 * Provides reusable mouse interaction (drag, click-edit, hover, resize)
 * for canvas-based plotting pages.
 *
 * Usage per page:
 *   1. Create: const im = new InteractionManager(canvasId)
 *   2. During render(), call im.clearHitAreas() then im.addHitArea(...) for each element
 *   3. Provide callbacks for drag, click-edit, hover
 */

class InteractionManager {
    constructor(canvasId, callbacks) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.hitAreas = [];      // {id, type, x, y, w, h, data, cursor, dragAxis}
        this.hoveredId = null;
        this.dragState = null;   // {id, startMx, startMy, origX, origY, data}
        this.callbacks = callbacks || {};
        // callbacks: { onDrag(id, dx, dy, data), onDragEnd(id, data), onClick(id, data), onDoubleClick(id, data), onHover(id, data), onResizeDrag(id, edge, dx, dy, data) }

        this._bound = {
            mousedown: this._onMouseDown.bind(this),
            mousemove: this._onMouseMove.bind(this),
            mouseup: this._onMouseUp.bind(this),
            dblclick: this._onDblClick.bind(this),
            mouseleave: this._onMouseLeave.bind(this),
        };

        this.canvas.addEventListener('mousedown', this._bound.mousedown);
        this.canvas.addEventListener('mousemove', this._bound.mousemove);
        this.canvas.addEventListener('mouseup', this._bound.mouseup);
        this.canvas.addEventListener('dblclick', this._bound.dblclick);
        this.canvas.addEventListener('mouseleave', this._bound.mouseleave);

        this._clickTimer = null;
        this._clickCount = 0;
        this._wasDrag = false;
    }

    destroy() {
        this.canvas.removeEventListener('mousedown', this._bound.mousedown);
        this.canvas.removeEventListener('mousemove', this._bound.mousemove);
        this.canvas.removeEventListener('mouseup', this._bound.mouseup);
        this.canvas.removeEventListener('dblclick', this._bound.dblclick);
        this.canvas.removeEventListener('mouseleave', this._bound.mouseleave);
    }

    clearHitAreas() { this.hitAreas = []; }

    /**
     * Register a hit area during render.
     * @param {string} id - unique ID for the element
     * @param {string} type - element category (e.g. 'checkpoint', 'scenario', 'textbox')
     * @param {number} x y w h - bounding box in canvas coords
     * @param {object} data - arbitrary data passed back in callbacks
     * @param {object} opts - { cursor, draggable, resizable, resizeEdges }
     */
    addHitArea(id, type, x, y, w, h, data, opts) {
        opts = opts || {};
        this.hitAreas.push({
            id, type, x, y, w, h, data,
            cursor: opts.cursor || 'pointer',
            draggable: opts.draggable !== false,
            resizable: opts.resizable || false,
            resizeEdges: opts.resizeEdges || null, // ['left','right','top','bottom']
        });
    }

    _getCanvasCoords(e) {
        // Return logical (drawing) coordinates, not physical canvas pixels.
        // With HiDPI scaling (ctx.scale(DPR,...)), hit areas are in logical coords.
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    _hitTest(mx, my) {
        // Test in reverse order (top-most first)
        for (let i = this.hitAreas.length - 1; i >= 0; i--) {
            const a = this.hitAreas[i];
            if (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h) {
                // Check resize edges
                if (a.resizable && a.resizeEdges) {
                    const edgeMargin = 8;
                    let edge = null;
                    if (a.resizeEdges.includes('left') && mx < a.x + edgeMargin) edge = 'left';
                    else if (a.resizeEdges.includes('right') && mx > a.x + a.w - edgeMargin) edge = 'right';
                    else if (a.resizeEdges.includes('top') && my < a.y + edgeMargin) edge = 'top';
                    else if (a.resizeEdges.includes('bottom') && my > a.y + a.h - edgeMargin) edge = 'bottom';
                    if (edge) return { ...a, _edge: edge };
                }
                return a;
            }
        }
        return null;
    }

    _onMouseDown(e) {
        const { x, y } = this._getCanvasCoords(e);
        const hit = this._hitTest(x, y);
        this._wasDrag = false;

        if (hit) {
            if (hit._edge && hit.resizable) {
                // Start resize
                this.dragState = {
                    id: hit.id, type: 'resize', edge: hit._edge,
                    startMx: x, startMy: y,
                    origX: hit.data.x || 0, origY: hit.data.y || 0,
                    origW: hit.data.width || hit.w, origH: hit.data.height || hit.h,
                    data: hit.data,
                };
            } else if (hit.draggable) {
                // Start drag
                this.dragState = {
                    id: hit.id, type: 'drag',
                    startMx: x, startMy: y,
                    origX: hit.data.x !== undefined ? hit.data.x : hit.x,
                    origY: hit.data.y !== undefined ? hit.data.y : hit.y,
                    data: hit.data, hitArea: hit,
                };
            }
            e.preventDefault();
        }
    }

    _onMouseMove(e) {
        const { x, y } = this._getCanvasCoords(e);

        if (this.dragState) {
            const dx = x - this.dragState.startMx;
            const dy = y - this.dragState.startMy;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                this._wasDrag = true;
            }

            if (this.dragState.type === 'resize') {
                if (this.callbacks.onResizeDrag) {
                    this.callbacks.onResizeDrag(this.dragState.id, this.dragState.edge, dx, dy, this.dragState);
                }
            } else if (this.dragState.type === 'drag') {
                if (this.callbacks.onDrag) {
                    this.callbacks.onDrag(this.dragState.id, dx, dy, this.dragState);
                }
            }
            return;
        }

        // Hover
        const hit = this._hitTest(x, y);
        if (hit) {
            let cursor = hit.cursor || 'pointer';
            if (hit._edge) {
                cursor = (hit._edge === 'left' || hit._edge === 'right') ? 'ew-resize' : 'ns-resize';
            }
            this.canvas.style.cursor = cursor;
            if (this.hoveredId !== hit.id) {
                this.hoveredId = hit.id;
                if (this.callbacks.onHover) this.callbacks.onHover(hit.id, hit.data);
            }
        } else {
            this.canvas.style.cursor = 'default';
            if (this.hoveredId) {
                this.hoveredId = null;
                if (this.callbacks.onHover) this.callbacks.onHover(null, null);
            }
        }
    }

    _onMouseUp(e) {
        if (this.dragState) {
            if (this._wasDrag) {
                if (this.callbacks.onDragEnd) {
                    this.callbacks.onDragEnd(this.dragState.id, this.dragState.data);
                }
            } else {
                // It was a click (no significant drag)
                const { x, y } = this._getCanvasCoords(e);
                const hit = this._hitTest(x, y);
                if (hit && this.callbacks.onClick) {
                    this.callbacks.onClick(hit.id, hit.data, hit.type);
                }
            }
            this.dragState = null;
            return;
        }

        // Click on non-draggable or missed area
        const { x, y } = this._getCanvasCoords(e);
        const hit = this._hitTest(x, y);
        if (hit && this.callbacks.onClick) {
            this.callbacks.onClick(hit.id, hit.data, hit.type);
        }
    }

    _onDblClick(e) {
        const { x, y } = this._getCanvasCoords(e);
        const hit = this._hitTest(x, y);
        if (hit && this.callbacks.onDoubleClick) {
            this.callbacks.onDoubleClick(hit.id, hit.data, hit.type);
        }
    }

    _onMouseLeave() {
        if (this.dragState) {
            if (this.callbacks.onDragEnd) {
                this.callbacks.onDragEnd(this.dragState.id, this.dragState.data);
            }
            this.dragState = null;
        }
        this.canvas.style.cursor = 'default';
        this.hoveredId = null;
    }

    /** Draw a selection highlight around the currently hovered element */
    drawHoverHighlight(ctx) {
        if (!this.hoveredId) return;
        const area = this.hitAreas.find(a => a.id === this.hoveredId);
        if (!area) return;
        ctx.save();
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(area.x - 2, area.y - 2, area.w + 4, area.h + 4);
        ctx.setLineDash([]);
        ctx.restore();
    }
}

/* Helper: build a standard edit modal form from a field spec array */
function buildEditFormHtml(fields) {
    // fields: [{label, id, type, value, options?, min?, max?, step?}]
    let html = '';
    fields.forEach(f => {
        html += `<div class="form-group">`;
        html += `<label>${f.label}</label>`;
        if (f.type === 'select') {
            html += `<select id="${f.id}">`;
            f.options.forEach(o => {
                const sel = o.value == f.value ? 'selected' : '';
                html += `<option value="${o.value}" ${sel}>${o.label}</option>`;
            });
            html += `</select>`;
        } else if (f.type === 'textarea') {
            html += `<textarea id="${f.id}">${f.value || ''}</textarea>`;
        } else if (f.type === 'checkbox') {
            html += `<input type="checkbox" id="${f.id}" ${f.value ? 'checked' : ''} style="width:auto">`;
        } else {
            const extras = [];
            if (f.min !== undefined) extras.push(`min="${f.min}"`);
            if (f.max !== undefined) extras.push(`max="${f.max}"`);
            if (f.step !== undefined) extras.push(`step="${f.step}"`);
            html += `<input type="${f.type || 'text'}" id="${f.id}" value="${f.value || ''}" ${extras.join(' ')}>`;
        }
        html += `</div>`;
    });
    return html;
}
