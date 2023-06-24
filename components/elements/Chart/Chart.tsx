

import React, { useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title,    
    ChartData
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { logicMath } from '@/utils/funcs';

ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title
);


// function triggerTooltip(chart) {
//     const tooltip = chart?.tooltip;

//     if (!tooltip) {
//         return;
//     }

//     if (tooltip.getActiveElements().length > 0) {
//         tooltip.setActiveElements([], { x: 0, y: 0 });
//     } else {
//         const { chartArea } = chart;

//         tooltip.setActiveElements(
//             [
//                 {
//                     datasetIndex: 0,
//                     index: 2,
//                 },
//                 {
//                     datasetIndex: 1,
//                     index: 2,
//                 },
//             ],
//             {
//                 x: (chartArea.left + chartArea.right) / 2,
//                 y: (chartArea.top + chartArea.bottom) / 2,
//             }
//         );
//     }

//     chart.update();
// }

export function ChartShow({ records, chartSchema,table=false }) {
    const chartRef = useRef(null);
    const dataRef=useRef({});
   

    const xPath  = records.map(el =>`${ new Date(+el.dateStart).toLocaleDateString()} - ${ new Date(+el.dateEnd).toLocaleDateString()}`);
    const datasets = chartSchema?.lines?.map(line => ( 
        {
            type: 'line',
            label: line.name,
            borderColor: line.lineColor,
            borderWidth: 4,
            fill: false,
            data: records.map((el, index) => logicMath(line.logicString, el.fields, index)),
            tension: 0.4, //soft angels
        }
    ))

    const data = {
        labels: xPath,
        datasets: datasets,
    };

    dataRef.current={
        labels: xPath,
        datasets: datasets,
    }



    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: chartSchema.chartName,//'Chart.js Line Chart - Multi Axis'
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };


    useEffect(() => {
        const chart = chartRef.current;

        console.log('DATASETS', datasets);
        console.log('CHART SCHEMA', chartSchema);
        console.log('RECORDS', records);
        //triggerTooltip(chart); !!- LATER
    }, []);

    return (
        <>           
            {table&&<table>
                <thead>
                    <td>дата</td>
                    {chartSchema.fields.map(el => <td key={el.id + 'th'}><span style={{ color: 'lightgray' }}>@{el.id}</span> {el.name}</td>)}

                </thead>
                {records.map(record => (
                    <tr>
                        <td>{record.date}</td>
                        {record.fields.map(field => (
                            <>
                            <td>{field.value}</td>
                            </>
                        ))}

                    </tr>
                ))}
            </table>}

            <Chart ref={chartRef} type='bar' data={{
                labels:records.map(el =>`${ new Date(+el.dateStart).toLocaleDateString()} - ${ new Date(+el.dateEnd).toLocaleDateString()}`),
                datasets:chartSchema?.lines?.map(line => ( 
                    {
                        type: 'line',
                        label: line.name,
                        borderColor: line.lineColor,
                        borderWidth: 4,
                        fill: false,
                        data: records.map((el, index) => logicMath(line.logicString, el.fields, index)),
                        tension: 0.4, //soft angels
                    }
                ))
            }} options={{
                responsive:true,
                interaction:{
                    mode:'index',
                    intersect: false
                },
                plugins:{
                    title:{
                        display:true,
                        text:chartSchema.chartName
                    }
                    
                },
                scales:{
                    
                }
            }} />

            {/* <Chart ref={chartRef} type='bar' data={data} options={options} /> */}
        </>
    );
}
