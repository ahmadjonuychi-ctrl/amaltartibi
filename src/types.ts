export type OperationCategory =
  | 'INTRO'
  | 'PARENTHESIS'
  | 'POWER_ROOT'
  | 'MULT_DIV'
  | 'ADD_SUB'
  | 'FINAL_ANSWER'
  | 'RULE_SUMMARY';

export interface Rational {
  num: number; // Surat (butun son)
  den: number; // Maxraj (musbat butun son > 0)
}

export interface Token {
  id: string;
  type: 'number' | 'operator' | 'open_paren' | 'close_paren' | 'function';
  value: string;
  numValue?: number;
  rational?: Rational; // Aniq kasr yoki davriy o'nli kasr qiymati
  fnName?: 'sqrt' | 'nthroot';
  rootDegree?: number; // e.g. 3 for 3√8 or 4 for 4√81
}

export interface OrderMarker {
  stepIndex: number;
  label: string; // "1", "2", "3"
  tokenId: string;
  category: OperationCategory;
}

export interface MathStep {
  id: string;
  stepIndex: number;
  totalSteps: number;
  category: OperationCategory;
  categoryTitleUz: string; // masalan: "1-QADAM: DARAJA VA ILDIZ CHIQARISH"
  categoryBadgeUz: string; // "QAVS" | "DARAJA & ILDIZ" | "KO‘PAYTIRISH & BO‘LISH" | "QO‘SHISH & AYIRISH"
  actionNameUz: string; // e.g. "bo‘lishni", "ko‘paytirishni", "qo‘shishni", "ayirishni", "darajaga oshirishni", "ildiz chiqarishni"
  
  // The expression state before this step executes
  expressionBefore: string;
  tokensBefore: Token[];
  
  // The specific operation being computed in this step
  activeSubExpression: string; // masalan: "3√64", "2^3", "(6 ÷ 3)", "3 × 2", "0.(3) × 9"
  operand1: number;
  operatorSymbol: string; // "^", "√", "3√", "÷", "×", "+", "−"
  operand2?: number; // optional for unary functions like sqrt, nthroot
  result: number;
  resultDisplay: string; // Aniq ko'rinish: masalan davriy kasr bo'lsa "0.(3)", "1.(6)", "3.(3)"
  calculationEquation: string; // "1 ÷ 3 = 0.(3)", "0.(3) × 9 = 3", "6 ÷ 3 = 2"
  
  // Highlight indices in tokensBefore
  highlightTokenIds: string[];
  
  // The expression state after this operation is replaced by result
  expressionAfter: string;
  tokensAfter: Token[];
  
  // Pedagogical explanation in clear Uzbek
  pedagogyWhyUz: string;
  pedagogyRuleUz: string;

  // Track which token in the original expression received which step order
  originalTokenIdAnchor?: string;
}

export interface MathSolution {
  originalExpression: string;
  cleanExpression: string;
  initialTokens: Token[];
  orderMarkers: OrderMarker[]; // Pre-assigned order for every operation in initialTokens
  steps: MathStep[];
  finalResult: number | string; // Masalan: "0.(3)" yoki 15 yoki "3.(3)"
  finalResultDisplay: string;
  hasParentheses: boolean;
  hasMultDiv: boolean;
  hasAddSub: boolean;
  isValid: boolean;
  errorMessage?: string;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5;
