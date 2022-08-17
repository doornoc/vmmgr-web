import {atom} from "recoil";
import {VMDetail, WebSocketResult} from "../interface";

export const WebSocketState = atom<WebSocketResult | null>({
    key: 'webSocketState',
    default: null,
    dangerouslyAllowMutability: true
});

export const VMsState = atom<VMDetail[]>({
    key: 'VMS_STATE',
    default: [],
});
