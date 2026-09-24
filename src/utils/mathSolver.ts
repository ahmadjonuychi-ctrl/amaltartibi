import { MathSolution, MathStep, Token, OrderMarker, Rational } from '../types';

/**
 * Normalizes symbols into standard math typography:
 * * -> ×
 * / -> ÷ (or fraction slash)
 * : -> ÷
 * ⁄ -> ÷ (fraction slash)
 * - -> −
 * sqrt(...) -> √( ... )
 * cbrt(...) -> 3√( ... )
 */
export function normalizeMathExpression(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/cbrt/gi, '3√')
    .replace(/sqrt/gi, '√')
    .replace(/\*/g, '×')
    .replace(/[\/⁄]/g, '÷')
    .replace(/:/g, '÷')
    .replace(/-/g, '−')
    .trim();
}

/**
 * Greatest common divisor for simplifying fractions
 */
export function gcd(a: number, b: number): number {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

/**
 * Simplifies a rational fraction
 */
export function simplifyRational(r: Rational): Rational {
  let num = Math.round(r.num);
  let den = Math.round(r.den);

  if (den === 0) {
    return { num: 0, den: 1 };
  }

  if (den < 0) {
    num = -num;
    den = -den;
  }

  if (num === 0) {
    return { num: 0, den: 1 };
  }

  const common = gcd(num, den);
  return {
    num: num / common,
    den: den / common,
  };
}

/**
 * Converts a floating point number to an exact rational representation
 */
export function floatToRational(val: number): Rational {
  if (Number.isInteger(val)) {
    return { num: val, den: 1 };
  }

  const str = String(val);
  if (!str.includes('e') && !str.includes('E')) {
    const parts = str.split('.');
    if (parts.length === 2) {
      const decLen = parts[1].length;
      if (decLen <= 9) {
        const factor = Math.pow(10, decLen);
        const intPart = Math.round(val * factor);
        return simplifyRational({ num: intPart, den: factor });
      }
    }
  }

  // Continued fraction approximation for standard float
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = val;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(val - h1 / k1) > Math.abs(val) * 1.0e-11 && k1 < 1000000);

  return simplifyRational({ num: h1, den: k1 });
}

/**
 * Converts a periodic decimal string like:
 * - "0.(3)" -> { num: 1, den: 3 }
 * - "0.(6)" -> { num: 2, den: 3 }
 * - "0.1(6)" -> { num: 1, den: 6 }
 * - "1.(3)" -> { num: 4, den: 3 }
 * - "0.(12)" -> { num: 4, den: 33 }
 * Formula for a.b(c):
 * integer part: a
 * non-periodic part: b (length n)
 * periodic part: c (length m)
 * numerator = [b concatenated with c] - [b]
 * denominator = [m times '9'] followed by [n times '0']
 */
export function parsePeriodicDecimal(
  str: string
): { rational: Rational; numValue: number; displayStr: string; fractionStr: string } | null {
  const match = str.match(/^(−|-)?(\d+)[.,](\d*)\((\d+)\)$/);
  if (!match) return null;

  const isNeg = match[1] === '-' || match[1] === '−';
  const intPart = parseInt(match[2], 10);
  const nonPeriodicStr = match[3] || '';
  const periodicStr = match[4];

  const m = periodicStr.length; // number of 9s
  const n = nonPeriodicStr.length; // number of 0s

  const denom = parseInt('9'.repeat(m) + '0'.repeat(n), 10);

  const fullPartNum = parseInt(nonPeriodicStr + periodicStr, 10);
  const nonPartNum = nonPeriodicStr ? parseInt(nonPeriodicStr, 10) : 0;
  const numDiff = fullPartNum - nonPartNum;

  let totalNumerator = intPart * denom + numDiff;
  const totalDenominator = denom;

  if (isNeg) {
    totalNumerator = -totalNumerator;
  }

  const rat = simplifyRational({ num: totalNumerator, den: totalDenominator });
  const fracStr = `${rat.num}/${rat.den}`;
  const floatVal = rat.num / rat.den;

  return {
    rational: rat,
    numValue: floatVal,
    displayStr: str,
    fractionStr: fracStr,
  };
}

/**
 * Converts a Rational number into its EXACT decimal or periodic decimal representation:
 * e.g.:
 * - 1/3 -> "0.(3)"
 * - 2/3 -> "0.(6)"
 * - 1/6 -> "0.1(6)"
 * - 5/6 -> "0.8(3)"
 * - 10/3 -> "3.(3)"
 * - 7/12 -> "0.58(3)"
 * - 1/7 -> "0.(142857)"
 * - 1/2 -> "0.5"
 * - 3/4 -> "0.75"
 * - 6/2 -> "3"
 * Never produces an approximate answer like 0.333!
 */
