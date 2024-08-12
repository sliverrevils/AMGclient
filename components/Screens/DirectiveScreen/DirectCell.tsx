import Modal from "@/components/elements/Modal/Modal";
import { RaportTableInfoI, StatItemLogic } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import styles from "./cell.module.scss";
import { clearStatName } from "@/utils/funcs";

export default function DirectCell({ logicStr, onCurrentChangeLogic, cellIndex, stat, columnName, cacheLogic, loaded }: { logicStr: string; onCurrentChangeLogic: (value: string) => void; cellIndex: number; stat: StatItemLogic; columnName: string; cacheLogic: () => void; loaded: boolean }) {
    const { isGrowing, filled, lastUpdate, periodStr } = stat;
    const { statHeaders, statLastRowValues, statFilled, statPrevRowValues, statFutureRowValues } = stat.dateColumn.raportInfo as RaportTableInfoI;

    //STATE
    const [isSelectedCell, setIsSelectedCell] = useState(false);

    const statHelpMenu = () => {
        return (
            <>
                {statHeaders!.map((statHeader, idx) => {
                    return (
                        <div
                            key={stat.name + "_cell" + idx}
                            className={styles.helpItem}
                            onClick={() => {
                                onCurrentChangeLogic(`${stat.logicStrArr[cellIndex].logicStr} @${idx}`);
                            }}
                        >
                            <div className={styles.decor}>@{idx}</div>
                            <div className={styles.name}>{statHeader}</div>
                        </div>
                    );
                })}
                <div
                    className={styles.helpItem}
                    onClick={() => {
                        onCurrentChangeLogic(`${stat.logicStrArr[cellIndex].logicStr} @status`);
                    }}
                >
                    <div className={styles.decor}>@status</div>
                    <div className={styles.name}>статус тренда</div>
                </div>
            </>
        );
    };
    const prevStatHelpMenu = () => {
        return (
            <>
                {statHeaders!.map((statHeader, idx) => {
                    return (
                        <div
                            key={stat.name + "_cell" + idx}
                            className={styles.helpItem}
                            onClick={() => {
                                onCurrentChangeLogic(`${stat.logicStrArr[cellIndex].logicStr} @@${idx}`);
                            }}
                        >
                            <div className={styles.decor}>@@{idx}</div>
                            <div className={styles.name}>{statHeader}</div>
                        </div>
                    );
                })}
            </>
        );
    };
    const futureStatHelpMenu = () => {
        return (
            <>
                {statHeaders!.map((statHeader, idx) => {
                    return (
                        <div
                            key={stat.name + "_cell" + idx}
                            className={styles.helpItem}
                            onClick={() => {
                                onCurrentChangeLogic(`${stat.logicStrArr[cellIndex].logicStr} @@@${idx}`);
                            }}
                        >
                            <div className={styles.decor}>@@@{idx}</div>
                            <div className={styles.name}>{statHeader}</div>
                        </div>
                    );
                })}
            </>
        );
    };

    const calcCell = (logic: string): string => {
        logic = logic.replace("@status", isGrowing);

        let replacedLogic = logic.replaceAll(/@@@\d{1,3}/g, (decorator, a, b) => {
            const targetIndex = Number(decorator.replace("@@@", ""));

            // console.log(statLastRowValues?.[targetIndex]);
            if (statFutureRowValues?.length && targetIndex > statFutureRowValues?.length - 1) return "ошибка";
            return statFutureRowValues?.[targetIndex] || "";
        });

        replacedLogic = replacedLogic.replaceAll(/@@\d{1,3}/g, (decorator, a, b) => {
            const targetIndex = Number(decorator.replace("@@", ""));
            // console.log(statLastRowValues?.[targetIndex]);
            if (statPrevRowValues?.length && targetIndex > statPrevRowValues?.length - 1) return "ошибка";
            return statPrevRowValues?.[targetIndex] || "";
        });
        //logic = logic.replace("@@", "");
        replacedLogic = replacedLogic.replaceAll(/@\d{1,3}/g, (decorator, a, b) => {
            const targetIndex = Number(decorator.replace("@", ""));
            // console.log(statLastRowValues?.[targetIndex]);
            if (statLastRowValues?.length && targetIndex > statLastRowValues?.length - 1) return "ошибка";
            return statLastRowValues?.[targetIndex] || "";
        });

        const calcedLogic = replacedLogic.replaceAll(/\[(.*?)\]/g, (decorator, a, b) => {
            decorator = decorator.replace("[", "").replace("]", "");
            console.log("DECOR", decorator);
            let calcRes = "";
            try {
                let res = eval(decorator);
                calcRes = res;
            } catch (error) {
                calcRes = decorator;
            }
            return calcRes || "";
        });

        return calcedLogic || "пусто";
    };

    return (
        <td className={styles.cellWrap} onClick={() => !loaded && setIsSelectedCell(true)}>
            <div className={styles.cellBlock}>
                {isSelectedCell && (
                    <Modal
                        closeModalFunc={() => {
                            setIsSelectedCell(false), cacheLogic();
                        }}
                        fullWidth
                        scrollOnTop={false}
                    >
                        <div className={styles.modalBlock}>
                            <div className={styles.field}>
                                <div className={styles.help}>колонка Директивы РК</div>
                                <div className={styles.columnName}>{columnName}</div>
                            </div>
                            <div className={styles.field}>
                                <div className={styles.help}>используемая статистика ( последнее обновление в {new Date(lastUpdate).toLocaleString()} )</div>
                                <div className={styles.statName}>{clearStatName(stat.name)}</div>
                            </div>
                            {statPrevRowValues && statPrevRowValues.length && (
                                <div className={styles.field}>
                                    <div className={styles.help} style={{ textAlign: "end", fontWeight: 600 }}>
                                        ⤴️ предпоследняя запись
                                    </div>
                                    <div className={styles.help}>колонки статистики c данными за {statPrevRowValues[0]}</div>
                                    <div className={styles.helpBlock}>{prevStatHelpMenu()}</div>
                                </div>
                            )}
                            <div className={styles.field}>
                                <div className={styles.help} style={{ textAlign: "end", fontWeight: 600 }}>
                                    ➡️ последняя запись
                                </div>
                                <div className={styles.help}>колонки статистики c данными за {periodStr}</div>
                                <div className={styles.helpBlock}>{statHelpMenu()}</div>
                            </div>

                            {statFutureRowValues && statFutureRowValues.length && (
                                <div className={styles.field}>
                                    <div className={styles.help} style={{ textAlign: "end", fontWeight: 600 }}>
                                        ⤵️ следующая запись
                                    </div>
                                    <div className={styles.help}>колонки статистики c данными за {statFutureRowValues[0]}</div>
                                    <div className={styles.helpBlock}>{futureStatHelpMenu()}</div>
                                </div>
                            )}

                            <div className={styles.field}>
                                <div className={styles.help}>логическая строка</div>
                                <input className={styles.logicStr} value={logicStr} onChange={(event) => onCurrentChangeLogic(event.target.value.trimStart())} placeholder="мат. вычесления оборачивать в квадратные скобки [ 2 + 1 ]" />
                            </div>

                            <div className={styles.field}>
                                <div className={styles.help}>результат колонки</div>
                                <div className={styles.resultBlock}>{calcCell(logicStr)}</div>
                            </div>
                            {process.env.NODE_ENV !== "production" && (
                                <div>
                                    <button onClick={() => console.log("PREV PERIOD", statPrevRowValues)}>check raport info</button>
                                    <button onClick={() => console.log("FUTURE PERIOD", statFutureRowValues)}>check future</button>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
                <div className={styles.cellResult} id="cell-value">
                    {calcCell(logicStr)}
                </div>
            </div>
        </td>
    );
}
