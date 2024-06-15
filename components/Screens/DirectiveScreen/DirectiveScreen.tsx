import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./direct.module.scss";
import { nanoid } from "@reduxjs/toolkit";
import { IDirectHeader, IDirectInfoDoc, IDirectMembers, IDirectOffice, IDirectTable, ILogicCell, IOrgItem, ITableStat, OfficeI, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI, UserFullI, UserI } from "@/types/types";
import { daySec } from "@/utils/vars";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import DirectTable from "./DirectTable";
import Modal from "@/components/elements/Modal/Modal";
import useTableStatistics from "@/hooks/useTableStatistics";

import { ViewColumnsIcon, XCircleIcon, BuildingOffice2Icon, Cog6ToothIcon, ArrowLeftCircleIcon, ArrowRightCircleIcon, BarsArrowUpIcon } from "@heroicons/react/24/outline";
import { clearStatName, hexToRgba, rgbToHex, timeNumberToString, timeStrToNumber } from "@/utils/funcs";
import useUsers from "@/hooks/useUsers";
import Mission from "@/components/elements/Mission/Mission";
import Charts from "./Charts";

const defaultHeaders: IDirectHeader[] = [
    {
        id: "baseHeaderID_1",
        title: "Название блока",
        color: "#6FD273",
    },
    {
        id: "baseHeaderID_2",
        title: "План/факт за прошедший период",
        color: "#6FD273",
    },
    {
        id: "baseHeaderID_3",
        title: "Состояние",
        color: "#6FD273",
    },
    {
        id: "baseHeaderID_4",
        title: "Квота на будущий период",
        color: "#6FD273",
    },
    {
        id: "baseHeaderID_5",
        title: "Планируемое состояние на будущий период",
        color: "#6FD273",
    },
];

const memberPresenceCol = ["#B2B2B2", "#FFF545"];

