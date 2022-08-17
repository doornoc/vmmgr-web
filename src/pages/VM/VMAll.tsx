import {useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useSnackbar} from "notistack";
import useWebSocket from "react-use-websocket";
import {
    Button,
    Card, CardActions,
    CardContent,
    Container,
    FormControl,
    FormControlLabel, InputBase,
    Paper,
    Radio,
    RadioGroup,
    Typography
} from "@mui/material";
import {restfulApiConfig} from "../../Config";
import Base from "../../components/Base";
import {VMDetail} from "../../interface";
import {useRecoilState} from "recoil";
import {VMsState} from "../../api/Recoil";

export default function VM() {
    const [vms, setVMs] = useRecoilState(VMsState);
    const tmpVMs:VMDetail[] = [];
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    // 1:有効 2:無効
    const {sendMessage, lastMessage, readyState,} = useWebSocket(restfulApiConfig.wsURL + "/vm", {
        onOpen: () => enqueueSnackbar("WebSocket接続確立", {variant: "success"}),
        onClose: () => enqueueSnackbar("WebSocket切断", {variant: "error"}),
        shouldReconnect: (closeEvent) => true,
    });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        sendMessage(JSON.stringify({
            type: 2
        }));
    }, []);

    useEffect(() => {
        if (lastMessage == null) {
            return;
        }
        console.log(lastMessage)
        const obj = JSON.parse(lastMessage?.data);
        if (obj.error) {
            enqueueSnackbar("Error: " + obj.error, {variant: "error"})
            return;
        }
        if (obj.type <= 2) {
            for (let i = 0; i < obj.vm_detail.length; i++) {
                if (tmpVMs?.find(vms => vms.vm?.UUID === obj.vm_detail[i].vm.UUID && vms.node === obj.vm_detail[i].node) == null) {
                    console.log(obj.vm_detail[i])
                    tmpVMs.push(obj.vm_detail[i])
                }
            }
        }
        setVMs(tmpVMs)
        ref.current?.scrollIntoView()
    }, [lastMessage]);

    useEffect(()=>{
        console.log(vms)
    },[vms])

    const clickDetailPage = (nodeID: number, uuid: string) => {
        navigate('/dashboard/vm/' + nodeID + '/' + uuid);
    }

    const clickNoVNC = (ip: string, port: string) => {
        window.location.replace(restfulApiConfig.noVNCURL + "?host=" + ip + "&port=" + port + "&path=")
    }

    return (
        <Base>
            <Container component="main">
                <br/>
                <br/>
                <h2>VM Lists</h2>
                {
                    vms?.map((vm: VMDetail) => (
                        <Card>
                            <CardContent>
                                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    {vm.node}
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {vm.vm.Title}
                                </Typography>
                                <Typography sx={{mb: 1.5}} color="text.secondary">
                                    {vm.vm.UUID}
                                </Typography>
                                VCPU: {vm.vm.VCPU.Value}<br/>
                                Mem: {vm.vm.CurrentMemory.Value} {vm.vm.CurrentMemory.Unit}
                                {
                                    vm.vm.Devices.Graphics != null &&
                                  <div>
                                    VNCPort: {vm.vm.Devices.Graphics[0].VNC.Port}<br/>VNCWebSocketPort: {vm.vm.Devices.Graphics[0].VNC.WebSocket}
                                  </div>
                                }
                                {/*<VMStatus key={"status"} status={vm.status}/>*/}
                                <br/><br/>
                                {/*CPU: {vm.vcpu} Memory: {vm.memory}KB*/}
                            </CardContent>
                            <CardActions>
                                {
                                    vm.vm.Devices.Graphics != null &&
                                  <Button variant="contained" color="primary" onClick={() =>
                                      clickNoVNC(vm.node, vm.vm.Devices.Graphics[0].VNC.WebSocket)}> NoVNC </Button>
                                }

                                {/*<Button size="small" onClick={() => clickDetailPage(vm.node_id, vm.uuid)}>Detail</Button>*/}
                            </CardActions>
                        </Card>
                    ))
                }
            </Container>
        </Base>
    );
}
