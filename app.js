// State variables for shopping items
let items = [];

// Active Receipt Type: 'belanja' or 'spbu'
let activeType = 'belanja';

// Default values to restore
const defaults = {
    storeName: "FOTO COPY SAFA",
    storeAddress: "Melayani dengan sepenuh hati\nJl. Salak Tanggul",
    storePhone: "085331239918",
    cashier: "KASIR",
    receiptNo: "JL0000182083",
    datetime: "2026-06-18T09:02:12",
    discount: 0,
    cashPaid: 364000,
    printWidth: "72mm",
    footerMsg: "Terima kasih atas kunjungannya",
    
    // Layout & Separator defaults
    alignHeader: 'center',
    sepHeader: '-',
    alignCustomer: 'left',
    sepCustomer: '-',
    alignItems: 'left',
    sepItems: '-',
    alignTotals: 'left',
    sepTotals: '-',
    alignFooter: 'left',
    
    // Custom field labels
    labelReceipt: 'No.',
    paymentType: 'Tunai',
    cashierPrefix: 'Op.',
    labelCust: '',
    labelAddress: '',
    labelPhone: '',
    
    // SPBU Defaults based on the target photo
    spbuCode: "5468108",
    spbuName: "SPBU PANGLIMA SUDIRMAN149",
    spbuAddress: "JL. PANGLIMA SUDIRMAN NO.149",
    spbuShift: "2",
    spbuTrans: "2346417",
    spbuPump: "14",
    spbuGrade: "PERTAMAX_TURBO",
    spbuPrice: 20750,
    spbuVolume: 2.31,
    spbuOperator: "BAMBANG F",
    spbuCash: 200000,
    defaultItems: [
        { name: "STOP MAP", qty: 1, price: 26000, unit: "PACK" },
        { name: "MAP TAS KANCING 2 JUMBO", qty: 2, price: 20000, unit: "PCS" },
        { name: "AMPLOP 104 PPL", qty: 1, price: 15000, unit: "PACK" },
        { name: "STICKY NOTE 7651 TUMPUK", qty: 1, price: 6500, unit: "PCS" },
        { name: "LEM STICK GREBEL 21GRM", qty: 3, price: 7000, unit: "PCS" },
        { name: "SPIDOL WB HITAM", qty: 3, price: 8500, unit: "PCS" },
        { name: "PEN FASTER", qty: 1, price: 25000, unit: "PACK" },
        { name: "HVS SIDU A4 70GSM", qty: 1, price: 45000, unit: "REM" },
        { name: "HVS SIDU F4 70GSM", qty: 1, price: 50000, unit: "REM" },
        { name: "MATERAI TEMPEL 10000", qty: 10, price: 11000, unit: "PCS" }
    ]
};

// Helper function to format currency as thousands separated by dot
function formatRibuan(val) {
    if (isNaN(val)) return "0";
    return Math.round(val).toLocaleString('id-ID');
}

// Helper to pad key labels to a fixed width for perfect monospaced alignment
function padKey(str, length) {
    if (str.length >= length) return str;
    return str + ' '.repeat(length - str.length);
}

// Switch receipt layout between Belanja and SPBU
function switchReceiptType(type) {
    activeType = type;
    
    // Toggle active tabs
    document.getElementById('tab-belanja').classList.toggle('active', type === 'belanja');
    document.getElementById('tab-spbu').classList.toggle('active', type === 'spbu');
    
    // Toggle form containers
    document.getElementById('form-container-belanja').style.display = type === 'belanja' ? 'block' : 'none';
    document.getElementById('form-container-spbu').style.display = type === 'spbu' ? 'block' : 'none';
    
    // Toggle preview layouts
    document.getElementById('preview-layout-belanja').style.display = type === 'belanja' ? 'block' : 'none';
    document.getElementById('preview-layout-spbu').style.display = type === 'spbu' ? 'block' : 'none';
    
    // Show/Hide logo type selector since SPBU uses a dedicated logo
    const logoTypeGroup = document.getElementById('input-logo-type').closest('.form-group');
    const logoFileContainer = document.getElementById('logo-file-container');
    
    if (type === 'spbu') {
        logoTypeGroup.style.display = 'none';
        logoFileContainer.style.display = 'none';
        updateSpbuPreview();
    } else {
        logoTypeGroup.style.display = 'block';
        toggleLogoType();
        updatePreview();
    }
}

// File/Image upload handler for Belanja
function handleLogoUpload(input) {
    const file = input.files[0];
    const nameDisplay = document.getElementById('file-name-display');
    if (file) {
        nameDisplay.innerText = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoImg = document.getElementById('receipt-logo');
            logoImg.src = e.target.result;
            logoImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        nameDisplay.innerText = 'Belum ada file dipilih';
    }
}

// Toggle logo display type for Belanja (Teks vs Gambar)
function toggleLogoType() {
    if (activeType === 'spbu') return;
    
    const type = document.getElementById('input-logo-type').value;
    const fileContainer = document.getElementById('logo-file-container');
    const prevLogoImg = document.getElementById('prev-logo-img');
    const prevLogoText = document.getElementById('prev-logo-text');
    
    if (type === 'image') {
        fileContainer.style.display = 'block';
        prevLogoImg.style.display = 'block';
        prevLogoText.style.display = 'none';
    } else {
        fileContainer.style.display = 'none';
        prevLogoImg.style.display = 'none';
        prevLogoText.style.display = 'block';
    }
}

// Adjust font weight, size and width properties based on settings
function adjustFontSettings() {
    const weightOption = document.getElementById('input-font-weight').value;
    const sizeOption = document.getElementById('input-font-size').value;
    const widthOption = document.getElementById('input-print-width').value;
    const fontOption = document.getElementById('input-font-family').value;
    
    // Set dynamic properties on document
    document.documentElement.style.setProperty('--receipt-font-size', sizeOption);
    document.documentElement.style.setProperty('--receipt-print-width', widthOption);
    
    let fontFamily = "'JetBrains Mono', 'Courier New', Courier, monospace";
    if (fontOption === 'serif') {
        fontFamily = "'Times New Roman', Times, Georgia, serif";
    } else if (fontOption === 'sans') {
        fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
    }
    document.documentElement.style.setProperty('--receipt-font-family', fontFamily);
    
    if (weightOption === 'normal') {
        document.documentElement.style.setProperty('--receipt-weight-normal', '400');
        document.documentElement.style.setProperty('--receipt-weight-medium', '500');
        document.documentElement.style.setProperty('--receipt-weight-bold', '700');
    } else if (weightOption === 'bold') {
        document.documentElement.style.setProperty('--receipt-weight-normal', '500');
        document.documentElement.style.setProperty('--receipt-weight-medium', '600');
        document.documentElement.style.setProperty('--receipt-weight-bold', '800');
    } else if (weightOption === 'extra-bold') {
        document.documentElement.style.setProperty('--receipt-weight-normal', '600');
        document.documentElement.style.setProperty('--receipt-weight-medium', '700');
        document.documentElement.style.setProperty('--receipt-weight-bold', '900');
    }
}

