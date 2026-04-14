/* === Page 3: Indication-level Landscape (Interactive) === */
const Indication = (() => {
    let state = {
        regions: [
            { id: uid(), label: 'MNC', color: '#c0392b', fontSize: 14, fontStyle: 'bold' },
            { id: uid(), label: 'Local', color: '#27ae60', fontSize: 14, fontStyle: 'bold' },
        ],
        compounds: [
            { id: uid(), name: 'TZP & Reta QW', regionIdx: 0, startYear: 2027, startQ: 1, endYear: 2034, endQ: 4, color: '#d4a0a0', barStyle: 'arrow', approvalYear: 2031, approvalQ: 1, approvalLabel: 'TZP & Reta QW', logo: 'lilly.png', description: '' },
            { id: uid(), name: 'Semaglutide 2.4mg QW', regionIdx: 0, startYear: 2025, startQ: 3, endYear: 2030, endQ: 4, color: '#d4a0a0', barStyle: 'arrow', approvalYear: 2026, approvalQ: 3, approvalLabel: 'Semaglutide 2.4mg QW\nGLP-1RA\nInjectable', logo: 'novo_nordisk.png', description: '' },
            { id: uid(), name: 'Survodutide QW', regionIdx: 0, startYear: 2026, startQ: 1, endYear: 2032, endQ: 2, color: '#d4a0a0', barStyle: 'arrow', approvalYear: 2030, approvalQ: 3, approvalLabel: 'Survodutide QW\nGLP-1RA / GCGRA\nInjectable', logo: 'boehringer.png', description: '' },
            { id: uid(), name: 'Lanifibranor QD', regionIdx: 1, startYear: 2027, startQ: 1, endYear: 2033, endQ: 2, color: '#d4a0a0', barStyle: 'arrow', approvalYear: 2030, approvalQ: 2, approvalLabel: 'Lanifibranor QD\nPPARa/PPARd/PPARy\nOral', logo: 'inventiva.png', description: '' },
        ],
        legendItems: [
            { id: uid(), symbol: 'circle', color: '#c0392b', label: 'Estimated time of approval by Regulatory', filled: true },
            { id: uid(), symbol: 'arrow', color: '#d4a0a0', label: 'Time window of registration trial', filled: true },
        ],
        comments: [],
        emptyRows: [],
    };

    const MARGIN = { top: 80, left: 100, right: 240, bottom: 80 };
    let im = null;
    let _layout = {};
    let _canvasH = 500;

    function saveUndo() { UndoManager.pushState('indication', state); }
    function undo() { const prev = UndoManager.undo('indication'); if (prev) { state = prev; render(); } }

    function getCanvas() { return document.getElementById('indication-canvas'); }
    function getCtx() { return getCanvas().getContext('2d'); }
    function getConfig() {
        return {
            title: document.getElementById('il-title').value,
            startYear: parseInt(document.getElementById('il-start-year').value),
            endYear: parseInt(document.getElementById('il-end-year').value),
        };
    }

    function xToYearQuarter(x) {
        const cfg = getConfig();
        const totalQ = (cfg.endYear - cfg.startYear + 1) * 4;
        const frac = (x - _layout.xStart) / (_layout.xEnd - _layout.xStart);
        const q = Math.round(frac * totalQ);
        const year = cfg.startYear + Math.floor(q / 4);
        const quarter = (q % 4) + 1;
        return { year: Math.max(cfg.startYear, Math.min(cfg.endYear, year)), quarter: Math.max(1, Math.min(4, quarter)) };
    }

    function showCompoundEditor(comp) {
        const idx = state.compounds.indexOf(comp);
        const regionOpts = state.regions.map((r, i) => ({ value: i, label: r.label }));
        const logoOpts = [{ value: '', label: '(none)' }, ...LOGO_FILES.filter(f => f).map(f => ({ value: f, label: f })), { value: '__custom__', label: '-- Type company name --' }];
        const isCustom = comp.logo && !LOGO_FILES.includes(comp.logo) && comp.logo !== '__custom__';
        openModal('Edit Compound Bar', buildEditFormHtml([
            { label: 'Name', id: 'ed-il-name', type: 'text', value: comp.name },
            { label: 'Bar Color', id: 'ed-il-color', type: 'color', value: comp.color },
            { label: 'Region', id: 'ed-il-rgn', type: 'select', value: comp.regionIdx, options: regionOpts },
            { label: 'Start Year', id: 'ed-il-sy', type: 'number', value: comp.startYear, min: 2020, max: 2050 },
            { label: 'Start Q', id: 'ed-il-sq', type: 'number', value: comp.startQ, min: 1, max: 4 },
            { label: 'End Year', id: 'ed-il-ey', type: 'number', value: comp.endYear, min: 2020, max: 2050 },
            { label: 'End Q', id: 'ed-il-eq', type: 'number', value: comp.endQ, min: 1, max: 4 },
            { label: 'Approval Year', id: 'ed-il-ay', type: 'number', value: comp.approvalYear, min: 2020, max: 2050 },
            { label: 'Approval Q', id: 'ed-il-aq', type: 'number', value: comp.approvalQ || 1, min: 1, max: 4 },
            { label: 'Label (\\n for newline)', id: 'ed-il-label', type: 'text', value: (comp.approvalLabel || '').replace(/\n/g, '\\n') },
            { label: 'Logo filename', id: 'ed-il-logo', type: 'select', value: isCustom ? '__custom__' : (comp.logo || ''), options: logoOpts },
            { label: 'Bar Style', id: 'ed-il-style', type: 'select', value: comp.barStyle, options: [{ value: 'arrow', label: 'Arrow' }, { value: 'bar', label: 'Bar' }, { value: 'point', label: 'Point' }] },
        ]) + `<div id="ed-il-point-opts" style="display:${comp.barStyle === 'point' ? 'block' : 'none'}; border:1px solid #e0e0e0; border-radius:6px; padding:10px; margin:8px 0; background:#fafafa;">
            <div style="font-weight:bold; font-size:11px; margin-bottom:6px; color:#555;">Point Style</div>
            <div class="form-group"><label>Shape</label>
                <select id="ed-il-pt-shape">
                    <option value="circle" ${(comp.pointShape || 'circle') === 'circle' ? 'selected' : ''}>Circle</option>
                    <option value="diamond" ${comp.pointShape === 'diamond' ? 'selected' : ''}>Diamond</option>
                    <option value="triangle" ${comp.pointShape === 'triangle' ? 'selected' : ''}>Triangle</option>
                    <option value="square" ${comp.pointShape === 'square' ? 'selected' : ''}>Square</option>
                    <option value="star" ${comp.pointShape === 'star' ? 'selected' : ''}>Star</option>
                </select></div>
            <div class="form-group"><label>Color</label>
                <input type="color" id="ed-il-pt-color" value="${comp.pointColor || comp.color || '#d4a0a0'}"></div>
            <div class="form-group"><label>Filled</label>
                <select id="ed-il-pt-filled">
                    <option value="yes" ${(comp.pointFilled !== false) ? 'selected' : ''}>Yes</option>
                    <option value="no" ${comp.pointFilled === false ? 'selected' : ''}>No</option>
                </select></div>
            <div class="form-group"><label>Border Color</label>
                <input type="color" id="ed-il-pt-border" value="${comp.pointBorderColor || '#333333'}"></div>
            <div class="form-group"><label>Border Width</label>
                <input type="number" id="ed-il-pt-bwidth" value="${comp.pointBorderWidth != null ? comp.pointBorderWidth : 1.5}" min="0" max="5" step="0.5" style="width:60px"></div>
            <div class="form-group"><label>Size</label>
                <input type="number" id="ed-il-pt-size" value="${comp.pointSize || 7}" min="3" max="20" style="width:60px"></div>
        </div>
        <div class="form-group" id="ed-il-custom-logo-group" style="display:${isCustom || comp.logo === '__custom__' ? 'block' : 'none'}">
            <label>Company name (manual)</label>
            <input type="text" id="ed-il-custom-logo" value="${isCustom ? comp.logo : (comp.customCompanyName || '')}" placeholder="e.g. MyPharma Inc.">
            <label style="margin-top:8px">Upload logo file</label>
            <input type="file" id="ed-il-upload-logo" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" style="font-size:12px;">
            ${comp.uploadedLogoDataURI ? '<div style="margin-top:4px;font-size:10px;color:#27ae60;">Current: uploaded logo loaded &#10003;</div>' : ''}
        </div>`, () => {
            saveUndo();
            comp.name = document.getElementById('ed-il-name').value;
            comp.color = document.getElementById('ed-il-color').value;
            comp.regionIdx = +document.getElementById('ed-il-rgn').value;
            comp.startYear = +document.getElementById('ed-il-sy').value;
            comp.startQ = +document.getElementById('ed-il-sq').value;
            comp.endYear = +document.getElementById('ed-il-ey').value;
            comp.endQ = +document.getElementById('ed-il-eq').value;
            comp.approvalYear = +document.getElementById('ed-il-ay').value;
            comp.approvalQ = +document.getElementById('ed-il-aq').value;
            comp.approvalLabel = document.getElementById('ed-il-label').value.replace(/\\n/g, '\n');
            const logoVal = document.getElementById('ed-il-logo').value;
            const customVal = document.getElementById('ed-il-custom-logo').value.trim();
            // Check if a new logo file was uploaded (stored on a temp property by the change listener)
            const pendingDataURI = document.getElementById('ed-il-upload-logo').dataset.datauri;
            if (logoVal === '__custom__') {
                comp.logo = '';
                comp.customCompanyName = customVal;
                if (pendingDataURI) {
                    comp.uploadedLogoDataURI = pendingDataURI;
                }
            } else {
                comp.logo = logoVal === '__custom__' ? '' : logoVal;
                comp.customCompanyName = '';
                comp.uploadedLogoDataURI = '';
            }
            comp.barStyle = document.getElementById('ed-il-style').value;
            if (comp.barStyle === 'point') {
                if (comp.pointYOffset == null) comp.pointYOffset = 0;
                comp.pointShape = document.getElementById('ed-il-pt-shape').value;
                comp.pointColor = document.getElementById('ed-il-pt-color').value;
                comp.pointFilled = document.getElementById('ed-il-pt-filled').value === 'yes';
                comp.pointBorderColor = document.getElementById('ed-il-pt-border').value;
                comp.pointBorderWidth = parseFloat(document.getElementById('ed-il-pt-bwidth').value);
                comp.pointSize = parseInt(document.getElementById('ed-il-pt-size').value) || 7;
            }
            render();
        }, () => { saveUndo(); state.compounds.splice(idx, 1); render(); });
        // Wire up the logo dropdown to show/hide custom input, and the file upload
        setTimeout(() => {
            // Show/hide Point style options based on Bar Style
            const styleSel = document.getElementById('ed-il-style');
            const pointOptsDiv = document.getElementById('ed-il-point-opts');
            if (styleSel && pointOptsDiv) {
                styleSel.addEventListener('change', () => {
                    pointOptsDiv.style.display = styleSel.value === 'point' ? 'block' : 'none';
                });
            }
            const logoSel = document.getElementById('ed-il-logo');
            const customGroup = document.getElementById('ed-il-custom-logo-group');
            if (logoSel && customGroup) {
                logoSel.addEventListener('change', () => {
                    customGroup.style.display = logoSel.value === '__custom__' ? 'block' : 'none';
                });
            }
            const uploadInput = document.getElementById('ed-il-upload-logo');
            if (uploadInput) {
                uploadInput.addEventListener('change', () => {
                    const file = uploadInput.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        uploadInput.dataset.datauri = e.target.result;
                        // Show confirmation
                        let hint = uploadInput.parentElement.querySelector('.upload-hint');
                        if (!hint) {
                            hint = document.createElement('div');
                            hint.className = 'upload-hint';
                            hint.style.cssText = 'margin-top:4px;font-size:10px;color:#27ae60;';
                            uploadInput.parentElement.appendChild(hint);
                        }
                        hint.textContent = 'File loaded: ' + file.name + ' \u2713';
                    };
                    reader.readAsDataURL(file);
                });
            }
        }, 0);
    }

    function initInteraction() {
        if (im) im.destroy();
        im = new InteractionManager('indication-canvas', {
            onDrag(id, dx, dy, dragState) {
                if (!dragState._undoSaved) { dragState._undoSaved = true; saveUndo(); }
                const data = dragState.data;
                if (data._type === 'compound-bar') {
                    // Snapshot originals on first drag call
                    if (!dragState._snapInit) {
                        dragState._snapInit = true;
                        dragState._snapSY = data.startYear;
                        dragState._snapSQ = data.startQ;
                        dragState._snapEY = data.endYear;
                        dragState._snapEQ = data.endQ;
                        dragState._snapAY = data.approvalYear;
                        dragState._snapAQ = data.approvalQ;
                        dragState._snapPointYOffset = data.pointYOffset || 0;
                    }
                    // Use snapshots for calculation
                    const origStartX = yearQuarterToX(dragState._snapSY, dragState._snapSQ, _layout.cfg.startYear, _layout.cfg.endYear, _layout.xStart, _layout.xEnd);
                    const origEndX = yearQuarterToX(dragState._snapEY, dragState._snapEQ, _layout.cfg.startYear, _layout.cfg.endYear, _layout.xStart, _layout.xEnd);
                    const newS = xToYearQuarter(origStartX + dx);
                    const newE = xToYearQuarter(origEndX + dx);
                    data.startYear = newS.year; data.startQ = newS.quarter;
                    data.endYear = newE.year; data.endQ = newE.quarter;
                    if (dragState._snapAY) {
                        const origAX = yearQuarterToX(dragState._snapAY, dragState._snapAQ, _layout.cfg.startYear, _layout.cfg.endYear, _layout.xStart, _layout.xEnd);
                        const newA = xToYearQuarter(origAX + dx);
                        data.approvalYear = newA.year; data.approvalQ = newA.quarter;
                    }
                    // Point style: also drag vertically
                    if (data.barStyle === 'point') {
                        data.pointYOffset = dragState._snapPointYOffset + dy;
                    }
                    render();
                } else if (data._type === 'comment') {
                    if (!dragState._snapInit) {
                        dragState._snapInit = true;
                        dragState._snapX = data.x;
                        dragState._snapY = data.y;
                    }
                    data.x = dragState._snapX + dx;
                    data.y = dragState._snapY + dy;
                    render();
                }
            },
            onResizeDrag(id, edge, dx, dy, dragState) {
                const data = dragState.data;
                if (data._type === 'compound-bar') {
                    // Snapshot originals on first resize call
                    if (!dragState._snapInit) {
                        dragState._snapInit = true;
                        dragState._snapSY = data.startYear;
                        dragState._snapSQ = data.startQ;
                        dragState._snapEY = data.endYear;
                        dragState._snapEQ = data.endQ;
                    }
                    if (edge === 'left') {
                        const origX = yearQuarterToX(dragState._snapSY, dragState._snapSQ, _layout.cfg.startYear, _layout.cfg.endYear, _layout.xStart, _layout.xEnd);
                        const yq = xToYearQuarter(origX + dx);
                        data.startYear = yq.year; data.startQ = yq.quarter;
                    } else if (edge === 'right') {
                        const origX = yearQuarterToX(dragState._snapEY, dragState._snapEQ, _layout.cfg.startYear, _layout.cfg.endYear, _layout.xStart, _layout.xEnd);
                        const yq = xToYearQuarter(origX + dx);
                        data.endYear = yq.year; data.endQ = yq.quarter;
                    }
                    render();
                }
            },
            onClick(id, data, type) {
                if (data._type === 'compound-bar') showCompoundEditor(data);
                else if (data._type === 'comment') showCommentEditor(data, state.comments, render);
            },
            onHover(id, data) { render(); },
        });
    }

    function render() {
        const canvas = getCanvas();
        const cfg = getConfig();
        const totalQ = (cfg.endYear - cfg.startYear + 1) * 4;
        const qWidth = 30;
        const regionGap = 20;
        const compoundRowH = 55;

        let totalH = 0;
        state.regions.forEach((rgn, rIdx) => {
            const compounds = state.compounds.filter(c => c.regionIdx === rIdx);
            const ownRowCount = compounds.filter(c => c.barStyle !== 'point').length;
            const emptyRowCount = state.emptyRows.filter(r => r.regionIdx === rIdx).length;
            totalH += 35 + (ownRowCount + emptyRowCount) * compoundRowH + regionGap;
        });

        const logicalW = MARGIN.left + totalQ * qWidth + MARGIN.right;
        const logicalH = MARGIN.top + totalH + MARGIN.bottom;
        _canvasH = logicalH;

        // HiDPI setup
        const ctx = setupHiDPI(canvas, logicalW, logicalH);

        const xStart = MARGIN.left;
        const xEnd = MARGIN.left + totalQ * qWidth;
        _layout = { xStart, xEnd, cfg };

        if (!im) initInteraction();
        im.clearHitAreas();

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, logicalW, logicalH);

        // Main Title
        const centerX = (xStart + xEnd) / 2;
        drawMainTitle(ctx, cfg.title, centerX, 35);

        // Chevron timeline header
        const headerY = MARGIN.top - 30;
        const headerH = 28;
        const yearW = 4 * qWidth;
        for (let y = cfg.startYear; y <= cfg.endYear; y++) {
            const x1 = xStart + (y - cfg.startYear) * yearW;
            const chevronTip = 12;
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.moveTo(x1, headerY);
            ctx.lineTo(x1 + yearW - chevronTip, headerY);
            ctx.lineTo(x1 + yearW, headerY + headerH / 2);
            ctx.lineTo(x1 + yearW - chevronTip, headerY + headerH);
            ctx.lineTo(x1, headerY + headerH);
            if (y > cfg.startYear) ctx.lineTo(x1 + chevronTip, headerY + headerH / 2);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Segoe UI'; ctx.textAlign = 'center';
            ctx.fillText(y.toString(), x1 + yearW / 2, headerY + 19);
        }

        // Grid
        for (let i = 0; i <= totalQ; i++) {
            const x = xStart + i * qWidth;
            ctx.strokeStyle = i % 4 === 0 ? '#bbb' : '#e8e8e8'; ctx.lineWidth = i % 4 === 0 ? 1 : 0.5;
            ctx.beginPath(); ctx.moveTo(x, MARGIN.top); ctx.lineTo(x, logicalH - MARGIN.bottom); ctx.stroke();
        }

        // Regions + compounds
        let currentY = MARGIN.top + 10;
        state.regions.forEach((rgn, rIdx) => {
            const regionStartY = currentY;
            const compounds = state.compounds.filter(c => c.regionIdx === rIdx);
            const ownRowCompounds = compounds.filter(c => c.barStyle !== 'point');
            const regionEmptyRows = state.emptyRows.filter(r => r.regionIdx === rIdx);
            const regionH = 35 + (ownRowCompounds.length + regionEmptyRows.length) * compoundRowH;

            ctx.fillStyle = rgn.color + '15';
            ctx.fillRect(0, regionStartY, logicalW, regionH);
            // Region label: colored text, centered in left margin area
            const rgnFontSize = rgn.fontSize || 14;
            const rgnFontStyle = rgn.fontStyle || 'bold';
            ctx.font = `${rgnFontStyle} ${rgnFontSize}px Segoe UI`;
            ctx.fillStyle = rgn.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rgn.label, MARGIN.left / 2, regionStartY + regionH / 2);
            ctx.textBaseline = 'alphabetic';

            if (rIdx > 0) {
                ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.setLineDash([5, 3]);
                ctx.beginPath(); ctx.moveTo(0, regionStartY); ctx.lineTo(logicalW, regionStartY); ctx.stroke();
                ctx.setLineDash([]);
            }

            let ownRowIdx = 0;
            compounds.forEach((comp, ci) => {
                const isPoint = comp.barStyle === 'point';
                // Point style: position using its stored Y offset from region top, freely draggable
                let rowY;
                if (isPoint) {
                    rowY = regionStartY + 35 + (comp.pointYOffset || 0);
                } else {
                    rowY = regionStartY + 35 + ownRowIdx * compoundRowH;
                    ownRowIdx++;
                }
                const x1 = yearQuarterToX(comp.startYear, comp.startQ, cfg.startYear, cfg.endYear, xStart, xEnd);
                const x2 = yearQuarterToX(comp.endYear, comp.endQ, cfg.startYear, cfg.endYear, xStart, xEnd);
                const barY = rowY + 10, barH = 18;

                if (isPoint) {
                    // Point style: draw shaped marker, no bar
                    const pointX = x1;
                    const pointY = barY + barH / 2;
                    const pointR = comp.pointSize || 7;
                    const shape = comp.pointShape || 'circle';
                    const filled = comp.pointFilled !== false;
                    const fillColor = comp.pointColor || comp.color;
                    const borderColor = comp.pointBorderColor || '#333';
                    const borderW = comp.pointBorderWidth != null ? comp.pointBorderWidth : 1.5;

                    ctx.globalAlpha = 0.85;
                    ctx.beginPath();
                    if (shape === 'circle') {
                        ctx.arc(pointX, pointY, pointR, 0, Math.PI * 2);
                    } else if (shape === 'diamond') {
                        ctx.moveTo(pointX, pointY - pointR);
                        ctx.lineTo(pointX + pointR, pointY);
                        ctx.lineTo(pointX, pointY + pointR);
                        ctx.lineTo(pointX - pointR, pointY);
                        ctx.closePath();
                    } else if (shape === 'triangle') {
                        ctx.moveTo(pointX, pointY - pointR);
                        ctx.lineTo(pointX + pointR, pointY + pointR * 0.7);
                        ctx.lineTo(pointX - pointR, pointY + pointR * 0.7);
                        ctx.closePath();
                    } else if (shape === 'square') {
                        ctx.rect(pointX - pointR, pointY - pointR, pointR * 2, pointR * 2);
                    } else if (shape === 'star') {
                        for (let si = 0; si < 5; si++) {
                            const outerA = -Math.PI / 2 + (si * 2 * Math.PI / 5);
                            const innerA = outerA + Math.PI / 5;
                            ctx.lineTo(pointX + Math.cos(outerA) * pointR, pointY + Math.sin(outerA) * pointR);
                            ctx.lineTo(pointX + Math.cos(innerA) * pointR * 0.45, pointY + Math.sin(innerA) * pointR * 0.45);
                        }
                        ctx.closePath();
                    }
                    if (filled) {
                        ctx.fillStyle = fillColor;
                        ctx.fill();
                    }
                    if (borderW > 0) {
                        ctx.strokeStyle = borderColor;
                        ctx.lineWidth = borderW;
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1;

                    // Label to the right of the point
                    ctx.fillStyle = '#333'; ctx.textAlign = 'left';
                    const labelLines = (comp.approvalLabel || comp.name).split('\n');
                    labelLines.forEach((line, li) => {
                        ctx.font = li === 0 ? 'bold 10px Segoe UI' : '9px Segoe UI';
                        ctx.fillStyle = li === 0 ? '#333' : '#666';
                        ctx.fillText(line, pointX + pointR + 6, barY + 8 + li * 12);
                    });

                    // Hit area: small square around the point
                    const hitSize = pointR * 3;
                    im.addHitArea(comp.id, 'compound-bar', pointX - hitSize / 2, pointY - hitSize / 2, hitSize, hitSize,
                        Object.assign(comp, { _type: 'compound-bar', x: pointX, y: barY }),
                        { cursor: 'grab', resizable: false });
                } else {
                    // Arrow or Bar style
                    ctx.fillStyle = comp.color; ctx.globalAlpha = 0.7;
                    if (comp.barStyle === 'arrow') {
                        const ah = 12;
                        ctx.beginPath();
                        ctx.moveTo(x1, barY); ctx.lineTo(x2 - ah, barY); ctx.lineTo(x2, barY + barH / 2);
                        ctx.lineTo(x2 - ah, barY + barH); ctx.lineTo(x1, barY + barH);
                        ctx.closePath(); ctx.fill();
                    } else {
                        ctx.fillRect(x1, barY, x2 - x1, barH);
                    }
                    ctx.globalAlpha = 1;

                    // Red approval dot at right end of bar (just before arrowhead)
                    if (comp.approvalYear) {
                        const dotX = x2 - 15;
                        drawCircle(ctx, dotX, barY + barH / 2, 5, '#c0392b', true);
                    }

                    // Labels to the right of the arrow
                    ctx.fillStyle = '#333'; ctx.textAlign = 'left';
                    const labelLines = (comp.approvalLabel || comp.name).split('\n');
                    labelLines.forEach((line, li) => {
                        ctx.font = li === 0 ? 'bold 10px Segoe UI' : '9px Segoe UI';
                        ctx.fillStyle = li === 0 ? '#333' : '#666';
                        ctx.fillText(line, x2 + 8, barY + 8 + li * 12);
                    });

                    im.addHitArea(comp.id, 'compound-bar', x1, barY, x2 - x1, barH,
                        Object.assign(comp, { _type: 'compound-bar', x: (x1 + x2) / 2, y: barY }),
                        { cursor: 'grab', resizable: true, resizeEdges: ['left', 'right'] });
                }

                // Logo - fixed size per row, positioned at xEnd + 30
                // Fixed dimensions: 120px wide, 40px tall max to fit within compoundRowH (55px)
                const logoFixedW = 120, logoFixedH = 40;
                const logoX = xEnd + 30;
                const logoY = rowY + (compoundRowH - logoFixedH) / 2;
                if (comp.logo) {
                    loadLogo(comp.logo).then(img => {
                        if (img) {
                            const tempCtx = getCtx();
                            tempCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
                            const aspect = img.width / img.height;
                            let drawW, drawH;
                            if (aspect > logoFixedW / logoFixedH) {
                                drawW = logoFixedW;
                                drawH = logoFixedW / aspect;
                            } else {
                                drawH = logoFixedH;
                                drawW = logoFixedH * aspect;
                            }
                            const drawX = logoX + (logoFixedW - drawW) / 2;
                            const drawY = logoY + (logoFixedH - drawH) / 2;
                            tempCtx.drawImage(img, drawX, drawY, drawW, drawH);
                        }
                    });
                } else if (comp.uploadedLogoDataURI) {
                    const uImg = new Image();
                    uImg.onload = () => {
                        const tempCtx = getCtx();
                        tempCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
                        const aspect = uImg.width / uImg.height;
                        let drawW, drawH;
                        if (aspect > logoFixedW / logoFixedH) {
                            drawW = logoFixedW;
                            drawH = logoFixedW / aspect;
                        } else {
                            drawH = logoFixedH;
                            drawW = logoFixedH * aspect;
                        }
                        const drawX = logoX + (logoFixedW - drawW) / 2;
                        const drawY = logoY + (logoFixedH - drawH) / 2;
                        tempCtx.drawImage(uImg, drawX, drawY, drawW, drawH);
                    };
                    uImg.src = comp.uploadedLogoDataURI;
                } else if (comp.customCompanyName) {
                    ctx.fillStyle = '#555';
                    ctx.font = 'bold 11px Segoe UI';
                    ctx.textAlign = 'left';
                    ctx.fillText(comp.customCompanyName, logoX, logoY + logoFixedH / 2 + 4);
                }
            });

            // Draw empty rows (for placing points)
            regionEmptyRows.forEach((er, ei) => {
                const rowY = regionStartY + 35 + (ownRowIdx + ei) * compoundRowH;
                const midY = rowY + compoundRowH / 2;
                if (er.label) {
                    ctx.fillStyle = '#bbb'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
                    ctx.fillText(er.label, xStart + 6, midY - 4);
                }
            });

            currentY += regionH + regionGap;
        });

        im.drawHoverHighlight(ctx);

        // Comments
        drawComments(ctx, state.comments, im);

        // Legend
        const legendY = logicalH - MARGIN.bottom + 15;
        ctx.textAlign = 'left'; let lx = MARGIN.left;
        state.legendItems.forEach(li => {
            if (li.symbol === 'circle') drawCircle(ctx, lx + 6, legendY, 5, li.color, li.filled);
            else drawArrow(ctx, lx, legendY, lx + 20, legendY, li.color, 3);
            ctx.fillStyle = '#333'; ctx.font = '11px Segoe UI';
            ctx.fillText(li.label, lx + (li.symbol === 'circle' ? 16 : 25), legendY + 4);
            lx += ctx.measureText(li.label).width + 60;
        });

        renderEditPanel();
    }

    function renderEditPanel() {
        const panel = document.getElementById('indication-edit-panel');
        let html = '<p style="font-size:11px;color:#2196F3;margin-bottom:8px;">Drag bars to move. Drag edges to resize. Click to edit.</p>';

        html += '<div class="item-group-header">Regions</div>';
        state.regions.forEach((r, i) => {
            html += `<div class="edit-item"><input type="text" value="${r.label}" style="width:60px" onchange="Indication.updateRegion(${i},'label',this.value)">
                <input type="color" value="${r.color}" onchange="Indication.updateRegion(${i},'color',this.value)">
                <label style="font-size:10px">Size:</label><input type="number" value="${r.fontSize || 14}" min="8" max="36" style="width:45px" onchange="Indication.updateRegion(${i},'fontSize',+this.value)">
                <select style="width:70px;font-size:10px" onchange="Indication.updateRegion(${i},'fontStyle',this.value)">
                    <option value="bold" ${(r.fontStyle || 'bold') === 'bold' ? 'selected' : ''}>Bold</option>
                    <option value="normal" ${r.fontStyle === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="italic" ${r.fontStyle === 'italic' ? 'selected' : ''}>Italic</option>
                    <option value="italic bold" ${r.fontStyle === 'italic bold' ? 'selected' : ''}>Bold Italic</option>
                </select>
                <button class="btn btn-xs btn-danger" onclick="Indication.removeRegion(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Compounds (${state.compounds.length})</div>`;
        state.compounds.forEach((c, i) => {
            html += `<div class="edit-item">
                <span style="display:inline-block;width:14px;height:14px;background:${c.color};border-radius:2px;vertical-align:middle;"></span>
                <b style="font-size:11px">${c.name}</b>
                <span style="color:#888;font-size:10px">[${state.regions[c.regionIdx]?.label || '?'}]</span>
                <button class="btn btn-xs btn-danger" onclick="Indication.removeCompound(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Empty Rows (${state.emptyRows.length})</div>`;
        state.emptyRows.forEach((er, i) => {
            let rgnSelect = `<select style="width:70px;font-size:10px" onchange="Indication.updateEmptyRow(${i},'regionIdx',+this.value)">`;
            state.regions.forEach((r, ri) => {
                rgnSelect += `<option value="${ri}" ${er.regionIdx === ri ? 'selected' : ''}>${r.label}</option>`;
            });
            rgnSelect += '</select>';
            html += `<div class="edit-item">
                <input type="text" value="${er.label || ''}" style="width:80px;font-size:10px" placeholder="Row label" onchange="Indication.updateEmptyRow(${i},'label',this.value)">
                ${rgnSelect}
                <button class="btn btn-xs btn-danger" onclick="Indication.removeEmptyRow(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Comments (${state.comments.length})</div>`;
        state.comments.forEach((c, i) => {
            html += `<div class="edit-item">
                <span style="font-size:10px;color:#666">${c.text.split('\n')[0].substring(0, 30)}</span>
                <button class="btn btn-xs btn-danger" onclick="Indication.removeComment(${i})">x</button></div>`;
        });

        html += `<div class="item-group-header">Legends (${state.legendItems.length})</div>`;
        state.legendItems.forEach((li, i) => {
            html += `<div class="edit-item">
                <select style="width:65px;font-size:10px" onchange="Indication.updateLegend(${i},'symbol',this.value)">
                    <option value="circle" ${li.symbol === 'circle' ? 'selected' : ''}>Circle</option>
                    <option value="arrow" ${li.symbol === 'arrow' ? 'selected' : ''}>Arrow</option>
                </select>
                <input type="color" value="${li.color}" onchange="Indication.updateLegend(${i},'color',this.value)">
                <input type="text" value="${li.label}" style="width:180px;font-size:10px" onchange="Indication.updateLegend(${i},'label',this.value)">
                <button class="btn btn-xs btn-danger" onclick="Indication.removeLegend(${i})">x</button></div>`;
        });

        panel.innerHTML = html;
    }

    function showRegionPicker(event, action) {
        // Remove any existing picker
        const old = document.querySelector('.region-picker');
        if (old) old.remove();

        const picker = document.createElement('div');
        picker.className = 'region-picker';
        state.regions.forEach((r, i) => {
            const item = document.createElement('div');
            item.className = 'rp-item';
            item.textContent = r.label;
            item.style.borderLeft = `4px solid ${r.color}`;
            item.addEventListener('click', () => {
                picker.remove();
                if (action === 'compound') addCompound(i);
                else if (action === 'emptyRow') addEmptyRow(i);
            });
            picker.appendChild(item);
        });

        document.body.appendChild(picker);
        // Position near the button
        const btn = event.currentTarget;
        const rect = btn.getBoundingClientRect();
        picker.style.left = rect.left + 'px';
        picker.style.top = (rect.bottom + 4) + 'px';

        // Close on outside click
        const onOutside = (e) => {
            if (!picker.contains(e.target) && e.target !== btn) {
                picker.remove();
                document.removeEventListener('mousedown', onOutside);
            }
        };
        setTimeout(() => document.addEventListener('mousedown', onOutside), 0);
    }

    function addRegion() { saveUndo(); state.regions.push({ id: uid(), label: 'New Region', color: '#2980b9', fontSize: 14, fontStyle: 'bold' }); render(); }
    function removeRegion(i) { saveUndo(); state.regions.splice(i, 1); render(); }
    function updateRegion(i, k, v) { saveUndo(); state.regions[i][k] = v; render(); }
    function addCompound(regionIdx) { saveUndo(); state.compounds.push({ id: uid(), name: 'New Compound', regionIdx: regionIdx != null ? regionIdx : 0, startYear: 2026, startQ: 1, endYear: 2030, endQ: 4, color: '#d4a0a0', barStyle: 'arrow', approvalYear: 2028, approvalQ: 1, approvalLabel: 'New Compound', logo: '', description: '' }); render(); }
    function removeCompound(i) { saveUndo(); state.compounds.splice(i, 1); render(); }
    function addEmptyRow(regionIdx) { saveUndo(); state.emptyRows.push({ id: uid(), regionIdx: regionIdx != null ? regionIdx : 0, label: '' }); render(); }
    function removeEmptyRow(i) { saveUndo(); state.emptyRows.splice(i, 1); render(); }
    function updateEmptyRow(i, k, v) { saveUndo(); state.emptyRows[i][k] = v; render(); }
    function addComment() { saveUndo(); state.comments.push({ id: uid(), text: 'New comment', x: MARGIN.left + 50, y: _canvasH - MARGIN.bottom + 5, fontSize: 12, color: '#333333' }); render(); }
    function removeComment(i) { saveUndo(); state.comments.splice(i, 1); render(); }
    function updateLegend(i, k, v) { saveUndo(); state.legendItems[i][k] = v; render(); }
    function removeLegend(i) { saveUndo(); state.legendItems.splice(i, 1); render(); }
    function exportPNG() { exportCanvasAsPNG('indication-canvas', 'indication_landscape.png'); }

    return { render, undo, showRegionPicker, addRegion, removeRegion, updateRegion, addCompound, removeCompound, addEmptyRow, removeEmptyRow, updateEmptyRow, addComment, removeComment, updateLegend, removeLegend, exportPNG };
})();
