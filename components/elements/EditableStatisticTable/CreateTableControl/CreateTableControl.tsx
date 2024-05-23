import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./createTable.module.scss";
import { getDayOfWeek, getMonthStr } from "@/utils/funcs";
import { DateColumnI, DatesI } from "@/types/types";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";

const daysBefore = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

export default function CreateTableControl({ onCreateDateColumn, onCancel }: { onCreateDateColumn: (dateColumnParam: DateColumnI) => void; onCancel: () => void }) {
    //state
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [firstDay, setFirstDay] = useState(0);
    const [periodDayCount, setPeriodDayCount] = useState(7);
    const [selectedPattern, setSelectedPattern] = useState(0);
    const [isFullPeriod, setIsFullPeriod] = useState(false); //числа диапазона в не периода недели
    const [periodType, setPeriodType] = useState<any>("0"); //'0'|'Недельный'|'Месячный'|'13ти недельный';
    const [autoRenewal, setAutoRenewal] = useState(false); //автопродлевание
    //selector
    const { tablePatterns } = useSelector((state: StateReduxI) => state.patterns);

    //funcs
    //const getDayOfWeek=(date)=>Number(String(new Date(date).getUTCDay()).replace('0','7'));

    const createDateTable = () => {
        if (periodType == "13ти недельный" && (!dateStart || !periodType)) {
            toast.error(`Укажите все данные!`);
            return;
        }
        if (periodType !== "13ти недельный" && (!dateStart || !dateEnd || !periodType)) {
            toast.error(`Укажите все данные!`);
            return;
        }

        if (periodType == "Недельный" && (!firstDay || !periodDayCount)) {
            toast.error("Укажите начальный день недели!");
            return;
        }
        const daySec = 86400000;
        const secStart = new Date(dateStart).getTime();
        const secEnd = new Date(dateEnd).getTime();
        const betweenDays = (secEnd - secStart) / 1000 / 60 / 60 / 24;
        // console.log('PERIOD Day' , betweenDays);

        let periodArrObj: DatesI[] = [];
        let lastDayOfDatesArr = 0;

        if (periodType == "13ти недельный") {
            for (let i = 0; i < 13; i++) {
                const currentStartSec = new Date(new Date(dateStart).getTime() + daySec * 7 * i).getTime();
                const currentEndSec = new Date(new Date(dateStart).getTime() + (daySec * (7 * (i + 1)) - daySec)).getTime();
                let currentStartMonth = getMonthStr(currentStartSec);
                let currentEndMonth = getMonthStr(currentEndSec);
                lastDayOfDatesArr = currentEndSec;
                periodArrObj = [
                    ...periodArrObj,
                    {
                        start: currentStartSec,
                        end: currentEndSec,
                        warning: false,
                        description: currentStartMonth !== currentEndMonth ? `${currentStartMonth}-${currentEndMonth}` : currentStartMonth,
                    },
                ];
            }
        }

        if (periodType == "2 года плюс текущий" || periodType == "Месячный") {
            let periodsArrTempStr: string[] = [];

            for (let i = secStart, periodEnd = 0, monthStr = ""; i <= secEnd; i += daySec) {
                //  console.log(getDayOfWeek(i))
                if (periodEnd < i + daySec) {
                    if (periodType == "Месячный" && getDayOfWeek(i) == firstDay) {
                        // CALC WEEK

                        periodEnd = new Date(i + periodDayCount * daySec).getTime();

                        let periodEndDate = new Date(i + (periodDayCount - 1) * daySec);

                        lastDayOfDatesArr = periodEndDate.getTime();
                        let periodWorning = secEnd < periodEndDate.getTime();

                        if (isFullPeriod && !periodsArrTempStr.length) {
                            //add out of range dates
                            periodsArrTempStr = [` ${new Date(dateStart).toLocaleDateString()} -fd  ${new Date(i).toLocaleDateString()}`];

                            periodArrObj = [
                                {
                                    start: secStart,
                                    end: new Date(i - daySec).getTime(),
                                    warning: false,
                                    description: "",
                                },
                            ];
                        }

                        periodArrObj = [
                            ...periodArrObj,
                            {
                                start: new Date(i).getTime(),
                                end: periodWorning && isFullPeriod ? secEnd : periodEndDate.getTime(),
                                warning: periodWorning ? false : secEnd < periodEndDate.getTime(),
                                description: "",
                            },
                        ];
                    }

                    if (periodType == "2 года плюс текущий") {
                        //CALC MONTH
                        let currentMonth = getMonthStr(i);
                        if (monthStr != currentMonth) {
                            //console.log(getMonthStr(i))
                            periodArrObj = [
                                ...periodArrObj,
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

        let end: number = new Date(dateEnd).getTime();
        let start: number = new Date(dateStart).getTime();

        if (periodType == "13ти недельный") {
            end = new Date(lastDayOfDatesArr).getTime();
        }
        if (periodType == "2 года плюс текущий") {
            start = new Date(new Date(dateStart).getFullYear(), new Date(dateStart).getMonth(), 1).getTime();
            end = new Date(new Date(dateEnd).getFullYear(), new Date(dateEnd).getMonth(), 0).getTime();
        }

        const datesColumn: DateColumnI = {
            dateStart: start,
            dateEnd: end,
            firstWeekDay: firstDay,
            periodDayCount,
            datesArr: periodArrObj,
            lastDayOfDatesArr,
            type: periodType,
            autoRenewal,
            selectedPattern,
            isFullPeriod,
        };
        //console.log('DATES COLUMN', datesColumn);
        onCreateDateColumn(datesColumn);
    };

    return (
        <div className={styles.tableControlWrap}>
            Создание статистики
            <select value={periodType} onChange={(event) => setPeriodType(event.target.value)}>
                <option value={"0"}>тип периода</option>
                <option value={"Месячный"}>месячный</option>
                <option value={"2 года плюс текущий"}>2 года плюс текущий</option>
                <option value={"13ти недельный"}>13ти недельный</option>
            </select>
            {periodType !== "0" && (
                <div className={styles.dateBlock}>
                    <input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} />
                    {periodType !== "13ти недельный" && <input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} />}

                    {periodType == "Месячный" && (
                        <>
                            <select value={firstDay} onChange={(event) => setFirstDay(Number(event.target.value))}>
                                <option value={0}>начальный день периода</option>
                                {daysBefore.map((day, idx) => (
                                    <option key={idx + "_weekday"} value={idx + 1}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            {/* <input type='number' value={periodDayCount} onChange={event => Number(event.target.value) > 0 && setPeriodDayCount(Number(event.target.value))} /> */}
                        </>
                    )}
                </div>
            )}
            {periodType == "Месячный" && (
                <label className={styles.fullPeriod}>
                    <span>учитывать весь период</span>
                    <input type="checkbox" value={String(isFullPeriod)} onChange={(event) => setIsFullPeriod(event.target.checked)} />
                </label>
            )}
            {
                // periodType == '13ти недельный' &&
                periodType != 0 && (
                    <label className={styles.fullPeriod}>
                        <span>автопродление статистики</span>
                        <input type="checkbox" checked={autoRenewal} onChange={(event) => setAutoRenewal(event.target.checked)} />
                    </label>
                )
            }
            {periodType !== "0" && (
                <>
                    <select value={selectedPattern} onChange={(event) => setSelectedPattern(+event.target.value)}>
                        <option value={0}>использовать шаблон</option>
                        {tablePatterns.map((pattern, idx) => (
                            <option key={pattern.name + Math.random()} value={idx + 1} title={pattern.headers.map((column) => `[${column.name}]`).join(" ")}>
                                {pattern.name}
                            </option>
                        ))}
                    </select>
                    <div onClick={createDateTable} className={styles.createTableBtn}>
                        создать таблицу
                    </div>
                </>
            )}
            <div onClick={onCancel} className={styles.createTableCancelBtn}>
                отмена
            </div>
        </div>
    );
}
