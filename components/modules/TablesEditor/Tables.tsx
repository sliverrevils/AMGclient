import useChart from "@/hooks/useChart";
import { ChartPatternI, CostumLineI, StatisticDataRowI, StatisticI, UserI } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PatternControl from "./PatternControl/PatternControl";
import TableView from "./TableView/TableView/TableView";
import styles from './tabels.module.scss';
import Modal from "@/components/elements/Modal/Modal";
import ChartView from "./TableView/ChartView/ChartView";
import { StateReduxI } from "@/redux/store";

//info
//Tables updates only after update statisticRowsData

export default function Tables() {

    const [currentPattern, setCurrentPattern] = useState<ChartPatternI | undefined>();
    const [isFullScreenTable, setIsFullScreenTable] = useState(false);


    //SELECORS
    const {lines,selectedPatternId} = useSelector((state:StateReduxI)=>state.stats)


    // useEffect(()=>{
    //     console.log('🌍 statisticRowsData :', statisticRowsData);
    //     setCostumLinesArr([]); // clear costum lines on new data
    // },[statisticRowsData])

    return (
        <div className={styles.tablesBlock}>
            <PatternControl {...{
                setCurrentPattern,
            }}
            />

            <TableView  {...{
                currentPattern,
                isFullScreenTable,
                setIsFullScreenTable,
            }}
            />

            {
            !!lines.length&&<ChartView {...{
                currentPattern,
            }}
            />}
        </div>
    )
}