import React, { useState, useEffect } from 'react';
import './Calculator.css';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [history, setHistory] = useState([]);
  const [angleMode, setAngleMode] = useState('DEG'); // DEG, RAD, GRAD

  // Handle button press
  const handleButtonPress = (value) => {
    if (value === 'SHIFT') {
      setIsShift(!isShift);
      return;
    }
    
    if (value === 'ALPHA') {
      setIsAlpha(!isAlpha);
      return;
    }

    if (value === 'AC') {
      setDisplay('0');
      setExpression('');
      return;
    }

    if (value === 'DEL') {
      if (display.length === 1) {
        setDisplay('0');
      } else {
        setDisplay(display.slice(0, -1));
      }
      return;
    }

    if (value === '=') {
      try {
        // Replace display symbols with actual operators
        let calcExpression = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, Math.PI.toString())
          .replace(/e/g, Math.E.toString())
          .replace(/√\(/g, 'sqrt(')
          .replace(/√/g, 'Math.sqrt(')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sin⁻¹\(/g, 'asin(')
          .replace(/cos⁻¹\(/g, 'acos(')
          .replace(/tan⁻¹\(/g, 'atan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/mod/g, '%')
          .replace(/Ans/g, expression)
          .replace(/x⁻¹/g, '**(-1)')
          .replace(/x²/g, '**2')
          .replace(/x³/g, '**3');

        // Handle trigonometric functions with angle mode conversion
        calcExpression = convertTrigExpressions(calcExpression);

        // Close any open parentheses
        const openParens = (calcExpression.match(/\(/g) || []).length;
        const closeParens = (calcExpression.match(/\)/g) || []).length;
        if (openParens > closeParens) {
          calcExpression += ')'.repeat(openParens - closeParens);
        }

        // Handle factorial
        calcExpression = calcExpression.replace(/(\d+(\.\d+)?)!/g, (match, num) => {
          return `factorial(${num})`;
        });

        // Handle rank (nPr) and combination (nCr)
        calcExpression = calcExpression.replace(/(\d+)nPr(\d+)/g, (match, n, r) => {
          return `permutation(${n}, ${r})`;
        });
        
        calcExpression = calcExpression.replace(/(\d+)nCr(\d+)/g, (match, n, r) => {
          return `combination(${n}, ${r})`;
        });

        // Evaluate the expression
        const result = evaluateExpression(calcExpression);
        const roundedResult = Math.round(result * 100000000) / 100000000;
        
        // Add to history
        setHistory(prev => [...prev.slice(-4), `${display} = ${roundedResult}`]);
        
        setDisplay(roundedResult.toString());
        setExpression(roundedResult.toString());
      } catch (error) {
        console.log(error);
        setDisplay('Error');
        setTimeout(() => setDisplay('0'), 1000);
      }
      return;
    }

    if (value === 'M+') {
      const currentValue = parseFloat(display) || 0;
      setMemory(memory + currentValue);
      return;
    }

    if (value === 'M-') {
      const currentValue = parseFloat(display) || 0;
      setMemory(memory - currentValue);
      return;
    }

    if (value === 'MR') {
      setDisplay(memory.toString());
      return;
    }

    if (value === 'MC') {
      setMemory(0);
      return;
    }

    if (value === 'Ans') {
      setDisplay(expression);
      return;
    }

    if (value === '(-)') {
      if (display.startsWith('-')) {
        setDisplay(display.slice(1));
      } else {
        setDisplay('-' + display);
      }
      return;
    }

    if (value === 'MOD') {
      setDisplay(display === '0' ? 'mod' : display + 'mod');
      return;
    }

    if (value === 'RANK') {
      setDisplay(display === '0' ? '' : display + 'nPr');
      return;
    }

    if (value === 'COMB') {
      setDisplay(display === '0' ? '' : display + 'nCr');
      return;
    }

    // Handle shift-modified trigonometric functions
    if (value === 'sin⁻¹') {
      setDisplay(display === '0' ? 'sin⁻¹(' : display + 'sin⁻¹(');
      return;
    }

    if (value === 'cos⁻¹') {
      setDisplay(display === '0' ? 'cos⁻¹(' : display + 'cos⁻¹(');
      return;
    }

    if (value === 'tan⁻¹') {
      setDisplay(display === '0' ? 'tan⁻¹(' : display + 'tan⁻¹(');
      return;
    }

    // Handle parentheses
    if (value === '(' || value === ')') {
      setDisplay(display === '0' ? value : display + value);
      return;
    }

    // Handle numbers and operators
    if (display === '0' && !isNaN(value) && value !== '0') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  // Helper functions for mathematical operations
  const factorial = (n) => {
    if (n < 0) throw new Error('Factorial of negative number');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const permutation = (n, r) => {
    if (n < r) throw new Error('n must be >= r');
    return factorial(n) / factorial(n - r);
  };

  const combination = (n, r) => {
    if (n < r) throw new Error('n must be >= r');
    return permutation(n, r) / factorial(r);
  };

  // Convert angle based on current mode
  const toRadians = (angle) => {
    switch (angleMode) {
      case 'DEG':
        return (angle * Math.PI) / 180;
      case 'GRAD':
        return (angle * Math.PI) / 200;
      case 'RAD':
      default:
        return angle;
    }
  };

  const fromRadians = (radians) => {
    switch (angleMode) {
      case 'DEG':
        return (radians * 180) / Math.PI;
      case 'GRAD':
        return (radians * 200) / Math.PI;
      case 'RAD':
      default:
        return radians;
    }
  };

  // Convert trigonometric expressions
  const convertTrigExpressions = (expr) => {
    // Convert sin, cos, tan
    expr = expr.replace(/Math\.sin\(([^)]+)\)/g, (match, angle) => {
      return `Math.sin(${toRadians(parseFloat(angle))})`;
    });
    
    expr = expr.replace(/Math\.cos\(([^)]+)\)/g, (match, angle) => {
      return `Math.cos(${toRadians(parseFloat(angle))})`;
    });
    
    expr = expr.replace(/Math\.tan\(([^)]+)\)/g, (match, angle) => {
      return `Math.tan(${toRadians(parseFloat(angle))})`;
    });

    // Convert inverse trigonometric functions
    expr = expr.replace(/asin\(([^)]+)\)/g, (match, value) => {
      const result = Math.asin(parseFloat(value));
      return fromRadians(result).toString();
    });
    
    expr = expr.replace(/acos\(([^)]+)\)/g, (match, value) => {
      const result = Math.acos(parseFloat(value));
      return fromRadians(result).toString();
    });
    
    expr = expr.replace(/atan\(([^)]+)\)/g, (match, value) => {
      const result = Math.atan(parseFloat(value));
      return fromRadians(result).toString();
    });

    return expr;
  };

  // Main evaluation function
  const evaluateExpression = (expr) => {
    // Define helper functions in scope
    const factorial = (n) => {
      n = Math.floor(Math.abs(n));
      if (n < 0) throw new Error('Factorial of negative number');
      if (n === 0 || n === 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    };

    const permutation = (n, r) => {
      n = Math.floor(n);
      r = Math.floor(r);
      if (n < r) throw new Error('n must be >= r');
      return factorial(n) / factorial(n - r);
    };

    const combination = (n, r) => {
      n = Math.floor(n);
      r = Math.floor(r);
      if (n < r) throw new Error('n must be >= r');
      return permutation(n, r) / factorial(r);
    };

    // Evaluate with all functions in scope
    return Function(
      '"use strict";' +
      'const factorial = ' + factorial.toString() + ';' +
      'const permutation = ' + permutation.toString() + ';' +
      'const combination = ' + combination.toString() + ';' +
      'return ' + expr
    )();
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      
      // Toggle shift with Shift key
      if (key === 'Shift') {
        setIsShift(true);
      }
      
      // Number keys
      if (key >= '0' && key <= '9') {
        handleButtonPress(key);
      }
      
      // Operators
      if (key === '+') handleButtonPress('+');
      if (key === '-') handleButtonPress('-');
      if (key === '*') handleButtonPress('×');
      if (key === '/') handleButtonPress('÷');
      if (key === '.') handleButtonPress('.');
      if (key === '%') handleButtonPress('MOD');
      if (key === 'Enter' || key === '=') handleButtonPress('=');
      if (key === 'Escape') handleButtonPress('AC');
      if (key === 'Backspace') handleButtonPress('DEL');
      if (key === '(') handleButtonPress('(');
      if (key === ')') handleButtonPress(')');
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShift(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [display, isShift]);

  // Update button labels based on shift state
  const getButtonValue = (button) => {
    if (isShift && button.shiftValue) {
      return button.shiftValue;
    }
    if (isAlpha && button.alphaValue) {
      return button.alphaValue;
    }
    return button.value;
  };

  const getButtonLabel = (button) => {
    if (isShift && button.shiftLabel) {
      return button.shiftLabel;
    }
    if (isAlpha && button.alphaLabel) {
      return button.alphaLabel;
    }
    return button.label;
  };

  // Calculator buttons configuration with shift and alpha alternatives
  const buttons = [
    // First row
    { 
      label: 'SHIFT', 
      value: 'SHIFT', 
      className: 'func shift', 
      color: 'blue' 
    },
    { 
      label: 'ALPHA', 
      value: 'ALPHA', 
      className: 'func alpha', 
      color: 'red' 
    },
    { 
      label: '√', 
      shiftLabel: '³√',
      value: '√(', 
      shiftValue: '³√(',
      className: 'func' 
    },
    { 
      label: 'x²', 
      shiftLabel: 'xʸ',
      value: '²', 
      shiftValue: '^',
      className: 'func' 
    },
    { 
      label: 'x³', 
      shiftLabel: 'y√x',
      value: '³', 
      shiftValue: 'y√',
      className: 'func' 
    },
    { 
      label: 'log', 
      shiftLabel: '10ˣ',
      value: 'log(', 
      shiftValue: '10**',
      className: 'func' 
    },
    { 
      label: 'ln', 
      shiftLabel: 'eˣ',
      value: 'ln(', 
      shiftValue: 'Math.exp(',
      className: 'func' 
    },
    { 
      label: 'sin', 
      shiftLabel: 'sin⁻¹',
      value: 'sin(', 
      shiftValue: 'sin⁻¹',
      className: 'func' 
    },
    { 
      label: 'cos', 
      shiftLabel: 'cos⁻¹',
      value: 'cos(', 
      shiftValue: 'cos⁻¹',
      className: 'func' 
    },
    { 
      label: 'tan', 
      shiftLabel: 'tan⁻¹',
      value: 'tan(', 
      shiftValue: 'tan⁻¹',
      className: 'func' 
    },
    { 
      label: '(-)', 
      shiftLabel: 'Rnd',
      value: '(-)', 
      shiftValue: 'Math.round(',
      className: 'func' 
    },
    { 
      label: 'M+', 
      shiftLabel: 'M-',
      value: 'M+', 
      shiftValue: 'M-',
      className: 'func' 
    },
    
    // Second row
    { 
      label: 'MODE', 
      value: 'MODE', 
      className: 'func', 
      onClick: () => {
        const modes = ['DEG', 'RAD', 'GRAD'];
        const currentIndex = modes.indexOf(angleMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setAngleMode(modes[nextIndex]);
      }
    },
    { 
      label: 'SETUP', 
      value: 'SETUP', 
      className: 'func', 
      disabled: true 
    },
    { 
      label: 'ON', 
      value: 'ON', 
      className: 'func power',
      onClick: () => {
        // Reset calculator
        setDisplay('0');
        setExpression('');
        setIsShift(false);
        setIsAlpha(false);
      }
    },
    { 
      label: 'Abs', 
      value: 'Math.abs(', 
      className: 'func' 
    },
    { 
      label: 'x!', 
      value: '!', 
      className: 'func' 
    },
    { 
      label: 'nPr', 
      shiftLabel: 'nCr',
      value: 'RANK', 
      shiftValue: 'COMB',
      className: 'func' 
    },
    { 
      label: 'nCr', 
      shiftLabel: 'RANK',
      value: 'COMB', 
      shiftValue: 'RANK',
      className: 'func' 
    },
    { 
      label: 'Pol', 
      value: 'Pol(', 
      className: 'func' 
    },
    { 
      label: 'Rec', 
      value: 'Rec(', 
      className: 'func' 
    },
    { 
      label: '%', 
      shiftLabel: 'mod',
      value: '%', 
      shiftValue: 'MOD',
      className: 'func' 
    },
    { 
      label: 'RCL', 
      value: 'MR', 
      className: 'func' 
    },
    { 
      label: 'ENG', 
      value: 'ENG', 
      className: 'func', 
      disabled: true 
    },
    
    // Third row
    { label: '(', value: '(', className: 'normal' },
    { label: ')', value: ')', className: 'normal' },
    { label: ',', value: ',', className: 'normal' },
    { 
      label: 'S⇔D', 
      value: 'S⇔D', 
      className: 'func', 
      onClick: () => {
        // Convert between fraction and decimal
        const num = parseFloat(display);
        if (!isNaN(num)) {
          // Simple fraction approximation
          const tolerance = 1.0E-6;
          let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
          let b = num;
          do {
            const a = Math.floor(b);
            let aux = h1;
            h1 = a * h1 + h2;
            h2 = aux;
            aux = k1;
            k1 = a * k1 + k2;
            k2 = aux;
            b = 1 / (b - a);
          } while (Math.abs(num - h1/k1) > num * tolerance);
          
          if (k1 === 1) {
            setDisplay(num.toString());
          } else {
            setDisplay(`${h1}/${k1}`);
          }
        }
      }
    },
    { label: 'M-', value: 'M-', className: 'func' },
    { label: '7', value: '7', className: 'number' },
    { label: '8', value: '8', className: 'number' },
    { label: '9', value: '9', className: 'number' },
    { label: 'DEL', value: 'DEL', className: 'func del' },
    { label: 'AC', value: 'AC', className: 'func ac' },
    
    // Fourth row
    { label: 'Ran#', value: 'Math.random()', className: 'func' },
    { label: 'RanInt', value: 'RanInt', className: 'func', disabled: true },
    { label: 'π', value: 'π', className: 'func' },
    { label: 'e', value: Math.E.toString(), className: 'func' },
    { 
      label: angleMode, 
      value: 'DRG>', 
      className: 'func',
      onClick: () => {
        const modes = ['DEG', 'RAD', 'GRAD'];
        const currentIndex = modes.indexOf(angleMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setAngleMode(modes[nextIndex]);
      }
    },
    { label: '4', value: '4', className: 'number' },
    { label: '5', value: '5', className: 'number' },
    { label: '6', value: '6', className: 'number' },
    { label: '×', value: '×', className: 'operator' },
    { label: '÷', value: '÷', className: 'operator' },
    
    // Fifth row
    { label: 'STAT', value: 'STAT', className: 'func stat', disabled: true },
    { label: 'Rnd', value: 'Math.round(', className: 'func' },
    { label: '10^x', value: '10**', className: 'func' },
    { label: 'e^x', value: 'Math.exp(', className: 'func' },
    { label: 'Ans', value: 'Ans', className: 'func' },
    { label: '1', value: '1', className: 'number' },
    { label: '2', value: '2', className: 'number' },
    { label: '3', value: '3', className: 'number' },
    { label: '+', value: '+', className: 'operator' },
    { label: '-', value: '-', className: 'operator' },
    
    // Sixth row
    { label: 'CLR', value: 'CLR', className: 'func', disabled: true },
    { label: 'INS', value: 'INS', className: 'func', disabled: true },
    { label: 'OFF', value: 'OFF', className: 'func', disabled: true },
    { 
      label: 'x⁻¹', 
      value: '**(-1)', 
      className: 'func' 
    },
    { label: 'STO', value: 'MC', className: 'func' },
    { label: '0', value: '0', className: 'number zero' },
    { label: '.', value: '.', className: 'number' },
    { 
      label: '×10^x', 
      value: 'e', 
      className: 'func',
      onClick: () => {
        // Scientific notation
        const num = parseFloat(display);
        if (!isNaN(num)) {
          setDisplay(num.toExponential());
        }
      }
    },
    { label: '=', value: '=', className: 'operator equals' },
  ];

  return (
    <div className="calculator-container">
      <div className="calculator">
        {/* Display */}
        <div className="calculator-display">
          <div className="memory-indicator">
            {memory !== 0 && 'M'}
          </div>
          <div className="shift-indicator">
            {isShift && 'SHIFT'}
            {isAlpha && 'ALPHA'}
            <span className="angle-mode"> {angleMode}</span>
          </div>
          <div className="display-text">{display}</div>
        </div>

        {/* Example calculation */}
        <div className="example-calculation">
          Try: 5 mod 2 = 1, sin(30) = 0.5, 5 nPr 2 = 20
        </div>

        {/* Keyboard */}
        <div className="calculator-keyboard">
          {buttons.map((btn, index) => (
            <button
              key={index}
              className={`calculator-btn ${btn.className} ${isShift ? 'shift-active' : ''} ${isAlpha ? 'alpha-active' : ''}`}
              onClick={() => {
                if (btn.onClick) {
                  btn.onClick();
                } else {
                  handleButtonPress(getButtonValue(btn));
                }
              }}
              disabled={btn.disabled}
              style={btn.color ? { backgroundColor: btn.color, color: 'white' } : {}}
            >
              {getButtonLabel(btn)}
            </button>
          ))}
        </div>

        {/* Memory and History */}
        <div className="calculator-footer">
          <div className="memory-display">
            Memory: {memory} | Angle Mode: {angleMode}
          </div>
          <div className="history">
            {history.map((item, idx) => (
              <div key={idx} className="history-item">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;