import { useState } from 'react';
import type { ReactElement } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PresentationProvider } from './context/PresentationContext';
import { SlideViewer } from './components/SlideViewer';
import { ArticleViewer } from './components/ArticleViewer';
import { EditorPanel } from './components/Editor/EditorPanel';

type ViewMode = 'slides' | 'article';

/**
 * Presentation page — renders either slide deck or article view, togglable.
 */
function PresentationPage(): ReactElement {
  const [mode, setMode] = useState<ViewMode>('slides');

  if (mode === 'article') {
    return <ArticleViewer onSwitchToSlides={() => setMode('slides')} />;
  }
  return <SlideViewer onSwitchToArticle={() => setMode('article')} />;
}

/**
 * Root application component.
 * Routes: / → PresentationPage, /editor → EditorPanel.
 * Uses HashRouter for GitHub Pages compatibility (no server config needed).
 */
export function App(): ReactElement {
  return (
    <PresentationProvider>
      <HashRouter>
        <Routes>
          <Route path='/' element={<PresentationPage />} />
          <Route path='/editor' element={<EditorPanel />} />
        </Routes>
      </HashRouter>
    </PresentationProvider>
  );
}

export default App;
