import { ElementRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./direct.module.scss";
import { nanoid } from "@reduxjs/toolkit";
import { IChartPropListItem, IDirectHeader, IDirectInfoDoc, IDirectMembers, IDirectOffice, IDirectTable, ILogicCell, IOrgItem, IProtocolListItem, ISelectedStatsListItem, ITableStat, OfficeI, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI, UserFullI, UserI } from "@/types/types";
import { daySec } from "@/utils/vars";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import DirectTable from "./DirectTable";
import Modal from "@/components/elements/Modal/Modal";
import useTableStatistics from "@/hooks/useTableStatistics";

import { ViewColumnsIcon, XCircleIcon, BuildingOffice2Icon, Cog6ToothIcon, ArrowLeftCircleIcon, ArrowRightCircleIcon, BarsArrowUpIcon, UserPlusIcon, UserMinusIcon, ArrowDownCircleIcon, CloudArrowDownIcon, TrashIcon, CloudArrowUpIcon, ArrowUpTrayIcon, DocumentArrowDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { clearStatName, hexToRgba, rgbToHex, timeNumberToString, timeStrToNumber } from "@/utils/funcs";
import useUsers from "@/hooks/useUsers";
import Mission from "@/components/elements/Mission/Mission";
import Charts from "./Charts";
import { toast } from "react-toastify";
import useDirect from "@/hooks/useDirect";
import * as ExelJs from "exceljs";

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
    // const loadedHeaders = JSON.parse(localStorage.getItem("dirHeaders") || "[]") as IDirectHeader[];
    // const loadedStatLogicsMap = new Map<string, ILogicCell[]>(Object.entries(JSON.parse(localStorage.getItem("statLogics") || "{}")));
    const loadedStatLogicsMap = new Map<string, ILogicCell[]>();

    //REFS
    const usersListRef = useRef<HTMLSelectElement | null>(null);

    //HOOKS
    const { getLatestTable, addingFilledField, statNameById } = useTableStatistics();
    const { userByID } = useUsers();
    const { getDirectSettings, saveHeaders, saveLogic, saveDirect, getProtocolList, getProtocolById, deleteProtocolById, getSelectedLists, saveSelectedList, deleteListById } = useDirect();

    //SELECTORS
    const { mainStyle } = useSelector((state: StateReduxI) => state.app);
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
    const [isSavedProtocol, setIsSavedProtocol] = useState(false);
    const [mainStatus, setMainStatus] = useState<null | "new" | "archive">(isAdmin ? null : "archive");
    const [headers, setHeaders] = useState<IDirectHeader[]>(defaultHeaders);
    const [isShowEditHeaders, setIsShowEditHeaders] = useState(false);
    const [selectedHeader, setSelectedHeader] = useState(0);
    const [tabels, setTables] = useState<IDirectTable[]>([]);
    const [members, setMembers] = useState<IDirectMembers[]>([]);
    const [charts, setCharts] = useState<IChartPropListItem[]>([]);
    const INFO_INIT = {
        protocol: 0,
        date: new Date().getTime(),
        chairmanId: generalDirector,
        lastProtocol: 0,
        strategy: 0,
        directFP: 0,
        docs: 0,
    };
    const [info, setInfo] = useState<IDirectInfoDoc>(INFO_INIT);

    const [protocolList, setProtocolList] = useState<IProtocolListItem[]>([]);
    const [protocolSelectedId, setProtocolSelectedId] = useState(0);

    const [scrollPos, setScrollPos] = useState<number | null>(null);
    const saveScroll = () => {
        setScrollPos(window.scrollY);
    };
    const goToSavedScroll = () => {
        window.scrollTo(0, scrollPos as number);
        setScrollPos(null);
    };

    const [selectedStats, setSelectedStats] = useState<string[]>([
        // "Количество главных растущих статистик 2 года + текущий, РО1 📅", "Количество главных статистик по предприятию/количество главных растущих, РО1 📅", "Просроченная дебиторская задолженность, РО2 📅", "Отклонение факта реализации от месячного плана, РО2 📅"
    ]);

    const [blankRows, setBlankRows] = useState<{ officeID: number; blankRowsValues: string[][] }[]>([]);

    const [selectedStatsList, setSelectedStatsList] = useState<ISelectedStatsListItem[]>([]);
    //cash cells
    const [cacheStatsLogics, setCacheStstsLogic] = useState<Map<string, ILogicCell[]>>(loadedStatLogicsMap);

    //FUNCS
    const clearStates = () => {
        setIsSavedProtocol(false);
        setHeaders([]);
        setIsShowEditHeaders(false);
        setTables([]);
        setMembers([]);
        setInfo(INFO_INIT);
        setCharts([]);
        setProtocolSelectedId(0);
    };
    //members
    const onAddMember = () => {
        if (usersListRef.current === null) return;

        const selectedUserID = Number(usersListRef.current.value);

        if (selectedUserID) {
            if (members.some((member) => member.userId === selectedUserID)) {
                usersListRef.current.value = "0";
                toast.error(`${userByID(selectedUserID)?.name} уже в списке !`);
                return;
            }

            setMembers((state) => [
                ...state,
                {
                    officeNumber: 0,
                    presence: 0,
                    userId: selectedUserID,
                },
            ]);
            usersListRef.current.value = "0";
        }
    };

    const onDelMember = () => {
        if (usersListRef.current === null) return;
        const selectedUserID = Number(usersListRef.current.value);
        if (selectedUserID) {
            if (!members.some((member) => member.userId === selectedUserID)) {
                usersListRef.current.value = "0";
                toast.error(`${userByID(selectedUserID)?.name} нет в списках !`);
                return;
            }

            setMembers((state) => state.filter((member) => member.userId !== selectedUserID));
        }
    };
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

            //создаем объект с мапа
            // const obj = Object.fromEntries(loadedStatLogicsMap);
            //сохраняем объект в LS
            //localStorage.setItem("statLogics", JSON.stringify(obj));
            setCacheStstsLogic((state) => {
                const newCache = new Map(state);
                for (let [key, value] of newCache) {
                    newCache.set(
                        key,
                        value.filter((log) => log.headerId.includes("baseHeaderID"))
                    );
                }

                return newCache;
            });
        }
    };

    //tabels
    const onAddTable = (item: IDirectOffice) => {
        setTables((state) => [
            ...state,
            {
                id: nanoid(),
                officeID: item.id,
                description: "",
                blankRows: [],
                stats: [],
            },
        ]);
    };

    const addAllOffices = () => {
        fullOrgWithdata.forEach((office, officeIDx) => {
            setInfo({ ...INFO_INIT, protocol: protocolList.length + 1 });
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

    //SAVE SETTINGS ON SERVER
    const saveSettingsOnServer = useCallback(() => {
        console.log("SAVE SETTINGS ✅✅✅", headers);
        saveHeaders({ headers: JSON.stringify(headers) });
        saveLogic({ cacheStatsLogics: JSON.stringify(Object.fromEntries(cacheStatsLogics)) });
    }, [headers, cacheStatsLogics]);

    //SAVE PROTOCOL ON SERVER
    const saveDirectOnServer = useCallback(() => {
        saveDirect({
            columns: JSON.stringify(headers),
            cacheStatsLogics: JSON.stringify(Object.fromEntries(cacheStatsLogics)),
            info: JSON.stringify(info),
            members: JSON.stringify(members),
            tabels: JSON.stringify(tabels),
        }).then(() => setIsSavedProtocol(true));
    }, [headers, cacheStatsLogics, info, members, tabels]);

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
            // localStorage.setItem("statLogics", JSON.stringify(obj));

            // console.log("CACHE", Object.entries(obj));
            setCacheStstsLogic(loadedStatLogicsMap);
        }

        //new Map(Object.entries(obj))
    };

    const removeHeaderFromCache = (headerId: string) => {
        if (headerId.includes("baseHeaderID")) return; //не удаляем базавые

        // for (let [key, value] of loadedStatLogicsMap) {
        //     loadedStatLogicsMap.set(
        //         key,
        //         value.filter((log) => log.headerId !== headerId)
        //     );
        // }

        //setCacheStstsLogic(loadedStatLogicsMap);

        setCacheStstsLogic((state) => {
            const newCache = new Map(state);
            for (let [key, value] of newCache) {
                newCache.set(
                    key,
                    value.filter((log) => log.headerId !== headerId)
                );
            }
            return newCache;
        });

        //создаем объект с мапа
        // const obj = Object.fromEntries(loadedStatLogicsMap);
        //сохраняем объект в LS
        //localStorage.setItem("statLogics", JSON.stringify(obj));
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
                return <DirectTable key={table.id} headers={headers} table={table} setTables={setTables} fullOrgWithdata={fullOrgWithdata} setCharts={setCharts} charts={charts} saveScroll={saveScroll} cacheStatsLogics={cacheStatsLogics} cacheLogic={cacheLogic} loaded={mainStatus === "archive"} selectedStats={selectedStats} setSelectedStats={setSelectedStats} blankRows={blankRows} />;
            }),
        ];
    }, [tabels, headers, charts, selectedStats, blankRows]);

    // HEADERS EDIT BLOCK -- HTML
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
                <div className={`${styles.topInfoBlock} ${mainStyle === "row" ? styles.topInfoBlockRow : ""}`}>
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
                                <input type="number" value={info.protocol} onChange={(event) => setInfo((state) => ({ ...state, protocol: Number(event.target.value) }))} disabled />
                            </div>
                            <div className={styles.value}>
                                {/* {info.date} */}

                                <input type="date" value={timeNumberToString(info.date)} onChange={(event) => setInfo((state) => ({ ...state, date: timeStrToNumber(event.target.value) }))} disabled={mainStatus === "archive"} />
                            </div>
                            <div className={styles.value}>{userByID(info.chairmanId)?.name}</div>
                            <div className={styles.value}>
                                <select value={info.lastProtocol} onChange={(event) => setInfo((state) => ({ ...state, lastProtocol: Number(event.target.value) }))} disabled={mainStatus === "archive"}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                            <div className={styles.value}>
                                <select value={info.strategy} onChange={(event) => setInfo((state) => ({ ...state, strategy: Number(event.target.value) }))} disabled={mainStatus === "archive"}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                            <div className={styles.value}>
                                <select value={info.directFP} onChange={(event) => setInfo((state) => ({ ...state, directFP: Number(event.target.value) }))} disabled={mainStatus === "archive"}>
                                    <option value={0}>нет</option>
                                    <option value={1}>есть</option>
                                </select>
                            </div>
                            <div className={styles.value}>
                                <select value={info.docs} onChange={(event) => setInfo((state) => ({ ...state, docs: Number(event.target.value) }))} disabled={mainStatus === "archive"}>
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
                                        {member.officeNumber ? <td>{member.officeNumber} отделение</td> : <td style={{ textAlign: "center" }}>участник</td>}
                                        <td style={{ background: memberPresenceCol[member.presence] }}>{userByID(member.userId)?.name}</td>
                                        <td>
                                            <select
                                                disabled={mainStatus === "archive"}
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
                                {mainStatus === "new" && (
                                    <tr>
                                        <td style={{ textAlign: "center", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                                            <UserPlusIcon width={24} onClick={onAddMember} />
                                            <UserMinusIcon width={24} onClick={onDelMember} />
                                        </td>
                                        <td colSpan={2} style={{ textAlign: "center" }}>
                                            <select ref={usersListRef}>
                                                <option value={0} style={{ textAlign: "center" }}>
                                                    {" "}
                                                    выбрать участника
                                                </option>
                                                {users.map((user) => (
                                                    <option key={user.id + "_usersList"} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    }, [members, info, mainStatus]);

    //PROTOCOL LIST SELECT-HTML
    const protocolListSelectHtml = useMemo(() => {
        return (
            <select className={styles.loadProtocolSelect} value={protocolSelectedId} onChange={(event) => setProtocolSelectedId(Number(event.target.value))}>
                <option value={0}> выбор загружаемого протокола</option>
                {protocolList
                    .filter((item) => (isAdmin ? true : item.members.includes(user.userId)))
                    .map((protocolItem) => (
                        <option key={protocolItem.createdAt + "_protocolListItem"} value={protocolItem.id}>
                            Протокол № :<b> {protocolItem.protocolNumber}</b> 📆 Дата проведения : {new Date(protocolItem.createdAt).toLocaleDateString()}
                        </option>
                    ))}
            </select>
        );
    }, [protocolList, protocolSelectedId]);

    //MAIN STATUS HTML
    const mainStatusShooceHtml = useMemo(() => {
        return (
            <div className={styles.mainShooceBlock}>
                {isAdmin && (
                    <div className={`${styles.shooceItem} ${mainStatus === "new" ? styles.selected : ""} noselect`} onClick={() => setMainStatus((state) => (state === "new" ? null : "new"))}>
                        <div>Новый протокол</div>
                        <BuildingOffice2Icon width={25} />
                    </div>
                )}
                <div className={`${styles.shooceItem} ${mainStatus === "archive" ? styles.selected : ""} noselect`} onClick={() => setMainStatus((state) => (state === "archive" ? null : "archive"))}>
                    <div>Архив протоколов</div>
                    <CloudArrowDownIcon width={25} />
                </div>
            </div>
        );
    }, [mainStatus]);

    //SELECTED STATS LIST
    const saveListInputRef = useRef<ElementRef<"input">>(null);
    const [selectedListIdx, setSelectedListIdx] = useState(0);
    const onDeleteList = useCallback(() => {
        if (!confirm("Удалить текущий выбранный лист ?")) return;
        const delListIdx = selectedStatsList[selectedListIdx - 1].id as number;
        console.log(delListIdx, selectedStatsList[selectedListIdx - 1]);
        if (selectedListIdx > 0)
            deleteListById({ id: delListIdx, setSelectedStatsList }).then(() => {
                setSelectedListIdx(0);
                setTables((state) => state.map((table) => ({ ...table, stats: [] })));
            });
        else toast.error("Лист не выбран");
    }, [selectedListIdx, selectedStatsList]);

    // TODO  SELECTED LIST

    const onSaveList = () => {
        const blankRows = tabels.map((table) => ({ officeID: table.officeID, blankRowsValues: table.blankRows.map((blankRow) => blankRow.values) }));
        console.log(blankRows);
        saveSelectedList({ name: saveListInputRef.current?.value || `лист выбора № ${selectedStatsList.length + 1} : ` + new Date().toLocaleDateString(), selectedStats, setSelectedStatsList, blankRows }).then(() => (saveListInputRef.current!.value = ""));
    };

    const selectedStatsListHtml = useMemo(() => {
        if (!!selectedStatsList.length || tabels.some((table) => !!table.stats.length))
            return (
                <div className={styles.loadListBlock}>
                    {process.env.NODE_ENV !== "production" && (
                        <>
                            <button onClick={() => console.log(selectedStatsList)}>check list</button>
                            <button onClick={() => console.log(blankRows)}>check blank rows</button>
                        </>
                    )}
                    <div className={styles.title}>
                        <div>Настройки списков статистик</div>
                        <Cog6ToothIcon width={30} color="white" />
                    </div>
                    {!!selectedStatsList.length && (
                        <div className={styles.selectBlock}>
                            <CloudArrowDownIcon width={35} color="white" />
                            <select
                                value={selectedListIdx}
                                onChange={(event) => {
                                    const selectIdx = Number(event.target.value);
                                    setSelectedListIdx(selectIdx);
                                    if (selectIdx > 0) {
                                        setSelectedStats(selectedStatsList[selectIdx - 1].selectedStats);
                                        setBlankRows(selectedStatsList[selectIdx - 1].blankRows);
                                    } else {
                                        setSelectedStats([]);
                                        setBlankRows([]);
                                        setTables((state) => state.map((table) => ({ ...table, stats: [], blankRows: [] })));
                                    }
                                }}
                            >
                                <option value={0}> выбрать сохранённый список статистик ?</option>
                                {selectedStatsList.map((selStats, idx) => (
                                    <option value={idx + 1}>{selStats.name}</option>
                                ))}
                            </select>
                            {!!selectedListIdx && (
                                <div onClick={onDeleteList} className={styles.delListBtn}>
                                    <span>Удалить лист</span>
                                    <TrashIcon width={25} color="white" />
                                </div>
                            )}
                        </div>
                    )}

                    {tabels.some((table) => !!table.stats.length) && (
                        <div className={styles.controlBlock}>
                            <div
                                className={styles.dropStatsBtn}
                                onClick={() => {
                                    setTables((state) => state.map((table) => ({ ...table, stats: [] })));
                                    setSelectedListIdx(0);
                                }}
                            >
                                <span> Сбросить все добавленные статистики</span>
                                <XMarkIcon width={25} />
                            </div>
                            <div className={styles.saveBlock}>
                                <input type="text" ref={saveListInputRef} placeholder="название листа ?" />
                                <div className={styles.saveBtn} onClick={onSaveList}>
                                    <span> Cохранить как новый лист статистик</span>
                                    <CloudArrowUpIcon width={25} color="white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
    }, [selectedStatsList, setSelectedStatsList, selectedStats, selectedListIdx, tabels, blankRows]);

    //EFFECTS

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

    //ЗАГРУЖАЕМ ПО ВЫБОРУ ПРОТОКОЛ
    useEffect(() => {
        if (protocolSelectedId) {
            getProtocolById({ id: protocolSelectedId, setCacheStstsLogic, setHeaders, setInfo, setMembers, setTables });
        }
    }, [protocolSelectedId]);

    //сохраняем на сервере

    useEffect(() => {
        if (mainStatus !== null) {
            {
                clearStates();
                // process.nextTick(() => {
                if (mainStatus === "new") {
                    Promise.all([getDirectSettings({ setHeaders, setCacheStstsLogic, defaultHeaders }), getProtocolList({ setProtocolList })]).then(() => {
                        addAllOffices();
                    });
                    // getDirectSettings({ setHeaders, setCacheStstsLogic, defaultHeaders }).then(() => addAllOffices()); // начальная загрузка не реализована на уровне хука
                    // getProtocolList({ setProtocolList });
                }

                if (mainStatus === "archive") {
                    getProtocolList({ setProtocolList });
                }
                // });
            }
        } else {
            clearStates();
            getProtocolList({ setProtocolList });
        }
    }, [mainStatus]);

    //ON MOUNT⭐

    useEffect(() => {
        getSelectedLists({ setSelectedStatsList });
    }, []);

    //EXCEL SAVE
    interface ITableParcedRow {
        type: string;
        cells: string[];
    }
    const onSaveExcel = () => {
        const fileName = `Протокол № ${info.protocol} 📆${new Date(info.date).toLocaleDateString()}`;
        const workbook = new ExelJs.Workbook();
        const sheet = workbook.addWorksheet(fileName);

        const table = document.querySelector("#mainTable");
        if (!table) return;

        // TODO info && members - создать ряды шапкм
        // Создание первой таблицы

        // ! Парсинг таблицы - вторая таблица
        table.querySelectorAll("th");
        // console.log(table.children);
        const parsedArr: ITableParcedRow[] = [];
        for (let child of table.children) {
            if (child.nodeName === "THEAD") {
                const row = child.querySelector("tr");
                //console.log(row);
                const cells = [...row!.querySelectorAll("#head")].map((el) => el.innerHTML);
                parsedArr.push({
                    type: "head",
                    cells,
                });
                if (!sheet.columns?.length) {
                    sheet.columns = cells.map((value, idx) => ({
                        header: value,
                        width: value.length + 10,

                        key: idx + "_column",
                    }));
                    const curRow = sheet.getRow(1);
                    curRow.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "3DA041" },
                    };
                    curRow.font = {
                        name: "Arial",
                        family: 4,
                        size: 11,
                        bold: true,
                        color: { argb: "FFFFFFFF" },
                    };
                    curRow.height = 35;
                } else {
                    const curRow = sheet.addRow(cells.reduce((acc, value, idx) => ({ ...acc, [idx + "_column"]: value }), {}));
                    curRow.alignment = { vertical: "middle", horizontal: "center" };
                    curRow.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "3DA041" },
                    };
                    curRow.font = {
                        name: "Arial",
                        family: 4,
                        size: 11,
                        bold: true,
                        color: { argb: "FFFFFFFF" },
                    };
                    curRow.height = 35;
                }
            }
            if (child.nodeName === "TBODY") {
                const rows = [...child.querySelectorAll("tr")];
                rows.forEach((row) => {
                    const cells = [...row.querySelectorAll("#cell-value")].map((el) => el.innerHTML);
                    parsedArr.push({
                        type: "row",
                        cells,
                    });

                    const curRow = sheet.addRow(cells.reduce((acc, value, idx) => ({ ...acc, [idx + "_column"]: value }), {}));
                    curRow.alignment = { vertical: "middle", horizontal: "center" };
                    curRow.height = 35;
                });
            }
        }

        // Установка свойства wrapText для каждой ячейки на true
        sheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.alignment = {
                    wrapText: true,
                    horizontal: "centerContinuous",
                    vertical: "middle",
                };
            });
        });

        console.log(parsedArr.filter((row) => !!row.cells.length));
        //--------------- PARSE TABLE

        //IMG-----------------
        const width = 700;
        const height = 370;
        const canvasArr = [...document.querySelectorAll("canvas")];
        canvasArr.forEach((canvas, idx) => {
            // const ctx = canvas.getContext("2d");

            // // Получите данные изображения с помощью getImageData
            // const imgData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            // const data = imgData.data;

            // // Пройдитесь по данным пикселей и установите неполностью непрозрачные пиксели в белый цвет
            // for (let i = 0; i < data.length; i += 4) {
            //     if (data[i + 3] < 255) {
            //         data[i] = 255; // Красный
            //         data[i + 1] = 255; // Зеленый
            //         data[i + 2] = 255; // Синий
            //         data[i + 3] = 255; // Альфа-канал (непрозрачность)
            //     }
            // }

            // // Поместите обработанные данные обратно на канвас
            // ctx!.putImageData(imgData, 0, 0);
            sheet.addImage(
                workbook.addImage({
                    base64: canvas.toDataURL("image/jpg", 1),
                    extension: "jpeg",
                }),
                {
                    tl: { col: idx % 2 ? 3 : 0, row: parsedArr.length + 19 * (Math.ceil((idx + 1) / 2) - 1) },
                    ext: { width, height },
                }
            );
        });
        //------------------IMG

        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            //console.log("URL", url);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName + ".xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

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
                    <hr />
                    <button onClick={() => console.log(tabels)}>show tabels</button>
                    <button onClick={() => console.log(protocolList)}>show protocols list</button>
                    <hr />
                    <button onClick={() => console.log(members)}>members show</button>
                    <hr />
                    <button onClick={() => console.log(selectedStats)}>selected stats show</button>
                </div>
            )}
            {mainStatusShooceHtml}
            {mainStatus === "new" && selectedStatsListHtml}
            {mainStatus === "archive" && protocolListSelectHtml}
            {topInfoBlock}
            <Mission />

            {headerModal}

            {mainStatus === "new" && (
                <>
                    <div className={styles.topBtnsBlock}>
                        {!isShowEditHeaders && (
                            <div className={styles.headersSettingsBtn} onClick={() => setIsShowEditHeaders((state) => !state)} style={{ background: "rgb(111, 210, 115)" }}>
                                <div>Настройки колонок</div>
                                <Cog6ToothIcon width={20} />
                            </div>
                        )}
                        <div className={styles.headersSettingsBtn} onClick={saveSettingsOnServer} style={{ background: "#05C1DA", position: "absolute", right: 20 }}>
                            <div>Сохранить изменения колонок и ячеек</div>
                            <ArrowUpTrayIcon width={20} />
                        </div>
                    </div>
                    {isShowEditHeaders && headersEditBlock}
                </>
            )}

            <table className={styles.mainTable} id="mainTable">
                {!!tabels.length && mainTable}
            </table>
            {scrollPos !== null && (
                <div className={styles.scrollBtn} onClick={goToSavedScroll}>
                    <BarsArrowUpIcon width={30} />
                    <div className={styles.text}>Подняться к таблице</div>
                </div>
            )}

            <Charts charts={charts} />
            {mainStatus == "archive" && isAdmin && !!protocolSelectedId && (
                <>
                    <div className={styles.headersSettingsBtn} onClick={() => confirm("Удалить протокол из архива ?") && deleteProtocolById({ id: protocolSelectedId, afterFunc: clearStates }).then(() => setMainStatus(null))} style={{ background: "tomato", color: "white" }}>
                        <div>Удалить протокол</div>
                        <TrashIcon width={20} />
                    </div>
                </>
            )}
            {mainStatus === "new" && !isSavedProtocol && tabels.some((table) => table.stats.length) && (
                <div className={styles.headersSettingsBtn} onClick={saveDirectOnServer} style={{ background: "#2196F3", color: "white", position: "fixed", right: 10, bottom: 10 }}>
                    <div>Сохранить протокол</div>
                    <CloudArrowUpIcon width={20} />
                </div>
            )}
            {tabels.some((table) => table.stats.length) && (
                <div className={styles.exelBtn} onClick={onSaveExcel}>
                    <span>
                        Cохранить в <b>Excel</b>
                    </span>
                    <DocumentArrowDownIcon width={20} />
                </div>
            )}
        </div>
    );
}
