import { ColumnI, MenuI } from "@/types/types";

import styles from './tableElements.module.scss';
import { useEffect } from "react";


export default function ColumnItem({ column, indexColumn, setSelectedColumnIndex, setColumnMenu,isNumbersOnColumn,columnToLineOnChart, selectedColumnIndex }
    :{ 
        column: ColumnI, 
        indexColumn: number, 
        setSelectedColumnIndex: any 
        setColumnMenu :React.Dispatch<React.SetStateAction<MenuI>>,
        isNumbersOnColumn: (costumSelectColumn?: number) => boolean,
        columnToLineOnChart:(costumSelectColumn: number) => void,
        selectedColumnIndex:null|number
    }) {

    const onPickColumn = () => {
        // setSelectedColumnIndex(state=>null);
        // setSelectedColumnIndex(state=>indexColumn);
      //  alert(`${isNumbersOnColumn(indexColumn)}`);
     // setSelectedColumnIndex(indexColumn);
        columnToLineOnChart(indexColumn);
    }

    const onContextMenu=(event:React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>)=>{
        event.preventDefault();              
        setSelectedColumnIndex(indexColumn);
        setColumnMenu(state=>({...state,show:false}));
        setTimeout(()=>{
            setColumnMenu({
                show:true,
                position:{
                    x:event.clientX,
                    y:event.clientY
                }
                
            })
        },0)

    }

   // useEffect(()=>{console.log('SELECT COLUMN',selectedColumnIndex,indexColumn)},[selectedColumnIndex])

    return (
        <th
            onClick={onPickColumn}
            onContextMenu={onContextMenu}
            className={selectedColumnIndex==indexColumn?styles.selectedColumn:''}
            style={
               {...(column.color
                    ? { background: `linear-gradient(0deg, ${column.color} 0%,  #FF8056 80%)`, color: 'white' }
                    : {background:'#FF8056',color:'white'}),
                    cursor:'pointer'
                }
            }>
            <div >{column.name}</div>
        </th>
    )
}