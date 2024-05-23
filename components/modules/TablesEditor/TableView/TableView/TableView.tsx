import useTable from "@/hooks/useTable";
import { ChartPatternI, ColumnI, CostumLineI, MenuI, RowI, StatisticDataRowI, TableI, UserI } from "@/types/types";
import { calcTrendColumn, getTextLength, logicMath } from "@/utils/funcs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ColumnEditor } from "../ColumnEditor/ColumnEditor";
import styles from "./tableView.module.scss";
import Modal from "@/components/elements/Modal/Modal";
import TableBody from "./tableElements/TableBody";
import ColumnItem from "./tableElements/ColumnItem";
import { toast } from "react-toastify";
import { createExelFile } from "@/utils/exelFuncs";
import Table from "@/components/elements/Table/Table";
import { linearRegression } from "@/utils/trend";
import { useDispatch } from "react-redux";
import { clearStatsRedux, setColumnsRedux, setCreatedRowsRedux, setLinesRedux, setSelectedTableIdRedux, setTabelsRedux } from "@/redux/statsSlice";
import { StateReduxI } from "@/redux/store";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import useChart from "@/hooks/useChart";
import useOrg from "@/hooks/useOrg";
import EditableTable from "@/components/elements/EditableTable/EditableTable";

export default function TableView({
    //statisticRowsData,
    currentPattern,
    setIsFullScreenTable,
    isFullScreenTable,
}: //setCostumLinesArr,
//costumLinesArr
{
    //statisticRowsData: StatisticDataRowI[][],
    currentPattern: ChartPatternI | undefined;
    setIsFullScreenTable: React.Dispatch<React.SetStateAction<boolean>>;
    isFullScreenTable: boolean;
    //setCostumLinesArr: React.Dispatch<React.SetStateAction<CostumLineI[]>>,
    //costumLinesArr: CostumLineI[]
}) {
    //--VARS
    let descriptionsObj;
    //---STATE
    //const [columns, setColumns] = useState<Array<ColumnI>>([]);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
    const [columnMenu, setColumnMenu] = useState<MenuI>({ show: false, position: { x: 0, y: 0 } });
    const [isChangedSelectedTable, setIsChangedSelectedTable] = useState(false);
    const [columnSizeArr, setColumnSizeArr] = useState<number[]>([]);
    const [fontSize, setFontSize] = useState(13);
    const [isDescriptionsShow, setIsDescriptionsShow] = useState(false);
    const [descriptions, setDescriptions] = useState("");

    //--REF
    const descriptionsRef = useRef();

    //---HOOKS
    const dispatch = useDispatch();
    const { allTablesByPatternId } = useTable();
    const { updatePatternInfo } = useChart();
    const { getOrgFullScheme } = useOrg();

    //---SELECTORS

    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === "admin");
    const user: UserI = useSelector((state: any) => state.main.user);
    const { selectedTableId, createdRows, selectedPatternId } = useSelector((state: StateReduxI) => state.stats);
    const { initStatsRows } = useSelector((state: StateReduxI) => state.stats);
    const { tabels } = useSelector((state: StateReduxI) => state.stats);
    const { columns, lines } = useSelector((state: StateReduxI) => state.stats);

    //---FUNCS

    const onUpdateDescriptions = (textJson: string = "") => {
        if (currentPattern) {
            updatePatternInfo(currentPattern?.id, textJson, getOrgFullScheme);
        }
    };

    //create start columns with all fields
    const createStartColumnPack = (row: StatisticDataRowI[]) => {
        if (row) {
            const createdColumns = row.map((field, fildIndex) => ({
                name: field.name,
                logic: `@${fildIndex + 1}`,
                initValue: null,
                color: "#ff8056",
                key: Math.random(),
            }));
            // setColumns(createdColumns);
            dispatch(setColumnsRedux(createdColumns));
        }
    };

    //create table body rows
    const createTableBody = () => {
        let lastRow;
        let lastRowData: any[] = columns.map((column) => ({ value: column.initValue || 0 })); // записывает начальное значение по индексу столбца а не поля (сбивается логика при перестановке столбцов)
        let mathTrend: number[] = [];
        let ndchp: { value: number; columnIndex: number }[] = [];
        let status: number[] = [];
        let statusReverse: number[] = [];
        let created: RowI[][] = initStatsRows.map((rowData, rowIndex) => {
            let noFullFillData = false;

            const newRow = columns.map((column, columnIndex: number) => {
                const sum = /@sum/.test(column.logic);
                //ndchp= /@ndchp/.test(column.logic)?columnIndex:null;

                if (/@ndchp=-{0,1}\d{1,7}/g.test(column.logic)) {
                    //let str=column.logic.match(/@ndchp=\d{1,5}/g)![0]
                    ndchp = [
                        ...ndchp,
                        {
                            columnIndex,
                            value: Number(column.logic.match(/@ndchp=-{0,1}\d{1,5}/g)![0].split("=")[1]),
                        },
                    ];
                }

                if (/@middle/.test(column.logic)) {
                    mathTrend = [...new Set([...mathTrend, columnIndex])];
                }
                if (/@status/.test(column.logic)) {
                    status = [...new Set([...status, columnIndex])];
                }
                if (/@statReverse/.test(column.logic)) {
                    statusReverse = [...new Set([...statusReverse, columnIndex])];
                }

                const mathLogic = column.logic
                    .replaceAll("@sum", "")
                    .replaceAll("@middle", "")
                    .replaceAll(/@ndchp=-{0,1}\d{1,7}/g, "")
                    .replaceAll("@status", "")
                    .replaceAll("@statReverse", "");

                let resultColumn = sum && rowIndex ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(lastRow[columnIndex].value) : sum ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(column.initValue || 0) : logicMath(mathLogic, rowData, rowIndex, lastRowData);

                if (/#clear#/.test(resultColumn) || Number.isNaN(resultColumn)) {
                    resultColumn = "";
                    noFullFillData = true;
                }

                return {
                    // ID !!
                    key: Math.random(),
                    value: resultColumn,
                };
            });
            // console.log('NEW ROW', newRow);
            lastRowData = [...rowData];
            lastRow = [...newRow];
            return newRow;
        });

        if (status.length) {
            let trendArr: { columnIndex: number; slopeArr: number[] }[] = [];
            // console.log('status📈', status);

            status.forEach((columnIndex) => {
                const columnArr = created.map((row) => row[columnIndex].value);
                const trend = linearRegression(
                    columnArr.map((_, index) => index + 1),
                    columnArr
                );
                // console.log('COLUMN TREND',trend)
                trendArr = [...trendArr, { columnIndex, slopeArr: trend.slopeArr }];
            });

            // console.log('TREND ARR', trendArr);
            trendArr.forEach((trend) => {
                created = created.map((row, rowIndex) =>
                    row.map((column, index) => {
                        if (index == trend.columnIndex) {
                            const currentSlopeValue = trend.slopeArr[rowIndex];
                            return { ...column, value: currentSlopeValue <= 0 ? "Падающая🔻" : "Растущая↗️" };
                        } else {
                            return column;
                        }
                    })
                );

                created;
            });
        }
        //console.log('statusReverse📈', statusReverse);

        if (statusReverse.length) {
            let trendArr: { columnIndex: number; slopeArr: number[] }[] = [];
            //console.log('statusReverse📈', statusReverse)
            statusReverse.forEach((columnIndex) => {
                const columnArr = created.map((row) => row[columnIndex].value);
                const trend = linearRegression(
                    columnArr.map((_, index) => index + 1),
                    columnArr
                );
                // console.log('COLUMN TREND',trend)
                trendArr = [...trendArr, { columnIndex, slopeArr: trend.slopeArr }];
            });

            //console.log('TREND ARR', trendArr);
            trendArr.forEach((trend) => {
                created = created.map((row, rowIndex) =>
                    row.map((column, index) => {
                        if (index == trend.columnIndex) {
                            const currentSlopeValue = trend.slopeArr[rowIndex];
                            return { ...column, value: currentSlopeValue <= 0 ? "Растущая↗️" : "Падающая🔻" };
                        } else {
                            return column;
                        }
                    })
                );
            });
        }

        if (mathTrend.length) {
            mathTrend.forEach((indexColumnTrend) => {
                //create trend array of values columns
                const trendArr = calcTrendColumn(created.map((row) => Number(row[indexColumnTrend].value)));

                //insert trend array values in object
                created = created.map((row, rowIndex) =>
                    row.map((column, index) => {
                        if (index == indexColumnTrend) {
                            return { ...column, value: trendArr[rowIndex] };
                        } else {
                            return column;
                        }
                    })
                );
            });
        }

        if (ndchp.length) {
            created = created.map((row, rowIndex) => {
                return row.map((column, columnIndex) => {
                    const currentNdchp = ndchp.find((ndchpItem) => ndchpItem.columnIndex == columnIndex);
                    if (currentNdchp) {
                        //console.log('NDCHP ', `${column.value} <= ${currentNdchp.value}`, ndchp)
                        return { ...column, value: Number(column.value) <= currentNdchp.value ? "НД 📈" : "ЧП 📉" };
                    }
                    return column;
                });
            });
        }

        created.forEach((row, rowIndex) => {
            // CLEAR STATUS ON BLANK ROWS
            if (row.some((column) => column.value === "")) {
                //  console.log('CLEAR',rowIndex)
                row.forEach((column, columnIndex) => {
                    if (typeof column.value == "string" && column.value.includes("щая")) {
                        created[rowIndex][columnIndex].value = "";
                    }
                });
            }
        });
        dispatch(setCreatedRowsRedux(created));
    };

    //on select table
    const onSelectTable = (event: React.ChangeEvent<HTMLSelectElement>) => {
        //setSelectedTableId(+event.target.value);
        dispatch(setSelectedTableIdRedux(+event.target.value));
    };

    //create exel file
    const onCreateExelFile = () => {
        if (createdRows.length)
            createExelFile({
                columns,
                rows: createdRows,
                fileName: (tabels.find((table) => table.id == selectedTableId)?.name || `все поля шаблона "${currentPattern?.name}" `) + "_" + new Date().toLocaleDateString(),
                user,
                columnSizeArr,
            });
    };

    //Table HTML
    const TableHTML = useMemo(() => {
        //console.log('SIZES IN MEMO',columnSizeArr)
        return (
            <table className={styles.table}>
                <thead>
                    <tr className={styles.name}>
                        {columns.map((column, indexColumn) => {
                            return <ColumnItem key={column.key + "_column"} {...{ column, setSelectedColumnIndex, indexColumn, setColumnMenu, selectedColumnIndex, sizeBlock: columnSizeArr[indexColumn] }} />;
                        })}
                    </tr>
                    <tr className={styles.initValue}>
                        {columns.map((column, indexColumn) => (
                            <th key={indexColumn + "init_val"}>{column.initValue || " "}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    <TableBody
                        {...{
                            setIsFullScreenTable,
                        }}
                    />
                </tbody>
            </table>
        );
    }, [columns, createdRows, selectedColumnIndex, columnSizeArr]);

    //table block HTML

    const TableBlockHTML = useMemo(
        () => (
            <div className={styles.tableViewBlock}>
                {isDescriptionsShow && (
                    <div className={styles.descriptionsBlock}>
                        <div className={styles.close} onClick={() => setIsDescriptionsShow(false)}>
                            ❌
                        </div>
                        {/* <ReactQuill value={descriptions} onChange={setDescriptions} readOnly={!isAdmin} theme={isAdmin?"snow":"bubble"} /> */}

                        {isAdmin && currentPattern?.descriptions != descriptions && (
                            <div onClick={() => onUpdateDescriptions()} className={styles.descriptionsUpdate}>
                                Обновить описание
                            </div>
                        )}

                        <EditableTable saveFunc={onUpdateDescriptions} descriptionsStr={currentPattern?.descriptions || ""} />
                    </div>
                )}

                <select className={styles.selectTables} value={JSON.stringify(selectedTableId)} onChange={onSelectTable}>
                    {(isAdmin || !tabels.length) && <option value={0}>все поля записей</option>}
                    {tabels.map((table, indexTable) => (
                        <option key={indexTable + "_tableSelect"} value={table.id}>
                            {table.name}
                        </option>
                    ))}
                </select>

                {isAdmin && (
                    <ColumnEditor
                        {...{
                            columns,
                            //setColumns,
                            selectedColumnIndex,
                            setSelectedColumnIndex,
                            currentPattern,
                            columnMenu,
                            setColumnMenu,
                            selectedTableId,
                            isChangedSelectedTable,
                            //costumLinesArr
                        }}
                    />
                )}

                <div className={styles.tablesBtns}>
                    <div className="noselect" onClick={() => setIsFullScreenTable(true)}>
                        🪟
                    </div>
                    <div className="noselect" onClick={() => setIsDescriptionsShow((state) => !state)}>
                        📑
                    </div>
                    <div className={`${styles.exelFileBtn} noselect`} onClick={onCreateExelFile}>
                        <img src="svg/other/file_white.svg" />
                        <span>Exel</span>
                    </div>
                </div>

                {/* {currentPattern?.descriptions&&<div className={styles.descriptions}>                
                {currentPattern?.descriptions}
            </div> } */}

                {TableHTML}
            </div>
        ),
        [
            tabels,
            columns,
            createdRows,
            selectedColumnIndex,
            currentPattern,
            //statisticRowsData,
            columnMenu,
            selectedTableId,
            isChangedSelectedTable,
            columnSizeArr,
            isDescriptionsShow,
            descriptions,
        ]
    );

    const calcColumnSize = (charSize: number) => {
        let tempColumsSizesArr: number[] = [];
        columns.forEach((column, columnIndex) => {
            tempColumsSizesArr = [...tempColumsSizesArr, getTextLength(column.name, charSize)];
        });
        createdRows.forEach((row) =>
            row.forEach((rowItem, columnIndex) => {
                let rowItemLength = getTextLength(rowItem.value + "", charSize);
                if (tempColumsSizesArr[columnIndex] < rowItemLength) {
                    tempColumsSizesArr[columnIndex] = rowItemLength;
                }
            })
        );
        //console.log('CALC size',tempColumsSizesArr);
        //setColumnSizeArr(tempColumsSizesArr);
        return tempColumsSizesArr;
    };

    //----EFFECTS 🎊🎉✨

    useEffect(() => {
        //CREATE HEAD COLUMNS & BODY DATA OR UPDATE BODY DATA
        if (initStatsRows.length) {
            allTablesByPatternId(); //load from server data

            if (columns.length) {
                //
                createTableBody(); // update body data
            } else {
                createStartColumnPack(initStatsRows[0]); //create all field column
            }
            //createStartColumnPack(initStatsRows[0]); //create columns by type first row in data
            //dispatch(setSelectedTableIdRedux(0))// ----------------------------------drop selected table ❌📅! ! ! !
            setSelectedColumnIndex(null); // drop selected column
        }
    }, [initStatsRows]);

    useEffect(() => {
        //CREATE BODY ROWS 🧥 AFTER CREATING COLUMNS 🤯!
        if (columns.length) {
            createTableBody();
        }
    }, [columns]);

    useEffect(() => {
        //ON SELECT TABLE 👇📰

        const table = tabels.find((table) => table.id == selectedTableId);
        setSelectedColumnIndex(null); //drop selected column index
        if (table) {
            dispatch(setColumnsRedux(table.columns));
            dispatch(setLinesRedux(table.costumLines));
            // console.log('TABLE', table);
        } else {
            if (isAdmin) {
                dispatch(setSelectedTableIdRedux(0));
                createStartColumnPack(initStatsRows[0]);
            } else {
                if (tabels.at(-1)?.id) {
                    dispatch(setSelectedTableIdRedux(tabels.at(-1)?.id || 0));
                } else {
                    dispatch(setSelectedTableIdRedux(0));
                    createStartColumnPack(initStatsRows[0]);
                }
            }
        }
    }, [selectedTableId, tabels]);

    useEffect(() => {
        //on change selected table
        if (selectedTableId && tabels.length) {
            const isChangedTable = !(JSON.stringify(columns) == JSON.stringify(tabels.find((table) => table.id == selectedTableId)?.columns)) || !(JSON.stringify(lines) == JSON.stringify(tabels.find((table) => table.id == selectedTableId)?.costumLines));

            //console.log('CHANGE', { lines: JSON.stringify(lines), tabeLines: JSON.stringify(tabels.find(table => table.id == selectedTableId)?.costumLines) });
            setIsChangedSelectedTable(isChangedTable);
        }
    }, [columns, lines]);

    useEffect(() => {
        //on complete table - calc width of columns
        if (columns.length && createdRows.length) {
            const tempSizes = calcColumnSize(fontSize);
            setColumnSizeArr(tempSizes);
            // console.log('CALC TEXT LENGTH NOW 🧮', tempSizes)
        }
    }, [columns, createdRows, fontSize]);

    //--test
    // useEffect(() => {
    //    console.log('COLUMNS',columns);
    // }, [tables,columns,rows])

    useEffect(() => {
        return () => {
            console.log("CLOSE");
            dispatch(clearStatsRedux());
        };
    }, []);

    useEffect(() => {
        //let descriptionsObj;

        setDescriptions(isAdmin ? currentPattern?.descriptions || "" : currentPattern?.descriptions || "без описания");
    }, [currentPattern]);

    //---RETURN JSX
    // if (selec) {
    //     return <h5>нет записей для построения таблицы</h5>
    // }
    if (selectedPatternId)
        return isFullScreenTable ? (
            <Modal fullWidth={true} closeModalFunc={() => setIsFullScreenTable(false)}>
                {TableBlockHTML}
            </Modal>
        ) : (
            //:<Table {...{columns,rows}}/>
            TableBlockHTML
        );
    else return <></>;
}
