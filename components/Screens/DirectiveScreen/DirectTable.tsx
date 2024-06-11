import { IDirectHeader, IDirectTable, RaportTableInfoI, StatItemLogic, StatItemReady } from "@/types/types";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import DirectStat from "./DirectStat";

export default function DirectTable({ table, headers, setTables }: { table: IDirectTable; headers: IDirectHeader[]; setTables: (value: React.SetStateAction<IDirectTable[]>) => void }) {
    const allItemStats = [table.item?.mainPattern, ...table.item!.patterns] as StatItemReady[];
    // console.log(allItemStats);

    //STATE
    const [selectedStatId, setSelectedStatId] = useState(0);

    const addStatToTable = useCallback(
        ({ statId }: { statId: number }) => {
            const stat = allItemStats.find((stat) => stat.id === statId);
            setTables((state) => {
                return state.map((curTable) => {
                    if (curTable.id !== table.id || !stat) return curTable;

                    if (curTable.stats.some((st) => st.id === stat.id)) {
                        toast.warning(`${stat.name} уже добавлена !`);
                        return curTable;
                    }

                    return {
                        ...table,
                        stats: [
                            ...curTable.stats,
                            {
                                ...stat,
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
                        <th>{!headerIdx ? table.item?.name : header.title}</th>
                    ))
                }
            </thead>
            <tbody>
                {
                    // СТАТИСТИКИ
                    table.stats.map((stat, statIdx) => {
                        return <DirectStat headers={headers} onChangeLogic={onChangeLogic} stat={stat} />;
                    })
                }

                {/* ДОБАВЛЕНИЕ СТАТИСТИКИ */}
                <tr>
                    <td colSpan={headers.length}>
                        <div>
                            <select value={selectedStatId} onChange={(event) => setSelectedStatId(Number(event.target.value))}>
                                <option value={0}>выбор статистики</option>
                                {allItemStats.map((stat) => (
                                    <option value={stat.id}>{stat.name}</option>
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
