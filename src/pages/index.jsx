import Layout from "./Layout.jsx";

import Reports from "./Reports";

import Editor from "./Editor";

import Analytics from "./Analytics";

import Collaboration from "./Collaboration";

import Conocimiento from "./Conocimiento";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Reports: Reports,
    
    Editor: Editor,
    
    Analytics: Analytics,
    
    Collaboration: Collaboration,
    
    Conocimiento: Conocimiento,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Reports />} />
                
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Editor" element={<Editor />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Collaboration" element={<Collaboration />} />
                
                <Route path="/Conocimiento" element={<Conocimiento />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}