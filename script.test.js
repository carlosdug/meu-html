/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the script
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(() => '[]'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Set up DOM
document.body.innerHTML = `
  <form id="entryForm">
    <input id="description" />
    <input id="amount" />
    <select id="type">
      <option value="receita">Receita</option>
      <option value="despesa">Despesa</option>
    </select>
    <button type="submit">Adicionar</button>
  </form>
  <div id="entries"></div>
  <h2>Saldo Total: R$ <span id="balance">0.00</span></h2>
`;

// Execute the script in the test environment
eval(scriptContent);

describe('Income and Expense Tracker', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Reset entries
    entries = [];
    localStorage.getItem.mockReturnValue('[]');
    // Reset DOM
    document.getElementById('entries').innerHTML = '';
    document.getElementById('balance').textContent = '0.00';
    document.getElementById('entryForm').reset();
  });

  test('should calculate balance correctly', () => {
    entries = [
      { description: 'Salary', amount: 1000, type: 'receita' },
      { description: 'Rent', amount: 500, type: 'despesa' },
      { description: 'Freelance', amount: 200, type: 'receita' }
    ];
    
    displayEntries();
    
    expect(document.getElementById('balance').textContent).toBe('700.00');
  });

  test('should add entry correctly', () => {
    // Set form values
    document.getElementById('description').value = 'Test Entry';
    document.getElementById('amount').value = '100';
    document.getElementById('type').value = 'receita';
    
    const event = { preventDefault: jest.fn() };
    
    // Trigger form submit
    document.getElementById('entryForm').dispatchEvent(new Event('submit'));
    
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({ description: 'Test Entry', amount: 100, type: 'receita' });
    expect(localStorage.setItem).toHaveBeenCalledWith('entries', JSON.stringify(entries));
  });

  test('should remove entry correctly', () => {
    entries = [
      { description: 'Test', amount: 100, type: 'receita' }
    ];
    
    removeEntry(0);
    
    expect(entries).toHaveLength(0);
    expect(localStorage.setItem).toHaveBeenCalledWith('entries', '[]');
  });
});