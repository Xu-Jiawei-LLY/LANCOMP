/* === App initialization and tab navigation === */
document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            target.classList.add('active');

            // Render the active tab
            switch (tab.dataset.tab) {
                case 'portfolio': Portfolio.render(); break;
                case 'competitor': Competitor.render(); break;
                case 'indication': Indication.render(); break;
                case 'regional': Regional.render(); break;
                case 'nilex': Nilex.render(); break;
            }
        });
    });

    // Initial render
    Portfolio.render();

    // Close modal on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            const activeBtn = document.querySelector('.tab-btn.active');
            if (!activeBtn) return;
            const page = { portfolio: Portfolio, competitor: Competitor, indication: Indication, regional: Regional, nilex: Nilex }[activeBtn.dataset.tab];
            if (page && page.undo) page.undo();
        }
    });
});