export default function DirectiveScreen() {
    //LS LOAD
    const loadedHeaders = JSON.parse(localStorage.getItem("dirHeaders") || "[]") as IDirectHeader[];
    const loadedStatLogicsMap = new Map<string, ILogicCell[]>(Object.entries(JSON.parse(localStorage.getItem("statLogics") || "{}")));

    //HOOKS
    const { getLatestTable, addingFilledField, statNameById } = useTableStatistics();
    const { userByID } = useUsers();

    //SELECTORS
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    const { offices } = useSelector((state: StateReduxI) => state.org);
    const isAdmin = useSelector((state: any) => state.main.user?.role === "admin");
    const user: UserI = useSelector((state: any) => state.main.user);
    const { users }: { users: UserFullI[] } = useSelector((state: StateReduxI) => state.users);
    const { generalDirector } = useSelector((state: StateReduxI) => state.org);
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
    const [headers, setHeaders] = useState<IDirectHeader[]>(loadedHeaders.length ? loadedHeaders : defaultHeaders);
    const [isShowEditHeaders, setIsShowEditHeaders] = useState(false);
    const [selectedHeader, setSelectedHeader] = useState(0);
    const [tabels, setTables] = useState<IDirectTable[]>([]);
    const [members, setMembers] = useState<IDirectMembers[]>([]);
    const [charts, setCharts] = useState<number[]>([]);
    const [info, setInfo] = useState<IDirectInfoDoc>({
        protocol: 1,
        date: new Date().getTime(),
        chairmanId: generalDirector,
        lastProtocol: 0,
        strategy: 0,
        directFP: 0,
        docs: 0,
    });

    const [scrollPos, setScrollPos] = useState<number | null>(null);
    const saveScroll = () => {
        setScrollPos(window.scrollY);
    };
    const goToSavedScroll = () => {
        window.scrollTo(0, scrollPos as number);
        setScrollPos(null);
    };
    //cash cells
    const [cacheStatsLogics, setCacheStstsLogic] = useState<Map<string, ILogicCell[]>>(loadedStatLogicsMap);

    //FUNCS
    //headers
    const onDelHeader = (id: string) => {
        setHeaders((state) => state.filter((header) => header.id !== id));
        //удаляем логику с ячеек для этой колонки по ID колонки
        setTables((state) => state.map((table) => ({ ...table, stats: table.stats.map((stat) => ({ ...stat, logicStrArr: stat.logicStrArr.filter((logic) => logic.headerId !== id) })) })));
        removeHeaderFromCache(id); //удаляем с кэша
    };

    const onAddHeader = useCallback(() => {
        const newHeaderId = nanoid();
        setHeaders((state) => [
            ...state,
            {
                id: newHeaderId,
                title: "Новая колонка",
                color: "#6FD273",
            },
        ]);
        setTables((state) => state.map((table) => ({ ...table, stats: table.stats.map((stat) => ({ ...stat, logicStrArr: [...stat.logicStrArr, { headerId: newHeaderId, logicStr: "" }] })) })));
    }, [setHeaders, setTables]);

    const onHeaderMoveLeft = (headerIdx: number) => {
        if (headerIdx > 1) {
            setHeaders((state) => {
                const temp = [...state];
                temp.splice(headerIdx - 1, 2, temp[headerIdx], temp[headerIdx - 1]);

                return temp;
            });
        }
    };
    const onHeaderMoveRight = (headerIdx: number) => {
        if (headerIdx < headers.length - 1) {
            setHeaders((state) => {
                const temp = [...state];
                temp.splice(headerIdx, 2, temp[headerIdx + 1], temp[headerIdx]);

                return temp;
            });
        }
    };

    const headersToDefault = () => {
        if (confirm("Сбросить все колонки до начального списка?")) {
            setHeaders(defaultHeaders);

            for (let [key, value] of loadedStatLogicsMap) {
                loadedStatLogicsMap.set(
                    key,
                    value.filter((log) => log.headerId.includes("baseHeaderID"))
                );
            }

            //создаем объект с мапа
            const obj = Object.fromEntries(loadedStatLogicsMap);
            //сохраняем объект в LS
            localStorage.setItem("statLogics", JSON.stringify(obj));
            setCacheStstsLogic(loadedStatLogicsMap);
        }
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
        fullOrgWithdata.forEach((office, officeIDx) => {
            onAddTable(office);
            setMembers((state) => {
                return [
                    ...state,
                    {
                        officeNumber: officeIDx + 1,
                        presence: 0,
                        userId: office.leadership,
                    },
                ];
            });
        });
    };

    //LS SAVE
    const cacheLogic = () => {
        // Пробрасываем эту функцию и обновляем при изменении
        //                         Надо очищать колонки которые удалили кроме дефолтных

        //⭐Для сохранения Map в строку, его надо перевести в объект Object.fromEntries
        //⭐Для создания Map с объекта его надо сделать массивом Object.entries

        tabels.forEach((table) => {
            table.stats.forEach((stat) => {
                const logicsArr = stat.logicStrArr.filter((logic) => logic.logicStr !== "");
                const statName = clearStatName(statNameById(stat.id));
                if (logicsArr.length)
                    if (!loadedStatLogicsMap.has(statName)) {
                        //создаем новый массив
                        loadedStatLogicsMap.set(statName, logicsArr);
                    } else {
                        // старые значения
                        let cached = loadedStatLogicsMap.get(statName) as ILogicCell[];

                        //обновляем старые
                        cached = cached.map((cell) => {
                            //ищем индекс нового
                            const newLogicIdx = logicsArr.findIndex((newCell) => newCell.headerId === cell.headerId);
                            if (newLogicIdx >= 0) {
                                return logicsArr[newLogicIdx];
                            } else {
                                return cell;
                            }
                        });
                        //ищем новые ячейки
                        const newCells = logicsArr.filter((cell) => !cached.some((cach) => cach.headerId === cell.headerId));
                        //сохраняем обновленные старые и добавляем новые
                        loadedStatLogicsMap.set(statName, [...cached, ...newCells]);
                    }
            });
        });

        if (loadedStatLogicsMap.size) {
            //создаем объект с мапа
            const obj = Object.fromEntries(loadedStatLogicsMap);
            //сохраняем объект в LS
            localStorage.setItem("statLogics", JSON.stringify(obj));

            // console.log("CACHE", Object.entries(obj));
            setCacheStstsLogic(loadedStatLogicsMap);
        }

        //new Map(Object.entries(obj))
    };

    const removeHeaderFromCache = (headerId: string) => {
        if (headerId.includes("baseHeaderID")) return; //не удаляем базавые

        for (let [key, value] of loadedStatLogicsMap) {
            loadedStatLogicsMap.set(
                key,
                value.filter((log) => log.headerId !== headerId)
            );
        }

        //console.log(loadedStatLogicsMap);
        setCacheStstsLogic(loadedStatLogicsMap);
        //создаем объект с мапа
        const obj = Object.fromEntries(loadedStatLogicsMap);
        //сохраняем объект в LS
        localStorage.setItem("statLogics", JSON.stringify(obj));
    };

    //TABLE HTML
    const mainTable = useMemo(() => {
        //console.log(tabels);
        return [
            <thead key={Math.random()}>
                <tr>
                    <th colSpan={headers.length}>Главные статистики отделения и состояния по ним</th>
                </tr>
            </thead>,
            tabels.map((table) => {
                return <DirectTable key={table.id} headers={headers} table={table} setTables={setTables} fullOrgWithdata={fullOrgWithdata} setCharts={setCharts} charts={charts} saveScroll={saveScroll} cacheStatsLogics={cacheStatsLogics} cacheLogic={cacheLogic} />;
            }),
        ];
    }, [tabels, headers, charts]);

    const headersEditBlock = useMemo(() => {
        return (
            <div className={styles.headersEditBlock}>
                <div className={styles.headersEditTitle}>Настройки колонок</div>
                <div className={styles.headersEditClose}>
                    <XCircleIcon width={30} onClick={() => setIsShowEditHeaders(false)} stroke="white" />
                </div>
                {headers.map((header, headerIdx) => {
                    return (
                        <div key={header.id + headerIdx} className={styles.headersItem} onClick={() => headerIdx && setSelectedHeader(headerIdx)} style={{ background: header.color }}>
                            <div className={styles.itemText}> {header.title}</div>
                            {!!headerIdx && (
                                <div
                                    className={styles.itemDel}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        confirm(`Удалить колонку "${header.title}" со всеми логиками ячеек таблиц ?`) && onDelHeader(header.id);
                                    }}
                                >
                                    <XCircleIcon width={20} />
                                </div>
                            )}
                            {!!headerIdx && (
                                <div className={styles.arrowsBlock}>
                                    <ArrowLeftCircleIcon
                                        width={20}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onHeaderMoveLeft(headerIdx);
                                        }}
                                    />
                                    <ArrowRightCircleIcon
                                        width={20}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onHeaderMoveRight(headerIdx);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className={styles.addBtn} onClick={onAddHeader}>
                    <span>Добавить колонку</span>
                    <ViewColumnsIcon width={20} />
                </div>

                <div className={styles.toDefault} onClick={() => headersToDefault()}>
                    сбросить колонки до начальных
                </div>
            </div>
        );
    }, [headers, tabels]);

    const headerModal = useMemo(() => {
        if (!!selectedHeader && headers[selectedHeader])
            return (
                <Modal fullWidth closeModalFunc={() => setSelectedHeader(0)} scrollOnTop={false}>
                    <div className={styles.headerModalBlock}>
                        <div className={styles.field}>
                            <span>Название колонки</span>
                            <input
                                className={styles.name}
                                value={headers[selectedHeader].title}
                                onChange={(event) =>
                                    setHeaders((state) => {
                                        const temp = [...state];
                                        temp[selectedHeader].title = event.target.value;
                                        return temp;
                                    })
                                }
                            />
                        </div>
                        <div className={styles.field}>
                            <span>Цвет колонки</span>
                            <input
                                className={styles.color}
                                type="color"
                                value={rgbToHex(headers[selectedHeader].color)}
                                onChange={(event) => {
                                    setHeaders((state) => {
                                        const temp = [...state];
                                        temp[selectedHeader].color = hexToRgba(event.target.value, 1);
                                        return temp;
                                    });
                                }}
                            />
                            <div
                                className={styles.dropBtn}
                                onClick={(event) => {
                                    setHeaders((state) => {
                                        const temp = [...state];
                                        temp[selectedHeader].color = hexToRgba("#6FD273", 1);
                                        return temp;
                                    });
                                }}
                            >
                                Сбросить цвет до стандартного
                            </div>
                        </div>
                        <div className={styles.okBtn} onClick={() => setSelectedHeader(0)}>
                            Ok
                        </div>
                    </div>
                </Modal>
            );
    }, [headers, selectedHeader, tabels]);

    const topInfoBlock = useMemo(() => {
        if (!!tabels.length) {
            return (
                <div className={styles.topInfoBlock}>
                    <div className={styles.infoBlock}>
                        <div className={styles.field}>
                            <div className={styles.title}>№ протокола</div>
                            <div className={styles.title}>Дата проведения </div>
                            <div className={styles.title}>Председатель РС </div>
                            <div className={styles.title} style={{ background: memberPresenceCol[info.lastProtocol] }}>
                                Протокол прошлого РС
                            </div>
                            <div className={styles.title} style={{ background: memberPresenceCol[info.strategy] }}>
                                Стратегия филиала
                            </div>
                            <div className={styles.title} style={{ background: memberPresenceCol[info.directFP] }}>
                                Директива ФП
                            </div>
                            <div className={styles.title} style={{ background: memberPresenceCol[info.docs] }}>
                                Перечень программ и проектов{" "}
                            </div>
                        </div>
                        <div className={styles.values}>
                            <div className={styles.value}>
                                <input type="number" value={info.protocol} onChange={(event) => setInfo((state) => ({ ...state, protocol: Number(event.target.value) }))} />
                            </div>
                            <div className={styles.value}>
                                {/* {info.date} */}

                                <input type="date" value={timeNumberToString(info.date)} onChange={(event) => setInfo((state) => ({ ...state, date: timeStrToNumber(event.target.value) }))} />
                            </div>
                            <div className={styles.value}>{userByID(info.chairmanId)?.name}</div>
                            <div className={styles.value}>
                                <select value={info.lastProtocol} onChange={(event) => setInfo((state) => ({ ...state, lastProtocol: Number(event.target.value) }))}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                            <div className={styles.value}>
                                <select value={info.strategy} onChange={(event) => setInfo((state) => ({ ...state, strategy: Number(event.target.value) }))}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                            <div className={styles.value}>
                                <select value={info.directFP} onChange={(event) => setInfo((state) => ({ ...state, directFP: Number(event.target.value) }))}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                            <div className={styles.value}>
                                <select value={info.docs} onChange={(event) => setInfo((state) => ({ ...state, docs: Number(event.target.value) }))}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={styles.membersBlock}>
                        <div className={styles.membersTitle}>Члены РС</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Отделение</th>
                                    <th>Руководитель</th>
                                    <th>Присутствие</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member, memberIdx) => (
                                    <tr className={styles.memberItem} key={member.userId + "_userList"}>
                                        <td>{member.officeNumber} отделение</td>
                                        <td style={{ background: memberPresenceCol[member.presence] }}>{userByID(member.userId)?.name}</td>
                                        <td>
                                            <select
                                                value={Number(member.presence)}
                                                onChange={(event) =>
                                                    setMembers((state) => {
                                                        const temp = [...state];
                                                        temp[memberIdx].presence = Number(event.target.value);
                                                        return temp;
                                                    })
                                                }
                                            >
                                                <option value={0}>отсутствует</option>
                                                <option value={1}>присутствует</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    }, [members, info]);

    //SCROLL LOOK
    useEffect(() => {
        if (scrollPos !== null) {
            const scrollLook = () => {
                scrollPos > window.scrollY && setScrollPos(null);
            };
            document.addEventListener("scroll", scrollLook);

            return () => {
                document.removeEventListener("scroll", scrollLook);
            };
        }
    }, [scrollPos]);

    //LS
    //SAVE HEADERS
    useEffect(() => {
        if (headers.length) {
            console.log(headers);
            localStorage.setItem("dirHeaders", JSON.stringify(headers));
        }
    }, [headers]);

    return (
        <div className={styles.directWrap}>
            {process.env.NODE_ENV === "development" && (
                <div>
                    <button
                        onClick={() => {
                            console.log({ headers, tabels, charts });
                        }}
                    >
                        check
                    </button>
                    <button onClick={cacheLogic}>save cache</button>
                    <button onClick={() => console.log(cacheStatsLogics)}>show</button>
                    <button onClick={() => removeHeaderFromCache("o5yIJ6I6P3uJ8ggpZbNx5")}>remove</button>
                </div>
            )}
            {topInfoBlock}
            <Mission />

            {headerModal}

            {!!tabels.length && !isShowEditHeaders && (
                <div className={styles.headersSettingsBtn} onClick={() => setIsShowEditHeaders((state) => !state)}>
                    <div>Настройки шапки</div>
                    <Cog6ToothIcon width={20} />
                </div>
            )}
            {isShowEditHeaders && headersEditBlock}

            {!!!tabels.length && (
                <div className={styles.addOrgOfficesBtn} onClick={addAllOffices}>
                    <span>Добавить таблицы орг-схемы</span>
                    <BuildingOffice2Icon width={25} />
                </div>
            )}

            <table className={styles.mainTable}>{!!tabels.length && mainTable}</table>
            {scrollPos !== null && (
                <div className={styles.scrollBtn} onClick={goToSavedScroll}>
                    <BarsArrowUpIcon width={30} />
                    <div>Подняться к таблице</div>
                </div>
            )}

            <Charts charts={charts} />
        </div>
    );
}
