// --- Supabase Client ---
const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- GLOBAL STATE ---
let ALL_TRANSACTIONS_DATA = [];

// --- UTILITY FUNCTIONS ---
const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('th-TH', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(num);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

// --- CORE DATA PROCESSING FUNCTIONS ---

// 1. ฟังก์ชันหลักในการดึงข้อมูลทั้งหมดจาก Supabase
async function fetchAllTransactions() {
    // CHANGE 1: เพิ่ม `bill_number` เข้าไปใน .select() เพื่อดึงข้อมูลเลขที่บิลมาด้วย
    const { data, error } = await supabase
        .from('med_transactions')
        .select('transaction_date, bill_number, drug_type, drug_value') // <--- แก้ไขที่นี่
        .order('transaction_date', { ascending: false });

    if (error) {
        console.error("Error fetching data:", error);
        alert("ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้: " + error.message);
        return [];
    }
    ALL_TRANSACTIONS_DATA = data; 
    return data;
}

// 2. ฟังก์ชันคำนวณ Key Metrics (ใช้ข้อมูลทั้งหมด)
function calculateKeyMetrics(data) {
    const totalValue = data.reduce((sum, row) => sum + parseFloat(row.drug_value), 0);
    const totalTransactions = data.length;
    const avgValue = totalTransactions > 0 ? totalValue / totalTransactions : 0;

    document.querySelector('#kpiTotalValue h2').textContent = formatNumber(totalValue) + ' บาท';
    document.querySelector('#kpiTotalTransactions h2').textContent = totalTransactions.toLocaleString('th-TH') + ' รายการ';
    document.querySelector('#kpiAvgValue h2').textContent = formatNumber(avgValue) + ' บาท';
}

// 3. ฟังก์ชันสร้างตัวเลือกปีใน Dropdown
function populateYearSelector(data) {
    const yearSelector = document.getElementById('yearSelector');
    if (!yearSelector) return;

    const fiscalYears = new Set();
    data.forEach(row => {
        const date = new Date(row.transaction_date);
        let year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (month >= 10) {
            year += 1;
        }
        fiscalYears.add(year);
    });

    yearSelector.innerHTML = '';
    const sortedYears = Array.from(fiscalYears).sort((a, b) => b - a);
    
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `ปีงบประมาณ ${year + 543}`; // ปรับข้อความให้ชัดเจนขึ้น
        yearSelector.appendChild(option);
    });
}

// 4.  ฟังก์ชันคำนวณยอดรายไตรมาส 
function calculateQuarterlyReport(data, selectedFiscalYear) {
    const quarters = { q1: 0, q2: 0, q3: 0, q4: 0 };
    
    const filteredData = data.filter(row => {
        const date = new Date(row.transaction_date);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (month >= 10 && year === selectedFiscalYear - 1) return true;
        if (month <= 9 && year === selectedFiscalYear) return true;
        return false;
    });

    filteredData.forEach(row => {
        const date = new Date(row.transaction_date);
        const month = date.getMonth() + 1;
        const value = parseFloat(row.drug_value);

        if (month >= 10 && month <= 12) { quarters.q1 += value; }
        else if (month >= 1 && month <= 3) { quarters.q2 += value; }
        else if (month >= 4 && month <= 6) { quarters.q3 += value; }
        else if (month >= 7 && month <= 9) { quarters.q4 += value; }
    });

    document.querySelector('#q1 h4').textContent = formatNumber(quarters.q1);
    document.querySelector('#q2 h4').textContent = formatNumber(quarters.q2);
    document.querySelector('#q3 h4').textContent = formatNumber(quarters.q3);
    document.querySelector('#q4 h4').textContent = formatNumber(quarters.q4);
}

