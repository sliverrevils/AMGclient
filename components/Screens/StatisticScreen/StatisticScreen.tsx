
import { ChartShow } from "@/components/elements/Chart/Chart";
import useChart from "@/hooks/useChart";
import useStatistic from "@/hooks/useStatistic";
import { ChartPatternI, FieldI, StatisticI, UserI } from "@/types/types"
import styles from './statScreen.module.scss';

import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux";

export default function StatisticScreen() {
    const [chartSchema,setChartSchema] = useState<any>({});
    const [selectedPatternId, setSelectedPatternId] = useState(0);
    const [statArr, setStatArr] = useState<Array<StatisticI>>([]);
    const [statArrFiltered, setStatArrFiltered] = useState<Array<StatisticI>>([]);
    const [patterns, setPatterns] = useState<Array<ChartPatternI>>();
    const init = useRef(true);
    const { getUserPatterns } = useChart();
    const { getAllByUserID, getAllUserStatsByChartId } = useStatistic();
    const { user }: { user: UserI } = useSelector((state: any) => state.main);
    const [startAt,setStartAt] =useState('');
    const [endAt,setEndAt] =useState('');

    const DynamicTableOfStats = () => {

        return (
            <table>
                <thead>
                    <th>Дата</th>
                    {
                    patterns?.find(pattern => pattern.id == selectedPatternId)?.fields
                    .map((field,idx:number) => (
                    <th key={Math.random()}>{field.name}</th>
                    ))
                    }
                    <td>Создана</td>
                </thead>
                <tbody >
                    {
                    statArrFiltered
                    //.sort((stat_1,stat_2)=>new Date(+stat_1.dateStart).getTime() - new Date(+stat_2.dateStart).getTime())                    
                    .map((stat,idx:number) => (
                        <tr key={idx+'_statTr'}>
                            <td>{new Date(+stat.dateStart).toLocaleDateString()} - {new Date(+stat.dateEnd).toLocaleDateString()}</td>
                            {
                                stat.fields.map((field: FieldI, idx) =>                             
                                    <td key={idx + '_fieldBody'}>
                                        {field.type === 'number' && field.value}
                                        {field.type === 'select' && Object.keys(field.fieldOptions).find(key=>field.fieldOptions[key]==field.value)}
                                    </td>                                   
                                    
                                )
                            }                                 
                                
                            <td>{new Date(stat.createdAt!).toLocaleString()}</td>
                        </tr>
                        ))
                        }
                </tbody>
            </table>
        )
    }

    useEffect(() => {
        if (init.current) {
            init.current = false;  
            getUserPatterns(user.userId, setPatterns);
        }
    }, []);

    useEffect(() => {
        if (selectedPatternId) { 
            setChartSchema(patterns?.find(pattern => pattern.id == selectedPatternId))
            getAllUserStatsByChartId(selectedPatternId, setStatArr)
        }
        else
            setStatArr([]);
    }, [selectedPatternId]);

    useEffect(()=>{
        setStatArrFiltered(statArr.filter(stat=>(startAt?stat.dateStart>=new Date(startAt).getTime():true)&&(endAt?stat.dateStart<=new Date(endAt).getTime():true)));
    },[startAt,endAt,statArr]);

    useEffect(()=>{console.log('FILTERED', statArrFiltered)},[statArrFiltered])

    return (
        <div className={styles.statsScreenWrapper}>
            <h3>Отображение записей статистики по шаблонам</h3>
            
            <select value={selectedPatternId} onChange={event => setSelectedPatternId(+event.target.value)}>
                <option value={0}>Выбрете шаблн</option>
                {
                    patterns?.map((pattern, idx: number) =>
                        <option key={pattern.id + '_patternOptions'} value={pattern.id}>
                            
                            {pattern.name}
                            
                        </option>
                    )
                }
            </select>  
            
           {
           !!selectedPatternId&&
           <div className={styles.dateRange}>   
                   
                <input type={'date'} value={startAt} onChange={event => setStartAt((event.target.value))} />
                
                <input type={'date'} value={endAt} onChange={event => setEndAt(event.target.value)} />
                <h5>диапазон по начальным датам в записях</h5> 
            </div>
            }
            

            {
            !!(selectedPatternId&&statArrFiltered&&Object.keys(chartSchema).length)&&
            <ChartShow chartSchema={chartSchema}  records={statArrFiltered}/>
            }

            {
                selectedPatternId ? <DynamicTableOfStats  /> : ''
            }
            
        </div>
    )
}