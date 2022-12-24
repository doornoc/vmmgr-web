import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import VM from './pages/VM/VM';
import Create from "./pages/VM/Create";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<VM/>}/>
                <Route path='/create' element={<Create/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
