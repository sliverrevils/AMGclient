import React, { useEffect, useState } from 'react';
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
import Modal from '../Modal/Modal';
// import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);







export function MultiLinesChart({ records, chartSchema, clickFunc, costumLines=[]}:{records:any[], chartSchema:any, clickFunc?:any, costumLines?: any[]}) {
    const [modal,setModal] = useState(false);
    const [reverse,setReverse]=useState(false);


    const currentChart=<>
    {
    !!records.length&&
        <div
          className='noselect'
          onClick={() => setReverse(state => !state)}
          style={{ padding: 3, borderRadius: 10, border: `2px solid ${reverse ? 'lightblue' : 'lightgreen'}`, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          🔀
        </div>
    }
    <Line options={{
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      //stacked: false,
      plugins: {
        title: {
          display: true,
          text: chartSchema.name,
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
        
      },
    }} data={{
      labels:records.map(el =>`${ new Date(+el.dateStart).toLocaleDateString()} - ${ new Date(+el.dateEnd).toLocaleDateString()}`),
      datasets:[...chartSchema?.lines?.map(line => ( 
          {
              type: 'line',
              label: line.name,
              borderColor: line.lineColor,
              borderWidth: 4,
              fill: false,
              data: records.map((el, index) => logicMath(line.logicString, el.fields, index)),
              tension: 0.4, //soft angels
          }
      )),
      ...costumLines.map(costumLine=>( 
        {
            type: 'line',
            label: costumLine.name,
            borderColor: costumLine.color,
            borderWidth: 4,
            fill: false,
            data: costumLine.records,
            tension: 0.4, //soft angels
        }
    ))
    ]
    }}  onContextMenu={(event)=>{
      event.preventDefault();
      clickFunc?clickFunc():setModal(state=>true);
    }}/>
    </>

  return <>

    {
      modal
        ? <Modal fullWidth={true} closeModalFunc={() => setModal(false)}>{currentChart}</Modal>
        : currentChart
    }
  </>
}
