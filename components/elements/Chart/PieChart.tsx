import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { IPieChartProps, IPieObj } from "@/types/types";
import styles from "./pie.module.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

const menuNames = {
    all: "Все данные ",
    felled: "Заполнение",
    growing: "Рост",
};

export function PieChart({ props }: { props: IPieObj }) {
    const [currentKey, setCurrentKey] = useState(Object.keys(props)[0]);

    return (
        <div className={styles.mainWrap}>
            <div className={styles.statSelect}>
                {Object.keys(props).map((key) => (
                    <div key={key + "_selectChartName"} className={`${styles.statItem} ${currentKey === key ? styles.statItemSelected : ""}`} onClick={() => setCurrentKey(() => key)}>
                        {menuNames[key]}
                    </div>
                ))}
            </div>
            <div className={styles.chartWrap}>
                <Pie data={props[currentKey]} />
            </div>
        </div>
    );
}
