import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import VM from './pages/VM/VMAll';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<VM/>}/>
                <Route path='/' element={<VM/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
