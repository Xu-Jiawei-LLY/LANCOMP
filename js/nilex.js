/* === Page 5: NILEX Overview (Interactive) === */
const Nilex = (() => {
    let state = {
        indications: [
            { id: uid(), label: 'CWM\nhigh-dose' },
            { id: uid(), label: 'Pediatric\nCWM' },
            { id: uid(), label: 'T2D' },
            { id: uid(), label: 'CVD' },
            { id: uid(), label: 'OSA' },
            { id: uid(), label: 'HFpEF' },
            { id: uid(), label: 'HTN' },
            { id: uid(), label: 'PAD' },
            { id: uid(), label: 'CKD' },
            { id: uid(), label: 'MASH' },
            { id: uid(), label: 'OA' },
            { id: uid(), label: 'PCOS' },
            { id: uid(), label: 'SUI' },
        ],
        compounds: [
            { id: uid(), name: 'Ozempic China', region: '' },
            { id: uid(), name: 'Wegovy US', region: '' },
            { id: uid(), name: 'Wegovy China', region: '' },
            { id: uid(), name: 'Mazdutide', region: '' },
            { id: uid(), name: 'Survodutide', region: '' },
            { id: uid(), name: 'Ribupatide', region: '' },
            { id: uid(), name: 'Cagrisema US', region: '' },
            { id: uid(), name: 'Cagrisema China', region: '' },
            { id: uid(), name: 'Amycretin US', region: '' },
            { id: uid(), name: 'Amycretin China', region: '' },
            { id: uid(), name: 'MariTide*', region: '' },
            { id: uid(), name: 'Ecnoglutide', region: '' },
            { id: uid(), name: 'Bofanglutide', region: '' },
            { id: uid(), name: 'RAY1225', region: '' },
            { id: uid(), name: 'UBT251', region: '' },
        ],
        statusTypes: [
            { id: uid(), label: 'Indication', color: '#27ae60', textColor: '#fff' },
            { id: uid(), label: 'Label', color: '#8fbc8f', textColor: '#fff' },
            { id: uid(), label: 'NDA-S', color: '#90EE90', textColor: '#333' },
            { id: uid(), label: 'Phase 3', color: '#f5f5f5', textColor: '#333', border: true },
            { id: uid(), label: 'Phase 3 completed', color: '#f0f0f0', textColor: '#333', border: true },
            { id: uid(), label: 'Phase 2', color: '#f5f5f5', textColor: '#888', border: true },
            { id: uid(), label: 'Phase 2b', color: '#f5f5f5', textColor: '#888', border: true },
            { id: uid(), label: 'Phase 2a', color: '#f5f5f5', textColor: '#888', border: true },
            { id: uid(), label: 'Phase 1', color: '#f5f5f5', textColor: '#aaa', border: true },
            { id: uid(), label: 'CTP-A', color: '#f5f5f5', textColor: '#aaa', border: true },
        ],
        cells: {
            '0_2': { statusTypeIdx: 0, customLabel: 'Indication' },
            '0_3': { statusTypeIdx: 0, customLabel: 'Indication' },
            '0_7': { statusTypeIdx: 1, customLabel: 'Label' },
            '0_8': { statusTypeIdx: 0, customLabel: 'Indication' },
            '1_0': { statusTypeIdx: 0, customLabel: '7.2mg\nIndication' },
            '1_1': { statusTypeIdx: 0, customLabel: 'Indication' },
            '1_2': { statusTypeIdx: 0, customLabel: 'Ozempic' },
            '1_3': { statusTypeIdx: 0, customLabel: 'Indication' },
            '1_5': { statusTypeIdx: 1, customLabel: 'Label' },
            '1_9': { statusTypeIdx: 0, customLabel: 'Indication' },
            '1_11': { statusTypeIdx: 4, customLabel: 'Phase 3\ncompleted' },
            '2_2': { statusTypeIdx: 0, customLabel: '' },
            '2_3': { statusTypeIdx: 0, customLabel: 'Indication' },
            '2_9': { statusTypeIdx: 2, customLabel: 'NDA-S' },
            '3_0': { statusTypeIdx: 3, customLabel: '9mg\nNDA-s' },
            '3_1': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '3_3': { statusTypeIdx: 0, customLabel: 'Indication' },
            '3_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '3_6': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '3_9': { statusTypeIdx: 6, customLabel: 'Phase 2b' },
            '4_3': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '4_9': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '5_0': { statusTypeIdx: 3, customLabel: '8mg Ph2\ncompleted' },
            '5_3': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '5_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '5_5': { statusTypeIdx: 5, customLabel: 'Phase 2' },
            '5_12': { statusTypeIdx: 5, customLabel: 'Phase 2' },
            '6_1': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '6_2': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '6_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '6_8': { statusTypeIdx: 5, customLabel: 'Phase 2' },
            '6_9': { statusTypeIdx: 6, customLabel: 'Phase 2b' },
            '7_1': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '7_2': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '8_3': { statusTypeIdx: 5, customLabel: 'Phase 2' },
            '8_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '8_10': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '9_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '10_3': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '10_5': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '11_1': { statusTypeIdx: 8, customLabel: 'Phase 1' },
            '11_3': { statusTypeIdx: 0, customLabel: 'Indication' },
            '11_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '11_10': { statusTypeIdx: 7, customLabel: 'Phase 2a' },
            '12_2': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '12_4': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '13_2': { statusTypeIdx: 3, customLabel: 'Phase 3' },
            '13_4': { statusTypeIdx: 9, customLabel: 'CTP-A' },
            '14_2': { statusTypeIdx: 5, customLabel: 'Phase 2' },
            '14_4': { statusTypeIdx: 9, customLabel: 'CTP-A' },
            '14_8': { statusTypeIdx: 5, customLabel: 'Phase 2' },
            '14_9': { statusTypeIdx: 6, customLabel: 'Phase 2b' },
        },
        comments: [],
        sourceText: '',
        activeBrush: null, // statusTypeIdx or null
        legendItems: [
            { id: uid(), symbol: 'rect', color: '#27ae60', label: 'Indication: The corresponding indication has been approved.' },
            { id: uid(), symbol: 'rect', color: '#8fbc8f', label: 'Label: The clinical trial data has been included in the label; no new indication has been approved.' },
        ],
    };

    const MARGIN = { top: 80, left: 130, right: 20, bottom: 80 };
    const CELL_W = 90;
    const CELL_H = 36;
    const HEADER_H = 40;
    let im = null;
    let _hoveredCell = null;
    let _canvasH = 500;

    function saveUndo() { UndoManager.pushState('nilex', state); }
    function undo() { const prev = UndoManager.undo('nilex'); if (prev) { state = prev; render(); } }

    // Drag-cell state: tracks a filled cell being dragged to another cell
    let _cellDrag = null; // { srcKey, row, col, mx, my } or null

    function getCanvas() { return document.getElementById('nilex-canvas'); }
    function getConfig() { return { title: document.getElementById('nx-title').value }; }

    // Compute grid geometry (shared by render and helpers)
    function gridGeometry() {
        const numCols = state.indications.length;
        const numRows = state.compounds.length;
        const gridW = numCols * CELL_W;
        const gridH = numRows * CELL_H;
        const canvasW = MARGIN.left + gridW + MARGIN.right;
        const canvasH = MARGIN.top + HEADER_H + gridH + MARGIN.bottom;
        const gridStartX = MARGIN.left;
        const gridStartY = MARGIN.top;
        const rowStartY = gridStartY + HEADER_H;
        return { numCols, numRows, gridW, gridH, canvasW, canvasH, gridStartX, gridStartY, rowStartY };
    }

    // Given mouse coordinates, return {row, col} of the cell under the mouse, or null
    function cellAtMouse(mx, my) {
        const g = gridGeometry();
        const col = Math.floor((mx - g.gridStartX) / CELL_W);
        const row = Math.floor((my - g.rowStartY) / CELL_H);
        if (col >= 0 && col < g.numCols && row >= 0 && row < g.numRows) {
            return { row, col };
        }
        return null;
    }

    function showCellEditor(row, col) {
        const key = `${row}_${col}`;
        const existing = state.cells[key];
        const compName = state.compounds[row] ? state.compounds[row].name : `Row ${row}`;
        const indName = state.indications[col] ? state.indications[col].label.replace(/\n/g, ' ') : `Col ${col}`;
        const statusOpts = state.statusTypes.map((st, si) => ({ value: si, label: st.label }));

        openModal(`Edit Cell: ${compName} / ${indName}`, buildEditFormHtml([
            { label: 'Status Type', id: 'ed-nx-status', type: 'select', value: existing ? existing.statusTypeIdx : 0, options: statusOpts },
            { label: 'Custom Label (\\n for newline)', id: 'ed-nx-label', type: 'text', value: existing ? (existing.customLabel || '').replace(/\n/g, '\\n') : '' },
        ]), () => {
            saveUndo();
            const statusIdx = +document.getElementById('ed-nx-status').value;
            const label = document.getElementById('ed-nx-label').value.replace(/\\n/g, '\n');
            state.cells[key] = { statusTypeIdx: statusIdx, customLabel: label };
            render();
        }, existing ? () => { saveUndo(); delete state.cells[key]; render(); } : null);
    }

    function showCompoundEditor(comp) {
        const idx = state.compounds.indexOf(comp);
        openModal('Edit Compound', buildEditFormHtml([
            { label: 'Name', id: 'ed-nx-cname', type: 'text', value: comp.name },
            { label: 'Region', id: 'ed-nx-crgn', type: 'text', value: comp.region || '' },
        ]), () => {
            saveUndo();
            comp.name = document.getElementById('ed-nx-cname').value;
            comp.region = document.getElementById('ed-nx-crgn').value;
            render();
        }, () => { saveUndo(); state.compounds.splice(idx, 1); render(); });
    }

    function showIndicationEditor(ind) {
        const idx = state.indications.indexOf(ind);
        openModal('Edit Indication', buildEditFormHtml([
            { label: 'Label (\\n for newline)', id: 'ed-nx-iname', type: 'text', value: ind.label.replace(/\n/g, '\\n') },
        ]), () => {
            saveUndo();
            ind.label = document.getElementById('ed-nx-iname').value.replace(/\\n/g, '\n');
            render();
        }, () => { saveUndo(); state.indications.splice(idx, 1); render(); });
    }

    function initInteraction() {
        if (im) im.destroy();
        im = new InteractionManager('nilex-canvas', {
            onClick(id, data, type) {
                if (data._type === 'comment') {
                    showCommentEditor(data, state.comments, render);
                    return;
                }
                if (data._type === 'cell') {
                    // Paint mode: if a brush is active, paint the cell instead of opening editor
                    if (state.activeBrush !== null) {
                        saveUndo();
                        const key = `${data.row}_${data.col}`;
                        const st = state.statusTypes[state.activeBrush];
                        state.cells[key] = { statusTypeIdx: state.activeBrush, customLabel: st ? st.label : '' };
                        render();
                        return;
                    }
                    showCellEditor(data.row, data.col);
                } else if (data._type === 'compound-label') {
                    showCompoundEditor(data._comp);
                } else if (data._type === 'indication-header') {
                    showIndicationEditor(data._ind);
                }
            },
            onHover(id, data) {
                if (data && data._type === 'cell') {
                    _hoveredCell = { row: data.row, col: data.col };
                } else {
                    _hoveredCell = null;
                }
                render();
            },
            onDrag(id, dx, dy, dragState) {
                if (!dragState._undoSaved) { dragState._undoSaved = true; saveUndo(); }
                const data = dragState.data;
                // Comment drag
                if (data._type === 'comment') {
                    data.x = dragState.origX + dx;
                    data.y = dragState.origY + dy;
                    render();
                    return;
                }
                // Cell drag (filled cells only)
                if (data._type === 'cell') {
                    const key = `${data.row}_${data.col}`;
                    if (state.cells[key]) {
                        _cellDrag = {
                            srcKey: key,
                            row: data.row,
                            col: data.col,
                            mx: dragState.startMx + dx,
                            my: dragState.startMy + dy,
                        };
                        render();
                    }
                }
            },
            onDragEnd(id, data) {
                // Comment drag end -- nothing extra needed
                if (data._type === 'comment') {
                    render();
                    return;
                }
                // Cell drag end: move cell data to target
                if (data._type === 'cell' && _cellDrag) {
                    const target = cellAtMouse(_cellDrag.mx, _cellDrag.my);
                    if (target) {
                        const targetKey = `${target.row}_${target.col}`;
                        const srcKey = _cellDrag.srcKey;
                        if (targetKey !== srcKey && state.cells[srcKey]) {
                            // Move: copy source data to target, delete source
                            state.cells[targetKey] = Object.assign({}, state.cells[srcKey]);
                            delete state.cells[srcKey];
                        }
                    }
                    _cellDrag = null;
                    render();
                }
            },
        });
    }

    function render() {
        const canvas = getCanvas();
        const cfg = getConfig();

        const g = gridGeometry();
        const logicalW = g.canvasW;
        const logicalH = g.canvasH;
        _canvasH = logicalH;

        // HiDPI setup
        const ctx = setupHiDPI(canvas, logicalW, logicalH);

        if (!im) initInteraction();
        im.clearHitAreas();

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, logicalW, logicalH);

        // Title with green highlight -- centered at top
        const titleText = cfg.title;
        const titleParts = titleText.split(' - ');
        ctx.font = 'bold 22px Segoe UI';
        ctx.textAlign = 'center';
        const centerX = logicalW / 2;
        if (titleParts.length > 1) {
            const prefix = titleParts[0] + ' - ';
            const highlight = titleParts.slice(1).join(' - ');
            const prefixW = ctx.measureText(prefix).width;
            const highlightW = ctx.measureText(highlight).width;
            const totalW = prefixW + highlightW;
            const startX = centerX - totalW / 2;
            ctx.fillStyle = '#222';
            ctx.textAlign = 'left';
            ctx.fillText(prefix, startX, 40);
            ctx.fillStyle = '#27ae60';
            ctx.fillText(highlight, startX + prefixW, 40);
        } else {
            ctx.fillStyle = '#222';
            ctx.fillText(titleText, centerX, 40);
        }

        const gridStartX = g.gridStartX;
        const gridStartY = g.gridStartY;
        const rowStartY = g.rowStartY;

        // Column headers
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(gridStartX, gridStartY, g.gridW, HEADER_H);
        state.indications.forEach((ind, i) => {
            const cx = gridStartX + i * CELL_W;
            ctx.strokeStyle = '#ccc'; ctx.lineWidth = 0.5;
            ctx.strokeRect(cx, gridStartY, CELL_W, HEADER_H);

            // Highlight column on hover
            if (_hoveredCell && _hoveredCell.col === i) {
                ctx.fillStyle = 'rgba(33,150,243,0.06)';
                ctx.fillRect(cx, gridStartY, CELL_W, HEADER_H + g.gridH);
            }

            ctx.fillStyle = '#333'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center';
            ind.label.split('\n').forEach((line, li) => ctx.fillText(line, cx + CELL_W / 2, gridStartY + 16 + li * 12));

            // Hit area for header
            im.addHitArea(ind.id, 'indication-header', cx, gridStartY, CELL_W, HEADER_H,
                { _type: 'indication-header', _ind: ind },
                { cursor: 'pointer', draggable: false });
        });

        // Rows
        state.compounds.forEach((comp, rIdx) => {
            const ry = rowStartY + rIdx * CELL_H;

            // Highlight row on hover
            if (_hoveredCell && _hoveredCell.row === rIdx) {
                ctx.fillStyle = 'rgba(33,150,243,0.06)';
                ctx.fillRect(0, ry, logicalW, CELL_H);
            } else if (rIdx % 2 === 1) {
                ctx.fillStyle = '#fafafa';
                ctx.fillRect(0, ry, logicalW, CELL_H);
            }

            // Compound name
            ctx.fillStyle = '#333'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'right';
            ctx.fillText(comp.name, MARGIN.left - 10, ry + CELL_H / 2 + 4);
            if (comp.region) {
                ctx.fillStyle = '#888'; ctx.font = '9px Segoe UI';
                ctx.fillText(comp.region, MARGIN.left - 10, ry + CELL_H / 2 + 16);
            }

            // Hit area for compound label
            im.addHitArea(comp.id, 'compound-label', 0, ry, MARGIN.left - 5, CELL_H,
                { _type: 'compound-label', _comp: comp },
                { cursor: 'pointer', draggable: false });

            // Cells
            state.indications.forEach((ind, cIdx) => {
                const cx = gridStartX + cIdx * CELL_W;
                const cellKey = `${rIdx}_${cIdx}`;
                const cellData = state.cells[cellKey];

                // If this cell is being dragged away, skip drawing its content
                const isDragSource = _cellDrag && _cellDrag.srcKey === cellKey;

                ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 0.5;
                ctx.strokeRect(cx, ry, CELL_W, CELL_H);

                if (cellData && !isDragSource) {
                    const st = state.statusTypes[cellData.statusTypeIdx];
                    if (st) {
                        ctx.fillStyle = st.color;
                        ctx.fillRect(cx + 1, ry + 1, CELL_W - 2, CELL_H - 2);
                        if (st.border) {
                            ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
                            ctx.strokeRect(cx + 1, ry + 1, CELL_W - 2, CELL_H - 2);
                        }
                        const label = cellData.customLabel || st.label;
                        ctx.fillStyle = st.textColor || '#333';
                        ctx.font = '10px Segoe UI'; ctx.textAlign = 'center';
                        const cellLines = label.split('\n');
                        const lineH = 12;
                        const textStartY = ry + (CELL_H - cellLines.length * lineH) / 2 + 10;
                        cellLines.forEach((line, li) => ctx.fillText(line, cx + CELL_W / 2, textStartY + li * lineH));
                    }
                }

                // Hover highlight for specific cell
                if (_hoveredCell && _hoveredCell.row === rIdx && _hoveredCell.col === cIdx) {
                    ctx.strokeStyle = '#2196F3'; ctx.lineWidth = 2;
                    ctx.strokeRect(cx, ry, CELL_W, CELL_H);
                }

                // Hit area for cell: draggable only if cell has data
                const hasCellData = !!cellData;
                im.addHitArea(`cell_${rIdx}_${cIdx}`, 'cell', cx, ry, CELL_W, CELL_H,
                    { _type: 'cell', row: rIdx, col: cIdx },
                    { cursor: state.activeBrush !== null ? 'crosshair' : 'pointer', draggable: hasCellData });
            });

            ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(0, ry + CELL_H); ctx.lineTo(logicalW, ry + CELL_H); ctx.stroke();
        });

        // Draw ghost cell following mouse during cell drag
        if (_cellDrag && state.cells[_cellDrag.srcKey]) {
            const srcData = state.cells[_cellDrag.srcKey];
            const st = state.statusTypes[srcData.statusTypeIdx];
            if (st) {
                const gx = _cellDrag.mx - CELL_W / 2;
                const gy = _cellDrag.my - CELL_H / 2;
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = st.color;
                ctx.fillRect(gx, gy, CELL_W, CELL_H);
                if (st.border) {
                    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
                    ctx.strokeRect(gx, gy, CELL_W, CELL_H);
                }
                const label = srcData.customLabel || st.label;
                ctx.fillStyle = st.textColor || '#333';
                ctx.font = '10px Segoe UI'; ctx.textAlign = 'center';
                const cellLines = label.split('\n');
                const lineH = 12;
                const textStartY = gy + (CELL_H - cellLines.length * lineH) / 2 + 10;
                cellLines.forEach((line, li) => ctx.fillText(line, gx + CELL_W / 2, textStartY + li * lineH));
                ctx.globalAlpha = 1.0;

                // Highlight the target cell under the mouse
                const target = cellAtMouse(_cellDrag.mx, _cellDrag.my);
                if (target) {
                    const tcx = gridStartX + target.col * CELL_W;
                    const tcy = rowStartY + target.row * CELL_H;
                    ctx.strokeStyle = '#2196F3'; ctx.lineWidth = 2;
                    ctx.setLineDash([4, 3]);
                    ctx.strokeRect(tcx, tcy, CELL_W, CELL_H);
                    ctx.setLineDash([]);
                }
            }
        }

        // Comments
        drawComments(ctx, state.comments, im);

        // Legend
        const legendY = rowStartY + g.numRows * CELL_H + 20;
        if (state.legendItems.length > 0) {
            ctx.fillStyle = '#333'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'left';
            ctx.fillText('Please refer to:', MARGIN.left, legendY);

            let ly = legendY + 18;
            state.legendItems.forEach(item => {
                ctx.fillStyle = item.color;
                ctx.fillRect(MARGIN.left, ly - 10, 70, 16);
                ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'center';
                const rectLabel = item.label.split(':')[0] || '';
                ctx.fillText(rectLabel, MARGIN.left + 35, ly + 2);
                ctx.fillStyle = '#888'; ctx.font = '9px Segoe UI'; ctx.textAlign = 'left';
                ctx.fillText(item.label, MARGIN.left + 80, ly + 2);
                ly += 20;
            });
        }

        ctx.fillStyle = '#888'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
        ctx.fillText(state.sourceText, MARGIN.left, logicalH - 20);

        renderEditPanel();
    }

    function renderEditPanel() {
        const panel = document.getElementById('nilex-edit-panel');
        let html = '<p style="font-size:11px;color:#2196F3;margin-bottom:8px;">Click any cell to set/edit status. Click column headers or row labels to edit. Hover highlights row+column. Drag filled cells to move them.</p>';

        // Brush mode indicator
        if (state.activeBrush !== null) {
            const brushSt = state.statusTypes[state.activeBrush];
            html += `<div style="background:#fff3cd;border:1px solid #ffc107;padding:6px 10px;margin-bottom:8px;border-radius:4px;font-size:12px;">
                <strong>Brush active:</strong> <span style="display:inline-block;width:14px;height:14px;background:${brushSt ? brushSt.color : '#ccc'};border:1px solid #999;vertical-align:middle;margin:0 4px;"></span>
                ${brushSt ? brushSt.label : '?'} &mdash; click any cell to paint.
                <button class="btn btn-xs" style="margin-left:8px;background:#dc3545;color:#fff;" onclick="Nilex.clearBrush()">Clear Brush</button>
            </div>`;
        }

        html += '<div class="item-group-header">Indications (Columns)</div>';
        state.indications.forEach((ind, i) => {
            html += `<div class="edit-item"><label>Col ${i}:</label>
                <input type="text" value="${ind.label.replace(/\n/g, '\\n')}" onchange="Nilex.updateIndication(${i},this.value.replace(/\\\\n/g,'\\n'))">
                <button class="btn btn-xs btn-danger" onclick="Nilex.removeIndication(${i})">x</button></div>`;
        });

        html += '<div class="item-group-header">Compounds (Rows)</div>';
        state.compounds.forEach((c, i) => {
            html += `<div class="edit-item"><label>Row ${i}:</label>
                <input type="text" value="${c.name}" style="width:120px" onchange="Nilex.updateCompoundName(${i},this.value)">
                <input type="text" value="${c.region}" style="width:60px" placeholder="Region" onchange="Nilex.updateCompoundRegion(${i},this.value)">
                <button class="btn btn-xs btn-danger" onclick="Nilex.removeCompound(${i})">x</button></div>`;
        });

        html += '<div class="item-group-header">Status Types</div>';
        state.statusTypes.forEach((st, i) => {
            const isActiveBrush = state.activeBrush === i;
            html += `<div class="edit-item">
                <input type="text" value="${st.label}" style="width:120px" onchange="Nilex.updateStatusType(${i},'label',this.value)">
                <input type="color" value="${st.color}" onchange="Nilex.updateStatusType(${i},'color',this.value)">
                <label>Txt:</label><input type="color" value="${st.textColor}" onchange="Nilex.updateStatusType(${i},'textColor',this.value)">
                <label><input type="checkbox" ${st.border ? 'checked' : ''} onchange="Nilex.updateStatusType(${i},'border',this.checked)"> Border</label>
                <button class="btn btn-xs" style="margin-left:4px;background:${isActiveBrush ? '#ff9800' : '#607d8b'};color:#fff;" onclick="Nilex.setBrush(${i})">${isActiveBrush ? 'Brushing' : 'Brush'}</button>
                <button class="btn btn-xs btn-danger" onclick="Nilex.removeStatusType(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Comments (${state.comments.length})</div>`;
        state.comments.forEach((c, i) => {
            html += `<div class="edit-item">
                <span style="font-size:10px;color:#666">${c.text.split('\n')[0].substring(0, 30)}</span>
                <button class="btn btn-xs btn-danger" onclick="Nilex.removeComment(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Legends (${state.legendItems.length})</div>`;
        state.legendItems.forEach((item, i) => {
            html += `<div class="edit-item">
                <input type="color" value="${item.color}" onchange="Nilex.updateLegend(${i},'color',this.value)">
                <input type="text" value="${item.label}" style="width:360px" onchange="Nilex.updateLegend(${i},'label',this.value)">
                <button class="btn btn-xs btn-danger" onclick="Nilex.removeLegend(${i})">x</button></div>`;
        });
        html += `<div class="edit-item"><button class="btn btn-xs" onclick="Nilex.addLegend()">+ Legend</button></div>`;

        panel.innerHTML = html;
    }

    function addIndication() { saveUndo(); state.indications.push({ id: uid(), label: 'New' }); render(); }
    function removeIndication(i) { saveUndo(); state.indications.splice(i, 1); render(); }
    function updateIndication(i, val) { saveUndo(); state.indications[i].label = val; render(); }
    function addCompound() { saveUndo(); state.compounds.push({ id: uid(), name: 'New Compound', region: '' }); render(); }
    function removeCompound(i) { saveUndo(); state.compounds.splice(i, 1); render(); }
    function updateCompoundName(i, val) { saveUndo(); state.compounds[i].name = val; render(); }
    function updateCompoundRegion(i, val) { saveUndo(); state.compounds[i].region = val; render(); }
    function addStatusType() { saveUndo(); state.statusTypes.push({ id: uid(), label: 'New Status', color: '#e0e0e0', textColor: '#333', border: true }); render(); }
    function removeStatusType(i) {
        saveUndo();
        // If the removed status type was the active brush, clear the brush
        if (state.activeBrush === i) state.activeBrush = null;
        else if (state.activeBrush !== null && state.activeBrush > i) state.activeBrush--;
        state.statusTypes.splice(i, 1);
        render();
    }
    function updateStatusType(i, k, v) { saveUndo(); state.statusTypes[i][k] = v; render(); }

    // Brush mode
    function setBrush(i) {
        state.activeBrush = (state.activeBrush === i) ? null : i; // toggle if already active
        render();
    }
    function clearBrush() { state.activeBrush = null; render(); }

    // Comments
    function addComment() {
        saveUndo();
        state.comments.push({
            id: uid(), text: 'New comment', x: MARGIN.left + 200, y: _canvasH - MARGIN.bottom + 5,
            fontSize: 12, color: '#333',
        });
        render();
    }
    function removeComment(i) { saveUndo(); state.comments.splice(i, 1); render(); }

    // Legends
    function addLegend() { saveUndo(); state.legendItems.push({ id: uid(), symbol: 'rect', color: '#999999', label: 'New legend item' }); render(); }
    function updateLegend(i, k, v) { saveUndo(); state.legendItems[i][k] = v; render(); }
    function removeLegend(i) { saveUndo(); state.legendItems.splice(i, 1); render(); }

    function exportPNG() { exportCanvasAsPNG('nilex-canvas', 'nilex_overview.png'); }

    return {
        render, undo, addIndication, removeIndication, updateIndication,
        addCompound, removeCompound, updateCompoundName, updateCompoundRegion,
        addStatusType, removeStatusType, updateStatusType,
        setBrush, clearBrush,
        addComment, removeComment,
        addLegend, updateLegend, removeLegend,
        exportPNG,
    };
})();
