import { IDirectHeader, IDirectOffice, IDirectTable, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI } from "@/types/types";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DirectStat from "./DirectStat";
import styles from "./table.module.scss";

import useTableStatistics from "@/hooks/useTableStatistics";
import { clearStatName } from "@/utils/funcs";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import Modal from "@/components/elements/Modal/Modal";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";

export default function DirectTable({ table, headers, setTables, fullOrgWithdata, setCharts, charts }: { table: IDirectTable; headers: IDirectHeader[]; setTables: (value: React.SetStateAction<IDirectTable[]>) => void; fullOrgWithdata: IDirectOffice[]; setCharts: React.Dispatch<React.SetStateAction<number[]>>; charts: number[] }) {
    const office = fullOrgWithdata.find((off) => off.id === table.officeID);
    if (!office) {
        return (
            <thead>
                <th> Отделение не найдено ! </th>
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

    // console.log(allItemStats);

    //STATE
    const [selectedStatId, setSelectedStatId] = useState(0);
    const [isAddStat, setIsAddStat] = useState(false);
    const [statFilter, setStatFilter] = useState("");

    //HOOKS
    const { tableById, addingFilledField } = useTableStatistics();

    const addStatToTable = useCallback(
        ({ statId }: { statId: number }) => {
            //const stat = allItemStats.find((stat) => stat.id === statId);
            setTables((state) => {
                return state.map((curTable) => {
                    if (curTable.id !== table.id) return curTable;

                    if (curTable.stats.some((st) => st.id === statId)) {
                        toast.warning(`Эта статистика уже добавлена !`);
                        return curTable;
                    }

                    return {
                        ...table,
                        stats: [
                            ...curTable.stats,
                            {
                                id: statId,
                                logicStrArr: headers.map((header) => ({ headerId: header.id, logicStr: "" })), //создаем массив строк с логикой колонок
                            },
                        ],
                    };
                });
            });
            setSelectedStatId(0);
        },
        [setTables, headers]
    );

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

                curTable.stats = curTable.stats.filter((curStat) => curStat.id !== statId);
                return tempTabels;
            });
            setCharts((state) => state.filter((curChartId) => curChartId !== statId));
        },
        [table, charts]
    );

    //МЕНЮ ДОБАВЛЕНИЯ СТАТИСТИК
    const statList = useMemo(() => {
        return (
            <div className={styles.modalStatList}>
                <input className={styles.statFilter} type="text" value={statFilter} onChange={(event) => setStatFilter(event.target.value.trimStart())} placeholder="Поиск" />
                {currentOfficeStatsList
                    .filter((stat) => stat.name.toLowerCase().includes(statFilter.toLowerCase()))
                    .filter((stat) => !table.stats.map((stat) => stat.id).includes(stat.id))
                    .map((stat) => {
                        return (
                            <div className={styles.statItem} onClick={() => addStatToTable({ statId: stat.id })}>
                                {clearStatName(stat.name)}
                            </div>
                        );
                    })}
            </div>
        );
    }, [table.stats, statFilter]);

    return (
        <>
            <thead>
                {
                    // ХЭДЕРЫ ТАБЛИЦЫ
                    headers.map((header, headerIdx) => (
                        <th style={{ background: header.color }}>
                            <span>{!headerIdx ? office.name : header.title}</span>
                        </th>
                    ))
                }
            </thead>
            <tbody>
                {
                    // СТАТИСТИКИ
                    table.stats.map((stat, statIdx) => {
                        const currentStat = tableById(stat.id);
                        if (!currentStat) {
                            return (
                                <tr>
                                    <td>статистика не найдена</td>
                                </tr>
                            );
                        }
                        const statReady = addingFilledField(currentStat);
                        const statItemLogic: StatItemLogic = {
                            ...statReady,
                            logicStrArr: stat.logicStrArr,
                        };

                        return <DirectStat headers={headers} onChangeLogic={onChangeLogic} stat={statItemLogic} setCharts={setCharts} charts={charts} onStatMoveDown={onStatMoveDown} onStatMoveUp={onStatMoveUp} onRemoveStat={onRemoveStat} />;
                    })
                }

                {/* ДОБАВЛЕНИЕ СТАТИСТИКИ */}
                <tr>
                    <td colSpan={headers.length}>
                        <div className={styles.btnsBlock}>
                            {/* <select value={selectedStatId} onChange={(event) => setSelectedStatId(Number(event.target.value))}>
                                <option value={0}>выбор статистики</option>
                                {currentOfficeStatsList.map((stat) => (
                                    <option value={stat.id}>{clearStatName(stat.name)}</option>
                                ))}
                            </select>
                            {!!selectedStatId && <button onClick={() => addStatToTable({ statId: selectedStatId })}>Добавить статистику</button>} */}
                            <div className={styles.addStatBtn} onClick={() => setIsAddStat(true)}>
                                <span>Добавить статистику</span>
                                <DocumentPlusIcon width={20} />
                            </div>
                            {isAddStat && (
                                <Modal fullWidth closeModalFunc={() => setIsAddStat(false)} scrollOnTop={false}>
                                    {statList}
                                </Modal>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        </>
    );
}
