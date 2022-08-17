import React from 'react';

import {useNavigate} from "react-router-dom";
import {Button} from "@mui/material";


export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>　404 Not Found</h1>
            <br/>
            <br/>
            <Button variant="text" onClick={() => navigate('/')}>Dashboardに戻る</Button>
            <br/>
        </div>
    );
}
