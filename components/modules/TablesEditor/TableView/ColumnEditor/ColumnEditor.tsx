import useTable from "@/hooks/useTable";
import { ChartPatternI, ColumnI, CostumLineI, MenuI, StatisticDataRowI, TableI } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import LogicMenu from "../LogicMenu/LogicMenu";
import styles from './columnEditor.module.scss';


export function ColumnEditor({ columns, 
    selectedColumnIndex, 
    setSelectedColumnIndex, 
    setColumns, 
    currentPattern, 
    setTabels, 
    setSelectedTableId, 
    statisticRowsData,
    columnMenu,
    setColumnMenu,
    selectedTableId,
    isChangedSelectedTable,
    costumLinesArr,
}
    : {
        columns: ColumnI[],
        selectedColumnIndex: number | null,
        setSelectedColumnIndex: React.Dispatch<React.SetStateAction<number | null>>,
        setColumns: React.Dispatch<React.SetStateAction<ColumnI[]>>,
        currentPattern:ChartPatternI|undefined,
        setTabels:React.Dispatch<React.SetStateAction<TableI[]>>,
        setSelectedTableId:React.Dispatch<React.SetStateAction<number>>,
        statisticRowsData:StatisticDataRowI[][],
        columnMenu:MenuI,
        setColumnMenu :React.Dispatch<React.SetStateAction<MenuI>>,
        selectedTableId:number,
        isChangedSelectedTable:boolean,
        costumLinesArr:CostumLineI[],
    }
) {
    //---STATE
    const [nameColumn, setNameColumn] = useState('');
    const [logicColumn, setLogicColumn] = useState('');
    const [initValueColumn, setInitValueColumn] = useState('');
    const [colorColumn, setColorColumn] = useState('');
    const [nameTable,setNameTable]=useState('');
    const [logicMenu,setlogicMenu]=useState<MenuI>({show:false,position:{x:0,y:0}});   
    const [isSaveTableBlock,setIsSaveTableBlock]=useState(false);
    

    //---SELECTORS
    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === 'admin');

    //---HOOKS
    const { createTable, deleteTable } = useTable();

    //---FUNCTIONS
    //create new column
    const createNewColumn = () => {
        setColumns(state => [...state, { name: 'Новая колонка', logic: '', color: 'green', initValue: null, key: Math.random() }]);
        setSelectedColumnIndex(columns.length);// set selected column last index
    };

    //delete selected column
    const onDeleteColumn = () => {
        if(confirm('Вы точно хотите удалть колонку с таблицы ?')){
            setSelectedColumnIndex(null);
            setColumns(state => state.filter((columnState, columnIndex: number) => columnIndex !== selectedColumnIndex));
        }

    };

    //disable selected on column
    const onSelectDisable=()=>{
        setColumnMenu(state=>({...state,show:false}));
        setlogicMenu(state=>({...state,show:false}));
        setSelectedColumnIndex(null);

    }

    //column move next
    const onMoveNext=()=>{        
        if(selectedColumnIndex!==null&&selectedColumnIndex!==columns.length-1){
            console.log('MOVE NEXT')
            const tempColumns=[...columns];
            tempColumns[selectedColumnIndex]=columns[selectedColumnIndex+1];
            tempColumns[selectedColumnIndex+1]=columns[selectedColumnIndex];
            setColumns(tempColumns);           
            setSelectedColumnIndex((state:any)=>state+1);
        }
    }
    //column move prev
    const onMovePrev=()=>{        
        if(selectedColumnIndex!==null&&selectedColumnIndex!==0){
            console.log('MOVE PREV')
            const tempColumns=[...columns];
            tempColumns[selectedColumnIndex]=columns[selectedColumnIndex-1];
            tempColumns[selectedColumnIndex-1]=columns[selectedColumnIndex];
            setColumns(tempColumns);            
            setSelectedColumnIndex((state: any) => state - 1);
        }
    }

    //update selected column
    const onUpdateColumn = () => {
        setColumns(state => state.map((columnState, columnIndex) =>
            columnIndex === selectedColumnIndex
                ? { ...columnState, name: nameColumn, logic: logicColumn, color: colorColumn, initValue: +initValueColumn }
                : columnState
        ));
        onSelectDisable();
    }

    //save table
    const onSaveTable = async () => {
        setIsSaveTableBlock(false);
        setNameTable('');
        setSelectedColumnIndex(null); 
        const tabelsWithCreated = await createTable(nameTable, currentPattern?.id, columns, costumLinesArr);
        if (tabelsWithCreated.length) {
            setTabels(tabelsWithCreated)
            setSelectedTableId(tabelsWithCreated[tabelsWithCreated.length - 1].id)
        }
    }

    //delete table
    const onDeleteTable=async()=>{
        if(confirm(`Вы точно хотите удалить таблицу "${currentPattern?.name}" ?`)){
            setSelectedColumnIndex(null);
            const resTables=await deleteTable(selectedTableId,currentPattern?.id);
            if(resTables.length){
                setTabels(resTables);
                setSelectedTableId(0);
            }
        }

    }

    //logic context menu   

    const onLogicContext=(event:React.MouseEvent<HTMLInputElement, MouseEvent>)=>{
        event.preventDefault();  
              
        setlogicMenu(state=>({
            show:!state.show,
            position:{
                x:event.clientX,
                y:event.clientY
            }
        }));       
        
    }

    const ColumnMenuHTML=useMemo(()=>(
        selectedColumnIndex !== null &&columnMenu.show&& <div 
        className={styles.editColumnBlock}
        onContextMenu={event=>event.preventDefault()}
        style={{
            position:'fixed',
            top:columnMenu.position.y+'px',
            left:columnMenu.position.x+'px',
            }}
          >
                 <img src="svg/org/close_field.svg" onClick={onSelectDisable} className={styles.close} />
                <div className={styles.inputsBlock}>
                {<LogicMenu {...{statisticRowsData,setLogicColumn,logicMenu,setlogicMenu}}/>}
                    <span className={styles.help}>Название колоки</span>
                    <input type="text" value={nameColumn} onChange={event => setNameColumn(event.target.value)} />
                    <span className={styles.help}>Начальное значение</span>
                    <input type="number" value={initValueColumn} onChange={event => setInitValueColumn(event.target.value)} />
                    <span className={styles.help}>Логика просчёта</span>
                    <input type="text" value={logicColumn} onChange={event => setLogicColumn(event.target.value)} onContextMenu={onLogicContext} />
                    <span className={styles.help}>Цвет</span>
                    <input type="color" value={colorColumn} onChange={event => setColorColumn(event.target.value)} />
                </div>
                <div className={styles.buttonsBlock}>
                    <div onClick={onMovePrev} className="noselect">⬅️</div>
                    <div onClick={onMoveNext} className="noselect">➡️</div>
                    <div onClick={onUpdateColumn} className="noselect">🔁</div>
                    <div onClick={onDeleteColumn} className="noselect">❌</div>                                        
                        
                    
                </div>
        </div>
    ),[selectedColumnIndex,columnMenu,nameColumn,initValueColumn,logicColumn,colorColumn, logicMenu]);

    //---EFFECTS
    useEffect(() => {// on select column
        if (selectedColumnIndex !== null && columns.length) {
            setNameColumn(columns[selectedColumnIndex].name);
            setLogicColumn(columns[selectedColumnIndex].logic);
            setColorColumn(columns[selectedColumnIndex].color);
            setInitValueColumn(columns[selectedColumnIndex].initValue===null?'0':columns[selectedColumnIndex].initValue+'');
        }
    }, [columns, selectedColumnIndex]);

    useEffect(()=>{ //on change table
        setIsSaveTableBlock(false); //disable save block
    },[selectedTableId]);

   

    // useEffect(()=>{// on select pattern
    //     if(currentPattern){           
    //         setNameTable(currentPattern.name)
    //     }

    // },[currentPattern])

    return (
        <div className={styles.columnEditorBlock}>  
 
            
            {         
                ColumnMenuHTML
            }
             {!isSaveTableBlock&&<div className={styles.addColumnBtn} onClick={createNewColumn}>Добавить новую колонку</div>}
            {
                isSaveTableBlock
                    ? <div className={styles.saveTableBlock}>
                        <input type="text" value={nameTable} onChange={event => setNameTable(event.target.value)} placeholder="название таблицы" />
                        <button className={styles.confirmSaveTableBtn} onClick={onSaveTable} disabled={nameTable.length<3}>сохраниь таблицу</button>
                        <button className={styles.cancelSaveTableBtn} onClick={()=>setIsSaveTableBlock(false)} >отмена</button>
                    </div>
                    : (isChangedSelectedTable||!selectedTableId)&&<div className={styles.saveTableBtn} onClick={()=>setIsSaveTableBlock(true)}>Сохранить новую таблицу</div>
            }
            {
                !isChangedSelectedTable && !isSaveTableBlock && !!selectedTableId &&
                <div className={styles.deleteTableBtn} onClick={onDeleteTable}>удалить таблицу</div>
            }

           
        </div>
    )
}