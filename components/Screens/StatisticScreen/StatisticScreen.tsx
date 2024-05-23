import { ChartShow } from "@/components/elements/Chart/Chart";
import useChart from "@/hooks/useChart";
import useStatistic from "@/hooks/useStatistic";
import { ChartPatternI, FieldI, StatisticI, UserI } from "@/types/types";
import styles from "./statScreen.module.scss";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { MultiLinesChart } from "@/components/elements/Chart/MultilineChart";
import useUsers from "@/hooks/useUsers";
import { logicMath } from "@/utils/funcs";
import Modal from "@/components/elements/Modal/Modal";
import useTable from "@/hooks/useTable";
import { toast } from "react-toastify";
import { setTimeout } from "timers";

interface StatisticDataRowI {
    name: string;
    value: number | string;
}

interface EditorRowI {
    name: string;
    logic: string;
    initValue: number | null;
    color: string;
}

interface TableI {
    id: number;
    name: string;
    createdAt: string;
    created_by: number;
    view_pattern_id: number;
    columns: EditorRowI[];
}

export default function StatisticScreen() {
    const initTableRef = useRef(true);
    const [chartSchema, setChartSchema] = useState<any>({});
    const [selectedPatternId, setSelectedPatternId] = useState(0);
    const [selectedTableId, setSelectedTableId] = useState<number | undefined>();
    const [statArr, setStatArr] = useState<Array<StatisticI>>([]);
    const [statArrFiltered, setStatArrFiltered] = useState<Array<StatisticI>>([]);
    const [patterns, setPatterns] = useState<Array<ChartPatternI>>();
    const [tables, setTables] = useState<Array<TableI>>([]);
    const init = useRef(true);
    const { getUserPatterns } = useChart();
    const { allTablesByPatternId, createTable } = useTable();
    const { getAllByUserID, getAllUserStatsByChartId } = useStatistic();
    const { user }: { user: UserI } = useSelector((state: any) => state.main);
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [modalTable, setModalTable] = useState(false);
    const [showTableEditor, setShowTableEditor] = useState(false);

    //TABLE EDITOR STATE
    const [editorColumns, setEditorColumns] = useState<Array<EditorRowI>>([]);
    const [costumLinesArr, setCostumLinesArr] = useState<Array<any>>([]);
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

    //ADMIN CONTROL
    const [isAdmin] = useState(user.role === "admin");

    //dev
    // useEffect(() => { console.log('📊', { editorColumns, costumLinesArr }) }, [editorColumns]) // SAVE THIS ON BACK

    //created  FOR pattern ID
    const [createdForId, setCreatedForId] = useState<number | undefined>();
    const createdForIdRef = useRef(true);

    //----------------------------------------------------------------------------------------------------------------TABLE EDITOR COMPONENT
    const DynamicTableOfStats = ({ modal = false }: { modal: boolean }) => {
        const currentPattern: ChartPatternI | undefined = patterns?.find((pattern) => pattern.id == selectedPatternId);
        const { userByID } = useUsers();
        const [createdTableBody, setCreatedTableBody] = useState<Array<Array<number | string>>>([]);
        const [columnEditorName, setColumnEditorName] = useState("");
        const [columnEditorLogic, setColumnEditorLogic] = useState("");
        const [columnEditorInitialValue, setColumnEditorInitialValue] = useState("");
        const [columnEditorColor, setColumnEditorColor] = useState("");
        //-------------------------------------------------------TATISTIC DATA----- прсчёт полей

        const [statisticRowsData, setStatisticRowsData] = useState<Array<StatisticDataRowI[]>>(
            statArrFiltered.map((stat, idxStat: number) => [
                {
                    name: "Период",
                    value: new Date(+stat.dateStart).toLocaleDateString() + "/" + new Date(+stat.dateEnd).toLocaleDateString(),
                },
                ...stat.fields
                    .map((field: FieldI) => {
                        if (field.type === "select")
                            return [
                                {
                                    name: field.name + `(текст)`,
                                    value: Object.keys(field.fieldOptions).find((key) => field.fieldOptions[key] == field.value),
                                },
                                {
                                    name: field.name + `(число)`,
                                    value: field.value,
                                },
                            ];

                        return {
                            name: field.name,
                            value: (field.type === "number" && field.value) || (field.type === "view" && logicMath(field.fieldLogic, stat.fields, idxStat)),
                        };
                    })
                    .flat(),
                {
                    name: "Примечание",
                    value: stat.descriptions || "без описания",
                },
                {
                    name: "Создана",
                    value: new Date(stat.createdAt + "").toLocaleString(),
                },
                {
                    name: "Автор",
                    value: userByID(stat.created_by)?.name,
                },
                {
                    name: "Обновлена",
                    value: stat.updated_by ? `${userByID(stat.updated_by || 0)?.name} : ${new Date(stat.updatedAt + "").toLocaleString()}` : "не обновлялась",
                },
            ])
        );

        //------------------------------------------------------------------------------------ADD NEW COLUMN

        //funcs
        const addEditorColumn = (name = "Новая колонка", logic = "", color = "", initValue = null) => {
            setEditorColumns((state) => [...state, { name, logic, color, initValue }]); //------------------------------------------!!! MUST SET COLOR & INIT VALUE ON CREATE !!!!
        };

        //------------------------------------------------------------------------------------INITIAL COLUMNS  CREATING FUNC----------------------⚙️

        //-------------------------CREATE INIT COLUMNS FUNC ➡️⚙️
        const createInitTableEditor = () => {
            if (!!statisticRowsData.length) {
                console.log("CREATING ALL COLUMNS⚙️", statisticRowsData);
                setEditorColumns(
                    statisticRowsData[0].map((row, columnIndex: number) => ({
                        name: row.name,
                        logic: `@${columnIndex + 1}`,
                        initValue: null,
                        color: "",
                    }))
                );
            }
        };

        // useEffect(() => { editorColumns.length && console.log('⚙️📊', editorColumns) }, [editorColumns])// LOG

        //--------------------------------------------------------------------------------------MATH BUTTONS----
        const mathArr = [
            {
                name: "Индекс строки",
                value: "@index",
            },
            {
                name: "Суммировать данные столбца ",
                value: "@sum",
            },
        ];

        //------------------------------------------------ -------------------------------COSTUM LINES funcs---
        const addCostumLine = (name: string, records: number[], color = "pink") => setCostumLinesArr((state: any[]) => [...state, { name, records, color }]); // ADD LINE TO CHART

        //----------------------------------------------------------------------------------------------------------------- COLUMN EDITOR---
        useEffect(() => {
            //SELECTED COLUMN EDITOR VALUES
            if (selectedColumn !== null && editorColumns.length) {
                setColumnEditorName(editorColumns[selectedColumn].name);
                setColumnEditorLogic(editorColumns[selectedColumn].logic);
                setColumnEditorInitialValue(editorColumns[selectedColumn].initValue + "");
                setColumnEditorColor(editorColumns[selectedColumn].color);
            }
        }, [selectedColumn]);

        //editor column funcs
        const saveColumn = () => {
            setEditorColumns((state) =>
                state.map((column, index: number) => {
                    if (index === selectedColumn) {
                        return {
                            name: columnEditorName,
                            logic: columnEditorLogic,
                            color: columnEditorColor,
                            initValue: +columnEditorInitialValue || null,
                        };
                    }
                    return column;
                })
            );
        };

        const deleteColumn = () => {
            if (selectedColumn !== null && confirm(`Вы точно хотите удалить колонку "${editorColumns[selectedColumn].name}" ?`)) {
                setEditorColumns((state) => state.filter((column, index) => index !== selectedColumn));
                setSelectedColumn(null);
            }
        };

        const columnMoveNext = () => {
            if (selectedColumn !== null && selectedColumn !== editorColumns.length - 1) {
                let newArr = [...editorColumns];
                newArr[selectedColumn] = editorColumns[selectedColumn + 1];
                newArr[selectedColumn + 1] = editorColumns[selectedColumn];
                setEditorColumns(newArr);
                setSelectedColumn((state: any) => state + 1);
            }
        };
        const columnMovePrev = () => {
            if (selectedColumn !== null && selectedColumn !== 0) {
                let newArr = [...editorColumns];
                newArr[selectedColumn] = editorColumns[selectedColumn - 1];
                newArr[selectedColumn - 1] = editorColumns[selectedColumn];
                setEditorColumns(newArr);
                setSelectedColumn((state: any) => state - 1);
            }
        };

        const isNumbersOnColumn = (costumSelectColumn?: number) => {
            if (costumSelectColumn) {
                return createdTableBody.every((row) => !isNaN(Number(row[costumSelectColumn])));
            }
            if (selectedColumn !== null) {
                return createdTableBody.every((row) => !isNaN(Number(row[selectedColumn])));
            }
            return false;
        };

        const columnToLineOnChart = (costumSelectColumn?: number) => {
            //---------------CREATE AND ADD  LINE TO CHART 📈
            console.log("COSTUM SELECT", costumSelectColumn);
            if (costumSelectColumn) {
                console.log("SELECTED LINE", editorColumns[costumSelectColumn]);
                if (isNumbersOnColumn(costumSelectColumn))
                    addCostumLine(
                        editorColumns[costumSelectColumn].name,
                        createdTableBody.map((row) => Number(row[costumSelectColumn])),
                        editorColumns[costumSelectColumn].color
                    );
                else toast.warning(`Данные колонки не являются числовыми !`);

                return;
            }

            if (selectedColumn !== null) {
                addCostumLine(
                    columnEditorName,
                    createdTableBody.map((row) => Number(row[selectedColumn])),
                    columnEditorColor
                );
                return;
            }
        };

        //---------------------------------------------------------ROW CALC MENU

        const [showLogicMenu, setShowLogicMenu] = useState(false);
        const optionsMenuRef = useRef<HTMLDivElement>(null);

        //menu html
        const optionsMenu = (
            <div className={styles.optionsMenu} ref={optionsMenuRef} style={{ display: showLogicMenu ? "flex" : "none" }}>
                {!!statisticRowsData.length &&
                    statisticRowsData[0].map((statRow, statColumnIndex: number) => (
                        <div className={styles.optionItem} key={statRow.name + statColumnIndex}>
                            <span
                                onClick={() => {
                                    setColumnEditorLogic((state) => state + ` @@${statColumnIndex + 1}`);
                                    setShowLogicMenu(false);
                                }}
                            >
                                ⏮️
                            </span>
                            <span
                                onClick={() => {
                                    setColumnEditorLogic((state) => state + ` @${statColumnIndex + 1}`);
                                    setShowLogicMenu(false);
                                }}
                            >
                                ▶️{statRow.name}
                            </span>
                        </div>
                    ))}

                {mathArr.map((math, index) => (
                    <div
                        key={index + math.value}
                        className={styles.optionItem}
                        onClick={() => {
                            setColumnEditorLogic((state) => state + math.value);
                            setShowLogicMenu(false);
                        }}
                    >
                        <span className={styles.math}>{math.name}</span>
                    </div>
                ))}
            </div>
        );

        //menu open func
        const logicMenu = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
            event.preventDefault();

            console.log("MOUSE EVENT", event);
            setShowLogicMenu((state) => !state);
            if (optionsMenuRef.current !== null) {
                optionsMenuRef.current.style.display = "flex";
                optionsMenuRef.current.style.top = event.clientY + "px";
                optionsMenuRef.current.style.left = event.clientX + "px";
                console.log(`X:${event.clientX} _ Y:${event.clientY}`);
            }
        };

        //---------------------------------------------------------------------------------------------------------COLUMN HEAD COMPONENTS
        const columnMenuRef = useRef<HTMLDivElement>(null); // --- MENU COLUMN REF

        const NameColumnItem = (column: EditorRowI, index: number) => {
            //COLUMNS -  NAMES ROW
            const [nameInput, setNameInput] = useState(column.name);
            const saveNewName = () =>
                setEditorColumns((state) => {
                    const temp = [...state];
                    temp[index].name = nameInput;
                    return temp;
                });

            return (
                <th
                    className={`${styles.generatedColumn} ${index === selectedColumn ? styles.selectedColumn : ""}`}
                    key={Math.random()}
                    onClick={(event) => {
                        // --------------------------------------------------------------------- OPEN COLUMN RB MENU------- !!!
                        event.preventDefault();
                        setSelectedColumn(index);
                        columnMenuRef.current!.style.top = event.clientY + "px";
                        columnMenuRef.current!.style.left = event.clientX + "px";
                    }}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        columnToLineOnChart(index);
                    }}
                >
                    <div className={styles.infoWrap}>
                        {/* <input type="text" value={nameInput} onChange={(event)=>setNameInput(event.target.value)} />
                    {column.name !== nameInput && <button onClick={saveNewName}>✅</button>} */}
                        <span>{column.name}</span>
                    </div>
                </th>
            );
        };

        const InitialValueRowItem = (column: EditorRowI, index: number) => {
            //INIT VALUE ROW
            let init = column.initValue == null ? "" : column.initValue + "";
            const [input, setInput] = useState(init);

            const saveNewInitValue = () =>
                setEditorColumns((state) => {
                    const temp = [...state];
                    temp[index].initValue = +input;
                    return temp;
                });

            return (
                <th className={styles.initValues}>
                    <div style={{ display: "flex2", width: "100%" }}>
                        <input
                            type="number"
                            value={input + ""}
                            onChange={({ target: { value } }) => setInput(value)}
                            onKeyDown={(event) => {
                                event.code == "Enter" && saveNewInitValue();
                            }}
                        />
                        {init != input && <button onClick={saveNewInitValue}>✅</button>}

                        {/* <span>{column.initValue||'пусто'}</span> */}
                    </div>
                </th>
            );
        };

        //-------------------------------------------------------------------------------SAVE SHEMA VIEW TABLE--------------
        const [newTableName, setNewTableName] = useState("");
        const saveTableView = () => {
            createTable(newTableName, selectedPatternId, editorColumns, setTables);
        };

        //-------------------------------------------------------------- ПЕРЕДЕЛАТЬ НЕ НА ЭФФЕКТАХ !!!!!

        //--------------------------------------------------------------------------------CREATE TABLE PROCESS---- (initial data to  {name, value})
        useEffect(() => {
            //------------------------------------- ON FIRST

            if (statisticRowsData.length && editorColumns.length && !createdTableBody.length) {
                console.log("CREATEING TABLE BODY💪💪💪💪💪💪💪💪💪");
                let lastRow;
                let lastRowData: any[] = editorColumns.map((column) => ({ value: column.initValue || 0 })); // записывает начальное значение по индексу столбца а не поля (сбивается логика при перестановке столбцов)
                // const rowInitialValues=editorColumns.map(column=>column.initValue||0);

                const created: Array<Array<number | string>> = statisticRowsData.map((rowData, rowIndex) => {
                    // console.log('ROW DATA',rowData);
                    const newRow = editorColumns.map((column, columnIndex: number) => {
                        const sum = /@sum/.test(column.logic);
                        const mathLogic = column.logic.replaceAll("@sum", ""); // clear @sum
                        const resultColumn = sum && rowIndex ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + Number(lastRow[columnIndex]) : sum ? Number(logicMath(mathLogic, rowData, rowIndex, lastRowData)) + (column.initValue || 0) : logicMath(mathLogic, rowData, rowIndex, lastRowData);
                        return resultColumn;
                    });
                    // console.log('NEW ROW', newRow);
                    lastRowData = [...rowData];
                    lastRow = [...newRow];
                    return newRow;
                });

                setCreatedTableBody(created);
                // console.log('📊 \n', created);
            }
        }, [editorColumns, statisticRowsData, createdTableBody]);

        useEffect(() => {
            // ----------------------------------------------------------------------- ON FIRST PATTERN SELECT 👇📈

            //if (initTableRef.current && statisticRowsData.length && !createdTableBody.length) {

            if (initTableRef.current && statisticRowsData.length) {
                console.log("FIRST CREATE TABLE ✅📊---!!!!!!! PATTERN : ", selectedPatternId);

                initTableRef.current = false;

                createInitTableEditor();

                return;
            }
        }, [statisticRowsData, createdTableBody]);

        //-------------------------------------------------------------------------------------------ON SELECT TABLE-----------------------------👇👇👇👇👇👇👇📊

        useEffect(() => {
            //---------------------------------- при выборе таблицы
            if (selectedTableId) {
                //если шаблон выбран
                const currentTable = tables.find((table) => table.id === selectedTableId); //поиск таблицы выбранной таблицы из массива
                if (currentTable) {
                    //если таблица найдена
                    console.log("SELECT TABLE ▶️ ", currentTable);

                    setEditorColumns(currentTable.columns); //ставим таблицу в редактор

                    setCreatedForId(selectedPatternId);
                }
            } else {
                if (createdForIdRef.current) {
                    createdForIdRef.current = false;
                    if (statisticRowsData.length)
                        setTimeout(() => {
                            // //createInitTableEditor();
                            // console.log('➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️'),statisticRowsData;
                            // setEditorColumns(statisticRowsData[0].map((row, columnIndex: number) => (
                            //     {
                            //         name: row.name,
                            //         logic: `@${columnIndex + 1}`,
                            //         initValue: null,
                            //         color: ''
                            //     }
                            // )));
                        }, 1000);
                }

                //  createInitTableEditor() ----- ???
            }
        }, [statisticRowsData, selectedTableId]);

        useEffect(() => {
            console.log("🔁");
        }, []);

        return (
            <>
                <div className={styles.tableConstructor}>
                    <button onClick={createInitTableEditor}>сброс колонок</button>
                    {!!!statisticRowsData.length && <h5>По данному шаблону нет данных. Заполните статистику</h5>}

                    {
                        //--------------------------------------------------------------------EDITOR MENU BLOCK
                        !selectedTableId && isAdmin && (
                            <div className={styles.tableControl}>
                                <input value={newTableName} onChange={(event) => setNewTableName(event.target.value)} placeholder="название таблицы" />
                                <div className={styles.buttonsWrap}>
                                    <button onClick={saveTableView} disabled={newTableName.length < 5}>
                                        Сохранить схему отображения таблицы
                                    </button>
                                </div>
                                <div className={styles.addColumnBtn} onClick={() => addEditorColumn()}>
                                    Добавить колонку
                                </div>
                            </div>
                        )
                    }

                    {/* //---------------------------------------------------------------------SELECTED COLUMN BLOCK */}

                    <div className={styles.selectedColumnBlock} ref={columnMenuRef} style={{ display: selectedColumn !== null ? "flex" : "none" }}>
                        {optionsMenu}

                        <span className={styles.selectedHelp}>название столбца</span>
                        <input value={columnEditorName} onChange={(event) => setColumnEditorName(event.target.value)} />
                        <span className={styles.selectedHelp}>логика просчёта строки </span>
                        <input value={columnEditorLogic} onChange={(event) => setColumnEditorLogic(event.target.value)} onContextMenu={logicMenu} />
                        <span className={styles.selectedHelp}>начальное значение столбца </span>
                        <input type="number" value={columnEditorInitialValue} onChange={(event) => setColumnEditorInitialValue(event.target.value)} />
                        <span className={styles.selectedHelp}>цвет столбца </span>
                        <input type="color" value={columnEditorColor} onChange={(event) => setColumnEditorColor(event.target.value)} />

                        <div className={styles.buttonsBlock}>
                            <button onClick={columnMovePrev}>⬅️</button>
                            <button onClick={columnMoveNext}>➡️</button>
                            <button onClick={deleteColumn}>Удалить колонку</button>
                            {isNumbersOnColumn() && <button onClick={() => columnToLineOnChart()}>Отобразить на графике</button>}
                            <button
                                //------------------------------------------------------------------------------------------------------------------------------------------------------ COLOR NOT CHECKED FOR SAVE BUTTON--------- !!!!!!!!!

                                onClick={saveColumn}
                            >
                                Сохранить
                            </button>
                            <button onClick={() => setSelectedColumn(null)}>Отмена</button>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                {
                                    //-------------------------------------------------------------COLUMN NAME & SELECTED COLUMN
                                    editorColumns.map(NameColumnItem)
                                }
                            </tr>
                            <tr>
                                {
                                    //-------------------------------------------------------------INITIAL VALUES LINE
                                    editorColumns.map(InitialValueRowItem)
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                //-----------------------------------------------------------------GENERATION TABLE ROWS
                                createdTableBody.map((row, rowIndex) => (
                                    <tr key={rowIndex + "_createdRow"}>
                                        {row.map((column, colIndex) => (
                                            <td key={colIndex + "_createdRow"}>{column}</td>
                                        ))}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    //-------------------##########################################---------------------- DYNAMIC TABLE END-------------------############################################------------------------------------------------
    useEffect(() => {
        if (init.current) {
            init.current = false;
            getUserPatterns(user.userId, setPatterns);
        }
    }, []);

    useEffect(() => {
        // -------------------------------------------------------------- ON SELECTED PATTERN
        if (selectedPatternId) {
            setChartSchema(patterns?.find((pattern) => pattern.id == selectedPatternId));
            getAllUserStatsByChartId(selectedPatternId, setStatArr);
            allTablesByPatternId(); //-----------------GETS ALL TABLES
        } else {
            setStatArr([]);
            setTables([]);
        }
    }, [selectedPatternId]);

    useEffect(() => {
        // --------------------------------------------------------------- ON SELECT DATES
        setStatArrFiltered(statArr.filter((stat) => (startAt ? stat.dateStart >= new Date(startAt).getTime() : true) && (endAt ? stat.dateStart <= new Date(endAt).getTime() : true)));
    }, [startAt, endAt, statArr]);

    // useEffect(() => { console.log('FILTERED', statArrFiltered) }, [statArrFiltered])

    useEffect(() => {
        if (selectedPatternId) {
            console.log(`SELECT PATTERN ${selectedPatternId} `);
            setSelectedTableId(undefined);

            initTableRef.current = true;
            createdForIdRef.current = true;
        }
    }, [selectedPatternId]);

    return (
        <div className={styles.statsScreenWrapper}>
            <button onClick={() => setEditorColumns([])}>CLEAR</button>

            <h3>Отображение записей статистики по шаблонам</h3>
            <select value={selectedPatternId} onChange={(event) => setSelectedPatternId(+event.target.value)}>
                <option value={0}>Выбрете шаблн</option>
                {patterns?.map((pattern, idx: number) => (
                    <option key={pattern.id + "_patternOptions"} value={pattern.id}>
                        {pattern.name}
                    </option>
                ))}
            </select>
            {
                //------------------------------------------------------------------- SELECT TABLES
                !!(selectedPatternId && (isAdmin || tables.length)) && (
                    <select value={selectedTableId} onChange={(event) => setSelectedTableId(+event.target.value)}>
                        {isAdmin ? <option value={0}>редактор таблиц</option> : <option value={0}>начальные колонки</option>}
                        {tables?.map((table, idx: number) => (
                            <option key={table.id + "_tableOptions"} value={table.id}>
                                {table.name}
                            </option>
                        ))}
                    </select>
                )
            }

            {!!selectedPatternId && (
                <div className={styles.dateRange}>
                    <input type={"date"} value={startAt} onChange={(event) => setStartAt(event.target.value)} />
                    <input type={"date"} value={endAt} onChange={(event) => setEndAt(event.target.value)} />
                    <h5>диапазон по начальным датам в записях</h5>
                </div>
            )}

            {selectedPatternId ? (
                modalTable ? (
                    <Modal fullWidth={true} closeModalFunc={() => setModalTable(false)}>
                        <DynamicTableOfStats modal={modalTable} />
                    </Modal>
                ) : (
                    <DynamicTableOfStats modal={modalTable} />
                )
            ) : (
                ""
            )}

            {!!(selectedPatternId && statArrFiltered && Object.keys(chartSchema).length) && <MultiLinesChart chartSchema={chartSchema} records={statArrFiltered} costumsLines={costumLinesArr} />}
        </div>
    );
}
