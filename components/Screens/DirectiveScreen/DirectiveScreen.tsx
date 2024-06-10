import { useMemo, useState } from "react";
import styles from "./direct.module.scss";
import { nanoid } from "@reduxjs/toolkit";
import { IDirectHeader, IDirectTable, IOrgItem, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI, UserFullI, UserI } from "@/types/types";
import { daySec } from "@/utils/vars";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import DirectTable from "./DirectTable";
import Modal from "@/components/elements/Modal/Modal";

export default function DirectiveScreen() {
    //ФУНКЦИЯ  ПРОВЕРКИ ЗАПОЛНЕНОГО ПЕРИОДА✍️⌛
    const addingFilledField = (stat: TableStatisticListItemI, main = false): StatItemReady => {
        const isGrowing = stat.dateColumn.raportInfo?.trendStatus || "нет данных";

        //Формируем строку времен периода
        let periodStr = `не заполнена`;
        if (stat.dateColumn.raportInfo?.lastFilledPeriod?.start && stat.dateColumn.raportInfo?.lastFilledPeriod?.end) {
            periodStr = `${new Date(stat.dateColumn.raportInfo.lastFilledPeriod.start).toLocaleDateString()} - ${new Date(stat.dateColumn.raportInfo.lastFilledPeriod.end).toLocaleDateString()}`;
        }

        if (!stat?.dateColumn.raportInfo) {
            return { ...stat, main, isGrowing, periodStr, filled: false };
        }
        const info: RaportTableInfoI = stat.dateColumn.raportInfo;

        const currentDateSec = new Date().getTime();
        if (info.statHeaders?.[0].trim() == "2 года плюс текущий период") {
            //проверяем заполнение прошлого месяца
            const lastMonth = new Date(new Date().setDate(0));
            lastMonth.setHours(0, 0, 0, 0);
            if (lastMonth.getTime() <= info.lastFilledPeriod?.end) return { ...stat, main, periodStr, isGrowing, filled: true };
            else return { ...stat, main, isGrowing, periodStr, filled: false };
        }
        if (info.statHeaders?.[0].trim() == "13ти недельный период") {
            //проверяем заполнение прошлой недели
            const currentDate = new Date();
            const startOfLastWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() - 6);

            const filled = startOfLastWeek.getTime() <= info.lastFilledPeriod?.start;

            return { ...stat, main, isGrowing, periodStr, filled };
        }
        if (currentDateSec >= info.lastFilledPeriod?.start && currentDateSec <= info.lastFilledPeriod?.end + daySec * 2) return { ...stat, main, isGrowing, periodStr, filled: true };
        if (currentDateSec >= info.lastFilledPeriod?.end + daySec * 2) return { ...stat, main, isGrowing, periodStr, filled: false };

        return { ...stat, main, isGrowing, periodStr, filled: false };
    };

    const getLatestTable = (id: number) => {
        const currentStat = tableStatisticsList.find((stat) => stat.id == id);

        if (currentStat && /@/g.test(currentStat.name)) {
            const statName = currentStat.name.split("@")[0].trim();
            const statsArr = tableStatisticsList.filter((stat) => stat.name.split("@")[0].trim() == statName).toSorted((a, b) => b.id - a.id);
            if (statsArr.length) {
                return statsArr[0];
            } else {
                return currentStat;
            }
        }

        return currentStat;
    };

    //SELECTORS
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    const isAdmin = useSelector((state: any) => state.main.user?.role === "admin");
    const user: UserI = useSelector((state: any) => state.main.user);
    const { users }: { users: UserFullI[] } = useSelector((state: StateReduxI) => state.users);
    const initOrgItems = useSelector((state: StateReduxI) => {
        const fullOrgWithdata = state.org.offices
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

        //собираем все айтемы в один массив
        let itemCells: IOrgItem[] = [];

        //ПОДГОТОВЛИВАЕМ ЯЧЕЙКУ
        //проверяем наличие статистик в айтеме и очищаем от пустых
        const preparationOrgCell = (item: any) => {
            const patterns = item.patterns.filter((pattern) => !!pattern);
            if (!item.mainPattern && !patterns.length) {
                return []; // если нет статистик не возвращаем item
            } else {
                //дополняем каждую статистику полем filled - ЗАПОЛНЕНОСТЬ
                return [{ ...item, mainPattern: item.mainPattern ? addingFilledField(item.mainPattern, true) : undefined, patterns: patterns.map((item) => addingFilledField(item, false)) }];
            }
        };
        fullOrgWithdata.forEach((office) => {
            itemCells = [...itemCells, ...preparationOrgCell(office)];
            office.departments.forEach((department) => {
                itemCells = [...itemCells, ...preparationOrgCell(department)];
                department.sections.forEach((section) => {
                    itemCells = [...itemCells, ...preparationOrgCell(section)];
                });
            });
        });

        return itemCells;
    });

    // console.log(initOrgItems.filter((item) => item.itemType === "office"));

    //STATE
    const [headers, setHeaders] = useState<IDirectHeader[]>([
        {
            id: nanoid(),
            title: "item name",
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
    ]);
    const [tabels, setTables] = useState<IDirectTable[]>([]);
    const [isAddTable, setIsAddTable] = useState(true);

    //FUNCS
    const onAddTable = (item: IOrgItem) => {
        setTables((state) => [
            ...state,
            {
                id: nanoid(),
                item,
                stats: [],
            },
        ]);
    };

    const addAllOffices = () => {
        initOrgItems.filter((item) => item.itemType === "office").forEach(onAddTable);
    };

    const createdTabels = useMemo(() => {
        return tabels.map((table) => {
            const allItemStats = [table.item?.mainPattern, ...table.item!.patterns] as StatItemReady[];
            // console.log(allItemStats);
            return <DirectTable headers={headers} table={table} setTables={setTables} />;
        });
    }, [tabels, headers]);

    return (
        <div className={styles.directWrap}>
            <div className={styles.addTableBtn} onClick={() => setIsAddTable(true)}>
                Добавить таблицу
            </div>
            {isAddTable && (
                <Modal fullWidth closeModalFunc={() => setIsAddTable(false)}>
                    <div className={styles.addTableModal}></div>
                </Modal>
            )}
            <div>Directive Screen</div>
            <button onClick={() => onAddTable(initOrgItems[0])}> test add</button>
            <button onClick={addAllOffices}> test add all</button>

            <table className={styles.mainTable}>{createdTabels}</table>
        </div>
    );
}
