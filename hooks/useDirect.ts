import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { IDirectHeader, ILogicCell, ISelectedStatsListItem } from "@/types/types";
import { AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useDirect() {
    const dispatch = useDispatch();

    const getDirectSettings = async ({ defaultHeaders, setHeaders, setCacheStstsLogic }: { defaultHeaders: IDirectHeader[]; setHeaders: Function; setCacheStstsLogic: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.get(`direct/settings`);
            dispatch(setLoadingRedux(false));
            // console.log("⭐⭐⭐SETTINGS RES", res.data);
            const headersLoaded = JSON.parse(res.data.columns || "[]");
            const cacheStatsLogicsLoaded = new Map<string, ILogicCell[]>(Object.entries(JSON.parse(res.data.cacheStatsLogics || "{}")));
            setHeaders(headersLoaded.length ? headersLoaded : defaultHeaders);
            setCacheStstsLogic(cacheStatsLogicsLoaded);
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };

    const getProtocolList = async ({ setProtocolList }: { setProtocolList: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res = await axiosClient.get(`direct/dir-list`);
            dispatch(setLoadingRedux(false));

            //console.log("📃 LIST RES", res.data);
            if (res.data) {
                setProtocolList(res.data);
            }
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };
    const getProtocolById = async ({ id, setCacheStstsLogic, setHeaders, setInfo, setMembers, setTables }: { id: number; setCacheStstsLogic: Function; setHeaders: Function; setInfo: Function; setMembers: Function; setTables: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res = await axiosClient.get(`direct/dir-by-id/${id}`);
            dispatch(setLoadingRedux(false));

            //console.log("➡️ PROTOCOL BY ID", res.data);
            if (res.data) {
                const { cacheStatsLogics, columns, info, members, tabels } = res.data;
                const headersLoaded = JSON.parse(columns || "[]");
                const cacheStatsLogicsLoaded = new Map<string, ILogicCell[]>(Object.entries(JSON.parse(cacheStatsLogics || "{}")));
                const infoLoaded = JSON.parse(info);
                const membersLoaded = JSON.parse(members);
                const tabelsLoaded = JSON.parse(tabels);
                setHeaders(headersLoaded);
                setCacheStstsLogic(cacheStatsLogicsLoaded);
                setInfo(infoLoaded);
                setMembers(membersLoaded);
                setTables(tabelsLoaded);
            }
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };
    const deleteProtocolById = async ({ id, afterFunc }: { id: number; afterFunc: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res = await axiosClient.get(`direct/dir-del-id/${id}`);
            dispatch(setLoadingRedux(false));

            if (res.data) {
                toast.success(res.data.message);
                afterFunc();
            }
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };

    const saveHeaders = async ({ headers }: { headers: string }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`direct/set-headers`, {
                headers,
            });
            dispatch(setLoadingRedux(false));
            // console.log("😲HEADERS RES", res.data);
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };
    const saveLogic = async ({ cacheStatsLogics }: { cacheStatsLogics: string }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`direct/set-logic`, {
                cacheStatsLogics,
            });
            dispatch(setLoadingRedux(false));
            // console.log("⚙️LOGIC RES", res.data);
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };

    const saveDirect = async ({ columns, cacheStatsLogics, info, members, tabels }: { columns: string; cacheStatsLogics: string; info: string; members: string; tabels: string }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`direct/dir-save`, {
                columns,
                cacheStatsLogics,
                info,
                members,
                tabels,
            });
            dispatch(setLoadingRedux(false));
            toast.success(res.data.message);
            // console.log("✅ SAVE DIR RES", res.data);
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };

    //SELECTED LISTS
    const getSelectedLists = async ({ setSelectedStatsList }: { setSelectedStatsList: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res = await axiosClient.get(`direct/all_selected_lists`);
            dispatch(setLoadingRedux(false));

            //console.log("📃 LIST RES", res.data);
            if (res.data) {
                const parcedList = res.data.map((list) => ({ id: list.id, name: list.name, selectedStats: JSON.parse(list.selectedStats) }));
                setSelectedStatsList(parcedList);
            }
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };

    const saveSelectedList = async ({ name, selectedStats, setSelectedStatsList }: ISelectedStatsListItem & { setSelectedStatsList: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`direct/save_selected_list`, {
                name,
                selectedStats: JSON.stringify(selectedStats),
            });
            dispatch(setLoadingRedux(false));
            if (res.data) {
                const parcedList = res.data.map((list) => ({ id: list.id, name: list.name, selectedStats: JSON.parse(list.selectedStats) }));
                setSelectedStatsList(parcedList);
            }
            toast.success("лист успешно сохранен");
            // console.log("✅ SAVE DIR RES", res.data);
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };
    const deleteListById = async ({ id, setSelectedStatsList }: { id: number; setSelectedStatsList: Function }) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.get(`direct/delete_list/${id}`);
            dispatch(setLoadingRedux(false));
            if (res.data) {
                const parcedList = res.data.map((list) => ({ id: list.id, name: list.name, selectedStats: JSON.parse(list.selectedStats) }));
                setSelectedStatsList(parcedList);
            }
            toast.success("Лист успешно удален");
            // console.log("✅ SAVE DIR RES", res.data);
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return null;
        }
    };

    return { getDirectSettings, saveHeaders, saveLogic, saveDirect, getProtocolList, getProtocolById, deleteProtocolById, getSelectedLists, saveSelectedList, deleteListById };
}