// ==========================================
// TYPE 1: STRUK BELANJA LOGIC
// ==========================================
function updateItemName(index, val) {
    items[index].name = val;
    updatePreview();
}

function updateItemQty(index, val) {
    items[index].qty = parseFloat(val) || 0;
    updatePreview();
}

function updateItemUnit(index, val) {
    items[index].unit = val;
    updatePreview();
}

function updateItemPrice(index, val) {
    items[index].price = parseFloat(val) || 0;
    updatePreview();
}

function addItem() {
    items.push({ name: '', qty: 1, price: 0, unit: 'PCS' });
    renderEditorItems();
    updatePreview();
}

function removeItem(index) {
    items.splice(index, 1);
    renderEditorItems();
    updatePreview();
}

function renderEditorItems() {
    const container = document.getElementById('editor-items-list');
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'item-edit-row';
        row.innerHTML = `
            <input type="text" class="item-name-input" value="${item.name}" placeholder="Nama Barang" oninput="updateItemName(${index}, this.value)">
            <div class="item-edit-row-bottom">
                <input type="number" class="item-qty-input" value="${item.qty}" min="0" step="any" placeholder="Qty" oninput="updateItemQty(${index}, this.value)">
                <input type="text" class="item-unit-input" value="${item.unit || 'PCS'}" placeholder="Satuan" style="width: 55px; text-align: center;" oninput="updateItemUnit(${index}, this.value)">
                <input type="number" class="item-price-input" value="${item.price}" min="0" placeholder="Harga" oninput="updateItemPrice(${index}, this.value)">
                <button class="btn-delete" onclick="removeItem(${index})" title="Hapus Barang">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function makeDividerText(char) {
    if (!char) return '';
    return char.repeat(48);
}

function applyLayoutSettings(sectionId, alignVal) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const alignMap = { left: 'left', center: 'center', right: 'right' };
    el.style.textAlign = alignMap[alignVal] || 'left';
}

function applyDivider(dividerId, char) {
    const el = document.getElementById(dividerId);
    if (!el) return;
    if (char && char.trim()) {
        el.style.display = 'block';
        el.innerText = makeDividerText(char.trim());
    } else {
        el.style.display = 'none';
        el.innerText = '';
    }
}

function updatePreview() {
    if (activeType !== 'belanja') return;
    
    const storeName = document.getElementById('input-store-name').value;
    const storeAddress = document.getElementById('input-store-address').value;
    const storePhone = document.getElementById('input-store-phone').value;
    const cashier = document.getElementById('input-cashier').value || "KASIR";
    const receiptNo = document.getElementById('input-receipt-no').value;
    const dateVal = document.getElementById('input-date').value;
    const timeVal = document.getElementById('input-time').value;
    const datetimeVal = dateVal + (timeVal ? 'T' + timeVal : '');
    const discountVal = parseFloat(document.getElementById('input-discount').value) || 0;
    const cashPaidVal = parseFloat(document.getElementById('input-cash-paid').value) || 0;
    const footerMsg = document.getElementById('input-footer-msg').value;

    // Layout controls
    const alignHeader = document.getElementById('input-align-header').value;
    const sepHeader = document.getElementById('input-sep-header').value;
    const alignCustomer = document.getElementById('input-align-customer').value;
    const sepCustomer = document.getElementById('input-sep-customer').value;
    const alignItems = document.getElementById('input-align-items').value;
    const sepItems = document.getElementById('input-sep-items').value;
    const alignTotals = document.getElementById('input-align-totals').value;
    const sepTotals = document.getElementById('input-sep-totals').value;
    const alignFooter = document.getElementById('input-align-footer').value;

    // Custom field labels (empty allowed)
    const labelReceipt = document.getElementById('input-label-receipt').value;
    const paymentType = document.getElementById('input-payment-type').value;
    const cashierPrefix = document.getElementById('input-cashier-prefix').value;
    const labelCust = document.getElementById('input-label-cust').value;
    const labelAddress = document.getElementById('input-label-address').value;
    const labelPhone = document.getElementById('input-label-phone').value;

    // Customer details
    const customer = document.getElementById('input-customer').value;
    const customerAddress = document.getElementById('input-customer-address').value;
    const customerPhone = document.getElementById('input-customer-phone').value;

    // Format datetime
    let dateStr = '';
    if (datetimeVal) {
        const dt = new Date(datetimeVal);
        const pad = (n) => n.toString().padStart(2, '0');
        const yyyy = dt.getFullYear();
        dateStr = `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${yyyy} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
    }

    // Sync Header details
    document.getElementById('prev-logo-text').innerText = storeName.toUpperCase();
    document.getElementById('prev-store-address').innerText = storeAddress;
    document.getElementById('prev-store-phone').innerText = storePhone;
    document.getElementById('prev-receipt-no').innerText = `${labelReceipt}${receiptNo.toUpperCase()}`;
    document.getElementById('prev-payment-type').innerText = paymentType;
    document.getElementById('prev-datetime').innerText = dateStr;
    document.getElementById('prev-cashier').innerText = `${cashierPrefix}${cashier.toUpperCase()}`;
    document.getElementById('prev-footer-msg').innerText = footerMsg;

    // Sync customer info (hide row if both label and value empty)
    document.getElementById('prev-label-cust').innerText = labelCust;
    document.getElementById('prev-label-address').innerText = labelAddress;
    document.getElementById('prev-label-phone').innerText = labelPhone;
    document.getElementById('prev-colon-cust').style.display = labelCust ? 'inline' : 'none';
    document.getElementById('prev-colon-address').style.display = labelAddress ? 'inline' : 'none';
    document.getElementById('prev-colon-phone').style.display = labelPhone ? 'inline' : 'none';
    document.getElementById('prev-customer-val').innerText = customer.toUpperCase();
    document.getElementById('prev-address-val').innerText = customerAddress.toUpperCase();
    document.getElementById('prev-phone-val').innerText = customerPhone.toUpperCase();
    document.getElementById('prev-row-cust').style.display = (labelCust || customer) ? '' : 'none';
    document.getElementById('prev-row-address').style.display = (labelAddress || customerAddress) ? '' : 'none';
    document.getElementById('prev-row-phone').style.display = (labelPhone || customerPhone) ? '' : 'none';

    // Apply alignment to sections
    applyLayoutSettings('prev-section-header', alignHeader);
    applyLayoutSettings('prev-section-customer', alignCustomer);
    applyLayoutSettings('prev-section-items', alignItems);
    applyLayoutSettings('prev-section-totals', alignTotals);
    applyLayoutSettings('prev-section-footer', alignFooter);

    // Apply dividers
    applyDivider('prev-divider-1', sepHeader);
    applyDivider('prev-divider-2', sepCustomer);
    applyDivider('prev-divider-3', sepItems);
    applyDivider('prev-divider-4', sepTotals);

    // Render items list and calculate sums
    const prevList = document.getElementById('prev-items-list');
    prevList.innerHTML = '';
    
    let totalQty = 0;
    let subtotal = 0;
    let uniqueProdCount = 0;

    items.forEach(item => {
        if (item.name.trim() !== '') {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const lineTotal = qty * price;
            const unit = item.unit || 'PCS';
            
            uniqueProdCount++;
            totalQty += qty;
            subtotal += lineTotal;

            const itemNum = uniqueProdCount;
            const nameLine = (itemNum < 10) ? `${itemNum}. ${item.name.toUpperCase()}` : `${itemNum}.${item.name.toUpperCase()}`;

            const priceStr = formatRibuan(price).padStart(12, ' ');
            const leftSide = priceStr + "    x    " + qty + " " + unit.toUpperCase();
            const rightSide = formatRibuan(lineTotal);

            const block = document.createElement('div');
            block.className = 'receipt-item-block';
            block.innerHTML = `
                <div class="receipt-item-name" style="color: #000; font-weight: normal; white-space: pre-wrap;">${nameLine}</div>
                <div class="receipt-row" style="margin: 0; white-space: pre;">
                    <span class="key" style="color: #000;">${leftSide}</span>
                    <span class="val" style="color: #000;">${rightSide}</span>
                </div>
            `;
            prevList.appendChild(block);
        }
    });

    // Calculate totals
    const grandTotal = Math.max(0, subtotal - discountVal);
    const changeVal = cashPaidVal > 0 ? Math.max(0, cashPaidVal - grandTotal) : 0;

    // Sync summary count
    document.getElementById('prev-items-summary').innerText = `${uniqueProdCount} Produk ${totalQty} Item`;

    // Update screen totals
    document.getElementById('prev-total-val').innerText = formatRibuan(grandTotal);
    document.getElementById('prev-bayar-val').innerText = formatRibuan(cashPaidVal);
    document.getElementById('prev-kembali-val').innerText = formatRibuan(changeVal);
}