// 5. ฟังก์ชันคำนวณและสร้างกราฟ
function renderDrugTypeChart(data) {
    const typeValues = data.reduce((acc, row) => {
        const type = row.drug_type;
        const value = parseFloat(row.drug_value);
        if (!acc[type]) { acc[type] = 0; }
        acc[type] += value;
        return acc;
    }, {});
    
    const labels = Object.keys(typeValues);
    const values = Object.values(typeValues);
    const ctx = document.getElementById('drugTypeChart').getContext('2d');

    if (window.drugChart instanceof Chart) { 
        window.drugChart.destroy(); 
    }

    // 1. ใช้ JavaScript เพื่อดึงค่าสีที่แท้จริงจาก CSS Variable
    const legendTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim();

    window.drugChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['rgba(69, 248, 248, 0.7)','rgba(255, 99, 132, 0.7)','rgba(255, 206, 86, 0.7)','rgba(75, 192, 192, 0.7)','rgba(153, 102, 255, 0.7)','rgba(255, 159, 64, 0.7)'],
                borderColor: ['rgba(69, 248, 248, 1)','rgba(255, 99, 132, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'],
                borderWidth: 1 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { 
                    position: 'right', 
                    labels: { 
                        // 2. ใช้ตัวแปรที่เก็บค่าสีจริงแทนการใช้ 'var(...)'
                        color: legendTextColor 
                    }
                }
            }
        }
    });
}

// 6. ฟังก์ชันแสดงตารางข้อมูลล่าสุด
function renderRecentTransactions(data) {
    const tableBody = document.getElementById('recentTransactionsBody');
    tableBody.innerHTML = '';
    const recentData = data.slice(0, 10);
    if (recentData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="loading-text-table" style="text-align:center;">ไม่พบข้อมูล</td></tr>';
        return;
    }
    recentData.forEach(row => {
        // ตอนนี้ row.bill_number จะมีค่าที่ถูกต้องแล้ว
        const tr = `<tr><td>${formatDate(row.transaction_date)}</td><td>${row.bill_number || 'ไม่ได้ระบุ'}</td><td>${row.drug_type}</td><td class="text-right">${formatNumber(row.drug_value)}</td></tr>`;
        tableBody.innerHTML += tr;
    });
}

// ADDED 2: ฟังก์ชันสำหรับ Export ข้อมูลเป็น CSV
function exportToCsv(data, filename) {
    if (data.length === 0) {
        alert("ไม่มีข้อมูลสำหรับ Export");
        return;
    }
    
    // สร้าง Header ของไฟล์ CSV
    const headers = ['วันที่ทำรายการ', 'เลขที่บิล', 'ประเภทยา', 'มูลค่ายา (บาท)'];
    const csvRows = [headers.join(',')];

    // สร้างแต่ละแถวของข้อมูล
    data.forEach(row => {
        const values = [
            formatDate(row.transaction_date),
            `"${row.bill_number || ''}"`, // ใส่ "" เพื่อป้องกันปัญหาถ้าเลขบิลมีลูกน้ำ
            `"${row.drug_type || ''}"`,
            row.drug_value
        ];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    
    // สร้าง Blob และ Trigger การดาวน์โหลด
    // สำคัญ: ต้องกำหนด charset=utf-8 เพื่อให้เปิดใน Excel แล้วอ่านภาษาไทยได้ถูกต้อง
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// --- INITIALIZATION ---
async function initializeDashboard() {
    document.getElementById('currentDate').textContent = new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' }).format(new Date());

    const allData = await fetchAllTransactions();
    
    if (allData.length > 0) {
        calculateKeyMetrics(allData);
        renderDrugTypeChart(allData);
        renderRecentTransactions(allData);
        populateYearSelector(allData);
        
        const initialYear = document.getElementById('yearSelector').value;
        if (initialYear) {
            calculateQuarterlyReport(allData, parseInt(initialYear));
        }

    } else {
        document.querySelectorAll('.kpi-text h2, .quarter-item h4').forEach(el => el.textContent = 'N/A');
        document.getElementById('recentTransactionsBody').innerHTML = '<tr><td colspan="4" class="loading-text-table" style="text-align:center;">ไม่พบข้อมูล</td></tr>';
        // อาจจะซ่อน chart หรือแสดงข้อความว่าไม่มีข้อมูล
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();

    // Event Listener สำหรับ Dropdown เลือกปี
    document.getElementById('yearSelector').addEventListener('change', (event) => {
        const selectedYear = parseInt(event.target.value);
        calculateQuarterlyReport(ALL_TRANSACTIONS_DATA, selectedYear);
    });

    // ADDED 3: Event Listener สำหรับปุ่ม Export CSV
    document.getElementById('exportCsvButton').addEventListener('click', () => {
        const today = new Date();
        const dateString = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        const filename = `report-med-value-${dateString}.csv`;
        
        // ใช้ข้อมูลทั้งหมดที่เก็บไว้ในตัวแปรส่วนกลางเพื่อ Export
        exportToCsv(ALL_TRANSACTIONS_DATA, filename);
    });
});