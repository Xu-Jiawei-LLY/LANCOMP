/* === Page 1: Portfolio Landscape (Interactive, HiDPI) === */
const Portfolio = (() => {
    let state = {
        regionPlans: [
            { id: uid(), name: 'Global MASH Plan', region: 'Global', bgColor: '#fafafa', subRows: [{ id: uid(), label: 'ISA 1: tirzepatide' }, { id: uid(), label: 'ISA 2: retatrutide' }] },
            { id: uid(), name: 'China MASH Plan', region: 'China', bgColor: '#f5f5f5', subRows: [] },
        ],
        scenarios: [
            { id: uid(), label: 'TZP & Reta Ph3 program', color: '#8fbc8f', startYear: 2026, startQ: 1, endYear: 2029, endQ: 2, regionIdx: 0, rowIdx: 0 },
            { id: uid(), label: 'Reta Mechanistic Trial', color: '#d2b48c', startYear: 2027, startQ: 2, endYear: 2029, endQ: 4, regionIdx: 0, rowIdx: 1 },
        ],
        checkpoints: [
            { id: uid(), label: 'NIT AA Data', shape: 'triangle', color: '#c0392b', filled: true, year: 2028, quarter: 2, regionIdx: 0, rowIdx: 0, position: 'top' },
            { id: uid(), label: 'Outcomes IA\n(70% events data)', shape: 'triangle', color: '#27ae60', filled: true, year: 2029, quarter: 1, regionIdx: 0, rowIdx: 0, position: 'top' },
            { id: uid(), label: 'Accelerated Approval with NIT', shape: 'diamond', color: '#c0392b', filled: true, year: 2030, quarter: 1, regionIdx: 0, rowIdx: 0, position: 'top' },
            { id: uid(), label: 'Full Approval if IA stop', shape: 'diamond', color: '#27ae60', filled: true, year: 2030, quarter: 3, regionIdx: 0, rowIdx: 0, position: 'top' },
        ],
        highlightBoxes: [],
        comments: [],
    };

    const MARGIN = { top: 90, left: 200, right: 50, bottom: 60 };
    const ROW_HEIGHT = 100; // Increased from 70 for more space
    let im = null;
    let _layout = {};
    let _canvasH = 500;

    function saveUndo() { UndoManager.pushState('portfolio', state); }
    function undo() { const prev = UndoManager.undo('portfolio'); if (prev) { state = prev; render(); } }

    function getCanvas() { return document.getElementById('portfolio-canvas'); }
    function getCtx() { return getCanvas().getContext('2d'); }
    function getConfig() {
        return {
            title: document.getElementById('pf-title').value,
            startYear: parseInt(document.getElementById('pf-start-year').value),
            endYear: parseInt(document.getElementById('pf-end-year').value),
        };
    }

    function xToYearQuarter(x) {
        const cfg = getConfig();
        const totalQ = (cfg.endYear - cfg.startYear + 1) * 4;
        const frac = (x - _layout.xStart) / (_layout.xEnd - _layout.xStart);
        const q = Math.max(0, Math.min(totalQ - 1, Math.round(frac * totalQ)));
        return { year: cfg.startYear + Math.floor(q / 4), quarter: (q % 4) + 1 };
    }

    function yToRegionRow(y) {
        for (let rpIdx = 0; rpIdx < state.regionPlans.length; rpIdx++) {
            const rp = state.regionPlans[rpIdx];
            if (!rp._startY) continue;
            const numRows = Math.max(1, rp.subRows.length);
            if (y >= rp._startY && y < rp._startY + numRows * ROW_HEIGHT) {
                return { regionIdx: rpIdx, rowIdx: Math.floor((y - rp._startY) / ROW_HEIGHT) };
            }
        }
        return null;
    }

    function initInteraction() {
        if (im) im.destroy();
        im = new InteractionManager('portfolio-canvas', {
            onDrag(id, dx, dy, dragState) {
                if (!dragState._undoSaved) { dragState._undoSaved = true; saveUndo(); }
                const data = dragState.data;
                if (data._type === 'checkpoint') {
                    const newX = dragState.origX + dx;
                    const newY = dragState.origY + dy;
                    const yq = xToYearQuarter(newX);
                    data.year = yq.year; data.quarter = yq.quarter;
                    const rr = yToRegionRow(newY);
                    if (rr) {
                        data.regionIdx = rr.regionIdx; data.rowIdx = rr.rowIdx;
                        // Toggle position based on where within the row
                        const rp = state.regionPlans[rr.regionIdx];
                        if (rp) {
                            const rowMid = rp._startY + rr.rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
                            data.position = newY < rowMid ? 'top' : 'bottom';
                        }
                    }
                    render();
                } else if (data._type === 'comment') {
                    data.x = Math.max(0, Math.round(dragState.origX + dx));
                    data.y = Math.max(10, Math.round(dragState.origY + dy));
                    render();
                } else if (data._type === 'highlightbox') {
                    data.x = Math.max(0, Math.round(dragState.origX + dx));
                    data.y = Math.max(0, Math.round(dragState.origY + dy));
                    render();
                } else if (data._type === 'scenario') {
                    // Snapshot originals on FIRST drag call
                    if (!dragState._snapInit) {
                        dragState._snapInit = true;
                        dragState._snapSY = data.startYear; dragState._snapSQ = data.startQ;
                        dragState._snapEY = data.endYear; dragState._snapEQ = data.endQ;
                        dragState._snapRgn = data.regionIdx; dragState._snapRow = data.rowIdx || 0;
                    }
                    const cfg = getConfig();
                    const origStartX = yearQuarterToX(dragState._snapSY, dragState._snapSQ, cfg.startYear, cfg.endYear, _layout.xStart, _layout.xEnd);
                    const origEndX = yearQuarterToX(dragState._snapEY, dragState._snapEQ, cfg.startYear, cfg.endYear, _layout.xStart, _layout.xEnd);
                    const newS = xToYearQuarter(origStartX + dx);
                    const newE = xToYearQuarter(origEndX + dx);
                    data.startYear = newS.year; data.startQ = newS.quarter;
                    data.endYear = newE.year; data.endQ = newE.quarter;
                    // Also allow vertical drag to change region/row
                    const midY = dragState.origY + dy;
                    const rr = yToRegionRow(midY);
                    if (rr) { data.regionIdx = rr.regionIdx; data.rowIdx = rr.rowIdx; }
                    render();
                }
            },
            onResizeDrag(id, edge, dx, dy, dragState) {
                const data = dragState.data;
                if (data._type === 'scenario') {
                    if (!dragState._snapInit) {
                        dragState._snapInit = true;
                        dragState._snapSY = data.startYear; dragState._snapSQ = data.startQ;
                        dragState._snapEY = data.endYear; dragState._snapEQ = data.endQ;
                    }
                    const cfg = getConfig();
                    if (edge === 'left') {
                        const origX = yearQuarterToX(dragState._snapSY, dragState._snapSQ, cfg.startYear, cfg.endYear, _layout.xStart, _layout.xEnd);
                        const yq = xToYearQuarter(origX + dx);
                        data.startYear = yq.year; data.startQ = yq.quarter;
                    } else if (edge === 'right') {
                        const origX = yearQuarterToX(dragState._snapEY, dragState._snapEQ, cfg.startYear, cfg.endYear, _layout.xStart, _layout.xEnd);
                        const yq = xToYearQuarter(origX + dx);
                        data.endYear = yq.year; data.endQ = yq.quarter;
                    }
                    render();
                } else if (data._type === 'highlightbox') {
                    if (edge === 'right') data.width = Math.max(20, dragState.origW + dx);
                    else if (edge === 'bottom') data.height = Math.max(20, dragState.origH + dy);
                    else if (edge === 'left') { data.x = dragState.origX + dx; data.width = Math.max(20, dragState.origW - dx); }
                    else if (edge === 'top') { data.y = dragState.origY + dy; data.height = Math.max(20, dragState.origH - dy); }
                    render();
                }
            },
            onClick(id, data, type) {
                if (data._type === 'checkpoint') showCheckpointEditor(data);
                else if (data._type === 'scenario') showScenarioEditor(data);
                else if (data._type === 'comment') showCommentEditor(data, state.comments, render);
                else if (data._type === 'highlightbox') showHighlightBoxEditor(data);
            },
            onHover(id, data) { render(); },
        });
    }

    function showCheckpointEditor(cp) {
        const idx = state.checkpoints.indexOf(cp);
        openModal('Edit Checkpoint', buildEditFormHtml([
            { label: 'Label (\\n for newline)', id: 'ed-cp-label', type: 'text', value: cp.label.replace(/\n/g, '\\n') },
            { label: 'Color', id: 'ed-cp-color', type: 'color', value: cp.color },
            { label: 'Shape', id: 'ed-cp-shape', type: 'select', value: cp.shape, options: SHAPES.map(s => ({ value: s, label: s })) },
            { label: 'Filled', id: 'ed-cp-filled', type: 'checkbox', value: cp.filled },
            { label: 'Position', id: 'ed-cp-pos', type: 'select', value: cp.position || 'top', options: [{ value: 'top', label: 'Above bar' }, { value: 'bottom', label: 'Below bar' }] },
            { label: 'Year', id: 'ed-cp-year', type: 'number', value: cp.year, min: 2020, max: 2050 },
            { label: 'Quarter', id: 'ed-cp-q', type: 'number', value: cp.quarter, min: 1, max: 4 },
            { label: 'Region Index', id: 'ed-cp-rgn', type: 'number', value: cp.regionIdx, min: 0 },
            { label: 'Row Index', id: 'ed-cp-row', type: 'number', value: cp.rowIdx || 0, min: 0 },
        ]), () => {
            saveUndo();
            cp.label = document.getElementById('ed-cp-label').value.replace(/\\n/g, '\n');
            cp.color = document.getElementById('ed-cp-color').value;
            cp.shape = document.getElementById('ed-cp-shape').value;
            cp.filled = document.getElementById('ed-cp-filled').checked;
            cp.position = document.getElementById('ed-cp-pos').value;
            cp.year = +document.getElementById('ed-cp-year').value;
            cp.quarter = +document.getElementById('ed-cp-q').value;
            cp.regionIdx = +document.getElementById('ed-cp-rgn').value;
            cp.rowIdx = +document.getElementById('ed-cp-row').value;
            render();
        }, () => { saveUndo(); state.checkpoints.splice(idx, 1); render(); });
    }

    function showScenarioEditor(sc) {
        const idx = state.scenarios.indexOf(sc);
        openModal('Edit Scenario Bar', buildEditFormHtml([
            { label: 'Label', id: 'ed-sc-label', type: 'text', value: sc.label },
            { label: 'Color', id: 'ed-sc-color', type: 'color', value: sc.color },
            { label: 'Start Year', id: 'ed-sc-sy', type: 'number', value: sc.startYear, min: 2020, max: 2050 },
            { label: 'Start Quarter', id: 'ed-sc-sq', type: 'number', value: sc.startQ, min: 1, max: 4 },
            { label: 'End Year', id: 'ed-sc-ey', type: 'number', value: sc.endYear, min: 2020, max: 2050 },
            { label: 'End Quarter', id: 'ed-sc-eq', type: 'number', value: sc.endQ, min: 1, max: 4 },
            { label: 'Region Index', id: 'ed-sc-rgn', type: 'number', value: sc.regionIdx, min: 0 },
            { label: 'Row Index', id: 'ed-sc-row', type: 'number', value: sc.rowIdx || 0, min: 0 },
        ]), () => {
            saveUndo();
            sc.label = document.getElementById('ed-sc-label').value;
            sc.color = document.getElementById('ed-sc-color').value;
            sc.startYear = +document.getElementById('ed-sc-sy').value;
            sc.startQ = +document.getElementById('ed-sc-sq').value;
            sc.endYear = +document.getElementById('ed-sc-ey').value;
            sc.endQ = +document.getElementById('ed-sc-eq').value;
            sc.regionIdx = +document.getElementById('ed-sc-rgn').value;
            sc.rowIdx = +document.getElementById('ed-sc-row').value;
            render();
        }, () => { saveUndo(); state.scenarios.splice(idx, 1); render(); });
    }

    function showHighlightBoxEditor(hb) {
        const idx = state.highlightBoxes.indexOf(hb);
        openModal('Edit Highlight Box', buildEditFormHtml([
            { label: 'Label', id: 'ed-hb-label', type: 'text', value: hb.label },
            { label: 'Color', id: 'ed-hb-color', type: 'color', value: hb.color },
            { label: 'Width', id: 'ed-hb-w', type: 'number', value: hb.width, min: 20 },
            { label: 'Height', id: 'ed-hb-h', type: 'number', value: hb.height, min: 20 },
        ]), () => {
            saveUndo();
            hb.label = document.getElementById('ed-hb-label').value;
            hb.color = document.getElementById('ed-hb-color').value;
            hb.width = +document.getElementById('ed-hb-w').value;
            hb.height = +document.getElementById('ed-hb-h').value;
            render();
        }, () => { saveUndo(); state.highlightBoxes.splice(idx, 1); render(); });
    }

    function render() {
        const canvas = getCanvas();
        const cfg = getConfig();
        const totalQ = (cfg.endYear - cfg.startYear + 1) * 4;
        const qWidth = 42; // wider quarters for more space

        let totalRows = 0;
        state.regionPlans.forEach(rp => { totalRows += Math.max(1, rp.subRows.length); totalRows += 0.4; });

        const canvasW = MARGIN.left + totalQ * qWidth + MARGIN.right;
        const canvasH = MARGIN.top + totalRows * ROW_HEIGHT + MARGIN.bottom + 60;
        const ctx = setupHiDPI(canvas, canvasW, canvasH);

        const xStart = MARGIN.left;
        const xEnd = MARGIN.left + totalQ * qWidth;
        _layout = { xStart, xEnd, cfg, qWidth };
        _canvasH = canvasH;

        if (!im) initInteraction();
        im.clearHitAreas();

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Main title
        drawMainTitle(ctx, cfg.title, canvasW / 2, 28);

        // Timeline header
        const contentY = drawTimelineHeader(ctx, cfg.startYear, cfg.endYear, xStart, xEnd, MARGIN.top - 48, canvasH - MARGIN.bottom, {});

        // Region plans
        let currentY = contentY + 10;
        state.regionPlans.forEach((rp, rpIdx) => {
            const rpStartY = currentY;
            const numRows = Math.max(1, rp.subRows.length);
            const rpHeight = numRows * ROW_HEIGHT;

            if (rp.bgColor && rp.bgColor !== 'transparent') {
                ctx.fillStyle = rp.bgColor;
                ctx.fillRect(0, rpStartY, canvasW, rpHeight);
            }
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.strokeRect(2, rpStartY, MARGIN.left - 12, rpHeight);

            ctx.fillStyle = '#222'; ctx.font = 'bold 14px Segoe UI'; ctx.textAlign = 'left';
            ctx.fillText(rp.name, 10, rpStartY + 22);

            rp.subRows.forEach((sr, srIdx) => {
                const rowY = rpStartY + srIdx * ROW_HEIGHT;
                ctx.fillStyle = '#555'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
                sr.label.split('\n').forEach((line, li) => ctx.fillText(line, 20, rowY + 45 + li * 16));
                // Light row separator
                if (srIdx > 0) {
                    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(MARGIN.left, rowY); ctx.lineTo(xEnd, rowY); ctx.stroke();
                }
            });

            rp._startY = rpStartY;
            rp._rowHeight = ROW_HEIGHT;
            currentY += rpHeight + 30; // gap between regions
        });

        // Scenarios (horizontal bars) - draw first (behind checkpoints)
        state.scenarios.forEach(sc => {
            const rp = state.regionPlans[sc.regionIdx];
            if (!rp) return;
            const rowY = rp._startY + (sc.rowIdx || 0) * ROW_HEIGHT;
            const cfg2 = getConfig();
            const x1 = yearQuarterToX(sc.startYear, sc.startQ, cfg2.startYear, cfg2.endYear, xStart, xEnd);
            const x2 = yearQuarterToX(sc.endYear, sc.endQ, cfg2.startYear, cfg2.endYear, xStart, xEnd);
            // Position bar in middle of row, leaving space above for checkpoints and below for labels
            const barY = rowY + 38;
            const barH = 24;

            ctx.fillStyle = sc.color; ctx.globalAlpha = 0.7;
            ctx.fillRect(x1, barY, Math.max(x2 - x1, 10), barH);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#000'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center';
            if (x2 - x1 > 30) ctx.fillText(truncText(ctx, sc.label, x2 - x1 - 10), (x1 + x2) / 2, barY + 16);

            // Hit area for scenario - use the actual bar position
            im.addHitArea(sc.id, 'scenario', x1, barY, Math.max(x2 - x1, 10), barH,
                Object.assign(sc, { _type: 'scenario', x: (x1 + x2) / 2, y: rowY + 50 }),
                { cursor: 'grab', resizable: true, resizeEdges: ['left', 'right'] });
        });

        // Checkpoints (position-aware: top or bottom of scenario bar)
        state.checkpoints.forEach(cp => {
            const rp = state.regionPlans[cp.regionIdx];
            if (!rp) return;
            const rowY = rp._startY + (cp.rowIdx || 0) * ROW_HEIGHT;
            const cfg2 = getConfig();
            const x = yearQuarterToX(cp.year, cp.quarter, cfg2.startYear, cfg2.endYear, xStart, xEnd);

            const pos = cp.position || 'top';
            let shapeY, labelY;
            if (pos === 'bottom') {
                // Shape below bar (bar ends at rowY+62), label immediately below shape
                shapeY = rowY + 72;
                labelY = shapeY + 14;
            } else {
                // Label above bar, shape immediately above label
                const lines = cp.label.split('\n');
                const labelH = lines.length * 12;
                labelY = rowY + 14;
                shapeY = labelY + labelH + 4;
            }

            drawShape(ctx, cp.shape, x, shapeY, 10, cp.color, cp.filled);
            ctx.textAlign = 'center';
            if (pos === 'top') {
                // Label above shape
                const lines = cp.label.split('\n');
                lines.forEach((line, li) => {
                    ctx.font = li === 0 ? 'bold 10px Segoe UI' : '9px Segoe UI';
                    ctx.fillStyle = li === 0 ? '#333' : '#666';
                    ctx.fillText(line, x, labelY + li * 12);
                });
            } else {
                // Label below shape
                cp.label.split('\n').forEach((line, li) => {
                    ctx.font = li === 0 ? 'bold 10px Segoe UI' : '9px Segoe UI';
                    ctx.fillStyle = li === 0 ? '#333' : '#666';
                    ctx.fillText(line, x, labelY + li * 12);
                });
            }

            const totalLines = cp.label.split('\n').length;
            const hitTop = Math.min(shapeY - 12, labelY - 12);
            const hitBottom = Math.max(shapeY + 12, labelY + totalLines * 12);
            im.addHitArea(cp.id, 'checkpoint', x - 16, hitTop, 32, hitBottom - hitTop,
                Object.assign(cp, { _type: 'checkpoint', x, y: shapeY }),
                { cursor: 'move' });
        });

        // Highlight boxes
        state.highlightBoxes.forEach(hb => {
            if (hb.width <= 0 || hb.height <= 0) return;
            ctx.strokeStyle = hb.color || '#ff9800'; ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 4]);
            ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
            ctx.setLineDash([]);
            if (hb.label) {
                ctx.fillStyle = hb.color || '#ff9800'; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'left';
                ctx.fillText(hb.label, hb.x + 4, hb.y - 4);
            }
            im.addHitArea(hb.id, 'highlightbox', hb.x, hb.y, hb.width, hb.height,
                Object.assign(hb, { _type: 'highlightbox' }),
                { cursor: 'move', resizable: true, resizeEdges: ['left', 'right', 'top', 'bottom'] });
        });

        // Comments (transparent text)
        drawComments(ctx, state.comments, im);

        // Hover highlight
        im.drawHoverHighlight(ctx);

        renderEditPanel();
    }

    function renderEditPanel() {
        const panel = document.getElementById('portfolio-edit-panel');
        let html = '<p style="font-size:11px;color:#2196F3;margin-bottom:8px;">Drag elements to move. Click to edit. Drag scenario edges to resize.</p>';

        html += '<div class="item-group-header">Region Plans</div>';
        state.regionPlans.forEach((rp, i) => {
            const isTrans = rp.bgColor === 'transparent';
            html += `<div class="edit-item"><label>Region ${i + 1}:</label>
                <input type="text" value="${rp.name}" onchange="Portfolio.updateRegionPlan(${i},'name',this.value)">
                <input type="color" value="${isTrans ? '#ffffff' : (rp.bgColor || '#fafafa')}" ${isTrans ? 'disabled' : ''} style="width:30px;height:22px;vertical-align:middle;" onchange="Portfolio.updateRegionPlan(${i},'bgColor',this.value)">
                <label style="font-size:10px;"><input type="checkbox" ${isTrans ? 'checked' : ''} onchange="Portfolio.updateRegionPlan(${i},'bgColor',this.checked?'transparent':'#fafafa')"> Transp</label>
                <button class="btn btn-xs btn-primary" onclick="Portfolio.addSubRow(${i})">+ SubRow</button>
                <button class="btn btn-xs btn-danger" onclick="Portfolio.removeRegionPlan(${i})">Remove</button></div>`;
            rp.subRows.forEach((sr, j) => {
                html += `<div class="edit-item" style="padding-left:30px;"><label>Row ${j}:</label>
                    <input type="text" value="${sr.label}" onchange="Portfolio.updateSubRow(${i},${j},'label',this.value)">
                    <button class="btn btn-xs btn-danger" onclick="Portfolio.removeSubRow(${i},${j})">x</button></div>`;
            });
        });

        html += `<div class="item-group-header">Scenarios (${state.scenarios.length})</div>`;
        state.scenarios.forEach((sc, i) => {
            html += `<div class="edit-item"><span style="display:inline-block;width:14px;height:14px;background:${sc.color};border-radius:2px;vertical-align:middle;"></span>
                <b style="font-size:11px">${sc.label}</b> <span style="color:#888;font-size:10px">${sc.startYear}Q${sc.startQ}-${sc.endYear}Q${sc.endQ}</span>
                <button class="btn btn-xs btn-danger" onclick="Portfolio.removeScenario(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Checkpoints (${state.checkpoints.length})</div>`;
        state.checkpoints.forEach((cp, i) => {
            html += `<div class="edit-item"><span style="color:${cp.color};font-size:14px;">\u25B2</span>
                <b style="font-size:11px">${cp.label.replace(/\n/g, ' ')}</b> <span style="color:#888;font-size:10px">${cp.year}Q${cp.quarter}</span>
                <button class="btn btn-xs btn-danger" onclick="Portfolio.removeCheckpoint(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Comments (${state.comments.length})</div>`;
        state.comments.forEach((c, i) => {
            html += `<div class="edit-item"><b style="font-size:11px">${(c.text || '').slice(0, 40)}</b>
                <button class="btn btn-xs btn-danger" onclick="Portfolio.removeComment(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Highlight Boxes (${state.highlightBoxes.length})</div>`;
        state.highlightBoxes.forEach((hb, i) => {
            html += `<div class="edit-item"><b style="font-size:11px">${hb.label || 'Untitled'}</b>
                <button class="btn btn-xs btn-danger" onclick="Portfolio.removeHighlightBox(${i})">x</button></div>`;
        });

        panel.innerHTML = html;
    }

    // CRUD
    function addRegionPlan() { saveUndo(); state.regionPlans.push({ id: uid(), name: 'New Region', region: 'Region', bgColor: '#fafafa', subRows: [{ id: uid(), label: 'Row 1' }] }); render(); }
    function removeRegionPlan(i) { saveUndo(); state.regionPlans.splice(i, 1); render(); }
    function updateRegionPlan(i, k, v) { saveUndo(); state.regionPlans[i][k] = v; render(); }
    function addSubRow(rpIdx) { saveUndo(); state.regionPlans[rpIdx].subRows.push({ id: uid(), label: 'New Row' }); render(); }
    function removeSubRow(rpIdx, srIdx) { saveUndo(); state.regionPlans[rpIdx].subRows.splice(srIdx, 1); render(); }
    function updateSubRow(rpIdx, srIdx, k, v) { saveUndo(); state.regionPlans[rpIdx].subRows[srIdx][k] = v; render(); }
    function addScenario() { saveUndo(); state.scenarios.push({ id: uid(), label: 'New Scenario', color: '#8fbc8f', startYear: 2026, startQ: 1, endYear: 2028, endQ: 4, regionIdx: 0, rowIdx: 0 }); render(); }
    function removeScenario(i) { saveUndo(); state.scenarios.splice(i, 1); render(); }
    function addCheckpoint() { saveUndo(); state.checkpoints.push({ id: uid(), label: 'New Checkpoint', shape: 'triangle', color: '#c0392b', filled: true, year: 2027, quarter: 1, regionIdx: 0, rowIdx: 0, position: 'top' }); render(); }
    function removeCheckpoint(i) { saveUndo(); state.checkpoints.splice(i, 1); render(); }
    function addComment() { saveUndo(); state.comments.push({ id: uid(), text: 'New comment', x: 220, y: _canvasH - MARGIN.bottom + 5, fontSize: 12, color: '#333333' }); render(); }
    function removeComment(i) { saveUndo(); state.comments.splice(i, 1); render(); }
    function addHighlightBox() { saveUndo(); state.highlightBoxes.push({ id: uid(), x: 250, y: 150, width: 200, height: 100, color: '#ff9800', label: 'Highlight' }); render(); }
    function removeHighlightBox(i) { saveUndo(); state.highlightBoxes.splice(i, 1); render(); }
    function exportPNG() { exportCanvasAsPNG('portfolio-canvas', 'portfolio_landscape.png'); }

    return {
        render, undo, addRegionPlan, removeRegionPlan, updateRegionPlan,
        addSubRow, removeSubRow, updateSubRow,
        addScenario, removeScenario, addCheckpoint, removeCheckpoint,
        addComment, removeComment, addHighlightBox, removeHighlightBox, exportPNG,
    };
})();
