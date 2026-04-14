/* === Shared Utilities === */

// ---- HiDPI / Resolution Scaling ----
const DPR = 2; // 2x resolution for all canvases

function setupHiDPI(canvas, logicalW, logicalH) {
    canvas.width = logicalW * DPR;
    canvas.height = logicalH * DPR;
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // reset + scale
    return ctx;
}

// ---- Modal system ----
let _modalSaveCallback = null;
let _modalDeleteCallback = null;

function openModal(title, bodyHtml, onSave, onDelete) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').style.display = 'flex';
    _modalSaveCallback = onSave;
    _modalDeleteCallback = onDelete;
    const delBtn = document.getElementById('modal-delete-btn');
    delBtn.style.display = onDelete ? 'inline-block' : 'none';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    _modalSaveCallback = null;
    _modalDeleteCallback = null;
}

function modalSave() {
    if (_modalSaveCallback) _modalSaveCallback();
    closeModal();
}

function modalDelete() {
    if (_modalDeleteCallback) _modalDeleteCallback();
    closeModal();
}

// ---- ID generator ----
let _idCounter = 0;
function uid() { return 'id_' + (++_idCounter) + '_' + Date.now().toString(36); }

// ---- Undo Manager ----
const UndoManager = (() => {
    const MAX_STACK = 50;
    const stacks = {};
    function pushState(pageKey, stateObj) {
        if (!stacks[pageKey]) stacks[pageKey] = [];
        const clone = JSON.parse(JSON.stringify(stateObj, (key, val) => key.startsWith('_') ? undefined : val));
        stacks[pageKey].push(clone);
        if (stacks[pageKey].length > MAX_STACK) stacks[pageKey].shift();
    }
    function undo(pageKey) {
        if (!stacks[pageKey] || stacks[pageKey].length === 0) return null;
        return stacks[pageKey].pop();
    }
    function canUndo(pageKey) { return stacks[pageKey] && stacks[pageKey].length > 0; }
    return { pushState, undo, canUndo };
})();

// ---- Logo file list (for dropdowns) ----
const LOGO_FILES = [
    '', 'Abbott_Laboratories.svg', 'AbbVie.svg', 'Alcon.svg', 'Alexion_Pharmaceuticals.svg',
    'Alkermes.svg', 'Allergan.svg', 'Almirall.svg', 'Amgen.svg', 'Astellas_Pharma.svg',
    'AstraZeneca.svg', 'Aurobindo_Pharma.svg', 'Baxter_International.svg', 'Bayer.svg',
    'Becton_Dickinson.svg', 'BeiGene.svg', 'Biocon.svg', 'Biogen.svg',
    'Biomarin_Pharmaceutical.svg', 'Boehringer_Ingelheim.svg', 'Bristol_Myers_Squibb.svg',
    'Buchang.png', 'Catalent.svg', 'Chia_Tai_Tianqing.jpg', 'Chiesi_Farmaceutici.svg',
    'Chugai_Pharmaceutical.svg', 'Cipla.svg', 'CSL.svg', 'CSPC_Pharmaceutical.png',
    'CStone.png', 'Daiichi_Sankyo.svg', 'Dompe.png', 'Dong_e_ejiao.png',
    'Dr.Reddys_Laboratories.svg', 'Eisai.svg', 'Eli_Lilly.svg', 'Endo_International.png',
    'Ferring_Pharmaceuticals.svg', 'Fosun_Pharma.svg', 'Fresenius_Kabi.svg',
    'GanLee.png', 'Gilead_Sciences.svg', 'GlaxoSmithKline.svg',
    'Glenmark_Pharmaceuticals.png', 'Gracell_Biotechnologies.svg', 'Grifols.svg',
    'Grunenthal.png', 'Hansoh.svg', 'Harbin_Pharmaceutical_Group.svg',
    'Hengrui_Medicine.png', 'Hikma_Pharmaceuticals.svg', 'Horizon_Therapeutics.svg',
    'Huadong_Medicine.svg', 'Huadong.png', 'Incyte.svg',
    'Innovent.png', 'Inventiva.png', 'Jazz_Pharmaceuticals.png', 'Johnson_n_Johnson.svg',
    'Jumpcan.png', 'Karuna_Therapeutics.svg', 'Kineta.png', 'Kyowa_Kirin.svg',
    'Lonza.svg', 'Lundbeck.svg', 'Lupin_Pharmaceuticals.svg', 'Madrigal.webp',
    'Mallinckrodt_Pharmaceuticals.png', 'Meda_Pharmaceuticals.svg', 'Menarini.svg',
    'Merck.svg', 'Mitsubishi_Tanabe_Pharma.svg', 'Moderna.svg', 'Mylan.svg',
    'Natco_Pharma.svg', 'Novartis.svg', 'Novo_Nordisk.svg', 'Ono_Pharmaceutical.svg',
    'Otsuka_Pharmaceutical.svg', 'Perrigo.svg', 'Pfizer.svg', 'Pharmaron.png',
    'Piramal_Enterprises.svg', 'Regeneron.svg', 'Richter_Gedeon.svg', 'Roche.svg',
    'Sanofi.svg', 'SciSparc.svg', 'Servier.svg', 'Shionogi.png', 'Simcere.png',
    'SinoMab_BioScience.png', 'Sinopharm.png', 'Stada_Arzneimittel.svg',
    'Strides_Pharma.svg', 'Sumitomo_Pharma.svg', 'Sun_Pharmaceutical.svg', 'Takeda.svg',
    'Teva_Pharmaceutical.svg', 'Torrent_Pharmaceuticals.svg', 'UCB.svg',
    'Vertex_Pharmaceuticals.svg', 'Wockhardt.png', 'WuXi_AppTec.svg',
    'WuXi_Biologics.svg', 'Yunnan_Baiyao.png', 'Zai_Lab.png', 'Zambon.jpg',
    'Zentiva.svg', 'Zhejiang_Hisun.png', 'Zimmer_Biomet.svg', 'Zydus_Cadila.svg',
    'Zymeworks.png',
];

