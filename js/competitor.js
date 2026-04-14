/* === Page 2: Compound Competitor Landscape (Interactive) === */
const Competitor = (() => {
    let state = {
        statusStages: [
            { id: uid(), label: 'Before phase 3*', width: 1 },
            { id: uid(), label: 'Phase 3', width: 1 },
            { id: uid(), label: 'NDA-S', width: 0.7 },
            { id: uid(), label: 'Approved', width: 0.7 },
        ],
        compoundTypes: [
            {
                id: uid(), label: 'Dual receptor agonists GLP1+', italic: true,
                subTypes: [
                    { id: uid(), label: 'GLP-1' },
                    { id: uid(), label: 'GIP' },
                    { id: uid(), label: 'GCG' },
                    { id: uid(), label: 'AMY' },
                    { id: uid(), label: 'FGF21' },
                ]
            },
        ],
        compounds: [
            { id: uid(), name: 'Semaglutide 2.4mg', company: 'Novo Nordisk', color: '#f8d7da', stageIdx: 3, typeIdx: 0, subTypeIdx: 0, dosing: '', dosingColor: '#c0392b' },
            { id: uid(), name: 'Liraglutide 3.0mg', company: 'Novo Nordisk', color: '#f8d7da', stageIdx: 3, typeIdx: 0, subTypeIdx: 0, dosing: '', dosingColor: '#c0392b' },
            { id: uid(), name: 'Efsubaglutide/Supaglutide', company: '', color: '#f8d7da', stageIdx: 1, typeIdx: 0, subTypeIdx: 0, dosing: 'QW\nQ2W', dosingColor: '#c0392b' },
            { id: uid(), name: 'MET-097i', company: '', color: '#f8d7da', stageIdx: 0, typeIdx: 0, subTypeIdx: 0, dosing: '', dosingColor: '' },
            { id: uid(), name: 'Poterepatide/HDM1005(GLP-1/GIP)', company: '', color: '#f8d7da', stageIdx: 1, typeIdx: 0, subTypeIdx: 1, dosing: '', dosingColor: '' },
            { id: uid(), name: 'RAY1225 (GLP-1/GIP)', company: '', color: '#f8d7da', stageIdx: 1, typeIdx: 0, subTypeIdx: 1, dosing: 'Q2W', dosingColor: '#c0392b' },
            { id: uid(), name: 'Survodutide (GLP-1/GCG)', company: '', color: '#f8d7da', stageIdx: 1, typeIdx: 0, subTypeIdx: 2, dosing: '', dosingColor: '' },
            { id: uid(), name: 'Amycretin (GLP-1/AMY)', company: 'Novo Nordisk', color: '#f8d7da', stageIdx: 0, typeIdx: 0, subTypeIdx: 3, dosing: '', dosingColor: '' },
            { id: uid(), name: 'CagriSema (GLP-1/AMY)', company: 'Novo Nordisk', color: '#f8d7da', stageIdx: 1, typeIdx: 0, subTypeIdx: 3, dosing: '', dosingColor: '' },
            { id: uid(), name: 'HEC88473 (GLP-1/FGF21)', company: '', color: '#f8d7da', stageIdx: 0, typeIdx: 0, subTypeIdx: 4, dosing: '', dosingColor: '' },
        ],
        comments: [],
        sourceText: '',
        footnote: '',
    };

    const MARGIN = { top: 80, left: 180, right: 40, bottom: 80 };
    const MIN_ROW_HEIGHT = 50;
    const BAR_H = 36;
    const BAR_VSPACE = 42;   // vertical space per compound when stacking
    const GROUP_GAP = 30;    // extra vertical gap between compound type groups

    let im = null;
    let _stageXs = [];       // [{x, width}] per stage column
    let _rowYs = [];          // [{y, height, typeIdx, subTypeIdx}] for drop-target calculation
    let _canvasH = 500;

    function saveUndo() { UndoManager.pushState('competitor', state); }
    function undo() { const prev = UndoManager.undo('competitor'); if (prev) { state = prev; render(); } }

    function getCanvas() { return document.getElementById('competitor-canvas'); }
    function getConfig() { return { title: document.getElementById('cc-title').value }; }

    /** Map an x-coordinate to a stage index */
    function xToStageIdx(x) {
        for (let i = 0; i < _stageXs.length; i++) {
            if (x >= _stageXs[i].x && x < _stageXs[i].x + _stageXs[i].width) return i;
        }
        return 0;
    }

    /** Map a y-coordinate to a row index in _rowYs */
    function yToRowIdx(y) {
        for (let i = 0; i < _rowYs.length; i++) {
            if (y >= _rowYs[i].y && y < _rowYs[i].y + _rowYs[i].height) return i;
        }
        // Clamp: above all rows => first, below all => last
        if (_rowYs.length === 0) return 0;
        if (y < _rowYs[0].y) return 0;
        return _rowYs.length - 1;
    }

    function showCompoundEditor(comp) {
        const idx = state.compounds.indexOf(comp);
        const stageOpts = state.statusStages.map((s, si) => ({ value: si, label: s.label }));
        const typeOpts = [];
        state.compoundTypes.forEach((ct, ci) => {
            ct.subTypes.forEach((st, si) => {
                typeOpts.push({ value: `${ci}_${si}`, label: `${ct.label} > ${st.label}` });
            });
        });

        openModal('Edit Compound', buildEditFormHtml([
            { label: 'Name', id: 'ed-cc-name', type: 'text', value: comp.name },
            { label: 'Company', id: 'ed-cc-company', type: 'text', value: comp.company },
            { label: 'Bar Color', id: 'ed-cc-color', type: 'color', value: comp.color },
            { label: 'Stage', id: 'ed-cc-stage', type: 'select', value: comp.stageIdx, options: stageOpts },
            { label: 'Type > SubType', id: 'ed-cc-type', type: 'select', value: `${comp.typeIdx}_${comp.subTypeIdx}`, options: typeOpts },
            { label: 'Dosing (\\n for newline)', id: 'ed-cc-dosing', type: 'text', value: (comp.dosing || '').replace(/\n/g, '\\n') },
            { label: 'Dosing Circle Color', id: 'ed-cc-dosingc', type: 'color', value: comp.dosingColor || '#c0392b' },
        ]), () => {
            saveUndo();
            comp.name = document.getElementById('ed-cc-name').value;
            comp.company = document.getElementById('ed-cc-company').value;
            comp.color = document.getElementById('ed-cc-color').value;
            comp.stageIdx = +document.getElementById('ed-cc-stage').value;
            const typeParts = document.getElementById('ed-cc-type').value.split('_');
            comp.typeIdx = +typeParts[0];
            comp.subTypeIdx = +typeParts[1];
            comp.dosing = document.getElementById('ed-cc-dosing').value.replace(/\\n/g, '\n');
            comp.dosingColor = document.getElementById('ed-cc-dosingc').value;
            render();
        }, () => { saveUndo(); state.compounds.splice(idx, 1); render(); });
    }

    function initInteraction() {
        if (im) im.destroy();
        im = new InteractionManager('competitor-canvas', {
            onDrag(id, dx, dy, dragState) {
                if (!dragState._undoSaved) { dragState._undoSaved = true; saveUndo(); }
                const data = dragState.data;
                if (data._type === 'compound') {
                    const newX = dragState.origX + dx;
                    const newY = dragState.origY + dy;
                    data.stageIdx = xToStageIdx(newX);
                    const rowIdx = yToRowIdx(newY);
                    if (rowIdx >= 0 && rowIdx < _rowYs.length) {
                        data.typeIdx = _rowYs[rowIdx].typeIdx;
                        data.subTypeIdx = _rowYs[rowIdx].subTypeIdx;
                    }
                    render();
                } else if (data._type === 'comment') {
                    data.x = dragState.origX + dx;
                    data.y = dragState.origY + dy;
                    render();
                }
            },
            onClick(id, data, type) {
                if (data._type === 'compound') showCompoundEditor(data);
                else if (data._type === 'comment') showCommentEditor(data, state.comments, render);
            },
            onHover(id, data) { render(); },
        });
    }

    function render() {
        const canvas = getCanvas();
        const cfg = getConfig();

        // --- Stage column geometry ---
        const stageWidths = state.statusStages.map(s => s.width);
        const totalStageW = stageWidths.reduce((a, b) => a + b, 0);
        const contentW = 1100;
        _stageXs = [];
        let cx = MARGIN.left;
        stageWidths.forEach((w) => {
            const colW = (w / totalStageW) * contentW;
            _stageXs.push({ x: cx, width: colW });
            cx += colW;
        });

        // --- Build row info with auto-resize ---
        // One row per subType; row height = max(MIN_ROW_HEIGHT, maxCompoundsInAnyCell * BAR_VSPACE)
        const rowInfo = [];
        state.compoundTypes.forEach((ct, ctIdx) => {
            ct.subTypes.forEach((st, stIdx) => {
                const compounds = state.compounds.filter(c => c.typeIdx === ctIdx && c.subTypeIdx === stIdx);
                const byStage = {};
                compounds.forEach(c => {
                    if (!byStage[c.stageIdx]) byStage[c.stageIdx] = [];
                    byStage[c.stageIdx].push(c);
                });
                let maxInCell = 0;
                Object.values(byStage).forEach(arr => { maxInCell = Math.max(maxInCell, arr.length); });
                const rowHeight = Math.max(MIN_ROW_HEIGHT, maxInCell * BAR_VSPACE);
                rowInfo.push({ typeIdx: ctIdx, subTypeIdx: stIdx, label: st.label, compounds, byStage, rowHeight });
            });
        });

        // --- Calculate Y positions with group gaps ---
        _rowYs = [];
        let currentY = MARGIN.top;
        let prevType = -1;
        rowInfo.forEach((ri) => {
            if (ri.typeIdx !== prevType && prevType !== -1) currentY += GROUP_GAP;
            _rowYs.push({ y: currentY, height: ri.rowHeight, typeIdx: ri.typeIdx, subTypeIdx: ri.subTypeIdx });
            currentY += ri.rowHeight;
            prevType = ri.typeIdx;
        });
        const bottomY = currentY + 10;
        const canvasW = MARGIN.left + contentW + MARGIN.right;
        const canvasH = bottomY + MARGIN.bottom + 20;
        _canvasH = canvasH;

        // --- HiDPI setup ---
        const ctx = setupHiDPI(canvas, canvasW, canvasH);

        if (!im) initInteraction();
        im.clearHitAreas();

        // --- Background ---
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // --- Main title ---
        drawMainTitle(ctx, cfg.title, canvasW / 2, 40);

        // --- Stage column vertical lines ---
        ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
        _stageXs.forEach((s) => {
            ctx.beginPath(); ctx.moveTo(s.x, MARGIN.top); ctx.lineTo(s.x, bottomY); ctx.stroke();
        });
        const lastStage = _stageXs[_stageXs.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastStage.x + lastStage.width, MARGIN.top);
        ctx.lineTo(lastStage.x + lastStage.width, bottomY);
        ctx.stroke();

        // --- Stage header labels at bottom ---
        ctx.font = 'bold 13px Segoe UI'; ctx.textAlign = 'center'; ctx.fillStyle = '#222';
        _stageXs.forEach((s, i) => {
            ctx.fillText(state.statusStages[i].label, s.x + s.width / 2, bottomY + 15);
        });

        // --- Draw rows: backgrounds, gridlines, sub-type labels, type brackets ---
        const drawnTypeHeaders = {};
        _rowYs.forEach((ry, idx) => {
            const ri = rowInfo[idx];
            const rowY = ry.y;
            const rowH = ry.height;

            // Light alternating tint per type group
            if (ri.typeIdx % 2 === 0) {
                ctx.fillStyle = 'rgba(248,215,218,0.08)';
                ctx.fillRect(MARGIN.left, rowY, contentW, rowH);
            }

            // Thin horizontal row separator
            ctx.strokeStyle = '#eee'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(MARGIN.left, rowY); ctx.lineTo(canvasW - MARGIN.right, rowY); ctx.stroke();

            // --- Compound type bracket + label (once per type group) ---
            if (!drawnTypeHeaders[ri.typeIdx]) {
                drawnTypeHeaders[ri.typeIdx] = true;
                const ct = state.compoundTypes[ri.typeIdx];
                const typeRows = _rowYs.filter(r => r.typeIdx === ri.typeIdx);
                const typeStartY = typeRows[0].y;
                const typeEndY = typeRows[typeRows.length - 1].y + typeRows[typeRows.length - 1].height;

                // Red bracket on far left
                const bracketX = 18;
                ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(bracketX + 8, typeStartY + 4);
                ctx.lineTo(bracketX, typeStartY + 4);
                ctx.lineTo(bracketX, typeEndY - 4);
                ctx.lineTo(bracketX + 8, typeEndY - 4);
                ctx.stroke();

                // Type label: horizontal, word-wrapped within the left margin
                ctx.fillStyle = '#222';
                ctx.font = ct.italic ? 'italic bold 11px Segoe UI' : 'bold 11px Segoe UI';
                ctx.textAlign = 'left';
                const midY = (typeStartY + typeEndY) / 2;
                const maxLabelW = MARGIN.left - 70; // available width for type label
                const words = ct.label.split(' ');
                const wrappedLines = [];
                let currentLine = '';
                words.forEach(w => {
                    const test = currentLine ? currentLine + ' ' + w : w;
                    if (ctx.measureText(test).width > maxLabelW && currentLine) {
                        wrappedLines.push(currentLine);
                        currentLine = w;
                    } else {
                        currentLine = test;
                    }
                });
                if (currentLine) wrappedLines.push(currentLine);
                const lineH = 14;
                const startTextY = midY - (wrappedLines.length - 1) * lineH / 2 + 4;
                wrappedLines.forEach((line, li) => {
                    ctx.fillText(line, bracketX + 12, startTextY + li * lineH);
                });

                // Red separator line between different type groups
                if (ri.typeIdx > 0) {
                    const sepY = typeStartY - GROUP_GAP / 2;
                    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(0, sepY);
                    ctx.lineTo(canvasW, sepY);
                    ctx.stroke();
                }
            }

            // Sub-type label (italic, horizontal, right-aligned against the grid)
            ctx.fillStyle = '#555'; ctx.font = 'italic 12px Segoe UI'; ctx.textAlign = 'right';
            ctx.fillText(ri.label, MARGIN.left - 10, rowY + rowH / 2 + 4);
        });

        // Bottom border of last row
        if (_rowYs.length > 0) {
            const last = _rowYs[_rowYs.length - 1];
            ctx.strokeStyle = '#eee'; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(MARGIN.left, last.y + last.height);
            ctx.lineTo(canvasW - MARGIN.right, last.y + last.height);
            ctx.stroke();
        }

        // --- Draw compounds ---
        _rowYs.forEach((ry, idx) => {
            const ri = rowInfo[idx];
            const rowY = ry.y;
            const rowH = ry.height;

            Object.entries(ri.byStage).forEach(([stageIdxStr, compounds]) => {
                const stageIdx = parseInt(stageIdxStr);
                const stage = _stageXs[stageIdx];
                if (!stage) return;

                const barW = Math.min(stage.width - 20, 220);
                const totalBarsH = compounds.length * BAR_VSPACE;
                const startBarY = rowY + (rowH - totalBarsH) / 2 + (BAR_VSPACE - BAR_H) / 2;

                compounds.forEach((comp, ci) => {
                    const barX = stage.x + 10;
                    const barY = startBarY + ci * BAR_VSPACE;

                    // Bar background
                    ctx.fillStyle = comp.color || '#f8d7da';
                    ctx.fillRect(barX, barY, barW, BAR_H);
                    ctx.strokeStyle = '#dbb'; ctx.lineWidth = 0.5;
                    ctx.strokeRect(barX, barY, barW, BAR_H);

                    // Dosing circle
                    if (comp.dosing) {
                        const circleR = 14;
                        const circleX = barX + circleR + 4;
                        const circleY = barY + BAR_H / 2;
                        ctx.fillStyle = comp.dosingColor || '#c0392b';
                        ctx.beginPath(); ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Segoe UI'; ctx.textAlign = 'center';
                        const dosLines = comp.dosing.split('\n');
                        dosLines.forEach((dl, di) => {
                            ctx.fillText(dl, circleX, circleY - (dosLines.length - 1) * 5 + di * 10 + 3);
                        });
                    }

                    // Name text
                    ctx.fillStyle = '#222'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
                    const textX = comp.dosing ? barX + 35 : barX + 6;
                    ctx.fillText(truncText(ctx, comp.name, barW - (comp.dosing ? 40 : 12)), textX, barY + 14);

                    // Company text
                    if (comp.company) {
                        ctx.fillStyle = '#c0392b'; ctx.font = '9px Segoe UI';
                        ctx.fillText(truncText(ctx, comp.company, barW - 12), textX, barY + 28);
                    }

                    // Hit area
                    im.addHitArea(comp.id, 'compound', barX, barY, barW, BAR_H,
                        Object.assign(comp, { _type: 'compound', x: barX + barW / 2, y: barY + BAR_H / 2 }),
                        { cursor: 'grab' });
                });
            });
        });

        // --- Comments ---
        drawComments(ctx, state.comments, im);

        // --- Hover highlight (drawn last so it's on top) ---
        im.drawHoverHighlight(ctx);

        // --- Source & footnote ---
        ctx.fillStyle = '#888'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
        ctx.fillText(state.sourceText, MARGIN.left, canvasH - 30);
        ctx.font = 'italic 10px Segoe UI';
        ctx.fillText(state.footnote, MARGIN.left + 300, canvasH - 30);

        renderEditPanel();
    }

    function renderEditPanel() {
        const panel = document.getElementById('competitor-edit-panel');
        let html = '<p style="font-size:11px;color:#2196F3;margin-bottom:8px;">Drag compounds between stages and rows. Click to edit.</p>';

        html += '<div class="item-group-header">Status Stages</div>';
        state.statusStages.forEach((s, i) => {
            html += `<div class="edit-item"><label>Stage ${i + 1}:</label>
                <input type="text" value="${s.label}" onchange="Competitor.updateStage(${i},'label',this.value)">
                <label>W:</label><input type="number" value="${s.width}" step="0.1" min="0.1" style="width:60px" onchange="Competitor.updateStage(${i},'width',+this.value)">
                <button class="btn btn-xs btn-danger" onclick="Competitor.removeStage(${i})">x</button></div>`;
        });

        html += '<div class="item-group-header">Compound Types</div>';
        state.compoundTypes.forEach((ct, i) => {
            html += `<div class="edit-item"><label>Type:</label>
                <input type="text" value="${ct.label}" onchange="Competitor.updateCompoundType(${i},'label',this.value)">
                <button class="btn btn-xs btn-primary" onclick="Competitor.addSubType(${i})">+ Sub</button>
                <button class="btn btn-xs btn-danger" onclick="Competitor.removeCompoundType(${i})">x</button></div>`;
            ct.subTypes.forEach((st, j) => {
                html += `<div class="edit-item" style="padding-left:30px;">
                    <input type="text" value="${st.label}" onchange="Competitor.updateSubType(${i},${j},'label',this.value)">
                    <button class="btn btn-xs btn-danger" onclick="Competitor.removeSubType(${i},${j})">x</button></div>`;
            });
        });

        html += `<div class="item-group-header">Compounds (${state.compounds.length})</div>`;
        state.compounds.forEach((c, i) => {
            html += `<div class="edit-item">
                <span style="display:inline-block;width:14px;height:14px;background:${c.color};border-radius:2px;vertical-align:middle;"></span>
                <b style="font-size:11px">${c.name}</b>
                <span style="color:#888;font-size:10px">[${state.statusStages[c.stageIdx]?.label || '?'}]</span>
                <button class="btn btn-xs btn-danger" onclick="Competitor.removeCompound(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Comments (${state.comments.length})</div>`;
        state.comments.forEach((c, i) => {
            html += `<div class="edit-item">
                <span style="font-size:10px;color:#666">${c.text.split('\\n')[0].substring(0, 30)}</span>
                <button class="btn btn-xs btn-danger" onclick="Competitor.removeComment(${i})">x</button></div>`;
        });

        panel.innerHTML = html;
    }

    function addStatusStage() { saveUndo(); state.statusStages.push({ id: uid(), label: 'New Stage', width: 0.7 }); render(); }
    function removeStage(i) { saveUndo(); state.statusStages.splice(i, 1); render(); }
    function updateStage(i, k, v) { saveUndo(); state.statusStages[i][k] = v; render(); }
    function addCompoundType() { saveUndo(); state.compoundTypes.push({ id: uid(), label: 'New Type', italic: false, subTypes: [{ id: uid(), label: 'SubType 1' }] }); render(); }
    function removeCompoundType(i) { saveUndo(); state.compoundTypes.splice(i, 1); render(); }
    function updateCompoundType(i, k, v) { saveUndo(); state.compoundTypes[i][k] = v; render(); }
    function addSubType(ctIdx) { saveUndo(); state.compoundTypes[ctIdx].subTypes.push({ id: uid(), label: 'New SubType' }); render(); }
    function removeSubType(ctIdx, stIdx) { saveUndo(); state.compoundTypes[ctIdx].subTypes.splice(stIdx, 1); render(); }
    function updateSubType(ctIdx, stIdx, k, v) { saveUndo(); state.compoundTypes[ctIdx].subTypes[stIdx][k] = v; render(); }
    function addCompound() { saveUndo(); state.compounds.push({ id: uid(), name: 'New Compound', company: '', color: '#f8d7da', stageIdx: 0, typeIdx: 0, subTypeIdx: 0, dosing: '', dosingColor: '#c0392b' }); render(); }
    function removeCompound(i) { saveUndo(); state.compounds.splice(i, 1); render(); }
    function addComment() { saveUndo(); state.comments.push({ id: uid(), text: 'New comment', x: MARGIN.left + 50, y: _canvasH - MARGIN.bottom + 5, fontSize: 12, color: '#333333' }); render(); }
    function removeComment(i) { saveUndo(); state.comments.splice(i, 1); render(); }
    function exportPNG() { exportCanvasAsPNG('competitor-canvas', 'competitor_landscape.png'); }

    return {
        render, undo, addCompoundType, removeCompoundType, updateCompoundType,
        addSubType, removeSubType, updateSubType,
        addCompound, removeCompound, addStatusStage, removeStage, updateStage,
        addComment, removeComment, exportPNG,
    };
})();
