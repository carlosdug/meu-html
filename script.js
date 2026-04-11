var entries = JSON.parse(localStorage.getItem('entries')) || [];
var investments = JSON.parse(localStorage.getItem('investments')) || [];

function displayEntries() {
    const entriesDiv = document.getElementById('entries');
    if (entries.length === 0) {
        entriesDiv.innerHTML = '<p>Nenhum lançamento.</p>';
    } else {
        entriesDiv.innerHTML = '<ul>' + 
            entries.map((entry, index) => 
                `<li><span>${entry.description}: R$ ${entry.amount.toFixed(2)} (${entry.type})</span>
                <button class="danger" onclick="removeEntry(${index})">✕</button></li>`
            ).join('') + '</ul>';
    }
    updateDashboard();
}

function displayInvestments() {
    const investDiv = document.getElementById('investments');
    if (investments.length === 0) {
        investDiv.innerHTML = '<p>Nenhum investimento.</p>';
    } else {
        investDiv.innerHTML = '<ul>' + 
            investments.map((inv, index) => {
                const gain = inv.current - inv.amount;
                const percent = ((gain / inv.amount) * 100).toFixed(2);
                const color = gain >= 0 ? '#4CAF50' : '#f44336';
                return `<li><span>${inv.name}: R$ ${inv.current.toFixed(2)} (<span style="color: ${color}">${gain >= 0 ? '+' : ''}${gain.toFixed(2)} ${percent}%</span>)</span>
                <button class="danger" onclick="removeInvestment(${index})">✕</button></li>`;
            }).join('') + '</ul>';
    }
    updateDashboard();
}

function updateDashboard() {
    const totalReceita = entries.filter(e => e.type === 'receita').reduce((sum, e) => sum + e.amount, 0);
    const totalDespesa = entries.filter(e => e.type === 'despesa').reduce((sum, e) => sum + e.amount, 0);
    const totalInvest = investments.reduce((sum, inv) => sum + inv.current, 0);
    const balance = totalReceita - totalDespesa + totalInvest;
    
    document.getElementById('totalReceita').textContent = totalReceita.toFixed(2);
    document.getElementById('totalDespesa').textContent = totalDespesa.toFixed(2);
    document.getElementById('totalInvest').textContent = totalInvest.toFixed(2);
    document.getElementById('balance').textContent = balance.toFixed(2);
}

// eslint-disable-next-line no-unused-vars
function removeEntry(index) {
    entries.splice(index, 1);
    localStorage.setItem('entries', JSON.stringify(entries));
    displayEntries();
}

// eslint-disable-next-line no-unused-vars
function removeInvestment(index) {
    investments.splice(index, 1);
    localStorage.setItem('investments', JSON.stringify(investments));
    displayInvestments();
}

// eslint-disable-next-line no-unused-vars
function exportCSV() {
    let csv = 'type,description,amount,date\n';
    entries.forEach(e => {
        csv += `${e.type},"${e.description}",${e.amount},${e.date || new Date().toISOString()}\n`;
    });
    csv += '\ninvestment,name,amount_invested,current_value,type\n';
    investments.forEach(inv => {
        csv += `investment,"${inv.name}",${inv.amount},${inv.current},${inv.type}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// eslint-disable-next-line no-unused-vars
function importCSV() {
    const file = document.getElementById('importFile').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        let section = 'entries';
        
        lines.forEach((line, idx) => {
            if (idx === 0 || !line.trim()) return;
            if (line.includes('investment,name')) { section = 'investments'; return; }
            
            if (section === 'entries' && line.startsWith('investment')) return;
            if (section === 'investments' && !line.startsWith('investment')) return;
            
            const parts = line.match(/([^,]+)|"([^"]*)"/g)?.map(p => p.replace(/^"|"$/g, '')) || [];
            
            if (section === 'entries' && parts[0] === 'receita' || parts[0] === 'despesa') {
                entries.push({ description: parts[1], amount: parseFloat(parts[2]), type: parts[0], date: parts[3] });
            } else if (section === 'investments' && parts[0] === 'investment') {
                investments.push({ name: parts[1], amount: parseFloat(parts[2]), current: parseFloat(parts[3]), type: parts[4] });
            }
        });
        
        localStorage.setItem('entries', JSON.stringify(entries));
        localStorage.setItem('investments', JSON.stringify(investments));
        displayEntries();
        displayInvestments();
        document.getElementById('importFile').value = '';
    };
    reader.readAsText(file);
}

document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    
    if (description && !isNaN(amount)) {
        entries.push({ description, amount, type, date: new Date().toISOString() });
        localStorage.setItem('entries', JSON.stringify(entries));
        displayEntries();
        this.reset();
    }
});

document.getElementById('investForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('investName').value.trim();
    const amount = parseFloat(document.getElementById('investAmount').value);
    const current = parseFloat(document.getElementById('investCurrent').value);
    const type = document.getElementById('investType').value;
    
    if (name && !isNaN(amount) && !isNaN(current)) {
        investments.push({ name, amount, current, type });
        localStorage.setItem('investments', JSON.stringify(investments));
        displayInvestments();
        this.reset();
    }
});

document.getElementById('importFile').addEventListener('change', importCSV);

displayEntries();
displayInvestments();