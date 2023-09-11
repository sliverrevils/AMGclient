import { ColumnI, RowI } from '@/types/types';
import styles from './table.module.scss';
import { useEffect, useMemo, useRef, useState } from 'react';


export default function Table({ columns, rows }: { columns: ColumnI[], rows: RowI[][] }) {
    //STATE
    const [columnSizeArr,setColumnSizeArr]=useState<number[]>([]);
    const [fontSize,setFontSize]=useState(12);

    //REF
    const init=useRef(true);

    const getTextLength=(text:string,charSize:number):number=>{
        const el=document.createElement('span');
            el.style.fontSize=(charSize+1)+'px';
            // el.style.height='auto';
            // el.style.width='auto';
            // el.style.position='absolute';
            // el.style.whiteSpace='no-wrap'
            el.innerText=text;
            document.body.append(el);
            const length=Number(el.offsetWidth);
            el.remove()
            return length;

    }

    const calcColumnSize=(charSize:number)=>{
        let tempColumsSizesArr: number[]=[];
        columns.forEach((column,columnIndex)=>{
            tempColumsSizesArr=[...tempColumsSizesArr,getTextLength(column.name,charSize)];                      
        });
        rows.forEach(row=>row.forEach((rowItem,columnIndex)=>{
            let rowItemLength=getTextLength(rowItem.value+'',charSize);
            if(tempColumsSizesArr[columnIndex]<rowItemLength){
                tempColumsSizesArr[columnIndex]=rowItemLength;
            }
        }))
        console.log(tempColumsSizesArr);
        setColumnSizeArr(tempColumsSizesArr);
    }
    //HEAD
    const tableHead = useMemo(() => {
        return columns.map((column, indexColumn) => (
            <div
                className={styles.column}
                key={column.key}
                style={{
                    width: columnSizeArr[indexColumn],
                    fontSize:fontSize
                }}
            >
                <span>
                {column.name}
                </span>
            </div>
        ))
    }, [columns,columnSizeArr]);
    //BODY
    const tableBody = useMemo(() => {
        //ROWS
        return rows.map((row, rowIndex) =>
            <div key={rowIndex + '_rowBody'} className={styles.tableRow} >

                {
                    //ITEMS
                    row.map((item, itemIndex) =>
                        <div
                            key={item.key}
                            className={styles.tableRowItem}
                            style={{
                                width: columnSizeArr[itemIndex],
                                fontSize
                            }}>
                            <span>
                                {item.value}
                            </span>
                        </div>
                    )
                }
            </div>
        )
    }, [rows,columnSizeArr,fontSize])

    const onMouseEnter=(event: React.MouseEvent<HTMLInputElement, MouseEvent>)=>{
        console.log('ENTER',event)
        window.document.body.style.overflow = "hidden";
        console.log('ENTER',window.document.body.style.overflow)
        
    }

    useEffect(()=>{
        if(columns.length&&rows.length){
            init.current=false;
            calcColumnSize(fontSize);            
        }
    },[columns,rows,fontSize])


    return (
        <>
        <div className={styles.tableSettings}>
            <input 
            type='number' 
            value={fontSize} 
            onChange={(event)=>setFontSize(Number(event.target.value))}
            onMouseEnter={onMouseEnter}
            
            />

        </div>
        <div className={styles.tableWrap}>
          {!!columnSizeArr.length&&<> 
                <div className={styles.tableHead}>
                    {tableHead}
                </div>
                <div className={styles.tableBody}>
                    {tableBody}
                </div>
            </>
            }
        </div>
        </>
    )
}