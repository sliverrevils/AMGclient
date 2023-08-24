import useStatistic from "@/hooks/useStatistic";
import { timeNumberToString, timeStrToNumber } from "@/utils/funcs";
import { useEffect, useRef, useState } from "react";
import styles from './statcontrol.module.scss';
import { ChartPatternI, StatisticI } from "@/types/types";
import useUsers from "@/hooks/useUsers";
import useChart from "@/hooks/useChart";



export default function StatisticControl() {

    //STATES
    const [dateStart, setDateStart] = useState(0);// date start period
    const [dateEnd, setDateEnd] = useState(0);// date end period
    const [statsArr,setStatsArr] = useState<Array<StatisticI>>([]);
    const [allPatterns, setAllPatterns] = useState<Array<ChartPatternI>>([]); //all accessed patterns (admin:all, user: only accessed)
    const [selectedPatternId, setSelectedPatternId] = useState(0);// selected pattern ID


    //REFS
    const init=useRef(true);

    //HOOKS
    const {getAllByPeriod}=useStatistic();
    const {userByID} = useUsers();
    const {getAllPatterns,chartById} = useChart();

    //FUNCS
    const onLoadStats=async()=>{
        const statsTemp= await getAllByPeriod(dateStart,dateEnd,setStatsArr);
        console.log('LEADED STATS',statsTemp);

    }
    const onSelectPatternFilter=(event:React.ChangeEvent<HTMLSelectElement>)=>{
        setSelectedPatternId(+event.target.value);
    }

    //EFFECTS
    //on init
    useEffect(()=>{
        if(init.current){
            init.current=false;
            getAllPatterns(setAllPatterns);
        }
    },[]);
    //on filter
    

    return (
        <div className={styles.statControlWrapper}>
            
            <div className={styles.periodBlock}>
                <span>Период</span>
                <div className={styles.datesBlock}>
                    <input type="date" value={timeNumberToString(dateStart)} onChange={event => setDateStart(timeStrToNumber(event.target.value))} />
                    <input type="date" value={timeNumberToString(dateEnd)} onChange={event => setDateEnd(timeStrToNumber(event.target.value))} />
                </div>
                <button onClick={onLoadStats}> загрузить</button>
            </div>

            <div>
            <h6>фильтры записей</h6>
            <select className={styles.selectPattern} value={selectedPatternId} onChange={onSelectPatternFilter}>
                <option value={0}>Выберете шаблон</option>
                {
                    allPatterns?.map((pattern, idx: number) =>
                        <option key={pattern.id + '_patternOptions'} value={pattern.id}>
                            {pattern.name}
                        </option>
                    )
                }
            </select>


            </div>

            <div className={styles.statisticsBlock}>
                <h6>список записей</h6>
                {
                    statsArr.map((stat)=>
                        <div className={styles.statisticItem}>
                            <span>{new Date(stat.createdAt + '').toLocaleString()}</span>
                            <span>{chartById(allPatterns, stat.chart_id)?.name}</span>
                            <span>{userByID(stat.created_by)?.name}</span>
                            
                        </div>
                        )
                }

            </div>
        </div>
    )
}