// Set Datetime to local current time for Belanja
function setNow() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    document.getElementById('input-date').value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    document.getElementById('input-time').value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    updatePreview();
}

// Generate a random realistic receipt ID for Belanja
function randomizeReceiptNo() {
    const now = new Date();
    const datePart = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('input-receipt-no').value = `TRX-${datePart}-${randomNum}`;
    updatePreview();
}

// ==========================================
// TYPE 2: STRUK SPBU LOGIC (NEW PERTAMINA TEMPLATE)
// ==========================================
function updateSpbuPreview() {
    if (activeType !== 'spbu') return;

    const spbuCode = document.getElementById('input-spbu-code').value;
    const spbuName = document.getElementById('input-spbu-name').value;
    const spbuAddress = document.getElementById('input-spbu-address').value;
    const shift = document.getElementById('input-spbu-shift').value;
    const trans = document.getElementById('input-spbu-trans').value;
    const dateVal = document.getElementById('input-spbu-date').value;
    const timeVal = document.getElementById('input-spbu-time').value;
    
    const pump = document.getElementById('input-spbu-pump').value;
    const grade = document.getElementById('input-spbu-grade').value;
    const price = parseFloat(document.getElementById('input-spbu-price').value) || 0;
    const volume = parseFloat(document.getElementById('input-spbu-volume').value) || 0;
    const operator = document.getElementById('input-spbu-operator').value;
    const cash = parseFloat(document.getElementById('input-spbu-cash').value) || 0;

    // Calculations
    const totalHarga = price * volume;
    const change = cash - totalHarga;

    // Date formatting YYYY-MM-DD -> DD/MM/YYYY
    let formattedDate = '';
    if (dateVal) {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }

    // Update Header
    document.getElementById('prev-spbu-code').innerText = spbuCode;
    document.getElementById('prev-spbu-name').innerText = spbuName.toUpperCase();
    document.getElementById('prev-spbu-address').innerText = spbuAddress.toUpperCase();
    document.getElementById('prev-spbu-shift-trans').innerText = `Shift: ${shift}      No. Trans: ${trans}`;
    document.getElementById('prev-spbu-waktu').innerText = `Waktu: ${formattedDate} ${timeVal}`;

    // Render Monospaced aligned details
    const alignedDetails = document.getElementById('prev-spbu-aligned-details');
    alignedDetails.innerHTML = '';

    const detailsList = [
        { key: "Pulau/Pompa", val: pump },
        { key: "Nama Produk", val: grade.toUpperCase() },
        { key: "Harga/Liter", val: `Rp. ${formatRibuan(price)}` },
        { key: "Volume", val: `(L) ${volume.toFixed(2)}` },
        { key: "Total Harga", val: `Rp. ${formatRibuan(totalHarga)}` },
        { key: "Operator", val: operator.toUpperCase() }
    ];

    detailsList.forEach(item => {
        const row = document.createElement('div');
        row.className = 'receipt-row';
        row.innerHTML = `
            <span class="key">${padKey(item.key, 15)}: ${item.val}</span>
        `;
        alignedDetails.appendChild(row);
    });

    // Update CASH and CHANGE
    document.getElementById('prev-spbu-cash').innerText = formatRibuan(cash);
    
    // Formatting change with a minus sign if there is change returned
    if (change >= 0) {
        document.getElementById('prev-spbu-change').innerText = `-${formatRibuan(change)}`;
    } else {
        document.getElementById('prev-spbu-change').innerText = `0`;
    }
}

