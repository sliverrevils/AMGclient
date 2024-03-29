import useUI from '@/hooks/useUI';
import styles from './chartsList.module.scss';
import { useSelector } from 'react-redux';
import { StateReduxI } from '@/redux/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartItemI, TableStatisticListItemI, UserFullI, UserI } from '@/types/types';
import { clearStatName } from '@/utils/funcs';
import { MultiLinesChart2 } from '@/components/elements/Chart/MultilineChart2';
import useUsers from '@/hooks/useUsers';
import Modal from '@/components/elements/Modal/Modal';
import useChartList from '@/hooks/useChartsList';
import { toast } from 'react-toastify';
import { nanoid } from '@reduxjs/toolkit';

interface ChartListItem {
    id: number;
    name: string;
    charts: ChartItemI[];
    description: string;
}

export default function CreateChartList() {
    //SELECTORS
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    const isAdmin = useSelector((state: any) => state.main.user?.role === 'admin');
    const user: UserI = useSelector((state: any) => state.main.user);
    const { users }: { users: UserFullI[] } = useSelector((state: StateReduxI) => state.users);
    const officesWithLatestPeriodStatsAndData = useSelector((state: StateReduxI) =>
        state.org.offices.map((office) => {
            // ЗАМЕНЯЕМ ID СТАТИСТИК НА ПОСЛЕДНИЕ

            const getLatestTable = (id: number) => {
                const currentStat = state.stats.tableStatisticsList.find((stat) => stat.id == id);

                if (currentStat && /@/g.test(currentStat.name)) {
                    const statName = currentStat.name.split('@')[0].trim();
                    const statsArr = state.stats.tableStatisticsList.filter((stat) => stat.name.split('@')[0].trim() == statName).toSorted((a, b) => b.id - a.id);
                    if (statsArr.length) {
                        return statsArr[0];
                    } else {
                        return currentStat;
                    }
                }
                return currentStat;
            };

            let showOffice: boolean = user.userId == office.leadership; //лидер офиса

            return {
                ...office,
                mainPattern: getLatestTable(office.mainPattern),
                patterns: office.patterns.map((stat) => getLatestTable(stat)),
                departments: office.departments.map((dep) => {
                    let showDep: boolean = user.userId == dep.leadership; //лидер деп

                    if (showDep) {
                        //если лидер деп , показываем ему офис
                        showOffice = true;
                    }

                    return {
                        ...dep,
                        mainPattern: getLatestTable(dep.mainPattern),
                        patterns: dep.patterns.map((stat) => getLatestTable(stat)),
                        sections: dep.sections.map((sec) => {
                            let showSec: boolean = user.userId == sec.leadership; // лидер сек

                            if (showSec) {
                                //если лидер деп , показываем ему офис
                                showOffice = true;
                                showDep = true;
                            }

                            return {
                                ...sec,
                                mainPattern: getLatestTable(sec.mainPattern),
                                patterns: sec.patterns.map((stat) => getLatestTable(stat)),
                                showBlock: showSec, // - отображение секции
                            };
                        }),
                        showBlock: showDep, // - отображение деп блока
                    };
                }),
                showBlock: showOffice, // - отображение офиса
            };
        })
    );
    console.log(officesWithLatestPeriodStatsAndData);

    //STATE
    const [selectedStatsIdArr, setSelectedStatsIdArr] = useState<ChartItemI[]>([]); // ❗❗❗❗❗СОХРАНЯТЬ ЭТОТ МАССИВ И ЗАГРУЖАТЬ В ЭТО СОСТОЯНИЕ( ПОСЛЕДНИЕ СТАТИСТИКИ БУДУТ АВТОМАТИЧЕСКИ ВЫБИРАТЬСЯ)
    const [showOnModal, setShowOnModal] = useState(false);
    const [isSaveField, setIsSaveField] = useState(false);
    const [listName, setListName] = useState('');
    const [chartsListsArr, setChartsListsArr] = useState<ChartListItem[]>([]);
    const [selectedListId, setSelectedListID] = useState(0);
    const [listToUserField, setListToUserField] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(0);

    //HOOKS
    const { createMenu } = useUI();
    const { userByID } = useUsers();

    const [listMenu, onOpenListMenu, onCloseListMenu, listMenuStyle] = createMenu({ position: 'absolute' });
    const { createChartsList, getAllUseresLists, deleteChartList, updateChartsList, chartListToUser } = useChartList(setChartsListsArr);

    //FUNCS

    //add list to user - admin
    const onAddListToUser = () => {
        chartListToUser(selectedListId, selectedUserId).then(() => {
            setSelectedUserId(0);
            setListToUserField(false);
        });
    };

    //on view charts - stat list up
    const statUp = (index: number) => {
        setSelectedStatsIdArr((state) => {
            if (!index) return state;
            return [...state].toSpliced(index - 1, 1, state[index]).toSpliced(index, 1, state[index - 1]);
        });
    };

    //on view charts - stat list down
    const statDown = (index: number) => {
        setSelectedStatsIdArr((state) => {
            if (index == state.length - 1) return state;
            return [...state].toSpliced(index + 1, 1, state[index]).toSpliced(index, 1, state[index + 1]);
        });
    };

    //find and select latest period on stat
    const getLatestTable = (id: number) => {
        const currentStat = tableStatisticsList.find((stat) => stat.id == id);

        if (currentStat && /@/g.test(currentStat.name)) {
            const statName = currentStat.name.split('@')[0].trim();
            const statsArr = tableStatisticsList.filter((stat) => stat.name.split('@')[0].trim() == statName).toSorted((a, b) => b.id - a.id);
            if (statsArr.length) {
                return statsArr[0];
            } else {
                return currentStat;
            }
        }
        return currentStat;
    };

    // on select chart from menu
    const onAddChartFromMenu = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>, stat: any, type: any, item: any, leadership: any) => {
            event.stopPropagation();
            !selectedStatsIdArr.some((currentSelected) => currentSelected.id === stat.stat.id) && //ПРОВЕРЯЕМ НАЛИЧИЕ
                setSelectedStatsIdArr((state) => [{ id: stat.stat.id, type, itemName: item.name, statType: stat.statType, leadership, isClose: false }, ...state]);
            onCloseListMenu();
        },
        [selectedStatsIdArr]
    );

    // chart view -open close toggle
    const openCloseChartToggle = (id: number) => {
        setSelectedStatsIdArr((state) =>
            state.map((item) => {
                return item.id !== id
                    ? item
                    : {
                          ...item,
                          isClose: !item.isClose,
                      };
            })
        );
    };

    // save list
    const onSaveList = () => {
        console.log('CURRENT LIST', selectedStatsIdArr);
        if (!listName.length) {
            toast.error('Укажите название листа');
            return;
        }
        //alert(JSON.stringify(selectedStatsIdArr, null, 2));
        if (!chartsListsArr.some((list) => list.name == listName)) {
            createChartsList(listName, selectedStatsIdArr, 'test');
            setListName('');
            setIsSaveField(false);
            setSelectedListID(0);
        } else {
            toast.error('Уже есть лист с таким названием');
        }
    };

    // delete list
    const onDeleteList = (listId: number) => {
        deleteChartList(listId);
        setSelectedListID(0);
    };

    // is updated list?
    const isListUpdated = (): boolean => {
        const currentSelectedList = chartsListsArr.find((list) => list.id == selectedListId);
        if (!selectedListId || !currentSelectedList) return false;

        return !(JSON.stringify(selectedStatsIdArr) == JSON.stringify(currentSelectedList.charts));
    };

    //print open
    const setShowPrint = () => {
        const win = window.print();

        //     console.log(document.querySelector(`.${styles.chartList}`)?.innerHTML)
        //    win?.document.write(document.querySelector(`.${styles.chartListFullScreen}`)?.innerHTML);
    };

    //COMPONENTS
    //for menu
    //отображение блоков айтемов выясняем в формированиие селектора
    const OrgItem = ({ item, type, leadership, controled = false }: { item: any; type: 'office' | 'dep' | 'sec'; leadership: number; controled?: boolean }) => {
        let controledNow = controled || user.userId == item.leadership;
        console.log('controledNow', item.name, controled, controledNow);

        if (!isAdmin && !item.showBlock) return false; // НЕ ПОКАЗЫВАЕМ ЛИШНИЕ АЙТЕМЫ

        const [checked, setChecked] = useState(type === 'sec');
        const stylesObg = {
            office: styles.orgOffice,
            dep: styles.orgDep,
            sec: styles.orgSec,
        };

        let statArr: { statType: 'main' | 'additional'; stat: TableStatisticListItemI }[] = [];

        if (isAdmin) {
            statArr = [{ statType: 'main', stat: item.mainPattern }, ...item.patterns.map((stat) => ({ statType: 'additional', stat }))].filter((stat) => stat.stat) as { statType: 'main' | 'additional'; stat: TableStatisticListItemI }[];
        } else {
            if (controledNow) {
                statArr = [{ statType: 'main', stat: item.mainPattern }, ...item.patterns.map((stat) => ({ statType: 'additional', stat }))].filter((stat) => stat.stat) as { statType: 'main' | 'additional'; stat: TableStatisticListItemI }[];
            }
        }

        console.log(statArr);
        const statListHtml = statArr.length ? (
            <div className={styles.statList}>
                {statArr.map((stat) => (
                    <div
                        className={styles.statItem}
                        // onClick={(event) => {
                        //     event.stopPropagation();
                        //     !selectedStatsIdArr.some(currentSelected=>currentSelected.id===stat.stat.id) //ПРОВЕРЯЕМ НАЛИЧИЕ
                        //     &&
                        //     setSelectedStatsIdArr((state) => [{ id: stat.stat.id, type, itemName: item.name, statType: stat.statType, leadership, isClose:false },...state] );
                        //     onCloseListMenu();
                        // }}
                        onClick={(event) => onAddChartFromMenu(event, stat, type, item, leadership)}
                    >
                        {stat.statType == 'main' ? <span>🚩</span> : <span>➕</span>}
                        <span>{clearStatName(stat.stat?.name || '')}</span>
                    </div>
                ))}
            </div>
        ) : (
            <>{user.userId == item.leadership && <span style={{ textAlign: 'center', color: 'white' }}>нет установленных статистик</span>}</>
        );
        return (
            <div
                className={stylesObg[type]}
                onClick={(event) => {
                    event.stopPropagation();
                    console.log('click', item.name);
                    setChecked((state) => !state);
                }}
            >
                <div className={`${styles.itemName} noselect`}>
                    <span>{item.name}</span>
                    <span className={styles.check}>{!checked ? '🡄' : '🡇'}</span>
                </div>

                {type !== 'sec' && statListHtml}
                {checked && (
                    <div className={styles.itemsList}>
                        {type == 'office' && item.departments.map((dep, index) => <OrgItem item={dep} type="dep" leadership={dep.leadership} controled={controledNow} />)}
                        {type == 'dep' && item.sections.map((sec, index) => <OrgItem item={sec} type="sec" leadership={sec.leadership} controled={controledNow} />)}
                        {type == 'sec' && statListHtml}
                    </div>
                )}
            </div>
        );
    };

    //chart item

    const ChartItem = ({ chartItem, index, openCloseToggle }: { chartItem: ChartItemI; index: number; openCloseToggle: () => void }) => {
        //VARS
        const itemTextObj = {
            office: 'Отделение',
            dep: 'Отдел',
            sec: 'Cекция',
        };
        const userPostText = {
            office: 'РО',
            dep: 'РО',
            sec: 'АС',
        };

        const actualStat = getLatestTable(chartItem.id);
        if (actualStat) {
            return (
                <div className={`${styles.chartItem} ${chartItem.isClose ? styles.chartItemClose : ''} ${styles[chartItem.type]} noselect`} onClick={() => chartItem.isClose && openCloseToggle()}>
                    <div className={styles.btnsBlock}>
                        <div className={styles.arrowBlock}>
                            {!!index && (
                                <span
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        statUp(index);
                                    }}
                                >
                                    ⬆️
                                </span>
                            )}
                            {index != selectedStatsIdArr.length - 1 && (
                                <span
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        statDown(index);
                                    }}
                                >
                                    ⬇️
                                </span>
                            )}
                        </div>
                        {!chartItem.isClose && (
                            <div className={styles.isOpen} onClick={openCloseToggle}>
                                {!chartItem.isClose ? '🪟' : '📕'}
                            </div>
                        )}
                        <div className={styles.delete} onClick={() => setSelectedStatsIdArr((state) => state.filter((item) => item.id !== chartItem.id))}>
                            ❌
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <div>{chartItem.statType === 'main' ? '🚩Главная статистика' : '➕Дополнительная статистика'}</div>
                        <div>
                            🏢{itemTextObj[chartItem.type]} : {chartItem.itemName}
                        </div>
                        <div>
                            👤{userPostText[chartItem.type]} {userByID(chartItem.leadership)?.name}
                        </div>
                    </div>

                    <div className={styles.statName}>{clearStatName(actualStat.name)}</div>

                    {!chartItem.isClose && actualStat.dateColumn.raportInfo?.chartProps && <MultiLinesChart2 {...{ ...actualStat.dateColumn.raportInfo?.chartProps }} chartSchema={[]} showBtns={false} showX={!showOnModal} linesBtns={!showOnModal} />}
                </div>
            );
        } else {
            return false;
        }
    };

    //MEMO

    //ОТОБРАЖЕНИЕ ГРАФИКОВ📈
    const chartList = useMemo(() => {
        if (!selectedStatsIdArr.length) return false;

        if (showOnModal)
            return (
                <Modal closeModalFunc={() => setShowOnModal(false)} fullWidth={true} black={false} zIndex={99}>
                    <div className={styles.chartListFullScreen}>{selectedStatsIdArr.map((selectedStat, index) => !selectedStat.isClose && <ChartItem chartItem={selectedStat} index={index} openCloseToggle={() => openCloseChartToggle(selectedStat.id)} />)}</div>
                    <div
                        className={styles.printScreenBtn}
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowPrint();
                        }}
                    >
                        🖨️
                    </div>
                </Modal>
            );
        else
            return (
                // FULL SCREEN BTN 🔍
                <div className={styles.chartList}>
                    {selectedStatsIdArr.some((stat) => !stat.isClose) && (
                        <>
                            <div
                                className={styles.fullScreenBtn}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setShowOnModal(true);
                                }}
                            >
                                🔍
                            </div>
                        </>
                    )}
                    {selectedStatsIdArr.map((selectedStat, index) => (
                        <ChartItem chartItem={selectedStat} index={index} openCloseToggle={() => openCloseChartToggle(selectedStat.id)} />
                    ))}
                </div>
            );
    }, [selectedStatsIdArr, showOnModal]);

    //EFFECTS

    useEffect(() => {
        getAllUseresLists();
    }, []);

    useEffect(() => {
        if (!selectedListId) {
            setSelectedStatsIdArr([]);
            return;
        }

        const selectedList = chartsListsArr.find((list) => list.id == selectedListId);
        if (selectedList) {
            setSelectedStatsIdArr(selectedList.charts);
        }
    }, [selectedListId]);

    //❗❗❗❗❗СОХРАНЯЕМ МАССИВ ВЫБРАННЫХ СТАТИСТИК С ИНФОРМАЦИЕ ОТКУДА ОНИ (ПОСЛЕДНИЕ ПОДГРУЖАЮТСЯ ДЛЯ ОТОБРАЖЕНИЯ АВТОМАТИЧЕСКИ - НАХОДИМ В РЕДАКСЕ ПО ИМЕНИ)
    return (
        <div
            className={styles.chratListWrap}
            onContextMenu={(event) => {
                event.preventDefault();
                // onOpenListMenu(event);
            }}
        >
            {
                //CHARTS LIST SELECT
                !!chartsListsArr.length && !isSaveField && (
                    <select className={styles.listsSelect} onChange={(event) => setSelectedListID(Number(event.target.value))}>
                        <option value={0}> {!selectedListId ? 'выбор листа' : 'создать новый лист'}</option>
                        {chartsListsArr.map((listItem) => (
                            <option value={listItem.id}>{listItem.name}</option>
                        ))}
                    </select>
                )
            }

            {
                //BUTTONS
                isSaveField ? ( //сохранение листа
                    <div className={styles.saveBlock}>
                        <input value={listName} onChange={(event) => setListName(event.target.value)} placeholder="название листа графиков" />
                        <div onClick={onSaveList}>сохранить</div>
                        <div
                            onClick={() => {
                                setIsSaveField(false);
                            }}
                        >
                            ❌
                        </div>
                    </div>
                ) : (
                    // блок с кнопками
                    <div className={styles.topBtnsWrap}>
                        <div onClick={(event) => onOpenListMenu(event)}>добавить график</div>

                        {!!selectedStatsIdArr.length && (
                            <>
                                {!!selectedListId ? (
                                    isListUpdated() ? (
                                        <div className={styles.save} onClick={() => updateChartsList(selectedListId, selectedStatsIdArr)}>
                                            {' '}
                                            обновить лист
                                        </div>
                                    ) : listToUserField || !isAdmin ? (
                                        <></>
                                    ) : (
                                        <div onClick={() => setListToUserField((state) => !state)}>предоставить лист пользователю</div>
                                    )
                                ) : (
                                    <div className={styles.save} onClick={() => setIsSaveField(true)}>
                                        {' '}
                                        сохранить лист
                                    </div>
                                )}

                                {!!selectedListId ? (
                                    <div className={styles.del} onClick={() => onDeleteList(selectedListId)}>
                                        Удалить лист
                                    </div>
                                ) : (
                                    <div
                                        className={styles.del}
                                        onClick={(event) => {
                                            event.stopPropagation(), setSelectedStatsIdArr([]);
                                        }}
                                    >
                                        очистить экран
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )
            }

            {listToUserField && isAdmin && (
                <div className={styles.addToUserBlock}>
                    <select value={selectedUserId} onChange={(event) => setSelectedUserId(Number(event.target.value))}>
                        <option value={0}> выбор пользователя</option>
                        {users.map((user) => (
                            <option key={nanoid()} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    <div className={styles.addToUser} onClick={onAddListToUser}>
                        предоставить лист
                    </div>

                    <div
                        className={styles.close}
                        onClick={() => {
                            setListToUserField((state) => !state);
                            setSelectedUserId(0);
                        }}
                    >
                        {' '}
                        {!listToUserField ? 'предоставить пользователю' : 'отмена'}
                    </div>
                </div>
            )}

            {/* меню */}
            <div className={styles.orgMenu} style={listMenuStyle}>
                <div
                    className={styles.closeMenuBtn}
                    onClick={(event) => {
                        event.stopPropagation();
                        onCloseListMenu();
                    }}
                >
                    ❌
                </div>
                <div className={styles.menuTitle}>Добавление нового граффика на экран 📈</div>
                {officesWithLatestPeriodStatsAndData.map((office, index) => (
                    <OrgItem item={office} type="office" leadership={office.leadership} />
                ))}
            </div>

            {/* График лист */}
            {!isSaveField && chartList}
        </div>
    );
}