export function rationalToDecimalOrPeriodic(r: Rational): {
  isPeriodic: boolean;
  display: string;
} {
  const simp = simplifyRational(r);
  let num = simp.num;
  const den = simp.den;
  const isNeg = num < 0;
  num = Math.abs(num);

  const intPart = Math.floor(num / den);
  let rem = num % den;

  if (rem === 0) {
    return {
      isPeriodic: false,
      display: `${isNeg ? '−' : ''}${intPart}`,
    };
  }

  // Determine if terminating or periodic:
  // Terminating if and only if denominator has no prime factors other than 2 and 5
  let testDen = den;
  while (testDen % 2 === 0) testDen /= 2;
  while (testDen % 5 === 0) testDen /= 5;
  const isTerminating = testDen === 1;

  if (isTerminating) {
    const digits: number[] = [];
    while (rem !== 0 && digits.length < 20) {
      rem *= 10;
      digits.push(Math.floor(rem / den));
      rem %= den;
    }
    return {
      isPeriodic: false,
      display: `${isNeg ? '−' : ''}${intPart}.${digits.join('')}`,
    };
  }

  // Periodic decimal: long division detecting repeat
  const seenRemainders = new Map<number, number>();
  const digits: number[] = [];
  let periodStart = -1;

  while (rem !== 0) {
    if (seenRemainders.has(rem)) {
      periodStart = seenRemainders.get(rem)!;
      break;
    }
    seenRemainders.set(rem, digits.length);
    rem *= 10;
    digits.push(Math.floor(rem / den));
    rem %= den;

    if (digits.length > 50) {
      break;
    }
  }

  if (periodStart !== -1) {
    const nonPeriodicPart = digits.slice(0, periodStart).join('');
    const periodicPart = digits.slice(periodStart).join('');
    const signStr = isNeg ? '−' : '';
    const formatted = nonPeriodicPart
      ? `${signStr}${intPart}.${nonPeriodicPart}(${periodicPart})`
      : `${signStr}${intPart}.(${periodicPart})`;
    return {
      isPeriodic: true,
      display: formatted,
    };
  }

  // Fallback
  const floatVal = simp.num / simp.den;
  return {
    isPeriodic: false,
    display: `${cleanNumber(floatVal)}`,
  };
}

/**
 * Rational Arithmetic Helpers
 */
export function addRational(a: Rational, b: Rational): Rational {
  return simplifyRational({
    num: a.num * b.den + b.num * a.den,
    den: a.den * b.den,
  });
}

export function subRational(a: Rational, b: Rational): Rational {
  return simplifyRational({
    num: a.num * b.den - b.num * a.den,
    den: a.den * b.den,
  });
}

export function mulRational(a: Rational, b: Rational): Rational {
  return simplifyRational({
    num: a.num * b.num,
    den: a.den * b.den,
  });
}

export function divRational(a: Rational, b: Rational): Rational {
  if (b.num === 0) return { num: 0, den: 1 };
  return simplifyRational({
    num: a.num * b.den,
    den: a.den * b.num,
  });
}

export function powRational(a: Rational, b: Rational): Rational | null {
  if (b.den === 1) {
    if (b.num >= 0 && b.num <= 15) {
      return simplifyRational({
        num: Math.pow(a.num, b.num),
        den: Math.pow(a.den, b.num),
      });
    }
    if (b.num < 0 && b.num >= -15) {
      return simplifyRational({
        num: Math.pow(a.den, -b.num),
        den: Math.pow(a.num, -b.num),
      });
    }
  }
  return null;
}

export function rootRational(a: Rational, degree: number): Rational | null {
  if (degree === 2) {
    if (a.num >= 0 && a.den > 0) {
      const sqrtNum = Math.round(Math.sqrt(a.num));
      const sqrtDen = Math.round(Math.sqrt(a.den));
      if (sqrtNum * sqrtNum === a.num && sqrtDen * sqrtDen === a.den) {
        return simplifyRational({ num: sqrtNum, den: sqrtDen });
      }
    }
  } else if (degree === 3) {
    const sgnNum = Math.sign(a.num);
    const absNum = Math.abs(a.num);
    const cbrtNum = Math.round(Math.cbrt(absNum));
    const cbrtDen = Math.round(Math.cbrt(a.den));
    if (cbrtNum * cbrtNum * cbrtNum === absNum && cbrtDen * cbrtDen * cbrtDen === a.den) {
      return simplifyRational({ num: sgnNum * cbrtNum, den: cbrtDen });
    }
  } else if (degree === 4) {
    if (a.num >= 0 && a.den > 0) {
      const rNum = Math.round(Math.pow(a.num, 0.25));
      const rDen = Math.round(Math.pow(a.den, 0.25));
      if (Math.pow(rNum, 4) === a.num && Math.pow(rDen, 4) === a.den) {
        return simplifyRational({ num: rNum, den: rDen });
      }
    }
  }
  return null;
}

