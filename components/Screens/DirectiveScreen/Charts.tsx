import { useSelector } from "react-redux";
import styles from "./charts.module.scss";
import { StateReduxI } from "@/redux/store";
import { MultiLinesChart2 } from "@/components/elements/Chart/MultilineChart2";
import { IChartPropListItem } from "@/types/types";
export default function Charts({ charts }: { charts: IChartPropListItem[] }) {
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    return (
        <div className={styles.chartsWrap}>
            {charts.map((chart) => {
                //const currentStat = tableStatisticsList.find((listItem) => listItem.id === statId);
                // if (!currentStat) {
                //     return <div key={chart.statId + "_chart"}>статистика не найдена</div>;
                // }

                // if (currentStat.dateColumn.raportInfo?.chartProps)
                return (
                    <div key={chart.statId + "_chart"} className={styles.statItemBlock} id={`statId_${chart.statId}`}>
                        <MultiLinesChart2 {...{ ...chart, chartName: chart.name }} chartSchema={[]} showBtns={false} showX={true} linesBtns={true} />
                    </div>
                );
            })}
        </div>
    );
}
