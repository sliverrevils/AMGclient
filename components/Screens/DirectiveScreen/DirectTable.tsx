import { IChartPropListItem, IDirectHeader, IDirectOffice, IDirectTable, ILogicCell, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI } from "@/types/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import DirectStat from "./DirectStat";
import styles from "./table.module.scss";

import useTableStatistics from "@/hooks/useTableStatistics";
import { clearStatName } from "@/utils/funcs";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import Modal from "@/components/elements/Modal/Modal";
import { ChatBubbleBottomCenterIcon, CheckCircleIcon, DocumentPlusIcon, EllipsisHorizontalIcon, NoSymbolIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { nanoid } from "@reduxjs/toolkit";
import BlankCell from "./BlankCell";

export default function DirectTable({
    table,
    headers,
    setTables,
    fullOrgWithdata,
    setCharts,
    charts,
    saveScroll,
    cacheStatsLogics,
    cacheLogic,
    loaded,
    selectedStats,
    setSelectedStats,
    blankRows,
}: {
    table: IDirectTable;
    headers: IDirectHeader[];
    setTables: (value: React.SetStateAction<IDirectTable[]>) => void;
    fullOrgWithdata: IDirectOffice[];
    setCharts: React.Dispatch<React.SetStateAction<IChartPropListItem[]>>;
    charts: IChartPropListItem[];
    saveScroll: () => void;
    cacheStatsLogics: Map<string, ILogicCell[]>;
    cacheLogic: () => void;
    loaded: boolean;
    selectedStats: string[];
    setSelectedStats: React.Dispatch<React.SetStateAction<string[]>>;
    blankRows: { officeID: number; blankRowsValues: string[][] }[];
}) {
    const office = fullOrgWithdata.find((off) => off.id === table.officeID);
    if (!office) {
        return (
            <thead>
                <tr>
                    <th> Отделение не найдено ! </th>
                </tr>
            </thead>
        );
    }
    let allItemStats: (TableStatisticListItemI | undefined)[] = [office.mainPattern, ...office.patterns];
    office.departments.forEach((dep) => {
        allItemStats = [...allItemStats, dep.mainPattern, ...dep.patterns];
        dep.sections.forEach((sec) => {
            allItemStats = [...allItemStats, sec.mainPattern, ...sec.patterns];
        });
    });
    const currentOfficeStatsList = allItemStats.filter((stat) => stat !== undefined) as TableStatisticListItemI[];

    const isAdmin = useSelector((state: any) => state.main.user?.role === "admin");

    //STATE

    const [isAddStat, setIsAddStat] = useState(false);
    const [statFilter, setStatFilter] = useState("");
    const [about, setAbout] = useState(table.description);
    const [isAddDescription, setIsAddDescription] = useState(false);

    //HOOKS
    const { tableById, addingFilledField, statNameById } = useTableStatistics();

    const addStatToTable = ({ stat, noToasty = false }: { stat: TableStatisticListItemI; noToasty?: boolean }) => {
        //const stat = allItemStats.find((stat) => stat.id === statId);
        const currentStatCelarName = clearStatName(statNameById(stat.id));
        setSelectedStats((state) => [...new Set([...state, currentStatCelarName])]);
        setTables((state) => {
            return state.map((curTable, tableIdx) => {
                if (curTable.id !== table.id) return curTable;

                if (curTable.stats.some((st) => st.id === stat.id)) {
                    !noToasty && toast.warning(`Эта статистика уже добавлена !`);
                    return curTable;
                }

                const cache = cacheStatsLogics.get(currentStatCelarName)?.reduce((acc, cell) => ({ ...acc, [cell.headerId]: cell.logicStr }), {});
                if (cache) {
                    console.log("CACHE", cache);
                }
                if (!tableIdx) {
                    console.log(table);
                }

                return {
                    ...curTable,

                    stats: [
                        ...curTable.stats,
                        {
                            ...stat,
                            type: "stat",

                            logicStrArr: headers.map((header) => ({
                                headerId: header.id,
                                logicStr: cache ? cache[header.id] || "" : "",
                            })), //создаем массив строк с логикой колонок
                        },
                    ],
                };
            });
        });
    };

    const onChangeLogic = (statId: number, logicHeaderId: string, value: string) => {
        setTables((state) => {
            return state.map((curTable, curTableIdx) => {
                if (curTable.id !== table.id) return curTable;

                return {
                    ...table,
                    stats: table.stats.map((stat) => {
                        if (stat.id !== statId) return stat;

                        return {
                            ...stat,
                            type: "stat",
                            logicStrArr: stat.logicStrArr.map((curLogic) => {
                                if (curLogic.headerId !== logicHeaderId) return curLogic;

                                return { ...curLogic, logicStr: value };
                            }),
                        };
                    }),
                };
            });
        });
    };

    const onStatMoveUp = useCallback(
        (statId: number) => {
            setTables((state) => {
                let tempTabels = JSON.parse(JSON.stringify(state));
                let curTableIdx = tempTabels.findIndex((tempTable) => tempTable.id === table.id);
                const statIndex = tempTabels[curTableIdx].stats.findIndex((stat) => stat.id === statId);

                const tempStats = tempTabels[curTableIdx].stats;
                if (statIndex > 0) {
                    //console.log(statId, statIndex, curTable);
                    tempTabels[curTableIdx].stats = tempStats.toSpliced(statIndex - 1, 2, tempStats[statIndex], tempStats[statIndex - 1]);
                }
                return tempTabels;
            });
        },
        [table]
    );
    const onStatMoveDown = useCallback(
        (statId: number) => {
            setTables((state) => {
                let tempTabels = JSON.parse(JSON.stringify(state));
                let curTable = tempTabels.find((tempTable) => tempTable.id === table.id) as IDirectTable;
                const statIndex = curTable.stats.findIndex((stat) => stat.id === statId);

                if (statIndex < curTable.stats.length - 1) {
                    console.log(statId, statIndex, curTable);
                    curTable.stats.splice(statIndex, 2, curTable.stats[statIndex + 1], curTable.stats[statIndex]);
                }
                return tempTabels;
            });
        },
        [table]
    );

    const onRemoveStat = useCallback(
        (statId: number) => {
            setTables((state) => {
                let tempTabels = JSON.parse(JSON.stringify(state));
                let curTable = tempTabels.find((tempTable) => tempTable.id === table.id) as IDirectTable;

                curTable.stats = curTable.stats.filter((curStat) => {
                    if (curStat.id !== statId) {
                        return true;
                    }
                    setSelectedStats((state) => state.filter((curStatName) => curStatName !== clearStatName(curStat.name)));
                    return false;
                });
                return tempTabels;
            });
            setCharts((state) => state.filter((curChart) => curChart.statId !== statId));
        },
        [table, charts]
    );

    const onSaveDescription = useCallback(
        ({ del = false }: { del?: boolean } = {}) => {
            setTables((state) => {
                return state.map((curTable) => {
                    if (curTable.id !== table.id) return curTable;

                    if (!del) return { ...curTable, description: about };
                    else return { ...curTable, description: "" };
                });
            });
            if (del) setAbout("");
        },
        [about]
    );

    const addBlankRow = ({ values }: { values?: string[] } = {}) => {
        setTables((state) =>
            state.map((curTable) => {
                if (curTable.id !== table.id) return curTable;

                return {
                    ...curTable,
                    blankRows: [
                        ...curTable.blankRows,
                        {
                            id: nanoid(),
                            type: "blank",
                            values: values?.length ? headers.map((_, idx) => values[idx] || "") : new Array(headers.length).fill(""),
                        },
                    ],
                };
            })
        );
    };

    //МЕНЮ ДОБАВЛЕНИЯ СТАТИСТИК
    const statList = useMemo(() => {
        return (
            <div className={styles.modalStatList}>
                <input className={styles.statFilter} type="text" value={statFilter} onChange={(event) => setStatFilter(event.target.value.trimStart())} placeholder="Поиск" />
                {currentOfficeStatsList
                    .filter((stat) => stat.name.toLowerCase().includes(statFilter.toLowerCase()))
                    //.filter((stat) => !table.stats.map((stat) => stat.id).includes(stat.id))
                    .map((stat) => {
                        const isAdded = table.stats.map((stat) => stat.id).includes(stat.id);
                        return (
                            <div key={stat.name} className={`${styles.statItem} noselect`} onClick={() => (isAdded ? onRemoveStat(stat.id) : addStatToTable({ stat }))}>
                                <CheckBadgeIcon width={25} fill={isAdded ? "#FF8056" : "gray"} opacity={isAdded ? 1 : 0.2} />
                                <span>{clearStatName(stat.name)}</span>
                            </div>
                        );
                    })}
            </div>
        );
    }, [table.stats, statFilter, setSelectedStats]);

    const onChangeBlank = (rowId: string, idx: number, value: string) => {
        setTables((state) =>
            state.map((curTable) => {
                if (curTable.id !== table.id) return curTable;

                return {
                    ...curTable,
                    blankRows: curTable.blankRows.map((row) => {
                        if (row.id !== rowId) return row;

                        return {
                            ...row,
                            values: row.values.map((curValue, curIdx) => {
                                if (curIdx !== idx) return curValue;

                                return value;
                            }),
                        };
                    }),
                };
            })
        );
    };

    const onDelBlankRow = (id: string) =>
        setTables((state) =>
            state.map((curTable) => {
                if (curTable.id !== table.id) return curTable;
                return {
                    ...curTable,
                    blankRows: curTable.blankRows.filter((curBlank) => curBlank.id !== id),
                };
            })
        );

    //! Добавление статистик и пустых рядов из листа
    const curOffId = useRef(0);
    useEffect(() => {
        if (selectedStats.length) {
            const tableSelectedStats = table.stats.map((stat) => clearStatName(stat.name));
            //добавление статистик
            selectedStats.forEach((stat) => {
                const curStat = currentOfficeStatsList.find((offStat) => clearStatName(offStat.name) == clearStatName(stat));
                if (curStat && !tableSelectedStats.includes(clearStatName(curStat.name))) {
                    addStatToTable({ stat: curStat, noToasty: true });
                }
            });

            //добавление пустых рядов
        }

        if (blankRows.length) {
            if (curOffId.current !== table.officeID) {
                curOffId.current = table.officeID;
                console.log("UPDATE 💡", curOffId.current == table.officeID);
                const curBlankRows = blankRows.find((blank) => blank.officeID == table.officeID);
                if (curBlankRows && curBlankRows.blankRowsValues.length) {
                    console.log("CURRENT BLANK ROWS ➡️", curBlankRows);
                    curBlankRows.blankRowsValues.forEach((blankRow) => {
                        addBlankRow({ values: blankRow });
                    });
                }
            }
        } else {
            curOffId.current = 0;
        }
    }, [selectedStats, blankRows]);

    return [
        <thead>
            <tr>
                {
                    // ХЭДЕРЫ ТАБЛИЦЫ
                    headers.map((header, headerIdx) => (
                        <th key={header.id + "_head" + headerIdx} style={{ background: header.color }}>
                            <span id="head">{!headerIdx ? office.name : header.title}</span>
                        </th>
                    ))
                }
            </tr>
        </thead>,
        <tbody>
            {
                // СТАТИСТИКИ
                table.stats.map((stat, statIdx) => {
                    const statReady = addingFilledField(stat);
                    const statItemLogic: StatItemLogic = {
                        ...statReady,
                        logicStrArr: stat.logicStrArr,
                    };

                    return <DirectStat key={stat.id + "statKey"} headers={headers} onChangeLogic={onChangeLogic} stat={statItemLogic} setCharts={setCharts} charts={charts} onStatMoveDown={onStatMoveDown} onStatMoveUp={onStatMoveUp} onRemoveStat={onRemoveStat} saveScroll={saveScroll} cacheLogic={cacheLogic} loaded={loaded} />;
                })
            }
            {table.blankRows?.map((blankRow) => {
                return (
                    <tr key={Math.random()}>
                        {blankRow.values.map((value, idx) => {
                            const onChange = onChangeBlank.bind(null, blankRow.id, idx);
                            const onDelRow = onDelBlankRow.bind(null, blankRow.id);
                            return <BlankCell value={value} onChange={onChange} delRowFn={onDelRow} first={!!!idx} loaded={loaded} />;
                        })}
                    </tr>
                );
            })}

            {/* ДОБАВЛЕНИЕ СТАТИСТИКИ */}
            <tr>
                <td colSpan={headers.length}>
                    <div className={styles.btnsBlock}>
                        {process.env.NODE_ENV !== "production" && (
                            <>
                                <button onClick={() => console.log(table)}>check table</button>
                                <button onClick={() => console.log(blankRows)}>check blanks</button>
                            </>
                        )}
                        {!loaded && (
                            <div className={styles.addBtnsBlock}>
                                <div className={styles.addStatBtn} onClick={() => setIsAddStat(true)}>
                                    <span>Добавить статистику</span>
                                    <DocumentPlusIcon width={20} />
                                </div>
                                <div className={styles.addStatBtn} onClick={() => addBlankRow()}>
                                    <span>Добавить пустой ряд</span>
                                    <EllipsisHorizontalIcon width={20} />
                                </div>
                                {!about && !isAddDescription && (
                                    <div className={styles.addStatBtn} onClick={() => setIsAddDescription(true)}>
                                        <span>Добавить описание</span>
                                        <ChatBubbleBottomCenterIcon width={20} />
                                    </div>
                                )}
                            </div>
                        )}
                        {isAddStat && (
                            <Modal fullWidth closeModalFunc={() => setIsAddStat(false)} scrollOnTop={false}>
                                {statList}
                            </Modal>
                        )}
                        <div>
                            {(about || isAddDescription) && (
                                <div>
                                    <ReactQuill value={about} onChange={setAbout} readOnly={loaded} theme={!loaded ? "snow" : "bubble"} />
                                </div>
                            )}
                            {isAdmin && !loaded && (
                                <div className={styles.descriptionsBtns}>
                                    {about && about !== table.description && (
                                        <div onClick={() => onSaveDescription()} style={{ background: "#6DA52C" }}>
                                            <span>сохранить изменения описания</span>
                                            <CheckCircleIcon width={17} />
                                        </div>
                                    )}
                                    {((isAddDescription && !about) || table.description !== about) && (
                                        <div
                                            style={{ background: "#949494" }}
                                            onClick={() => {
                                                setAbout(table.description);
                                                setIsAddDescription(false);
                                            }}
                                        >
                                            <span>отменить изменения описания</span>
                                            <NoSymbolIcon width={17} />
                                        </div>
                                    )}
                                    {table.description && (
                                        <div onClick={() => onSaveDescription({ del: true })} style={{ background: "#F44336" }}>
                                            <span>полностью удалить описание</span>
                                            <TrashIcon width={15} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>,
    ];
}
