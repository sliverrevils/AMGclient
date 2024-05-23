import { StateReduxI } from "@/redux/store";
import { IOrgItem, StatItemReady } from "@/types/types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

//vars
let fillledStatsCount = 0; // количество заполненных
let notFillledStatsCount = 0; // количество не заполненных
let growingStatsCount = 0;
let notGrowingStatsCount = 0;
let noDataGrowingStatsCount = 0;
let mainStatCount = 0;
let additionalStatCount = 0;

export default function useOrgItemFilters({ initOrgItems, isShowFilteredOrg, isSelectedAllOrgChildren }: { initOrgItems: IOrgItem[]; isShowFilteredOrg: boolean; isSelectedAllOrgChildren: boolean }) {
    //SELECTORS
    const { offices } = useSelector((state: StateReduxI) => state.org);

    //STATE
    const [filteredOrgItems, setFilteredOrgItems] = useState(initOrgItems);
    //filters
    const [orgTypeFilter, setOrgTypeFilter] = useState<("office" | "department" | "section")[]>(["office", "department", "section"]);
    const [selectedStatType, setSelectedStatType] = useState<boolean | null>(null);
    const [growingFilter, setGrowingFilter] = useState(false);
    const [fallingFilter, setFallingFilter] = useState(false);
    const [filledFilter, setFilledFilter] = useState(false);
    const [notFilledFilter, setNotFilledFilter] = useState(false);
    const [emptyFilter, setEmptyFilter] = useState(false);
    //filter org options
    //off

    const [officesSelectedList, setOfficesSelectedList] = useState<string[]>([]); //offices.map((office) => office.name)
    //dep
    const [departmentsSelectedList, setDepartmentsSelectedList] = useState<string[]>([]);
    //
    const [sectionsSelectedList, setSectionSelectedList] = useState<string[]>([]);

    //console.log("HOOK", initOrgItems);

    useEffect(() => {
        let filtered: IOrgItem[] = initOrgItems;

        //COUNT VARS
        fillledStatsCount = 0; // количество заполненных
        notFillledStatsCount = 0; // количество не заполненных
        growingStatsCount = 0;
        notGrowingStatsCount = 0;
        noDataGrowingStatsCount = 0;
        mainStatCount = 0;
        additionalStatCount = 0;

        //фильтр по орг типам
        filtered = filtered.filter((item) => orgTypeFilter.includes(item.itemType));

        //фильтр по выбору офиса из списка
        if (isShowFilteredOrg) {
            //offices
            filtered = filtered.filter((item) => {
                if (item.itemType === "office") {
                    return officesSelectedList.includes(item.name);
                } else {
                    return true;
                }
            });
            //departments
            filtered = filtered.filter((item) => {
                if (item.itemType === "department") {
                    return departmentsSelectedList.includes(item.name);
                } else {
                    return true;
                }
            });
            //sections
            filtered = filtered.filter((item) => {
                if (item.itemType === "section") {
                    return sectionsSelectedList.includes(item.name);
                } else {
                    return true;
                }
            });
        }
        //COUNT главные/дополнительные✍️
        filtered.forEach((item) => {
            item.mainPattern && mainStatCount++;
            additionalStatCount += item.patterns.filter((stat) => stat).length;
        });

        // фильтр главные/дополнительные
        if (selectedStatType !== null) {
            if (selectedStatType) {
                filtered = filtered.map((item) => {
                    return { ...item, patterns: [] };
                });
            } else {
                filtered = filtered.map((item) => {
                    return { ...item, mainPattern: undefined };
                });
            }
        }

        // фильтр растущие|| падающие|| пустые
        const trendStatus = (statItem: StatItemReady | undefined): "growing" | "falling" | "empty" | undefined => {
            if (!statItem) return undefined;
            if (/растущая/.test(statItem.isGrowing.toLowerCase())) {
                return "growing";
            } else if (/падающая/.test(statItem.isGrowing.toLowerCase())) {
                return "falling";
            } else {
                return "empty";
            }
        };
        //COUNT растущие|| падающие|| пустые✍️
        filtered.forEach((item) => {
            [item.mainPattern, ...item.patterns]
                .filter((stat) => stat)
                .forEach((stat) => {
                    switch (
                        trendStatus(stat) //==='growing'&&growingStatsCount++;
                    ) {
                        case "growing":
                            growingStatsCount++;
                            break;
                        case "falling":
                            notGrowingStatsCount++;
                            break;
                        case "empty":
                            noDataGrowingStatsCount++;
                            break;
                    }
                });
        });

        if (growingFilter || fallingFilter || emptyFilter) {
            filtered = filtered.map((item) => {
                //growing
                if (growingFilter) {
                    return {
                        ...item,
                        mainPattern: trendStatus(item.mainPattern) === "growing" ? item.mainPattern : undefined,

                        patterns: item.patterns.map((stat) => (trendStatus(stat) === "growing" ? stat : undefined)).filter((stat) => stat),
                    };
                }
                //falling
                if (fallingFilter) {
                    return {
                        ...item,
                        mainPattern: trendStatus(item.mainPattern) === "falling" ? item.mainPattern : undefined,

                        patterns: item.patterns.map((stat) => (trendStatus(stat) === "falling" ? stat : undefined)).filter((stat) => stat),
                    };
                }

                //empty
                return {
                    ...item,
                    mainPattern: trendStatus(item.mainPattern) === "empty" ? item.mainPattern : undefined,
                    patterns: item.patterns.map((stat) => (trendStatus(stat) === "empty" ? stat : undefined)).filter((stat) => stat),
                };
            });
        }
        // фильтр заполненых
        //COUNT заполненые/незаполненые✍️

        filtered.forEach((item) => {
            [item.mainPattern, ...item.patterns]
                .filter((stat) => stat)
                .forEach((stat) => {
                    stat?.filled ? fillledStatsCount++ : notFillledStatsCount++;
                });
        });

        if (filledFilter || notFilledFilter) {
            if (filledFilter) {
                filtered = filtered.map((item) => ({
                    ...item,
                    mainPattern: item.mainPattern?.filled ? item.mainPattern : undefined,
                    patterns: item.patterns.map((stat) => (stat?.filled ? stat : undefined)).filter((stat) => stat),
                }));
            } else {
                filtered = filtered.map((item) => ({
                    ...item,
                    mainPattern: !item.mainPattern?.filled ? item.mainPattern : undefined,
                    patterns: item.patterns.map((stat) => (!stat?.filled ? stat : undefined)).filter((stat) => stat),
                }));
            }
        }

        //удаляем айтемы без статистик
        filtered = filtered.filter((item) => item.mainPattern || item.patterns.length);

        // console.log({
        //     fillledStatsCount, // количество заполненных
        //     notFillledStatsCount, // количество не заполненных
        //     growingStatsCount,
        //     notGrowingStatsCount,
        //     noDataGrowingStatsCount,
        //     mainStatCount,
        //     additionalStatCount,
        // });
        //сохраняем результат
        setFilteredOrgItems(() => filtered);
    }, [isShowFilteredOrg, orgTypeFilter, selectedStatType, growingFilter, fallingFilter, filledFilter, notFilledFilter, emptyFilter, officesSelectedList, departmentsSelectedList, sectionsSelectedList, isSelectedAllOrgChildren]);

    useEffect(() => {
        setDepartmentsSelectedList((state) => {
            if (isSelectedAllOrgChildren) return offices.filter((office) => officesSelectedList.includes(office.name)).reduce<string[]>((acc, office) => [...acc, ...office.departments.map((dep) => dep.name)], []);
            else return [];
        });
    }, [officesSelectedList, isSelectedAllOrgChildren]);

    useEffect(() => {
        setSectionSelectedList((state) => {
            if (isSelectedAllOrgChildren) {
                const selectedSections = offices
                    .filter((office) => officesSelectedList.includes(office.name))

                    .reduce<string[]>((acc, office) => {
                        const secArr = office.departments.reduce<string[]>((acc, dep) => {
                            if (departmentsSelectedList.includes(dep.name)) return [...acc, ...dep.sections.map((sec) => sec.name)];
                            return acc;
                        }, acc);
                        if (secArr.length) return [...acc, ...secArr];
                        else return acc;
                    }, []);
                return [...new Set(selectedSections)];
            } else return [];
        });
    }, [officesSelectedList, departmentsSelectedList, isSelectedAllOrgChildren]);

    useEffect(() => {
        setOfficesSelectedList(isSelectedAllOrgChildren ? offices.map((office) => office.name) : []);
    }, [isSelectedAllOrgChildren]);

    //заполняем общие листы
    const officesListOptions = offices.toSorted((off1, off2) => parseInt(off1.name) - parseInt(off2.name)).map((office) => office.name);
    const departmentsListOtions = offices.filter((office) => officesSelectedList.includes(office.name)).reduce<string[]>((acc, office) => [...acc, ...office.departments.toSorted((dep1, dep2) => parseInt(dep1.name) - parseInt(dep2.name)).map((dep) => dep.name)], []);
    const sectionsListOptions = offices
        .filter((office) => officesSelectedList.includes(office.name))
        .reduce<string[]>((acc, office) => {
            const secArr = office.departments.reduce<string[]>((accSec, dep) => {
                if (departmentsSelectedList.includes(dep.name)) return [...accSec, ...dep.sections.toSorted((sec1, sec2) => parseInt(sec1.name) - parseInt(sec2.name)).map((sec) => sec.name)];
                return accSec;
            }, []);

            if (secArr.length) return [...acc, ...secArr];
            else return acc;
        }, []);
    // console.log({
    //     counters: {
    //         fillledStatsCount, // количество заполненных
    //         notFillledStatsCount, // количество не заполненных
    //         growingStatsCount,
    //         notGrowingStatsCount,
    //         noDataGrowingStatsCount,
    //         mainStatCount,
    //         additionalStatCount,
    //     },
    // });
    return {
        filteredOrgItems,
        counters: {
            fillledStatsCount, // количество заполненных
            notFillledStatsCount, // количество не заполненных
            growingStatsCount,
            notGrowingStatsCount,
            noDataGrowingStatsCount,
            mainStatCount,
            additionalStatCount,
        },
        options: {
            //листы всех
            lists: {
                officesListOptions,
                departmentsListOtions,
                sectionsListOptions,
            },
            //список выбранных
            selectedLists: {
                officesSelectedList,
                departmentsSelectedList,
                sectionsSelectedList,
            },
            //функции добавления/удаления
            selectsToggle: {
                officeToggle: (name: string) => {
                    setOfficesSelectedList((state) => (state.includes(name) ? state.filter((offName) => offName !== name) : [...state, name]));
                },
                departmentToggle: (name: string) => {
                    setDepartmentsSelectedList((state) => (state.includes(name) ? state.filter((depName) => depName !== name) : [...state, name]));
                },
                sectionToggle: (name: string) => {
                    setSectionSelectedList((state) => (state.includes(name) ? state.filter((secName) => secName !== name) : [...state, name]));
                },
            },
        },
        filters: {
            orgTypeFilter,
            mainStatFilter: selectedStatType !== null && selectedStatType,
            additionalStatsFilter: selectedStatType !== null && !selectedStatType,
            growingFilter,
            fallingFilter,
            filledFilter,
            notFilledFilter,
            emptyFilter,
        },
        filtersToggle: {
            mainStatFilterToggle: () => {
                setSelectedStatType((state) => (state === null || state === false ? true : null));
            },
            additionalStatsFilter: () => {
                setSelectedStatType((state) => (state === null || state === true ? false : null));
            },
            growingFilterToggle: () => {
                setGrowingFilter((state) => !state);
                setFallingFilter(false);
                setEmptyFilter(false);
            },
            fallingFilterToggle: () => {
                setFallingFilter((state) => !state);
                setGrowingFilter(false);
                setEmptyFilter(false);
            },
            emptyFilterToggle: () => {
                setEmptyFilter((state) => !state);
                setGrowingFilter(false);
                setFallingFilter(false);
            },
            filledFilterToggle: () => {
                setFilledFilter((state) => !state), setNotFilledFilter(false);
            },
            notFilledFilterToggle: () => {
                setNotFilledFilter((state) => !state), setFilledFilter(false);
            },
            orgTypeFiltersToggle: (orgType: (typeof orgTypeFilter)[0]) => {
                setOrgTypeFilter((state) => (state.includes(orgType) ? state.filter((state) => state !== orgType) : [...state, orgType]));
            },
        },
    };
}
