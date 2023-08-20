
import { useEffect, useState } from 'react';
import styles from './calendar.module.scss';
import { monthes } from '@/utils/vars';
import Month from './Month';

interface MonthInfoI{
    daysCount:number,
    firstDayOnWeek:number,
    lastDayOnWeek:number
}


export default function Calendar(){
    //STATES
    const [year,setYear]=useState(new Date().getFullYear());
    const [month,setMonth] = useState(new Date().getMonth()+1);
    const [day,setDay] =useState(new Date().getDate());

    //VARS


    //FUNCS




    //EFFECTS
    useEffect(()=>{

    },[year,month])



    return (
        <div className={styles.calendarWrapper}>
            <span>
                yaer:
                <select  value={year} onChange={event=>setYear(+event.target.value)} >
                    {
                        new Array(new Date().getFullYear() - 2006).fill('').map((_, index) =>
                            <option >
                                {new Date().getFullYear() - index}
                            </option>
                        )
                    }
                </select>
            </span>
            <span>
                month:
                <select value={month} onChange={event=>setMonth(+event.target.value)}>
                    {
                        monthes.map((month, index) =>
                            <option value={month.value} key={month.value + index}>
                               {month.value}:{month.title}
                            </option>
                        )
                    }
                </select>
            </span>
            <span>{new Date(year,month)+''}</span>
            <Month {...{year,month}}/>
        </div>
    )
}