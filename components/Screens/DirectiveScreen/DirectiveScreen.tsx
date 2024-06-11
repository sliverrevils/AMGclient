import { useMemo, useState } from "react";
import styles from "./direct.module.scss";
import { nanoid } from "@reduxjs/toolkit";
import { IDirectHeader, IDirectOffice, IDirectTable, IOrgItem, OfficeI, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI, UserFullI, UserI } from "@/types/types";
import { daySec } from "@/utils/vars";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import DirectTable from "./DirectTable";
import Modal from "@/components/elements/Modal/Modal";
import useTableStatistics from "@/hooks/useTableStatistics";

const defaultHeaders: IDirectHeader[] = [
    {
        id: nanoid(),
        title: "Название блока",
        color: "lightgreen",
    },
    {
        id: nanoid(),
        title: "План/факт за прошедший период",
        color: "lightgreen",
    },
    {
        id: nanoid(),
        title: "Состояние",
        color: "lightgreen",
    },
    {
        id: nanoid(),
        title: "Квота на будущий период",
        color: "lightgreen",
    },
    {
        id: nanoid(),
        title: "Планируемое состояние на будущий период",
        color: "lightgreen",
    },
];

export default function DirectiveScreen() {
    //HOOKS
    const { getLatestTable, addingFilledField } = useTableStatistics();

    //SELECTORS
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    const { offices } = useSelector((state: StateReduxI) => state.org);
    const isAdmin = useSelector((state: any) => state.main.user?.role === "admin");
    const user: UserI = useSelector((state: any) => state.main.user);
    const { users }: { users: UserFullI[] } = useSelector((state: StateReduxI) => state.users);
    const fullOrgWithdata = useSelector((state: StateReduxI) => {
        const orgWithdata = state.org.offices
            .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
            .map((office) => {
                return {
                    ...office,
                    mainPattern: getLatestTable(office.mainPattern),
                    patterns: office.patterns.map((stat) => getLatestTable(stat)),
                    departments: office.departments
                        .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
                        .map((dep) => {
                            return {
                                ...dep,
                                mainPattern: getLatestTable(dep.mainPattern),
                                patterns: dep.patterns.map((stat) => getLatestTable(stat)),
                                sections: dep.sections
                                    .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
                                    .map((sec) => {
                                        return {
                                            ...sec,
                                            mainPattern: getLatestTable(sec.mainPattern),
                                            patterns: sec.patterns.map((stat) => getLatestTable(stat)).filter((stat) => !!stat),
                                            itemType: "section", // - отображение секции
                                        };
                                    }),
                                itemType: "department", // - отображение деп блока
                            };
                        }),
                    itemType: "office", // - отображение офиса
                };
            });

        return orgWithdata as IDirectOffice[];
    });

    // console.log(initOrgItems.filter((item) => item.itemType === "office"));

    //STATE
    const [headers, setHeaders] = useState<IDirectHeader[]>(defaultHeaders);
    const [tabels, setTables] = useState<IDirectTable[]>([]);
    const [isAddTable, setIsAddTable] = useState(false);

    //FUNCS
    //headers
    const onDelHeader = (id: string) => {
        setHeaders((state) => state.filter((header) => header.id !== id));
        //удаляем логику с ячеек для этой колонки по ID колонки
        setTables((state) => state.map((table) => ({ ...table, stats: table.stats.map((stat) => ({ ...stat, logicStrArr: stat.logicStrArr.filter((logic) => logic.headerId !== id) })) })));
    };

    const onAddHeader = () => {
        const newHeaderId = nanoid();
        setHeaders((state) => [
            ...state,
            {
                id: newHeaderId,
                title: "Новая колонка",
                color: "lightgreen",
            },
        ]);
        setTables((state) => state.map((table) => ({ ...table, stats: table.stats.map((stat) => ({ ...stat, logicStrArr: [...stat.logicStrArr, { headerId: newHeaderId, logicStr: "" }] })) })));
    };

    //tabels
    const onAddTable = (item: IDirectOffice) => {
        setTables((state) => [
            ...state,
            {
                id: nanoid(),
                officeID: item.id,
                stats: [],
            },
        ]);
    };

    const addAllOffices = () => {
        fullOrgWithdata.forEach(onAddTable);
    };

    //TABLE HTML
    const mainTable = useMemo(() => {
        console.log(tabels);
        return tabels.map((table) => {
            return <DirectTable headers={headers} table={table} setTables={setTables} fullOrgWithdata={fullOrgWithdata} />;
        });
    }, [tabels, headers]);

    const headersEditBlock = useMemo(() => {
        return (
            <div className={styles.headersEditBlock}>
                {headers.map((header, headerIdx) => {
                    return (
                        <div className={styles.headersItem}>
                            <div className={styles.itemText}> {header.title}</div>
                            {!!headerIdx && (
                                <div className={styles.itemDel} onClick={() => confirm(`Удалить колонку "${header.title}" со всеми логиками ячеек таблиц ?`) && onDelHeader(header.id)}>
                                    ❌
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className={styles.addBtn} onClick={onAddHeader}>
                    Добавить колонку
                </div>
            </div>
        );
    }, [headers]);

    return (
        <div className={styles.directWrap}>
            <div className={styles.addTableBtn} onClick={() => setIsAddTable(true)}>
                <span>Добавить таблицу</span>
            </div>
            {isAddTable && (
                <Modal fullWidth closeModalFunc={() => setIsAddTable(false)}>
                    <div className={styles.addTableModal}></div>
                </Modal>
            )}
            {headersEditBlock}
            {/* <button onClick={() => onAddTable(initOrgItems[0])}> test add</button> */}
            <button onClick={addAllOffices}> test add all</button>

            <table className={styles.mainTable}>{mainTable}</table>
        </div>
    );
}
