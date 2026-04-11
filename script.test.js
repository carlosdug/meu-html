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
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock document
global.document = {
  getElementById: jest.fn(),
  addEventListener: jest.fn(),
  createElement: jest.fn(),
  querySelector: jest.fn()
};

// Execute the script in the test environment
eval(scriptContent);

describe('Income and Expense Tracker', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Reset entries
    entries = [];
    localStorage.getItem.mockReturnValue('[]');
  });

  test('should calculate balance correctly', () => {
    entries = [
      { description: 'Salary', amount: 1000, type: 'receita' },
      { description: 'Rent', amount: 500, type: 'despesa' },
      { description: 'Freelance', amount: 200, type: 'receita' }
    ];
    
    // Mock DOM elements
    const balanceElement = { textContent: '' };
    document.getElementById.mockReturnValue(balanceElement);
    document.getElementById.mockReturnValueOnce({ innerHTML: '' }); // entriesDiv
    
    displayEntries();
    
    expect(balanceElement.textContent).toBe('700.00');
  });

  test('should add entry correctly', () => {
    const form = { reset: jest.fn() };
    const event = { preventDefault: jest.fn() };
    
    // Mock form elements
    document.getElementById.mockImplementation((id) => {
      if (id === 'description') return { value: 'Test Entry' };
      if (id === 'amount') return { value: '100' };
      if (id === 'type') return { value: 'receita' };
      if (id === 'entryForm') return form;
      return {};
    });
    
    // Trigger form submit
    const submitHandler = document.addEventListener.mock.calls.find(call => call[0] === 'submit')[1];
    submitHandler(event);
    
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({ description: 'Test Entry', amount: 100, type: 'receita' });
    expect(localStorage.setItem).toHaveBeenCalledWith('entries', JSON.stringify(entries));
    expect(form.reset).toHaveBeenCalled();
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