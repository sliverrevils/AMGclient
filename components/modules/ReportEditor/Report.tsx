import useChart from '@/hooks/useChart';
import styles from './report.module.scss';
import { useEffect, useRef, useState } from 'react';
import { ChartPatternI, FieldI, StatisticDataRowI, StatisticI, StatisticWithFieldValuesI } from '@/types/types';
import useStatistic from '@/hooks/useStatistic';
import useUsers from '@/hooks/useUsers';
import { logicMath, timeNumberToString, timeStrToNumber } from '@/utils/funcs';
import ReacordsList from './Records/RecordsList';
import Calendar from '@/components/elements/Calendar/Calendar';


export default function Report() {
    //STATES
    const [patterns, setPatterns] = useState<ChartPatternI[]>([]);
    const [selectedPAtternIndex, setSelectedPAtternIndex] = useState<number>(NaN) //NaN- unselect
    const [dateStart, setDateStart] = useState(0);// date start period
    const [dateEnd, setDateEnd] = useState(0);// date end period
    const [statisticsArrState,setStatisticsArrState]=useState<StatisticWithFieldValuesI[]>([]);

    //REFS
    const init = useRef(true);

    //HOOKS
    const { getAllPatterns } = useChart();
    const { getPeriodByUserID } = useStatistic();
    const {userByID} = useUsers();

    //FUNCS

    const createInitialDataArray=(initialStatisticsArray:StatisticI[]): StatisticWithFieldValuesI[]=>{
        const calcedData= initialStatisticsArray.map((stat, idxStat: number) => ({

            ...stat,
            fields:[...stat.fields.map((field: FieldI) => {
                if (field.type === 'select')
                    return [
                        {
                            name: field.name + `(текст)`,
                            value: Object.keys(field.fieldOptions).find(key => field.fieldOptions[key] == field.value)
                        }, {
                            name: field.name + `(число)`,
                            value: field.value
                        }
                    ];
                return {
                    name: field.name,
                    value: (field.type === 'number' && field.value) || (field.type === 'view' && +logicMath(field.fieldLogic, stat.fields, idxStat))
                }
            }).flat()]

    }));
        
        return calcedData
    }

    //get period statistics
    const getStatistics = async () => {
        const statsArr = await getPeriodByUserID(0, patterns[selectedPAtternIndex].id, dateStart, dateEnd); //for admin all stats || user only self
        console.log('🐣STATISTIC INIT DATA ARRAY', statsArr);
        const createdDataArr = createInitialDataArray(statsArr)
        console.log('📰CREATED DATA ARRAY', createdDataArr);
         setStatisticsArrState(statsArr);
        
    }



    //EFFECTS
    useEffect(() => {
        if (init.current) {
            init.current = false;
            getAllPatterns(setPatterns)
        }
    }, [])

    return (
        <div className={styles.raportWrapper}>
            <h5>Report component</h5>

            <select value={selectedPAtternIndex} onChange={event => setSelectedPAtternIndex(+event.target.value)}>
                <option value={NaN}>выбор шаблона</option>
                {
                    patterns.map((pattern, patternIndex) =>
                        <option value={patternIndex} key={pattern.id + 'patternSelect'}>{pattern.name}</option>
                    )
                }
            </select>

            <input type="date" value={timeNumberToString(dateStart)} onChange={event => setDateStart(timeStrToNumber(event.target.value))} />
            <input type="date" value={timeNumberToString(dateEnd)} onChange={event => setDateEnd(timeStrToNumber(event.target.value))} />

            <Calendar/>

            {
                !isNaN(selectedPAtternIndex) &&
                <>
                <button onClick={getStatistics}>загрузить статистику</button>

                    {/* <h6>SELECTED : <pre> {JSON.stringify(patterns[selectedPAtternIndex], null, 2)}</pre></h6> */}                    
                </>
            }

            <ReacordsList rows={statisticsArrState}/>
        </div>
    )
}