export interface FormulaList {
  min: number;
  max: number;
  operators: number[];
}

export interface PaperConfig {
  step: number;
  formulaList: FormulaList[];
  resultMinValue: number;
  resultMaxValue: number;
  numberOfFormulas: number;
  whereIsResult: number;
  enableBrackets: boolean;
  carry: number;
  abdication: number;
  remainder: number;
  solution: number;
}

export interface GeneratedQuestion {
  question: string;
  answer: string;
}

export interface JwtPayload {
  parentId?: string;
  childId?: string;
  username?: string;
  name?: string;
}