// ---- Color palette ----
const COLORS = {
    red: '#c0392b', darkRed: '#8b1a1a', green: '#27ae60', darkGreen: '#1a7a42',
    blue: '#2980b9', lightBlue: '#5dade2', orange: '#e67e22', yellow: '#f1c40f',
    purple: '#8e44ad', pink: '#e91e8f', teal: '#1abc9c', gray: '#7f8c8d',
    darkGray: '#34495e', olive: '#6d7c2d', brown: '#8b4513', black: '#222222',
};
const COLOR_LIST = Object.values(COLORS);

// ---- Shape drawing ----
function drawTriangle(ctx, x, y, size, color, filled, direction) {
    ctx.beginPath();
    if ((direction || 'up') === 'up') {
        ctx.moveTo(x, y - size); ctx.lineTo(x - size, y + size * 0.6); ctx.lineTo(x + size, y + size * 0.6);
    } else {
        ctx.moveTo(x, y + size); ctx.lineTo(x - size, y - size * 0.6); ctx.lineTo(x + size, y - size * 0.6);
    }
    ctx.closePath();
    if (filled) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}

function drawDiamond(ctx, x, y, size, color, filled) {
    ctx.beginPath();
    ctx.moveTo(x, y - size); ctx.lineTo(x + size, y); ctx.lineTo(x, y + size); ctx.lineTo(x - size, y);
    ctx.closePath();
    if (filled) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}

function drawCircle(ctx, x, y, size, color, filled) {
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
    if (filled) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}

function drawSquare(ctx, x, y, size, color, filled) {
    if (filled) { ctx.fillStyle = color; ctx.fillRect(x - size, y - size, size * 2, size * 2); }
    else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(x - size, y - size, size * 2, size * 2); }
}

function drawStar(ctx, x, y, size, color, filled) {
    const spikes = 5, outerR = size, innerR = size * 0.45;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (Math.PI / 2 * 3) + (i * Math.PI / spikes);
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (filled) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}

function drawShape(ctx, shape, x, y, size, color, filled) {
    switch (shape) {
        case 'triangle': drawTriangle(ctx, x, y, size, color, filled, 'up'); break;
        case 'triangle-down': drawTriangle(ctx, x, y, size, color, filled, 'down'); break;
        case 'diamond': drawDiamond(ctx, x, y, size, color, filled); break;
        case 'circle': drawCircle(ctx, x, y, size, color, filled); break;
        case 'square': drawSquare(ctx, x, y, size, color, filled); break;
        case 'star': drawStar(ctx, x, y, size, color, filled); break;
        case 'dashed-diamond':
            ctx.setLineDash([3, 3]); drawDiamond(ctx, x, y, size, color, false); ctx.setLineDash([]); break;
        case 'dashed-circle':
            ctx.setLineDash([3, 3]); drawCircle(ctx, x, y, size, color, false); ctx.setLineDash([]); break;
        default: drawTriangle(ctx, x, y, size, color, filled, 'up');
    }
}

const SHAPES = ['triangle', 'triangle-down', 'diamond', 'circle', 'square', 'star', 'dashed-diamond', 'dashed-circle'];

function shapeSelectorHtml(selectedShape) {
    return SHAPES.map(s => `<option value="${s}" ${s === selectedShape ? 'selected' : ''}>${s}</option>`).join('');
}

// ---- Coordinate helpers ----
function yearQuarterToX(year, quarter, startYear, endYear, xStart, xEnd) {
    const totalQ = (endYear - startYear + 1) * 4;
    const q = (year - startYear) * 4 + (quarter - 1);
    return xStart + (q / totalQ) * (xEnd - xStart);
}

function dateToX(date, startDate, endDate, xStart, xEnd) {
    const s = startDate.getTime(), e = endDate.getTime(), d = date.getTime();
    return xStart + ((d - s) / (e - s)) * (xEnd - xStart);
}

