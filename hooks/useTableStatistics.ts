import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { RaportTableInfoI, StatItemReady, TablePatternI, TableStatisticI, TableStatisticListItemI, TableStatisticNotParsedI, UserFullI } from "@/types/types";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import useOrg from "./useOrg";
import { StateReduxI } from "@/redux/store";
import { daySec } from "@/utils/vars";

export default function useTableStatistics() {
    const dispatch = useDispatch();
    const { users }: { users: UserFullI[] } = useSelector((state: any) => state.users);
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);

    //HOOKS
    const { getOrgFullScheme } = useOrg();

    //FIND STAT BY ID
    const statNameById = (statId: number) => tableStatisticsList.find((stat) => stat.id == statId)?.name || "";

    //FIND LATEST STAT PERIOD BY ID
    const getLatestTable = (id: number) => {
        const currentStat = tableStatisticsList.find((stat) => stat.id == id);

        if (currentStat && /@/g.test(currentStat.name)) {
            const statName = currentStat.name.split("@")[0].trim();
            const statsArr = tableStatisticsList.filter((stat) => stat.name.split("@")[0].trim() == statName).toSorted((a, b) => b.id - a.id);
            if (statsArr.length) {
                return statsArr[0];
            } else {
                return currentStat;
            }
        }

        return currentStat;
    };

    //ФУНКЦИЯ  ПРОВЕРКИ ЗАПОЛНЕНОГО ПЕРИОДА✍️⌛
    const addingFilledField = (stat: TableStatisticListItemI, main = false): StatItemReady => {
        const isGrowing = stat.dateColumn.raportInfo?.trendStatus || "нет данных";

        //Формируем строку времен периода
        let periodStr = `не заполнена`;
        if (stat.dateColumn.raportInfo?.lastFilledPeriod?.start && stat.dateColumn.raportInfo?.lastFilledPeriod?.end) {
            periodStr = `${new Date(stat.dateColumn.raportInfo.lastFilledPeriod.start).toLocaleDateString()} - ${new Date(stat.dateColumn.raportInfo.lastFilledPeriod.end).toLocaleDateString()}`;
        }

        if (!stat?.dateColumn.raportInfo) {
            return { ...stat, main, isGrowing, periodStr, filled: false };
        }
        const info: RaportTableInfoI = stat.dateColumn.raportInfo;

        const currentDateSec = new Date().getTime();
        if (info.statHeaders?.[0].trim() == "2 года плюс текущий период") {
            //проверяем заполнение прошлого месяца
            const lastMonth = new Date(new Date().setDate(0));
            lastMonth.setHours(0, 0, 0, 0);
            if (lastMonth.getTime() <= info.lastFilledPeriod?.end) return { ...stat, main, periodStr, isGrowing, filled: true };
            else return { ...stat, main, isGrowing, periodStr, filled: false };
        }
        if (info.statHeaders?.[0].trim() == "13ти недельный период") {
            //проверяем заполнение прошлой недели
            const currentDate = new Date();
            const startOfLastWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() - 6);

            const filled = startOfLastWeek.getTime() <= info.lastFilledPeriod?.start;

            return { ...stat, main, isGrowing, periodStr, filled };
        }
        if (currentDateSec >= info.lastFilledPeriod?.start && currentDateSec <= info.lastFilledPeriod?.end + daySec * 2) return { ...stat, main, isGrowing, periodStr, filled: true };
        if (currentDateSec >= info.lastFilledPeriod?.end + daySec * 2) return { ...stat, main, isGrowing, periodStr, filled: false };

        return { ...stat, main, isGrowing, periodStr, filled: false };
    };

    //GET ALL
    const getAllTableStatistics = async (): Promise<TableStatisticListItemI[]> => {
        dispatch(setLoadingRedux(true));

        try {
            const res: any = await axiosClient.get(`table-statistics`);
            dispatch(setLoadingRedux(false));
            if (res) {
                toast.warning(res.data.message);
                toast.warning(res.data.errorMessage);
            }
            return res.data;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return [];
        }
    };
    //GET ALL
    const getTableStatisticById = async (id: number, loading: boolean = true): Promise<TableStatisticI | undefined> => {
        loading && dispatch(setLoadingRedux(true));

        try {
            const res: any = await axiosClient.get(`table-statistics/${id}`);
            loading && dispatch(setLoadingRedux(false));
            if (res) {
                toast.warning(res.data.message);
                toast.warning(res.data.errorMessage);
                //getOrgFullScheme({});

                if (res.data as TableStatisticNotParsedI) {
                    const table: TableStatisticNotParsedI = res.data;
                    const parsedTable: TableStatisticI = {
                        ...table,
                        headers: JSON.parse(table.headers),
                        rows: JSON.parse(table.rows),
                        columnsWidth: JSON.parse(table.columnsWidth),
                        dateColumn: JSON.parse(table.dateColumn),
                    };
                    // console.log('STAT RES📈', parsedTable);
                    return parsedTable;
                }
            }
            return undefined;
        } catch (err) {
            loading && dispatch(setLoadingRedux(false));
            axiosError(err);
            return undefined;
        }
    };

    //CREATE TABLE PATTERN
    const createTableStatistic = async (table: TableStatisticI) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`table-statistics/create`, {
                tableName: table.tableName,
                dateStart: table!.dateStart,
                dateEnd: table!.dateEnd,
                headers: JSON.stringify(table.headers),
                rows: JSON.stringify(table.rows),
                tableDescriptions: table.tableDescriptions,
                tableDescriptionsName: table.tableDescriptionsName,
                columnsWidth: JSON.stringify(table.columnsWidth),
                dateColumn: JSON.stringify(table.dateColumn),
                about: table.about,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //UPDATE TABLE
    const updateTableStatistic = async (id: number, table: TableStatisticI) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`table-statistics/update/${id}`, {
                tableName: table.tableName,
                dateStart: table!.dateStart,
                dateEnd: table!.dateEnd,
                headers: JSON.stringify(table.headers),
                rows: JSON.stringify(table.rows),
                tableDescriptions: table.tableDescriptions,
                tableDescriptionsName: table.tableDescriptionsName,
                columnsWidth: JSON.stringify(table.columnsWidth),
                dateColumn: JSON.stringify(table.dateColumn),
                about: table.about,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //DELETE TABLE
    const deleteTableStatistic = async (id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.get(`table-statistics/delete/${id}`);
            dispatch(setLoadingRedux(false));
            if (res) {
                toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    return { createTableStatistic, getAllTableStatistics, getTableStatisticById, updateTableStatistic, deleteTableStatistic, statNameById, getLatestTable, addingFilledField };
}
