import useStatistic from "@/hooks/useStatistic";
import { timeNumberToString, timeStrToNumber } from "@/utils/funcs";
import { useEffect, useRef, useState } from "react";
import styles from './statcontrol.module.scss';
import { ChartPatternI, FieldI, StatisticI } from "@/types/types";
import useUsers from "@/hooks/useUsers";
import useChart from "@/hooks/useChart";
import Modal from "@/components/elements/Modal/Modal";
import useOrg from "@/hooks/useOrg";




export default function StatisticControl() {

    //STATES
    const [dateStart, setDateStart] = useState(0);// date start period
    const [dateEnd, setDateEnd] = useState(0);// date end period
    const [statsArr, setStatsArr] = useState<Array<StatisticI>>([]);
    const [filteredStatsArr, setFilteredStatsArr] = useState<Array<StatisticI>>([]);
    const [allPatterns, setAllPatterns] = useState<Array<ChartPatternI>>([]); //all accessed patterns (admin:all, user: only accessed)
    const [selectedPatternId, setSelectedPatternId] = useState(0);// selected pattern ID
    const [selectedUserId, setSelectedUserId] = useState(0);// selected user ID
    const [selectedStat, setSelectedStat] = useState<StatisticI | null>(null);

    const [dateStartEditor, setDateStartEditor] = useState<any>();
    const [dateEndEditor, setDateEndEditor] = useState<any>();
    const [chartState, setChartState] = useState<Array<{ name: string, value: string, type: string }>>([]); // !!!!-------type!
    const [descriptionsEditor, setDescriptionsEditor] = useState('');
    const [isFilterBlock,setIsFilterBlock]=useState(false);


    //REFS
    const init = useRef(true);

    //HOOKS
    const { getAllByPeriod, deleteStatById, updateStatistic } = useStatistic();
    const { userByID, users } = useUsers();
    const { getAllPatterns, chartById } = useChart();
    

    //FUNCS
    const onLoadStats = async () => {
        const statsTemp = await getAllByPeriod(dateStart, dateEnd, setStatsArr);
        console.log('LEADED STATS', statsTemp);

    }
    const onSelectPatternFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPatternId(+event.target.value);
    }
    const onSelectUserFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserId(+event.target.value);
    }
    const onSelectStat = (stat: StatisticI) => {
        console.log("SELECT STAT", stat)
        setSelectedStat(stat);
        const currentPattern = allPatterns.find(pattern => pattern.id == stat.chart_id);
        if (currentPattern) {
            setDateStartEditor(stat.dateStart);
            setDateEndEditor(stat.dateEnd);
            setDescriptionsEditor(stat.descriptions || '');
            const stateTemp = currentPattern.fields.map((field, index) => ({ ...field, value: stat.fields[index].value }));
            console.log('STATE TEMP', stateTemp)
            setChartState(stateTemp);
        }
    }

    const changeFieldValue = (elIdx, text) => setChartState(state => state.map((field, idx) => {
        if (idx == elIdx) {
            field.value = text;
            return field;
        } else
            return field;
    }));

    const onUpdateRecord = () => {

        const record = { dateStartEditor, dateEndEditor, fields: [...chartState] };
       
        if (selectedStat)
            updateStatistic(selectedStat.id!, {
                chart_id: selectedStat.chart_id,
                fields: JSON.stringify(record.fields),
                dateStart: dateStartEditor,
                dateEnd: dateEndEditor,
                created_by: selectedStat.created_by,
                descriptions: descriptionsEditor || null
            }).then(() => {
                setSelectedStat(null);
                onLoadStats();
            })
    }

    const onDeleteRecord = () => {
        if (selectedStat) {
            if (confirm('Вы точно хотите удалить запись ?')) {
                deleteStatById(selectedStat.id!, () => onLoadStats()).then(() => {
                    setSelectedStat(null);
                })
            }
        }
    }

    const createEditorHtml = () => {
        if (selectedStat) {
            const currentPattern = allPatterns.find(pattern => pattern.id == selectedStat.chart_id);

            if (!currentPattern) {
                return <div className={styles.statEditorBlock}>
                    <span>Шаблон был удалён</span>
                    <button onClick={onDeleteRecord} className={styles.deleteBtn} >Удалить запись</button>
                    </div>
            }

            return (
                <div className={styles.statEditorBlock}>
                    <div className={styles.patternInfo}>
                        {currentPattern.name || 'удалённый шаблон⚠️'}
                    </div>


                    <div className={styles.field}>
                        <div className={styles.fieldName}>Период</div>
                        <input type={'date'} value={timeNumberToString(+dateStartEditor)} onChange={event => setDateStartEditor(timeStrToNumber(event.target.value))} />
                        <input type={'date'} value={timeNumberToString(+dateEndEditor)} onChange={event => setDateEndEditor(timeStrToNumber(event.target.value))} />
                    </div>

                    {
                        chartState.length &&
                        currentPattern.fields.map((field, idx) => {
                            if (field.type == 'number' || field.type == 'select')
                                return (
                                    <div key={field.name + idx} className={styles.field}>
                                        <div className={styles.fieldName}>{field.name}</div>

                                        {field.type === 'number' && <input type={'number'} value={chartState[idx].value} onChange={event => changeFieldValue(idx, event.target.value)} />}
                                        {field.type === 'select' &&
                                            <select value={chartState[idx].value} onChange={event => changeFieldValue(idx, event.target.value)} >
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
                                )
                        }
                        )
                    }

                    <div className={styles.field}>
                        <div className={styles.fieldName}>Описание</div>
                        <textarea placeholder="Описание" value={descriptionsEditor} onChange={event => setDescriptionsEditor(event.target.value)} />

                    </div>

                    <button onClick={onUpdateRecord} className={styles.updateBtn} >Обновить запись</button>
                    <div className={styles.infoBlock}>
                    <span className={styles.infoDate}>
                            {
                                new Date(selectedStat.createdAt!).toLocaleString()
                            }
                        </span>
                        <span className={styles.infoUser}>                            
                            {
                                userByID(selectedStat.created_by)?.name || 'пользователь удалён'
                            }
                        </span>


                        <span className={styles.infoUpdate}>
                           <span> обновлена :</span>
                            <span>
                                {selectedStat.updatedAt?new Date(selectedStat.updatedAt).toLocaleString():'не обновлялась'}
                            </span>
                            <span>
                            {
                                userByID(selectedStat.updated_by!)?.name || 'не обновлялась'
                            }
                            </span>
                        </span>
                    </div>
                    <button onClick={onDeleteRecord} className={styles.deleteBtn} >Удалить запись</button>
                </div>
            )
        }
    }

    const onCloseFilter=()=>{
        setIsFilterBlock(false);
        setSelectedUserId(0);
        setSelectedPatternId(0);
    }

    //EFFECTS
    //on init
    useEffect(() => {
        if (init.current) {
            init.current = false;
            getAllPatterns(setAllPatterns);
        }
    }, []);

    //on filter
    useEffect(() => {
        if (statsArr.length) {
            let filterTemp: StatisticI[] = [...statsArr];

            if (selectedPatternId) {
                filterTemp = filterTemp.filter(stat => stat.chart_id == selectedPatternId)
            }

            if (selectedUserId) {
                filterTemp = filterTemp.filter(stat => stat.created_by == selectedUserId)
            }
            console.log(filterTemp);
            setFilteredStatsArr(filterTemp);
        }

    }, [statsArr, selectedPatternId, selectedUserId]);


    return (
        <div className={styles.statControlWrapper}>
            {
                selectedStat &&
                <Modal closeModalFunc={() => setSelectedStat(null)} >
                    {createEditorHtml()}
                </Modal>
            }

            <div className={styles.periodBlock}>

                <div className={styles.datesBlock}>
                    <input type="date" value={timeNumberToString(dateStart)} onChange={event => setDateStart(timeStrToNumber(event.target.value))} />
                    <input type="date" value={timeNumberToString(dateEnd)} onChange={event => setDateEnd(timeStrToNumber(event.target.value))} />
                </div>
                <button onClick={onLoadStats}> Загрузить все записи за период</button>
            </div>


            {
                !!statsArr.length &&<>
                {
                    isFilterBlock
                    ? <div className={styles.filterBlock}>

                    <select value={selectedPatternId} onChange={onSelectPatternFilter}>
                        <option value={0}>Выберете шаблон</option>
                        {
                            allPatterns?.map((pattern, idx: number) =>
                                <option key={pattern.id + '_patternOptions'} value={pattern.id}>
                                    {pattern.name}
                                </option>
                            )
                        }
                    </select>

                    <select value={selectedUserId} onChange={onSelectUserFilter}>
                        <option value={0}>Выберете пользователя</option>
                        {
                            users?.map((user, idx: number) =>
                                <option key={user.id + '_userOptions'} value={user.id}>
                                    {user.name}
                                </option>
                            )
                        }
                    </select>

                    <img  src={'/svg/org/close_field_white.svg'} onClick={onCloseFilter}/>


                </div>
                : <img src={'/svg/other/filter_color.svg'} onClick={()=>setIsFilterBlock(true)} className={styles.filterBtn}/>
                }
               
                </>
            }

            {
                !!statsArr.length &&
                <div className={styles.statisticsBlock}>
                    <table>
                        <thead className={styles.tableHead}>
                            <tr>
                                <th>создана</th>
                                <th>период</th>
                                <th>шаблон</th>
                                <th>пользователь</th>
                                <th>описание</th>
                            </tr>

                        </thead>

                        <tbody className={styles.tableBody}>
                            {
                                filteredStatsArr.map((stat, statIndex) =>
                                    <tr onClick={() => onSelectStat(stat)} key={stat.id}>
                                        <td className={styles.createDate}>{new Date(stat.createdAt + '').toLocaleString()}</td>
                                        <th style={{ fontWeight: 500, fontSize: 10 }}>{new Date(+stat.dateStart).toLocaleDateString()} - {new Date(+stat.dateEnd).toLocaleDateString()}</th>
                                        <td>{chartById(allPatterns, stat.chart_id)?.name || 'удалённый шаблон⚠️'}</td>
                                        <td>{userByID(stat.created_by)?.name || 'удалён⚠️'}</td>
                                        <td>{stat.descriptions}</td>
                                    </tr>
                                )
                            }
                        </tbody>

                    </table>

                </div>}

        </div>
    )
}