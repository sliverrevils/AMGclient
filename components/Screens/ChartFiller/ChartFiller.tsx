import useChart from "@/hooks/useChart"
import useStatistic from "@/hooks/useStatistic";
import { ChartPatternI, UserI } from "@/types/types";
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux";

import styles from './chartFiller.module.scss';



export default function ChartFillerScreen() {
    //STATE
    const [patterns, setPatterns] = useState<Array<any>>([]);
    const [selectPatterns, setSelectPatterns] = useState(0);
    const [currentPattern, setCurrentPattern] = useState<ChartPatternI>();
    const [records, setRecords] = useState<any>([]);
    const [dateStart, setDateStart] = useState<any>();
    const [dateEnd, setDateEnd] = useState<any>();
    const [descriptions, setDescriptions] = useState('');
    const [isValid,setIsValid]=useState(false);

    const [chartState, setChartState] = useState<Array<{name:string, value:string, type: string }>>([]); // !!!!-------type!
    //SELECTORS
    const { getUserPatterns } = useChart();
    const { createStatistic } = useStatistic();
    const { user }: { user: UserI } = useSelector((state: any) => state.main)
    const init = useRef(true);
    //FUNCS
    const changeFieldValue = (elIdx, text) => setChartState(state => state.map((field, idx) => {
        if (idx == elIdx) {
            field.value = text;
            return field;
        } else
            return field;
    }));

    const addPointRecord = () => {

        const record = { date: new Date().toLocaleDateString(), fields: [...chartState] };
        
        // alert(JSON.stringify(record, null, 2));
        setRecords(state => ([...state, record]));
        console.log('CHART STATE');
        if (currentPattern && record)
            createStatistic({
                chart_id: currentPattern.id,
                fields: JSON.stringify(record.fields),
                dateStart: new Date(dateStart).getTime(),
                dateEnd: new Date(dateEnd).getTime(),
                created_by: user.userId,
                descriptions:descriptions||null
            }).then(()=>{
                setChartState((state: any) => state.map(field => ({ ...field, value: '' })))// !!! object update !!!
                setDateStart('');
                setDateEnd('');
                setDescriptions('');
            })
    }

    // const validate = (): boolean => {
    //     console.log('CHART STATE' ,chartState);
    //    return !(dateStart && dateEnd && chartState.every(field =>{
    //     let status=true;
    //     if(field.type == 'number' || field.type == 'select'){
    //         status= field.value.length>0
    //     }
    //     return status

    //    }

    //     ));
    // }

    useEffect(() => {
        if (init.current) {
            init.current = false;
            getUserPatterns(user.userId, setPatterns)
        }
    }, []);

    useEffect(()=>{
        if(!dateStart||!dateEnd){
            setIsValid(false);
            return
        }
        if(chartState.length){
            console.log('STATE',chartState)
            setIsValid(chartState.every(field=>(field.type==='view')?true:field.value.length))

        }

    },[chartState,dateEnd,dateStart]);
    useEffect(()=>console.log('VALID',isValid),[isValid]);

    // useEffect(() => { console.log('CURRENT', currentPattern) }, [currentPattern])
    // useEffect(() => { console.log('Date', date) }, [date])

    return (
        <div className={styles.chartFillerWrapper}>
            {/* <h1> Заполнение статистик</h1> */}

            <select value={selectPatterns} onChange={event => {
                setSelectPatterns(+event.target.value);
                console.log('SET', event.target.value)
                setCurrentPattern(patterns[+event.target.value - 1]);
                setChartState(!!event.target.value ? patterns[+event.target.value - 1]?.fields.map(field => ({ ...field, value: '' })) : []);
            }}>
                <option value={0}>Выберите шаблон для заполнения</option>
                {

                    patterns.map((pattern, idx: number) =>
                        <option key={idx + `_patternsOtions`} value={idx + 1}>
                            {pattern.name}
                        </option>
                    )
                }
            </select>


            {
                currentPattern &&
                <div className={styles.pattern}>
                    <div className={styles.field}>
                    <div className={styles.fieldName}>Дата</div>
                        <input type={'date'} value={dateStart} onChange={event => setDateStart(event.target.value)} />
                        <input type={'date'} value={dateEnd} onChange={event => setDateEnd(event.target.value)} />
                    </div>

                        {
                            chartState.length &&
                            currentPattern.fields.map((field, idx) => {
                                if(field.type == 'number' || field.type == 'select')
                                return(
                                <div key={field.name + idx} className={styles.field}>
                                    <div className={styles.fieldName}>{field.name}</div>

                                    {field.type === 'number' && <input type={'number'} value={chartState[idx].value} onChange={event => changeFieldValue(idx, event.target.value)} />}
                                    {field.type === 'select' &&
                                        <select style={{ padding: '5px 20px', margin: 0 }} onChange={event => changeFieldValue(idx, event.target.value)} >
                                            <option value={''}>выбор</option>
                                            {
                                                Object.keys(field.fieldOptions).map((option, idx) =>
                                                    <option key={idx + option} value={field.fieldOptions[option]}>
                                                        {option}
                                                    </option>
                                                )
                                            }
                                        </select>
                                    }

                                </div>
                            )}
                            )
                        }

                    <textarea placeholder="Описание" value={descriptions} onChange={event=>setDescriptions(event.target.value)}/>
                    <button onClick={addPointRecord} className="btn" disabled={!isValid} >Добавить запись</button>
                </div>
            }

            {/* <pre>
                {JSON.stringify(patterns, null, 2)}
            </pre> */}

        </div>
    )
}