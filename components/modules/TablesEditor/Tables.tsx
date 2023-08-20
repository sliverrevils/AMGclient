import useChart from "@/hooks/useChart";
import { ChartPatternI, CostumLineI, StatisticDataRowI, StatisticI, UserI } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PatternControl from "./PatternControl/PatternControl";
import TableView from "./TableView/TableView/TableView";
import styles from './tabels.module.scss';
import Modal from "@/components/elements/Modal/Modal";
import ChartView from "./TableView/ChartView/ChartView";

//info
//Tables updates only after update statisticRowsData

export default function Tables(){
    //массив массивов всех выбранных статистик с заполнеными полями [[{name,value}]]
    const [statisticRowsData, setStatisticRowsData] = useState<Array<StatisticDataRowI[]>>([]);
    const [currentPattern,setCurrentPattern]=useState<ChartPatternI| undefined>();
    const [isFullScreenTable,setIsFullScreenTable]=useState(false);
    const [statisticsArr,setStatisticsArr]=useState<StatisticI[]>([]);
    const [costumLinesArr,setCostumLinesArr]=useState<CostumLineI[]>([]);

    useEffect(()=>{
        console.log('🌍 statisticRowsData :', statisticRowsData);
    },[statisticRowsData])

    return (
        <div className={styles.tablesBlock}>
            <PatternControl {...{ setStatisticRowsData, setCurrentPattern, setStatisticsArr }} />
            <TableView  {...{ statisticRowsData, currentPattern, isFullScreenTable, setIsFullScreenTable, setCostumLinesArr }} />
            <ChartView {...{ currentPattern, statisticsArr,costumLinesArr,setCostumLinesArr }} />
        </div>
    )
}