// Set Datetime to local current time for SPBU
function setSpbuNow() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    
    document.getElementById('input-spbu-date').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('input-spbu-time').value = `${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
    
    updateSpbuPreview();
}

// Randomize Receipt ID and Shift for SPBU
function randomizeSpbuReceipt() {
    let rand = '';
    for(let i = 0; i < 7; i++) {
        rand += Math.floor(Math.random() * 10).toString();
    }
    document.getElementById('input-spbu-trans').value = rand;
    document.getElementById('input-spbu-shift').value = Math.floor(Math.random() * 3 + 1).toString();
    updateSpbuPreview();
}

// ==========================================
// RESET FORM CONFIGURATION
// ==========================================
function resetForm() {
    if (activeType === 'belanja') {
        document.getElementById('input-store-name').value = defaults.storeName;
        document.getElementById('input-store-address').value = defaults.storeAddress;
        document.getElementById('input-store-phone').value = defaults.storePhone;
        document.getElementById('input-cashier').value = defaults.cashier;
        document.getElementById('input-receipt-no').value = defaults.receiptNo;
        document.getElementById('input-date').value = defaults.datetime.split('T')[0];
        document.getElementById('input-time').value = defaults.datetime.split('T')[1];
        document.getElementById('input-discount').value = defaults.discount;
        document.getElementById('input-cash-paid').value = defaults.cashPaid;
        document.getElementById('input-footer-msg').value = defaults.footerMsg;
        
        // Reset image upload displaying elements
        document.getElementById('file-name-display').innerText = 'Belum ada file dipilih';
        document.getElementById('input-logo-file').value = '';
        document.getElementById('receipt-logo').src = '';
        document.getElementById('receipt-logo').style.display = 'none';

        items = JSON.parse(JSON.stringify(defaults.defaultItems));
        renderEditorItems();
        updatePreview();
    } else {
        document.getElementById('input-spbu-code').value = defaults.spbuCode;
        document.getElementById('input-spbu-name').value = defaults.spbuName;
        document.getElementById('input-spbu-address').value = defaults.spbuAddress;
        document.getElementById('input-spbu-shift').value = defaults.spbuShift;
        document.getElementById('input-spbu-trans').value = defaults.spbuTrans;
        document.getElementById('input-spbu-pump').value = defaults.spbuPump;
        document.getElementById('input-spbu-grade').value = defaults.spbuGrade;
        document.getElementById('input-spbu-volume').value = defaults.spbuVolume;
        document.getElementById('input-spbu-price').value = defaults.spbuPrice;
        document.getElementById('input-spbu-operator').value = defaults.spbuOperator;
        document.getElementById('input-spbu-cash').value = defaults.spbuCash;
        
        setSpbuNow();
        randomizeSpbuReceipt();
    }
    
    // Reset generic selectors
    document.getElementById('input-font-weight').value = 'bold';
    document.getElementById('input-font-size').value = '11px';
    document.getElementById('input-font-family').value = 'mono';
    document.getElementById('input-logo-type').value = 'text';
    document.getElementById('input-print-width').value = defaults.printWidth;

    // Reset layout & separator controls
    document.getElementById('input-align-header').value = defaults.alignHeader;
    document.getElementById('input-sep-header').value = defaults.sepHeader;
    document.getElementById('input-align-customer').value = defaults.alignCustomer;
    document.getElementById('input-sep-customer').value = defaults.sepCustomer;
    document.getElementById('input-align-items').value = defaults.alignItems;
    document.getElementById('input-sep-items').value = defaults.sepItems;
    document.getElementById('input-align-totals').value = defaults.alignTotals;
    document.getElementById('input-sep-totals').value = defaults.sepTotals;
    document.getElementById('input-align-footer').value = defaults.alignFooter;

    // Reset custom field labels
    document.getElementById('input-label-receipt').value = defaults.labelReceipt;
    document.getElementById('input-payment-type').value = defaults.paymentType;
    document.getElementById('input-cashier-prefix').value = defaults.cashierPrefix;
    document.getElementById('input-label-cust').value = defaults.labelCust;
    document.getElementById('input-label-address').value = defaults.labelAddress;
    document.getElementById('input-label-phone').value = defaults.labelPhone;

}

// ==========================================
// ESC/POS PRINT BUILDER FOR THERMAL PRINTERS
// ==========================================
class EscPosBuilder {
    constructor() {
        this.buffer = [];
    }

    initialize() {
        this.buffer.push(0x1B, 0x40); // ESC @
        return this;
    }

    text(str) {
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode < 128) {
                this.buffer.push(charCode);
            } else {
                this.buffer.push(63); // '?' for non-ASCII
            }
        }
        return this;
    }

    line(str = "") {
        this.text(str);
        this.buffer.push(0x0A); // LF
        return this;
    }

    feed(lines = 1) {
        for (let i = 0; i < lines; i++) {
            this.buffer.push(0x0A);
        }
        return this;
    }

    // 0 = Left, 1 = Center, 2 = Right
    align(value) {
        this.buffer.push(0x1B, 0x61, value);
        return this;
    }

    bold(enable) {
        this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
        return this;
    }

    // Double size text (11h = double height & double width)
    doubleSize(enable) {
        this.buffer.push(0x1D, 0x21, enable ? 0x11 : 0x00);
        return this;
    }

    divider(char = '-') {
        this.line(char.repeat(48));
        return this;
    }

    appendBytes(bytes) {
        if (bytes) {
            for (let i = 0; i < bytes.length; i++) {
                this.buffer.push(bytes[i]);
            }
        }
        return this;
    }

    getBytes() {
        return new Uint8Array(this.buffer);
    }
}

// ==========================================
// IMAGE & SVG TO ESC/POS BITMAP CONVERTERS
// ==========================================

// Convert local SVG to ESC/POS raster image bytes
function convertSvgToEscPos(svgElement, targetWidth = 256, targetHeight = 60) {
    return new Promise((resolve, reject) => {
        try {
            const svgClone = svgElement.cloneNode(true);
            svgClone.setAttribute('fill', '#000000');
            svgClone.style.color = '#000000';
            
            const elements = svgClone.querySelectorAll('*');
            elements.forEach(el => {
                if (el.getAttribute('fill') === 'currentColor') {
                    el.setAttribute('fill', '#000000');
                }
                if (el.getAttribute('stroke') === 'currentColor') {
                    el.setAttribute('stroke', '#000000');
                }
            });

            const svgString = new XMLSerializer().serializeToString(svgClone);
            const img = new Image();
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    
                    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
                    const pixels = imgData.data;
                    const dataBytes = [];

                    for (let y = 0; y < targetHeight; y++) {
                        for (let x = 0; x < targetWidth; x += 8) {
                            let byteVal = 0;
                            for (let bit = 0; bit < 8; bit++) {
                                const px = x + bit;
                                if (px < targetWidth) {
                                    const idx = (y * targetWidth + px) * 4;
                                    const r = pixels[idx];
                                    const g = pixels[idx + 1];
                                    const b = pixels[idx + 2];
                                    const a = pixels[idx + 3];
                                    const isBlack = (a > 127) && ((r + g + b) / 3 < 180);
                                    if (isBlack) {
                                        byteVal |= (1 << (7 - bit));
                                    }
                                }
                            }
                            dataBytes.push(byteVal);
                        }
                    }

                    const xL = (targetWidth / 8) & 0xFF;
                    const xH = ((targetWidth / 8) >> 8) & 0xFF;
                    const yL = targetHeight & 0xFF;
                    const yH = (targetHeight >> 8) & 0xFF;

                    const header = [
                        0x1D, 0x76, 0x30, 0x00, // GS v 0 0
                        xL, xH,
                        yL, yH
                    ];

                    const finalBytes = new Uint8Array(header.length + dataBytes.length);
                    finalBytes.set(header, 0);
                    finalBytes.set(dataBytes, header.length);

                    resolve(finalBytes);
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = (err) => reject(new Error("Gagal memuat gambar SVG logo."));
        } catch (e) {
            reject(e);
        }
    });
}

// Convert HTML Image element to ESC/POS raster image bytes
function convertImageToEscPos(imgElement, targetWidth = 256) {
    return new Promise((resolve, reject) => {
        if (!imgElement || !imgElement.src || imgElement.style.display === 'none') {
            resolve(null);
            return;
        }

        const runConversion = () => {
            try {
                const width = Math.floor(targetWidth / 8) * 8;
                const aspect = imgElement.naturalHeight / imgElement.naturalWidth;
                const height = Math.round(width * aspect);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(imgElement, 0, 0, width, height);

                const imgData = ctx.getImageData(0, 0, width, height);
                const pixels = imgData.data;
                const dataBytes = [];

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x += 8) {
                        let byteVal = 0;
                        for (let bit = 0; bit < 8; bit++) {
                            const px = x + bit;
                            if (px < width) {
                                const idx = (y * width + px) * 4;
                                const r = pixels[idx];
                                const g = pixels[idx + 1];
                                const b = pixels[idx + 2];
                                const a = pixels[idx + 3];
                                const isBlack = (a > 127) && ((r + g + b) / 3 < 180);
                                if (isBlack) {
                                    byteVal |= (1 << (7 - bit));
                                }
                            }
                        }
                        dataBytes.push(byteVal);
                    }
                }

                const xL = (width / 8) & 0xFF;
                const xH = ((width / 8) >> 8) & 0xFF;
                const yL = height & 0xFF;
                const yH = (height >> 8) & 0xFF;

                const header = [
                    0x1D, 0x76, 0x30, 0x00, // GS v 0 0
                    xL, xH,
                    yL, yH
                ];

                const finalBytes = new Uint8Array(header.length + dataBytes.length);
                finalBytes.set(header, 0);
                finalBytes.set(dataBytes, header.length);

                resolve(finalBytes);
            } catch (err) {
                reject(err);
            }
        };

        if (imgElement.complete && imgElement.naturalWidth > 0) {
            runConversion();
        } else {
            imgElement.onload = runConversion;
            imgElement.onerror = () => reject(new Error("Gagal memuat gambar logo."));
        }
    });
}


// ==========================================
// WEB BLUETOOTH PRINTER MANAGEMENT
// ==========================================
let btDevice = null;
let btCharacteristic = null;
let isBtConnecting = false;

// Update UI state for Bluetooth
function updateBluetoothUI(connected, deviceName = "") {
    const dot = document.getElementById('bt-status-dot');
    const text = document.getElementById('bt-status-text');
    const btnConnect = document.getElementById('btn-connect-bt');
    const btnDisconnect = document.getElementById('btn-disconnect-bt');
    const btnPrint = document.getElementById('btn-print-bt');
    const btnPrintPreview = document.getElementById('btn-print-bt-preview');

    if (isBtConnecting) {
        dot.className = 'status-dot connecting';
        text.innerText = 'Menghubungkan...';
        btnConnect.disabled = true;
        btnDisconnect.style.display = 'none';
        if (btnPrint) btnPrint.disabled = true;
        if (btnPrintPreview) btnPrintPreview.disabled = true;
        return;
    }

    if (connected) {
        dot.className = 'status-dot connected';
        text.innerText = deviceName;
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'block';
        if (btnPrint) btnPrint.disabled = false;
        if (btnPrintPreview) {
            btnPrintPreview.disabled = false;
            btnPrintPreview.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline></svg>
                Cetak Bluetooth
            `;
        }
    } else {
        dot.className = 'status-dot disconnected';
        text.innerText = 'Bluetooth terputus';
        btnConnect.style.display = 'block';
        btnConnect.disabled = false;
        btnDisconnect.style.display = 'none';
        if (btnPrint) btnPrint.disabled = true;
        if (btnPrintPreview) {
            btnPrintPreview.disabled = false;
            btnPrintPreview.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline></svg>
                Cetak Bluetooth
            `;
        }
    }
}

// Check Bluetooth support
function checkBluetoothSupport() {
    if (!navigator.bluetooth) {
        const text = document.getElementById('bt-status-text');
        const btnConnect = document.getElementById('btn-connect-bt');
        const btnPrint = document.getElementById('btn-print-bt');
        const btnPrintPreview = document.getElementById('btn-print-bt-preview');
        
        text.innerText = 'Bluetooth tidak didukung browser ini';
        btnConnect.disabled = true;
        if (btnPrint) btnPrint.disabled = true;
        if (btnPrintPreview) {
            btnPrintPreview.disabled = true;
            btnPrintPreview.title = "Browser Anda tidak mendukung Web Bluetooth (gunakan Chrome/Edge)";
            btnPrintPreview.style.opacity = '0.5';
            btnPrintPreview.style.cursor = 'not-allowed';
        }
        return false;
    }
    return true;
}

// Connect to Bluetooth printer
async function connectBluetooth() {
    if (isBtConnecting) return;
    
    isBtConnecting = true;
    updateBluetoothUI(false);
    
    try {
        const optionalServices = [
            '000018f0-0000-1000-8000-00805f9b34fb', // Standard BLE POS printer
            '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC BLE Serial (common Chinese POS printers)
            'e7e1a000-4f7e-11e1-b13d-0002a5d5c51b', // Custom BLE printer
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service (NUS)
            '00001101-0000-1000-8000-00805f9b34fb'  // SPP Serial Port
        ];
        
        console.log("Requesting Bluetooth device...");
        btDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: optionalServices
        });

        console.log("Connecting to GATT server...");
        const server = await btDevice.gatt.connect();

        console.log("Searching for primary print services...");
        let printCharacteristic = null;

        for (const uuid of optionalServices) {
            try {
                const service = await server.getPrimaryService(uuid);
                if (service) {
                    console.log(`Found service: ${uuid}`);
                    const chars = await service.getCharacteristics();
                    for (const char of chars) {
                        if (char.properties.write || char.properties.writeWithoutResponse) {
                            printCharacteristic = char;
                            console.log(`Found write characteristic: ${char.uuid}`);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.log(`Service ${uuid} not available:`, err.message);
            }
            if (printCharacteristic) break;
        }

        if (!printCharacteristic) {
            try {
                const services = await server.getPrimaryServices();
                for (const service of services) {
                    const chars = await service.getCharacteristics();
                    for (const char of chars) {
                        if (char.properties.write || char.properties.writeWithoutResponse) {
                            printCharacteristic = char;
                            console.log(`Fallback: Found write characteristic: ${char.uuid}`);
                            break;
                        }
                    }
                    if (printCharacteristic) break;
                }
            } catch (e) {
                console.log("Fallback search failed:", e);
            }
        }

        if (!printCharacteristic) {
            throw new Error("Printer tidak mendukung pengiriman data Bluetooth standard (karakteristik Write tidak ditemukan).");
        }

        btCharacteristic = printCharacteristic;
        btDevice.addEventListener('gattserverdisconnected', onBtDisconnected);
        
        isBtConnecting = false;
        updateBluetoothUI(true, btDevice.name || "Printer Bluetooth");
        console.log("Bluetooth Connected successfully.");
        return true;
        
    } catch (error) {
        console.error("Bluetooth Connection Error:", error);
        isBtConnecting = false;
        updateBluetoothUI(false);
        alert("Gagal menghubungkan printer: " + error.message);
        return false;
    }
}

// Disconnect printer
function disconnectBluetooth() {
    if (btDevice && btDevice.gatt.connected) {
        console.log("Disconnecting Bluetooth...");
        btDevice.gatt.disconnect();
    } else {
        onBtDisconnected();
    }
}

// Disconnected Handler
function onBtDisconnected() {
    console.log("Bluetooth Disconnected.");
    btDevice = null;
    btCharacteristic = null;
    updateBluetoothUI(false);
}

// Format two columns to fit exactly inside ESC/POS line width (48 characters for 80mm)
function formatTwoColumnsEscPos(left, right, width = 48) {
    const spaceNeeded = width - (left.length + right.length);
    if (spaceNeeded <= 0) {
        return left.substring(0, width - right.length - 1) + " " + right;
    }
    return left + " ".repeat(spaceNeeded) + right;
}

// Print Struk to Connected Bluetooth Printer
async function printBluetooth() {
    if (!navigator.bluetooth) {
        alert("Browser Anda tidak mendukung Web Bluetooth.");
        return;
    }

    // Auto-connect if not connected yet
    if (!btDevice || !btDevice.gatt.connected || !btCharacteristic) {
        const connected = await connectBluetooth();
        if (!connected) return; // failed to connect
    }

    try {
        let bytes;
        if (activeType === 'belanja') {
            bytes = await generateBelanjaEscPos();
        } else {
            bytes = await generateSpbuEscPos();
        }

        console.log("Sending ESC/POS print job to printer...");
        
        // Chunk and send data
        const chunkSize = 20; // safe BLE packet MTU size
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.slice(i, i + chunkSize);
            if (btCharacteristic.properties.writeWithoutResponse) {
                await btCharacteristic.writeValueWithoutResponse(chunk);
            } else {
                await btCharacteristic.writeValue(chunk);
            }
            // Small delay to let cheap thermal printers process buffers
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        console.log("Printing job sent successfully.");
    } catch (error) {
        console.error("Printing failed:", error);
        alert("Gagal mengirim data ke printer: " + error.message);
    }
}

// Helper for ESC/POS alignment value
function escPosAlignValue(val) {
    const map = { left: 0, center: 1, right: 2 };
    return map[val] !== undefined ? map[val] : 0;
}

// Generate ESC/POS bytes for Belanja Struk
async function generateBelanjaEscPos() {
    const storeName = document.getElementById('input-store-name').value || "TOKO ANDA";
    const storeAddress = document.getElementById('input-store-address').value || "";
    const storePhone = document.getElementById('input-store-phone').value || "";
    const cashier = document.getElementById('input-cashier').value || "Kasir";
    const receiptNo = document.getElementById('input-receipt-no').value || "TRX-0000";
    const dateVal = document.getElementById('input-date').value;
    const timeVal = document.getElementById('input-time').value;
    const datetimeVal = dateVal + (timeVal ? 'T' + timeVal : '');
    const discountVal = parseFloat(document.getElementById('input-discount').value) || 0;
    const cashPaidVal = parseFloat(document.getElementById('input-cash-paid').value) || 0;
    const footerMsg = document.getElementById('input-footer-msg').value || "";

    // Layout controls
    const alignHeader = document.getElementById('input-align-header').value;
    const sepHeader = document.getElementById('input-sep-header').value;
    const alignCustomer = document.getElementById('input-align-customer').value;
    const sepCustomer = document.getElementById('input-sep-customer').value;
    const alignItems = document.getElementById('input-align-items').value;
    const sepItems = document.getElementById('input-sep-items').value;
    const alignTotals = document.getElementById('input-align-totals').value;
    const sepTotals = document.getElementById('input-sep-totals').value;
    const alignFooter = document.getElementById('input-align-footer').value;

    // Custom field labels (empty allowed)
    const labelReceipt = document.getElementById('input-label-receipt').value;
    const paymentType = document.getElementById('input-payment-type').value;
    const cashierPrefix = document.getElementById('input-cashier-prefix').value;
    const labelCust = document.getElementById('input-label-cust').value;
    const labelAddress = document.getElementById('input-label-address').value;
    const labelPhone = document.getElementById('input-label-phone').value;

    // Date formatting
    let dateStr = '';
    if (datetimeVal) {
        const dt = new Date(datetimeVal);
        const pad = (n) => n.toString().padStart(2, '0');
        const yyyy = dt.getFullYear();
        dateStr = `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${yyyy} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
    }

    const builder = new EscPosBuilder();
    builder.initialize();

    // Check custom image logo
    const logoType = document.getElementById('input-logo-type').value;
    let logoBytes = null;
    if (logoType === 'image') {
        const logoImg = document.getElementById('receipt-logo');
        try {
            logoBytes = await convertImageToEscPos(logoImg, 256);
        } catch (e) {
            console.error("Gagal memproses gambar logo belanja:", e);
        }
    }

    // ============ SECTION: HEADER ============
    builder.align(escPosAlignValue(alignHeader));
    if (logoType === 'image' && logoBytes) {
        builder.appendBytes(logoBytes);
        builder.feed(1);
    } else {
        builder.doubleSize(true);
        builder.bold(true);
        builder.line(storeName.toUpperCase());
        builder.doubleSize(false);
        builder.bold(false);
    }
    
    if (storeAddress) {
        builder.line(storeAddress);
    }
    if (storePhone) {
        builder.line(storePhone);
    }

    builder.line(formatTwoColumnsEscPos(labelReceipt + receiptNo.toUpperCase(), paymentType, 48));
    builder.line(formatTwoColumnsEscPos(dateStr, cashierPrefix + cashier.toUpperCase(), 48));

    // ============ DIVIDER 1: Header → Customer ============
    if (sepHeader && sepHeader.trim()) {
        builder.divider(sepHeader.trim());
    }

    // ============ SECTION: CUSTOMER ============
    builder.align(escPosAlignValue(alignCustomer));
    const customer = document.getElementById('input-customer').value;
    const customerAddress = document.getElementById('input-customer-address').value;
    const customerPhone = document.getElementById('input-customer-phone').value;
    
    if (labelCust || customer) {
        const line = labelCust ? `${padKey(labelCust, 7)}: ${customer.toUpperCase()}` : customer.toUpperCase();
        builder.line(line);
    }
    if (labelAddress || customerAddress) {
        const line = labelAddress ? `${padKey(labelAddress, 7)}: ${customerAddress.toUpperCase()}` : customerAddress.toUpperCase();
        builder.line(line);
    }
    if (labelPhone || customerPhone) {
        const line = labelPhone ? `${padKey(labelPhone, 7)}: ${customerPhone.toUpperCase()}` : customerPhone.toUpperCase();
        builder.line(line);
    }

    // ============ DIVIDER 2: Customer → Items ============
    if (sepCustomer && sepCustomer.trim()) {
        builder.divider(sepCustomer.trim());
    }

    // ============ SECTION: ITEMS ============
    builder.align(escPosAlignValue(alignItems));
    let totalQty = 0;
    let subtotal = 0;
    let uniqueProdCount = 0;

    items.forEach(item => {
        if (item.name.trim() !== '') {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const lineTotal = qty * price;
            const unit = item.unit || 'PCS';
            
            uniqueProdCount++;
            totalQty += qty;
            subtotal += lineTotal;

            const itemNum = uniqueProdCount;
            const nameLine = (itemNum < 10) ? `${itemNum}. ${item.name.toUpperCase()}` : `${itemNum}.${item.name.toUpperCase()}`;
            builder.line(nameLine);

            const priceStr = formatRibuan(price).padStart(12, ' ');
            const leftSide = priceStr + "    x    " + qty + " " + unit.toUpperCase();
            const rightSide = formatRibuan(lineTotal);
            builder.line(formatTwoColumnsEscPos(leftSide, rightSide, 48));
        }
    });
    
    const summaryStr = `${uniqueProdCount} Produk ${totalQty} Item`;
    builder.line(formatTwoColumnsEscPos("", summaryStr, 48));

    // ============ DIVIDER 3: Items → Totals ============
    if (sepItems && sepItems.trim()) {
        builder.divider(sepItems.trim());
    }

    // ============ SECTION: TOTALS ============
    builder.align(escPosAlignValue(alignTotals));
    const grandTotal = Math.max(0, subtotal - discountVal);
    const changeVal = cashPaidVal > 0 ? Math.max(0, cashPaidVal - grandTotal) : 0;

    const formatAlignedTotalEscPos = (label, valStr, padLen = 12, totalLen = 48) => {
        const labelPart = padKey(label, padLen) + ":";
        const spacesCount = totalLen - labelPart.length - valStr.length;
        const spaces = spacesCount > 0 ? " ".repeat(spacesCount) : " ";
        return labelPart + spaces + valStr;
    };

    builder.line(formatAlignedTotalEscPos("Total", formatRibuan(grandTotal), 12, 48));
    builder.line(formatAlignedTotalEscPos("Bayar", formatRibuan(cashPaidVal), 12, 48));
    builder.line(formatAlignedTotalEscPos("Kembali", formatRibuan(changeVal), 12, 48));

    // ============ DIVIDER 4: Totals → Footer ============
    if (sepTotals && sepTotals.trim()) {
        builder.divider(sepTotals.trim());
    }

    // ============ SECTION: FOOTER ============
    builder.align(escPosAlignValue(alignFooter));
    if (footerMsg) {
        const lines = footerMsg.split('\n');
        lines.forEach(l => builder.line(l));
    }

    // Safe feed & tear off
    builder.feed(4);
    return builder.getBytes();
}

