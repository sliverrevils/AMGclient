import useUI from "@/hooks/useUI";
import { StateReduxI } from "@/redux/store";
import { RowI, StatisticI } from "@/types/types";
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from './tableElements.module.scss';
import useStatistic from "@/hooks/useStatistic";
import { timeNumberToString, timeStrToNumber } from "@/utils/funcs";
import useUsers from "@/hooks/useUsers";

export default function TableBody({ 
    //rows,
     setIsFullScreenTable 
    }
    : {
        //rows: RowI[][],
        setIsFullScreenTable: React.Dispatch<React.SetStateAction<boolean>>
    }) {
    //VARS


    //STATE
    const [currentLine, setCurrentLine] = useState<StatisticI | null>(null);
    const [chartState, setChartState] = useState<Array<{ name: string, value: string, type: string }>>([]); // !!!!-------type!

    const [descriptionsEditor, setDescriptionsEditor] = useState('');
    const [selectedLineIndex,setSelectedLineIndex] = useState<number>(9999);

    const [dateStartEditor, setDateStartEditor] = useState<any>();
    const [dateEndEditor, setDateEndEditor] = useState<any>();

    //HOOKS

    const { createMenu } = useUI();
    const { getAllByPeriod, deleteStatById, updateStatistic } = useStatistic();
    const { userByID, users } = useUsers();
    const {getPeriodByUserID} = useStatistic();
    const { createStatistic } = useStatistic();
    

    //SELECTORS
    const { initStats,selectedPatternId,createdRows } = useSelector((state: StateReduxI) => state.stats);
    const { patterns } = useSelector((state: StateReduxI) => state.patterns);
    const {user} = useSelector((state: any)=>state.main);
    



    //FUNCS
    const onFullScreen = (
        //event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
        ) => {
       // event.preventDefault()
        setIsFullScreenTable(true);
    }

    const onSelectRow = (row: any) => {
        console.log('SELECTED ROW', row)
    }

    const currentPatern = () => patterns.find(pattern => pattern.id == currentLine?.chart_id);

    const changeFieldValue = (elIdx, text) => setChartState(state => state.map((field, idx) => {
        if (idx == elIdx) {
            field.value = text;
            return field;
        } else
            return field;
    }));

    const onUpdateRecord = () => {

        const record = { dateStartEditor, dateEndEditor, fields: [...chartState] };

        if (currentLine)
            updateStatistic(currentLine.id!, {
                chart_id: currentLine.chart_id,
                fields: JSON.stringify(record.fields),
                dateStart: dateStartEditor,
                dateEnd: dateEndEditor,
                created_by: currentLine.created_by,
                descriptions: descriptionsEditor || null
            }).then(() => {
                onCloseLineMenu();
                setSelectedLineIndex(9999);
            })
    }

    const onDeleteRecord = () => {
        if (currentLine) {
            if (confirm('Вы точно хотите удалить запись ?')) {
                deleteStatById(currentLine.id!).then(() => {
                    onCloseLineMenu();
                    setSelectedLineIndex(9999);
                })
            }
        }
    }

    //MENU
    const [lineMenu, onOpenLineMenu, onCloseLineMenu, lineMenuStyle] = createMenu();

    const editLineMenuHTML = () => currentLine && (
        <div style={lineMenuStyle} className={styles.lineMenuBlock}>
            <div className={styles.statEditorBlock}>
                <img src={'/svg/org/close_field.svg'} 
                className={styles.close} 
                onClick={()=>{
                    onCloseLineMenu();
                    setSelectedLineIndex(9999);
                }}
                />

                <div className={styles.field}>
                    <div className={styles.fieldName}>Период</div>
                    <input type={'date'} value={timeNumberToString(+dateStartEditor)} onChange={event => setDateStartEditor(timeStrToNumber(event.target.value))} />
                    <input type={'date'} value={timeNumberToString(+dateEndEditor)} onChange={event => setDateEndEditor(timeStrToNumber(event.target.value))} />
                </div>

                {
                    chartState.length &&
                    currentPatern()?.fields.map((field, idx) => {
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
         
                <button onClick={onDeleteRecord} className={styles.deleteBtn} >Удалить запись</button>
               
            </div>
        </div>
    )

    const onEditLine = (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>, rowIndex: number) => {
        setSelectedLineIndex(rowIndex);
        event.preventDefault();
        console.log('EDIT LINE', initStats[rowIndex]);
        setCurrentLine(initStats[rowIndex]);
        setDateStartEditor(initStats[rowIndex].dateStart);
        setDateEndEditor(initStats[rowIndex].dateEnd);
        setDescriptionsEditor(initStats[rowIndex].descriptions || '');
        const stateTemp = initStats[rowIndex].fields.map((field, index) => ({ ...field, value: initStats[rowIndex].fields[index].value }));
        console.log('STATE TEMP', stateTemp);
        setChartState(stateTemp);
        onOpenLineMenu(event);
    }

    const onAddNewLine = ()=>{        
        const pattern=patterns.find(pattern=>pattern.id==selectedPatternId);
        const fields=pattern?.fields.map(field => ({ ...field, value:''}));       

        if (pattern)
            createStatistic({
                chart_id: selectedPatternId,
                fields: JSON.stringify(fields),
                dateStart: new Date().getTime(),
                dateEnd: new Date().getTime(),
                created_by: user.userId,
                descriptions:null,
            },true);
    }

    return (
        <>
            {
                editLineMenuHTML()
            }
            {/* <tr>
            <td onClick={onFullScreen} className={styles.newLineBtn}>🪟</td> 
            </tr> */}
            {
                
                createdRows.map((row, rowIndex) =>
                    <tr
                        key={rowIndex + '_rowBody'}
                        //onContextMenu={onFullScreen}
                        onContextMenu={(event) => onEditLine(event, rowIndex)}
                        onClick={() => onSelectRow(row)}
                        
                    >

                        {
                            row.map((item, itemIndex) =>
                                <td key={item.key} style={selectedLineIndex===rowIndex?{outline:'2px solid #ff8056'}:{}}>
                                    {item.value}
                                    
                                </td>
                            )
                        }
                    </tr>
                )
            }
            <tr>
                <td onClick={onAddNewLine} className={styles.newLineBtn}>добавить</td>
                
            </tr>
        </>
    )
}