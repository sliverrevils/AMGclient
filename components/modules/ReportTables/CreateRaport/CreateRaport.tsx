import { DepartmentI, OfficeI, SectionI, TableStatisticListItemI } from "@/types/types";
import styles from "./createRaport.module.scss";
import Table from "@/components/elements/Table/Table";
import EditableTable from "@/components/elements/EditableTable/EditableTable";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import { clearStatName } from "@/utils/funcs";
import useUI from "@/hooks/useUI";

export default function CreateRaport() {
    // console.log(officesWithLatestPeriodStats)
    //STATE
    const [statsType, setStatsType] = useState<"main" | "additional" | "all">("all");
    const [targetsItemArr, setTargetItemArr] = useState<("отделы" | "отделения" | "секции")[]>(["отделы"]);
    const [baseColumns, setBasecolumns] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<number>(0);

    //SELECTOR
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);

    const officesWithLatestPeriodStatsAndData = useSelector((state: StateReduxI) =>
        state.org.offices.map((office) => {
            // ЗАМЕНЯЕМ ID СТАТИСТИК НА ПОСЛЕДНИЕ

            const getLatestTable = (id: number) => {
                const currentStat = state.stats.tableStatisticsList.find((stat) => stat.id == id);

                if (currentStat && /@/g.test(currentStat.name)) {
                    const statName = currentStat.name.split("@")[0].trim();
                    const statsArr = state.stats.tableStatisticsList.filter((stat) => stat.name.split("@")[0].trim() == statName).toSorted((a, b) => b.id - a.id);
                    if (statsArr.length) {
                        return statsArr[0];
                    } else {
                        return currentStat;
                    }
                }
                return currentStat;
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
    );

    //HOOKS
    const { createMenu } = useUI();
    const [columnMenu, onOpenColumnMenu, onCloseColumnMenu, columnMenuStyle] = createMenu({});

    //FUNCS
    //тоглам айтемы
    const targetItemToggle = (target: "отделы" | "отделения" | "секции") => (targetsItemArr.includes(target) ? setTargetItemArr((state) => state.filter((item) => item !== target)) : setTargetItemArr((state) => [...state, target]));

    //добавление новой колонки
    const onAddBaseColumn = () => setBasecolumns((state) => [...state, "новая колнка"]);

    //находим статистику с редакса
    const getStatFromSelector = (statId: number) => tableStatisticsList.find((stat) => stat.id == statId);

    //смена названия колонки
    const onChangeBaseColumnName = (name: string) => {
        setBasecolumns((state) =>
            state.map((curname, idx) => {
                if (idx !== selectedColumn - 1) {
                    return curname;
                } else {
                    return name;
                }
            })
        );
    };

    //COMPONENT ORG ITEM
    const OrgItem = ({ targetItem }: { targetItem: any }) => {
        let statsArr: TableStatisticListItemI[] = [];
        switch (statsType) {
            case "main":
                statsArr = targetItem.mainPattern ? [targetItem.mainPattern] : [];
                break;
            case "additional":
                statsArr = targetItem.patterns.length ? [...targetItem.patterns] : [];
                break;
            default:
                statsArr = [targetItem.mainPattern, ...targetItem.patterns].filter((id) => id);
        }
        //console.log('STAT',targetItem);

        return (
            <>
                <thead>
                    <th>{targetItem.name}</th>
                    {baseColumns.map((nameColumn, idx) => (
                        <th
                            key={Math.random()}
                            onClick={(event) => {
                                onOpenColumnMenu(event, styles.createRapWrap);
                                setSelectedColumn(idx + 1);
                            }}
                        >
                            {nameColumn}
                        </th>
                    ))}
                </thead>
                <tbody>
                    {statsArr.map((stat) => (
                        <tr key={Math.random()}>
                            <td>{clearStatName(stat.name)}</td>
                            {baseColumns.map((nameColumn) => (
                                <td key={Math.random()}>
                                    {stat.dateColumn.raportInfo?.statHeaders && (
                                        <select>
                                            {stat.dateColumn.raportInfo?.statHeaders?.map((header) => (
                                                <option>{header}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </>
        );
    };

    //MEMO
    //формируем массив отображаемыъ айтемов по фильтру
    const createTargetBody = useMemo(() => {
        let temTargetsArr: JSX.Element[] = [];

        officesWithLatestPeriodStatsAndData.forEach((office) => {
            if (targetsItemArr.includes("отделы")) {
                temTargetsArr.push(<OrgItem key={Math.random()} targetItem={office} />);
            }
            office.departments.forEach((department) => {
                if (targetsItemArr.includes("отделения")) {
                    // console.log('DEPARTMENT',department)
                    temTargetsArr.push(<OrgItem key={Math.random()} targetItem={department} />);
                }
                department.sections.forEach((section) => {
                    if (targetsItemArr.includes("секции")) {
                        // console.log('SECTION',section)
                        temTargetsArr.push(<OrgItem key={Math.random()} targetItem={section} />);
                    }
                });
            });

            return temTargetsArr;
        });

        return temTargetsArr;
    }, [statsType, targetsItemArr, baseColumns]);
    return (
        <div className={styles.createRapWrap}>
            {!!selectedColumn && (
                <div style={columnMenuStyle} className={styles.columnMenu}>
                    <input type="text" value={baseColumns[selectedColumn - 1]} onChange={(event) => onChangeBaseColumnName(event.target.value)} />
                    <span
                        onClick={() => {
                            onCloseColumnMenu();
                            setSelectedColumn(0);
                        }}
                    >
                        ❌
                    </span>
                </div>
            )}

            <div className={styles.filterWrap}>
                <div className={styles.targetToggle}>
                    <div className={targetsItemArr.includes("отделы") ? styles.item_active : styles.item} onClick={() => targetItemToggle("отделы")}>
                        отделы
                    </div>
                    <div className={targetsItemArr.includes("отделения") ? styles.item_active : styles.item} onClick={() => targetItemToggle("отделения")}>
                        отделения
                    </div>
                    <div className={targetsItemArr.includes("секции") ? styles.item_active : styles.item} onClick={() => targetItemToggle("секции")}>
                        секции
                    </div>
                </div>
                <select onChange={(event) => setStatsType(event.target.value as typeof statsType)}>
                    <option value={"all"}> все статистики</option>
                    <option value={"main"}> главные статистики</option>
                    <option value={"maadditionalin"}> дополнительные статистики</option>
                </select>
            </div>
            <button onClick={onAddBaseColumn}>добавить колонку</button>
            <table>{createTargetBody}</table>
        </div>
    );
}