// Generate ESC/POS bytes for SPBU Struk (Pertamina layout)
async function generateSpbuEscPos() {
    const spbuCode = document.getElementById('input-spbu-code').value || "";
    const spbuName = document.getElementById('input-spbu-name').value || "";
    const spbuAddress = document.getElementById('input-spbu-address').value || "";
    const shift = document.getElementById('input-spbu-shift').value || "";
    const trans = document.getElementById('input-spbu-trans').value || "";
    const dateVal = document.getElementById('input-spbu-date').value;
    const timeVal = document.getElementById('input-spbu-time').value || "";
    
    const pump = document.getElementById('input-spbu-pump').value || "";
    const grade = document.getElementById('input-spbu-grade').value || "";
    const price = parseFloat(document.getElementById('input-spbu-price').value) || 0;
    const volume = parseFloat(document.getElementById('input-spbu-volume').value) || 0;
    const operator = document.getElementById('input-spbu-operator').value || "";
    const cash = parseFloat(document.getElementById('input-spbu-cash').value) || 0;

    const totalHarga = price * volume;
    const change = cash - totalHarga;

    // Date formatting YYYY-MM-DD -> DD/MM/YYYY
    let formattedDate = '';
    if (dateVal) {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }

    const builder = new EscPosBuilder();
    builder.initialize();

    // Convert Pertamina SVG logo to ESC/POS bytes
    const svgElement = document.querySelector('#preview-layout-spbu .pertamina-logo-svg');
    let logoBytes = null;
    if (svgElement) {
        try {
            logoBytes = await convertSvgToEscPos(svgElement, 256, 60);
        } catch (e) {
            console.error("Gagal memproses SVG logo Pertamina:", e);
        }
    }

    // Pertamina Header
    builder.align(1); // Center
    if (logoBytes) {
        builder.appendBytes(logoBytes);
        builder.feed(1);
    } else {
        builder.doubleSize(true);
        builder.bold(true);
        builder.line("PERTAMINA");
        builder.doubleSize(false);
        builder.bold(false);
    }

    builder.line(spbuCode);
    builder.line(spbuName.toUpperCase());
    builder.line(spbuAddress.toUpperCase());
    builder.line(`Shift: ${shift}      No. Trans: ${trans}`);
    builder.line(`Waktu: ${formattedDate} ${timeVal}`);
    builder.divider('-');

    // Monospaced Aligned details
    builder.align(0); // Left
    const detailsList = [
        { key: "Pulau/Pompa", val: pump },
        { key: "Nama Produk", val: grade.toUpperCase() },
        { key: "Harga/Liter", val: `Rp. ${formatRibuan(price)}` },
        { key: "Volume", val: `(L) ${volume.toFixed(2)}` },
        { key: "Total Harga", val: `Rp. ${formatRibuan(totalHarga)}` },
        { key: "Operator", val: operator.toUpperCase() }
    ];

    detailsList.forEach(item => {
        // Pad key to exactly 15 characters to line up colons in 80mm
        const paddedKey = padKey(item.key, 15);
        builder.line(`${paddedKey}: ${item.val}`);
    });

    builder.divider('-');

    // CASH & CHANGE (double lines left-right styled)
    builder.line("CASH");
    builder.line(formatTwoColumnsEscPos("", formatRibuan(cash), 48));
    builder.line("CHANGE");
    
    let changeStr = "0";
    if (change >= 0) {
        changeStr = `-${formatRibuan(change)}`;
    }
    builder.line(formatTwoColumnsEscPos("", changeStr, 48));
    
    builder.divider('-');

    // Feed lines
    builder.feed(4);
    return builder.getBytes();
}