/**
 * Tokenizes a sanitized mathematical expression including:
 * - square roots (√)
 * - higher-degree roots (3√, 4√, 5√, n√)
 * - exponents / powers (^)
 * - periodic decimals like 0.(3), 1.(6), 0.1(6)
 * - parentheses and arithmetic (+, −, ×, ÷)
 */
export function tokenize(expr: string): Token[] {
  const normalized = normalizeMathExpression(expr);
  const tokens: Token[] = [];
  let i = 0;
  let tokenId = 1;

  while (i < normalized.length) {
    const ch = normalized[i];

    if (ch === ' ') {
      i++;
      continue;
    }

    // Check for periodic decimal e.g. 0.(3), 1.(6), 2.1(6), etc.
    const remainingForPeriodic = normalized.slice(i);
    const periodicMatch = remainingForPeriodic.match(/^(−|-)?\d+[.,]\d*\(\d+\)/);
    if (periodicMatch) {
      const matchStr = periodicMatch[0];
      const parsed = parsePeriodicDecimal(matchStr);
      if (parsed) {
        tokens.push({
          id: `tok_${tokenId++}`,
          type: 'number',
          value: parsed.displayStr,
          numValue: parsed.numValue,
          rational: parsed.rational,
        });
        i += matchStr.length;
        continue;
      }
    }

    // Check for higher-degree root: e.g. 3√, 4√, 5√ etc.
    const remaining = normalized.slice(i);
    const nthRootMatch = remaining.match(/^([0-9]+)√/);
    if (nthRootMatch) {
      const degree = parseInt(nthRootMatch[1], 10);
      tokens.push({
        id: `tok_${tokenId++}`,
        type: 'function',
        value: `${degree}√`,
        fnName: 'nthroot',
        rootDegree: degree,
      });
      i += nthRootMatch[0].length;
      continue;
    }

    // Standard square root √
    if (ch === '√') {
      tokens.push({
        id: `tok_${tokenId++}`,
        type: 'function',
        value: '√',
        fnName: 'sqrt',
        rootDegree: 2,
      });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ id: `tok_${tokenId++}`, type: 'open_paren', value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ id: `tok_${tokenId++}`, type: 'close_paren', value: ')' });
      i++;
      continue;
    }

    // Exponentiation operator ^
    if (ch === '^') {
      tokens.push({ id: `tok_${tokenId++}`, type: 'operator', value: '^' });
      i++;
      continue;
    }

    // Binary operators +, −, ×, ÷
    if (ch === '+' || ch === '−' || ch === '×' || ch === '÷') {
      // Check if this is a unary minus
      const prevToken = tokens[tokens.length - 1];
      const isUnary =
        ch === '−' &&
        (!prevToken ||
          prevToken.type === 'operator' ||
          prevToken.type === 'open_paren' ||
          prevToken.type === 'function');

      if (isUnary) {
        const subRemaining = normalized.slice(i);
        const periodicSubMatch = subRemaining.match(/^[−-]\d+[.,]\d*\(\d+\)/);
        if (periodicSubMatch) {
          const matchStr = periodicSubMatch[0];
          const parsed = parsePeriodicDecimal(matchStr);
          if (parsed) {
            tokens.push({
              id: `tok_${tokenId++}`,
              type: 'number',
              value: parsed.displayStr,
              numValue: parsed.numValue,
              rational: parsed.rational,
            });
            i += matchStr.length;
            continue;
          }
        }

        i++;
        let numStr = '-';
        while (i < normalized.length && /[0-9.]/.test(normalized[i])) {
          numStr += normalized[i];
          i++;
        }
        const val = parseFloat(numStr);
        tokens.push({
          id: `tok_${tokenId++}`,
          type: 'number',
          value: numStr.replace('-', '−'),
          numValue: isNaN(val) ? 0 : val,
          rational: isNaN(val) ? { num: 0, den: 1 } : floatToRational(val),
        });
        continue;
      }

      tokens.push({ id: `tok_${tokenId++}`, type: 'operator', value: ch });
      i++;
      continue;
    }

    // Regular Numbers (integers or decimals)
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < normalized.length && /[0-9.]/.test(normalized[i])) {
        numStr += normalized[i];
        i++;
      }
      const val = parseFloat(numStr);
      tokens.push({
        id: `tok_${tokenId++}`,
        type: 'number',
        value: numStr,
        numValue: isNaN(val) ? 0 : val,
        rational: isNaN(val) ? { num: 0, den: 1 } : floatToRational(val),
      });
      continue;
    }

    i++;
  }

  return tokens;
}

