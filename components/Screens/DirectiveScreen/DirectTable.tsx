import { IDirectHeader, IDirectOffice, IDirectTable, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI } from "@/types/types";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import DirectStat from "./DirectStat";

import useTableStatistics from "@/hooks/useTableStatistics";
import { clearStatName } from "@/utils/funcs";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";

export default function DirectTable({ table, headers, setTables, fullOrgWithdata }: { table: IDirectTable; headers: IDirectHeader[]; setTables: (value: React.SetStateAction<IDirectTable[]>) => void; fullOrgWithdata: IDirectOffice[] }) {
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

    //HOOKS
    const { tableById, addingFilledField } = useTableStatistics();

    const addStatToTable = useCallback(
        ({ statId }: { statId: number }) => {
            //const stat = allItemStats.find((stat) => stat.id === statId);
            setTables((state) => {
                return state.map((curTable) => {
                    if (curTable.id !== table.id) return curTable;

                    if (curTable.stats.some((st) => st.id === statId)) {
                        toast.warning(`Статистика уже добавлена !`);
                        return curTable;
                    }

                    return {
                        ...table,
                        stats: [
                            ...curTable.stats,
                            {
                                id: statId,
                                // logicStrArr: new Array(headers.length).fill(""), //создаем массив строк с логикой колонок
                                logicStrArr: headers.map((header) => ({ headerId: header.id, logicStr: "" })), //создаем массив строк с логикой колонок
                            },
                        ],
                    };
                });
            });
            setSelectedStatId(0);
        },
        [setTables]
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

    return (
        <>
            <thead>
                {
                    // ХЭДЕРЫ ТАБЛИЦЫ
                    headers.map((header, headerIdx) => (
                        <th>{!headerIdx ? office.name : header.title}</th>
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

                        return <DirectStat headers={headers} onChangeLogic={onChangeLogic} stat={statItemLogic} />;
                    })
                }

                {/* ДОБАВЛЕНИЕ СТАТИСТИКИ */}
                <tr>
                    <td colSpan={headers.length}>
                        <div>
                            <select value={selectedStatId} onChange={(event) => setSelectedStatId(Number(event.target.value))}>
                                <option value={0}>выбор статистики</option>
                                {currentOfficeStatsList.map((stat) => (
                                    <option value={stat.id}>{clearStatName(stat.name)}</option>
                                ))}
                            </select>
                            {!!selectedStatId && <button onClick={() => addStatToTable({ statId: selectedStatId })}>Добавить статистику</button>}
                        </div>
                    </td>
                </tr>
            </tbody>
        </>
    );
}