// Page load initialisation
window.addEventListener('DOMContentLoaded', () => {
    // Load default values for Belanja (SAFA receipt)
    document.getElementById('input-store-name').value = defaults.storeName;
    document.getElementById('input-store-address').value = defaults.storeAddress;
    document.getElementById('input-store-phone').value = defaults.storePhone;
    document.getElementById('input-cashier').value = defaults.cashier;
    document.getElementById('input-receipt-no').value = defaults.receiptNo;
    document.getElementById('input-date').value = defaults.datetime.split('T')[0];
    document.getElementById('input-time').value = defaults.datetime.split('T')[1];
    document.getElementById('input-discount').value = defaults.discount;
    document.getElementById('input-cash-paid').value = defaults.cashPaid;
    document.getElementById('input-footer-msg').value = defaults.footerMsg;

    // Load layout & separator defaults
    document.getElementById('input-align-header').value = defaults.alignHeader;
    document.getElementById('input-sep-header').value = defaults.sepHeader;
    document.getElementById('input-align-customer').value = defaults.alignCustomer;
    document.getElementById('input-sep-customer').value = defaults.sepCustomer;
    document.getElementById('input-align-items').value = defaults.alignItems;
    document.getElementById('input-sep-items').value = defaults.sepItems;
    document.getElementById('input-align-totals').value = defaults.alignTotals;
    document.getElementById('input-sep-totals').value = defaults.sepTotals;
    document.getElementById('input-align-footer').value = defaults.alignFooter;

    // Load custom field label defaults
    document.getElementById('input-label-receipt').value = defaults.labelReceipt;
    document.getElementById('input-payment-type').value = defaults.paymentType;
    document.getElementById('input-cashier-prefix').value = defaults.cashierPrefix;
    document.getElementById('input-label-cust').value = defaults.labelCust;
    document.getElementById('input-label-address').value = defaults.labelAddress;
    document.getElementById('input-label-phone').value = defaults.labelPhone;

    items = JSON.parse(JSON.stringify(defaults.defaultItems));

    // Load defaults for SPBU
    setSpbuNow();
    randomizeSpbuReceipt();
    
    adjustFontSettings();
    toggleLogoType();
    renderEditorItems();
    
    // Check if browser supports Web Bluetooth and update UI
    checkBluetoothSupport();
    
    // Start with Belanja Mode by default
    switchReceiptType('belanja');
    updatePreview();
});
