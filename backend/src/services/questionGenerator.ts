import { FormulasGenerator } from '../utils/formulasGenerator';
import { PaperConfig, GeneratedQuestion } from '../types';

export class QuestionGeneratorService {
  generateQuestions(config: PaperConfig): GeneratedQuestion[] {
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
}
