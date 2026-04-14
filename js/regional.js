/* === Page 4: Regional Timeline (Interactive) === */
const Regional = (() => {
    let state = {
        regions: [
            { id: uid(), label: 'GL', color: '#c0392b', fontSize: 14, fontStyle: 'bold' },
            { id: uid(), label: 'EA', color: '#2980b9', fontSize: 14, fontStyle: 'bold' },
            { id: uid(), label: 'China', color: '#27ae60', fontSize: 14, fontStyle: 'bold' },
            { id: uid(), label: 'Japan', color: '#8e44ad', fontSize: 14, fontStyle: 'bold' },
        ],
        checkpoints: [
            { id: uid(), label: 'T4 PK data\n(4th Mar)', shape: 'triangle', color: '#8b1a1a', filled: true, date: '2025-03-04', regionIdx: 0 },
            { id: uid(), label: 'D3 Forum*\n(TBD)', shape: 'diamond', color: '#2980b9', filled: false, date: '2025-04-06', regionIdx: 0 },
            { id: uid(), label: 'PSC', shape: 'dashed-circle', color: '#888', filled: false, date: '2025-04-22', regionIdx: 0 },
            { id: uid(), label: 'GL-EA mtg\n(5-6th Mar)', shape: 'triangle', color: '#8b1a1a', filled: true, date: '2025-03-05', regionIdx: 1 },
            { id: uid(), label: 'EA Dev SC\n(XXth Mar)', shape: 'triangle', color: '#5dade2', filled: false, date: '2025-03-18', regionIdx: 1 },
            { id: uid(), label: 'PSSC', shape: 'dashed-circle', color: '#888', filled: false, date: '2025-04-22', regionIdx: 1 },
            { id: uid(), label: 'China CMH Leaders Review\n(early Mar)', shape: 'triangle', color: '#8b1a1a', filled: true, date: '2025-03-08', regionIdx: 2 },
            { id: uid(), label: 'CDFR', shape: 'triangle', color: '#ccc', filled: false, date: '2025-03-10', regionIdx: 3 },
            { id: uid(), label: 'Japan Governance\n[Pre-PSSC at Obesity Governance]\n(18th Mar)', shape: 'triangle', color: '#8b1a1a', filled: true, date: '2025-03-18', regionIdx: 3 },
            { id: uid(), label: 'Japan Dev Governance\n[JDMAC]', shape: 'triangle', color: '#8b1a1a', filled: true, date: '2025-04-10', regionIdx: 3 },
        ],
        lines: [
            { id: uid(), color: '#c0392b', startDate: '2025-03-05', endDate: '2025-03-18', startRegionIdx: 1, endRegionIdx: 1, dashed: false, waypoints: [] },
            { id: uid(), color: '#999', startDate: '2025-03-18', endDate: '2025-03-30', startRegionIdx: 1, endRegionIdx: 1, dashed: true, waypoints: [] },
            { id: uid(), color: '#888', startDate: '2025-03-30', endDate: '2025-04-06', startRegionIdx: 1, endRegionIdx: 0, dashed: false, waypoints: [] },
        ],
        comments: [],
    };

    const MARGIN = { top: 80, left: 80, right: 40, bottom: 60 };
    const REGION_HEIGHT = 120;
    let im = null;
    let _layout = {};
    let _canvasH = 500;

    function saveUndo() { UndoManager.pushState('regional', state); }
    function undo() { const prev = UndoManager.undo('regional'); if (prev) { state = prev; render(); } }

    function getCanvas() { return document.getElementById('regional-canvas'); }
    function getCtx() { return getCanvas().getContext('2d'); }
    function getConfig() {
        return {
            title: document.getElementById('rt-title').value,
            startDate: new Date(document.getElementById('rt-start-date').value),
            endDate: new Date(document.getElementById('rt-end-date').value),
            interval: document.getElementById('rt-interval').value,
        };
    }

    function xToDate(x) {
        const cfg = getConfig();
        const frac = (x - _layout.xStart) / (_layout.xEnd - _layout.xStart);
        const ms = cfg.startDate.getTime() + frac * (cfg.endDate.getTime() - cfg.startDate.getTime());
        const d = new Date(ms);
        return d.toISOString().slice(0, 10);
    }

    function yToRegionIdx(y) {
        for (let i = 0; i < state.regions.length; i++) {
            const ry = MARGIN.top + i * REGION_HEIGHT;
            if (y >= ry && y < ry + REGION_HEIGHT) return i;
        }
        return 0;
    }

    function showCheckpointEditor(cp) {
        const idx = state.checkpoints.indexOf(cp);
        const regionOpts = state.regions.map((r, i) => ({ value: i, label: r.label }));
        openModal('Edit Checkpoint', buildEditFormHtml([
            { label: 'Label (\\n for newline)', id: 'ed-rt-label', type: 'text', value: cp.label.replace(/\n/g, '\\n') },
            { label: 'Date', id: 'ed-rt-date', type: 'date', value: cp.date },
            { label: 'Color', id: 'ed-rt-color', type: 'color', value: cp.color },
            { label: 'Shape', id: 'ed-rt-shape', type: 'select', value: cp.shape, options: SHAPES.map(s => ({ value: s, label: s })) },
            { label: 'Filled', id: 'ed-rt-filled', type: 'checkbox', value: cp.filled },
            { label: 'Region', id: 'ed-rt-rgn', type: 'select', value: cp.regionIdx, options: regionOpts },
        ]), () => {
            saveUndo();
            cp.label = document.getElementById('ed-rt-label').value.replace(/\\n/g, '\n');
            cp.date = document.getElementById('ed-rt-date').value;
            cp.color = document.getElementById('ed-rt-color').value;
            cp.shape = document.getElementById('ed-rt-shape').value;
            cp.filled = document.getElementById('ed-rt-filled').checked;
            cp.regionIdx = +document.getElementById('ed-rt-rgn').value;
            render();
        }, () => { saveUndo(); state.checkpoints.splice(idx, 1); render(); });
    }

    function showLineEditor(ln) {
        const idx = state.lines.indexOf(ln);
        const regionOpts = state.regions.map((r, i) => ({ value: i, label: r.label }));
        const wps = ln.waypoints || [];
        let wpHtml = '';
        wps.forEach((wp, wi) => {
            wpHtml += `<div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
                <label style="font-size:10px;">WP${wi + 1} Date:</label><input type="date" id="ed-ln-wpd${wi}" value="${wp.date}" style="font-size:10px;">
                <label style="font-size:10px;">Region:</label><select id="ed-ln-wpr${wi}" style="font-size:10px;">${regionOpts.map(o => `<option value="${o.value}" ${+o.value === wp.regionIdx ? 'selected' : ''}>${o.label}</option>`).join('')}</select>
                <button class="btn btn-xs btn-danger" onclick="document.getElementById('ed-ln-wpd${wi}').dataset.deleted='1';this.parentElement.style.display='none'">x</button>
            </div>`;
        });
        openModal('Edit Line/Polyline', buildEditFormHtml([
            { label: 'Color', id: 'ed-ln-color', type: 'color', value: ln.color },
            { label: 'Dashed', id: 'ed-ln-dashed', type: 'checkbox', value: ln.dashed },
            { label: 'Start Date', id: 'ed-ln-sd', type: 'date', value: ln.startDate },
            { label: 'Start Region', id: 'ed-ln-sr', type: 'select', value: ln.startRegionIdx, options: regionOpts },
            { label: 'End Date', id: 'ed-ln-ed', type: 'date', value: ln.endDate },
            { label: 'End Region', id: 'ed-ln-er', type: 'select', value: ln.endRegionIdx, options: regionOpts },
        ]) + `<div class="item-group-header" style="margin-top:8px;">Waypoints (${wps.length})</div>${wpHtml}
        <button class="btn btn-xs btn-primary" style="margin-top:6px;" onclick="
            var c=document.getElementById('ed-ln-wp-container');
            var n=c.children.length;
            var div=document.createElement('div');
            div.style='display:flex;gap:6px;align-items:center;margin-top:4px;';
            div.innerHTML='<label style=font-size:10px>New WP:</label><input type=date id=ed-ln-wpd'+n+' value=&quot;${ln.startDate}&quot; style=font-size:10px><label style=font-size:10px>Region:</label><select id=ed-ln-wpr'+n+' style=font-size:10px>${regionOpts.map(o => `<option value=${o.value}>${o.label}</option>`).join('')}</select>';
            div.dataset.newWp='1';
            c.appendChild(div);
        ">+ Add Waypoint</button>
        <div id="ed-ln-wp-container"></div>`, () => {
            saveUndo();
            ln.color = document.getElementById('ed-ln-color').value;
            ln.dashed = document.getElementById('ed-ln-dashed').checked;
            ln.startDate = document.getElementById('ed-ln-sd').value;
            ln.startRegionIdx = +document.getElementById('ed-ln-sr').value;
            ln.endDate = document.getElementById('ed-ln-ed').value;
            ln.endRegionIdx = +document.getElementById('ed-ln-er').value;
            // Update existing waypoints (skip deleted)
            const newWps = [];
            for (let wi = 0; wi < wps.length; wi++) {
                const el = document.getElementById('ed-ln-wpd' + wi);
                if (el && el.dataset.deleted !== '1') {
                    newWps.push({ date: el.value, regionIdx: +document.getElementById('ed-ln-wpr' + wi).value });
                }
            }
            // Add new waypoints from container
            const container = document.getElementById('ed-ln-wp-container');
            if (container) {
                Array.from(container.children).forEach((div, ci) => {
                    const dateEl = div.querySelector('input[type=date]');
                    const selEl = div.querySelector('select');
                    if (dateEl && selEl) newWps.push({ date: dateEl.value, regionIdx: +selEl.value });
                });
            }
            ln.waypoints = newWps;
            render();
        }, () => { saveUndo(); state.lines.splice(idx, 1); render(); });
    }

    function initInteraction() {
        if (im) im.destroy();
        im = new InteractionManager('regional-canvas', {
            onDrag(id, dx, dy, dragState) {
                if (!dragState._undoSaved) { dragState._undoSaved = true; saveUndo(); }
                const data = dragState.data;

                // Snapshot original values on FIRST drag call
                if (!dragState._snapInit) {
                    dragState._snapInit = true;
                    if (data._type === 'checkpoint') {
                        dragState._origDate = data.date;
                        dragState._origRegionIdx = data.regionIdx;
                    } else if (data._type === 'line-start') {
                        dragState._origStartDate = data._line.startDate;
                        dragState._origStartRegionIdx = data._line.startRegionIdx;
                    } else if (data._type === 'line-end') {
                        dragState._origEndDate = data._line.endDate;
                        dragState._origEndRegionIdx = data._line.endRegionIdx;
                    } else if (data._type === 'line-body') {
                        const ln = data._line;
                        dragState._origSD = ln.startDate;
                        dragState._origED = ln.endDate;
                        dragState._origSR = ln.startRegionIdx;
                        dragState._origER = ln.endRegionIdx;
                        dragState._origWPs = (ln.waypoints || []).map(wp => ({ date: wp.date, regionIdx: wp.regionIdx }));
                    } else if (data._type === 'line-waypoint') {
                        dragState._origWpDate = data._wp.date;
                        dragState._origWpRegionIdx = data._wp.regionIdx;
                    } else if (data._type === 'comment') {
                        dragState._origCX = data.x;
                        dragState._origCY = data.y;
                    }
                }

                if (data._type === 'checkpoint') {
                    const origX = dateToX(new Date(dragState._origDate), getConfig().startDate, getConfig().endDate, _layout.xStart, _layout.xEnd);
                    data.date = xToDate(origX + dx);
                    const origY = MARGIN.top + dragState._origRegionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                    data.regionIdx = yToRegionIdx(origY + dy);
                    render();
                } else if (data._type === 'line-start') {
                    const origX = dateToX(new Date(dragState._origStartDate), getConfig().startDate, getConfig().endDate, _layout.xStart, _layout.xEnd);
                    data._line.startDate = xToDate(origX + dx);
                    const origY = MARGIN.top + dragState._origStartRegionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                    data._line.startRegionIdx = yToRegionIdx(origY + dy);
                    render();
                } else if (data._type === 'line-end') {
                    const origX = dateToX(new Date(dragState._origEndDate), getConfig().startDate, getConfig().endDate, _layout.xStart, _layout.xEnd);
                    data._line.endDate = xToDate(origX + dx);
                    const origY = MARGIN.top + dragState._origEndRegionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                    data._line.endRegionIdx = yToRegionIdx(origY + dy);
                    render();
                } else if (data._type === 'line-body') {
                    // Move entire line (all points) by same delta
                    const ln = data._line;
                    const cfg = getConfig();
                    const origSX = dateToX(new Date(dragState._origSD), cfg.startDate, cfg.endDate, _layout.xStart, _layout.xEnd);
                    const origEX = dateToX(new Date(dragState._origED), cfg.startDate, cfg.endDate, _layout.xStart, _layout.xEnd);
                    ln.startDate = xToDate(origSX + dx);
                    ln.endDate = xToDate(origEX + dx);
                    const origSY = MARGIN.top + dragState._origSR * REGION_HEIGHT + REGION_HEIGHT / 2;
                    const origEY = MARGIN.top + dragState._origER * REGION_HEIGHT + REGION_HEIGHT / 2;
                    ln.startRegionIdx = yToRegionIdx(origSY + dy);
                    ln.endRegionIdx = yToRegionIdx(origEY + dy);
                    // Move waypoints too
                    dragState._origWPs.forEach((owp, wi) => {
                        if (ln.waypoints[wi]) {
                            const origWX = dateToX(new Date(owp.date), cfg.startDate, cfg.endDate, _layout.xStart, _layout.xEnd);
                            ln.waypoints[wi].date = xToDate(origWX + dx);
                            const origWY = MARGIN.top + owp.regionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                            ln.waypoints[wi].regionIdx = yToRegionIdx(origWY + dy);
                        }
                    });
                    render();
                } else if (data._type === 'line-waypoint') {
                    const wp = data._wp;
                    const cfg = getConfig();
                    const origX = dateToX(new Date(dragState._origWpDate), cfg.startDate, cfg.endDate, _layout.xStart, _layout.xEnd);
                    wp.date = xToDate(origX + dx);
                    const origY = MARGIN.top + dragState._origWpRegionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                    wp.regionIdx = yToRegionIdx(origY + dy);
                    render();
                } else if (data._type === 'comment') {
                    data.x = dragState._origCX + dx;
                    data.y = dragState._origCY + dy;
                    render();
                }
            },
            onClick(id, data, type) {
                if (data._type === 'checkpoint') showCheckpointEditor(data);
                else if (data._type === 'line-body' || data._type === 'line-start' || data._type === 'line-end') showLineEditor(data._line);
                else if (data._type === 'line-waypoint') showLineEditor(data._line);
                else if (data._type === 'comment') showCommentEditor(data, state.comments, render);
            },
            onDoubleClick(id, data) {
                // Double-click on line body to add a waypoint at midpoint
                if (data._type === 'line-body') {
                    saveUndo();
                    const ln = data._line;
                    if (!ln.waypoints) ln.waypoints = [];
                    // Build point list, find longest segment, insert midpoint
                    const pts = [{ date: ln.startDate, regionIdx: ln.startRegionIdx }];
                    ln.waypoints.forEach(wp => pts.push(wp));
                    pts.push({ date: ln.endDate, regionIdx: ln.endRegionIdx });
                    let maxDist = 0, maxIdx = 0;
                    const cfg = getConfig();
                    for (let i = 0; i < pts.length - 1; i++) {
                        const x1 = dateToX(new Date(pts[i].date), cfg.startDate, cfg.endDate, _layout.xStart, _layout.xEnd);
                        const y1 = MARGIN.top + pts[i].regionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                        const x2 = dateToX(new Date(pts[i + 1].date), cfg.startDate, cfg.endDate, _layout.xStart, _layout.xEnd);
                        const y2 = MARGIN.top + pts[i + 1].regionIdx * REGION_HEIGHT + REGION_HEIGHT / 2;
                        const dist = Math.hypot(x2 - x1, y2 - y1);
                        if (dist > maxDist) { maxDist = dist; maxIdx = i; }
                    }
                    const midDate = new Date((new Date(pts[maxIdx].date).getTime() + new Date(pts[maxIdx + 1].date).getTime()) / 2);
                    const midRegion = pts[maxIdx].regionIdx; // keep same region as start of segment
                    ln.waypoints.splice(maxIdx, 0, { date: midDate.toISOString().slice(0, 10), regionIdx: midRegion });
                    render();
                }
            },
            onHover(id, data) { render(); },
        });
    }

    function render() {
        const canvas = getCanvas();
        const cfg = getConfig();

        const xStart = MARGIN.left;
        const contentW = 1200;
        const xEnd = xStart + contentW;
        const canvasW = xEnd + MARGIN.right;
        const canvasH = MARGIN.top + state.regions.length * REGION_HEIGHT + MARGIN.bottom;
        _canvasH = canvasH;

        // HiDPI setup
        const ctx = setupHiDPI(canvas, canvasW, canvasH);

        _layout = { xStart, xEnd, cfg };

        if (!im) initInteraction();
        im.clearHitAreas();

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Main Title
        drawMainTitle(ctx, cfg.title, canvasW / 2, 35);

        // Date header - stretch to align with both ends of colored background
        const headerY = MARGIN.top - 30, headerH = 30;
        let ticks = [];
        const d = new Date(cfg.startDate);
        while (d <= cfg.endDate) {
            ticks.push(new Date(d));
            if (cfg.interval === 'week') d.setDate(d.getDate() + 7);
            else if (cfg.interval === 'day') d.setDate(d.getDate() + 1);
            else d.setMonth(d.getMonth() + 1);
        }

        ctx.fillStyle = '#c0392b';
        ctx.fillRect(0, headerY, canvasW, headerH);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center';
        ticks.forEach(dt => {
            const x = dateToX(dt, cfg.startDate, cfg.endDate, xStart, xEnd);
            ctx.fillText(`${dt.getMonth() + 1}/${dt.getDate()}`, x, headerY + 20);
            ctx.strokeStyle = '#eee'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(x, headerY + headerH); ctx.lineTo(x, canvasH - MARGIN.bottom); ctx.stroke();
        });

        // Regions
        state.regions.forEach((rgn, rIdx) => {
            const regionY = MARGIN.top + rIdx * REGION_HEIGHT;
            // Region colored background band
            ctx.fillStyle = rgn.color + '15';
            ctx.fillRect(0, regionY, canvasW, REGION_HEIGHT);
            if (rIdx > 0) {
                ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, regionY); ctx.lineTo(canvasW, regionY); ctx.stroke();
            }
            // Region label: colored text, centered in left margin area
            const rgnFontSize = rgn.fontSize || 14;
            const rgnFontStyle = rgn.fontStyle || 'bold';
            ctx.font = `${rgnFontStyle} ${rgnFontSize}px Segoe UI`;
            ctx.fillStyle = rgn.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rgn.label, MARGIN.left / 2, regionY + REGION_HEIGHT / 2);
            ctx.textBaseline = 'alphabetic';
            rgn._y = regionY;
        });

        // Lines with hit areas (polyline support: start -> waypoints -> end)
        state.lines.forEach(ln => {
            const startRgn = state.regions[ln.startRegionIdx];
            const endRgn = state.regions[ln.endRegionIdx];
            if (!startRgn || !endRgn) return;

            // Build full point list
            const pts = [{ date: ln.startDate, regionIdx: ln.startRegionIdx }];
            (ln.waypoints || []).forEach(wp => pts.push(wp));
            pts.push({ date: ln.endDate, regionIdx: ln.endRegionIdx });

            // Compute pixel coordinates
            const pxPts = pts.map(p => {
                const rgn = state.regions[p.regionIdx];
                return {
                    x: dateToX(new Date(p.date), cfg.startDate, cfg.endDate, xStart, xEnd),
                    y: rgn ? rgn._y + REGION_HEIGHT / 2 : MARGIN.top + REGION_HEIGHT / 2,
                };
            });

            // Draw segments
            for (let i = 0; i < pxPts.length - 1; i++) {
                const isLast = (i === pxPts.length - 2);
                if (isLast) {
                    // Last segment gets arrowhead
                    if (ln.dashed) drawDashedArrow(ctx, pxPts[i].x, pxPts[i].y, pxPts[i + 1].x, pxPts[i + 1].y, ln.color, 2);
                    else drawArrow(ctx, pxPts[i].x, pxPts[i].y, pxPts[i + 1].x, pxPts[i + 1].y, ln.color, 2);
                } else {
                    if (ln.dashed) drawDashedLine(ctx, pxPts[i].x, pxPts[i].y, pxPts[i + 1].x, pxPts[i + 1].y, ln.color, 2);
                    else {
                        ctx.strokeStyle = ln.color; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(pxPts[i].x, pxPts[i].y); ctx.lineTo(pxPts[i + 1].x, pxPts[i + 1].y); ctx.stroke();
                    }
                }
            }

            // Draw waypoint handles (small circles)
            (ln.waypoints || []).forEach((wp, wi) => {
                const wpRgn = state.regions[wp.regionIdx];
                if (!wpRgn) return;
                const wx = dateToX(new Date(wp.date), cfg.startDate, cfg.endDate, xStart, xEnd);
                const wy = wpRgn._y + REGION_HEIGHT / 2;
                ctx.fillStyle = ln.color; ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.stroke();
            });

            // Line body hit area (entire bounding box, draggable)
            const allX = pxPts.map(p => p.x);
            const allY = pxPts.map(p => p.y);
            const minX = Math.min(...allX), maxX = Math.max(...allX);
            const minY = Math.min(...allY), maxY = Math.max(...allY);
            im.addHitArea(ln.id + '_body', 'line-body', minX - 3, minY - 8, Math.max(maxX - minX + 6, 10), (maxY - minY) + 16,
                { _type: 'line-body', _line: ln, x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
                { cursor: 'grab', draggable: true });

            // Waypoint handles (higher priority than body)
            (ln.waypoints || []).forEach((wp, wi) => {
                const wpRgn = state.regions[wp.regionIdx];
                if (!wpRgn) return;
                const wx = dateToX(new Date(wp.date), cfg.startDate, cfg.endDate, xStart, xEnd);
                const wy = wpRgn._y + REGION_HEIGHT / 2;
                im.addHitArea(ln.id + '_wp' + wi, 'line-waypoint', wx - 8, wy - 8, 16, 16,
                    { _type: 'line-waypoint', _line: ln, _wp: wp, _wpIdx: wi, x: wx, y: wy },
                    { cursor: 'move' });
            });

            // Start endpoint handle (highest priority)
            const x1 = pxPts[0].x, y1 = pxPts[0].y;
            im.addHitArea(ln.id + '_start', 'line-start', x1 - 6, y1 - 6, 12, 12,
                { _type: 'line-start', _line: ln, x: x1, y: y1 },
                { cursor: 'move' });

            // End endpoint handle (highest priority)
            const x2 = pxPts[pxPts.length - 1].x, y2 = pxPts[pxPts.length - 1].y;
            im.addHitArea(ln.id + '_end', 'line-end', x2 - 6, y2 - 6, 12, 12,
                { _type: 'line-end', _line: ln, x: x2, y: y2 },
                { cursor: 'move' });
        });

        // Checkpoints with hit areas
        state.checkpoints.forEach(cp => {
            const rgn = state.regions[cp.regionIdx];
            if (!rgn) return;
            const x = dateToX(new Date(cp.date), cfg.startDate, cfg.endDate, xStart, xEnd);
            const y = rgn._y + 30;

            drawShape(ctx, cp.shape, x, y, 12, cp.color, cp.filled);
            ctx.textAlign = 'center';
            cp.label.split('\n').forEach((line, li) => {
                ctx.font = li === 0 ? 'bold 10px Segoe UI' : '9px Segoe UI';
                ctx.fillStyle = li === 0 ? '#333' : '#666';
                ctx.fillText(line, x, y + 24 + li * 12);
            });

            const labelH = cp.label.split('\n').length * 12;
            im.addHitArea(cp.id, 'checkpoint', x - 16, y - 16, 32, 32 + labelH,
                Object.assign(cp, { _type: 'checkpoint', x, y }),
                { cursor: 'move' });
        });

        // Comments
        drawComments(ctx, state.comments, im);

        im.drawHoverHighlight(ctx);
        renderEditPanel();
    }

    function renderEditPanel() {
        const panel = document.getElementById('regional-edit-panel');
        let html = '<p style="font-size:11px;color:#2196F3;margin-bottom:8px;">Drag checkpoints/lines to move. Drag line endpoints to reposition. Double-click a line to add a waypoint. Click to edit.</p>';

        html += '<div class="item-group-header">Regions</div>';
        state.regions.forEach((r, i) => {
            html += `<div class="edit-item"><input type="text" value="${r.label}" style="width:60px" onchange="Regional.updateRegion(${i},'label',this.value)">
                <input type="color" value="${r.color}" onchange="Regional.updateRegion(${i},'color',this.value)">
                <label style="font-size:10px">Size:</label><input type="number" value="${r.fontSize || 14}" min="8" max="36" style="width:45px" onchange="Regional.updateRegion(${i},'fontSize',+this.value)">
                <select style="width:70px;font-size:10px" onchange="Regional.updateRegion(${i},'fontStyle',this.value)">
                    <option value="bold" ${(r.fontStyle || 'bold') === 'bold' ? 'selected' : ''}>Bold</option>
                    <option value="normal" ${r.fontStyle === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="italic" ${r.fontStyle === 'italic' ? 'selected' : ''}>Italic</option>
                    <option value="italic bold" ${r.fontStyle === 'italic bold' ? 'selected' : ''}>Bold Italic</option>
                </select>
                <button class="btn btn-xs btn-danger" onclick="Regional.removeRegion(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Checkpoints (${state.checkpoints.length})</div>`;
        state.checkpoints.forEach((cp, i) => {
            html += `<div class="edit-item">
                <span style="color:${cp.color};font-size:14px;">${cp.filled ? '\u25B2' : '\u25B3'}</span>
                <b style="font-size:11px">${cp.label.split('\n')[0]}</b>
                <span style="color:#888;font-size:10px">${cp.date} [${state.regions[cp.regionIdx]?.label}]</span>
                <button class="btn btn-xs btn-danger" onclick="Regional.removeCheckpoint(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Lines (${state.lines.length})</div>`;
        state.lines.forEach((ln, i) => {
            const wpCount = (ln.waypoints || []).length;
            html += `<div class="edit-item">
                <span style="display:inline-block;width:30px;height:3px;background:${ln.color};${ln.dashed ? 'border-top:2px dashed ' + ln.color + ';background:none;' : ''}vertical-align:middle;"></span>
                <span style="font-size:10px">${ln.startDate} [${state.regions[ln.startRegionIdx]?.label}] &rarr; ${ln.endDate} [${state.regions[ln.endRegionIdx]?.label}]${wpCount ? ' (' + wpCount + ' wp)' : ''}</span>
                <button class="btn btn-xs btn-danger" onclick="Regional.removeLine(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Comments (${state.comments.length})</div>`;
        state.comments.forEach((c, i) => {
            html += `<div class="edit-item">
                <span style="font-size:10px;color:${c.color || '#333'}">${c.text.split('\n')[0]}</span>
                <button class="btn btn-xs btn-danger" onclick="Regional.removeComment(${i})">x</button></div>`;
        });

        panel.innerHTML = html;
    }

    function addRegion() { saveUndo(); state.regions.push({ id: uid(), label: 'New Region', color: '#c0392b', fontSize: 14, fontStyle: 'bold' }); render(); }
    function removeRegion(i) { saveUndo(); state.regions.splice(i, 1); render(); }
    function updateRegion(i, k, v) { saveUndo(); state.regions[i][k] = v; render(); }
    function addCheckpoint() { saveUndo(); state.checkpoints.push({ id: uid(), label: 'New Checkpoint', shape: 'triangle', color: '#c0392b', filled: true, date: '2025-03-15', regionIdx: 0 }); render(); }
    function removeCheckpoint(i) { saveUndo(); state.checkpoints.splice(i, 1); render(); }
    function addLine() { saveUndo(); state.lines.push({ id: uid(), color: '#333', startDate: '2025-03-10', endDate: '2025-03-20', startRegionIdx: 0, endRegionIdx: 0, dashed: false, waypoints: [] }); render(); }
    function removeLine(i) { saveUndo(); state.lines.splice(i, 1); render(); }
    function addComment() { saveUndo(); state.comments.push({ id: uid(), text: 'New comment', x: 200, y: _canvasH - MARGIN.bottom + 5, fontSize: 12, color: '#333' }); render(); }
    function removeComment(i) { saveUndo(); state.comments.splice(i, 1); render(); }
    function exportPNG() { exportCanvasAsPNG('regional-canvas', 'regional_timeline.png'); }

    return { render, undo, addRegion, removeRegion, updateRegion, addCheckpoint, removeCheckpoint, addLine, removeLine, addComment, removeComment, exportPNG };
})();
