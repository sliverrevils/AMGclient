import { MultiLinesChart } from "@/components/elements/Chart/MultilineChart";
import EditableStatisticTable from "@/components/elements/EditableStatisticTable/EditableStatisticTable";
import EditableTable from "@/components/elements/EditableTable/EditableTable";
import useOrg from "@/hooks/useOrg";
import useTableStatistics from "@/hooks/useTableStatistics";
import { StateReduxI } from "@/redux/store";
import { DepartmentI, OfficeI, SectionI, TableStatisticI, TableStatisticListItemI, UserI } from "@/types/types";
import { nanoid } from "@reduxjs/toolkit";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./stat2.module.scss";
import { celarPeriodStats, clearStatName } from "@/utils/funcs";
import useUsers from "@/hooks/useUsers";
import FilterStat from "./FilterPanel/FilterStat";
import Modal from "@/components/elements/Modal/Modal";

export default function Statistics2Screen() {
    const { param } = useSelector((state: StateReduxI) => state.content);
    //state
    //const [tablesList,setTablesList] = useState<TableStatisticListItemI[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableStatisticI | "clear" | undefined>();
    const [tableSelect, setTableSelect] = useState(0);
    const [periodSelect, setPeriodSelect] = useState(0);
    const [statisticList, setStatisticList] = useState<TableStatisticListItemI[]>([]);
    const [periodList, setPeriodList] = useState<TableStatisticListItemI[]>([]);
    const [userPostSelect, setUserPostSelect] = useState("");
    const [userPostList, setUserPostList] = useState<any[]>([]);

    const [error, setError] = useState("");

    const [postItem, setPostItem] = useState<any>();

    const [officeSelect, setOfficeSelect] = useState(0);
    const [depSelect, setDepSelect] = useState(0);
    const [secSelect, setSecSelect] = useState(0);
    const [targetStatSelect, setTargetStatSelect] = useState(0);

    const [targetOrg, setTargetOrg] = useState<OfficeI | DepartmentI | SectionI | null>(null);
    const [departmentList, setDepartmentList] = useState<DepartmentI[]>([]);
    const [secList, setSecList] = useState<SectionI[]>([]);

    const [filterStats, setFilterStats] = useState("");

    //hooks
    const { getOrgFullScheme } = useOrg();
    const { getAllTableStatistics, getTableStatisticById, statNameById } = useTableStatistics();
    const { userPatterns, getUserPosts } = useUsers();

    //refs
    const statSelectRef = useRef(null);

    //selectors
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === "admin");
    const user = useSelector((state: any) => state.main.user as UserI);
    const { offices, generalDirector } = useSelector((state: StateReduxI) => state.org);

    //vars
    const isGenDir = generalDirector === user.userId;
    const { userDepartments, userOffices, userSections } = getUserPosts(user.userId);
    const statGrupType = ["Заполняемые", "Контролируемые"];
    const statType = ["Главная статистика", "Дополнительные статистики"];
    //funcs

    //effects
    useEffect(() => {
        // ADMIN FULL STATS LIST || USER LIST POST

        if (isAdmin) {
            //АДМИН
            setStatisticList(celarPeriodStats(tableStatisticsList)); // ВСЕ СТАТИСТИКИ
        } else {
            //ПОЛЬЗОВАТЕЛЬ

            //ЛИСТ ПОСТОВ
            console.log("USER POSTS⭐⭐⭐⭐");
            const tempList = [...userOffices.map((office, officeIdx) => ({ listName: `РО : ${office.name}@${officeIdx}` })), ...userDepartments.map((department, departmentIdx) => ({ listName: `НО : ${department.name}@${departmentIdx}` })), ...userSections.map((section, sectionIdx) => ({ listName: `АС : ${section.name}@${sectionIdx}` }))];
            setUserPostList(tempList);
        }
    }, [tableStatisticsList, user, isAdmin]);

    //ON USER SELECT POST

    useEffect(() => {
        setError("");
        //setTableSelect(0);
        //setSelectedTable('clear');
        const userPostsObj = {
            РО: userOffices,
            НО: userDepartments,
            АС: userSections,
        };
        if (userPostSelect) {
            if (userPostSelect === "genDir") {
                setPostItem("genDir");
                return;
            }
            const postType = userPostSelect.split(":")[0].trim();
            const itemIndx = userPostSelect.split("@")[1].trim();
            let currentPostItem = userPostsObj[postType][itemIndx];

            setPostItem(currentPostItem);
            console.log("SELECT", userPostsObj[postType][itemIndx]);
        }
    }, [userPostSelect]); // листы не ставим

    // ПРИ ВЫБОРЕ СТАТИСТИКИ У ВСЕХ
    useEffect(() => {
        if (tableSelect) {
            const currentTable = tableStatisticsList.find((table) => table.id == tableSelect);
            if (currentTable && /@/g.test(currentTable.name)) {
                const statName = currentTable.name.split("@")[0].trim();
                setPeriodList(tableStatisticsList.filter((table) => table.name.includes(`${statName} @`)));
                setPeriodSelect(0);
                setSelectedTable("clear");
            } else {
                setPeriodSelect(0);
                setPeriodList([]);
                getTableStatisticById(tableSelect).then(setSelectedTable);
            }
        } else {
            setSelectedTable("clear");
            setPeriodSelect(0);
            setPeriodList([]);
        }
    }, [tableSelect]);

    useEffect(() => {
        //ПРИ ВЫБОРЕ ПЕРИОДА СТАТИСТИКИ
        if (periodSelect) {
            getTableStatisticById(periodSelect).then(setSelectedTable);
            return;
        }
    }, [periodSelect]);

    useEffect(() => {
        // ORG SELECTS
        let target: OfficeI | DepartmentI | SectionI | null = null;

        if (officeSelect) {
            const curOffice = offices.find((office) => office.id == officeSelect);
            if (curOffice) {
                target = curOffice;
                setDepartmentList(curOffice.departments);
                if (depSelect) {
                    const curDep = curOffice.departments.find((dep) => dep.id == depSelect);
                    if (curDep) {
                        target = curDep;
                        setSecList(curDep.sections);
                        if (secSelect) {
                            const curSec = curDep.sections.find((sec) => sec.id == secSelect);
                            if (curSec) {
                                target = curSec;
                            }
                        }
                    }
                } else {
                    setSecList([]);
                    setSecSelect(0);
                    setTargetStatSelect(0);
                }
            }
        } else {
            setTargetStatSelect(0);
            setDepartmentList([]);
            setSecList([]);
            setDepSelect(0);
            setSecSelect(0);
        }

        setTargetOrg(target);
    }, [officeSelect, depSelect, secSelect]);

    //MEMO
    //orgTarget
    const targetHtml = useMemo(() => {
        if (targetOrg) {
            return (
                <div className={styles.targetBlock}>
                    <div>{targetOrg.name}</div>
                    <div onClick={() => setTableSelect(targetOrg.mainPattern)}>главный шаблон : {clearStatName(statNameById(targetOrg.mainPattern))}</div>
                    {!!targetOrg.patterns.length && (
                        <div>
                            {targetOrg.patterns.map((statId) => (
                                <div key={Math.random()} onClick={() => setTableSelect(statId)}>
                                    {statNameById(statId)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        } else {
            return <></>;
        }
    }, [targetOrg]);

    //on selecte target stats
    useEffect(() => {
        setTableSelect(targetStatSelect);
    }, [targetStatSelect]);

    //ПРИ ПЕРЕХОДЕ ИЗ ОТЧЕТОВ
    useEffect(() => {
        if (param) {
            // console.log("PARAM", param);
            setTableSelect(param);
        }
    }, [param]);

    return (
        <div className={styles.stat2Wrap}>
            {!isAdmin && ( // ВЫБОР ПОСТА У ПОЛЬЗОВАТЕЛЯ
                <div className={styles.userShooseStatBlock}>
                    <select className={styles.postSelect} value={userPostSelect} onChange={(event) => setUserPostSelect(event.target.value)}>
                        <option value={""}>выбор поста</option>
                        {isGenDir && <option value="genDir">⭐Генеральный директор</option>}
                        {userPostList.map((post) => (
                            <option key={Math.random()} value={post.listName}>
                                {post.listName.split("@")[0]}
                            </option>
                        ))}
                    </select>

                    {
                        // У ПОЛЬЗОВАТЕЛЯ
                        !!userPostSelect.length && (
                            <FilterStat
                                {...{
                                    isGenDir,
                                    postItem,
                                    setTableSelect,
                                    clearTable: () => {
                                        setSelectedTable("clear");
                                    },
                                }}
                            />
                        )
                    }
                </div>
            )}

            {
                //ВЫБОР ИЗ ВСЕХ СТАТИСТИК У АДМИНА
                !!statisticList.length && !targetOrg && (
                    <div className={styles.shooseStatBlock}>
                        <div className={styles.filterBlock}>
                            <input
                                type="text"
                                value={filterStats}
                                onChange={(event) => {
                                    setFilterStats(event.target.value.trimStart());
                                    //statSelectRef.current.
                                }}
                                placeholder="фильтр по названию"
                            />
                            {!!filterStats.trim().length && (
                                <div className={styles.close} onClick={() => setFilterStats("")}>
                                    ❌
                                </div>
                            )}
                        </div>
                        <select ref={statSelectRef} value={param || tableSelect} onChange={(event) => setTableSelect(+event.target.value)}>
                            <option value={0}>{filterStats.trim().length ? `статистики по фильтру " ${filterStats.trim()} " : 📉${statisticList.filter((stat) => stat.name.toLowerCase().includes(filterStats.toLowerCase())).length}` : "выбор из всех статистик "}</option>
                            {statisticList
                                .filter((stat) => stat.name.toLowerCase().includes(filterStats.toLowerCase()))
                                .toSorted((a, b) => a.name.trim().localeCompare(b.name.trim()))
                                .map((table) => (
                                    <option key={nanoid()} value={table.id}>
                                        {clearStatName(table.name)}
                                    </option>
                                ))}
                        </select>
                    </div>
                )
            }

            {
                //ВЫБОР ИЗ ОРГ СХЕМЫ
                isAdmin && (
                    <div className={styles.orgFilterBlock}>
                        {!!officeSelect && (
                            <div className={styles.orgFilterClose} onClick={() => setOfficeSelect(0)}>
                                ❌
                            </div>
                        )}
                        <select className={styles.officeList} value={officeSelect} onChange={(event) => setOfficeSelect(+event.target.value)}>
                            <option value={0}>выбор по орг схеме</option>
                            {offices.map((office) => (
                                <option key={nanoid()} value={office.id}>
                                    {office.name}
                                </option>
                            ))}
                        </select>
                        {!!departmentList.length && (
                            <select className={styles.depList} value={depSelect} onChange={(event) => setDepSelect(+event.target.value)}>
                                <option value={0}>выбор отделения</option>
                                {departmentList.map((dep) => (
                                    <option key={nanoid()} value={dep.id}>
                                        {dep.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!!secList.length && (
                            <select className={styles.secList} value={secSelect} onChange={(event) => setSecSelect(+event.target.value)}>
                                <option value={0}>выбор секции</option>
                                {secList.map((sec) => (
                                    <option key={nanoid()} value={sec.id}>
                                        {sec.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {targetOrg && (
                            <select className={styles.targetList} value={targetStatSelect} onChange={(event) => setTargetStatSelect(+event.target.value)}>
                                <option value={0}>выбор статистики из "{targetOrg?.name}"</option>
                                <option value={targetOrg.mainPattern}>🚩{clearStatName(statNameById(targetOrg.mainPattern))}</option>
                                {!!targetOrg.patterns.length &&
                                    targetOrg.patterns.map((statId) => (
                                        <option key={nanoid()} value={statId}>
                                            {clearStatName(statNameById(statId))}
                                        </option>
                                    ))}
                            </select>
                        )}

                        {/* {
                        targetHtml
                    } */}
                    </div>
                )
            }

            {
                // ЛИСТ ПЕРИОДОВ ВЫБРАННОЙ СТАТИСТИКИ
                !!periodList.length && (
                    <div className={styles.periodSelect}>
                        {/* {clearStatName(tableStatisticsList.find(table => table.id == tableSelect)?.name || '')} */}
                        <span>🕒</span>
                        <select value={periodSelect} onChange={(event) => setPeriodSelect(+event.target.value)}>
                            <option value={0}>выбрать период</option>
                            {periodList.map((table) => (
                                <option key={nanoid()} value={table.id}>
                                    {table.name.split("@")[1]}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }
            <div style={{ color: "tomato", padding: 10 }}>{error}</div>

            <EditableStatisticTable
                selectedTable={selectedTable}
                disableSelectOnList={() => {
                    setTableSelect(0);
                    setSelectedTable(undefined);
                    setPeriodSelect(0);
                }}
            />
        </div>
    );
}
