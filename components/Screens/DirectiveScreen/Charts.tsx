import { useSelector } from "react-redux";
import styles from "./charts.module.scss";
import { StateReduxI } from "@/redux/store";
import { MultiLinesChart2 } from "@/components/elements/Chart/MultilineChart2";
export default function Charts({ charts }: { charts: number[] }) {
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);
    return (
        <div className={styles.chartsWrap}>
            {charts.map((statId) => {
                const currentStat = tableStatisticsList.find((listItem) => listItem.id === statId);
                if (!currentStat) {
                    return <div>статистика не найдена</div>;
                }

                if (currentStat.dateColumn.raportInfo?.chartProps)
                    return (
                        <div className={styles.statItemBlock} id={`statId_${statId}`}>
                            <MultiLinesChart2 {...{ ...currentStat.dateColumn.raportInfo.chartProps, chartName: currentStat.name }} chartSchema={[]} showBtns={false} showX={true} linesBtns={true} />
                        </div>
                    );
            })}
        </div>
    );
}
