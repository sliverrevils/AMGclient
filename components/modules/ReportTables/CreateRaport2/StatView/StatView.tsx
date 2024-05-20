import { StatItemReady, StatItemReadyWithCoords, TableStatisticI } from "@/types/types";
import styles from "./statview.module.scss";
import { MultiLinesChart2 } from "@/components/elements/Chart/MultilineChart2";
import { stat } from "fs";
import { clearStatName } from "@/utils/funcs";
import { useEffect, useState } from "react";
import useTableStatistics from "@/hooks/useTableStatistics";
import EditableStatisticTable from "@/components/elements/EditableStatisticTable/EditableStatisticTable";
export default function StatView({ statView }: { statView: StatItemReadyWithCoords | null }) {
    const [table, setTable] = useState<TableStatisticI | undefined>(undefined);
    // statView?.dateColumn.raportInfo?.chartProps
    const chartViewWidth = 700;

    const { getTableStatisticById } = useTableStatistics();

    useEffect(() => {
        if (statView?.type === "table") {
            const timeOut = setTimeout(() => {
                getTableStatisticById(statView.id, false).then(setTable);
            }, 500);

            return () => {
                clearTimeout(timeOut);
                console.log("DESTROY");
                setTable(undefined);
            };
        }
    }, [statView]);

    if (statView?.type === "chart")
        return (
            <div className={styles.styleViewMain}>
                {statView?.dateColumn.raportInfo?.chartProps && (
                    // <div className={styles.onMouseEnterChart} style={{ width: chartViewWidth, left: statView.x - chartViewWidth, top: statView.y }}>
                    <div className={styles.onMouseEnterChart} style={{ width: chartViewWidth, left: `50%`, top: 10, transform: `translateX(-50%)` }}>
                        <MultiLinesChart2 {...{ ...statView?.dateColumn.raportInfo?.chartProps }} chartSchema={[]} showBtns={false} chartName={`${clearStatName(statView.name)} - ${statView.dateColumn.raportInfo.trendType}`} />
                    </div>
                )}
            </div>
        );

    if (statView?.type === "period" && statView?.dateColumn?.raportInfo) {
        const { statHeaders, statLastRowValues } = statView.dateColumn.raportInfo;
        if (statLastRowValues?.length)
            return (
                <div className={styles.styleViewMain}>
                    <div className={styles.onMouseEnterChart} style={{ left: statView.x, top: statView.y + 24 }}>
                        <table>
                            <thead>
                                <tr>
                                    {statHeaders?.map((headerName) => (
                                        <th key={headerName + "stathelp"}>{headerName}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {statLastRowValues?.map((value, idx) => (
                                        <td key={value + "" + idx + "stathelp"} style={!idx ? { background: statView.filled ? "rgb(100, 166, 252)" : "rgba(255, 99, 71, 0.473)" } : {}}>
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
    }
    if (statView?.type === "table" && statView?.dateColumn?.raportInfo) {
        return <div className={styles.tableView}>{table ? <EditableStatisticTable selectedTable={table} disableSelectOnList={() => {}} view={true} /> : <div>🔃</div>}</div>;
    }
}
