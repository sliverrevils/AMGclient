import Modal from "@/components/elements/Modal/Modal";
import { IDirectOffice, RaportTableInfoI, StatItemLogic, TableStatisticListItemI } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import styles from "./cell.module.scss";
import menuStyle from "./orgMenu.module.scss";
import { clearStatName } from "@/utils/funcs";
import useUI from "@/hooks/useUI";
import { ChevronDoubleDownIcon, ChevronLeftIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export default function DirectCell({ logicStr, onCurrentChangeLogic, cellIndex, stat, columnName, cacheLogic, loaded, fullOrgWithdata }: { fullOrgWithdata: IDirectOffice[]; logicStr: string; onCurrentChangeLogic: (value: string) => void; cellIndex: number; stat: StatItemLogic; columnName: string; cacheLogic: () => void; loaded: boolean }) {
    const { isGrowing, filled, lastUpdate, periodStr } = stat;
    const { statHeaders, statLastRowValues, statFilled, statPrevRowValues, statFutureRowValues } = stat.dateColumn.raportInfo as RaportTableInfoI;

    //! ALL STATS LIST
    const allStatsList = fullOrgWithdata.reduce<TableStatisticListItemI[]>((acc, off) => {
        let curOffStats: TableStatisticListItemI[] = [off.mainPattern, ...off.patterns].filter((stat) => stat !== undefined) as TableStatisticListItemI[];
        off.departments.forEach((dep) => {
            const depStats = [dep.mainPattern, ...dep.patterns].filter((stat) => !!stat);
            curOffStats = [...curOffStats, ...depStats].filter((stat) => stat !== undefined) as TableStatisticListItemI[];

            dep.sections.forEach((sec) => {
                const secStats = [sec.mainPattern, ...sec.patterns].filter((stat) => !!stat);
                curOffStats = [...curOffStats, ...secStats].filter((stat) => stat !== undefined) as TableStatisticListItemI[];
            });
        });

        return [...acc, ...curOffStats];
    }, []);

    //STATE
    const [isSelectedCell, setIsSelectedCell] = useState(false);
    const [fullOrgDataState, setFullOrgDataState] = useState(fullOrgWithdata.map((off) => ({ ...off, selected: false, departments: off.departments.map((dep) => ({ ...dep, selected: false, sections: dep.sections.map((sec) => ({ ...sec, selected: false })) })) })));
    //HOOKS
    const { createMenu } = useUI();

    const [lineMenu, onOpenLineMenu, onCloseLineMenu, lineMenuStyle] = createMenu({ onWindow: false, position: "fixed" });

    const statMenuItem = useCallback(
        (stat: TableStatisticListItemI | undefined) => {
            if (stat === undefined) return null;
            const onHeaderClick = ({ headerIdxAndpos }: { headerIdxAndpos: string }) => {
                onCurrentChangeLogic(`${logicStr} <${clearStatName(stat.name)}&${headerIdxAndpos}>`);
            };

            const isFuture = stat.dateColumn.raportInfo?.statFutureRowValues?.length ? true : false;
            const isPrev = stat.dateColumn.raportInfo?.statPrevRowValues?.length ? true : false;
            const isCur = stat.dateColumn.raportInfo?.statLastRowValues?.length ? true : false;
            return (
                <div className={menuStyle.statItem}>
                    <div className={menuStyle.statName}>{clearStatName(stat.name)}</div>
                    <div className={menuStyle.statHeaders}>
                        {stat.dateColumn.raportInfo?.statHeaders?.map((header, headerIdx) => (
                            <div className={menuStyle.statHeaderItem}>
                                <div className={menuStyle.headerName}> {header}</div>
                                <div className={menuStyle.headerBtns}>
                                    {isCur && <div onClick={() => onHeaderClick({ headerIdxAndpos: `@${headerIdx}` })}>➡️</div>}
                                    {isPrev && <div onClick={() => onHeaderClick({ headerIdxAndpos: `@@${headerIdx}` })}>⤴️</div>}
                                    {isFuture && <div onClick={() => onHeaderClick({ headerIdxAndpos: `@@@${headerIdx}` })}>⤵️</div>}
                                </div>
                            </div>
                        ))}
                        <div className={menuStyle.statHeaderItem}>
                            <div className={menuStyle.headerName} style={{ cursor: "pointer" }} onClick={() => onHeaderClick({ headerIdxAndpos: `@status` })}>
                                Статус 📈
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
        [logicStr]
    );

    const menuHTML = (
        <div style={{ ...lineMenuStyle }} className={menuStyle.mainBlock}>
            <div className={menuStyle.titleBlock}>
                <div> Выбор статистики </div>
            </div>
            <div className={menuStyle.closeMenuBtn} onClick={onCloseLineMenu}>
                ❌
            </div>
            <div className={menuStyle.officesList}>
                {fullOrgDataState.map((office, offIdx) => {
                    const offStatsArr = [office.mainPattern, ...office.patterns];
                    const isSelectedOff = fullOrgDataState.some((off) => off.selected);
                    if (isSelectedOff && !office.selected) return null;
                    return (
                        <div className={menuStyle.officeItem}>
                            <div className={menuStyle.officeName} onClick={() => setFullOrgDataState((state) => state.map((curOff, curOffIdx) => (curOffIdx !== offIdx ? { ...curOff, selected: false } : { ...curOff, selected: !curOff.selected })))}>
                                <div>{office.name}</div>
                                <div>{office.selected ? <ChevronDoubleDownIcon width={15} /> : <ChevronLeftIcon width={15} />}</div>
                            </div>

                            <div className={menuStyle.officeStats}>{offStatsArr.map((stat) => statMenuItem(stat))}</div>
                            {office.selected && (
                                <div className={menuStyle.officeDeps}>
                                    {office.departments.map((dep, depIdx) => {
                                        const depStatsArr = [dep.mainPattern, ...dep.patterns];
                                        return (
                                            <div className={menuStyle.depItem}>
                                                <div className={menuStyle.depName} onClick={() => setFullOrgDataState((state) => state.map((curOff, curOffIdx) => (curOffIdx !== offIdx ? curOff : { ...curOff, departments: curOff.departments.map((curDep, curDepIdx) => (curDepIdx !== depIdx ? { ...curDep, selected: false } : { ...curDep, selected: !curDep.selected })) })))}>
                                                    <div>{dep.name}</div>
                                                    <div>{dep.selected ? <ChevronDoubleDownIcon width={15} /> : <ChevronLeftIcon width={15} />}</div>
                                                </div>
                                                <div className={menuStyle.depStats}>{depStatsArr.map((stat) => statMenuItem(stat))}</div>
                                                {dep.selected && (
                                                    <div className={menuStyle.depSecs}>
                                                        {dep.sections.map((sec) => {
                                                            const secStatsArr = [sec.mainPattern, ...sec.patterns].filter((stat) => !!stat);
                                                            if (!secStatsArr.length) return null;
                                                            return (
                                                                <div className={menuStyle.secItem}>
                                                                    <div className={menuStyle.secName}> {sec.name}</div>
                                                                    <div className={menuStyle.secStats}>{secStatsArr.map((stat) => statMenuItem(stat))}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

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
        //TODO ВЫРЕЗАЕМ СТРОКИ И МЕНЯЕМ ЗНАЧЕНИЕ
        let replacedLogic = logic.replaceAll(/<(.*?)>/g, (decorator, a, b) => {
            decorator = decorator.replaceAll("<", "");
            decorator = decorator.replaceAll(">", "");
            let [statName, pos] = decorator.split("&");
            //console.log({ decorator, stat, pos });

            const curStat = allStatsList.find((stat) => clearStatName(stat.name) === statName);
            if (!curStat) return "статистика не найдена ";
            if (!pos) return "ошибка в написании";

            //status
            pos = pos.replace("@status", String(curStat.dateColumn.raportInfo?.trendStatus));

            //
            pos = pos.replaceAll(/@@@\d{1,3}/g, (decorator, a, b) => {
                const targetIndex = Number(decorator.replace("@@@", ""));
                const cellValue = curStat.dateColumn.raportInfo?.statFutureRowValues[targetIndex];
                return String(cellValue);
            });

            pos = pos.replaceAll(/@@\d{1,3}/g, (decorator, a, b) => {
                const targetIndex = Number(decorator.replace("@@", ""));
                const cellValue = curStat.dateColumn.raportInfo?.statPrevRowValues?.[targetIndex];
                return String(cellValue);
            });

            pos = pos.replaceAll(/@\d{1,3}/g, (decorator, a, b) => {
                const targetIndex = Number(decorator.replace("@", ""));
                const cellValue = curStat.dateColumn.raportInfo?.statLastRowValues?.[targetIndex];
                return String(cellValue);
            });

            return pos;
        });

        replacedLogic = replacedLogic.replace("@status", isGrowing);

        replacedLogic = replacedLogic.replaceAll(/@@@\d{1,3}/g, (decorator, a, b) => {
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

    const onOrgMenu = (event: React.MouseEvent<HTMLTextAreaElement | HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        onOpenLineMenu(event);
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
                        {menuHTML}
                        <div className={styles.modalBlock}>
                            <div className={styles.field} style={{ alignSelf: "flex-start" }}>
                                <div className={styles.help}>текущая колонка Директивы РК</div>
                                <div className={styles.columnName}>{columnName}</div>
                            </div>
                            <div className={styles.field} style={{ alignSelf: "center" }}>
                                <div className={styles.help}>результат ячейки</div>
                                <div className={styles.resultBlock}>{calcCell(logicStr)}</div>
                            </div>
                            <div className={styles.field}>
                                <div className={styles.help}>логическая строка ячейки</div>
                                <div className={styles.addBtn} onClick={onOrgMenu}>
                                    <span>
                                        <PlusCircleIcon width={20} />
                                    </span>
                                    <span>Добавить данные из статистик</span>
                                </div>
                                <textarea className={styles.logicStr} value={logicStr} onContextMenu={onOrgMenu} onChange={(event) => onCurrentChangeLogic(event.target.value.trimStart())} placeholder="мат. вычесления оборачивать в квадратные скобки [ 2 + 1 ]" spellCheck={false}></textarea>
                            </div>

                            <div className={styles.field}>
                                <div className={styles.help}>используемая статистика в ячейке ( последнее обновление в {new Date(lastUpdate).toLocaleString()} )</div>
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
