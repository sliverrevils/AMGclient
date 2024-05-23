import { MultiLinesChart } from "@/components/elements/Chart/MultilineChart";
import { ChartPatternI, CostumLineI, MenuI, StatisticI } from "@/types/types";

import styles from "./chartView.module.scss";
import { useEffect, useState } from "react";
import useUI from "@/hooks/useUI";
import { linearRegression } from "@/utils/trend";
import { StateReduxI } from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setLineTrendRedux } from "@/redux/statsSlice";

interface TrendI extends CostumLineI {
    middleValue: number;
    up: boolean;
}

export default function ChartView({
    currentPattern,
}: // statisticsArr,
//costumLinesArr,
//setCostumLinesArr
{
    currentPattern: ChartPatternI | undefined;
    //statisticsArr: StatisticI[],
    // costumLinesArr: CostumLineI[],
    // setCostumLinesArr: React.Dispatch<React.SetStateAction<CostumLineI[]>>
}) {
    //---STATES

    const [colorInput, setColorInput] = useState("#A5A1A1");
    const [colorLine, setColorLine] = useState("#A5A1A1");
    const [columnsLinesArr, setColumnsLinesArr] = useState<CostumLineI[]>([]);
    //const [trendsLinesArr, setTrendsLinesArr] = useState<CostumLineI[]>([]);

    //SELECTORS
    const { columns, lines, createdRows, initStats } = useSelector((state: StateReduxI) => state.stats);
    const isAdmin = useSelector((state: any) => state.main.user.role === "admin");

    //---HOOKS
    const dispatch = useDispatch();
    const { createMenu } = useUI();

    //---FUNCS
    //delete costum line
    const deleteCostumLine = (key: number) => setColumnsLinesArr((state) => state.filter((line) => line.columnKey !== key));

    //create trade line
    const lineTrendToggle = (line: CostumLineI | undefined) => {
        console.log("SELECTED LINE", line);
        if (line) setColumnsLinesArr((state) => state.map((lineState) => (lineState.columnKey == line.columnKey ? { ...lineState, trend: !lineState.trend } : lineState)));
    };
    console.log("COSTUM LINES ARR", columnsLinesArr);

    //context menu costum line
    const [lineMenu, onOpenLineMenu, onCloseLineMenu, lineMenuStyle] = createMenu({});
    const [selectedLine, setSelectedLine] = useState(0);

    const onContextLineMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, costumLine: CostumLineI) => {
        onOpenLineMenu(event);
        setSelectedLine((state) => costumLine.columnKey);
    };

    //calc trend line
    const onCalcTrend = () => {
        console.log("LINE", selectedLine);
        dispatch(setLineTrendRedux(selectedLine));
        const line = columnsLinesArr.find((line) => line.columnKey == selectedLine);
        console.log("LINE", line);
        // line&&lineTrendToggle(line);

        const x = line?.records.map((el, index) => index + 1);
        const y = line?.records;

        const trend = linearRegression(x, y);

        //console.log('SELECT',trend)
        setColumnsLinesArr((state) => [
            ...state,
            {
                color: colorInput,
                columnKey: Math.random(),
                name: line?.name + "-тренд",
                records: trend.result.map((el) => el.y),
                trend: false,
            },
        ]);
        onCloseLineMenu();
        setColorInput("#A5A1A1");
    };

    const lineMenuHtml = (
        <div style={lineMenuStyle} className={styles.lineMenu}>
            <div className={styles.lineColor}>
                <span>Цвет линии</span>
                <input type="color" value={colorLine} onChange={(event) => setColorLine(event.target.value)} />
            </div>

            {!/-тренд/g.test((columnsLinesArr.find && columnsLinesArr.find((line) => line.columnKey == selectedLine)?.name) || "") && (
                <div className={styles.createTrend}>
                    <span onClick={onCalcTrend}>Просчитать линию тренда</span>
                    <input type="color" value={colorInput} onChange={(event) => setColorInput(event.target.value)} />
                </div>
            )}
            <img src="svg/org/close_field.svg" onClick={onCloseLineMenu} className={styles.close} />
        </div>
    );

    //EFFECT
    useEffect(() => {
        if (selectedLine) {
            const line = columnsLinesArr.find((line) => line.columnKey == selectedLine);
            if (line?.color) {
                setColorLine(line!.color);
            }
        }
    }, [selectedLine]);

    useEffect(() => {
        if (selectedLine) {
            setColumnsLinesArr((state) =>
                state.map((line) => {
                    if (line.columnKey == selectedLine) {
                        return { ...line, color: colorLine };
                    } else {
                        return line;
                    }
                })
            );
        }
    }, [colorLine, selectedLine]);

    //redux lines
    useEffect(() => {
        if ((createdRows.length && columns.length != createdRows[0].length) || !lines.length) {
            setColumnsLinesArr([]);
            //setTrendsLinesArr([]);
        } else {
            let trendsLines: CostumLineI[] = [];
            const data = lines
                ?.map((line) => {
                    const columnIndex = columns.findIndex((column) => column.key == line.columnKey);

                    if (columnIndex >= 0) {
                        if (line.trend) {
                            console.log("CALC TREND");
                            const x = createdRows
                                .map((row) => {
                                    if (row[columnIndex].value !== "") return row[columnIndex].value;
                                })
                                .filter((el) => el !== undefined)
                                .map((el, index) => index + 1);
                            const y = createdRows
                                .map((row) => {
                                    if (row[columnIndex].value !== "") return row[columnIndex].value;
                                })
                                .filter((el) => el !== undefined);

                            const trend = linearRegression(x, y);

                            //console.log('SELECT',trend)
                            trendsLines = [
                                ...trendsLines,
                                {
                                    color: "gray",
                                    columnKey: line.columnKey,
                                    name: columns[columnIndex].name + "-тренд",
                                    records: trend.result.map((el) => el.y),
                                    trend: true,
                                },
                            ];
                        }

                        return {
                            name: columns[columnIndex].name,
                            color: columns[columnIndex].color,
                            records: createdRows
                                .map((row) => {
                                    if (row[columnIndex].value !== "") return row[columnIndex].value;
                                })
                                .filter((el) => el !== undefined),
                            columnKey: line.columnKey,
                            trend: false,
                        };
                    }
                })
                .filter((data) => data && data);
            setColumnsLinesArr([...data, ...trendsLines] as CostumLineI[]);
        }
    }, [lines, createdRows]);

    //---RETURN JSX
    if (currentPattern)
        return (
            <>
                {lineMenuHtml}

                <div className={styles.costumLineBlock}>
                    {isAdmin &&
                        columnsLinesArr.map &&
                        columnsLinesArr.map((costumLine, lineIndex) => (
                            <div key={costumLine.columnKey} className={`${styles.lineItem} noselect`} style={{ background: costumLine.color || "#ff8056", color: "white" }} onContextMenu={(event) => onContextLineMenu(event, costumLine)}>
                                <span>{costumLine.name}</span>
                                <img src="svg/org/close_field_white.svg" onClick={() => deleteCostumLine(costumLine.columnKey)} className={styles.delLine} />
                            </div>
                        ))}
                </div>

                <MultiLinesChart chartSchema={currentPattern} records={initStats} costumsLines={columnsLinesArr} />
            </>
        );
}
