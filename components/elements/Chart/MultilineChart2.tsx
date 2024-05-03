import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getChartImage, logicMath } from '@/utils/funcs';
import Modal from '../Modal/Modal';
// import faker from 'faker';
import chartTrendline from 'chartjs-plugin-trendline';

//import chartTrendline from './trend';
import { CostumLineI } from '@/types/types';
import { linearRegression } from '@/utils/trend';
import { useSelector } from 'react-redux';
import { StateReduxI } from '@/redux/store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, chartTrendline);

export function MultiLinesChart2({
    dates,
    chartSchema,
    clickFunc,
    costumsLines,
    reverseTrend,
    showBtns = true,
    chartName = '',
    showX = true,
    linesBtns = true,
}: {
    dates: { start: number; end: number }[];
    chartSchema?: any;
    clickFunc?: any;
    costumsLines: CostumLineI[];
    reverseTrend?: boolean;
    showBtns?: boolean;
    chartName?: string;
    showX?: boolean;
    linesBtns?: boolean;
}) {
    //STATE
    const [modal, setModal] = useState(false);
    const [reverse, setReverse] = useState(reverseTrend);
    const chartRef = useRef<any>();
    //SELECTORS

    useEffect(() => {
        //console.log('CHART COMP lines',costumsLines);
        chartRef.current?.update();
    }, [costumsLines]);

    useEffect(() => {
        setReverse(reverseTrend);
        // console.log('TREND REVERSE', reverseTrend)
    }, [reverseTrend]);

    const currentChart = useMemo(
        () => (
            <>
                {!!dates.length && showBtns && (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="noselect" onClick={() => setReverse((state) => !state)} style={{ padding: 3, borderRadius: 10, border: `2px solid ${reverse ? 'lightblue' : 'lightgreen'}`, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            🔀
                        </div>
                        <div className="noselect" onClick={() => getChartImage(chartSchema.name, true)} style={{ padding: 3, borderRadius: 10, border: `2px solid ${reverse ? 'lightblue' : 'lightgreen'}`, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            🖼️
                        </div>
                    </div>
                )}
                <Line
                    className="myChart"
                    ref={chartRef}
                    options={{
                        responsive: true,
                        interaction: {
                            mode: 'index' as const,
                            intersect: false,
                        },
                        //stacked: false,
                        plugins: {
                            title: {
                                display: !!chartName,
                                text: chartName,
                            },
                            legend: {
                                display: linesBtns || modal,
                            },
                        },

                        scales: {
                            y: {
                                type: 'linear' as const,
                                display: true,
                                position: 'left' as const,
                                reverse,
                            },
                            // y: {
                            //   type: 'linear' as const,
                            //   display: true,
                            //   position: 'left' as const,
                            // },
                            y1: {
                                type: 'linear' as const,
                                display: false,
                                position: 'right' as const,
                                grid: {
                                    drawOnChartArea: false,
                                },
                                // ticks:{
                                //   stepSize:1,
                                // },
                                reverse,
                            },
                            // y1: {
                            //   type: 'linear' as const,
                            //   display: true,
                            //   position: 'right' as const,
                            //   grid: {
                            //     drawOnChartArea: false,
                            //   }
                            // },
                            x: {
                                display: modal || showX,
                            },
                        },
                    }}
                    data={{
                        labels: dates.map((el) => `${new Date(+el.start).toLocaleDateString()} - ${new Date(+el.end).toLocaleDateString()}`),
                        //labels: [1,2,3,4],

                        datasets: costumsLines.map((line) => ({
                            type: 'line',
                            label: line.name,
                            borderColor: line.color,
                            borderWidth: 4,
                            fill: false,
                            data: line.records,
                            tension: 0.4, //soft angels
                        })),

                        // [...chartSchema?.lines?.map(line => (
                        //   {
                        //     type: 'line',
                        //     label: line.name,
                        //     borderColor: line.lineColor,
                        //     borderWidth: 4,
                        //     fill: false,
                        //     data: records.map((el, index) => logicMath(line.logicString, el.fields, index)),
                        //     tension: 0.4, //soft angels

                        //   }
                        // )),
                        // ...costumLines.map(costumLine => (
                        //   {
                        //     type: 'line',
                        //     label: costumLine.name,
                        //     borderColor: costumLine.color,
                        //     borderWidth: 4,
                        //     fill: false,
                        //     data: costumLine.records,
                        //     tension: 0.4, //soft angels
                        //     ...costumLine.trend
                        //       ? {
                        //         trendlineLinear: {
                        //           colorMin: "red",
                        //           colorMax: "green",
                        //           lineStyle: "solid",
                        //           width: 3,
                        //           projection: true,
                        //         }
                        //       }
                        //       : { trendlineLinear: false }
                        //   }
                        // ))
                        // ]
                    }}
                    onContextMenu={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        clickFunc ? clickFunc() : setModal((state) => true);
                    }}
                />
            </>
        ),
        [costumsLines, reverse, modal]
    );

    useEffect(() => {
        if (costumsLines.length) {
            const x = costumsLines[0].records.map((el, index) => index + 1);
            const y = costumsLines[0].records;

            const trend = linearRegression(x, y);

            // console.log('COSTUM TREND', trend)
        }
    }, [costumsLines]);

    return (
        <>
            {modal ? (
                <Modal fullWidth={true} closeModalFunc={() => setModal(false)} black={false} zIndex={999}>
                    {currentChart}
                </Modal>
            ) : (
                currentChart
            )}
        </>
    );
}
