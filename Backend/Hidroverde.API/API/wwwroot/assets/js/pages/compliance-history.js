<<<<<<< HEAD
﻿// compliance-history.js - Full functionality for Compliance History page

// Helper functions
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

// Get filter parameters from inputs
function getFilterParams() {
    const params = {};

    const userId = document.getElementById('filterUserId')?.value;
    if (userId) params.userId = userId;

    const batchId = document.getElementById('filterBatchId')?.value;
    if (batchId) params.batchId = batchId;

    const dateFrom = document.getElementById('filterDateFrom')?.value;
    if (dateFrom) params.dateFrom = dateFrom;

    const dateTo = document.getElementById('filterDateTo')?.value;
    if (dateTo) params.dateTo = dateTo;

    return params;
}

// Load history data from API
async function loadHistory() {
    console.log('📚 loadHistory() called');

    const tbody = document.getElementById('historyTableBody');
    if (!tbody) {
        console.error('❌ historyTableBody not found');
        return;
    }

    tbody.innerHTML = '<tr><td colspan="7" class="muted">Cargando...</td></tr>';

    const params = getFilterParams();
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/history${queryString ? '?' + queryString : ''}`;

    console.log('🌐 Fetching from:', url);

    try {
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);

        if (response.status === 204) {
            console.log('ℹ️ No content');
            tbody.innerHTML = '<tr><td colspan="7" class="muted">No hay registros.</td></tr>';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Data received:', data);

        renderHistory(Array.isArray(data) ? data : []);
    } catch (err) {
        console.warn('⚠️ API failed, using mock data', err);

        // Mock data fallback
        const mockData = [
            {
                taskId: 1,
                taskDescription: "Preparación de insumos (semillas, sustrato, nutrientes)",
                responsible: "Fiorella",
                completedByUserId: 1,
                completedByUserName: "Fiorella",
                completedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
                evidenceFileName: "evidencia1.jpg",
                batchId: "BATCH-001"
            },
            {
                taskId: 2,
                taskDescription: "Plantación / trasplante en torres",
                responsible: "Asistente",
                completedByUserId: 2,
                completedByUserName: "Carlos",
                completedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                evidenceFileName: null,
                batchId: "BATCH-002"
            },
            {
                taskId: 3,
                taskDescription: "Revisión y programación del riego",
                responsible: "Diego",
                completedByUserId: 3,
                completedByUserName: "Diego",
                completedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                evidenceFileName: "reporte.pdf",
                batchId: "BATCH-001"
            },
            {
                taskId: 4,
                taskDescription: "Monitoreo de pH y EC",
                responsible: "Técnico",
                completedByUserId: 4,
                completedByUserName: "María",
                completedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                evidenceFileName: "mediciones.xlsx",
                batchId: "BATCH-003"
            },
            {
                taskId: 5,
                taskDescription: "Limpieza de filtros",
                responsible: "Operario",
                completedByUserId: 5,
                completedByUserName: "José",
                completedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
                evidenceFileName: "foto_filtros.jpg",
                batchId: "BATCH-002"
            }
        ];

        // Apply filters to mock data
        let filtered = mockData;
        const filters = getFilterParams();

        if (filters.userId) {
            filtered = filtered.filter(item => item.completedByUserId == filters.userId);
        }

        if (filters.batchId) {
            filtered = filtered.filter(item =>
                item.batchId?.toLowerCase().includes(filters.batchId.toLowerCase())
            );
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom).setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => new Date(item.completedAt) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo).setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => new Date(item.completedAt) <= toDate);
        }

        console.log('📊 Filtered mock data:', filtered);
        renderHistory(filtered);
    }
}

// Render history data in table
function renderHistory(records) {
    console.log('🎨 renderHistory() called with', records.length, 'records');

    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="muted">No hay registros.</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(record => {
        const evidenceLink = record.evidenceFileName
            ? `<a href="#" class="evidence-link" data-file="${escapeHtml(record.evidenceFileName)}">${escapeHtml(record.evidenceFileName)}</a>`
            : '—';

        return `
            <tr>
                <td>${escapeHtml(record.taskId)}</td>
                <td>${escapeHtml(record.taskDescription)}</td>
                <td>${escapeHtml(record.responsible || '—')}</td>
                <td>${escapeHtml(record.completedByUserName || record.completedByUserId || '—')}</td>
                <td>${escapeHtml(formatDate(record.completedAt))}</td>
                <td>${evidenceLink}</td>
                <td>${escapeHtml(record.batchId || '—')}</td>
            </tr>
        `;
    }).join('');

    // Add event listeners for evidence links
    document.querySelectorAll('.evidence-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const fileName = e.target.dataset.file;
            alert(`Ver evidencia: ${fileName}\n(Descarga no implementada en modo simulación)`);
        });
    });
}

// Export functions
function exportData(format) {
    console.log(`📤 Exporting as ${format}...`);

    const params = getFilterParams();
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/history/export/${format}${queryString ? '?' + queryString : ''}`;

    // For mock mode, create a simple CSV/Excel download
    if (format === 'csv') {
        // Get current table data
        const rows = [];
        const headers = ['TaskId', 'Descripción', 'Responsable', 'Completado por', 'Fecha', 'Evidencia', 'Lote'];
        rows.push(headers.join(','));

        document.querySelectorAll('#historyTableBody tr').forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length === 7) {
                const rowData = Array.from(cols).map(col => {
                    let text = col.textContent || '';
                    // Remove commas and wrap in quotes if needed
                    text = text.replace(/,/g, ';');
                    return `"${text}"`;
                });
                rows.push(rowData.join(','));
            }
        });

        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    } else {
        alert(`Exportar a ${format.toUpperCase()} (modo simulación)`);
    }
}

// Initialize the page
export function init() {
    console.log('🚀 Initializing Compliance History page...');

    const filterBtn = document.getElementById('applyFilters');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');

    if (filterBtn) {
        console.log('✅ Found filter button');
        filterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadHistory();
        });
    }

    if (exportCsvBtn) {
        console.log('✅ Found CSV export button');
        exportCsvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportData('csv');
        });
    }

    if (exportExcelBtn) {
        console.log('✅ Found Excel export button');
        exportExcelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportData('excel');
        });
    }

    // Add Enter key support for filter inputs
    const inputs = ['filterUserId', 'filterBatchId', 'filterDateFrom', 'filterDateTo'];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadHistory();
            }
        });
    });

    // Load initial data
    loadHistory();
}

// Auto-run if loaded directly (not through app.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
=======
﻿export function init() {
    console.log("Compliance page loaded");
    // The inline script in checklist.html already handles everything
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
}