var entries = JSON.parse(localStorage.getItem('entries')) || [];

function displayEntries() {
    const entriesDiv = document.getElementById('entries');
    if (entries.length === 0) {
        entriesDiv.innerHTML = '<p>Nenhum lançamento ainda.</p>';
        return;
    }
    entriesDiv.innerHTML = '<h2>Lançamentos</h2><ul>' + 
        entries.map((entry, index) => 
            `<li>${entry.description}: R$ ${entry.amount.toFixed(2)} (${entry.type}) 
            <button onclick="removeEntry(${index})">Remover</button></li>`
        ).join('') + '</ul>';
    
    const balance = entries.reduce((sum, entry) => 
        sum + (entry.type === 'receita' ? entry.amount : -entry.amount), 0);
    document.getElementById('balance').textContent = balance.toFixed(2);
}

function removeEntry(index) {
    entries.splice(index, 1);
    localStorage.setItem('entries', JSON.stringify(entries));
    displayEntries();
}

document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    
    if (description && !isNaN(amount)) {
        entries.push({ description, amount, type });
        localStorage.setItem('entries', JSON.stringify(entries));
        displayEntries();
        this.reset();
    }
});

displayEntries();