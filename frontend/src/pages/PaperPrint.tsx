import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export const PaperPrint: React.FC = () => {
  const { id, paperId } = useParams<{ id: string; paperId: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (paperId) loadPaper(paperId);
  }, [paperId]);

  useEffect(() => {
    if (paper) {
      const { config } = paper;
      const now = new Date();
      const timeStr = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
      
      if (config.fileNameGeneratedRule === 'baseOnTitleAndIndex') {
        document.title = `${config.paperTitle}_${timeStr}`;
      } else {
        document.title = timeStr;
      }
    }
    
    return () => {
      document.title = 'KidsMathQuest'; // 恢复默认标题
    };
  }, [paper]);

  const loadPaper = async (paperId: string) => {
    try {
      const response = await api.parents.getPaperRecordById(id!, paperId);
      const record = response.data;
      
      if (!record.configSnapshot || !record.questions) {
        console.error('Missing data in paper record:', record);
        setPaper(null);
        return;
      }
      
      const config = JSON.parse(record.configSnapshot);
      const questionsData = JSON.parse(record.questions);
      
      console.log('Paper record status:', record.status);
      console.log('Questions data:', questionsData);
      console.log('Questions data type:', Array.isArray(questionsData), questionsData.length);
      
      // 兼容旧数据：如果是单一数组，包装成二维数组
      const papers = Array.isArray(questionsData[0]) ? questionsData : [questionsData];
      
      console.log('Papers after processing:', papers);
      
      if (papers.length === 0 || (papers[0] && papers[0].length === 0)) {
        console.error('No questions found in paper record');
      }
      
      setPaper({ config, papers, status: record.status });
    } catch (error) {
      console.error('Failed to load paper:', error);
      setPaper(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (!paper) {
    return <div className="flex justify-center items-center h-screen">试卷不存在</div>;
  }

  const { config, papers } = paper;

  // 根据列数判断纸张方向：列数 >= 3 时使用横向，否则纵向
  const isLandscape = config.numberOfPagerColumns >= 3;
  const paperWidth = isLandscape ? '297mm' : '210mm';
  const paperHeight = isLandscape ? '210mm' : '297mm';
  
  // 计算列宽：参考 PrimarySchoolMathematics 的实现
  // 对于 3 列布局，使用 33%, 34%, 34% 的分配
  let colWidths: number[];
  if (config.numberOfPagerColumns === 3) {
    colWidths = [33, 34, 34];
  } else {
    colWidths = Array(config.numberOfPagerColumns).fill(100 / config.numberOfPagerColumns);
  }
  
  const rowHeight = config.solution === 0 ? '16px' : '160px';

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            width: ${paperWidth};
            height: ${paperHeight};
          }
          .page-break {
            page-break-after: always;
          }
          .sheet {
            page-break-after: always;
          }
          .sheet:last-child {
            page-break-after: auto;
          }
        }
        
        .A4 {
          text-align: center;
        }
        
        .sheet {
          margin: 0;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
        }
        
        .row {
          display: flex;
          width: 100%;
        }
        
        h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        h3 {
          font-size: 16px;
        }
        
        p {
          font-size: 14px;
          margin-right: 20%;
        }
      `}</style>
      <div className={!isPrinting ? 'bg-gray-200 p-5 flex flex-col items-center min-h-screen gap-8 overflow-y-auto pb-24' : ''}>
        {papers.map((questions: string[], paperIndex: number) => {
          // 参考 PrimarySchoolMathematics 的列分配方式
          const numberOfCols = Math.ceil(questions.length / config.numberOfPagerColumns);
          const columnsOfPaper: string[][] = [];
          let index = 0;
          while (index < questions.length) {
            columnsOfPaper.push(questions.slice(index, numberOfCols + index));
            index += numberOfCols;
          }

          return (
            <div key={paperIndex} className={`A4 ${paperIndex < papers.length - 1 ? 'page-break' : ''}`}>
              <div className="sheet p-10mm" style={{
                width: paperWidth,
                minHeight: paperHeight,
                background: 'white',
                margin: '0 auto',
                overflow: 'hidden',
                position: 'relative',
                boxSizing: 'border-box',
                boxShadow: isPrinting ? 'none' : '0 0 10px rgba(0,0,0,0.1)'
              }}>
                <div className="mt-12 mb-12">
                  <h1 className="text-3xl font-bold mb-5">{config.paperTitle} {papers.length > 1 ? `(${paperIndex + 1})` : ''}</h1>
                  <h3 className="text-base">{config.paperSubTitle}</h3>
                </div>

                {/* 参考 PrimarySchoolMathematics 的布局方式：使用 flex 而不是 flex-wrap */}
                <div className="row" style={{ display: 'flex', width: '100%' }}>
                  {columnsOfPaper.map((col, colIndex) => (
                    <div key={colIndex} style={{ width: `${colWidths[colIndex % colWidths.length]}%` }}>
                      {col.map((question: string, qIndex: number) => (
                        <p key={qIndex} style={{ marginBottom: rowHeight }} className="text-sm">
                          {question}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {!isPrinting && (
          <div className="fixed bottom-0 left-0 w-full bg-black bg-opacity-70 h-16 flex justify-end items-center z-50 px-8">
            <div className="flex-1 text-white">
              共 {papers.length} 份试卷
            </div>
            <button
              onClick={() => navigate(`/children/${id}/paper-config`)}
              className="mr-4 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
            >
              返回
            </button>
            <button
              onClick={handlePrint}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg"
            >
              🖨️ 立即打印
            </button>
          </div>
        )}
      </div>
    </>
  );
};
