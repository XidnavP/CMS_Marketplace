let movementData = [];
let categoryList = [];

async function initMovementPage() {

    console.log("Movement page loaded");

    populateYear();

    await populateCategory();

    const today = new Date();

    document.getElementById("movementYear").value =
        today.getFullYear();

    document.getElementById("movementMonth").value =
        today.getMonth() + 1;

    
    // await loadMovement();

}


/* YEAR DROPDOWN */
function populateYear() {

    const select =
        document.getElementById("movementYear");

    select.innerHTML = "";

    const currentYear =
        new Date().getFullYear();

    for (let y = currentYear; y >= currentYear - 5; y--) {

        const option =
            document.createElement("option");

        option.value = y;
        option.textContent = y;

        select.appendChild(option);

    }

}


/* LOAD MOVEMENT */
async function loadMovement() {

    const year =
        Number(document.getElementById("movementYear").value);

    const month =
        Number(document.getElementById("movementMonth").value);

    const { data, error } =
        await supabaseClient.rpc(
            "get_monthly_stock_movement_normalized",
            {
                p_year: year,
                p_month: month
            }
        );

    if (error) {

        alert(error.message);
        return;

    }

    console.log("RAW DATA:", data);

    movementData = data || [];

    // ✅ Apply category filter automatically
    filterAndRenderMovement();

}


/* PIVOT DATA */
function pivotMovement(data) {

    const result = {};

    data.forEach(row => {

        const itemId = String(row.item_id ?? row.item_name);
        const day = Number(row.day);

        if (!result[itemId]) {

            result[itemId] = {
                item_name: row.item_name,
                category: row.category,   // FIXED
                initial_stock: Number(row.initial_stock) || 0,
                ending_stock: Number(row.ending_stock) || 0,
                last_day: day,
                days: {}
            };

        }

        if (day >= result[itemId].last_day) {

            result[itemId].ending_stock =
                Number(row.ending_stock) || 0;

            result[itemId].last_day = day;

        }

        if (!result[itemId].days[day]) {

            result[itemId].days[day] = {
                restock: 0,
                refund: 0,
                sales: 0
            };

        }

        result[itemId].days[day].restock += Number(row.restock) || 0;
        result[itemId].days[day].refund += Number(row.refund) || 0;
        result[itemId].days[day].sales += Number(row.sales) || 0;

    });

    return Object.values(result);

}


/* RENDER TABLE */
function renderMovementTable(data) {

    renderHeader();

    const tbody =
        document.getElementById("movementSummaryBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const year =
        Number(document.getElementById("movementYear").value);

    const month =
        Number(document.getElementById("movementMonth").value);

    const daysInMonth =
        new Date(year, month, 0).getDate();


    data.forEach(item => {

        let row =
            `<tr>
                <td class="product-col" title="${item.item_name}">
                    ${item.item_name}
                </td>
                <td>${formatNumber(item.initial_stock)}</td>
            `;


        for (let d = 1; d <= daysInMonth; d++) {

            const day =
                item.days[d] ||
                { restock: 0, refund: 0, sales: 0 };

            row += `
                <td class="px-3">
                    ${formatNumber(day.restock)}
                </td>

                <td class="px-3">
                    ${formatNumber(day.refund)}
                </td>

                <td class="px-3">
                    ${formatNumber(day.sales)}
                </td>
            `;

        }


        row += `
            <td class="fw-bold">
                ${formatNumber(item.ending_stock)}
            </td>
        </tr>`;


        tbody.insertAdjacentHTML(
            "beforeend",
            row
        );

    });

}


/* HEADER */
function renderHeader() {

    const thead =
        document.getElementById("movementSummaryHeader");

    if (!thead) return;

    const year =
        Number(document.getElementById("movementYear").value);

    const month =
        Number(document.getElementById("movementMonth").value);

    const daysInMonth =
        new Date(year, month, 0).getDate();


    let row1 =
        `<tr>
            <th rowspan="2">Item</th>
            <th rowspan="2">Initial</th>
        `;

    let row2 = "";


    for (let d = 1; d <= daysInMonth; d++) {

        row1 +=
            `<th colspan="3" class="text-center">${d}</th>`;

        row2 += `
            <th class="text-success px-3">RST</th>
            <th class="text-warning px-3">RTN</th>
            <th class="text-danger px-3">SLS</th>
        `;

    }


    row1 +=
        `<th rowspan="2">Ending</th></tr>`;

    row2 =
        `<tr>${row2}</tr>`;


    thead.innerHTML =
        row1 + row2;

}


/* FORMAT NUMBER */
function formatNumber(num) {

    return Number(num || 0)
        .toLocaleString("id-ID");

}

function renderMovementDetailTable() {

    const tbody =
        document.getElementById("movementTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const year =
        Number(document.getElementById("movementYear").value);

    const month =
        Number(document.getElementById("movementMonth").value);

    const category =
        document.getElementById("movementCategory").value;

    let filtered = movementData;

    // filter category
    if (category) {

        filtered =
            filtered.filter(item =>
                item.category === category
            );

    }

    // ✅ REMOVE rows where ALL movements = 0
    filtered =
        filtered.filter(item =>
            item.restock !== 0 ||
            item.sales !== 0 ||
            item.refund !== 0
        );

    // ✅ SORT by date ASC, then item
    filtered.sort((a, b) => {

        if (a.day !== b.day)
            return a.day - b.day;

        return a.item_name.localeCompare(b.item_name);

    });


    // render rows
    filtered.forEach(row => {

        const date =
            `${year}-${String(month).padStart(2,"0")}-${String(row.day).padStart(2,"0")}`;

        const tr =
        `<tr>

            <td>${date}</td>

            <td>${row.item_name}</td>

            <td class="text-end text-success">
                ${formatNumber(row.restock)}
            </td>
            <td class="text-end text-warning">
                ${formatNumber(row.refund)}
            </td>
            <td class="text-end text-danger">
                ${formatNumber(row.sales)}
            </td>




        </tr>`;

        tbody.insertAdjacentHTML(
            "beforeend",
            tr
        );

    });

}

async function populateCategory() {

    const select =
        document.getElementById("movementCategory");

    if (!select) return;

    const { data, error } =
        await supabaseClient
            .schema("inventory")
            .from("stock")
            .select("category");

    if (error) {

        alert(error.message);
        return;

    }

    // get unique categories
    categoryList =
        [...new Set(
            (data || [])
            .map(d => d.category)
            .filter(Boolean)
        )]
        .sort();

    select.innerHTML =
        `<option value="">All Categories</option>`;

    categoryList.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        select.appendChild(option);

    });

}
// function onCategoryChange() {

