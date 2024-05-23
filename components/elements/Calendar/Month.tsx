import { getMonthInfo } from "@/utils/funcs";
import styles from "./month.module.scss";
import { useEffect, useRef, useState } from "react";

interface CalendarDayI {
    month: "last" | "current" | "next";
    value: number;
    key: number;
    date: number;
}
interface CalendarWeekI {
    days: CalendarDayI[];
    key: number;
}
interface CalendarMonthI {
    key: number;
    weeks: CalendarWeekI[];
    year: number;
    month: number;
}

//let d:DayI={month:''}

const Month = ({ year, month }: { year: number; month: number }) => {
    const [monthStateHtml, setMonthStateHtml] = useState(<div></div>);

    //REF
    const init = useRef(true);

    //VARS
    const { daysCount, firstDayOnWeek, lastDayOnWeek } = getMonthInfo({ year, month });
    const lastMonth = getMonthInfo({ year, month: month - 1 });
    const nextMonth = getMonthInfo({ year, month: month + 1 });

    //FUNCS
    const createMonth = (fullSlotsDates: boolean = true): CalendarMonthI => {
        const onSelectWeek = () => {};

        const allSlots = daysCount + firstDayOnWeek - 1 + (7 - lastDayOnWeek);
        const weekSlots = allSlots / 7;
        let createdMonth: CalendarMonthI = {
            key: Math.random(),
            weeks: [],
            year,
            month,
        };
        let dayDateTemp = 0;
        let nextMonthday = 0;
        for (let i = 0; i < weekSlots; i++) {
            //week

            let days: CalendarDayI[] = [];
            for (let k = 1; k <= 7; k++) {
                //days
                let dayValue = 0;

                let day: CalendarDayI = {
                    key: Math.random(),
                    month: "current",
                    value: 0,
                    date: new Date(year, month, k).getTime(),
                };

                let dayInMonth = true;

                if ((!i && k < firstDayOnWeek) || (i == weekSlots - 1 && k > lastDayOnWeek)) {
                    if (!i && k < firstDayOnWeek) {
                        dayValue = fullSlotsDates ? lastMonth.daysCount - (k - 1) : 0;
                        day.month = "last";
                    } else {
                        dayValue = ++nextMonthday;
                        day.month = "next";
                    }
                    dayInMonth = false;
                } else {
                    day.month = "current";
                    dayValue = ++dayDateTemp;
                }

                day.value = dayValue;
                days = [...days, day];
            }

            const week: CalendarWeekI = {
                key: Math.random(),
                days,
            };
            createdMonth.weeks = [...createdMonth.weeks, week];
        }
        //console.log('CREATED MONTH OBJ :',createdMonth);

        return createdMonth;
    };
    const createMonthHtml = (month: CalendarMonthI, fullWeek = true) => {
        const onSelectWeek = (week: CalendarWeekI) => {
            alert(JSON.stringify(week.days));
        };

        return (
            <div className={styles.monthWrapper}>
                {month.weeks.map((week, weekIndex) => (
                    <div key={week.key} className={styles.week} onClick={() => onSelectWeek(week)}>
                        {week.days.map((day, dayIndex) => (
                            <div key={day.key} className={day.month === "current" ? styles.day : styles.dayOther}>
                                {day.value}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    //EFFECTS
    useEffect(() => {
        if (init.current) {
            init.current = false;
        }
    }, []);
    useEffect(() => {
        setMonthStateHtml(createMonthHtml(createMonth(true)));
    }, [year, month]);

    return (
        <>
            <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
                <span>year:{year}</span>
                <span>month:{month}</span>
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
                <span>daysCount:{daysCount}</span>
                <span>firstDayOnWeek:{firstDayOnWeek}</span>
                <span>lastDayOnWeek:{lastDayOnWeek}</span>
            </div>
            {monthStateHtml}
        </>
    );
};

export default Month;
