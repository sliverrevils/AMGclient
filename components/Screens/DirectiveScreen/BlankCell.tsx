import Modal from "@/components/elements/Modal/Modal";
import { useCallback, useEffect, useState } from "react";
import styles from "./blank.module.scss";
import { ChevronDoubleDownIcon, ChevronLeftIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { IDirectOffice, TableStatisticListItemI } from "@/types/types";
import { clearStatName } from "@/utils/funcs";
import menuStyle from "./orgMenu.module.scss";
import useUI from "@/hooks/useUI";
import mStyles from "./blank.module.scss";

export default function BlankCell({ firstCell, loaded, first, value, onChange, delRowFn, fullOrgWithdata, columnName, onItemMoveUp, onItemMoveDown }: { onItemMoveDown: Function; onItemMoveUp: Function; firstCell: boolean; columnName: string; fullOrgWithdata: IDirectOffice[]; loaded: boolean; first: boolean; value: string; onChange: Function; delRowFn: Function }) {
    //const [isModal, setIsModal] = useState(false);

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
    const [input, setInput] = useState(value);
    const [fullOrgDataState, setFullOrgDataState] = useState(fullOrgWithdata.map((off) => ({ ...off, selected: false, departments: off.departments.map((dep) => ({ ...dep, selected: false, sections: dep.sections.map((sec) => ({ ...sec, selected: false })) })) })));

    //HOOKS
    const { createMenu } = useUI();

    const [lineMenu, onOpenLineMenu, onCloseLineMenu, lineMenuStyle] = createMenu({ onWindow: false, position: "fixed" });

    const statMenuItem = useCallback(
        (stat: TableStatisticListItemI | undefined) => {
            if (stat === undefined) return null;
            const onHeaderClick = ({ headerIdxAndpos }: { headerIdxAndpos: string }) => {
                setInput(`${input} <${clearStatName(stat.name)}&${headerIdxAndpos}>`);
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
        [input]
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

    //FUNCS
    const calcCell = (logic: string): string => {
        //TODO ВЫРЕЗАЕМ СТРОКИ И МЕНЯЕМ ЗНАЧЕНИЕ
        let replacedLogic = logic.replaceAll(/<(.*?)>/g, (decorator, a, b) => {
            decorator = decorator.replaceAll("<", "");
            decorator = decorator.replaceAll(">", "");
            let [statName, pos] = decorator.split("&");
            // console.log({ decorator, stat, pos });

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

    useEffect(() => {
        if (!isSelectedCell && input !== value) {
            onChange(input);
        }
    }, [isSelectedCell]);

    return (
        <td className={styles.blankCellMain}>
            <div className={styles.wrap}>
                {!loaded ? (
                    <>
                        {isSelectedCell && (
                            <Modal
                                closeModalFunc={() => {
                                    setIsSelectedCell(false);
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
                                        <div className={styles.resultBlock}>{calcCell(input)}</div>
                                    </div>
                                    <div className={styles.field}>
                                        <div className={styles.help}>логическая строка ячейки</div>
                                        <div className={styles.addBtn} onClick={onOrgMenu}>
                                            <span>
                                                <PlusCircleIcon width={20} />
                                            </span>
                                            <span>Добавить данные из статистик</span>
                                        </div>
                                        <textarea className={styles.logicStr} value={input} onContextMenu={onOrgMenu} onChange={(event) => setInput(event.target.value.trimStart())} placeholder="мат. вычесления оборачивать в квадратные скобки [ 2 + 1 ]" spellCheck={false}></textarea>
                                    </div>
                                </div>
                            </Modal>
                        )}
                        {firstCell && (
                            <div className={styles.statPositionBlock}>
                                <DocumentArrowUpIcon width={20} onClick={() => onItemMoveUp()} />
                                <DocumentArrowDownIcon width={20} onClick={() => onItemMoveDown()} />
                            </div>
                        )}
                        <div className={styles.value} onClick={() => !loaded && setIsSelectedCell(true)}>
                            <span id="cell-value">{calcCell(input)}</span>
                        </div>
                        {first && (
                            <div onClick={() => delRowFn()} className={styles.delBtn}>
                                <XCircleIcon width={30} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.loaded} id="cell-value">
                        {calcCell(input)}
                    </div>
                )}
            </div>
        </td>
    );
}