//     filterAndRenderMovement();

// }
function filterAndRenderMovement() {

    const category =
        document.getElementById("movementCategory").value;

    let filtered = movementData;

    if (category) {

        filtered =
            movementData.filter(item =>
                item.category === category
            );

    }
    // 🔍 DEBUG LOGS
    // console.log("Total rows:", movementData.length);

    // console.log(
    //     "Unique items TOTAL:",
    //     new Set(movementData.map(r => r.item_id)).size
    // );

    // console.log(
    //     "Unique items AFTER FILTER:",
    //     new Set(filtered.map(r => r.item_id)).size
    // );
    
    const pivoted =
        pivotMovement(filtered);

    renderMovementTable(pivoted);
    renderMovementDetailTable();

}
function downloadMovementExcel() {

    const category =
        document.getElementById("movementCategory").value;

    let filtered = movementData;

    if (category) {
        filtered =
            movementData.filter(item =>
                item.category === category
            );
    }

    const pivoted =
        pivotMovement(filtered);

    if (!pivoted.length) {
        alert("No data to export");
        return;
    }

    const year =
        Number(document.getElementById("movementYear").value);

    const month =
        Number(document.getElementById("movementMonth").value);

    const daysInMonth =
        new Date(year, month, 0).getDate();

    /* =========================
       SHEET 1: SUMMARY TABLE
    ========================= */

    const summaryExport = [];

    pivoted.forEach(item => {

        const row = {
            Item: item.item_name,
            Initial: item.initial_stock
        };

        for (let d = 1; d <= daysInMonth; d++) {

            const day =
                item.days[d] ||
                { restock: 0, refund: 0, sales: 0 };

            row[`D${d} Restock`] = day.restock;
            row[`D${d} Refund`] = day.refund;
            row[`D${d} Sales`] = day.sales;

        }

        row["Ending"] = item.ending_stock;

        summaryExport.push(row);

    });


    /* =========================
       SHEET 2: DETAIL TABLE
    ========================= */

    const detailExport = [];

    pivoted.forEach(item => {

        let totalRestock = 0;
        let totalRefund = 0;
        let totalSales = 0;

        Object.values(item.days).forEach(day => {

            totalRestock += day.restock;
            totalRefund += day.refund;
            totalSales += day.sales;

        });

        detailExport.push({
            Item: item.item_name,
            Initial: item.initial_stock,
            Restock: totalRestock,
            Sales: totalSales,
            Refund: totalRefund,
            Ending: item.ending_stock
        });

    });


    /* =========================
       CREATE EXCEL
    ========================= */

    const workbook =
        XLSX.utils.book_new();

    const summarySheet =
        XLSX.utils.json_to_sheet(summaryExport);

    const detailSheet =
        XLSX.utils.json_to_sheet(detailExport);


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
    );

    XLSX.utils.book_append_sheet(
        workbook,
        detailSheet,
        "Detail"
    );


    XLSX.writeFile(
        workbook,
        `Movement_${year}_${month}.xlsx`
    );

}