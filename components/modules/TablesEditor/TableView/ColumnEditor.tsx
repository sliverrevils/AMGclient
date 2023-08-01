import useTable from "@/hooks/useTable";
import { ChartPatternI, ColumnI, TableI } from "@/types/types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function ColumnEditor({ columns, selectedColumnIndex, setSelectedColumnIndex, setColumns, currentPattern ,setTabels ,setSelectedTableId}
    : {
        columns: ColumnI[],
        selectedColumnIndex: number | null,
        setSelectedColumnIndex: React.Dispatch<React.SetStateAction<number | null>>,
        setColumns: React.Dispatch<React.SetStateAction<ColumnI[]>>,
        currentPattern:ChartPatternI|undefined,
        setTabels:React.Dispatch<React.SetStateAction<TableI[]>>,
        setSelectedTableId:React.Dispatch<React.SetStateAction<number>>
    }
) {
    //---STATE
    const [nameColumn, setNameColumn] = useState('');
    const [logicColumn, setLogicColumn] = useState('');
    const [initValueColumn, setInitValueColumn] = useState('');
    const [colorColumn, setColorColumn] = useState('');
    const [nameTable,setNameTable]=useState('');

    //---SELECTORS
    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === 'admin');

    //---HOOKS
    const { createTable } = useTable();

    //---FUNCTIONS
    //create new column
    const createNewColumn = () => {
        setColumns(state => [...state, { name: 'Новая колонка', logic: '', color: 'green', initValue: null, key: Math.random() }]);
        setSelectedColumnIndex(columns.length);// set selected column last index
    };

    //delete selected column
    const onDeleteColumn = () => {
        setSelectedColumnIndex(null);
        setColumns(state => state.filter((columnState, columnIndex: number) => columnIndex !== selectedColumnIndex));
    };

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
            setSelectedColumnIndex((state:any)=>state-1);
        }
    }

    //update selected column
    const onUpdateColumn = () => setColumns(state => state.map((columnState,columnIndex) => 
    columnIndex===selectedColumnIndex
    ?{...columnState,name:nameColumn,logic:logicColumn,color:colorColumn,initValue:+initValueColumn}
    :columnState
    ));

    //save table
    const onSaveTable=async()=>{       
        setNameTable('');
        setSelectedColumnIndex(null);
        const tabelsWithCreated= await createTable(nameTable,currentPattern?.id,columns);
        if(tabelsWithCreated.length){
            setTabels(tabelsWithCreated)
            setSelectedTableId(tabelsWithCreated[tabelsWithCreated.length-1].id)
        }
    }

    //---EFFECTS
    useEffect(() => {// on select column
        if (selectedColumnIndex !== null && columns.length) {
            setNameColumn(columns[selectedColumnIndex].name);
            setLogicColumn(columns[selectedColumnIndex].logic);
            setColorColumn(columns[selectedColumnIndex].color);
            setInitValueColumn(columns[selectedColumnIndex].initValue===null?'0':columns[selectedColumnIndex].initValue+'');
        }
    }, [columns, selectedColumnIndex]);

    useEffect(()=>{// on select pattern
        if(currentPattern){           
            setNameTable(currentPattern.name)
        }

    },[currentPattern])

    return (
        <div>
            <h6>редактор таблицы</h6>
            <input type="text" value={nameTable} onChange={event=>setNameTable(event.target.value)}/>
            <button onClick={onSaveTable}>сохраниь таблицу</button>
            <button onClick={createNewColumn}>новая колонка</button>
            {
                selectedColumnIndex !== null &&
                <div>
                    <input type="text" value={nameColumn} onChange={event => setNameColumn(event.target.value)} />
                    <input type="number" value={initValueColumn} onChange={event => setInitValueColumn(event.target.value)} />
                    <input type="text" value={logicColumn} onChange={event => setLogicColumn(event.target.value)} />
                    <input type="color" value={colorColumn} onChange={event => setColorColumn(event.target.value)} />
                    <button onClick={onMovePrev}>⬅️</button>
                    <button onClick={onMoveNext}>➡️</button>
                    <button onClick={onDeleteColumn}>удалить колонку</button>
                    <button onClick={onUpdateColumn}>обновить колонку</button>

                    
                </div>
            }
        </div>
    )
}