/**
 * Formats a token list into a readable math string
 */
export function formatTokens(tokens: Token[]): string {
  let result = '';
  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const next = tokens[i + 1];

    result += cur.value;

    if (next) {
      if (cur.type === 'open_paren' || next.type === 'close_paren') {
        // e.g. (6
      } else if (cur.type === 'function') {
        // root attaches close to argument
      } else if (cur.value === '^' || next.value === '^') {
        // power formatting
      } else {
        result += ' ';
      }
    }
  }
  return result;
}

/**
 * Cleans number representation
 */
function cleanNumber(n: number): number {
  const rounded = Math.round((n + Number.EPSILON) * 1000) / 1000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Validates parentheses matching, taking into account periodic decimal notation like 0.(3)
 */
export function validateParentheses(expr: string): boolean {
  const sanitized = expr.replace(/\d+[.,]\d*\(\d+\)/g, 'NUM');
  let depth = 0;
  for (const ch of sanitized) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

interface TrackingToken extends Token {
  originTokenId: string;
}

/**
 * Solves a mathematical expression step-by-step according to rigorous mathematical rules:
 * 1. Functions & Roots & Powers: √x, 3√x, 4√x, a^b
 * 2. Parentheses: ( ... )
 * 3. Multiplication & Division (Fractions): × and ÷ (from left to right)
 * 4. Addition & Subtraction: + and − (from left to right)
 * 
 * If any intermediate result or final answer is a periodic decimal,
 * it is formatted in exact periodic decimal notation (e.g. 0.(3), 1.(6), 0.1(6)),
 * never an approximate rounded float like 0.333!
 */
export function solveStepByStep(inputExpression: string): MathSolution {
  const cleanExpr = normalizeMathExpression(inputExpression);

  if (!validateParentheses(cleanExpr)) {
    return {
      originalExpression: inputExpression,
      cleanExpression: cleanExpr,
      initialTokens: [],
      orderMarkers: [],
      steps: [],
      finalResult: 0,
      finalResultDisplay: '0',
      hasParentheses: false,
      hasMultDiv: false,
      hasAddSub: false,
      isValid: false,
      errorMessage: "Qavslar juftligi to‘g‘ri yopilmagan! Qavslarni tekshiring.",
    };
  }

  const baseTokens = tokenize(cleanExpr);

  if (baseTokens.length === 0) {
    return {
      originalExpression: inputExpression,
      cleanExpression: cleanExpr,
      initialTokens: [],
      orderMarkers: [],
      steps: [],
      finalResult: 0,
      finalResultDisplay: '0',
      hasParentheses: false,
      hasMultDiv: false,
      hasAddSub: false,
      isValid: false,
      errorMessage: "Iltimos, to‘g‘ri matematik ifoda kiriting.",
    };
  }

  // Assign origin tracking to each token
  let currentTokens: TrackingToken[] = baseTokens.map((t) => ({
    ...t,
    originTokenId: t.id,
  }));

  const steps: MathStep[] = [];
  const orderMarkers: OrderMarker[] = [];
  const MAX_STEPS = 60;
  let stepCounter = 1;

  let hasParentheses = currentTokens.some((t) => t.type === 'open_paren');
  let hasMultDiv = currentTokens.some((t) => t.value === '×' || t.value === '÷');
  let hasAddSub = currentTokens.some((t) => t.value === '+' || t.value === '−');

  while (stepCounter <= MAX_STEPS) {
    // 0. Clean redundant single-number parentheses e.g. ( 2 ) -> 2
    let reducedParen = false;
    for (let i = 0; i < currentTokens.length - 2; i++) {
      if (
        currentTokens[i].type === 'open_paren' &&
        currentTokens[i + 1].type === 'number' &&
        currentTokens[i + 2].type === 'close_paren'
      ) {
        const prev = i > 0 ? currentTokens[i - 1] : null;
        if (prev && prev.type === 'function') {
          continue;
        }

        const numToken = currentTokens[i + 1];
        currentTokens = [
          ...currentTokens.slice(0, i),
          numToken,
          ...currentTokens.slice(i + 3),
        ];
        reducedParen = true;
        break;
      }
    }
    if (reducedParen) {
      continue;
    }

    // 1. Check for root functions (square root and higher-degree roots) applied to single numbers:
    let foundFnIdx = -1;
    for (let i = 0; i < currentTokens.length; i++) {
      if (currentTokens[i].type === 'function') {
        // Case A: root ( number )
        if (
          i + 3 < currentTokens.length &&
          currentTokens[i + 1].type === 'open_paren' &&
          currentTokens[i + 2].type === 'number' &&
          currentTokens[i + 3].type === 'close_paren'
        ) {
          foundFnIdx = i;
          break;
        }
        // Case B: root number (e.g. √16 or 3√8)
        if (i + 1 < currentTokens.length && currentTokens[i + 1].type === 'number') {
          foundFnIdx = i;
          break;
        }
      }
    }

    if (foundFnIdx !== -1) {
      const fnToken = currentTokens[foundFnIdx];
      const degree = fnToken.rootDegree ?? (fnToken.fnName === 'sqrt' ? 2 : 3);
      const isParenthesized = currentTokens[foundFnIdx + 1]?.type === 'open_paren';
      const numToken = isParenthesized
        ? currentTokens[foundFnIdx + 2]
        : currentTokens[foundFnIdx + 1];

      const argVal = numToken.numValue ?? 0;
      const argRat = numToken.rational ?? floatToRational(argVal);

      // Attempt exact rational root
      const exactRatRoot = rootRational(argRat, degree);
      let resVal: number;
      let resDisplay: string;
      let resRat: Rational;

      if (exactRatRoot) {
        resRat = exactRatRoot;
        resVal = resRat.num / resRat.den;
        resDisplay = rationalToDecimalOrPeriodic(resRat).display;
      } else {
        resVal = cleanNumber(Math.pow(argVal, 1 / degree));
        resDisplay = String(resVal).replace('-', '−');
        resRat = floatToRational(resVal);
      }

      const beforeTokens: Token[] = currentTokens.map((t) => ({ ...t }));
      const exprBefore = formatTokens(beforeTokens);

      const category = 'POWER_ROOT';
      const fnDisplay = fnToken.value; // e.g. "√", "3√", "4√"

      const subExpr = isParenthesized
        ? `${fnDisplay}(${numToken.value})`
        : `${fnDisplay}${numToken.value}`;

      const eqStr = `${fnDisplay}${isParenthesized ? `(${numToken.value})` : numToken.value} = ${resDisplay}`;

      const replaceLen = isParenthesized ? 4 : 2;
      const highlightIds = currentTokens
        .slice(foundFnIdx, foundFnIdx + replaceLen)
        .map((t) => t.id);

      const resultToken: TrackingToken = {
        id: `res_${stepCounter}`,
        type: 'number',
        value: resDisplay,
        numValue: resVal,
        rational: resRat,
        originTokenId: fnToken.originTokenId,
      };

      orderMarkers.push({
        stepIndex: stepCounter,
        label: `${stepCounter}`,
        tokenId: fnToken.originTokenId,
        category,
      });

      currentTokens = [
        ...currentTokens.slice(0, foundFnIdx),
        resultToken,
        ...currentTokens.slice(foundFnIdx + replaceLen),
      ];

      const afterTokens: Token[] = currentTokens.map((t) => ({ ...t }));
      const exprAfter = formatTokens(afterTokens);

      const categoryTitleUz = degree === 2
        ? 'KVADRAT ILDIZ CHIQARISH AMALI'
        : `${degree}-DARAJALI ILDIZ CHIQARISH AMALI`;

      const categoryBadgeUz = degree === 2 ? 'ILDIZ CHIQARISH' : `${degree}-DARAJALI ILDIZ`;
      const actionNameUz = degree === 2 ? 'ildiz chiqarishni' : `${degree}-darajali ildiz chiqarishni`;

      const pedagogyWhyUz = degree === 2
        ? `Avval kvadrat ildiz chiqarish amali bajariladi: √(${numToken.value}) = ${resDisplay}.`
        : `Avval ${degree}-darajali ildiz chiqarish amali bajariladi: ${fnDisplay}(${numToken.value}) = ${resDisplay}.`;

      const pedagogyRuleUz =
        'Ildiz chiqarish va darajaga oshirish eng yuqori ustuvorlikka ega bo‘lib, ko‘paytirish va qo‘shishdan oldin bajariladi.';

      steps.push({
        id: `step_${stepCounter}`,
        stepIndex: stepCounter,
        totalSteps: 0,
        category,
        categoryTitleUz,
        categoryBadgeUz,
        actionNameUz,
        expressionBefore: exprBefore,
        tokensBefore: beforeTokens,
        activeSubExpression: subExpr,
        operand1: argVal,
        operatorSymbol: fnDisplay,
        result: resVal,
        resultDisplay: resDisplay,
        calculationEquation: eqStr,
        highlightTokenIds: highlightIds,
        expressionAfter: exprAfter,
        tokensAfter: afterTokens,
        pedagogyWhyUz,
        pedagogyRuleUz,
        originalTokenIdAnchor: fnToken.originTokenId,
      });

      stepCounter++;
      continue;
    }

    // 2. Find innermost parenthesis range
    let innerOpenIdx = -1;
    let innerCloseIdx = -1;

    for (let i = 0; i < currentTokens.length; i++) {
      if (currentTokens[i].type === 'open_paren') {
        innerOpenIdx = i;
      } else if (currentTokens[i].type === 'close_paren') {
        innerCloseIdx = i;
        break;
      }
    }

    const isInsideParenthesis = innerOpenIdx !== -1 && innerCloseIdx !== -1;
    const searchStart = isInsideParenthesis ? innerOpenIdx + 1 : 0;
    const searchEnd = isInsideParenthesis ? innerCloseIdx - 1 : currentTokens.length - 1;

    // Inside this scope, determine highest priority operator:
    // A: Exponentiation ^
    let targetOpIdx = -1;
    for (let i = searchStart; i <= searchEnd; i++) {
      if (currentTokens[i].type === 'operator' && currentTokens[i].value === '^') {
        targetOpIdx = i;
        break;
      }
    }

    // B: If no ^, find × or ÷ (left to right)
    if (targetOpIdx === -1) {
      for (let i = searchStart; i <= searchEnd; i++) {
        if (
          currentTokens[i].type === 'operator' &&
          (currentTokens[i].value === '×' || currentTokens[i].value === '÷')
        ) {
          targetOpIdx = i;
          break;
        }
      }
    }

    // C: If no × or ÷, look for + or − (left to right)
    if (targetOpIdx === -1) {
      for (let i = searchStart; i <= searchEnd; i++) {
        if (
          currentTokens[i].type === 'operator' &&
          (currentTokens[i].value === '+' || currentTokens[i].value === '−')
        ) {
          targetOpIdx = i;
          break;
        }
      }
    }

    if (targetOpIdx === -1) {
      break;
    }

    const leftToken = currentTokens[targetOpIdx - 1];
    const opToken = currentTokens[targetOpIdx];
    const rightToken = currentTokens[targetOpIdx + 1];

    if (!leftToken || !rightToken || leftToken.numValue === undefined || rightToken.numValue === undefined) {
      return {
        originalExpression: inputExpression,
        cleanExpression: cleanExpr,
        initialTokens: baseTokens,
        orderMarkers: [],
        steps: [],
        finalResult: 0,
        finalResultDisplay: '0',
        hasParentheses,
        hasMultDiv,
        hasAddSub,
        isValid: false,
        errorMessage: "Matematik belgilar noto‘g‘ri joylashtirilgan. Misolni qayta tekshiring.",
      };
    }

    const op1 = leftToken.numValue;
    const op2 = rightToken.numValue;

    const rat1 = leftToken.rational ?? floatToRational(op1);
    const rat2 = rightToken.rational ?? floatToRational(op2);

    let resRat: Rational | null = null;

    switch (opToken.value) {
      case '+':
        resRat = addRational(rat1, rat2);
        break;
      case '−':
      case '-':
        resRat = subRational(rat1, rat2);
        break;
      case '×':
      case '*':
        resRat = mulRational(rat1, rat2);
        break;
      case '÷':
      case '/':
        resRat = divRational(rat1, rat2);
        break;
      case '^':
        resRat = powRational(rat1, rat2);
        break;
    }

    let resultVal: number;
    let resultDisplay: string;
    let resultRational: Rational;

    if (resRat) {
      resultRational = resRat;
      resultVal = resRat.num / resRat.den;
      resultDisplay = rationalToDecimalOrPeriodic(resRat).display;
    } else {
      // Fallback for non-rational power
      resultVal = cleanNumber(Math.pow(op1, op2));
      resultDisplay = String(resultVal).replace('-', '−');
      resultRational = floatToRational(resultVal);
    }

    let category: 'PARENTHESIS' | 'POWER_ROOT' | 'MULT_DIV' | 'ADD_SUB';
    let categoryTitleUz = '';
    let categoryBadgeUz = '';
    let actionNameUz = '';
    let pedagogyWhyUz = '';
    let pedagogyRuleUz = '';

    const isDirectParenthesisCover =
      isInsideParenthesis &&
      innerOpenIdx === targetOpIdx - 2 &&
      innerCloseIdx === targetOpIdx + 2;

    const op1Display = leftToken.value;
    const op2Display = rightToken.value;

    if (opToken.value === '^') {
      category = 'POWER_ROOT';
      categoryTitleUz = 'DARAJA OSHIRISH AMALI';
      categoryBadgeUz = 'DARAJA OSHIRISH';
      actionNameUz = 'darajaga oshirishni';
      pedagogyWhyUz = `Darajaga oshirish amali (${op1Display}^${op2Display}) ko‘paytirish va bo‘lishdan oldin bajariladi. ${op1Display}^${op2Display} = ${resultDisplay}.`;
      pedagogyRuleUz =
        "Matematikada darajaga oshirish (daraja ko‘rsatkichi) ko‘paytirish va bo‘lishdan oldin bajariladi.";
    } else if (isInsideParenthesis) {
      category = 'PARENTHESIS';
      if (opToken.value === '÷') {
        actionNameUz = 'qavs ichidagi bo‘lishni';
      } else if (opToken.value === '×') {
        actionNameUz = 'qavs ichidagi ko‘paytirishni';
      } else if (opToken.value === '+') {
        actionNameUz = 'qavs ichidagi qo‘shishni';
      } else {
        actionNameUz = 'qavs ichidagi ayirishni';
      }
      categoryTitleUz = '1-QADAM: QAVS ICHIDAGI AMAL';
      categoryBadgeUz = 'QAVS';
      pedagogyWhyUz = `Avvalo qavs ichidagi (${op1Display} ${opToken.value} ${op2Display}) ifoda hisoblanadi: ${op1Display} ${opToken.value} ${op2Display} = ${resultDisplay}.`;
      pedagogyRuleUz =
        "Matematik qoidaga ko‘ra, har qanday arifmetik amaldan oldin birinchi navbatda qavs ichidagi amallar bajariladi.";
    } else if (opToken.value === '×' || opToken.value === '÷') {
      category = 'MULT_DIV';
      if (opToken.value === '÷') {
        actionNameUz = 'bo‘lishni';
        categoryTitleUz = '2-QADAM: KASR / BO‘LISH AMALI';
        categoryBadgeUz = 'KASR / BO‘LISH';
      } else {
        actionNameUz = 'ko‘paytirishni';
        categoryTitleUz = '2-QADAM: KO‘PAYTIRISH AMALI';
        categoryBadgeUz = 'KO‘PAYTIRISH';
      }
      pedagogyWhyUz = `Ko‘paytirish va kasr/bo‘lish amallari qo‘shish va ayirishdan OLDIN bajariladi. Chapdan birinchi kelgan ${op1Display} ${opToken.value} ${op2Display} amalini bajaramiz: natija ${resultDisplay}.`;
      pedagogyRuleUz =
        "Ko‘paytirish va bo‘lish amallari qo‘shish va ayirishdan oldin bajariladi. Agar bir nechta bo‘lsa, ularni CHAPDAN O‘NGGA qarab bajar.";
    } else {
      category = 'ADD_SUB';
      if (opToken.value === '+') {
        actionNameUz = 'qo‘shishni';
      } else {
        actionNameUz = 'ayirishni';
      }
      categoryTitleUz = '3-QADAM: QO‘SHISH VA AYIRISH';
      categoryBadgeUz = 'QO‘SHISH VA AYIRISH';
      pedagogyWhyUz = `Qo‘shish va ayirish bir xil darajadagi amallar. Shuning uchun chapdan o‘ngga birinchi kelgan ${op1Display} ${opToken.value} ${op2Display} amalini bajaramiz: natija ${resultDisplay}.`;
      pedagogyRuleUz =
        "Qo‘shish va ayirish bir xil darajadagi amallar. Shuning uchun ularni CHAPDAN O‘NGGA qarab bajar.";
    }

    const beforeTokens: Token[] = currentTokens.map((t) => ({ ...t }));
    const exprBefore = formatTokens(beforeTokens);

    let highlightIds: string[] = [];
    if (isDirectParenthesisCover) {
      highlightIds = [
        currentTokens[innerOpenIdx].id,
        leftToken.id,
        opToken.id,
        rightToken.id,
        currentTokens[innerCloseIdx].id,
      ];
    } else {
      highlightIds = [leftToken.id, opToken.id, rightToken.id];
    }

    const calcEq = `${op1Display} ${opToken.value} ${op2Display} = ${resultDisplay}`;
    const activeSubExpr = isDirectParenthesisCover
      ? `(${op1Display} ${opToken.value} ${op2Display})`
      : `${op1Display} ${opToken.value} ${op2Display}`;

    const resultToken: TrackingToken = {
      id: `res_${stepCounter}`,
      type: 'number',
      value: resultDisplay,
      numValue: resultVal,
      rational: resultRational,
      originTokenId: opToken.originTokenId,
    };

    orderMarkers.push({
      stepIndex: stepCounter,
      label: `${stepCounter}`,
      tokenId: opToken.originTokenId,
      category,
    });

    let replaceStart = isDirectParenthesisCover ? innerOpenIdx : targetOpIdx - 1;
    let replaceCount = isDirectParenthesisCover ? 5 : 3;

    currentTokens = [
      ...currentTokens.slice(0, replaceStart),
      resultToken,
      ...currentTokens.slice(replaceStart + replaceCount),
    ];

    const afterTokens: Token[] = currentTokens.map((t) => ({ ...t }));
    const exprAfter = formatTokens(afterTokens);

    steps.push({
      id: `step_${stepCounter}`,
      stepIndex: stepCounter,
      totalSteps: 0,
      category,
      categoryTitleUz,
      categoryBadgeUz,
      actionNameUz,
      expressionBefore: exprBefore,
      tokensBefore: beforeTokens,
      activeSubExpression: activeSubExpr,
      operand1: op1,
      operatorSymbol: opToken.value,
      operand2: op2,
      result: resultVal,
      resultDisplay,
      calculationEquation: calcEq,
      highlightTokenIds: highlightIds,
      expressionAfter: exprAfter,
      tokensAfter: afterTokens,
      pedagogyWhyUz,
      pedagogyRuleUz,
      originalTokenIdAnchor: opToken.originTokenId,
    });

    stepCounter++;
  }

  // Update totalSteps on all steps
  steps.forEach((s) => {
    s.totalSteps = steps.length;
  });

  const lastToken = currentTokens.length > 0 ? currentTokens[0] : null;
  const finalDisplay = lastToken ? lastToken.value : '0';
  const finalNum = lastToken?.numValue ?? 0;

  return {
    originalExpression: inputExpression,
    cleanExpression: cleanExpr,
    initialTokens: baseTokens,
    orderMarkers,
    steps,
    finalResult: finalDisplay,
    finalResultDisplay: finalDisplay,
    hasParentheses,
    hasMultDiv,
    hasAddSub,
    isValid: true,
  };
}

/**
 * Pre-configured examples for quick selection and interactive learning
 */
export const PRESET_EXAMPLES = [
  {
    title: "Davriy o'nli kasr (yakuniy javob davriy)",
    expression: "0.(3) × 9 + 0.(6) ÷ 2",
    desc: "Davriy kasrlar ustida amallar: javob 3.(3) davriy kasr ko'rinishida hosil bo'ladi.",
  },
  {
    title: "Bo‘lishda davriy kasr hosil bo‘lishi",
    expression: "5 ÷ 6 + 1 ÷ 3",
    desc: "5÷6 = 0.8(3) va 1÷3 = 0.(3) davriy kasrlar yig'indisi.",
  },
  {
    title: "Asosiy namuna (Darslik)",
    expression: "12 + 3 × 2 + (6 ÷ 3) − 5",
    desc: "Qavs, ko'paytirish, qo'shish va ayirish ketma-ketlikda yechiladi.",
  },
  {
    title: "Kasr va daraja ishtirokidagi misol",
    expression: "24/4 + 2^3 × (10 − 6) − 3√27",
    desc: "Kasr amali (24/4), daraja (2³), qavs va 3-darajali ildiz (3√27).",
  },
  {
    title: "Yuqori darajali ildiz va daraja",
    expression: "3√64 + 2^4 − √(25) × 2",
    desc: "3-darajali ildiz: 3√64 = 4, daraja: 2⁴ = 16 va kvadrat ildiz: √25 = 5.",
  },
  {
    title: "Kvadrat va 4-darajali ildiz",
    expression: "4√81 × 3 + √(144) ÷ 4 − 2^3",
    desc: "4√81 = 3, √144 = 12, 2³ = 8 yuqori tartibda hisoblanadi.",
  },
];
