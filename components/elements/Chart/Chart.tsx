

import React, { useRef, useEffect } from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { logicMath } from '@/utils/funcs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);



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



    // const options = {
    //     responsive: true,
    //     interaction: {
    //         mode: 'index',
    //         intersect: false,
    //     },
    //     stacked: false,
    //     plugins: {
    //         title: {
    //             display: true,
    //             text: chartSchema.chartName,//'Chart.js Line Chart - Multi Axis'
    //         },
    //     },
    //     scales: {
    //         y: {
    //             type: 'linear',
    //             display: true,
    //             position: 'left',
    //         },
    //         y1: {
    //             type: 'linear',
    //             display: true,
    //             position: 'right',
    //             grid: {
    //                 drawOnChartArea: false,
    //             },
    //         },
    //     },
    // };


    useEffect(() => {
        const chart = chartRef.current;

        console.log('DATASETS', datasets);
        console.log('CHART SCHEMA', chartSchema);
        console.log('RECORDS', records);
        //triggerTooltip(chart); !!- LATER
    }, []);

    return (
        <>           
            {/* {table&&<table>
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
            </table>} */}

            <Line data={{
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

           
        </>
    );
}
