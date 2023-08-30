import useTable from "@/hooks/useTable"
import { ChartPatternI, ColumnI, CostumLineI, MenuI, RowI, StatisticDataRowI, TableI, UserI } from "@/types/types"
import { calcTrendColumn, logicMath } from "@/utils/funcs"
import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux";
import { ColumnEditor } from "../ColumnEditor/ColumnEditor";
import styles from './tableView.module.scss';
import Modal from "@/components/elements/Modal/Modal";
import TableBody from "./tableElements/TableBody";
import ColumnItem from "./tableElements/ColumnItem";
import { toast } from "react-toastify";
import { createExelFile } from "@/utils/exelFuncs";



export default function TableView({ statisticRowsData, currentPattern, setIsFullScreenTable, isFullScreenTable, setCostumLinesArr }
    : {
        statisticRowsData: StatisticDataRowI[][],
        currentPattern: ChartPatternI | undefined,
        setIsFullScreenTable: React.Dispatch<React.SetStateAction<boolean>>,
        isFullScreenTable: boolean,
        setCostumLinesArr: React.Dispatch<React.SetStateAction<CostumLineI[]>>

    }) {
    //---STATE
    const [columns, setColumns] = useState<Array<ColumnI>>([]);
    const [rows, setRows] = useState<RowI[][]>([]);
    const [tables, setTabels] = useState<TableI[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number>(0);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
    const [columnMenu, setColumnMenu] = useState<MenuI>({ show: false, position: { x: 0, y: 0 } });
    const [isChangedSelectedTable, setIsChangedSelectedTable] = useState(false);





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
                color: '',
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

        let created: RowI[][] = statisticRowsData.map((rowData, rowIndex) => {

            const newRow = columns.map((column, columnIndex: number) => {
                const sum = /@sum/.test(column.logic);
                const ndchp= /@ndchp/.test(column.logic);

                if (/@trend/.test(column.logic)) {
                    mathTrend = [...new Set([...mathTrend, columnIndex])]
                }

                const mathLogic = column.logic
                    .replaceAll('@sum', '')
                    .replaceAll('@trend', '')
                    .replaceAll('@ndchp', '')

                const resultColumn =
                    sum && rowIndex
                        ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(lastRow[columnIndex].value)
                        : sum
                            ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(column.initValue || 0)
                            : logicMath(mathLogic, rowData, rowIndex, lastRowData);
                // return resultColumn;

                if(ndchp){
                    return {
                        // ID !!
                         key: Math.random(),
                         value: resultColumn<=0?'НД':'ЧП'
                     }
                }

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

        setRows(created);
    }
    // const createTableBody = () => {       
    //     let lastRow;
    //     let lastRowData: any[] = columns.map(column => ({ value: column.initValue || 0 })); // записывает начальное значение по индексу столбца а не поля (сбивается логика при перестановке столбцов)
    //     let mathTrend:null|number=null;    

    //     let created: RowI[][] = statisticRowsData.map((rowData, rowIndex) => {

    //         const newRow = columns.map((column, columnIndex: number) => {
    //             const sum = /@sum/.test(column.logic);
    //             if(mathTrend==null)
    //             mathTrend = /@trend/.test(column.logic)?columnIndex:null;
    //             const mathLogic = column.logic.replaceAll('@sum', '').replaceAll('@trend', '');// clear @sum

    //             const resultColumn =
    //                 sum && rowIndex
    //                     ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(lastRow[columnIndex].value)
    //                     : sum
    //                         ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + (column.initValue || 0)
    //                         : logicMath(mathLogic, rowData, rowIndex, lastRowData);
    //             // return resultColumn;
    //             return {
    //                 key: Math.random(),
    //                 value: resultColumn
    //             }
    //         });
    //         // console.log('NEW ROW', newRow);
    //         lastRowData = [...rowData];
    //         lastRow = [...newRow];
    //         return newRow;
    //     });   


    //         if(mathTrend!== null){
    //             console.log('@TREND',mathTrend);
    //             console.log('CREATED',created);

    //             const trendArr=calcTrendColumn(created.map(row=>Number(row[mathTrend!].value)))
    //             console.log('TREND ARR',trendArr)
    //            created = created.map((row,rowIndex)=>row.map((column,index)=>{
    //                 if(index==mathTrend){
    //                     return {...column,value:trendArr[rowIndex]}
    //                 }else{
    //                     return column
    //                 }
    //             }))
    //         }       

    //     setRows(created);
    // }

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
    const addCostumLine = (name: string, records: number[], color = 'pink') => setCostumLinesArr((state) => [...state, { name, records, color, key: Math.random() }]);

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
            fileName:tables.find(table=>table.id==selectedTableId)?.name||`все поля шаблона "${currentPattern?.name}"`,
            user
        })
    }


    //Table HTML
    const TableHTML = useMemo(() => (
        <table className={styles.table}>
            <thead >
                <tr className={styles.name}>
                    {
                        columns.map((column, indexColumn) =>
                            <ColumnItem key={column.key} {...{ column, setSelectedColumnIndex, indexColumn, setColumnMenu, isNumbersOnColumn, columnToLineOnChart, selectedColumnIndex }} />
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
    ), [columns, rows, selectedColumnIndex]);

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

        {isAdmin && <ColumnEditor  {...{ columns, setColumns, selectedColumnIndex, setSelectedColumnIndex, currentPattern, setTabels, setSelectedTableId, statisticRowsData, columnMenu, setColumnMenu, selectedTableId, isChangedSelectedTable }} />}

        {TableHTML}

    </div>, [tables, columns, rows, selectedColumnIndex, currentPattern, statisticRowsData, columnMenu, selectedTableId, isChangedSelectedTable]);


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
        } else {
            createStartColumnPack(statisticRowsData[0]);
        }
    }, [selectedTableId])

    useEffect(() => { //on change selected table
        if (selectedTableId && tables.length) {
            const isChangedTable = !(JSON.stringify(columns) == JSON.stringify(tables.find(table => table.id == selectedTableId)?.columns))
            console.log('CHANGE', isChangedTable);
            setIsChangedSelectedTable(isChangedTable);
        }
    }, [columns])

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
            : TableBlockHTML
    )
}




