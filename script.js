class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.history = [];
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }
    
    addToHistory(entry) {
        this.history.push(entry);
        this.updateHistoryDisplay();
    }
    
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyContainer = document.querySelector('.history-container');
        if (!historyContainer) return;
        
        const historyList = historyContainer.querySelector('.history-list');
        historyList.innerHTML = '';
        
        // Display history entries in reverse order (newest first)
        for (let i = this.history.length - 1; i >= 0; i--) {
            const entry = this.history[i];
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                <span>${entry.firstOperand} ${entry.operation} ${entry.secondOperand} = ${this.getDisplayNumber(entry.result)}</span>
            `;
            historyList.appendChild(historyItem);
        }
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Create history entry
        const historyEntry = {
            firstOperand: this.getDisplayNumber(prev),
            operation: this.operation,
            secondOperand: this.getDisplayNumber(current),
            result: this.roundResult(computation)
        };
        this.addToHistory(historyEntry);
        
        this.currentOperand = this.roundResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
    }

    roundResult(number) {
        // Handle potential floating point issues
        return Math.round(number * 1000000) / 1000000;
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    
    // Check for saved theme preference or use default dark theme
    const savedTheme = localStorage.getItem('calculator-theme') || 'dark-theme';
    root.className = savedTheme;
    themeToggleBtn.innerText = savedTheme === 'dark-theme' ? '🌙' : '☀️';
    
    // Toggle theme when button is clicked
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = root.className;
        const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
        
        root.className = newTheme;
        themeToggleBtn.innerText = newTheme === 'dark-theme' ? '🌙' : '☀️';
        
        // Save theme preference
        localStorage.setItem('calculator-theme', newTheme);
    });
    
    // Clear history button functionality
    const clearHistoryButton = document.querySelector('.clear-history');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            calculator.clearHistory();
        });
    }
    const previousOperandTextElement = document.querySelector('.previous-operand');
    const currentOperandTextElement = document.querySelector('.current-operand');
    const numberButtons = document.querySelectorAll('.number');
    const operationButtons = document.querySelectorAll('.operator');
    const equalsButton = document.querySelector('.equals');
    const deleteButton = document.querySelector('.delete');
    const clearButton = document.querySelector('.clear');

    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.innerText);
            calculator.updateDisplay();
        });
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
        });
    });

    equalsButton.addEventListener('click', () => {
        calculator.compute();
        calculator.updateDisplay();
    });

    clearButton.addEventListener('click', () => {
        calculator.clear();
        calculator.updateDisplay();
    });

    deleteButton.addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });

    // Add keyboard support
    document.addEventListener('keydown', event => {
        if (/[0-9]/.test(event.key)) {
            calculator.appendNumber(event.key);
            calculator.updateDisplay();
        } else if (event.key === '.') {
            calculator.appendNumber(event.key);
            calculator.updateDisplay();
        } else if (event.key === '+' || event.key === '-') {
            calculator.chooseOperation(event.key);
            calculator.updateDisplay();
        } else if (event.key === '*') {
            calculator.chooseOperation('×');
            calculator.updateDisplay();
        } else if (event.key === '/') {
            calculator.chooseOperation('÷');
            calculator.updateDisplay();
        } else if (event.key === 'Enter' || event.key === '=') {
            event.preventDefault();
            calculator.compute();
            calculator.updateDisplay();
        } else if (event.key === 'Backspace') {
            calculator.delete();
            calculator.updateDisplay();
        } else if (event.key === 'Escape') {
            calculator.clear();
            calculator.updateDisplay();
        }
    });

    // Initialize calculator display
    calculator.clear();
    calculator.updateDisplay();
});