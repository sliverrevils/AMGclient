import Modal from "@/components/elements/Modal/Modal";
import { RaportTableInfoI, StatItemLogic } from "@/types/types";
import { useState } from "react";
import styles from "./cell.module.scss";
import { clearStatName } from "@/utils/funcs";

export default function DirectCell({ logicStr, onCurrentChangeLogic, cellIndex, stat, columnName }: { logicStr: string; onCurrentChangeLogic: (value: string) => void; cellIndex: number; stat: StatItemLogic; columnName: string }) {
    const { isGrowing, filled, lastUpdate } = stat;
    const { statHeaders, statLastRowValues, statFilled } = stat.dateColumn.raportInfo as RaportTableInfoI;

    //STATE
    const [isSelectedCell, setIsSelectedCell] = useState(false);

    const statHelpMenu = () => {
        return (
            <>
                {statHeaders!.map((statHeader, idx) => {
                    return (
                        <div
                            className={styles.helpItem}
                            onClick={() => {
                                onCurrentChangeLogic(`${stat.logicStrArr[cellIndex]} @${idx}`);
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
                        onCurrentChangeLogic(`${stat.logicStrArr[cellIndex]} @status`);
                    }}
                >
                    <div className={styles.decor}>@status</div>
                    <div className={styles.name}>статус тренда</div>
                </div>
            </>
        );
    };

    const calcCell = (logic: string): string => {
        logic = logic.replace("@status", isGrowing);
        const replacedLogic = logic.replaceAll(/@\d{1,3}/g, (decorator, a, b) => {
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
        <td className={styles.cellWrap}>
            <div className={styles.cellBlock} onClick={() => setIsSelectedCell(true)}>
                {isSelectedCell && (
                    <Modal closeModalFunc={() => setIsSelectedCell(false)} fullWidth>
                        <div className={styles.modalBlock}>
                            <div className={styles.field}>
                                <div className={styles.help}>используемая статистика</div>
                                <div className={styles.statName}>{clearStatName(stat.name)}</div>
                            </div>
                            <div className={styles.field}>
                                <div className={styles.help}>колонки статистики</div>
                                <div className={styles.helpBlock}>{statHelpMenu()}</div>
                            </div>

                            <div className={styles.field}>
                                <div className={styles.help}>колонка Директивы РК</div>
                                <div className={styles.columnName}>{columnName}</div>
                            </div>
                            <div className={styles.field}>
                                <div className={styles.help}>логическая строка</div>
                                <input className={styles.logicStr} value={logicStr} onChange={(event) => onCurrentChangeLogic(event.target.value.trimStart())} placeholder="мат. вычесления оборачивать в квадратные скобки [ 2 + 1 ]" />
                            </div>

                            <div className={styles.field}>
                                <div className={styles.help}>результат колонки</div>
                                <div className={styles.resultBlock}>{calcCell(logicStr)}</div>
                            </div>
                        </div>
                    </Modal>
                )}
                <div>{calcCell(logicStr)}</div>
            </div>
        </td>
    );
}
