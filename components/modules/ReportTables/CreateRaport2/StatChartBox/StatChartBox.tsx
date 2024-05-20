import { MultiLinesChart2 } from "@/components/elements/Chart/MultilineChart2";
import { StatItemReady } from "@/types/types";
import { clearStatName } from "@/utils/funcs";

import styles from "./chartBox.module.scss";
import { useEffect } from "react";

export default function StatChartBox({ statViewArr }: { statViewArr: StatItemReady[] }) {
    if (!statViewArr.length) return false;

    return (
        <div className={styles.chartsBoxMain}>
            <div className={styles.chartsBlock}>
                {statViewArr.map((stat) => {
                    if (stat?.dateColumn.raportInfo?.chartProps)
                        return (
                            <div key={stat.name + "_statBlock"} className={styles.statItem}>
                                <MultiLinesChart2 {...{ ...stat?.dateColumn.raportInfo?.chartProps }} chartSchema={[]} showBtns={false} showX={false} mini chartName={clearStatName(stat.name)} linesBtns={false} />
                            </div>
                        );
                })}
            </div>
        </div>
    );
}
