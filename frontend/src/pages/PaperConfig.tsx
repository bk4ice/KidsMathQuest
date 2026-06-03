import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

interface FormulaItem {
  min: number;
  max: number;
  operators: number[] | null;
}

interface FormData {
  step: string;
  numberOfFormulas: number;
  whereIsResult: string;
  enableBrackets: boolean;
  carry: string;
  abdication: string;
  remainder: string;
  solution: string;
  numberOfPapers: number;
  numberOfPagerColumns: number;
  paperTitle: string;
  paperSubTitle: string;
  fileNameGeneratedRule: string;
  formulaList: FormulaItem[];
  resultMinValue: number;
  resultMaxValue: number;
  generateMode: string;
  customFormulaList: { formula: string }[];
  numberMode: 'integer' | 'decimal';
  decimalPlaces: number;
}

interface PaperConfig {
  id: string;
  configName: string;
  step: number;
  formulaList: string;
  resultMinValue: number;
  resultMaxValue: number;
  numberOfFormulas: number;
  whereIsResult: number;
  enableBrackets: boolean;
  carry: number;
  abdication: number;
  remainder: number;
  solution: number;
  numberOfPapers: number;
  numberOfPagerColumns: number;
  paperTitle: string;
  paperSubTitle: string;
  fileNameGeneratedRule: string;
  generateMode: number;
  customFormulaList: string | null;
  paperListData: string | null;
  numberMode: 'integer' | 'decimal';
  decimalPlaces: number | null;
  isDefault: boolean;
  isActive: boolean;
}

