import { StateReduxI } from "@/redux/store";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./repTable.module.scss";
import { nanoid } from "@reduxjs/toolkit";
import { DateColumnI, DepartmentI, OfficeI, RaportTableInfoI, ReportItemI, SectionI, TableStatisticI } from "@/types/types";
import useOrg from "@/hooks/useOrg";
import useStatistic from "@/hooks/useStatistic";
import useTableStatistics from "@/hooks/useTableStatistics";
import { clearStatName } from "@/utils/funcs";
import { daySec } from "@/utils/vars";
import Modal from "@/components/elements/Modal/Modal";
import EditableStatisticTable from "@/components/elements/EditableStatisticTable/EditableStatisticTable";
import { MultiLinesChart2 } from "@/components/elements/Chart/MultilineChart2";
import CreateRaport from "./CreateRaport/CreateRaport";
import CreateChartList from "./CreateChartsList/CreateChartList";

export default function ReportTables() {
    //SELECTORS

    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);

    const officesWithLatestPeriodStats = useSelector((state: StateReduxI) =>
        state.org.offices.map((office) => {
            // ЗАМЕНЯЕМ ID СТАТИСТИК НА ПОСЛЕДНИЕ

            const getLatestTable = (id: number) => {
                const currentStat = state.stats.tableStatisticsList.find((stat) => stat.id == id);

                if (currentStat && /@/g.test(currentStat.name)) {
                    const statName = currentStat.name.split("@")[0].trim();
                    const statsArr = state.stats.tableStatisticsList.filter((stat) => stat.name.split("@")[0].trim() == statName).toSorted((a, b) => b.id - a.id);
                    if (statsArr.length) {
                        return statsArr[0].id;
                    } else {
                        return id;
                    }
                }
                return id;
            };

            return {
                ...office,
                mainPattern: getLatestTable(office.mainPattern),
                patterns: office.patterns.map((stat) => getLatestTable(stat)),
                departments: office.departments.map((dep) => ({
                    ...dep,
                    mainPattern: getLatestTable(dep.mainPattern),
                    patterns: dep.patterns.map((stat) => getLatestTable(stat)),
                    sections: dep.sections.map((sec) => ({
                        ...sec,
                        mainPattern: getLatestTable(sec.mainPattern),
                        patterns: sec.patterns.map((stat) => getLatestTable(stat)),
                    })),
                })),
            };
        })
    ) as OfficeI[];

    //STATE
    const [currentTargets, setCurrentTargets] = useState<any[]>(officesWithLatestPeriodStats);
    const [depList, setDepList] = useState<DepartmentI[]>([]);
    const [secList, setSecList] = useState<SectionI[]>([]);

    const [officeSelect, setOfficeSelect] = useState(0);
    const [depSelect, setDepSelect] = useState(0);
    const [secSelect, setSecSelect] = useState(0);
    const [reportsList, setReportList] = useState<ReportItemI[]>([]);

    const [statTypeSelect, setStatTypeSelect] = useState<"main" | "additional" | "all" | "allOrg">("allOrg");

    const [statTypeFilter, setStatTypeFilter] = useState<"main" | "additional" | "all">("all");

    const [infoFilter, setInfoFilter] = useState<"Растущая" | "Падающая" | null>(null);

    const [selectedTable, setSelectedTable] = useState<TableStatisticI | "clear" | undefined>();

    const [filledFilter, setFilledFilter] = useState<"none" | "filled" | "notFilled">("none");

    const [chartHTML, setChartHTML] = useState<any>();
    const [isCreateRap, setIsCreateRap] = useState(false);

    const [itemFilter, setItemFilter] = useState(["off", "sec", "dep"]);

    const [officeIdFilter, setOfficeIdFilter] = useState(0);

    // const [isCreateCharts, setIsCreateCharts] = useState(false);
    //filters counts
    const [filledStatIdArr, setfilledStatIdArr] = useState<number[]>([]);
    const addFilledStat = (id: number) => setfilledStatIdArr((state) => [...new Set([...state, id])]);
    const [notFilledStatIdArr, setNotFilledStatIdArr] = useState<number[]>([]);
    const addNotFilledStat = (id: number) => setNotFilledStatIdArr((state) => [...new Set([...state, id])]);

    const [growingStatIdArr, setGrowingStatIdArr] = useState<number[]>([]);
    const addGrowingStat = (id: number) => setGrowingStatIdArr((state) => [...new Set([...state, id])]);
    const [notGrowingStatIdArr, setNotGrowingStatIdArr] = useState<number[]>([]);
    const addNotGrowingStat = (id: number) => setNotGrowingStatIdArr((state) => [...new Set([...state, id])]);

    //HOOKS
    const { getReportList } = useOrg();
    const { statNameById, getTableStatisticById } = useTableStatistics();

    //FUNCS

    //ITEM FILTER TOGGLE
    const itemFilterToggle = (type: "off" | "sec" | "dep") => {
        setItemFilter((state) => (state.includes(type) ? state.filter((otype) => otype !== type) : [...state, type]));
    };

    //SELECT TEBLE
    const onSelectTable = (tableId: number) => {
        const currentTable = tableStatisticsList.find((table) => table.id == tableId);
        if (currentTable) {
            getTableStatisticById(tableId).then(setSelectedTable);
        }
    };

    //EFFECTS
    useEffect(() => {
        // ON OFFICE SELECT
        if (officeSelect) {
            const curOffice = officesWithLatestPeriodStats.find((office) => office.id == officeSelect) || { departments: [] };
            setCurrentTargets(curOffice.departments);
            setDepList(curOffice.departments);
        } else {
            setCurrentTargets(officesWithLatestPeriodStats);
            setDepList([]);
            setDepSelect(0);
        }
    }, [officeSelect]);
    useEffect(() => {
        // ON DEPARTMENT SELECT
        if (depSelect) {
            const curDep = depList.find((dep) => dep.id == depSelect);
            if (!curDep) return;
            setCurrentTargets(curDep.sections);
        } else {
            if (officeSelect) {
                const curOffice = officesWithLatestPeriodStats.find((office) => office.id == officeSelect) || { departments: [] };
                setCurrentTargets(curOffice.departments);
            }
        }
    }, [depSelect]);

    //SET REPORT LIST ON CHANGE TARGET
    useEffect(() => {
        if (currentTargets.length) {
            let currentPatterns: number[] = [];
            if (statTypeSelect == "main") {
                currentPatterns = currentTargets.map((item) => item.mainPattern);
            }
            if (statTypeSelect == "additional") {
                currentPatterns = currentTargets.map((item) => item.patterns).flat();
            }

            if (statTypeSelect == "all") {
                currentPatterns = currentTargets.map((item) => [item.mainPattern, ...item.patterns]).flat();
            }

            if (statTypeSelect == "allOrg") {
                let arrTemp: number[] = [];
                officesWithLatestPeriodStats.forEach((office) => {
                    arrTemp = [...arrTemp, office.mainPattern, ...office.patterns];
                    office.departments.forEach((dep) => {
                        arrTemp = [...arrTemp, dep.mainPattern, ...dep.patterns];
                        dep.sections.forEach((sec) => {
                            arrTemp = [...arrTemp, sec.mainPattern, ...sec.patterns];
                        });
                    });
                });

                currentPatterns = [...new Set(arrTemp)];
            }
            //console.log('currentPatterns', currentPatterns);

            getReportList(currentPatterns, setReportList);
        }
    }, [currentTargets, statTypeSelect]);

    const StatRaportItem = ({ statId, main }: { statId: number; main: boolean }) => {
        const info: RaportTableInfoI | undefined = reportsList.find((report) => report.id == statId)?.dateColumn?.raportInfo;
        if (!statNameById(statId)) return; // не отображаем удаленную статистику
        if (!info) {
            // console.log('INFO',info)

            return (
                <div className={`${styles.statItem} ${main ? styles.statItemMain : ""}`}>
                    <div className={styles.statName}>{clearStatName(statNameById(statId))}</div>
                </div>
            );
        }

        if (info.statFilled == "clean") {
            return (
                <div className={`${styles.statItem} ${main ? styles.statItemMain : ""}`}>
                    <div className={styles.statName}>{clearStatName(statNameById(statId))}</div>
                    <div className={styles.infoBlock}>
                        <span className={styles.trendType}>пустая статистика</span>
                    </div>
                </div>
            );
        }

        const showGraph = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            //----------------------------------------------------------------- SHOW GRAPH 📈
            event.preventDefault();
            if (info.chartProps) {
                setChartHTML(<MultiLinesChart2 {...{ ...info.chartProps }} chartSchema={[]} showBtns={false} />);
            } else {
                setChartHTML(undefined);
            }
        };

        const growing = /Растущая/g.test(info.trendStatus);

        if (infoFilter == "Падающая" && growing) {
            return <></>;
        }
        if (infoFilter == "Растущая" && !growing) {
            return <></>;
        }

        const currentDateSec = new Date().getTime();

        //---- ПРОВЕРКА ЗАПОЛНЕНОГО АКТУАЛЬНОГО ПЕРИОДА (скопирована еще на 300стр)
        const checkFilledPeriod = (): boolean => {
            if (info.statHeaders?.[0].trim() == "2 года плюс текущий период") {
                //проверяем заполнение прошлого месяца
                const lastMonth = new Date(new Date().setDate(0));
                lastMonth.setHours(0, 0, 0, 0);
                if (lastMonth.getTime() <= info.lastFilledPeriod?.end) return true;
                else return false;
            }
            if (info.statHeaders?.[0].trim() == "13ти недельный период") {
                //проверяем заполнение прошлой недели
                const currentDate = new Date();
                const startOfLastWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() - 6);
                console.log(startOfLastWeek);

                console.log("LAST", startOfLastWeek);

                if (startOfLastWeek.getTime() <= info.lastFilledPeriod?.end) return true;
                else return false;
            }
            if (currentDateSec >= info.lastFilledPeriod?.start && currentDateSec <= info.lastFilledPeriod?.end + daySec * 2) return true;
            if (currentDateSec >= info.lastFilledPeriod?.end + daySec * 2) return false;

            return false;
        };

        //--- ДОБАВЛЕНИЕ В СЧЕТЧИК ЧИСЛА ФИЛЬТРОВ (ЗАПОЛНЕНЫХ / не ЗАПОЛНЕНЫХ)
        checkFilledPeriod() ? addFilledStat(statId) : addNotFilledStat(statId); //----------------------------------- !!!!!!!!!!!!!!!! FILLED COUNT ❗❗❗❗❗❗❗❗

        if (filledFilter == "none" || (!checkFilledPeriod() && filledFilter == "notFilled") || (checkFilledPeriod() && filledFilter == "filled")) {
            growing ? addGrowingStat(statId) : addNotGrowingStat(statId);
            return (
                <div
                    className={`${styles.statItem} ${main ? styles.statItemMain : ""}`}
                    style={{ border: `2px solid black` }}
                    onClick={() => onSelectTable(statId)} // --------------------LOAD TABLE STAT🚩🚩🚩🚩🚩🚩
                    onContextMenu={showGraph}
                    //onMouseLeave={()=>setChartHTML(undefined)}
                >
                    <div className={styles.statName}>
                        <span>{clearStatName(statNameById(statId))}</span>
                    </div>
                    <div className={styles.infoBlock}>
                        <span className={styles.dates}>{` ${new Date(info?.lastFilledPeriod?.start || "").toLocaleDateString()} -  ${new Date(info?.lastFilledPeriod?.end || "").toLocaleDateString()} ${checkFilledPeriod() ? "✅" : "🕗"}`}</span>
                        <span className={styles.trendType}>{info.trendType}</span>
                        <span className={styles.trendStatus} onMouseEnter={showGraph} onMouseLeave={() => setChartHTML(undefined)} style={{ cursor: "help" }}>
                            <span className={`${styles[growing + ""]}`}>{info.trendStatus}</span>
                        </span>
                    </div>
                </div>
            );
        } else {
            return false;
        }
    };

    const OrgItem = ({ item, color }: { item: OfficeI | DepartmentI | SectionI; color: string }) => {
        let itemStatsArr: number[] = [];
        switch (statTypeFilter) {
            case "main":
                itemStatsArr = [item.mainPattern];
                break;
            case "additional":
                itemStatsArr = [...item.patterns];
                break;

            default:
                itemStatsArr = [item.mainPattern, ...item.patterns];
                break;
        }
        if (!itemStatsArr.length) return;
        const isNotDeletedStats = !!itemStatsArr.reduce((acc, statID) => (!!statNameById(statID) ? acc + 1 : acc), 0); // ЕСТЬ ЛИ НЕ УДАЛЕННЫЕ СТАТИСТИКИ
        const readyStats = itemStatsArr.reduce((acc, statId) => {
            // ВЫЯСНЯЕМ ОТОБРАЖЕНИЕ ВСЕГО БЛОКА ПО ФИЛЬТРАМ
            const info: RaportTableInfoI | undefined = reportsList.find((report) => report.id == statId)?.dateColumn?.raportInfo;
            if (info) {
                const growing = /Растущая/g.test(info.trendStatus);

                const currentDateSec = new Date().getTime();

                const checkFilledPeriod = (): boolean => {
                    if (info.statHeaders?.[0].trim() == "2 года плюс текущий период") {
                        //проверяем заполнение прошлого месяца
                        const lastMonth = new Date(new Date().setDate(0));
                        lastMonth.setHours(0, 0, 0, 0);
                        if (lastMonth.getTime() <= info.lastFilledPeriod?.end) return true;
                        else return false;
                    }
                    if (info.statHeaders?.[0].trim() == "13ти недельный период") {
                        //проверяем заполнение прошлой недели
                        const currentDate = new Date();
                        const startOfLastWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() - 6);
                        console.log(startOfLastWeek);

                        console.log("LAST", startOfLastWeek);

                        if (startOfLastWeek.getTime() <= info.lastFilledPeriod?.end) return true;
                        else return false;
                    }

                    if (currentDateSec >= info.lastFilledPeriod?.start && currentDateSec <= info.lastFilledPeriod?.end + daySec * 2) return true;
                    if (currentDateSec >= info.lastFilledPeriod?.end + daySec * 2) return false;

                    return false;
                };
                if (infoFilter || filledFilter != "none") {
                    if (infoFilter == "Падающая" && growing) return acc;
                    if (infoFilter == "Растущая" && !growing) return acc;
                    if (filledFilter == "filled" && !checkFilledPeriod()) return acc;
                    if (filledFilter == "notFilled" && checkFilledPeriod()) return acc;
                    if ((infoFilter || filledFilter) && !info?.lastFilledPeriod) return acc; //если пустая
                    // if (statTypeFilter=='main'&&!item.mainPattern) return acc;
                    // if (statTypeFilter=='additional') return acc;
                    return acc + 1;
                } else {
                    return acc;
                }
            } else {
                return acc;
            }
        }, 0);

        // if(!infoFilter||((infoFilter||filledFilter!='none')&&readyStats>0))
        if (((infoFilter || filledFilter != "none") && !readyStats) || !isNotDeletedStats) return;

        return (
            <div key={nanoid()} className={styles.reportItem} style={{ background: color }}>
                <div className={styles.itemName}>{item.name}</div>
                {statTypeFilter !== "additional" && <StatRaportItem statId={item.mainPattern} main={true} />}
                {statTypeFilter !== "main" && (
                    <div className={styles.additionalsList}>
                        {item.patterns.map((statId) => (
                            <StatRaportItem key={nanoid()} statId={statId} main={false} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // MEMOS
    const reportsListHTML = useMemo(() => {
        // if(infoFilter){
        //     setfilledStatIdArr(()=>[]);
        //     setNotFilledStatIdArr(()=>[]);
        // }
        // // if(filledFilter=='filled'){
        // //     console.log(filledFilter)
        // //     setGrowingStatIdArr(()=>[]);
        // //     setNotGrowingStatIdArr(()=>[]);

        // // }

        if (infoFilter && filledFilter == "none") {
            setfilledStatIdArr([]);
            setNotFilledStatIdArr([]);
            setNotFilledStatIdArr(() => []);
        }

        if (filledFilter !== "none" && !infoFilter) {
            setGrowingStatIdArr(() => []);
            setNotGrowingStatIdArr(() => []);
            setNotFilledStatIdArr(() => []);
        }

        if (statTypeFilter !== "all") {
            setGrowingStatIdArr(() => []);
            setNotGrowingStatIdArr(() => []);
            setNotFilledStatIdArr(() => []);
        }

        if (itemFilter.length !== 3) {
            setGrowingStatIdArr(() => []);
            setNotGrowingStatIdArr(() => []);
            setNotFilledStatIdArr(() => []);
        }

        if (officeIdFilter !== 0) {
            setGrowingStatIdArr(() => []);
            setNotGrowingStatIdArr(() => []);
            setNotFilledStatIdArr(() => []);
        }

        if (currentTargets.length) {
            return (
                <div className={styles.reportsListBlock}>
                    {statTypeSelect == "allOrg" &&
                        (officesWithLatestPeriodStats as OfficeI[]).map((office) => {
                            if (officeIdFilter && officeIdFilter != office.id) {
                                return;
                            }
                            return (
                                <>
                                    {itemFilter.includes("off") && <OrgItem item={office} color="" />}

                                    {office.departments.map((dep) => (
                                        <>
                                            {itemFilter.includes("dep") && <OrgItem item={dep} color="steelblue" />}

                                            {itemFilter.includes("sec") && dep.sections.map((sec) => <OrgItem item={sec} color="#2a9955d7" />)}
                                        </>
                                    ))}
                                </>
                            );
                        })}
                </div>
            );
        }
    }, [currentTargets, reportsList, statTypeSelect, infoFilter, filledFilter, statTypeFilter, itemFilter, officeIdFilter]);

    // INFO BLOCK
    const getReportsInfoStat = useMemo(() => {
        // console.log('RAPORT LIST', reportsList)

        if (reportsList.length)
            return (
                <div className={styles.filtersWrap}>
                    <div className={styles.reportsInfoBlock}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <div className={styles.growing} onClick={() => setInfoFilter("Растущая")}>
                                Растущих статистик : {growingStatIdArr.length}
                            </div>
                            {infoFilter == "Растущая" && (
                                <div onClick={() => setInfoFilter(null)} style={{ cursor: "pointer" }}>
                                    ❌
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <div className={styles.falling} onClick={() => setInfoFilter("Падающая")}>
                                Падающих статистик : {notGrowingStatIdArr.length}
                            </div>
                            {infoFilter == "Падающая" && (
                                <div onClick={() => setInfoFilter(null)} style={{ cursor: "pointer" }}>
                                    ❌
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.reportsInfoBlock}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <div className={styles.growing} onClick={() => setFilledFilter("filled")}>
                                Заполненные статистики : {filledStatIdArr.length}
                            </div>
                            {filledFilter == "filled" && (
                                <div onClick={() => setFilledFilter("none")} style={{ cursor: "pointer" }}>
                                    ❌
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <div className={styles.falling} onClick={() => setFilledFilter("notFilled")}>
                                He заполненные статистики : {notFilledStatIdArr.length}
                            </div>
                            {filledFilter == "notFilled" && (
                                <div onClick={() => setFilledFilter("none")} style={{ cursor: "pointer" }}>
                                    ❌
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
    }, [reportsList, statTypeSelect, infoFilter, filledFilter, filledStatIdArr, notFilledStatIdArr, growingStatIdArr, notGrowingStatIdArr, statTypeFilter, itemFilter, officeIdFilter]);

    //test
    useEffect(() => {
        //  console.log('REPORT LIST', reportsList)
    }, [reportsList]);

    if (isCreateRap) {
        return <CreateRaport />;
    }

    // if (isCreateCharts) {
    //     return <CreateChartList />;
    // }

    return (
        <div className={styles.reportMainWrap}>
            <div style={{ display: "flex", gap: 20 }}>
                {/* <button onClick={() => alert(JSON.stringify({ growingStatIdArr, notGrowingStatIdArr, filledStatIdArr, notFilledStatIdArr }))}>check</button> */}
                <button onClick={() => setIsCreateRap(true)}>Создать отчет</button>
                {/* <button onClick={() => setIsCreateCharts(true)}>Создать график лист</button> */}
            </div>

            {chartHTML && (
                <div className={styles.graphWin}>
                    <div className={styles.graphClose} onClick={() => setChartHTML(undefined)}>
                        ❌
                    </div>
                    {chartHTML}
                </div>
            )}

            {
                // SLECTED TABLE
                selectedTable && (
                    <Modal closeModalFunc={() => setSelectedTable(undefined)}>
                        <div style={{ background: "white", padding: 10, marginRight: 5 }}>
                            <EditableStatisticTable selectedTable={selectedTable} disableSelectOnList={() => {}} view={true} />
                        </div>
                    </Modal>
                )
            }
            <div className={styles.filterWrap}>
                {/* ВЫБОР ПО ТАРГЕТУ - ОТКЛЮЧЕН ❗❗❗❗
                <select value={statTypeSelect} onChange={(event) => setStatTypeSelect(event.target.value as typeof statTypeSelect)} hidden>
                    <option value={'all'}>Все статистики</option>
                    <option value={'main'}>Главные статистики</option>
                    <option value={'additional'}>Дополнительные статистики</option>
                    <option value={'allOrg'}>Вся орг схема</option>
                </select> */}

                <select className={styles.officeSelect} value={officeIdFilter} onChange={(event) => setOfficeIdFilter(Number(event.target.value))}>
                    <option value={0}> все отделения</option>
                    {officesWithLatestPeriodStats
                        .toSorted((a, b) => Number(a.name.split(" ")[0]) - Number(b.name.split(" ")[0]))
                        .map((office) => (
                            <option value={office.id} key={nanoid()}>
                                🏢{office.name}
                            </option>
                        ))}
                </select>

                <select className={styles.statTypeSelect} value={statTypeFilter} onChange={(event) => setStatTypeFilter(event.target.value as typeof statTypeFilter)}>
                    <option value={"all"}>Все статистики</option>
                    <option value={"main"}>🚩Главные статистики</option>
                    <option value={"additional"}>➕Дополнительные статистики</option>
                </select>

                <div className={styles.itemsFilterBlock}>
                    <div className={`${styles.itemFilterBtn} ${itemFilter.includes("off") ? styles.itemFilterBtnOff : ""} noselect`} onClick={() => itemFilterToggle("off")}>
                        отделения
                    </div>
                    <div className={`${styles.itemFilterBtn} ${itemFilter.includes("dep") ? styles.itemFilterBtnDep : ""} noselect`} onClick={() => itemFilterToggle("dep")}>
                        отделы
                    </div>
                    <div className={`${styles.itemFilterBtn} ${itemFilter.includes("sec") ? styles.itemFilterBtnSec : ""} noselect`} onClick={() => itemFilterToggle("sec")}>
                        секции
                    </div>
                </div>
            </div>

            {statTypeSelect !== "allOrg" && (
                <div className={styles.filterBlock}>
                    <select value={officeSelect} onChange={({ target: { value } }) => setOfficeSelect(+value)}>
                        <option value={0}>Выбор отдела</option>
                        {officesWithLatestPeriodStats.map((office) => (
                            <option key={nanoid()} value={office.id}>
                                {office.name}
                            </option>
                        ))}
                    </select>
                    {!!officeSelect && (
                        <select value={depSelect} onChange={({ target: { value } }) => setDepSelect(+value)}>
                            <option value={0}>Выбор отделения</option>
                            {depList.map((dep) => (
                                <option key={nanoid()} value={dep.id}>
                                    {dep.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}
            {getReportsInfoStat}

            {reportsListHTML}
        </div>
    );
}
