import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import styles from './table.module.scss';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import CreateTableControl from './CreateTableControl/CreateTableControl';
import { CostumLineI, DateColumnI, DatesI, RaportTableInfoI, StatHeaderI, StatRowI, TablePatternI, TableStatisticI, UserI } from '@/types/types';
import { linearRegression } from '@/utils/trend';
import { MultiLinesChart } from '../Chart/MultilineChart';
import { MultiLinesChart2 } from '../Chart/MultilineChart2';
import TableHeader from './header';
import useChart from '@/hooks/useChart';
import { StateReduxI } from '@/redux/store';
import EditableTable from '../EditableTable/EditableTable';
import useTablePatterns from '@/hooks/useTablePatterns';
import useTableStatistics from '@/hooks/useTableStatistics';
import { toast } from 'react-toastify';
import { getDayOfWeek, getMonthStr, getTextLength } from '@/utils/funcs';
import useUsers from '@/hooks/useUsers';
import { daySec } from '@/utils/vars';

interface ILinearRes {
    result: any[];
    slope: number;
    intercept: number;
    r: number;
    slopeArr: number[];
}

export default function EditableStatisticTable({ selectedTable, disableSelectOnList }: { selectedTable: TableStatisticI | 'clear' | undefined; disableSelectOnList: () => void }) {
    //--state
    const [headers, setHeaders] = useState<Array<StatHeaderI>>([]);
    const [rows, setRows] = useState<Array<StatRowI>>([]);
    const [calcedRows, setCalcedRows] = useState<Array<StatRowI>>([]);
    const [about, setAbout] = useState('');
    const [dateColumn, setDateColumn] = useState<DateColumnI>(); // TABLE INFO Созданная таблица

    const [chartDates, setChartDates] = useState([]);
    const [chartLines, setChartLines] = useState<CostumLineI[]>([]);

    const [columnsWidth, setColumnsWidth] = useState<Array<number>>([130]);

    const [patternName, setPatternName] = useState('');

    const [isDescriptionsShow, setIsDescriptionsShow] = useState(false);
    const [tableDescriptions, setTableDescriptions] = useState('');
    const [tableName, setTableName] = useState('');
    const [tableDescriptionsName, setTableDescriptionsName] = useState('');

    const [isCreateTableBlock, setIsCreateTableBlock] = useState(false);
    const [currentTablePattern, setCurrentTablePattern] = useState(0);

    const [selectedHeaderPattern, setSelectedHeaderPattern] = useState(false);
    const [createdNextPeriod, setCreatedNextPeriod] = useState(false);

    const [selectedRow, setSelectedRow] = useState<null | number>(null);
    const [selectedItem, setSelectedItem] = useState(0);

    //REFS
    const reportResultRef = useRef<any>();
    //const inputsArrRef = useRef<any>([]);
    const inputsArrRef = useRef<Array<HTMLInputElement[]>>([]);

    //---SELECTORS

    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === 'admin');
    const user = useSelector((state: any) => state.main.user as UserI);

    const { tablePatterns } = useSelector((state: StateReduxI) => state.patterns);
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);

    //---HOOKS
    const { createTablePattern } = useTablePatterns();
    const { createTableStatistic, updateTableStatistic, deleteTableStatistic } = useTableStatistics();
    const { userPatterns, getUserPosts } = useUsers();

    //--funcs

    //headers
    const onAddHeader = () => {
        setColumnsWidth((state) => [...state, 100]);
        setHeaders((state) => [...state, { name: `колонка ${state.length + 1}`, id: nanoid(), logicStr: '', initValue: 0, showControl: true, onChart: false }]);
        setRows((state) => state.map((row) => ({ ...row, values: [...row.values, { id: nanoid(), value: '', expression: '', editable: true, message: '', descriptions: '' }] })));
    };

    //rows
    const onAddRow = () => {
        setRows((state) => [
            ...state,
            {
                id: nanoid(),
                values: Array(headers.length)
                    .fill({})
                    .map((el, idx) => ({ id: nanoid(), value: '', expression: '', editable: true, message: '', descriptions: '' })),
            },
        ]);
    };
    const onDelRow = (id: string, index: number) => {
        if (!confirm(`Удалть ряд со всеми данными ?`)) return;
        setRows((state) => state.filter((row) => row.id !== id));
        setDateColumn((state) => state && { ...state, datesArr: state.datesArr.filter((_, idx) => idx !== index) });
    };
    const onChangeRowItem = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, rowIndex: number, id: string, onlyNumbers: boolean = false) => {
        if (onlyNumbers && isNaN(+event.target.value)) return; // Set only NUMBERS
        setRows((state) =>
            state.map((row, rowIdx) => {
                if (rowIdx !== rowIndex) return row;
                return {
                    ...row,
                    values: row.values.map((item, itemIdx) => {
                        if (item.id !== id) return item;
                        return {
                            ...item,
                            value: event.target.value.trim(),
                        };
                    }),
                };
            })
        );
    };

    //clear
    const clearStates = () => {
        setHeaders(() => []);
        setCalcedRows([]);
        setRows([]);
        setColumnsWidth([]);
        setTableDescriptions('');
        setTableDescriptionsName('');
        setTableName('');
        setCalcedRows([]);
        setIsCreateTableBlock(false); // DISABLED FOR TEST !!! ❗❗❗❗❗❗❗
        setDateColumn(undefined);
    };

    //-------------------------------------------------------------------------------------------SAVE TABLE ⭐⭐⭐⭐⭐⭐⭐

    const onSaveTable = (next: boolean = false) => {
        if (!tableName.length) {
            toast.warning('Укажите название статистики');
            return;
        }

        if (tableStatisticsList.map((table) => table.name).includes(tableName)) {
            toast.warning('Статистика с таким названием уже есть');
            return;
        }

        let currentName = tableName;

        // if (dateColumn?.type === '13ти недельный') {
        if (dateColumn?.autoRenewal) {
            console.log('Date', dateColumn);
            const yearStart = +new Date(dateColumn!.dateStart).getFullYear();
            const yearEnd = +new Date(dateColumn!.dateEnd).getFullYear();

            const monthStartStr = getMonthStr(dateColumn!.dateStart + daySec);
            const monthEndStr = getMonthStr(dateColumn!.lastDayOfDatesArr);

            let periodStr = `${yearStart !== yearEnd ? `${yearStart} - ${yearEnd}` : yearStart} : ${monthStartStr}/${monthEndStr}`;
            if (dateColumn.type == 'Месячный') {
                periodStr = `${yearStart !== yearEnd ? `${yearStart} - ${yearEnd}` : yearStart} : ${monthStartStr}`;
            }
            if (dateColumn.type == '2 года плюс текущий') {
                periodStr = `${new Date(dateColumn.dateEnd).getFullYear()}`;
            }
            currentName = currentName.split('@')[0].split('@')[0].trim();

            currentName = dateColumn?.autoRenewal ? `${currentName} @ ${periodStr}` : tableName; // формирутся имя для автопродолжения статистики
        }

        const createdTable: TableStatisticI = {
            tableName: currentName, // формирутся имя для автопродолжения статистики
            dateStart: dateColumn!.dateStart,
            dateEnd: dateColumn!.dateEnd,
            headers,
            rows,
            tableDescriptions,
            tableDescriptionsName,
            columnsWidth,
            dateColumn: dateColumn ? { ...dateColumn, raportInfo: getRaportInfo() } : undefined,
            //dateColumn:dateColumn?{...dateColumn,raportInfo:getRaportInfo()}:undefined,
            about,
        };
        //  console.log(createdTable)
        createTableStatistic(createdTable).then(() => {
            clearStates();
            disableSelectOnList(); //сбрасываем выбор (что бы после создания нового периода не висел старый список периодов , без нового)
            setCreatedNextPeriod(false);
        });
    };

    //------------------------------------------------------------------------------------------NEXT PERIOD ⭐⭐⭐⭐⭐⭐⭐

    const onCreateNextPeriodStatistic = async () => {
        await onUpdateTable();
        if (!dateColumn) return;
        const daySec = 86400000;
        let savedRows: DatesI[] | undefined = [];
        let savedDataRows: any;
        let yearsArr: number[] = [];

        //СОХРАНЯЕМ РЯДЫ
        if (dateColumn?.type == '13ти недельный') {
            savedRows = dateColumn?.datesArr.toSpliced(0, dateColumn?.datesArr.length - 3);
            savedDataRows = rows.toSpliced(0, rows.length - 3).map((row) => ({ ...row, values: row.values.map((item) => ({ ...item, editable: true, descriptions: 'saved' })) })); //save rows & editable = false - SAVED
        }

        if (dateColumn.type == '2 года плюс текущий') {
            yearsArr = [...new Set(dateColumn.datesArr.map((date) => new Date(date.start).getFullYear()))];
            const delYear = yearsArr[0];
            const delCount = dateColumn.datesArr.reduce((acc, date) => (new Date(date.start).getFullYear() == delYear ? acc + 1 : acc), 0);

            savedRows = dateColumn?.datesArr.toSpliced(0, delCount);
            savedDataRows = rows.toSpliced(0, delCount).map((row) => ({ ...row, values: row.values.map((item) => ({ ...item, editable: true, descriptions: 'saved' })) })); //save rows & editable = false - SAVED
            console.log('YEARS', delYear, delCount, savedRows, savedDataRows);
        }

        //СОЗДАЕМ НОВЫЕ РЯДЫ
        console.log('SAVED DATA ROWS', savedDataRows);
        let newRows: DatesI[] = [];
        let lastDayOfDatesArr = 0;
        let dateStart = savedRows.length ? savedRows!.at(-1)!?.end + daySec : dateColumn?.lastDayOfDatesArr || 0; /// ---------- LAST MONTH SET 0 !!! <---HERE ❗❗❗❗❗❗🚩
        //console.log('START',dateStart)
        let dateEnd = 0;

        if (dateColumn?.type == '13ти недельный') {
            newRows.length = 10;
            newRows = newRows.fill({ description: '', warning: false, start: 0, end: 0 }).map((row, rowIdx) => {
                const currentStartSec = new Date(new Date(dateStart).getTime() + daySec * 7 * rowIdx).getTime();
                const currentEndSec = new Date(new Date(dateStart).getTime() + (daySec * (7 * (rowIdx + 1)) - daySec)).getTime();
                let currentStartMonth = getMonthStr(currentStartSec);
                let currentEndMonth = getMonthStr(currentEndSec);
                dateEnd = currentEndSec;
                return {
                    start: currentStartSec,
                    end: currentEndSec,
                    description: currentStartMonth !== currentEndMonth ? `${currentStartMonth}-${currentEndMonth}` : currentStartMonth,
                    warning: false,
                };
            });
        }

        if (dateColumn?.type == '2 года плюс текущий' || dateColumn?.type == 'Месячный') {
            let periodsArrTempStr: string[] = [];
            let secStart = dateColumn.dateEnd + daySec;

            if (dateColumn.type == 'Месячный') {
                // CALC END FOR MONTH
                dateEnd = new Date(new Date(secStart).getFullYear(), new Date(secStart).getMonth() + 1, 0).getTime();
            }

            if (dateColumn.type == '2 года плюс текущий' && yearsArr) {
                secStart = new Date(new Date(dateColumn.dateEnd).getFullYear() + 1, 0, 1).getTime();
                dateEnd = new Date(yearsArr.at(-1)! + 1, 11, 31).getTime();
            }

            for (let i = secStart, periodEnd = 0, monthStr = ''; i <= dateEnd; i += daySec) {
                //  console.log(getDayOfWeek(i))
                if (periodEnd < i + daySec) {
                    // FIX HERE (dateColumn.firstWeekDay - 1 ) ! CONTROL '❗❗❗❗❗❗❗
                    if (dateColumn?.type == 'Месячный' && getDayOfWeek(i) == dateColumn.firstWeekDay - 1) {
                        let periodEndDate = new Date(i + (dateColumn.periodDayCount - 1) * daySec);
                        periodEnd = periodEndDate.getTime();

                        lastDayOfDatesArr = periodEndDate.getTime();
                        let periodWorning = dateEnd < periodEndDate.getTime();

                        if (dateColumn.isFullPeriod && !periodsArrTempStr.length) {
                            //add out of range dates
                            periodsArrTempStr = [` ${new Date(dateStart).toLocaleDateString()} - ${new Date(i).toLocaleDateString()}`];

                            newRows = [
                                {
                                    start: secStart,
                                    end: new Date(i - daySec).getTime(),
                                    warning: false,
                                    description: '',
                                },
                            ];
                        }

                        newRows = [
                            ...newRows,
                            {
                                start: new Date(i).getTime(),
                                end: periodWorning && dateColumn.isFullPeriod ? dateEnd : periodEndDate.getTime(),
                                warning: periodWorning ? false : dateEnd < periodEndDate.getTime(),
                                description: '',
                            },
                        ];
                    }

                    if (dateColumn?.type == '2 года плюс текущий') {
                        //CALC MONTH
                        let currentMonth = getMonthStr(i);
                        if (monthStr != currentMonth) {
                            console.log(getMonthStr(i));
                            newRows = [
                                ...newRows,
                                {
                                    start: new Date(new Date(i).getFullYear(), new Date(i).getMonth(), 1).getTime(),
                                    end: new Date(new Date(i).getFullYear(), new Date(i).getMonth() + 1, 0).getTime(),
                                    warning: false,
                                    description: currentMonth,
                                },
                            ];
                            monthStr = currentMonth;
                        }
                    }
                }
            }
        }

        if (dateColumn) {
            const newPeriod = [...savedRows, ...newRows];
            // console.log('NEXT PERIOD',newPeriod);
            const tempDateColumn: DateColumnI = {
                autoRenewal: true,
                dateEnd,
                datesArr: newPeriod,
                dateStart,
                firstWeekDay: dateColumn.firstWeekDay,
                lastDayOfDatesArr: dateEnd,
                periodDayCount: dateColumn.periodDayCount,
                type: dateColumn.type,
                selectedPattern: dateColumn.selectedPattern,
                isFullPeriod: dateColumn?.isFullPeriod,
            };
            //change name of new period
            let currentName = tableName;
            currentName = currentName.split('@')[0].split('@')[0].trim();
            const yearStart = +new Date(tempDateColumn!.dateStart).getFullYear();
            const yearEnd = +new Date(tempDateColumn!.lastDayOfDatesArr).getFullYear();
            const monthStartStr = getMonthStr(tempDateColumn!.dateStart);
            const monthEndStr = getMonthStr(tempDateColumn!.dateEnd);
            let periodStr = `${yearStart !== yearEnd ? `${yearStart} - ${yearEnd}` : yearStart} : ${monthStartStr}/${monthEndStr}`;

            if (tempDateColumn.type == 'Месячный') {
                periodStr = `${yearStart !== yearEnd ? `${yearStart} - ${yearEnd}` : yearStart} : ${monthEndStr}`; // в месячном только месяц
            }
            if (tempDateColumn.type == '2 года плюс текущий') {
                periodStr = `${yearsArr.at(-1)! + 1}`; // в месячном только месяц
            }

            let newName = dateColumn?.autoRenewal ? `${currentName} @ ${periodStr}` : tableName; // формирутся имя для автопродолжения статистики

            setTableName(newName);

            const currentHeaders = [...headers].toSpliced(0, 1);
            //console.log(currentHeaders,headers)

            setCreatedNextPeriod(true);

            onCreateDateColumn(tempDateColumn, savedDataRows, currentHeaders);
            // onSaveTable();
        }
    };

    //update
    const onUpdateTable = async () => {
        const createdTable: TableStatisticI = {
            tableName,
            dateStart: dateColumn!.dateStart,
            dateEnd: dateColumn!.dateEnd,
            headers,
            rows,
            tableDescriptions,
            tableDescriptionsName,
            columnsWidth,
            // dateColumn,
            dateColumn: dateColumn ? { ...dateColumn, raportInfo: getRaportInfo() } : undefined,
            about,
        };
        console.log(createdTable);
        if (selectedTable !== 'clear' && selectedTable?.id) {
            await updateTableStatistic(selectedTable.id, createdTable);
        } else {
            toast.error('Талица не выбрана');
        }
    };
    const onDeleteTable = () => {
        if (!confirm(`Вы точно хотите удалить статистику "${tableName}" ?`)) return;
        if (selectedTable !== 'clear' && selectedTable?.id) {
            deleteTableStatistic(selectedTable.id);
            clearStates();
            disableSelectOnList();
        } else {
            toast.error('Талица не выбрана');
        }
    };

    // save pattern
    const onSavePattern = () => {
        if (!patternName.length) {
            toast.warning('Укажите название шаблона');
            return;
        }

        if (tablePatterns.map((pattern) => pattern.name).includes(patternName)) {
            toast.warning('Шаблон с таким названием уже есть');
            return;
        }

        const pattern: TablePatternI = {
            id: 0,
            name: patternName || 'без названия',
            headers: headers.filter((header) => !header.name.includes('период')),
        };
        //console.log('CREATED PATTERN', pattern);

        createTablePattern(pattern);
    };

    //----------------------------------------------------------------------------------------------CALC ITEM⭐⭐⭐⭐⭐⭐⭐

    const calcRowItem = (rowIndex: number, itemIndex: number): { logicStrWithDecorValues: string; result: any } => {
        const logicStr = headers?.[itemIndex]?.logicStr || '';
        const initValue = headers?.[itemIndex]?.initValue || 0;

        const columnDecorsObj = headers.reduce((acc, header, idx) => {
            acc[`@${idx + 1}`] = header;
            return acc;
        }, {});

        let logicStrWithDecorValues = logicStr.replaceAll('@sum', '').replaceAll('@trend', '').replaceAll('@revtrend', '');

        // console.log('DECORS',columnDecorsObj);
        if (logicStr) {
            try {
                logicStrWithDecorValues = logicStrWithDecorValues.replaceAll(/@@\d{1,3}/g, (decorator, a, b) => {
                    // ПРОШЛЫЙ РЯД
                    const targetIndex = Number(decorator.replace('@@', '')) - 1;
                    //console.log('CURRENT COLUMN',targetIndex==itemIndex);
                    if (rowIndex == 0) {
                        //itemValue = headers[targetIndex].initValue;
                        //  console.log('ROW 0', headers[targetIndex].initValue);
                        return String(headers[targetIndex].initValue);
                    }

                    let itemValue;
                    if (targetIndex == itemIndex) {
                        // 📌 если декоратором обращаемся на себя , то значение поля 0
                        itemValue = 0;
                    } else {
                        itemValue = rows[rowIndex - 1].values[targetIndex].value;
                    }
                    //console.log('replace',{decorator,a,b,row:rows[rowIndex].values,targetIndex,itemValue});
                    return String(itemValue);
                });

                logicStrWithDecorValues = logicStrWithDecorValues.replaceAll(/@\d{1,3}/g, (decorator, a, b) => {
                    // TЕКУЩИЙ РЯД
                    const targetIndex = Number(decorator.replace('@', '')) - 1;
                    //console.log('CURRENT COLUMN',targetIndex==itemIndex);
                    if (targetIndex > headers.length - 1) {
                        return 'не существующая колонка';
                    }

                    let itemValue;
                    if (targetIndex == itemIndex) {
                        // 📌 если декоратором обращаемся на себя , то значение поля 0
                        itemValue = 0;
                    } else {
                        itemValue = rows[rowIndex].values[targetIndex].value || `@${targetIndex + 1}`;
                        //itemValue = rows[rowIndex].values[targetIndex].value || '❓'
                    }
                    //console.log('replace',{decorator,a,b,row:rows[rowIndex].values,targetIndex,itemValue});
                    return String(itemValue);
                });

                logicStrWithDecorValues = logicStrWithDecorValues.replaceAll('@init', String(initValue));
                //console.log(`STR VALUES : ${logicStrWithDecorValues}`);
                let result = eval(logicStrWithDecorValues);

                if (!result) {
                    result = 0;
                }
                return {
                    logicStrWithDecorValues,
                    result: Number(Number(result).toFixed(2)),
                };
            } catch (err) {
                let unknown = !!String(logicStrWithDecorValues).match(/@/g) || /[a-z A-Z А-Я а-я]|| ❓/g.test(logicStrWithDecorValues);
                return {
                    logicStrWithDecorValues,
                    result: unknown ? `❓` : ``,
                };
            }
        }
        return {
            logicStrWithDecorValues,
            result: false,
        };
    };

    //-------------------------------------------------------------------------------------------- CALC ROWS ⭐⭐⭐⭐⭐⭐⭐

    // trendType ? trend : revtrend ❗

    //trends array values
    let trendsObj = {};

    const trendStatus = (trendType: boolean, value: any, itemIndex: number, rowIndex: number): string => {
        let trendStatus = true;
        const resultStatusText = () => (trendStatus ? 'Растущая↗️' : 'Падающая🔻');

        //---ПУСТОЕ ЗНАЧЕНИЕ0️⃣

        if (/❓/g.test(value)) {
            return `не определено`;
        }

        //---ПЕРВЫЙ РЯД1️⃣

        //обычный выше нуля
        //перевернутый ниже нуля и ноль

        if (!rowIndex) {
            if (trendType) {
                if (value < 0) {
                    trendStatus = false;
                }
                return resultStatusText();
            } else {
                if (value > 0) {
                    trendStatus = false;
                }
                return resultStatusText();
            }
        }

        //---ОПРЕДЕЛЕНИЕ ТРЕНДА⚙️📈
        //результат по статусу була trendStatus и вызываем resultStatusText() для возврата текста

        if (trendsObj[itemIndex]) {
            const trend = linearRegression(
                trendsObj[itemIndex].map((_, index) => index + 1),
                trendsObj[itemIndex]
            );

            if (trendType) {
                //СТАНДАРТНЫЙ ТРЕНД📈
                console.log('💵', trend.result[0].y - trend.result.at(-1).y, trend.slope);
                if (trend.result[0].y - trend.result.at(-1).y < 0 && trend.slope !== 0) {
                    return resultStatusText();
                } else {
                    trendStatus = false;
                    // если наклона нет , то смотрим по логике первого значения
                    if (value > 0 && trend.slope === 0) {
                        trendStatus = true;
                    }
                    return resultStatusText();
                }
            } else {
                //ПЕРЕВЕРНУТЫЙ ТРЕНД📉
                if (trend.result.at(-1).y - trend.result[0].y <= 0 && trend.slope !== 0) {
                    return resultStatusText();
                } else {
                    // если наклона нет , то смотрим по логике первого значения
                    if (value > 0) {
                        trendStatus = false;
                    }
                    return resultStatusText();
                }
            }
        } else {
            return `process⚙️`;
        }
    };

    const calcRows = () => {
        let lastRow: StatRowI;

        let calcedTemp = rows.map((row, rowIndex) => {
            lastRow = {
                ...row,
                values: row.values.map((item, itemIndex) => {
                    const result = { ...item };
                    let logicStr = '';
                    logicStr = headers?.[itemIndex]?.logicStr || '';
                    const calcedItemTemp = calcRowItem(rowIndex, itemIndex);

                    // //TREND 📈
                    // if (/@trend/.test(logicStr) || /@revtrend/.test(logicStr)) {
                    //     if (!isNaN(calcedItemTemp.result)) {
                    //         trendsObj[itemIndex] = [...(trendsObj?.[itemIndex] || []), calcedItemTemp.result];
                    //     }

                    //     //  console.log('trends', trendsObj);
                    //     const trendType = /@trend/.test(logicStr); // trend || revtrend

                    //     // return {
                    //     //     ...item,
                    //     //     value: calcedItemTemp.result,
                    //     //     expression: calcedItemTemp.logicStrWithDecorValues,
                    //     //     message: trendStatus(trendType, calcedItemTemp.result, itemIndex, rowIndex),
                    //     // };

                    //     item.message = trendStatus(trendType, calcedItemTemp.result, itemIndex, rowIndex);
                    // }

                    //SUM
                    if (logicStr && /@sum/.test(logicStr)) {
                        if (/❓/g.test(calcedItemTemp.result)) {
                            calcedItemTemp.result = '';
                            return {
                                ...item,
                                value: '❓',
                                expression: calcedItemTemp.logicStrWithDecorValues,
                            };
                        }

                        if (!rowIndex) {
                            if (headers[itemIndex].initValue) {
                                return {
                                    ...item,
                                    value: Number(Number(Number(calcedItemTemp.result) + Number(headers[itemIndex].initValue)).toFixed(2)),
                                    expression: `${headers[itemIndex].initValue} + (${calcedItemTemp.result})`,
                                };
                            }
                            return {
                                ...item,
                                value: Number(Number(calcedItemTemp.result).toFixed(2)),
                                expression: calcedItemTemp.logicStrWithDecorValues,
                            };
                        }

                        // clear ❓ in result
                        let resExpression = `${lastRow.values[itemIndex].value}+${calcedItemTemp.logicStrWithDecorValues}`;
                        let isUnknownsInExpressions = /❓/g.test(resExpression);
                        const calcedValue = isUnknownsInExpressions ? '❓' : Number(Number(Number(calcedItemTemp.result) + Number(lastRow.values[itemIndex].value)).toFixed(2));
                        return {
                            ...item,
                            value: calcedValue,
                            expression: isUnknownsInExpressions ? '❓' : resExpression,
                        };
                    }
                    if (logicStr) {
                        return {
                            ...item,
                            value: calcedItemTemp.result,
                            expression: calcedItemTemp.logicStrWithDecorValues,
                        };
                    }

                    return {
                        ...item,
                    };
                }),
            };
            return lastRow;
        });

        //-------------------------------------------------------- SET STATUS TRENDS📉📈📉📈
        calcedTemp = calcedTemp.map((row, rowIndex) => {
            return {
                ...row,
                values: row.values.map((item, itemIndex) => {
                    const logicStr = headers?.[itemIndex]?.logicStr || '';
                    if (/@trend/.test(logicStr) || /@revtrend/.test(logicStr)) {
                        if (!isNaN(+item.value)) {
                            trendsObj[itemIndex] = [...(trendsObj?.[itemIndex] || []), item.value];
                        }
                        const trendType = /@trend/.test(logicStr); // trend || revtrend
                        return {
                            ...item,
                            message: trendStatus(trendType, item.value, itemIndex, rowIndex),
                        };
                    } else {
                        return item;
                    }
                }),
            };
        });

        // headers.forEach((header,headerIndex)=>{
        //     if()
        // })

        // headers.forEach((header, headerIdx) => {
        //     if (/@trend/g.test(header.logicStr)) {
        //         const trendRow = calcedTemp.map((row) => row.values[headerIdx].value);
        //         const trend = linearRegression(
        //             trendRow.map((_, index) => index + 1),
        //             trendRow
        //         );

        //         calcedTemp = calcedTemp.map((row, rowIdx) => ({
        //             ...row,
        //             values: row.values.map((column, columnIdx) => ({
        //                 ...column,
        //                 message: columnIdx != headerIdx ? column.message : !/❓/g.test(column.value + '') ? (trend.slopeArr[rowIdx] >= 0 ? 'Растущая↗️' : 'Падающая🔻') : '❓',
        //             })),
        //         }));
        //     }
        // });

        // const trendStatus = ({ revTrend = false, rowIdx, trend }: { revTrend?: boolean; rowIdx: number; trend: ILinearRes }): 'Падающая🔻' | 'Растущая↗️' => {
        //     if (revTrend) {
        //     } else {
        //     }
        // };

        // headers.forEach((header, headerIdx) => {
        //     if (/@revtrend/g.test(header.logicStr)) {
        //         const trendRow = calcedTemp.map((row) => row.values[headerIdx].value);
        //         const trend = linearRegression(
        //             trendRow.map((_, index) => index + 1),
        //             trendRow
        //         );

        //         console.log('TREND ✅✅✅✅', trend);

        //         calcedTemp = calcedTemp.map((row, rowIdx) => ({
        //             ...row,
        //             values: row.values.map((column, columnIdx) => ({
        //                 ...column,
        //                 message: columnIdx != headerIdx ? column.message : !/❓/g.test(column.value + '') ? (trend.slopeArr[rowIdx] >= 0 ? 'Падающая🔻' : 'Растущая↗️') : '❓',
        //             })),
        //         }));
        //     }
        // });

        setCalcedRows(calcedTemp);
    };

    //? trend.slopeArr[rowIdx] > 0||Number(column.value)>=0 ? "Падающая🔻" : "Растущая↗️"
    //   (rowIdx && trend.slopeArr[rowIdx] > trend.slopeArr[0]) || trend.slopeArr[rowIdx] > 0

    //--------------------------------------------------------------------------------- CREATE DATES COLUMNS ⭐⭐⭐⭐⭐⭐⭐

    const onCreateDateColumn = (dateColumnParam: DateColumnI, savedDataRows: null | StatRowI[] = null, currentHeaders: StatHeaderI[] = []) => {
        // !!!savedDataRows && clearStates();         !!!!!!!!!!!‼️‼️‼️‼️‼️‼️‼️‼️❗❗❗❗❗❗❗
        // disableSelectOnList();

        //SET HEADERS
        let patternHeaders: StatHeaderI[] = currentHeaders;

        if (selectedTable == 'clear' || !selectedTable) {
            // если новая статистика то грузит шаблнные поля , если готовая то продлевает уже созданные
            if (dateColumnParam?.selectedPattern) {
                if (tablePatterns[dateColumnParam?.selectedPattern - 1].headers) {
                    patternHeaders = tablePatterns[dateColumnParam?.selectedPattern - 1].headers;
                }
            }
        }

        if (dateColumnParam) {
            //set Columns;
            const columsWidthTemp = [
                ...Array(patternHeaders.length + 1)
                    .fill(0)
                    .map((_, idx) => (idx ? 100 : 125)),
            ]; // initial width of colmns

            //setHeaders
            const tempHeaders = [{ name: `${dateColumnParam.type} период `, id: nanoid(), logicStr: '', initValue: 0, showControl: false, onChart: false }, ...patternHeaders];

            //set rows
            const tempRows: StatRowI[] = dateColumnParam.datesArr.map((period, periodIdx) => {
                return {
                    id: nanoid(),
                    descriptions: savedDataRows && savedDataRows.length && periodIdx < savedDataRows.length ? 'saved' : '', // SAVED ROW ON DESCRIPTION
                    values: [
                        {
                            id: nanoid(),
                            value: `${new Date(period.start).toLocaleDateString()} - ${period.warning ? '⚠️' : ''} ${new Date(period.end).toLocaleDateString()}`,
                            expression: '',
                            editable: false,
                            message: period.description,
                            descriptions: 'date',
                        },
                        ...(savedDataRows && savedDataRows.length && periodIdx < savedDataRows.length
                            ? savedDataRows[periodIdx].values.toSpliced(0, 1)
                            : Array(patternHeaders.length)
                                  .fill({})
                                  .map(() => ({
                                      id: nanoid(),
                                      value: '',
                                      expression: '',
                                      editable: true,
                                      message: '',
                                      descriptions: '',
                                  }))),
                    ],
                };
            });
            setDateColumn(dateColumnParam);
            !savedDataRows && setColumnsWidth(columsWidthTemp);
            //!selectedTable&&!savedDataRows&&setColumnsWidth(columsWidthTemp)
            setHeaders(tempHeaders);
            setRows(tempRows);

            // if(savedDataRows?.length){ // SAVE CREATED NEXT PERIOD TABLE
            //     onSaveTable(true,dateColumnParam.dateStart,dateColumnParam.lastDayOfDatesArr)
            //    ;
            // }
        }
    };

    //----------------------------------------------------------------------------------------------CREATE LINES & TREND ⭐⭐⭐⭐⭐⭐⭐⭐
    const findChartColumnAndCreateLine = () => {
        const chartColumnsIdxArr = headers.reduce((arr: number[], header, idx) => (header.onChart ? [...arr, idx] : arr), []);
        const linesArr: CostumLineI[] = chartColumnsIdxArr.map((columnIdx) => ({
            color: 'green',
            trend: false,
            name: headers[columnIdx].name,
            columnKey: 22,
            records: calcedRows.map((row, rowIdx) => (row.values.length && row.values[columnIdx]?.value !== '' ? Number(row.values[columnIdx]?.value) : NaN)), //clear empty data
        }));

        const trendColumnsIdxArr = headers.reduce((arr: number[], header, idx) => (/@trend/g.test(header.logicStr) || /@revtrend/g.test(header.logicStr) ? [...arr, idx] : arr), []);
        const trendArr = trendColumnsIdxArr
            .map((columnIdx) => ({ columnIdx, values: calcedRows.map((row, rowIdx) => Number(row.values[columnIdx]?.value)) }))
            //.filter(row=>!row.values.some(value=>Number.isNaN(value)))
            .map((row) => {
                const values = row.values;
                let go = true;
                const numbers = values.filter((value) => {
                    if (!Number.isNaN(value) && go) {
                        return true;
                    } else {
                        go = false;
                        return false;
                    }
                });
                console.log('NUMBERS ⭐', numbers);

                const trend = linearRegression(
                    numbers.map((_, index) => index + 1),
                    numbers
                );
                console.log('📈', trend);
                return {
                    color: 'gray',
                    trend: false,
                    name: 'тренд',
                    columnKey: 22,
                    records: trend.result, //clear empty data
                };
            });

        console.log('VALUES CHART📈', linesArr, trendArr);

        setChartLines(linesArr.length || trendArr.length ? [...linesArr, ...trendArr] : []);
    };

    //FULL FIELDS STAT CHECK
    const fullFileldsStatsChecks = (): boolean => {
        let statFilled: 'full' | 'notFull' | 'clean' = 'full';
        let lastFilledRow: StatRowI | null = null;
        let lastRowIndex: number | null = null;

        calcedRows.forEach((row, rowIdx) => {
            // ИЩЕМ КОЛОНКИ С ТРЕНДОМ И ПО НИМ РАБОТАЕМ

            if (!lastFilledRow && !row.values.some((item) => String(item.message).startsWith('Растущая') || String(item.message).startsWith('Падающая')) && statFilled !== 'clean') {
                if (!rowIdx) {
                    statFilled = 'clean';
                } else {
                    lastFilledRow = calcedRows[rowIdx - 1];
                    lastRowIndex = rowIdx - 1;
                    statFilled = 'notFull';
                }
            }
        });
        return statFilled == 'full';

        // let isFull=true;
        // if(headers.length&&rows.length&&dateColumn?.autoRenewal){
        //     rows.forEach(row=>row.values.forEach((item,itemIdx)=>{
        //         if(isFull)
        //         isFull=!(item.value==''&&headers[itemIdx].logicStr=='')
        //     }))
        // }
        // return isFull
    };

    //CHECK PERIOD--------------------------------------🕒🕒🕒🕒🕒🕒🕒🕒🕒

    const checkCurrentPeriod = (rowIndex: number): { isCurrentPeriod: boolean } => {
        if (!dateColumn || !dateColumn?.datesArr[rowIndex]) return { isCurrentPeriod: true };
        const { datesArr } = dateColumn;
        const currentDateSec = new Date().getTime();
        // console.log('CURRENT PERIOD🕖',dateColumn?.datesArr,new Date(datesArr[rowIndex].start).getDate(),currentDateSec>=datesArr[rowIndex].start&&currentDateSec<=datesArr[rowIndex].end + (daySec*2))
        if (dateColumn.type == '2 года плюс текущий') {
            return { isCurrentPeriod: currentDateSec >= datesArr[rowIndex].start && currentDateSec <= datesArr[rowIndex].end + daySec * 10 };
        }
        return { isCurrentPeriod: currentDateSec >= datesArr[rowIndex].start && currentDateSec <= datesArr[rowIndex].end + daySec * 2 };
    };

    //GET RAPORT INFO -----------------------------------📄📄📄📄📄📄📄📄📄

    const getRaportInfo = (isAlert = false) => {
        let statFilled: 'full' | 'notFull' | 'clean' = 'full';
        let lastFilledRow: StatRowI | null = null;
        let lastRowIndex: number | null = null;

        calcedRows.forEach((row, rowIdx) => {
            // ИЩЕМ КОЛОНКИ С ТРЕНДОМ И ПО НИМ РАБОТАЕМ

            if (!lastFilledRow && !row.values.some((item) => String(item.message).startsWith('Растущая') || String(item.message).startsWith('Падающая')) && statFilled !== 'clean') {
                if (!rowIdx) {
                    statFilled = 'clean';
                } else {
                    lastFilledRow = calcedRows[rowIdx - 1];
                    lastRowIndex = rowIdx - 1;
                    statFilled = 'notFull';
                }
            }
        });

        if (statFilled === 'full') {
            lastRowIndex = calcedRows.length - 1;
            lastFilledRow = calcedRows[lastRowIndex];
        }

        let trendStatus = 'не определено';
        let trendColumnName = 'тренд не найден';
        let trendType = 'не указан';

        if (lastFilledRow && lastRowIndex !== null) {
            let trendIdx = lastFilledRow.values.findLastIndex((item) => /Падающая/g.test(item.message + '') || /Растущая/g.test(item.message + ''));
            if (trendIdx >= 0) {
                trendType = /revtrend/g.test(headers[trendIdx].logicStr) ? 'Перевёрнутый тренд' : 'Стандартный тренд';
                trendStatus = /Падающая/g.test(lastFilledRow.values[trendIdx].message) ? 'Падающая' : 'Растущая';
                trendColumnName = headers[trendIdx].name;
            }
        }

        const chartProps = {
            costumsLines: chartLines,
            dates: dateColumn?.datesArr || [],
            clickFunc: () => {},
            reverseTrend: headers.map((header) => header.logicStr).some((logicStr) => logicStr.includes('@revtrend')),
        };

        const result: RaportTableInfoI = {
            statFilled,
            lastFilledPeriod: dateColumn!?.datesArr[lastRowIndex!] || null,
            statLastRowValues: lastFilledRow?.values.map((item) => String(item.value)) || [],
            statHeaders: headers.map((header) => header.name),
            trendType,
            trendStatus,
            trendColumnName,
            lastRowIndex,
            chartProps,
        };
        if (isAlert) {
            alert(JSON.stringify(result, null, 2));
        }

        console.log(result);
        return result;
    };

    //effects
    useEffect(() => {
        //on select table
        if (selectedTable == 'clear') {
            clearStates();
            return;
        }
        if (selectedTable) {
            // console.log('TableName ', selectedTable);

            setAbout(selectedTable.about);
            setTableDescriptions(selectedTable.tableDescriptions);
            setTableDescriptionsName(selectedTable.tableDescriptionsName);
            setTableName(selectedTable.tableDescriptionsName);
            setDateColumn(selectedTable.dateColumn);
            setTableName(selectedTable.tableName);
            setColumnsWidth(() => selectedTable.columnsWidth);
            setHeaders(selectedTable.headers);
            setRows(selectedTable.rows);
        }
    }, [selectedTable]);

    useEffect(() => {
        //calc items
        // if(rows.length&&headers.length==rows[0].values.length)
        calcRows();
        //console.log('CALCED 🧮', calcedTemp);
        inputsArrRef.current = [];
        setSelectedRow(null);
        setSelectedItem(0);
        //alert('RELOAD');
    }, [rows, headers]);

    useEffect(() => {
        // show chart
        //  console.log('CALCED ROWS', calcedRows);
        findChartColumnAndCreateLine();
    }, [headers, calcedRows]);

    //------------------------------------------- SELECTED ROW ⬆️⬇️
    useEffect(() => {
        //if (selectedRow === null) return;

        const rowsCount = calcedRows.length - 1;

        async function keyDown(event: KeyboardEvent) {
            //console.log(event.key);
            switch (event.key) {
                case 'ArrowUp': {
                    setSelectedRow((state) => (state ? state - 1 : state));
                    setSelectedItem(0);
                    break;
                }
                case 'ArrowDown': {
                    setSelectedRow((state) => (state !== null && state !== rowsCount ? state + 1 : state));
                    setSelectedItem(0);
                    break;
                }
                case 'ArrowRight': {
                    setSelectedItem((state) => (inputsArrRef.current[selectedRow!]?.[state + 1] ? state + 1 : state));
                    break;
                }
                case 'ArrowLeft': {
                    setSelectedItem((state) => (state ? state - 1 : state));
                    break;
                }
                case 'Enter': {
                    // //setSelectedItem((state) => (inputsArrRef.current[selectedRow!]?.[state + 1] ? state + 1 : state));
                    // if (inputsArrRef.current[selectedRow!]?.[selectedItem + 1]) {
                    //     setSelectedItem((state) => state + 1);
                    //     console.log('YES');
                    // } else {
                    //     console.log('NO');
                    //     setSelectedRow((state) => state! + 1);
                    // }
                    await onUpdateTable();

                    break;
                }
            }
        }
        document.addEventListener('keydown', keyDown);

        return () => {
            // alert('reload');
            document.removeEventListener('keydown', keyDown);
        };
    }, [selectedRow]);
    //при смене выделеного ряда или ячейки
    useEffect(() => {
        // if (inputsArrRef.current.length) {
        //     inputsArrRef.current.forEach((row) => {
        //         if (row.length) {
        //             row.forEach((itemRef) => {
        //                 // itemRef.style.background = 'white';
        //                 // itemRef.style.color = 'black';
        //                 itemRef.style.cssText = '';
        //             });
        //         }
        //     });
        // }

        if (selectedRow !== null) {
            if (inputsArrRef.current[selectedRow]?.[selectedItem]) {
                inputsArrRef.current[selectedRow][selectedItem].focus();
                // inputsArrRef.current[selectedRow][selectedItem].style.background = 'rgb(240, 223, 230)';
                // inputsArrRef.current[selectedRow][selectedItem].style.color = 'black';
                // inputsArrRef.current[selectedRow][selectedItem].style.border = '1px solid black';
            }
        }
    }, [selectedRow, selectedItem]);

    return (
        <div className={styles.blokWrap}>
            {isAdmin && (
                <>
                    {
                        //true
                        isCreateTableBlock ? (
                            <CreateTableControl onCreateDateColumn={onCreateDateColumn} onCancel={() => setIsCreateTableBlock(false)} />
                        ) : (
                            selectedTable == 'clear' && (
                                <div className={styles.createNewTableBtn} onClick={() => setIsCreateTableBlock(true)}>
                                    создать новую статистику
                                </div>
                            )
                        )
                    }
                    {!!headers.length && (
                        <div className={styles.saveTableBlock} onMouseEnter={() => setSelectedHeaderPattern(true)} onMouseLeave={() => setSelectedHeaderPattern(false)}>
                            <input type="text" value={patternName} onChange={(event) => setPatternName(event.target.value)} placeholder="название шаблона" />
                            <div onClick={onSavePattern} className={styles.savePatternBtn}>
                                сохранить шаблон
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className={styles.tableWrap}>
                {/* {
                    !!headers.length &&
                    <div className={styles.tableAboutWrap}>
                        <ReactQuill value={about} onChange={setAbout} readOnly={!isAdmin} theme={isAdmin ? "snow" : "bubble"} />
                    </div>
                } */}
                <div className={styles.tableMain}>
                    {!!headers.length && (
                        <>
                            <div className={styles.tableNameWrap}>
                                <input type="text" value={tableName} onChange={(event) => setTableName(event.target.value)} placeholder="название статистики" disabled={createdNextPeriod} />
                            </div>
                        </>
                    )}
                    <div className={styles.headerBlock}>
                        {headers.map((header, headerIndex) => (
                            <TableHeader key={header.id + tableName} {...{ header, colWidth: columnsWidth[headerIndex], headerIndex, isAdmin, headers, setHeaders, setRows, setColumnsWidth, selectedHeaderPattern }} />
                        ))}
                        {isAdmin && dateColumn && (
                            <div onClick={onAddHeader} className={styles.addColumnBtn}>
                                ➕<div className={styles.addColumnBtnInfo}>добавить колонку</div>
                            </div>
                        )}
                    </div>
                    <div className={styles.bodyBlock}>
                        {calcedRows.map((row, rowIndex) => {
                            const { isCurrentPeriod } = checkCurrentPeriod(rowIndex); // IS CURRENT PERIOD
                            return (
                                <div
                                    key={row.id}
                                    className={`
                                ${styles.row} ${rows[rowIndex]?.descriptions == 'saved' ? styles.rowSaved : ''}
                                ${isCurrentPeriod ? styles.currentPeriod : ''}
                                `}
                                >
                                    {row.values.map((value, itemIndex) => {
                                        if (value.editable && headers[itemIndex]?.logicStr) {
                                            // console.log('▶️', rowIndex, itemIndex);
                                        }
                                        let itemCount = 0;
                                        return (
                                            <div
                                                key={value.id}
                                                className={`
                                            ${styles.item} 
                                            ${value.descriptions == 'date' ? styles.itemDate : ''}
                                            ${!headers[itemIndex]?.logicStr && value.descriptions !== 'date' && value.descriptions !== 'saved' && value.value === '' ? styles.forInputData : ''}
                                            ${!headers[itemIndex]?.logicStr && value.descriptions !== 'date' && value.descriptions !== 'saved' && value.value !== '' ? styles.withInputData : ''}
                                            ${selectedRow == rowIndex ? styles.selectedRow : ''}
                                            `}
                                                style={{
                                                    width: columnsWidth[itemIndex] + 5,
                                                    // border: selectedRow == rowIndex ? `2px solid black` : '',
                                                }}
                                                onClick={() => {
                                                    setSelectedRow(rowIndex);
                                                    // alert(`selected row ${rowIndex}`);
                                                }}
                                            >
                                                {value.editable ? (
                                                    <div className={styles.adminItemWrap}>
                                                        {headers[itemIndex]?.logicStr ? (
                                                            <div className={styles.resultWrap}>
                                                                {isAdmin && (
                                                                    <div className={styles.expression}>
                                                                        {/* Выражение : */}
                                                                        <b className={styles.expressionStr}>{value.message ? value.value : value.expression}</b>
                                                                    </div>
                                                                )}
                                                                <div className={styles.resultValue}>{value.message || value.value}</div>
                                                            </div>
                                                        ) : (
                                                            <input
                                                                ref={(ref) => {
                                                                    if (ref) {
                                                                        if (!inputsArrRef.current[rowIndex]?.length) {
                                                                            inputsArrRef.current[rowIndex] = [];
                                                                        }

                                                                        //inputsArrRef.current[rowIndex][itemCount] = ref;
                                                                        if (!inputsArrRef.current[rowIndex].includes(ref)) {
                                                                            inputsArrRef.current[rowIndex].push(ref);
                                                                            itemCount++;
                                                                        }

                                                                        //console.log('REF ARR', inputsArrRef.current);
                                                                        //itemCount++;
                                                                    }
                                                                }}
                                                                className={styles.itemInput}
                                                                type="text"
                                                                value={value.value}
                                                                onChange={(event) => onChangeRowItem(event, rowIndex, value.id, true)}
                                                                onClick={(event) => {
                                                                    inputsArrRef.current[rowIndex].forEach((itemRef, itemIndex) => itemRef == event.target && setSelectedItem(itemIndex));
                                                                }}
                                                                disabled={
                                                                    // FOR TIME INPUT CONTROL !!! 🕒🕒🕒🕒
                                                                    !(isCurrentPeriod || isAdmin)
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center' }} className={styles.itemValue}>
                                                        <span>{value.value}</span>
                                                        {!!(value.descriptions == 'date') && <div className={styles.itemDescription}>{value.message}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {isAdmin && (
                                        <div onClick={() => onDelRow(row.id, rowIndex)} className={styles.rowDel} style={{ fontSize: 10 }}>
                                            ❌
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {
                            // ОПИСАНИЕ СТАТИСТИКИ
                            !!headers.length && (
                                <div className={styles.tableDescriptionsWrap}>
                                    <div className={styles.tableDescriptionsBtn} onClick={() => setIsDescriptionsShow((state) => !state)}>
                                        <div className={styles.tableDescriptionsBtnIco}>📑</div>
                                        <div className={styles.tableDescriptionsBtnName}>{tableDescriptionsName}</div>
                                    </div>

                                    {isDescriptionsShow && (
                                        <div className={styles.descriptionsBlock}>
                                            <div className={styles.close} onClick={() => setIsDescriptionsShow(false)}>
                                                ❌
                                            </div>

                                            <input className={styles.descriptionsName} value={tableDescriptionsName} onChange={(event) => setTableDescriptionsName(event.target.value)} />

                                            <EditableTable saveFunc={setTableDescriptions} descriptionsStr={tableDescriptions} />
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    </div>
                    {dateColumn && (
                        <div className={styles.buttonsBlock}>
                            {/* {
                                !!headers.length && dateColumn &&
                                <div onClick={onAddRow} className={styles.addRowBtn}>
                                    <div >➕</div>
                                </div>
                            } */}
                            {!!selectedTable && !createdNextPeriod && (
                                <div onClick={onUpdateTable} className={styles.updateTableBtn}>
                                    сохранить изменения
                                </div>
                            )}
                            {isAdmin && (
                                <>
                                    {(!selectedTable || selectedTable == 'clear' || createdNextPeriod) && (
                                        <div onClick={() => onSaveTable()} className={styles.saveTableBtn}>
                                            сохранить созданную статистику "{tableName}"
                                        </div>
                                    )}
                                    {!!selectedTable && (
                                        <div onClick={onDeleteTable} className={styles.deleteTableBtn}>
                                            удалить статистику
                                        </div>
                                    )}
                                </>
                            )}

                            {/* <button onClick={() => console.log(inputsArrRef.current)}>InputRefs</button> */}

                            <button onClick={() => getRaportInfo(true)} style={{ alignSelf: 'flex-end' }}>
                                RAPORT INFO
                            </button>
                            <button
                                onClick={() => {
                                    alert(JSON.stringify(dateColumn, null, 2));
                                    console.log('dateColumn', dateColumn);
                                }}
                                style={{ alignSelf: 'flex-end' }}
                            >
                                current dateColumn
                            </button>
                            <button onClick={() => alert(JSON.stringify(headers, null, 2))} style={{ alignSelf: 'flex-end' }}>
                                headers
                            </button>
                        </div>
                    )}
                    {dateColumn && dateColumn.autoRenewal && selectedTable && fullFileldsStatsChecks() && (
                        <div className={styles.createNextPeriodBtn} onClick={onCreateNextPeriodStatistic}>
                            Создать статистику на следующий период
                        </div>
                    )}
                </div>
            </div>
            {!!chartLines.length && (
                <MultiLinesChart2
                    {...{
                        chartSchema: [],
                        costumsLines: chartLines,
                        dates: dateColumn?.datesArr || [],
                        clickFunc: () => {},
                        reverseTrend: headers.map((header) => header.logicStr).some((logicStr) => logicStr.includes('@revtrend')),
                    }}
                />
            )}
        </div>
    );
}
