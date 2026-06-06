import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ChildLogin } from './pages/ChildLogin';
import { ParentDashboard } from './pages/ParentDashboard';
import { ChildDashboard } from './pages/ChildDashboard';
import { AddChild } from './pages/AddChild';
import { EditChild } from './pages/EditChild';
import { Practice } from './pages/Practice';
import { Result } from './pages/Result';
import { ChildStats } from './pages/ChildStats';
import { PaperConfigs } from './pages/PaperConfigs';
import { AddPaperConfig } from './pages/AddPaperConfig';
import { PaperConfig } from './pages/PaperConfig';
import { PaperPrint } from './pages/PaperPrint';
import { PaperRecords } from './pages/PaperRecords';
import { PracticeConfig } from './pages/PracticeConfig';
import { ChildHistory } from './pages/ChildHistory';
import { ChildBadges } from './pages/ChildBadges';
import { WrongQuestions } from './pages/WrongQuestions';
import { AiMentor } from './pages/AiMentor';
import { Cursor } from 'animal-island-ui';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireParent?: boolean }> = ({ 
  children, 
  requireParent = false 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={requireParent ? '/login' : '/child-login'} />;
  }

  if (requireParent && user?.type !== 'parent') {
    return <Navigate to="/child-login" />;
  }

  if (!requireParent && user?.type !== 'child') {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  // 全局隐藏滚动条
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* 完全隐藏滚动条但保留滚动功能 */
        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          display: none;
        }
        /* Firefox */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        /* IE/Edge */
        * {
          -ms-overflow-style: none;
        }
      `;
      if (!document.querySelector('style[data-scrollbar-hide]')) {
        style.setAttribute('data-scrollbar-hide', 'true');
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/child-login" 
            element={
              <Cursor>
                <ChildLogin />
              </Cursor>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireParent>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-mentor"
            element={
              <ProtectedRoute requireParent>
                <AiMentor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/new"
            element={
              <ProtectedRoute requireParent>
                <AddChild />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/edit"
            element={
              <ProtectedRoute requireParent>
                <EditChild />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/stats"
            element={
              <ProtectedRoute requireParent>
                <ChildStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/practice-config"
            element={
              <ProtectedRoute requireParent>
                <PracticeConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/configs"
            element={
              <ProtectedRoute requireParent>
                <PaperConfigs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/configs/new"
            element={
              <ProtectedRoute requireParent>
                <AddPaperConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/paper-config"
            element={
              <ProtectedRoute requireParent>
                <PaperConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/papers/:paperId/print"
            element={
              <ProtectedRoute requireParent>
                <PaperPrint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id/papers"
            element={
              <ProtectedRoute requireParent>
                <PaperRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/child/dashboard"
            element={
              <ProtectedRoute>
                <Cursor>
                  <ChildDashboard />
                </Cursor>
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:sessionId"
            element={
              <ProtectedRoute>
                <Cursor>
                  <Practice />
                </Cursor>
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:sessionId/result"
            element={
              <ProtectedRoute>
                <Cursor>
                  <Result />
                </Cursor>
              </ProtectedRoute>
            }
          />
          <Route
            path="/child/history"
            element={
              <ProtectedRoute>
                <Cursor>
                  <ChildHistory />
                </Cursor>
              </ProtectedRoute>
            }
          />
          <Route
            path="/child/badges"
            element={
              <ProtectedRoute>
                <Cursor>
                  <ChildBadges />
                </Cursor>
              </ProtectedRoute>
            }
          />
          <Route
            path="/child/wrong-questions"
            element={
              <ProtectedRoute>
                <Cursor>
                  <WrongQuestions />
                </Cursor>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
