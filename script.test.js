/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the script
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

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
  <form id="investForm">
    <input id="investName" />
    <input id="investAmount" />
    <input id="investCurrent" />
    <select id="investType">
      <option value="acao">Ação</option>
      <option value="fundo">Fundo</option>
    </select>
    <button type="submit">Adicionar Investimento</button>
  </form>
  <div id="entries"></div>
  <div id="investments"></div>
  <div id="totalReceita">0.00</div>
  <div id="totalDespesa">0.00</div>
  <div id="totalInvest">0.00</div>
  <div id="balance">0.00</div>
  <input type="file" id="importFile" />
`;

// Mock localStorage
jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[]');
jest.spyOn(window.localStorage.__proto__, 'setItem');

// Execute the script in the test environment
eval(scriptContent);

describe('Finance Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.__proto__.getItem.mockReturnValue('[]');
    entries = [];
    investments = [];
    document.getElementById('entries').innerHTML = '';
    document.getElementById('investments').innerHTML = '';
  });

  test('should calculate balance with entries correctly', () => {
    entries = [
      { description: 'Salary', amount: 1000, type: 'receita' },
      { description: 'Rent', amount: 500, type: 'despesa' }
    ];
    
    updateDashboard();
    
    expect(document.getElementById('balance').textContent).toBe('500.00');
  });

  test('should add entry correctly', () => {
    document.getElementById('description').value = 'Test Entry';
    document.getElementById('amount').value = '100';
    document.getElementById('type').value = 'receita';
    
    document.getElementById('entryForm').dispatchEvent(new Event('submit'));
    
    expect(entries).toHaveLength(1);
    expect(entries[0].description).toBe('Test Entry');
  });

  test('should add investment correctly', () => {
    document.getElementById('investName').value = 'Apple Stock';
    document.getElementById('investAmount').value = '500';
    document.getElementById('investCurrent').value = '550';
    document.getElementById('investType').value = 'acao';
    
    document.getElementById('investForm').dispatchEvent(new Event('submit'));
    
    expect(investments).toHaveLength(1);
    expect(investments[0].name).toBe('Apple Stock');
  });

  test('should calculate total with investments', () => {
    entries = [{ description: 'Income', amount: 1000, type: 'receita' }];
    investments = [{ name: 'Stock', amount: 500, current: 600, type: 'acao' }];
    
    updateDashboard();
    
    expect(document.getElementById('balance').textContent).toBe('1600.00');
  });

  test('should remove entry correctly', () => {
    entries = [{ description: 'Test', amount: 100, type: 'receita' }];
    removeEntry(0);
    
    expect(entries).toHaveLength(0);
  });

  test('should remove investment correctly', () => {
    investments = [{ name: 'Stock', amount: 500, current: 600, type: 'acao' }];
    removeInvestment(0);
    
    expect(investments).toHaveLength(0);
  });
});