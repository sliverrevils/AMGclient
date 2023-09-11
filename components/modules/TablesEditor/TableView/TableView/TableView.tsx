import useTable from "@/hooks/useTable"
import { ChartPatternI, ColumnI, CostumLineI, MenuI, RowI, StatisticDataRowI, TableI, UserI } from "@/types/types"
import { calcTrendColumn, getTextLength, logicMath } from "@/utils/funcs"
import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux";
import { ColumnEditor } from "../ColumnEditor/ColumnEditor";
import styles from './tableView.module.scss';
import Modal from "@/components/elements/Modal/Modal";
import TableBody from "./tableElements/TableBody";
import ColumnItem from "./tableElements/ColumnItem";
import { toast } from "react-toastify";
import { createExelFile } from "@/utils/exelFuncs";
import Table from "@/components/elements/Table/Table";
import { linearRegression } from "@/utils/trend";



export default function TableView({ statisticRowsData, currentPattern, setIsFullScreenTable, isFullScreenTable, setCostumLinesArr, costumLinesArr }
    : {
        statisticRowsData: StatisticDataRowI[][],
        currentPattern: ChartPatternI | undefined,
        setIsFullScreenTable: React.Dispatch<React.SetStateAction<boolean>>,
        isFullScreenTable: boolean,
        setCostumLinesArr: React.Dispatch<React.SetStateAction<CostumLineI[]>>,
        costumLinesArr:CostumLineI[]

    }) {
    //---STATE
    const [columns, setColumns] = useState<Array<ColumnI>>([]);
    const [rows, setRows] = useState<RowI[][]>([]);
    const [tables, setTabels] = useState<TableI[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number>(0);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
    const [columnMenu, setColumnMenu] = useState<MenuI>({ show: false, position: { x: 0, y: 0 } });
    const [isChangedSelectedTable, setIsChangedSelectedTable] = useState(false);
    const [columnSizeArr,setColumnSizeArr]=useState<number[]>([]);
    const [fontSize,setFontSize]=useState(13);





    //---HOOKS
    const { allTablesByPatternId } = useTable();

    //---SELECTORS

    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === 'admin');
    const user:UserI=useSelector((state:any)=>state.main.user);

    //---FUNCS

    //create start columns with all fields
    const createStartColumnPack = (row: StatisticDataRowI[]) => {
        
        if (row) {
            const createdColumns = row.map((field, fildIndex) => ({
                name: field.name,
                logic: `@${fildIndex + 1}`,
                initValue: null,
                color: '#ff8056',
                key: Math.random()
            }));
            setColumns(createdColumns);
        }
    }

    //get tables
    const getTables = () => {
        if (currentPattern) {
            allTablesByPatternId(currentPattern.id, setTabels);
        }

    }

    //create table body rows
    const createTableBody = () => {
        let lastRow;
        let lastRowData: any[] = columns.map(column => ({ value: column.initValue || 0 })); // записывает начальное значение по индексу столбца а не поля (сбивается логика при перестановке столбцов)
        let mathTrend: number[] = [];
        let ndchp:{value:number,columnIndex:number}[]=[];
        let status:number[]=[];
        let statusReverse:number[]=[];
        

        let created: RowI[][] = statisticRowsData.map((rowData, rowIndex) => {

            const newRow = columns.map((column, columnIndex: number) => {
                const sum = /@sum/.test(column.logic);
                //ndchp= /@ndchp/.test(column.logic)?columnIndex:null;
                
                if(/@ndchp=-{0,1}\d{1,7}/g.test(column.logic)){
                    //let str=column.logic.match(/@ndchp=\d{1,5}/g)![0]
                    ndchp=[...ndchp,{
                        columnIndex,
                        value:Number(column.logic.match(/@ndchp=-{0,1}\d{1,5}/g)![0].split('=')[1])
                    }]
                }

                if (/@middle/.test(column.logic)) {
                    mathTrend = [...new Set([...mathTrend, columnIndex])]
                }
                if (/@status/.test(column.logic)) {
                    status = [...new Set([...status,columnIndex])]
                }
                if (/@statReverse/.test(column.logic)) {
                    statusReverse = [...new Set([...statusReverse,columnIndex])]
                }

                const mathLogic = column.logic
                    .replaceAll('@sum', '')
                    .replaceAll('@middle', '')
                    .replaceAll(/@ndchp=-{0,1}\d{1,7}/g,'')
                    .replaceAll('@status', '')
                    .replaceAll('@statReverse', '')

                const resultColumn =
                    sum && rowIndex
                        ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(lastRow[columnIndex].value)
                        : sum
                            ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(column.initValue || 0)
                            : logicMath(mathLogic, rowData, rowIndex, lastRowData);
                // return resultColumn;
                //console.log('RES COL',resultColumn)


                return {
                   // ID !!
                    key: Math.random(),
                    value: resultColumn
                }
            });
            // console.log('NEW ROW', newRow);
            lastRowData = [...rowData];
            lastRow = [...newRow];
            return newRow;
        });

        if(status.length){
            let trendArr:{columnIndex:number,slopeArr:number[]}[]=[];
            console.log('STATUS',status)
            status.forEach(columnIndex=>{
               const columnArr = created.map(row=>row[columnIndex].value);
               const trend=linearRegression(columnArr.map((_,index)=>index+1),columnArr);
              // console.log('COLUMN TREND',trend)
                trendArr=[...trendArr,{columnIndex,slopeArr:trend.slopeArr}];
            });

            console.log('TREND ARR',trendArr);
            trendArr.forEach(trend=>{

                created = created.map((row, rowIndex) => row.map((column, index) => {
                    if (index == trend.columnIndex) {
                        const currentSlopeValue=trend.slopeArr[rowIndex]
                        return { ...column, value: currentSlopeValue<=0?"Падающая🔻":"Ростущая↗️" }
                    } else {
                        return column
                    }
                }))
                
            })


        }

        if(statusReverse.length){
            let trendArr:{columnIndex:number,slopeArr:number[]}[]=[];
            console.log('STATUS',status)
            statusReverse.forEach(columnIndex=>{
               const columnArr = created.map(row=>row[columnIndex].value);
               const trend=linearRegression(columnArr.map((_,index)=>index+1),columnArr);
              // console.log('COLUMN TREND',trend)
                trendArr=[...trendArr,{columnIndex,slopeArr:trend.slopeArr}];
            });

            console.log('TREND ARR',trendArr);
            trendArr.forEach(trend=>{

                created = created.map((row, rowIndex) => row.map((column, index) => {
                    if (index == trend.columnIndex) {
                        const currentSlopeValue=trend.slopeArr[rowIndex]
                        return { ...column, value: currentSlopeValue<0?"Ростущая↗️":"Падающая🔻" }
                    } else {
                        return column
                    }
                }))
                
            })


        }


        if (mathTrend.length) {

            mathTrend.forEach(indexColumnTrend => {
                //create trend array of values columns
                const trendArr = calcTrendColumn(created.map(row => Number(row[indexColumnTrend].value)))

                //insert trend array values in object
                created = created.map((row, rowIndex) => row.map((column, index) => {
                    if (index == indexColumnTrend) {
                        return { ...column, value: trendArr[rowIndex] }
                    } else {
                        return column
                    }
                }))

            })
        }

        if(ndchp.length){
           created = created.map((row,rowIndex)=>{
               return row.map((column,columnIndex)=>{
                const currentNdchp=ndchp.find(ndchpItem=>ndchpItem.columnIndex==columnIndex)
                if(currentNdchp){
                    console.log('NDCHP ',`${column.value} <= ${currentNdchp.value}`,ndchp)
                    return {...column,value:Number(column.value)<=currentNdchp.value?"НД 📈":"ЧП 📉"};
                }
                return column
               })
            })
        }

        setRows(created);
    }

    //on select table
    const onSelectTable = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTableId(+event.target.value);
    }

    //is numbers column ?
    const isNumbersOnColumn = (costumSelectColumn?: number) => {
        if (costumSelectColumn) {
            return rows.every(row => !isNaN(Number(row[costumSelectColumn].value)));
        }
        if (selectedColumnIndex !== null) {
            return rows.every(row => !isNaN(Number(row[selectedColumnIndex].value)));
        }
        return false
    }

    //add costum line to array
    const addCostumLine = (name: string, records: number[], color = '#ff8056') => setCostumLinesArr((state) => [...state, { name, records, color, key: Math.random(),trend:false }]);

    //show costumLine on chart
    const columnToLineOnChart = (costumSelectColumn: number) => {
        if (costumSelectColumn) {
            if (isNumbersOnColumn(costumSelectColumn)) {
                toast.success(`Колонка "${columns[costumSelectColumn].name}" выведена на график`)
                addCostumLine(columns[costumSelectColumn].name, rows.map(column => Number(column[costumSelectColumn].value)), columns[costumSelectColumn].color);

            }
            else
                toast.warning(`Данные колонки не являются числовыми !`);

            return
        }
    }
    //create exel file
    const onCreateExelFile=()=>{
        createExelFile({
            columns,
            rows,
            fileName:(tables.find(table=>table.id==selectedTableId)?.name||`все поля шаблона "${currentPattern?.name}" `)+'_'+new Date().toLocaleDateString(),
            user,
            columnSizeArr
        })
    }




    //Table HTML
    const TableHTML = useMemo(() => (
        <table className={styles.table}>
            <thead >
                <tr className={styles.name}>
                    {
                        columns.map((column, indexColumn) =>
                            <ColumnItem key={column.key} {...{ column, setSelectedColumnIndex, indexColumn, setColumnMenu, isNumbersOnColumn, columnToLineOnChart, selectedColumnIndex , sizeBlock:columnSizeArr[indexColumn]}} />
                        )
                    }
                </tr>
                <tr className={styles.initValue}>
                    {columns.map((column, indexColumn) => <th key={indexColumn + 'init_val'}>{column.initValue || ' '}</th>)}
                </tr>
            </thead>

            <tbody>
                <TableBody {...{ rows, setIsFullScreenTable }} />
            </tbody>

            <tfoot>
                <tr>
                    <td >                        
                        <div onClick={onCreateExelFile} className={styles.exelFileBtn}>                            
                            <img src="svg/other/file_white.svg"/>
                            <span>Exel</span>
                            </div>
                        </td>
                </tr>
            </tfoot>

        </table>
    )
    , [columns, rows, selectedColumnIndex,columnSizeArr]);

    //table block HTML

    const TableBlockHTML = useMemo(() => <div className={styles.tableViewBlock}>

        <select className={styles.selectTables} value={JSON.stringify(selectedTableId)} onChange={onSelectTable} >
            <option value={0}>все поля записей</option>
            {
                tables.map((table, indexTable) => <option key={indexTable + '_tableSelect'} value={table.id}>
                    {table.name}
                </option>
                )}
        </select>

        {isAdmin && <ColumnEditor  {...{ columns, setColumns, selectedColumnIndex, setSelectedColumnIndex, currentPattern, setTabels, setSelectedTableId, statisticRowsData, columnMenu, setColumnMenu, selectedTableId, isChangedSelectedTable, costumLinesArr }} />}

        {TableHTML}

    </div>, [tables, columns, rows, selectedColumnIndex, currentPattern, statisticRowsData, columnMenu, selectedTableId, isChangedSelectedTable]);




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
        //console.log('CALC size',tempColumsSizesArr);
        setColumnSizeArr(tempColumsSizesArr);
    }

    //----EFFECTS 🎊🎉✨

    useEffect(() => { //CREATE HEAD COLUMNS🤯
        if (statisticRowsData.length) {
            createStartColumnPack(statisticRowsData[0]); //create columns by type first row in data            
            // console.log('ROW', statisticRowsData[0]);
            setSelectedTableId(0);// drop selected table
            setSelectedColumnIndex(null);// drop selected column
            getTables();
        }
    }, [statisticRowsData]);

    useEffect(() => { //CREATE BODY ROWS 🧥 AFTER CREATING COLUMNS 🤯!
        if (columns.length) {
            createTableBody();
        }
    }, [columns])


    useEffect(() => { //ON SELECT TABLE 👇📰     
        const table = tables.find(table => table.id == selectedTableId);
        setSelectedColumnIndex(null);//drop selected column index
        if (table) {
            setColumns([...table.columns]);
            console.log('TABLE',table);
            setCostumLinesArr(table.costumLines);
        } else {
            createStartColumnPack(statisticRowsData[0]);
            setCostumLinesArr([]);
        }
    }, [selectedTableId])

    useEffect(() => { //on change selected table
        if (selectedTableId && tables.length) {
            const isChangedTable = !(JSON.stringify(columns) == JSON.stringify(tables.find(table => table.id == selectedTableId)?.columns))
            console.log('CHANGE', isChangedTable);
            setIsChangedSelectedTable(isChangedTable);
        }
    }, [columns])

    useEffect(()=>{ //on complete table - calc width of columns
        if(columns.length&&rows.length){            
            calcColumnSize(fontSize);   
           // console.log('CALC TEXT LENGTH NOW 🧮')        
        }
    },[columns,rows,fontSize])

    //--test
    // useEffect(() => {
    //    console.log('COLUMNS',columns);
    // }, [tables,columns,rows])




    //---RETURN JSX
    if (!statisticRowsData.length) {
        return <h5>нет записей для построения таблицы</h5>
    }

    return (
        isFullScreenTable
            ? <Modal fullWidth={true} closeModalFunc={() => setIsFullScreenTable(false)}>
                {TableBlockHTML}
            </Modal>
            //:<Table {...{columns,rows}}/>
            : TableBlockHTML
    )
}




