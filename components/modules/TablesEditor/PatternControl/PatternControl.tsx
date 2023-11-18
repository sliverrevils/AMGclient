import useChart from "@/hooks/useChart";
import useStatistic from "@/hooks/useStatistic";
import useUsers from "@/hooks/useUsers";
import { ChartPatternI, FieldI, StatisticI, UserFullI, UserI ,StatisticDataRowI, UserAllPatternsI} from "@/types/types";
import { logicMath } from "@/utils/funcs";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styles from './patternControl.module.scss';
import { StateReduxI } from "@/redux/store";
import { useDispatch } from "react-redux";
import { clearStatsRedux, setColumnsRedux, setInitStatsRowsRedux, setSelectedUserIdRedux } from "@/redux/statsSlice";



export default function PatternControl({
    //setStatisticRowsData,
    setCurrentPattern,
   // setStatisticsArr,
    //setCostumLinesArr
}
    :{
        //setStatisticRowsData:any,
        setCurrentPattern:any,
       // setStatisticsArr:React.Dispatch<React.SetStateAction<StatisticI[]>>,
       // setCostumLinesArr:any
    }) {    
    //--------------------------------------------------------------------------------------VARS
    const groupNames={
        mains:'⭐Главные шаблоны - заполняемые',
        additionals:'✨Дополнительные шаблоны - заполняемые',
        viewMains:'🛂Главные шаблоны - контролируемые',
        viewAdditionals:'🛂Дополнительные шаблоны - контролируемые',
    }

    //--------------------------------------------------------------------------------------STATES🎪
    const [allPatterns, setAllPatterns] = useState<UserAllPatternsI>({additionals:[],mains:[],viewAdditionals:[],viewMains:[],patternsFrom:[]}); //all accessed patterns (admin:all, user: only accessed)
    const [selectedPatternIdState, setSelectedPatternIdState] = useState(0);// selected pattern ID
    const [selectedPatternGroupState, setSelectedPatternGroupState] = useState('');// selected pattern ID
    //const [selectedUserId, setSelectedUserId] = useState<number>();// selected user ID
    const [dateStart,setDateStart]=useState(0);// date start period
    const [dateEnd,setDateEnd]=useState(0);// date end period
    //const [statisticsArr,setStatisticsArr] = useState<StatisticI[]>([]); //originals stats by backend

    //--------------------------------------------------------------------------------------REFS🍔
    const initRef = useRef(true); //first mount this component

    //--------------------------------------------------------------------------------------HOOKS🪡
    const dispatch = useDispatch();
    const { getUserPatterns ,getAllPatterns } = useChart();
    const { getPeriodByUserID } =useStatistic();
    const {users, userByID,userPatterns} = useUsers();
   

    //--------------------------------------------------------------------------------------SELECTORS👇
    const { user }: { user: UserI } = useSelector((state: any) => state.main);
    const { selectedUserId, selectedPatternId }=useSelector((state:StateReduxI)=>state.stats);
    const {initStats, initStatsRows} = useSelector((state:StateReduxI)=>state.stats);
    const {patterns,access} = useSelector((state:StateReduxI)=>state.patterns);

    //--------------------------------------------------------------------------------------FUNCTIONS⚙️

    //find selected pattern by id 
    const currentPattern=(id:number):ChartPatternI|undefined=>patterns.find(pattern=>pattern.id===id);

    //time string to number
    const timeStrToNumber=(timeString:string):number=>timeString?new Date(timeString).getTime():0;
    //time numer to string
    const timeNumberToString=(timeNumber:number):string=>{
        if(!timeNumber){
            return '';
        }
        const date=new Date(timeNumber);
        const year=date.getFullYear();
        const month=date.getMonth()+1;
        const day =date.getDate();        
        const dateString =`${year}-${month<10?`0${month}`:month}-${day<10?`0${day}`:day}`;
        //console.log('date str ',dateString);

        return dateString;
    }

    //on select pattern
    const onSelectPattern=(event:React.ChangeEvent<HTMLSelectElement>)=>{
        //setSelectedUserId(0);//clear selected user
        dispatch(setSelectedUserIdRedux(0));
        setSelectedPatternIdState(+event.target.value);//set local ID pattern
        
    }

    //is admin
    const isAdmin=user.role==='admin';

    //create array of array with all fields with placed data
    const createInitialDataArray=(initialStatisticsArray:StatisticI[]): StatisticDataRowI[][] =>{
        const calcedData= initialStatisticsArray.map((stat, idxStat: number) => ([

            {
                name: 'Период',
                value: new Date(+stat.dateStart).toLocaleDateString() + '\n' + new Date(+stat.dateEnd).toLocaleDateString()
            },
            ...stat.fields.map((field: FieldI) => {
                if (field.type === 'select'){
                    return [
                        {
                            name: field.name + `(текст)`,
                            value: Object.keys(field.fieldOptions).find(key => field.fieldOptions[key] == field.value)
                        }, {
                            name: field.name + `(число)`,
                            value: field.value
                        }
                    ];
                }

                if(field.type === 'number'){
                    return {
                        name: field.name,
                        value:field.value
                    }
                }

                if(field.type === 'view' ){
                    let withEmptyData=(stat.fields as any).some((field: any) => (field.value === null&&!field.fieldLogic));
                    return {
                        name: field.name,
                        value:withEmptyData?'#clear#':+logicMath(field.fieldLogic, stat.fields, idxStat),
                       
                    }
                }


                // return {
                //     name: field.name,
                //     value: (field.type === 'number' && field.value) || (field.type === 'view' && +logicMath(field.fieldLogic, stat.fields, idxStat)) 
                // }
            }).flat(),
            {
                name: 'Примечание',
                value: stat.descriptions||'без описания'
            },
            {
                name: 'Создана',
                value: new Date(stat.createdAt + '').toLocaleString()
            },            
            {
                name: 'Автор',
                value: userByID(stat.created_by)?.name||'пользователь удалён'
            },
            {
                name: 'Обновлена',
                value: stat.updated_by ? `${userByID(stat.updated_by || 0)?.name} : ${new Date(stat.updatedAt + '').toLocaleString()}` : 'не обновлялась'
            },
            {
                name:'id',
                value:stat.id
            },
        ]));
        //setStatisticRowsData(calcedData); //SAVE to GLOBAL
        dispatch(setInitStatsRowsRedux(calcedData));        
        return calcedData
    }



    //get period statistics
    const getStatistics=async()=>{
        //setCostumLinesArr([]); //CLEAR COSTUM LINES ARRAY (LINEAR TREND BUG!)
        await getPeriodByUserID(isAdmin?selectedUserId:user.userId,selectedPatternIdState,dateStart,dateEnd); 


        // if(selectedPatternIdState==selectedPatternId||!initStatsRows.length){
        //     await getPeriodByUserID(isAdmin?selectedUserId:user.userId,selectedPatternIdState,dateStart,dateEnd); //for admin all stats || user only self
        // }else{
        //                                        // ЗАГРУЖАЕТСЯ СО ВТОРОГО РАЗА ПРИ СМЕНЕ ШАБЛОНА
        //     dispatch(clearStatsRedux());
        //      //await getPeriodByUserID(isAdmin?selectedUserId:user.userId,selectedPatternIdState,dateStart,dateEnd); //for admin all stats || user only self

        //     // dispatch(setColumnsRedux([]));


        //     // createInitialDataArray(initStats)
        // }


        //const createdDataArr=createInitialDataArray(statsArr)
        // console.log('📰CREATED DATA ARRAY',createdDataArr);
        //setStatisticsArr(statsArr);
       
        setCurrentPattern(currentPattern(selectedPatternIdState));
    }

    //on Select User

    const onSelectUser=(event:React.ChangeEvent<HTMLSelectElement>)=>{
        //setSelectedUserId(+event.target.value);
        dispatch(setSelectedUserIdRedux(+event.target.value));
    }

    //--------------------------------------------------------------------------------------EFFECTS🦻

    //onMount🐣
    useEffect(() => {        
        if (initRef.current) {
            initRef.current = false;
            //get all patterns for admin || only accessed for user
            // isAdmin?getAllPatterns(setAllPatterns):getUserPatterns(user.userId, setAllPatterns);
           

            setAllPatterns(userPatterns(user.userId));
          //  setAllPatterns(isAdmin?patterns:userPatterns(user.userId))
        }
    }, []);

    useEffect(()=>{
        createInitialDataArray(initStats)
    },[initStats])


    //--------------------------TEST⚙️
    // useEffect(()=>{
    //     console.log('ALL PATTERNS 📈 ',allPatterns);
    // },[allPatterns]);

    // useEffect(()=>{
    //     console.log(`SELECT: 🧞:${selectedUserId}, 🆔📈 ${selectedPatternIdState}, 📈`,currentPattern(selectedPatternIdState))
    // },[selectedUserId,selectedPatternIdState]);

    // useEffect(()=>{
    //     console.log('Dates 📅',dateStart)
    // },[dateStart]);


    return (
        <div className={styles.patternControlBlock}>
            {
                isAdmin
                    ?
                    <select className={styles.selectPattern} value={selectedPatternIdState} onChange={onSelectPattern}>
                        <option value={0}>Выберете шаблон</option>
                        {
                            patterns?.map((pattern, idx: number) =>
                                <option key={pattern.id + '_patternOptions'} value={pattern.id}>
                                    {pattern.name}
                                </option>
                            )
                        }
                    </select>
                    :
                    <>
                        <select className={styles.selectPattern} 
                        value={selectedPatternGroupState}                        
                        onChange={event=>{
                            setSelectedPatternIdState(0);
                            setSelectedPatternGroupState(event.target.value);
                        }
                        }>
                            <option value={''}>Выберете группу шаблонов</option>
                            {
                                Object.keys(allPatterns).map((field, idx: number) =>
                                    <option key={idx + '_patternGroup'} value={field}>
                                        {groupNames[field]}
                                    </option>
                                )
                            }
                        </select>
                        {
                            !!selectedPatternGroupState
                            &&
                            <>
                                <select className={styles.selectPattern} value={selectedPatternIdState} onChange={onSelectPattern}>
                                    <option value={0}>Выберете шаблон</option>
                                    {
                                        allPatterns[selectedPatternGroupState].map((pattern, idx: number) =>
                                            <option key={pattern.id + '_patternOptions'} 
                                            value={pattern.id} 
                                            data-from={`Заполняется в : ${allPatterns.patternsFrom?.[pattern.id]?.join(', ')}`}
                                             title={`Заполняется в : ${allPatterns.patternsFrom?.[pattern.id]?.join(', ')}`}
                                            >
                                                {pattern.name}               
                                            </option>
                                        )
                                    }
                                </select>
                                {
                                    !!selectedPatternIdState
                                    &&
                                    <div className={styles.patternInfo}>
                                        <span>Шаблон заполняется в :</span>
                                        <ul >
                                            {
                                                allPatterns.patternsFrom?.[selectedPatternIdState]?.
                                                map((title)=><li>{title}</li>)
                                            }
                                        </ul>
                                    </div>
                                }
                            </>
                        }
                    </>
            }

            {
                isAdmin&&!!selectedPatternIdState &&
                <select className={styles.selectUser} value={selectedUserId} onChange={onSelectUser}>
                    <option value={0}>Все пользователи</option>
                    {
                        users.filter(user => currentPattern(selectedPatternIdState)?.access.includes(user.id))?.map((user, idx: number) =>
                            <option key={user.id + '_patternOptions'} value={user.id}>
                                {user.name}
                            </option>
                        )
                    }
                </select>
            }
            {!!selectedPatternIdState&&<div className={styles.timePeriodBlock}>               
                <input type="date" value={timeNumberToString(dateStart)} onChange={event=>setDateStart(timeStrToNumber(event.target.value))}  />
                <input type="date" value={timeNumberToString(dateEnd)} onChange={event=>setDateEnd(timeStrToNumber(event.target.value))}  />
            </div>}
           
            {!!selectedPatternIdState&&<div className={`${styles.getStatBtn} noselect`} onClick={getStatistics}>загрузить записи</div>}
            

        </div>
    )
}