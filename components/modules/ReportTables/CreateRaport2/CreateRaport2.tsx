import { StateReduxI } from "@/redux/store";
import { IOrgItem, RaportTableInfoI, StatItemReady, StatItemReadyWithCoords, TableStatisticListItemI, UserFullI, UserI } from "@/types/types";
import { useSelector } from "react-redux";
import styles from "./raport2.module.scss";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { clearStatName } from "@/utils/funcs";
import { daySec, orgItemsColorsObj } from "@/utils/vars";
import useOrgItemFilters from "./useOrgItemsFilters";
import useUsers from "@/hooks/useUsers";
import StatView from "./StatView/StatView";
import StatChartBox from "./StatChartBox/StatChartBox";
import { createExelFile, createExelFileNew } from "@/utils/exelFuncs";
import { useAccessRoutes } from "@/hooks/useAccessRoutes";

import ExcelJS from "exceljs";

// Функция для сохранения таблицы в файл Excel
const saveTableToExcel = (headers: string[], tableData: string[][]) => {
    // Создаем новый экземпляр объекта Workbook
    const workbook = new ExcelJS.Workbook();

    // Добавляем новый лист в книгу
    const tableName = `Отчеты ${new Date().toLocaleDateString()}`;
    const worksheet = workbook.addWorksheet(tableName);

    //Стандартный размер колонки
    // worksheet.properties.defaultColWidth = 80;

    // Заполняем заголовки таблицы
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    // Заполняем данные таблицы
    tableData.forEach((row) => {
        worksheet.addRow(row);
    });

    //style
    worksheet.getColumn(1).width = 24;
    worksheet.getColumn(2).width = 80;
    worksheet.getColumn(3).width = 10;
    //fill
    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "FF8056" },
    };

    //font
    worksheet.getRow(1).font = {
        name: "Arial",
        family: 4,
        size: 11,
        bold: false,
        color: { argb: "FFFFFF" },
    };

    // Сохраняем книгу в файл
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = tableName + `.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    });
};

export default function CreateRaport2() {
    //STATE
    const [isShowLastUpdate, setIsShowLastUpdate] = useState<boolean>(JSON.parse(localStorage.getItem("showLastUpdate") || `false`));
    const [isShowFilteredOrg, setIsShowFilteredOrg] = useState(false);
    const [isSelectedAllOrgChildren, setIsSelectedAllOrgChildren] = useState(true);
    const [selectedStats, setSelectedStats] = useState<number[]>(JSON.parse(localStorage.getItem("selectedStats") || `[]`));
    const addToSelectedStatToggle = (id: number) => setSelectedStats((state) => (state.includes(id) ? state.filter((stateId) => stateId !== id) : [...new Set([...state, id])]));

    //stats filter
    const [statView, setStatToView] = useState<StatItemReadyWithCoords | null>(null);
    const [statViewArr, setStatViewArr] = useState<StatItemReady[]>([]);
    const statViewArrToggle = (stat: StatItemReady) => setStatViewArr((state) => (state.findLastIndex((statState) => statState.id === stat.id) < 0 ? [stat, ...state] : state.filter((statState) => statState.id !== stat.id)));

    //stats filter show
    const [isOfficeListShow, setIsOfficeListShow] = useState(false);
    const [isDepartmentListShow, setIsDepartmentListShow] = useState(false);
    const [isSectionListShow, setIsSectionListShow] = useState(false);

    //SELECTORS
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    const isAdmin = useSelector((state: any) => state.main.user?.role === "admin");
    const user: UserI = useSelector((state: any) => state.main.user);
    const { users }: { users: UserFullI[] } = useSelector((state: StateReduxI) => state.users);
    const initOrgItems = useSelector((state: StateReduxI) => {
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
                //console.log(startOfLastWeek);

                //console.log("LAST", startOfLastWeek);

                if (startOfLastWeek.getTime() <= info.lastFilledPeriod?.end) return { ...stat, main, isGrowing, periodStr, filled: true };
                else return { ...stat, main, isGrowing, periodStr, filled: false };
            }
            if (currentDateSec >= info.lastFilledPeriod?.start && currentDateSec <= info.lastFilledPeriod?.end + daySec * 2) return { ...stat, main, isGrowing, periodStr, filled: true };
            if (currentDateSec >= info.lastFilledPeriod?.end + daySec * 2) return { ...stat, main, isGrowing, periodStr, filled: false };

            return { ...stat, main, isGrowing, periodStr, filled: false };
        };

        const fullOrgWithdata = state.org.offices
            .toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name))
            .map((office) => {
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

    // console.log(initOrgItems);

    //HOOKS
    const { filteredOrgItems, filters, filtersToggle, options, counters } = useOrgItemFilters({ initOrgItems, isShowFilteredOrg, isSelectedAllOrgChildren });
    const { userByID } = useUsers();
    const { accessedRoutes } = useAccessRoutes();
    const tabelsRoute = accessedRoutes.find((route) => route.id === 10);

    //MEMO
    const tableBodyMemo = useMemo(() => {
        if (filteredOrgItems.length) {
            const statItem = (item: StatItemReady | undefined) => {
                if (!item) return false;
                //цвета статусов колнки тренда
                const trendResultColorsObj = {
                    growing: "lightgreen",
                    falling: "tomato",
                    empty: "gray",
                };
                let currentTrendStatus: keyof typeof trendResultColorsObj;

                if (/растущая/.test(item.isGrowing.toLowerCase())) {
                    currentTrendStatus = "growing";
                } else if (/падающая/.test(item.isGrowing.toLowerCase())) {
                    currentTrendStatus = "falling";
                } else {
                    currentTrendStatus = "empty";
                }

                const trendType = item.dateColumn.raportInfo?.trendType.toLowerCase().replace("тренд", "").replace("не указан", "");
                const trendStatus = /не определено/.test(item.isGrowing) ? "" : item.isGrowing;
                const isFilledPeriod = !/не заполнена/.test(item.periodStr);
                console.log(item);

                const lineStyle = `${styles.statLine} ${selectedStats.includes(item.id) ? styles.statLine_selected : ""}`;
                return (
                    <tr className={lineStyle} key={item.name + "statItem"} onClick={() => addToSelectedStatToggle(item.id)}>
                        <td title={"🚩 - главная\n📄- дополнительная"}>
                            <span>{item.main ? "🚩" : "📄"}</span>
                        </td>
                        <td
                            className={`${styles.timeCell} ${item.filled ? styles.timeCell_filled : ""}`}
                            title={`последний заполненный период`}
                            onMouseEnter={(event) => {
                                const { x, y, width, height } = event.currentTarget.getBoundingClientRect();

                                setStatToView({ ...item, x, y: y + height + 10, type: "period" });
                            }}
                            onMouseLeave={() => setStatToView(null)}
                        >
                            <div className={styles.timeBlock}>
                                <span>{item.periodStr}</span>
                                {isShowLastUpdate && isFilledPeriod && (
                                    <span className={styles.lastUpdate}>
                                        <span className={styles.date}>{new Date(item.lastUpdate).toLocaleDateString()}</span>
                                        <span className={styles.time}>{new Date(item.lastUpdate).toLocaleTimeString()}</span>
                                    </span>
                                )}
                            </div>
                        </td>
                        <td
                            onMouseEnter={(event) => {
                                const { x, y, width, height } = event.currentTarget.getBoundingClientRect();

                                setStatToView({ ...item, x, y: y + height + 10, type: "table" });
                            }}
                            onMouseLeave={() => setStatToView(null)}
                            onContextMenu={(event) => {
                                console.log("CLICK");
                                event.preventDefault();
                                // window.location.search = `statId=${item.id}`;
                                tabelsRoute.clickFunc(item.id);
                            }}
                        >
                            {clearStatName(item.name)}
                        </td>
                        {/* <td title={trendType}>{trendType!.replace("перевёрнутый", "📈").replace("стандартный", "📉")}</td> */}
                        <td
                            className={`${styles.trendCell} ${styles[`trendCell_${currentTrendStatus}`]}`}
                            //style={{ background: trendResultColorsObj[currentTrendStatus] }}

                            onMouseEnter={(event) => {
                                const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
                                // console.log({ width });
                                currentTrendStatus !== "empty" && setStatToView({ ...item, x, y: y + height + 10, type: "chart" });
                            }}
                            onMouseLeave={() => setStatToView(null)}
                            onContextMenu={(event) => {
                                event.preventDefault();
                                statViewArrToggle(item);

                                //statViewArrToggle(item.id);
                            }}
                        >
                            {trendStatus}
                        </td>
                    </tr>
                );
            };

            const listHtml = (
                <tbody key={Math.random()}>
                    {filteredOrgItems.map((item) => {
                        const patterns = item.patterns.filter((pattern) => !!pattern); // убираем отсутствующие статистики
                        return (
                            <>
                                <tr key={item.name + "itemMainList"}>
                                    <th colSpan={5} className={styles.itemHeader} style={{ background: orgItemsColorsObj[item.itemType] }}>
                                        <div>
                                            <span>{item.name}</span> <span>{userByID(item.leadership)?.name}</span>
                                        </div>
                                    </th>
                                </tr>
                                {!!item.mainPattern && statItem(item.mainPattern)}
                                {!!patterns.length && patterns.map((pattern) => statItem(pattern))}
                            </>
                        );
                    })}
                </tbody>
            );

            return { listHtml };
        }
    }, [filteredOrgItems, selectedStats, isShowLastUpdate]);

    //EFFECTS TEST
    //при отключении сортировки орг схемы убираем показываемые списки
    useEffect(() => {
        if (!isShowFilteredOrg) {
            setIsOfficeListShow(false);
            setIsDepartmentListShow(false);
            setIsSectionListShow(false);
        }
    }, [isShowFilteredOrg]);

    //LOCAL STORAGE
    useEffect(() => {
        localStorage.setItem("selectedStats", JSON.stringify(selectedStats));
        localStorage.setItem("showLastUpdate", JSON.stringify(isShowLastUpdate));
    }, [selectedStats, isShowLastUpdate]);

    const selectedFilterStyle = (selected: boolean): CSSProperties => ({ border: selected ? `2px solid black` : `2px solid transparent` });
    const selectedOrgFilterClass = (type: (typeof filters.orgTypeFilter)[0]) => (filters.orgTypeFilter.includes(type) ? `${styles.selectedFilter} noselect` : `${styles.notSelectedFilter} noselect`);
    const dropOrgSelectFilter = () => {
        setIsOfficeListShow(false);
        setIsDepartmentListShow(false);
        setIsSectionListShow(false);
    };
    const saveExel = () => {
        const columns = ["Период", "Название статистики", "Статус"];
        const rows = filteredOrgItems.reduce<string[][]>((acc, item) => {
            const temp = [item.mainPattern, ...item.patterns].filter((stat) => stat).map((stat) => [stat?.periodStr + "", stat?.name + "", stat?.isGrowing + ""]);
            return [...acc, ...temp];
        }, []);

        saveTableToExcel(columns, rows);
    };
    return (
        <div className={styles.mainWrap}>
            <StatView statView={statView} />
            {!!statViewArr.length && <StatChartBox statViewArr={statViewArr} />}

            <div className={styles.btnsBlock}>
                <div
                    title="Сбросить выделения"
                    className={styles.unselect}
                    onClick={() => {
                        confirm("Сбросить выделения ?") && setSelectedStats([]);
                    }}
                >
                    ⭐❌
                </div>
                <div className={styles.exelBtn} onClick={saveExel} title="Сохранить таблицу в exel">
                    <span>exel</span>
                    <span>📅</span>
                </div>
            </div>

            {(isOfficeListShow || isDepartmentListShow || isSectionListShow) && (
                <div
                    className={styles.itemsSelectBlock}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        dropOrgSelectFilter();
                    }}
                >
                    <div className={styles.closeWin} onClick={dropOrgSelectFilter}>
                        ❌
                    </div>

                    {isOfficeListShow && (
                        <div style={{ outline: `2px solid tomato` }}>
                            {options.lists.officesListOptions.map((offName) => (
                                <div key={offName + "optonsFilter"} onClick={() => options.selectsToggle.officeToggle(offName)} style={{ ...(options.selectedLists.officesSelectedList.includes(offName) ? { background: orgItemsColorsObj.office, color: "white" } : {}) }}>
                                    {offName}
                                </div>
                            ))}
                            {!!!options.lists.officesListOptions.length && <div>нет доступных отделений</div>}
                        </div>
                    )}
                    {isDepartmentListShow && (
                        <div style={{ outline: `2px solid blue` }}>
                            {options.lists.departmentsListOtions.map((depName) => (
                                <div key={depName + "optonsFilter"} onClick={() => options.selectsToggle.departmentToggle(depName)} style={{ ...(options.selectedLists.departmentsSelectedList.includes(depName) ? { background: orgItemsColorsObj.department, color: "white" } : {}) }}>
                                    {depName}
                                </div>
                            ))}
                            {!!!options.lists.departmentsListOtions.length && <div>нет доступных отделов : добавьте отделения</div>}
                        </div>
                    )}
                    {isSectionListShow && (
                        <div style={{ outline: `2px solid green` }}>
                            {options.lists.sectionsListOptions.map((secName) => (
                                <div key={secName + "optonsFilter"} onClick={() => options.selectsToggle.sectionToggle(secName)} style={{ ...(options.selectedLists.sectionsSelectedList.includes(secName) ? { background: orgItemsColorsObj.section, color: "white" } : {}) }}>
                                    {secName}
                                </div>
                            ))}
                            {!!!options.lists.sectionsListOptions.length && <div>нет доступных секций : добавьте отделы</div>}
                        </div>
                    )}
                </div>
            )}
            <div className={styles.tableWrap}>
                <table style={{ opacity: isOfficeListShow || isDepartmentListShow || isSectionListShow ? 0.4 : 1 }}>
                    <caption>
                        <div className={styles.filterOrgTypeBlock}>
                            <div className={styles[`isSelectFilter_${isShowFilteredOrg}`]}>
                                <label title="применить фильтр к элементам оргсхемы">
                                    <span> 📇</span>
                                    <input type="checkbox" checked={isShowFilteredOrg} onChange={(event) => setIsShowFilteredOrg(event.target.checked)} />
                                </label>
                            </div>
                            {isShowFilteredOrg && (
                                <div className={styles[`isSelectFilter_${isShowFilteredOrg}`]}>
                                    <label title="автоматический выбор всех дочерних элементов">
                                        <span> ✅</span>
                                        <input type="checkbox" checked={isSelectedAllOrgChildren} onChange={(event) => setIsSelectedAllOrgChildren(event.target.checked)} />
                                    </label>
                                </div>
                            )}

                            <div
                                className={selectedOrgFilterClass("office")}
                                onClick={() => filtersToggle.orgTypeFiltersToggle("office")}
                                style={{ background: orgItemsColorsObj.office }}
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    isShowFilteredOrg &&
                                        setIsOfficeListShow((state) => {
                                            if (state) {
                                                return false;
                                            } else {
                                                setIsDepartmentListShow(false);
                                                setIsSectionListShow(false);
                                                return true;
                                            }
                                        });
                                }}
                            >
                                отделения {isShowFilteredOrg ? `📇${options.selectedLists.officesSelectedList.length} из ${options.lists.officesListOptions.length}` : ""}
                            </div>
                            <div
                                className={selectedOrgFilterClass("department")}
                                onClick={() => filtersToggle.orgTypeFiltersToggle("department")}
                                style={{ background: orgItemsColorsObj.department }}
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    isShowFilteredOrg &&
                                        setIsDepartmentListShow((state) => {
                                            if (state) {
                                                return false;
                                            } else {
                                                setIsOfficeListShow(false);
                                                setIsSectionListShow(false);
                                                return true;
                                            }
                                        });
                                }}
                            >
                                отделы {isShowFilteredOrg ? `📇${options.selectedLists.departmentsSelectedList.length} из ${options.lists.departmentsListOtions.length}` : ""}
                            </div>
                            <div
                                className={selectedOrgFilterClass("section")}
                                onClick={() => filtersToggle.orgTypeFiltersToggle("section")}
                                style={{ background: orgItemsColorsObj.section }}
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    isShowFilteredOrg &&
                                        setIsSectionListShow((state) => {
                                            if (state) {
                                                return false;
                                            } else {
                                                setIsOfficeListShow(false);
                                                setIsDepartmentListShow(false);
                                                return true;
                                            }
                                        });
                                }}
                            >
                                секции {isShowFilteredOrg ? `📇${options.selectedLists.sectionsSelectedList.length} из ${options.lists.sectionsListOptions.length}` : ""}
                            </div>
                        </div>

                        <div className={styles.filterTypeBlock}>
                            <div className={styles[`selectedFilter_${filters.mainStatFilter}`]} onClick={filtersToggle.mainStatFilterToggle}>
                                <span className={`${styles.title} noselect`}>Главные статистики </span> <span className={styles.count}>{counters.mainStatCount || 0}</span>
                            </div>
                            <div className={styles[`selectedFilter_${filters.additionalStatsFilter}`]} onClick={filtersToggle.additionalStatsFilter}>
                                <span className={`${styles.title} noselect`}>Дополнительные статистики </span> <span className={styles.count}>{counters.additionalStatCount || 0}</span>
                            </div>
                        </div>

                        <div className={styles.filterBlock}>
                            <div className={styles[`selectedFilter_${filters.growingFilter}`]} onClick={filtersToggle.growingFilterToggle}>
                                <span className={`${styles.title} noselect`}>Растущих статистик </span> <span className={styles.count}>{counters.growingStatsCount || 0}</span>
                            </div>
                            <div className={styles[`selectedFilter_${filters.fallingFilter}`]} onClick={filtersToggle.fallingFilterToggle}>
                                <span className={`${styles.title} noselect`}>Падающих статистик </span> <span className={styles.count}>{counters.notGrowingStatsCount || 0}</span>
                            </div>

                            <div className={styles[`selectedFilter_${filters.emptyFilter}`]} onClick={filtersToggle.emptyFilterToggle}>
                                <span className={`${styles.title} noselect`}>Пустые статистики </span> <span className={styles.count}>{counters.noDataGrowingStatsCount || 0}</span>
                            </div>
                        </div>
                        <div className={styles.filterFellingBlock}>
                            <div className={styles[`selectedFilter_${filters.filledFilter}`]} onClick={filtersToggle.filledFilterToggle}>
                                <span className={`${styles.title} noselect`}>Заполненные статистики </span> <span className={styles.count}>{counters.fillledStatsCount || 0}</span>
                            </div>
                            <div className={styles[`selectedFilter_${filters.notFilledFilter}`]} onClick={filtersToggle.notFilledFilterToggle}>
                                <span className={`${styles.title} noselect`}>He заполненные статистики </span> <span className={styles.count}>{counters.notFillledStatsCount || 0}</span>
                            </div>
                        </div>
                    </caption>

                    <thead>
                        <tr>
                            <th className={styles.mainColumn}></th>
                            <th className={styles.mainColumn}>
                                <div className={styles.periodColumnBlock}>
                                    <span>Период</span>
                                    <span className={styles[`isLastUpdate_${isShowLastUpdate}`]} onClick={() => setIsShowLastUpdate((state) => !state)}>
                                        ⏲️
                                    </span>
                                </div>
                            </th>
                            <th className={styles.mainColumn}>Название статистики</th>
                            {/* <th className={styles.mainColumn} title={"вид тренда:\n📉 - стандартный\n📈 - перевернуты "}>
                            Тип
                        </th> */}
                            <th className={styles.mainColumn}>Cтатус </th>
                        </tr>
                    </thead>

                    {tableBodyMemo?.listHtml}
                </table>
            </div>
        </div>
    );
}
