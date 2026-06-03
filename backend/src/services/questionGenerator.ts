import { FormulasGenerator } from '../utils/formulasGenerator';
import { PaperConfig, GeneratedQuestion } from '../types';
import { normalizeDecimalAnswer, randomDecimalInRange } from '../utils/decimalMath';

export class QuestionGeneratorService {
  generateQuestions(config: PaperConfig): GeneratedQuestion[] {
    if (config.numberMode === 'decimal') {
      return this.generateDecimalQuestions(config);
    }

    try {
      const multistep: number[][] = [];
      const symbols: number[][] = [];

      // 1. 添加算数项范围
      for (let i = 0; i < config.step + 1; i++) {
        multistep.push([config.formulaList[i].min, config.formulaList[i].max]);
        if (i > 0 && config.formulaList[i].operators) {
          symbols.push(config.formulaList[i].operators);
        }
      }

      // 2. 补缺逻辑：参考 PrimarySchoolMathematics，将 multistep 补齐到 4 位操作数，结果范围放在第 5 位（索引 4）
      // 这样做是为了让后端 generator 逻辑与原项目完全一致
      const currentStepsCount = multistep.length;
      for (let i = 0; i < 4 - currentStepsCount; i++) {
        multistep.push([1, 9]);
        symbols.push([1]); // 默认加法
      }

      // 3. 添加结果范围（索引 4）
      multistep.push([config.resultMinValue, config.resultMaxValue]);

      const generator = new FormulasGenerator(
        { carry: config.carry },
        { abdication: config.abdication },
        {},
        { remainder: config.remainder },
        config.step,
        config.numberOfFormulas,
        config.whereIsResult,
        config.enableBrackets,
        multistep,
        symbols
      );

      const questions = generator.generate();

      if (!questions || !Array.isArray(questions)) {
        return [];
      }

      return questions.map(q => {
        const parts = q.split('=');
        let answer = parts[1];
        let question = parts[0];
        
        if (!answer && parts[0]) {
          try {
            // 将中文运算符替换回英文运算符再计算
            const evalStr = parts[0].replace(/×/g, '*').replace(/÷/g, '/');
            answer = eval(evalStr).toString();
            // 求结果的情况，保留等号
            question = parts[0] + '=';
          } catch (e) {
            console.error('Failed to evaluate:', parts[0], e);
            answer = '';
          }
        } else if (answer && parts[0]) {
          // 求算式项的情况，保留等号和答案
          question = parts[0] + '=' + answer;
        }
        
        return {
          question: question,
          answer: answer
        };
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  private generateDecimalQuestions(config: PaperConfig): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const uniqueSet = new Set<string>();
    const decimalPlaces = Number.isInteger(config.decimalPlaces ?? NaN) && (config.decimalPlaces ?? 0) >= 0
      ? (config.decimalPlaces as number)
      : 2;
    const maxRetries = Math.max(config.numberOfFormulas * 5000, 10000);
    const operandCount = config.step + 1;
    const resultMin = Number(config.resultMinValue);
    const resultMax = Number(config.resultMaxValue);

    let retries = 0;

    while (questions.length < config.numberOfFormulas && retries < maxRetries) {
      retries++;

      const operatorCodes: number[] = [];
      for (let i = 1; i < operandCount; i++) {
        const operatorPool = config.formulaList[i]?.operators && config.formulaList[i].operators.length > 0
          ? config.formulaList[i].operators
          : [1];
        operatorCodes.push(operatorPool[Math.floor(Math.random() * operatorPool.length)]);
      }

      const operands: string[] = [];
      let invalidQuestion = false;

      for (let i = 0; i < operandCount; i++) {
        const range = config.formulaList[i] ?? { min: 1, max: 9, operators: null };
        const requiresNonZero = i > 0 && operatorCodes[i - 1] === 4;
        let operand = randomDecimalInRange(range.min, range.max, decimalPlaces);
        let guard = 0;

        while (requiresNonZero && Number(operand) === 0 && guard < 20) {
          operand = randomDecimalInRange(range.min, range.max, decimalPlaces);
          guard++;
        }

        if (requiresNonZero && Number(operand) === 0) {
          invalidQuestion = true;
          break;
        }

        operands.push(operand);
      }

      if (invalidQuestion) {
        continue;
      }

      const tokens: string[] = [];
      for (let i = 0; i < operands.length; i++) {
        tokens.push(operands[i]);
        if (i < operatorCodes.length) {
          tokens.push(this.getOperatorSymbol(operatorCodes[i]));
        }
      }

      const expression = tokens.join('');

      let evaluated = NaN;
      try {
        evaluated = Number(eval(expression));
      } catch (error) {
        continue;
      }

      if (!Number.isFinite(evaluated)) {
        continue;
      }

      if (evaluated < resultMin || evaluated > resultMax) {
        continue;
      }

      const answer = normalizeDecimalAnswer(evaluated, decimalPlaces);
      let question = `${this.representExpression(expression)}=`;
      let resultAnswer = answer;

      if (config.whereIsResult === 1) {
        const blankIndex = Math.floor(Math.random() * operands.length);
        const blankTokens = [...tokens];
        blankTokens[blankIndex * 2] = '__';
        resultAnswer = normalizeDecimalAnswer(operands[blankIndex], decimalPlaces);
        question = `${this.representExpression(blankTokens.join(''))}=${resultAnswer}`;
      }

      if (!question || uniqueSet.has(question)) {
        continue;
      }

      uniqueSet.add(question);
      questions.push({
        question,
        answer: resultAnswer
      });
    }

    if (questions.length < config.numberOfFormulas) {
      console.warn(`Could only generate ${questions.length}/${config.numberOfFormulas} decimal questions after ${retries} attempts.`);
    }

    return questions;
  }

  private getOperatorSymbol(symbol: number): string {
    if (symbol === 1) {
      return '+';
    }
    if (symbol === 2) {
      return '-';
    }
    if (symbol === 3) {
      return '*';
    }
    if (symbol === 4) {
      return '/';
    }
    return '+';
  }

  private representExpression(expression: string): string {
    return expression.replace(/\*/g, '×').replace(/\//g, '÷');
  }
}
