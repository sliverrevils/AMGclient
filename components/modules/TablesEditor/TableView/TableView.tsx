import useTable from "@/hooks/useTable"
import { ChartPatternI, ColumnI, RowI, StatisticDataRowI, TableI } from "@/types/types"
import { logicMath } from "@/utils/funcs"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { ColumnEditor } from "./ColumnEditor";


export default function TableView({ statisticRowsData, currentPattern }: { statisticRowsData: StatisticDataRowI[][], currentPattern: ChartPatternI | undefined }) {
    //---STATE
    const [columns, setColumns] = useState<Array<ColumnI>>([]);
    const [rows, setRows] = useState<RowI[][]>([]);
    const [tables, setTabels] = useState<TableI[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number>(0);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);

    //---HOOKS
    const { allTablesByPatternId } = useTable();

    //---SELECTORS

    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === 'admin');

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


        const created: RowI[][] = statisticRowsData.map((rowData, rowIndex) => {
            const newRow = columns.map((column, columnIndex: number) => {
                const sum = /@sum/.test(column.logic);
                const mathLogic = column.logic.replaceAll('@sum', '');// clear @sum
                const resultColumn =
                    sum && rowIndex
                        ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(lastRow[columnIndex].value)
                        : sum
                            ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + (column.initValue || 0)
                            : logicMath(mathLogic, rowData, rowIndex, lastRowData);
                // return resultColumn;
                return {
                    key: Math.random(),
                    value: resultColumn
                }
            });
            // console.log('NEW ROW', newRow);
            lastRowData = [...rowData];
            lastRow = [...newRow];
            return newRow;
        });      
        setRows(created);
    }

    //on select table
    const onSelectTable = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTableId(+event.target.value);
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
        } else {
            createStartColumnPack(statisticRowsData[0]);
        }
    }, [selectedTableId])

    //--test
    useEffect(() => {
       console.log('COLUMNS',columns);
    }, [tables,columns,rows])


    //---RETURN JSX
    if (!statisticRowsData.length) {
        return <h5>нет записей для построения таблицы</h5>
    }

    return (
        <div>
            <h4>Admin {isAdmin + ''}</h4>
            <select value={JSON.stringify(selectedTableId)} onChange={onSelectTable}>
                <option value={0}>все поля записей</option>
                {
                    tables.map((table, indexTable) => <option key={indexTable + '_tableSelect'} value={table.id}>
                        {table.name}
                    </option>
                    )}
            </select>

            {isAdmin&&<ColumnEditor  {...{ columns, setColumns, selectedColumnIndex, setSelectedColumnIndex ,currentPattern, setTabels, setSelectedTableId}} />}

            <table>
                <thead>
                    <tr>
                        {columns.map((column, indexColumn) => <ColumnItem key={column.key} {...{ column, setSelectedColumnIndex, indexColumn }} />)}
                    </tr>
                    <tr>                        
                        {columns.map((column, indexColumn) => <th key={indexColumn+'init_val'}>{column.initValue||0}</th>)}
                    </tr>
                </thead>

                <tbody>
                    <TableBody {...{ rows }} />
                </tbody>

            </table>
        </div>
    )
}

function ColumnItem({ column, indexColumn, setSelectedColumnIndex }: { column: ColumnI, indexColumn: number, setSelectedColumnIndex: any }) {

    const onPickColumn = () => {
        setSelectedColumnIndex(indexColumn);
    }
    return (
        <th onClick={onPickColumn}>
            <span>{column.name}</span>
        </th>
    )
}

function TableBody({ rows }: { rows: RowI[][] }) {
    return (
        <>
            {
                rows.map((row, rowIndex) =>
                    <tr key={rowIndex + '_rowBody'}>
                        {row.map((item, itemIndex) =>
                            <td key={item.key}>
                                {item.value}
                            </td>
                        )}
                    </tr>
                )
            }
        </>
    )
}
