import { useCallback, useMemo, useState } from "react";
import styles from "./direct.module.scss";
import { nanoid } from "@reduxjs/toolkit";
import { IDirectHeader, IDirectInfoDoc, IDirectMembers, IDirectOffice, IDirectTable, IOrgItem, OfficeI, RaportTableInfoI, StatItemLogic, StatItemReady, TableStatisticListItemI, UserFullI, UserI } from "@/types/types";
import { daySec } from "@/utils/vars";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import DirectTable from "./DirectTable";
import Modal from "@/components/elements/Modal/Modal";
import useTableStatistics from "@/hooks/useTableStatistics";

import { ViewColumnsIcon, XCircleIcon, BuildingOffice2Icon, Cog6ToothIcon, ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { hexToRgba, rgbToHex, timeNumberToString, timeStrToNumber } from "@/utils/funcs";
import useUsers from "@/hooks/useUsers";
import Mission from "@/components/elements/Mission/Mission";
import Charts from "./Charts";

const defaultHeaders: IDirectHeader[] = [
    {
        id: nanoid(),
        title: "Название блока",
        color: "#6FD273",
    },
    {
        id: nanoid(),
        title: "План/факт за прошедший период",
        color: "#6FD273",
    },
    {
        id: nanoid(),
        title: "Состояние",
        color: "#6FD273",
    },
    {
        id: nanoid(),
        title: "Квота на будущий период",
        color: "#6FD273",
    },
    {
        id: nanoid(),
        title: "Планируемое состояние на будущий период",
        color: "#6FD273",
    },
];

const memberPresenceCol = ["#B2B2B2", "#FFF545"];

export default function DirectiveScreen() {
    //HOOKS
    const { getLatestTable, addingFilledField } = useTableStatistics();
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
    const [headers, setHeaders] = useState<IDirectHeader[]>(defaultHeaders);
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

    //FUNCS
    //headers
    const onDelHeader = (id: string) => {
        setHeaders((state) => state.filter((header) => header.id !== id));
        //удаляем логику с ячеек для этой колонки по ID колонки
        setTables((state) => state.map((table) => ({ ...table, stats: table.stats.map((stat) => ({ ...stat, logicStrArr: stat.logicStrArr.filter((logic) => logic.headerId !== id) })) })));
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

    //TABLE HTML
    const mainTable = useMemo(() => {
        //console.log(tabels);
        return tabels.map((table) => {
            return <DirectTable headers={headers} table={table} setTables={setTables} fullOrgWithdata={fullOrgWithdata} setCharts={setCharts} charts={charts} />;
        });
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
                        <div className={styles.headersItem} onClick={() => headerIdx && setSelectedHeader(headerIdx)} style={{ background: header.color }}>
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
                                <th>Отделение</th>
                                <th>Руководитель</th>
                                <th>Присутствие</th>
                            </thead>
                            <tbody>
                                {members.map((member, memberIdx) => (
                                    <tr className={styles.memberItem}>
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

    return (
        <div className={styles.directWrap}>
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

            <table className={styles.mainTable}>{mainTable}</table>

            <Charts charts={charts} />
        </div>
    );
}
