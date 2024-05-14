import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { ChartItemI } from "@/types/types";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useChartList(setChartsListsArr: any) {
    const dispatch = useDispatch();

    //GET ALL USERS LIST
    const getAllUseresLists = async () => {
        dispatch(setLoadingRedux(true));

        try {
            const res = await axiosClient.get("charts-list");

            console.log(" GET ALL RES 📊", res.data);
            if (res.data?.length) {
                const list = res.data.map((item) => ({ ...item, charts: JSON.parse(item.charts) }));
                setChartsListsArr(list);
            }

            dispatch(setLoadingRedux(false));
        } catch (err) {
            setChartsListsArr([]);
            dispatch(setLoadingRedux(false));
        }
    };
    //DELETE
    const deleteChartList = async (listId: number) => {
        dispatch(setLoadingRedux(true));

        try {
            const res = await axiosClient.get(`charts-list/delete/${listId}`);

            console.log(" DELETE RES 📊", res.data);
            if (res.data?.length) {
                const list = res.data.map((item) => ({ ...item, charts: JSON.parse(item.charts) }));
                setChartsListsArr(list);
            } else {
                setChartsListsArr([]);
            }
            toast.success("Лист удален!");
            dispatch(setLoadingRedux(false));
        } catch (err) {
            setChartsListsArr([]);
            dispatch(setLoadingRedux(false));
        }
    };

    //CREATE
    const createChartsList = async (name: string, chartsState: ChartItemI[], descriptions: string = "") => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`charts-list/create`, {
                name,
                charts: JSON.stringify(chartsState),
                descriptions,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                console.log("RES OF CREATE CHART LIST📊", res);
                toast.success("Лист графиков успешно сохранен!");
                toast.warning(res.data.errorMessage);
                if (res.data?.length) {
                    const list = res.data.map((item) => ({ ...item, charts: JSON.parse(item.charts) }));
                    setChartsListsArr(list);
                }
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //UPDATE
    const updateChartsList = async (listId: number, chartsState: ChartItemI[], descriptions: string = "") => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`charts-list/update`, {
                listId,
                charts: JSON.stringify(chartsState),
                descriptions,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                console.log("RES OF UPDATE CHART LIST📊", res);

                if (res.data?.length) {
                    const list = res.data.map((item) => ({ ...item, charts: JSON.parse(item.charts) }));
                    setChartsListsArr(list);
                }
                toast.success("Лист графиков успешно обновлен!");
                toast.warning(res.data.errorMessage);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    //CHART LIST TO USER
    const chartListToUser = async (listId: number, userId: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`charts-list/to-user`, {
                chartId: listId,
                userId,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                toast.success("График-лист успешно предоставлен пользователю");
                toast.warning(res.data.errorMessage);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    return {
        createChartsList,
        getAllUseresLists,
        deleteChartList,
        updateChartsList,
        chartListToUser,
    };
}
