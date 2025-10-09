import { useSelector } from "react-redux";
import styles from "./orgflow.module.scss";
import { StateReduxI } from "@/redux/store";
import {
    ActiveItemI,
    OfficeI,
    OfficeWithStatsI,
    OfficeWithStatsTypeI,
    RaportTableInfoI,
    ReportItemI,
    StatInfoWithData,
    UserFullI,
} from "@/types/types";
import useOrg from "@/hooks/useOrg";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Controls, Edge, Node } from "reactflow";
import MyNode from "./MyNode/MyNode";
import MyEdge from "./MyEdge/MyEdge";
import "reactflow/dist/style.css";
import useTableStatistics from "@/hooks/useTableStatistics";
import { MultiLinesChart2 } from "@/components/elements/Chart/MultilineChart2";
import { clearStatName, replaceFio } from "@/utils/funcs";
import FilterUsers from "./FilterUsers/FilterUsers";
import useUsers from "@/hooks/useUsers";

export default function OrgFlowScreen({ closeFn }: { closeFn: Function }) {
    //VARS
    // const nodeTypes = { myNode: MyNode };
    //const edgeTypes = { myEdge: MyEdge };

    const nodeTypes = useMemo(
        () => ({
            myNode: MyNode,
        }),
        []
    );

    const BOXSIZE_X = 250;
    const BOXSIZE_Y = 150;
    //ref
    const initRef = useRef(true); //сокращаем количество запросов статистикам
    //STATE
    const [reportsList, setReportList] = useState<ReportItemI[]>([]);
    const [orgWithStats, setOrgWithStats] = useState<OfficeWithStatsI[]>([]);

    const [selectedUserId, setSelectedUserID] = useState<number | null>(null);

    //--flow
    const [nodesState, setNodesState] = useState<Node[]>([]);
    const [edgesState, setEdgesState] = useState<Edge[]>([]);

    const [activeItem, setActiveItem] = useState<ActiveItemI | null>(null);
    const [activeStat, setActiveStat] = useState<StatInfoWithData | null>(null);

    //HOOKS
    const { getReportList } = useOrg();
    const { statNameById } = useTableStatistics();
    const { userByID, getUserPosts } = useUsers();

    //SELECTORS
    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === "admin");

    const officesWithLatestPeriodStats = useSelector((state: StateReduxI) => {
        const officesWithLatest = state.org.offices.map((office) => {
            // ЗАМЕНЯЕМ ID СТАТИСТИК НА ПОСЛЕДНИЕ

            const getLatestTable = (id: number) => {
                const currentStat = state.stats.tableStatisticsList.find((stat) => stat.id == id);

                if (currentStat && /@/g.test(currentStat.name)) {
                    const statName = currentStat.name.split("@")[0].trim();
                    const statsArr = state.stats.tableStatisticsList
                        .filter((stat) => stat.name.split("@")[0].trim() == statName)
                        .toSorted((a, b) => b.id - a.id);
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
                        divisions: sec.divisions.map((div) => ({
                            ...div,
                            mainPattern: getLatestTable(div.mainPattern),
                            patterns: div.patterns.map(getLatestTable),
                        })),
                    })),
                })),
            };
        });

        return officesWithLatest;
    });

    //СОБИРАЕМ ВСЕ ID СТАТИСТИК И ПОЛУЧАЕМ ВСЕ ЭТИ СТАТИСТИКИ
    useEffect(() => {
        if (officesWithLatestPeriodStats.length && !reportsList.length && initRef.current) {
            initRef.current = false;
            let arrTemp: number[] = [];
            officesWithLatestPeriodStats.forEach((office) => {
                arrTemp = [...arrTemp, office.mainPattern, ...office.patterns];
                office.departments.forEach((dep) => {
                    arrTemp = [...arrTemp, dep.mainPattern, ...dep.patterns];
                    dep.sections.forEach((sec) => {
                        arrTemp = [...arrTemp, sec.mainPattern, ...sec.patterns];
                        sec.divisions.forEach((div) => {
                            arrTemp = [...arrTemp, div.mainPattern, ...div.patterns];
                        });
                    });
                });
            });

            const currentPatterns = [...new Set(arrTemp.filter((id) => !!id))];
            //console.log("👍", officesWithLatestPeriodStats, currentPatterns);
            getReportList(currentPatterns, setReportList);
        }
    }, [officesWithLatestPeriodStats]);

    //КОГДА МАССИВ СТАТИСТИК ПОЛУЧЕН ФОРМИРУЕМ СТЭЙТ ОРГСХЕМЫ И ДОПИСЫВАЕМ ТУДА ДАННЫЕ СТАТИСТИКИ
    useEffect(() => {
        const getStat = (id: number) => ({
            id,
            name: statNameById(id),
            data: reportsList.find((report) => report.id == id)?.dateColumn?.raportInfo || null,
        });
        if (reportsList.length) {
            const res = officesWithLatestPeriodStats.map((office) => ({
                ...office,
                mainPattern: getStat(office.mainPattern),
                patterns: office.patterns.map((id) => getStat(id)),
                departments: office.departments.map((department) => ({
                    ...department,
                    mainPattern: getStat(department.mainPattern),
                    patterns: department.patterns.map((id) => getStat(id)),
                    sections: department.sections.map((section) => ({
                        ...section,
                        mainPattern: getStat(section.mainPattern),
                        patterns: section.patterns.map((id) => getStat(id)),
                        divisions: section.divisions.map((division) => ({
                            ...division,
                            mainPattern: getStat(division.mainPattern),
                            patterns: division.patterns.map((id) => getStat(id)),
                        })),
                    })),
                })),
            }));

            // console.log("RES", res as OfficeWithStatsI[]);
            setOrgWithStats(res as OfficeWithStatsI[]);
        }
    }, [reportsList]);

    //КОГДА СПИСОК ОРГСХЕМЫ СО СТАТИСТИКАМИ СФОРМИРОВАН, ФОРМИРУЕМ НОДЫ И ЭДЖИ ДЛЯ ФЛОУ
    useEffect(() => {
        console.log("orgWithStats", orgWithStats);
        if (orgWithStats.length) {
            let nodesTemp: Node[] = [];
            const edgesTemp: Edge[] = [];
            const positionY = 200;

            const addNode = (node: Node) => {
                nodesTemp.push(node);
            };

            const addEdge = (edge: Edge) => {
                edgesTemp.push(edge);
            };

            let oficeStartposX = 0;
            //ГЕНЕРАЛЬНЫЙ ДИРЕКТОР
            const genDirUserId = 18;
            const selected = Boolean(selectedUserId && genDirUserId === selectedUserId);
            const blocksCount = orgWithStats.reduce(
                (acc, office) => acc + office.departments.length,
                0
            ); //количество блоков
            const genDirX = oficeStartposX + ((blocksCount * BOXSIZE_X) / 2 - BOXSIZE_X / 2);
            addNode({
                id: "genDir",
                type: "myNode",
                position: { x: genDirX, y: 0 },
                data: {
                    type: "genDir",
                    name: "Генеральный директор",
                    leadership: genDirUserId,
                    setActiveItem,
                    selected,
                    selectedUserId,
                },
            });

            //ОРГСХЕМА
            orgWithStats
                .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
                .forEach((office, offIdx) => {
                    //calc sizes x
                    const blocksArr = [1, office.departments.length];
                    office.departments.forEach((dep) => blocksArr.push(dep.sections.length));

                    const blocksCount = office.departments.length; //количество блоков

                    //add office node
                    const currentOffPosX =
                        oficeStartposX + ((blocksCount * BOXSIZE_X) / 2 - BOXSIZE_X / 2);
                    const currentOffId = `off_${office.id}`;
                    const selected = Boolean(
                        selectedUserId && office.leadership === selectedUserId
                    );
                    addNode({
                        id: currentOffId,
                        type: "myNode",
                        position: { x: currentOffPosX, y: positionY },
                        data: { ...office, type: "off", setActiveItem, selected, selectedUserId },
                    });
                    addEdge({
                        id: `genDir-${currentOffId}`,
                        source: "genDir",
                        target: currentOffId,
                        type: "smoothstep",
                        animated: selected,
                        style: { strokeWidth: 3, stroke: "black" },
                    });

                    //add departments node
                    let departmentStartX = oficeStartposX;
                    office.departments
                        .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
                        .forEach((department, depIdx) => {
                            const currentDepId = `dep_${department.id}`;
                            const selected = Boolean(
                                selectedUserId && department.leadership === selectedUserId
                            );
                            addNode({
                                id: currentDepId,
                                type: "myNode",
                                position: {
                                    x: departmentStartX + depIdx * BOXSIZE_X,
                                    y: positionY + BOXSIZE_Y,
                                },
                                data: {
                                    ...department,
                                    type: "dep",
                                    setActiveItem,
                                    selected,
                                    selectedUserId,
                                },
                            });
                            addEdge({
                                id: `${currentOffId}-${currentDepId}`,
                                source: currentOffId,
                                target: currentDepId,
                                type: "smoothstep",
                                animated: selected,
                                style: { strokeWidth: 2, stroke: "tomato" },
                            });

                            //add sections node
                            let devisionYSpace = 0;
                            department.sections
                                .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
                                .forEach((section, secIdx) => {
                                    const currentSecId = `sec_${section.id}`;
                                    const selected = Boolean(
                                        selectedUserId &&
                                            (section.leadership === selectedUserId ||
                                                getUserPosts(selectedUserId).workerOnSections.some(
                                                    (sec) => sec.id === section.id
                                                ))
                                    );
                                    addNode({
                                        id: currentSecId,
                                        type: "myNode",
                                        position: {
                                            x: departmentStartX + depIdx * BOXSIZE_X,
                                            y:
                                                positionY +
                                                BOXSIZE_Y * 2 +
                                                BOXSIZE_Y * secIdx +
                                                devisionYSpace,
                                        },
                                        data: {
                                            ...section,
                                            type: "sec",
                                            setActiveItem,
                                            selected,
                                            selectedUserId,
                                        },
                                    });
                                    addEdge({
                                        id: `${currentDepId}-${currentSecId}`,
                                        source: currentDepId,
                                        target: currentSecId,
                                        type: "smoothstep",
                                        animated: selected,
                                        style: { strokeWidth: 2, stroke: "blue" },
                                    });

                                    section.divisions.forEach((division, divIdx) => {
                                        devisionYSpace += BOXSIZE_Y;

                                        const currentDivId = `div_${division.id}`;
                                        const selected = Boolean(
                                            selectedUserId &&
                                                (division.leadership === selectedUserId ||
                                                    getUserPosts(
                                                        selectedUserId
                                                    ).workerOnDivisions.some(
                                                        (div) => div.id === division.id
                                                    ))
                                        );
                                        addNode({
                                            id: currentDivId,
                                            type: "myNode",
                                            position: {
                                                x: departmentStartX + depIdx * BOXSIZE_X,
                                                y:
                                                    positionY +
                                                    BOXSIZE_Y * 3 +
                                                    BOXSIZE_Y * secIdx +
                                                    BOXSIZE_Y * divIdx,
                                            },
                                            data: {
                                                ...division,
                                                type: "div",
                                                setActiveItem,
                                                selected,
                                                selectedUserId,
                                            },
                                        });
                                        console.log(currentSecId, currentDivId);
                                        addEdge({
                                            id: `${currentDepId}-${currentDivId}`,
                                            source: currentSecId,
                                            target: currentDivId,
                                            type: "smoothstep",
                                            animated: selected,
                                            style: { strokeWidth: 2, stroke: "orange" },
                                        });
                                    });
                                });
                        });

                    //set next start position
                    oficeStartposX += blocksCount * BOXSIZE_X + 50;
                });
            // console.log("NODES", nodesTemp);
            setNodesState(nodesTemp);
            setEdgesState(edgesTemp);
        }
    }, [orgWithStats, selectedUserId]);

    //MOUSE
    //глобальным слушателем проверяем слудим за активным рефом
    const activeItemRef = useRef<ActiveItemI | null>(null);
    const listnerRef = useRef(true);
    useEffect(() => {
        activeItemRef.current = activeItem ? activeItem : null;
    }, [activeItem]);

    useEffect(() => {
        const mouseMove = (event: MouseEvent) => {
            if (!activeItemRef.current) return;

            const { x, y, width } = activeItemRef.current;
            const { clientX, clientY } = event;

            if (clientY < y || clientX < x - width) {
                setActiveItem(null);
            }
        };

        if (listnerRef.current) {
            document.addEventListener("mousemove", mouseMove);
            listnerRef.current = false;
        }

        return () => {
            document.removeEventListener("mousemove", mouseMove);
            //console.log("END");
            listnerRef.current = true;
        };
    }, []);

    //---------MEMO

    // MENU ITEM
    const menuBlock = useMemo(() => {
        if (
            activeItem &&
            activeItem.eventType === "mouseenter" &&
            (activeItem.type === "sec" || activeItem.type === "div")
        ) {
            //alert(JSON.stringify(activeItem.data.administrators, null, 2));
            return (
                <div
                    className={styles.itemInfo}
                    style={{ top: activeItem.y, left: activeItem.x }}
                    onMouseLeave={() => setActiveItem(null)}
                >
                    {activeItem.data.administrators.length ? "Сотрудники : " : "Нет сотрудников."}
                    <div className={styles.adminsList}>
                        {activeItem.data.administrators.map((admin) => {
                            // console.log(admin);
                            return (
                                <div
                                    key={Math.random()}
                                    className={`${styles.adminItem} ${
                                        admin.user_id === selectedUserId
                                            ? styles.adminItemSelected
                                            : ""
                                    }`}
                                >
                                    <div className={styles.post}>{admin.descriptions}</div>
                                    <div className={styles.name}>
                                        {userByID(admin.user_id)!?.name || ""}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        if (activeItem && activeItem.eventType === "contextmenu" && isAdmin) {
            const { mainPattern, patterns } = activeItem.data;

            return (
                <div
                    className={styles.itemInfo}
                    style={{ top: activeItem.y, left: activeItem.x }}
                    onMouseLeave={() => setActiveItem(null)}
                >
                    <div>Статистики</div>
                    <div
                        className={styles.statItem}
                        onMouseEnter={() => setActiveStat(mainPattern)}
                        onMouseLeave={() => setActiveStat(null)}
                    >
                        {clearStatName(mainPattern.name)}
                    </div>
                    {patterns.map((pattern) => (
                        <div
                            className={styles.statItem}
                            onMouseEnter={() => setActiveStat(pattern)}
                            onMouseLeave={() => setActiveStat(null)}
                        >
                            {clearStatName(pattern.name)}
                        </div>
                    ))}
                </div>
            );
        }
    }, [activeItem]);

    const showSelectedStat = useMemo(() => {
        if (isAdmin && activeStat && activeStat.data?.chartProps) {
            return (
                <div className={styles.statInfo}>
                    {activeStat.name}
                    <MultiLinesChart2
                        {...{ ...activeStat.data?.chartProps, chartName: activeStat.name }}
                        chartSchema={[]}
                        showBtns={false}
                    />
                </div>
            );
        } else {
            return;
        }
    }, [activeStat]);

    return (
        <div className={styles.mainWrap}>
            {/* <div>{JSON.stringify(selectedUserId)}</div> */}
            {/* <pre style={{ fontSize: 8 }}>{JSON.stringify(reportsList, null, 4)}</pre> */}
            <div className={styles.close} onClick={() => closeFn()}>
                ❌
            </div>
            <FilterUsers {...{ selectedUserId, setSelectedUserID }} />
            {showSelectedStat}
            {menuBlock}
            {nodesState.length && (
                <ReactFlow nodes={nodesState} edges={edgesState} nodeTypes={nodeTypes}>
                    <Controls position="bottom-right" />
                </ReactFlow>
            )}
        </div>
    );
}