// ---- Timeline header drawing ----
function drawTimelineHeader(ctx, startYear, endYear, xStart, xEnd, yTop, yBottom, opts) {
    const totalYears = endYear - startYear + 1;
    const totalQ = totalYears * 4;
    const qWidth = (xEnd - xStart) / totalQ;

    ctx.fillStyle = opts.headerBg || '#c0392b';
    ctx.fillRect(xStart, yTop, xEnd - xStart, 28);
    ctx.fillStyle = opts.headerColor || '#fff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.textAlign = 'center';
    for (let y = startYear; y <= endYear; y++) {
        const x1 = xStart + (y - startYear) * 4 * qWidth;
        ctx.fillText(y.toString(), x1 + 2 * qWidth, yTop + 19);
        if (y > startYear) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x1, yTop); ctx.lineTo(x1, yTop + 28); ctx.stroke();
        }
    }

    ctx.fillStyle = opts.subHeaderBg || '#f8f8f8';
    ctx.fillRect(xStart, yTop + 28, xEnd - xStart, 20);
    ctx.fillStyle = '#666'; ctx.font = '11px Segoe UI';
    for (let i = 0; i < totalQ; i++) {
        const x1 = xStart + i * qWidth;
        ctx.fillText((i % 4 + 1).toString(), x1 + qWidth / 2, yTop + 43);
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x1, yTop + 28); ctx.lineTo(x1, yBottom); ctx.stroke();
    }

    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
    for (let y = startYear; y <= endYear + 1; y++) {
        const x = xStart + (y - startYear) * 4 * qWidth;
        ctx.beginPath(); ctx.moveTo(x, yTop + 48); ctx.lineTo(x, yBottom); ctx.stroke();
    }

    return yTop + 48;
}

// ---- Text helpers ----
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '', lines = [];
    for (const w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > maxWidth && line !== '') {
            lines.push(line.trim()); line = w + ' ';
        } else { line = test; }
    }
    lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return lines.length;
}

function truncText(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + '...').width > maxW) text = text.slice(0, -1);
    return text + '...';
}

// ---- Arrow / line drawing ----
function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth) {
    const headLen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
}

function drawDashedLine(ctx, x1, y1, x2, y2, color, lineWidth) {
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
}

function drawDashedArrow(ctx, x1, y1, x2, y2, color, lineWidth) {
    const headLen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
}

// ---- Logo loading ----
const _logoCache = {};
function loadLogo(name) {
    if (_logoCache[name]) return Promise.resolve(_logoCache[name]);
    return new Promise((resolve) => {
        const basePath = 'logo/pharma_logos_top100/';
        const img = new Image();
        img.onload = () => { _logoCache[name] = img; resolve(img); };
        img.onerror = () => {
            // Try alternate extensions: svg, png, jpg, webp
            const base = name.replace(/\.\w+$/, '');
            const exts = ['svg', 'png', 'jpg', 'webp'].filter(e => !name.endsWith('.' + e));
            let idx = 0;
            function tryNext() {
                if (idx >= exts.length) { resolve(null); return; }
                const alt = new Image();
                alt.onload = () => { _logoCache[name] = alt; resolve(alt); };
                alt.onerror = () => { idx++; tryNext(); };
                alt.src = basePath + base + '.' + exts[idx];
            }
            tryNext();
        };
        img.src = basePath + name;
    });
}

// ---- Export ----
function exportCanvasAsPNG(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    const link = document.createElement('a');
    link.download = filename || 'landscape.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ---- Shared Comment system ----
// Each page stores comments: [{id, text, x, y, fontSize, color}]
function drawComments(ctx, comments, im) {
    ctx.textAlign = 'left';
    comments.forEach(c => {
        ctx.fillStyle = c.color || '#333';
        ctx.font = `${c.fontSize || 12}px Segoe UI`;
        const lines = c.text.split('\n');
        lines.forEach((line, li) => ctx.fillText(line, c.x, c.y + li * (c.fontSize || 12) * 1.3));

        if (im) {
            const maxW = Math.max(60, ...lines.map(l => ctx.measureText(l).width));
            const h = lines.length * (c.fontSize || 12) * 1.3 + 4;
            im.addHitArea(c.id, 'comment', c.x - 2, c.y - (c.fontSize || 12), maxW + 4, h,
                Object.assign(c, { _type: 'comment' }),
                { cursor: 'move' });
        }
    });
}

function showCommentEditor(comment, comments, renderFn) {
    const idx = comments.indexOf(comment);
    openModal('Edit Comment', buildEditFormHtml([
        { label: 'Text (\\n for newline)', id: 'ed-cmt-text', type: 'textarea', value: comment.text.replace(/\n/g, '\\n') },
        { label: 'Color', id: 'ed-cmt-color', type: 'color', value: comment.color || '#333333' },
        { label: 'Font Size', id: 'ed-cmt-fs', type: 'number', value: comment.fontSize || 12, min: 8, max: 36 },
    ]), () => {
        comment.text = document.getElementById('ed-cmt-text').value.replace(/\\n/g, '\n');
        comment.color = document.getElementById('ed-cmt-color').value;
        comment.fontSize = +document.getElementById('ed-cmt-fs').value;
        renderFn();
    }, () => { comments.splice(idx, 1); renderFn(); });
}

// ---- Main Title drawing ----
function drawMainTitle(ctx, title, centerX, y) {
    if (!title) return;
    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, y);
}