export const PaperConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    step: '1',
    numberOfFormulas: 30,
    whereIsResult: '0',
    enableBrackets: false,
    carry: '1',
    abdication: '1',
    remainder: '2',
    solution: '0',
    numberOfPapers: 1,
    numberOfPagerColumns: 3,
    paperTitle: '小学生口算题',
    paperSubTitle: '姓名：__________ 日期：____月____日 时间：________ 对题：____道',
    fileNameGeneratedRule: 'title',
    formulaList: [
      { min: 1, max: 9, operators: null },
      { min: 1, max: 9, operators: [1] }
    ],
    resultMinValue: 1,
    resultMaxValue: 9,
    generateMode: '1',
    customFormulaList: [{ formula: '' }],
    numberMode: 'integer',
    decimalPlaces: 2
  });
  const [configs, setConfigs] = useState<PaperConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string>('');
  const [paperList, setPaperList] = useState<any[]>([]);
  const [optionsDrawerVisible, setOptionsDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyFrequency, setDailyFrequency] = useState(1); // 用于显示和对比

  const operatorOptions = [
    { key: 1, label: '+(加法)' },
    { key: 2, label: '-(减法)' },
    { key: 3, label: '×(乘法)' },
    { key: 4, label: '÷(除法)' }
  ];

  const stepOptions = [
    { key: '1', label: "一步运算", disabled: false },
    { key: '2', label: "两步运算", disabled: formData.remainder === '3' },
    { key: '3', label: "三步运算", disabled: formData.remainder === '3' }
  ];

  const whereIsResultOptions = [
    { key: '0', label: "求结果", disabled: false },
    { key: '1', label: "求算数项", disabled: formData.remainder === '3' }
  ];

  const remainderOptions = [
    { key: '1', label: "随机余数", disabled: false },
    { key: '2', label: "结果整除", disabled: false },
    { key: '3', label: "结果余数", disabled: formData.whereIsResult === '1' || parseInt(formData.step) > 1 }
  ];

  useEffect(() => {
    if (id) {
      loadConfigs(id);
    }
  }, [id]);

  const loadConfigs = async (childId: string, keepActiveId?: string) => {
    try {
      const response = await api.parents.getPaperConfigs(childId);
      // 同时获取练习配置（每日频率）
      const practiceConfigRes = await api.parents.getPracticeConfig(childId);
      setDailyFrequency(practiceConfigRes.data?.dailyFrequency || 1);
      
      setConfigs(response.data);
      if (response.data.length > 0) {
        const activeConfig = response.data.find((c: PaperConfig) => c.isActive);
        const defaultConfig = response.data.find((c: PaperConfig) => c.isDefault);
        const fallbackConfig = activeConfig || defaultConfig || response.data[0];

        // 如果没有活跃配置，自动激活默认配置
        if (!activeConfig && fallbackConfig) {
          try {
            await api.parents.setActivePaperConfig(childId, fallbackConfig.id);
          } catch (e) {
            console.error('Failed to auto-activate config:', e);
          }
        }

        const targetId = keepActiveId || fallbackConfig?.id;
        setActiveConfigId(targetId || '');
        const configToLoad = response.data.find((c: PaperConfig) => c.id === targetId) || fallbackConfig;
        if (configToLoad) {
          loadConfigData(configToLoad);
        }
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  };

  const resetToDefault = async () => {
    try {
      const response = await api.parents.resetPaperConfig(id!);
      const defaultConfig = response.data;
      loadConfigData(defaultConfig);
    } catch (error) {
      console.error('Failed to reset config:', error);
    }
  };

  const loadConfigData = (config: PaperConfig) => {
    const parsedFormulaList = JSON.parse(config.formulaList);
    const parsedCustomFormulaList = config.customFormulaList ? JSON.parse(config.customFormulaList) : [{ formula: '' }];

    setFormData({
      step: config.step.toString(),
      numberOfFormulas: config.numberOfFormulas,
      whereIsResult: config.whereIsResult.toString(),
      enableBrackets: config.enableBrackets,
      carry: config.carry.toString(),
      abdication: config.abdication.toString(),
      remainder: config.remainder.toString(),
      solution: config.solution.toString(),
      numberOfPapers: config.numberOfPapers,
      numberOfPagerColumns: config.numberOfPagerColumns,
      paperTitle: config.paperTitle,
      paperSubTitle: config.paperSubTitle,
      fileNameGeneratedRule: config.fileNameGeneratedRule,
      formulaList: parsedFormulaList,
      resultMinValue: config.resultMinValue,
      resultMaxValue: config.resultMaxValue,
      generateMode: config.generateMode.toString(),
      customFormulaList: parsedCustomFormulaList,
      numberMode: config.numberMode || 'integer',
      decimalPlaces: config.decimalPlaces ?? 2
    });

    // 恢复 paperList（从 paperListData 恢复，如果不存在则从配置参数重建）
    if (config.paperListData) {
      try {
        const restoredPaperList = JSON.parse(config.paperListData);
        setPaperList(restoredPaperList);
      } catch (error) {
        console.error('Failed to parse paperListData:', error);
        // 如果解析失败，从配置参数重建
        setPaperList([]);
      }
    } else {
      // 如果没有保存的 paperListData，从配置参数重建
      if (config.generateMode === 2) {
        const validFormulas = parsedCustomFormulaList.filter((item: any) => item.formula && item.formula.trim());
        if (validFormulas.length > 0) {
          setPaperList([{
            customFormulaList: validFormulas,
            numberOfFormulas: validFormulas.length,
            numberMode: config.numberMode || 'integer',
            decimalPlaces: config.decimalPlaces
          }]);
        } else {
          setPaperList([]);
        }
      } else {
        setPaperList([{
          step: config.step,
          numberOfFormulas: config.numberOfFormulas,
          whereIsResult: config.whereIsResult,
          formulaList: parsedFormulaList,
          resultMinValue: config.resultMinValue,
          resultMaxValue: config.resultMaxValue,
          numberMode: config.numberMode,
          decimalPlaces: config.decimalPlaces
        }]);
      }
    }
  };

  const changeStep = (val: string) => {
    const difference = parseInt(val) - formData.formulaList.length + 1;
    const newFormulaList = [...formData.formulaList];

    if (difference > 0) {
      for (let i = 1; i <= difference; i++) {
        newFormulaList.push({ min: 1, max: 9, operators: [1] });
      }
    } else if (difference < 0) {
      newFormulaList.splice(difference, Math.abs(difference));
    }
    setFormData({ ...formData, step: val, formulaList: newFormulaList });
  };

  const append = () => {
    console.log('append 函数被调用');
    console.log('当前 formData:', formData);
    console.log('当前 paperList:', paperList);
    
    // 参考 PrimarySchoolMathematics 的实现，添加表单验证
    if (formData.generateMode === '2') {
      console.log('手动添加模式');
      // 手动添加模式：处理自定义公式
      const customFormulaList = formData.customFormulaList
        .filter(item => item.formula && item.formula.trim())
        .map(item => {
          let formula = item.formula.replace(/\*/g, '×').replace(/\//g, '÷').trim();
          if (!formula.endsWith('=')) {
            formula += '=';
          }
          formula = formula.replace(/\s+/g, '');
          return { formula };
        });
      
      console.log('处理后的 customFormulaList:', customFormulaList);
      
      if (customFormulaList.length === 0) {
        alert('请至少添加一道题目');
        return;
      }
      
      const newPaperList = [...paperList, {
        customFormulaList,
        numberOfFormulas: customFormulaList.length,
        numberMode: formData.numberMode,
        decimalPlaces: formData.numberMode === 'decimal' ? formData.decimalPlaces : null
      }];
      console.log('新的 paperList:', newPaperList);
      setPaperList(newPaperList);
      // 同时更新 formData.customFormulaList 以便保存
      setFormData({ ...formData, customFormulaList });
      console.log('状态已更新');
      alert(`成功添加 ${customFormulaList.length} 道题目`);
    } else {
      console.log('自动生成模式');
      // 自动生成模式：处理自动生成配置
      const { step, numberOfFormulas, whereIsResult, formulaList, resultMinValue, resultMaxValue } = formData;
      
      console.log('参数值:', { step, numberOfFormulas, whereIsResult, resultMinValue, resultMaxValue });
      
      // 验证必填字段 - 放宽验证条件
      if (!step || step === '' || numberOfFormulas <= 0 || whereIsResult === '' || resultMinValue === null || resultMaxValue === null) {
        alert('请填写完整的配置参数');
        console.log('验证失败：必填字段不完整');
        return;
      }
      
      // 验证 formulaList
      if (!formulaList || formulaList.length === 0) {
        alert('请配置算数项');
        console.log('验证失败：formulaList 为空');
        return;
      }
      
      // 验证每个 formulaList 项
      for (const item of formulaList) {
        if (!item.min || !item.max || item.min > item.max) {
          alert('算数项的最小值必须小于或等于最大值');
          console.log('验证失败：算数项范围不正确', item);
          return;
        }
      }
      
      // 验证结果范围
      if (resultMinValue > resultMaxValue) {
        alert('运算结果的最小值必须小于或等于最大值');
        console.log('验证失败：结果范围不正确');
        return;
      }
      
      // 深拷贝配置数据
      const configToAdd = {
        step: parseInt(step),
        numberOfFormulas,
        whereIsResult: parseInt(whereIsResult),
        formulaList: JSON.parse(JSON.stringify(formulaList)),
        resultMinValue,
        resultMaxValue,
        numberMode: formData.numberMode,
        decimalPlaces: formData.numberMode === 'decimal' ? formData.decimalPlaces : null
      };
      
      console.log('要添加的配置:', configToAdd);
      const newPaperList = [...paperList, configToAdd];
      console.log('新的 paperList:', newPaperList);
      setPaperList(newPaperList);
      console.log('状态已更新');
      alert('成功添加配置');
    }
    
    console.log('append 函数执行完成');
  };

  const clear = () => {
    // 参考 PrimarySchoolMathematics 的实现，清空 paperList
    if (!confirm('确定要清空所有已添加的口算题吗？')) {
      return;
    }
    setPaperList([]);
    // 同时清空 formData.customFormulaList 以便保存
    setFormData({ ...formData, customFormulaList: [{ formula: '' }] });
  };

  const buildConfigData = () => ({
    step: parseInt(formData.step),
    numberOfFormulas: formData.numberOfFormulas,
    whereIsResult: parseInt(formData.whereIsResult),
    enableBrackets: formData.enableBrackets,
    carry: parseInt(formData.carry),
    abdication: parseInt(formData.abdication),
    remainder: parseInt(formData.remainder),
    solution: parseInt(formData.solution),
    numberOfPapers: formData.numberOfPapers,
    numberOfPagerColumns: formData.numberOfPagerColumns,
    paperTitle: formData.paperTitle,
    paperSubTitle: formData.paperSubTitle,
    fileNameGeneratedRule: formData.fileNameGeneratedRule,
    formulaList: JSON.stringify(formData.formulaList),
    resultMinValue: formData.resultMinValue,
    resultMaxValue: formData.resultMaxValue,
    generateMode: parseInt(formData.generateMode),
    numberMode: formData.numberMode,
    decimalPlaces: formData.numberMode === 'decimal' ? formData.decimalPlaces : null,
    customFormulaList: formData.customFormulaList.length > 0 ? JSON.stringify(formData.customFormulaList) : null,
    paperListData: paperList.length > 0 ? JSON.stringify(paperList) : null
  });

  // 保存当前参数到当前选中的配置（更新，不创建新的）
  const saveConfiguration = async () => {
    if (!activeConfigId) {
      alert('请先选择一个配置');
      return;
    }
    try {
      const response = await api.parents.updatePaperConfig(id!, activeConfigId, buildConfigData());
      await loadConfigs(id!, response.data.id);
      alert('保存成功！');
    } catch (error: any) {
      alert('保存失败：' + error.message);
    }
  };

  // 另存为新配置
  const addConfiguration = async () => {
    if (configs.length >= 10) {
      alert('最多只能保存10份配置！');
      return;
    }
    const configName = prompt('请给新配置起个名字（最多10个字符）');
    if (!configName || configName.length > 10) {
      alert('配置名字不能为空且不能多于10个字符');
      return;
    }
    try {
      const response = await api.parents.addPaperConfig(id!, {
        configName,
        ...buildConfigData()
      });
      await loadConfigs(id!, response.data.id);
      alert('另存为新配置成功！');
    } catch (error: any) {
      alert('保存失败：' + error.message);
    }
  };

  const selectConfig = async (configId: string) => {
    if (!confirm('确定加载吗？注意未保存的参数将会丢失！')) return;
    
    setActiveConfigId(configId);
    const config = configs.find(c => c.id === configId);
    if (config) {
      loadConfigData(config);
    }
  };

  const removeConfig = async (configId: string) => {
    if (!confirm('确定删除吗？')) return;

    try {
      await api.parents.deletePaperConfig(id!, configId);
      await loadConfigs(id!);
      if (activeConfigId === configId && configs.length > 0) {
        setActiveConfigId(configs[0].id);
      }
      alert('删除成功！');
    } catch (error: any) {
      alert('删除失败：' + error.message);
    }
  };

  const handleGeneratePaper = async (configId: string) => {
    // 检查打印数量是否少于每日练习频率
    if (formData.numberOfPapers < dailyFrequency) {
      const proceed = confirm(
        `当前每日练习频率为 ${dailyFrequency} 次，但您只设置了生成 ${formData.numberOfPapers} 份试卷。\n\n` +
        `这意味着孩子可能需要完成 ${dailyFrequency} 次练习，但只有 ${formData.numberOfPapers} 份纸质试卷可用。\n\n` +
        `注意：孩子在 App 中练习时会自动生成新的题目，不受打印数量限制。\n\n` +
        `是否继续生成 ${formData.numberOfPapers} 份试卷？`
      );
      if (!proceed) return;
    }

    try {
      setLoading(true);
      // 参考 PrimarySchoolMathematics 的逻辑，传递 paperList 给后端
      const response = await api.parents.generatePaper(id!, { configId, paperList });
      navigate(`/children/${id}/papers/${response.data.id}/print`);
    } catch (error: any) {
      alert('生成失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/dashboard')} className="text-blue-500 hover:text-blue-700">
            ← 返回
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：参数设置 */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-6">试卷配置</h2>

              {/* 生成模式 */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">生成模式</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, generateMode: '1' })}
                    className={`px-4 py-2 rounded ${formData.generateMode === '1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    自动生成
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, generateMode: '2' })}
                    className={`px-4 py-2 rounded ${formData.generateMode === '2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    手动添加
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">运算模式</label>
                  <select
                    value={formData.numberMode}
                    onChange={(e) => setFormData({
                      ...formData,
                      numberMode: e.target.value === 'decimal' ? 'decimal' : 'integer'
                    })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="integer">整数模式</option>
                    <option value="decimal">小数模式</option>
                  </select>
                </div>
                {formData.numberMode === 'decimal' && (
                  <div>
                    <label className="block text-gray-700 mb-2">小数位数</label>
                    <select
                      value={formData.decimalPlaces}
                      onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value={1}>1 位</option>
                      <option value={2}>2 位</option>
                      <option value={3}>3 位</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.generateMode === '1' && (
                <>
                  {/* 几步运算 */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">几步运算？</label>
                    <div className="flex gap-4 flex-wrap">
                      {stepOptions.map(option => (
                        <div key={option.key} className="flex flex-col">
                          <button
                            onClick={() => changeStep(option.key)}
                            disabled={option.disabled}
                            className={`px-4 py-2 rounded ${formData.step === option.key ? 'bg-blue-500 text-white' : 'bg-gray-200'} ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {option.label}
                          </button>
                          {option.disabled && (
                            <span className="text-xs text-red-500 mt-1">⚠️ 余数设置不支持</span>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setOptionsDrawerVisible(true)}
                        className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        其他设置
                      </button>
                    </div>
                  </div>

                  {/* 算数项 */}
                  {formData.formulaList.map((item, index) => (
                    <div key={index} className="mb-6">
                      {item.operators && (
                        <div className="mb-2">
                          <label className="block text-gray-700 mb-2">第{index}步运算符号选择</label>
                          <div className="flex gap-4">
                            {operatorOptions.map(op => (
                              <label key={op.key} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={item.operators?.includes(op.key) || false}
                                  onChange={(e) => {
                                    const newOperators = e.target.checked
                                      ? [...(item.operators || []), op.key]
                                      : item.operators?.filter(o => o !== op.key) || [];
                                    const newFormulaList = [...formData.formulaList];
                                    newFormulaList[index].operators = newOperators;
                                    setFormData({ ...formData, formulaList: newFormulaList });
                                  }}
                                  className="mr-2"
                                />
                                {op.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2">算数项{index + 1}</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-600 mb-1">最小值</label>
                            <input
                              type="number"
                              value={item.min}
                              onChange={(e) => {
                                const newFormulaList = [...formData.formulaList];
                                newFormulaList[index].min = parseInt(e.target.value);
                                setFormData({ ...formData, formulaList: newFormulaList });
                              }}
                              className="w-full px-3 py-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">最大值</label>
                            <input
                              type="number"
                              value={item.max}
                              onChange={(e) => {
                                const newFormulaList = [...formData.formulaList];
                                newFormulaList[index].max = parseInt(e.target.value);
                                setFormData({ ...formData, formulaList: newFormulaList });
                              }}
                              className="w-full px-3 py-2 border rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 运算结果 */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">运算结果</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-600 mb-1">最小值</label>
                        <input
                          type="number"
                          value={formData.resultMinValue}
                          onChange={(e) => setFormData({ ...formData, resultMinValue: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">最大值</label>
                        <input
                          type="number"
                          value={formData.resultMaxValue}
                          onChange={(e) => setFormData({ ...formData, resultMaxValue: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 题目数量 */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">题目数量</label>
                    <input
                      type="number"
                      value={formData.numberOfFormulas}
                      onChange={(e) => setFormData({ ...formData, numberOfFormulas: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </>
              )}

              {formData.generateMode === '2' && (
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">手动添加题目</label>
                  {formData.customFormulaList.map((item, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={item.formula}
                        onChange={(e) => {
                          const newCustomList = [...formData.customFormulaList];
                          newCustomList[index].formula = e.target.value;
                          setFormData({ ...formData, customFormulaList: newCustomList });
                        }}
                        placeholder="例如：1+1="
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({ ...formData, customFormulaList: [...formData.customFormulaList, { formula: '' }] })}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    + 添加题目
                  </button>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-4">
                <button onClick={append} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  添加题目
                </button>
                <button onClick={clear} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  清空题目
                </button>
                <button onClick={saveConfiguration} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                  保存当前配置
                </button>
                <button onClick={addConfiguration} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition">
                  另存为新配置
                </button>
                <button
                  onClick={() => handleGeneratePaper(activeConfigId)}
                  disabled={loading || !activeConfigId || paperList.length === 0}
                  className={`bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition flex items-center gap-2 ${(!activeConfigId || loading || paperList.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? '生成中...' : '🖨️ 立即生成并预览试卷'}
                </button>
              </div>

              {/* 显示已添加的口算题 */}
              {paperList.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold mb-3">当前题目包含的内容 ({paperList.length} 份)</h3>
                  <div className="space-y-2">
                    {paperList.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        {item.customFormulaList ? (
                          <div>
                            <p className="font-medium">手动添加模式</p>
                            <p className="text-sm text-gray-600">题目数量: {item.numberOfFormulas}</p>
                            <p className="text-sm text-gray-600">
                              题型: {item.numberMode === 'decimal' ? `小数题（${item.decimalPlaces}位）` : '整数题'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">自动生成模式 - {item.step}步运算</p>
                            <p className="text-sm text-gray-600">题目数量: {item.numberOfFormulas} | 结果范围: {item.resultMinValue}-{item.resultMaxValue}</p>
                            <p className="text-sm text-gray-600">
                              题型: {item.numberMode === 'decimal' ? `小数题（${item.decimalPlaces}位）` : '整数题'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：配置列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">已保存配置列表</h2>
                <button onClick={resetToDefault} className="text-red-500 text-sm hover:text-red-700">
                  重置配置
                </button>
              </div>

              {configs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">还没有配置</p>
              ) : (
                <div className="space-y-3">
                  {configs.map(config => (
                    <div
                      key={config.id}
                      className={`p-4 rounded border-2 transition ${activeConfigId === config.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 cursor-pointer'}`}
                      onClick={() => selectConfig(config.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold">{config.configName}</p>
                        <div className="flex gap-2">
                          {!config.isDefault && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeConfig(config.id); }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {config.isDefault && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">默认</span>
                        )}
                        {config.isActive && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">当前使用中</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 其他设置抽屉 */}
        {optionsDrawerVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOptionsDrawerVisible(false)}>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">其他设置</h3>
                <button
                  onClick={() => setOptionsDrawerVisible(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">题型设置</label>
                  <select
                    value={formData.whereIsResult}
                    onChange={(e) => setFormData({ ...formData, whereIsResult: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {whereIsResultOptions.map(option => (
                      <option key={option.key} value={option.key} disabled={option.disabled}>
                        {option.label}{option.disabled && ' (余数设置不支持)'}
                      </option>
                    ))}
                  </select>
                  {formData.whereIsResult === '1' && formData.remainder === '3' && (
                    <p className="text-xs text-red-500 mt-1">⚠️ 余数设置为"结果余数"时，不能选择"求算数项"</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enableBrackets}
                      onChange={(e) => setFormData({ ...formData, enableBrackets: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-gray-700">启用括号()</span>
                  </label>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">加法设置</label>
                  <select
                    value={formData.carry}
                    onChange={(e) => setFormData({ ...formData, carry: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="1">随机进位</option>
                    <option value="2">加法进位</option>
                    <option value="3">没有进位</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">减法设置</label>
                  <select
                    value={formData.abdication}
                    onChange={(e) => setFormData({ ...formData, abdication: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="1">随机退位</option>
                    <option value="2">减法退位</option>
                    <option value="3">没有退位</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">除法设置</label>
                  <select
                    value={formData.remainder}
                    onChange={(e) => setFormData({ ...formData, remainder: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {remainderOptions.map(option => (
                      <option key={option.key} value={option.key} disabled={option.disabled}>
                        {option.label}{option.disabled && ' (不支持)'}
                      </option>
                    ))}
                  </select>
                  {formData.remainder === '3' && (
                    <p className="text-xs text-red-500 mt-1">⚠️ 结果余数不支持多步运算或求算数项</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">小数模式说明</label>
                  <div className="text-sm text-gray-600 leading-6 bg-gray-50 border rounded p-3">
                    <p>开启后，自动生成题目和手动添加题目都会按所选小数位数进行处理。</p>
                    <p>整数模式下会忽略小数位数配置。</p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">解题方式</label>
                  <select
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="0">用口算解题</option>
                    <option value="1">用竖式解题</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      生成的卷子数量
                      <span className="text-xs text-gray-500 block">仅控制"预览打印"时的试卷份数</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.numberOfPapers}
                      onChange={(e) => setFormData({ ...formData, numberOfPapers: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded ${formData.numberOfPapers < dailyFrequency ? 'border-yellow-500 bg-yellow-50' : ''}`}
                    />
                    {formData.numberOfPapers < dailyFrequency && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⚠️ 当前每日练习频率为 {dailyFrequency} 次，建议打印至少 {dailyFrequency} 份试卷
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">口算题列数</label>
                    <input
                      type="number"
                      value={formData.numberOfPagerColumns}
                      onChange={(e) => setFormData({ ...formData, numberOfPagerColumns: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">卷子标题</label>
                  <input
                    type="text"
                    value={formData.paperTitle}
                    onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">卷子副标题</label>
                  <input
                    type="text"
                    value={formData.paperSubTitle}
                    onChange={(e) => setFormData({ ...formData, paperSubTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">文件名生成规则</label>
                  <select
                    value={formData.fileNameGeneratedRule}
                    onChange={(e) => setFormData({ ...formData, fileNameGeneratedRule: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="baseOnTitleAndIndex">卷子标题+时间</option>
                    <option value="baseOnIndexOnly">仅时间</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperConfig;
