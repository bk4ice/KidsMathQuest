// Ported from PrimarySchoolMathematics/src/utils/psm.js
// Converted from JavaScript to TypeScript

const f1 = (s: string): string | null => {
  const ss = s.match(/\(\d+[\+\-\*/\d]+\)/);
  if (ss) {
    return ss[0];
  }
  return null;
};

const f2 = (s: string): string | null => {
  const ss = s.match(/\d+[\*/]\d+/);
  if (ss) {
    return ss[0];
  }
  return null;
};

const f3 = (s: string): string | null => {
  const ss = s.match(/\d+[\+\-]\d+/);
  if (ss) {
    return ss[0];
  }
  return null;
};

const f4 = (s: string): string | null => {
  const ss = s.match(/\d+[\+\-\*/\d]+/);
  if (ss) {
    return ss[0];
  }
  return null;
};

function isResultOk(str: string, result: number[]): boolean {
  try {
    return result[0] <= eval(str) && eval(str) <= result[1];
  } catch (e) {
    return false;
  }
}

function isMultDivOk(s: string, result: number[], remainder: number): boolean {
  if (s.includes("/")) {
    const divs = s.split("/");
    if (parseInt(divs[1]) === 0) {
      return false;
    } else {
      if (remainder === 2) {
        if (
          isResultOk(s, result) &&
          parseInt(divs[0]) % parseInt(divs[1]) === 0 &&
          eval(s) > 0
        ) {
          return true;
        } else {
          return false;
        }
      }
      if (remainder === 3) {
        if (
          isResultOk(s, result) &&
          parseInt(divs[0]) % parseInt(divs[1]) > 0 &&
          eval(s) > 0
        ) {
          return true;
        } else {
          return false;
        }
      } else if (remainder === 1) {
        if (isResultOk(s, result) && eval(s) > 0) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  if (s.includes("*")) {
    return isResultOk(s, result);
  }
  return false;
}

function isAddSub(s: string, result: number[], carry: number, abdication: number): boolean {
  const tmp = s.split(/[+\-]/);
  if (isResultOk(s, result)) {
    if (/\+/.test(s)) {
      if (carry === 1) {
        return true;
      } else if (carry === 2) {
        return is_addcarry(parseInt(tmp[0]), parseInt(tmp[1]));
      } else if (carry === 3) {
        return is_addnocarry(parseInt(tmp[0]), parseInt(tmp[1]));
      }
    } else if (/\-/.test(s)) {
      if (abdication === 1) {
        return true;
      } else if (abdication === 2) {
        return is_abdication(parseInt(tmp[0]), parseInt(tmp[1]));
      } else if (abdication === 3) {
        return is_noabdication(parseInt(tmp[0]), parseInt(tmp[1]));
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
  return false;
}

function is_addcarry(a: number, b: number): boolean {
  return (get_num(a) + get_num(b) >= 10);
}

function is_addnocarry(a: number, b: number): boolean {
  return !is_addcarry(a, b);
}

function is_abdication(a: number, b: number): boolean {
  if (get_num(a) < get_num(b)) {
    return true;
  } else {
    return false;
  }
}

function is_noabdication(a: number, b: number): boolean {
  return !is_abdication(a, b);
}

function get_num(number: number): number {
  let value0 = number / 10;
  value0 = parseInt(value0.toString());
  return number - value0 * 10;
}

function getRandomNum(list: number[][], step: number): number[] {
  let newList: number[] = [];
  for (let i = 0; i < step + 1; i++) {
    newList.push(Math.floor(Math.random() * (list[i][1] - list[i][0] + 1) + list[i][0]));
  }
  return newList;
}

function getSymbol(sym: number): string {
  if (sym == 1) {
    return "+";
  } else if (sym == 2) {
    return "-";
  } else if (sym == 3) {
    return "*";
  } else if (sym == 4) {
    return "/";
  }
  return "+";
}

function getRandomSymbols(symbols: number[][], step: number): number[] {
  let newList: number[] = [];
  for (let i = 0; i < step; i++) {
    let index = Math.floor(Math.random() * symbols[i].length);
    newList.push(symbols[i][index]);
  }
  return newList;
}

function getPSMstr(formulas: (number | string)[], symbols: number[][], step: number, is_bracket: boolean): string {
  let ss = "";
  const sym = getRandomSymbols(symbols, step);
  for (let i = 0; i < step; i++) {
    formulas.splice(i * 2 + 1, 0, getSymbol(sym[i]));
  }

  if (is_bracket) {
    const k = getRandomBracket(step);
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        formulas.splice(k + 4 * i, 0, "(");
      } else {
        formulas.splice(k + 4 * i, 0, ")");
      }
    }
  }

  for (const s of formulas) {
    ss += s.toString();
  }
  return ss;
}

function getRandomBracket(step: number): number {
  while (true) {
    const k = Math.floor(Math.random() * (step * 2 + 1 - 3));
    if (k % 2 === 0) {
      return k;
    }
  }
}

function validator(s: string, result: number[], carry: number, abdication: number, remainder: number): boolean {
  if (isResultOk(s, result)) {
    if (f1(s)) {
      const result1 = validator1(s, result, carry, abdication, remainder);
      if (result1) {
        const result2 = validator2(result1, result, carry, abdication, remainder);
        return result2 !== false;
      } else {
        return false;
      }
    } else {
      const result2 = validator2(s, result, carry, abdication, remainder);
      return result2 !== false;
    }
  } else {
    return false;
  }
  return false;
}

function validator1(s: string, result: number[], carry: number, abdication: number, remainder: number): string | false {
  while (f1(s)) {
    const fa = f1(s);
    if (!fa) return false;
    const fb = f4(fa);
    if (!fb) return false;
    const r = validator2(fb, result, carry, abdication, remainder);
    if (r) {
      s = s.replace(fa, `${parseInt(parseFloat(r).toString())}`);
    } else {
      return false;
    }
  }
  return s;
}

function validator2(s: string, result: number[], carry: number, abdication: number, remainder: number): string | false {
  while (f2(s)) {
    const f = f2(s);
    if (!f) return false;
    if (isMultDivOk(f, result, remainder)) {
      const r = eval(f);
      s = s.replace(f, `${parseInt(parseFloat(r).toString())}`);
    } else {
      return false;
    }
  }
  while (f3(s)) {
    const f = f3(s);
    if (!f) return false;
    if (isAddSub(f, result, carry, abdication)) {
      const r = eval(f);
      s = s.replace(f, `${r}`);
    } else {
      return false;
    }
  }
  return s;
}

function getXStepstr(src: string, is_result: number): string {
  if (is_result == 0) {
    return repSymStr(src) + "=";
  } else if (is_result == 1) {
    return getRandomItem(repSymStr(src) + "=" + eval(src));
  } else {
    throw new Error("is_result求结果，求算数项参数设置错误！");
  }
}

function repSymStr(s: string): string {
  if (/\*/.test(s)) {
    s = s.replace(/\*/g, "×");
  }
  if (/\//.test(s)) {
    s = s.replace(/\//g, "÷");
  }
  return s;
}

function getRandomItem(sr: string): string {
  let p = /\d+/g;
  let sc = sr.match(p);
  if (!sc) return sr;
  let i = Math.floor(Math.random() * (sc.length - 1));
  sr = sr.replace(sc[i], "__");
  return sr;
}

function getMoreStep(
  formulas: number[][],
  result: number[],
  symbols: number[][],
  step: number,
  carry: number,
  abdication: number,
  remainder: number,
  is_bracket: boolean,
  is_result: number
): string | false {
  const f = getRandomNum(formulas, step);
  const question = getPSMstr([...f], symbols, step, is_bracket);

  if (validator(question, result, carry, abdication, remainder)) {
    return getXStepstr(question, is_result);
  } else {
    return false;
  }
}

export class FormulasGenerator {
  private addattrs: { carry: number };
  private subattrs: { abdication: number };
  private multattrs: any;
  private divattrs: { remainder: number };
  private step: number;
  private is_result: number;
  private is_bracket: boolean;
  private number: number;
  private multistep: number[][];
  private symbols: number[][];
  private data_list: string[] = [];

  constructor(
    addattrs: { carry: number },
    subattrs: { abdication: number },
    multattrs: any,
    divattrs: { remainder: number },
    step: number,
    number: number,
    is_result: number,
    is_bracket: boolean,
    multistep: number[][],
    symbols: number[][]
  ) {
    if (step === undefined) {
      throw new Error("required param step is missing or step is None");
    }
    if (![1, 2, 3].includes(step)) {
      throw new Error("param step must be 1 or 2 or 3");
    }

    this.addattrs = addattrs;
    this.subattrs = subattrs;
    this.multattrs = multattrs;
    this.divattrs = divattrs;
    this.step = step;
    this.is_result = is_result;
    this.is_bracket = is_bracket;
    this.number = number;
    this.multistep = multistep;
    this.symbols = symbols;
  }

  private __getformula(): string | false {
    const f = this.__get_formulas();
    return getMoreStep(
      this.multistep,
      this.multistep[4], // Always at index 4 as per PrimarySchoolMathematics logic
      this.symbols,
      this.step,
      this.addattrs["carry"],
      this.subattrs["abdication"],
      this.divattrs["remainder"],
      this.is_bracket,
      this.is_result
    );
  }

  private __get_formulas(): number[] {
    const f: number[] = [];
    for (let i = 0; i < this.step + 1; i++) {
      f.push(this.multistep[i][0]);
    }
    return f;
  }

  public generate(): string[] {
    const slist: string[] = [];
    const uniqueSet = new Set<string>();
    let retries = 0;
    const maxRetries = Math.max(this.number * 5000, 10000); // 增加重试次数，至少 10000 次

    while (slist.length < this.number && retries < maxRetries) {
      retries++;
      const formula = this.__getformula();
      if (formula && !uniqueSet.has(formula)) {
        slist.push(formula);
        uniqueSet.add(formula);
      }
    }

    if (slist.length < this.number) {
      console.warn(`Could only generate ${slist.length}/${this.number} unique questions after ${retries} attempts. Please check if constraints are too strict.`);
      
      // 如果无法生成足够的唯一题目，且已经尝试了很多次，
      // 可以在此处决定是否允许少量重复，或者就返回现有的
      // 目前选择保持现有唯一题目，确保质量
    }

    slist.sort(() => Math.random() - 0.5);
    this.data_list = slist;
    return this.data_list;
  }
}
