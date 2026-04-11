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

// Mock document elements
const mockEntriesDiv = { innerHTML: '' };
const mockBalanceElement = { textContent: '' };
const mockForm = { addEventListener: jest.fn(), reset: jest.fn() };

global.document = {
  getElementById: jest.fn((id) => {
    if (id === 'entries') return mockEntriesDiv;
    if (id === 'balance') return mockBalanceElement;
    if (id === 'entryForm') return mockForm;
    if (id === 'description') return { value: '' };
    if (id === 'amount') return { value: '' };
    if (id === 'type') return { value: 'receita' };
    return null;
  }),
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
    mockEntriesDiv.innerHTML = '';
    mockBalanceElement.textContent = '';
  });

  test('should calculate balance correctly', () => {
    entries = [
      { description: 'Salary', amount: 1000, type: 'receita' },
      { description: 'Rent', amount: 500, type: 'despesa' },
      { description: 'Freelance', amount: 200, type: 'receita' }
    ];
    
    displayEntries();
    
    expect(mockBalanceElement.textContent).toBe('700.00');
  });

  test('should add entry correctly', () => {
    // Mock form values
    document.getElementById.mockImplementation((id) => {
      if (id === 'description') return { value: 'Test Entry' };
      if (id === 'amount') return { value: '100' };
      if (id === 'type') return { value: 'receita' };
      if (id === 'entryForm') return mockForm;
      if (id === 'entries') return mockEntriesDiv;
      if (id === 'balance') return mockBalanceElement;
      return null;
    });
    
    const event = { preventDefault: jest.fn() };
    
    // Get the submit handler
    const submitHandler = mockForm.addEventListener.mock.calls.find(call => call[0] === 'submit')[1];
    submitHandler(event);
    
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({ description: 'Test Entry', amount: 100, type: 'receita' });
    expect(localStorage.setItem).toHaveBeenCalledWith('entries', JSON.stringify(entries));
    expect(mockForm.reset).toHaveBeenCalled();
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