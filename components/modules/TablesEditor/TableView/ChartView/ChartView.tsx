import { MultiLinesChart } from "@/components/elements/Chart/MultilineChart";
import { ChartPatternI, CostumLineI, MenuI, StatisticI } from "@/types/types";

import styles from './chartView.module.scss';
import { useEffect, useState } from "react";
import useUI from "@/hooks/useUI";

interface TrendI extends CostumLineI {
    middleValue: number,
    up: boolean
}

export default function ChartView({ currentPattern, statisticsArr, costumLinesArr, setCostumLinesArr }
    : {
        currentPattern: ChartPatternI | undefined,
        statisticsArr: StatisticI[],
        costumLinesArr: CostumLineI[],
        setCostumLinesArr: React.Dispatch<React.SetStateAction<CostumLineI[]>>
    }) {
    //---STATES
    const [trendLine, setTrendLine] = useState<TrendI | null>(null)
    const [costumLinesSelectKey, setCostumLinesSelectKey] = useState(0);
    const [trendLineType, setTrendLineType] = useState('');
    const [middleValueStart, setMiddleValueStart] = useState(false);

    //---HOOKS
    const {createMenu}=useUI();

    //---FUNCS
    //delete costum line
    const deleteCostumLine = (key: number) => setCostumLinesArr(state => state.filter(line => line.key !== key));

    //create trade line
    const createLinearTradeLine = (line: CostumLineI) => {
        console.log('SELECTED LINE', line);

        const lineUp: boolean = line.records[0] < line.records[line.records.length - 1];
        let middleValue = 0;
        let startValue = line.records[0];
        console.log('START VALUE', startValue)
        let trendArr: number[] = [];

        const records: number[] = [];

        //FIRST
        for (let i = 0; i <= line.records.length; i++) {
            if (line.records[i + 1]) {
                records[i] = (line.records[i] - line.records[i + 1]);
            }
        }

        // for (let i = 0; i <= line.records.length-1; i++) {
        //     if (line.records[i + 1]) {
        //         records[i] = (line.records[i+1] - line.records[i]);
        //     }
        // }

        middleValue = Number((records.reduce((acc, number) => acc + number, 0) / (line.records.length-2)).toFixed(2)); // --- count??
        //middleValue=(records.reduce((acc,number)=>acc+number,0)/line.records.length)/2;

        // if(lineUp){ // -??            
        //     startValue+=middleValue+2;
        // }else{            
        //     startValue=startValue;            
        // }

        if(lineUp){
            if(middleValue<0)
            middleValue=Math.abs(middleValue);
            console.log('LINE UP',middleValue,startValue,startValue-middleValue/2)

            
            startValue -= middleValueStart ? middleValue+middleValue/2  : middleValue;
            //startValue -= middleValueStart ? middleValue / 2 : middleValue;
        }else{
            startValue += middleValueStart ? middleValue+middleValue / 2 : middleValue;
        }
       

        trendArr = line.records.map((number, index) => {

            if(lineUp){
                console.log('RES',startValue + Math.abs(middleValue) * (index + 1) )
                return startValue + Math.abs(middleValue) * (index + 1) 
            }else{
                return startValue - middleValue * (index + 1) 
            }
           
        })

        console.log('MIDDLE', middleValue);

        setTrendLine({
            color: 'lightgray',
            key: Math.random(),
            name: `${line.name} - линия тренда`,
            records: trendArr,
            middleValue,
            up: lineUp
        })

    }


    const createPointTradeLine = (line: CostumLineI) => {
        console.log('SELECTED LINE', line);

        const lineUp: boolean = line.records[0] < line.records[line.records.length - 1];
        let middleValue = 0;
        let startValue = line.records[0];
        console.log('START VALUE', startValue)
        let trendArr: number[] = [];

        const records: number[] = [];

        for (let i = 0; i <= line.records.length-1; i++) {
            if (line.records[i + 1]) {
                records[i] = (line.records[i+1] - line.records[i]);
            }
        }

        console.log('RECORDS',records);
        middleValue = Number((records.reduce((acc, number) => acc + number, 0) / (line.records.length-2)).toFixed(2)); // .../line.records.length-2 --- count??


        startValue =middleValueStart?line.records[0]-middleValue/2:line.records[0];

        trendArr = line.records.map((number, index) => {
                console.log('MATH',number,'+',middleValue,'=',number+middleValue)
                return number+middleValue
     

            
        })

        console.log('MIDDLE', middleValue);

        setTrendLine({
            color: 'lightgray',
            key: Math.random(),
            name: `${line.name} - линия тренда`,
            records:[startValue,...trendArr],
            middleValue,
            up: lineUp
        })

    }

    //context menu costum line
    const [lineMenu,onOpenLineMenu,onCloseLineMenu,lineMenuStyle] = createMenu();
    const [selectedLine,setSelectedLine]=useState(0);

    const onContextLineMenu=(event: React.MouseEvent<HTMLDivElement, MouseEvent>,costumLine:CostumLineI)=>{
        onOpenLineMenu(event);
        setSelectedLine(state=>costumLine.key);

    }

    const lineMenuHtml =
        <div style={lineMenuStyle} className={styles.lineMenu}>

            <div onClick={() => setCostumLinesSelectKey(selectedLine)} className={styles.createTrend}>Построить линию тренда</div>
            <img src="svg/org/close_field.svg" onClick={onCloseLineMenu} className={styles.close} />
            <span className={styles.middleStart}>
            <span > Начало линии тренда с половины среднего значения </span>
            <input type="checkbox" value={middleValueStart + ''} onClick={event => setMiddleValueStart(state => !state)} />
            </span>
            <span className={styles.middleValue} > среднее значение : {trendLine?.middleValue}</span>
        </div>

    //---EFFECTS
    useEffect(() => {// on select trade line
        if (costumLinesSelectKey && costumLinesArr.length) {
            const selectedLine = costumLinesArr.find(line => line.key === costumLinesSelectKey);//find line
            if(selectedLine ){
                // trendLineType == 'linear' && createLinearTradeLine(selectedLine);//create trade line
                // trendLineType == 'point' && createPointTradeLine(selectedLine);//create trade line
                createLinearTradeLine(selectedLine);//create trade line
            }
           
        } else {
            setTrendLine(null);
            setTrendLineType('');
        }

    }, [costumLinesSelectKey, trendLineType, costumLinesArr, middleValueStart]);


    //---RETURN JSX
    if (currentPattern)
        return (<>

            {lineMenuHtml}

            <div className={styles.costumLineBlock}>
                {
                    costumLinesArr.map((costumLine, lineIndex) =>
                        <div key={costumLine.key}
                            className={`${styles.lineItem} noselect`}
                            style={{ background: costumLine.color || 'black', color: 'white' }}
                            onContextMenu={event=>onContextLineMenu(event,costumLine)}
                            >
                            <span>{costumLine.name}</span>
                            <img src="svg/org/close_field_white.svg" onClick={() => deleteCostumLine(costumLine.key)} className={styles.delLine} />
                        </div>
                    )
                }
            </div>

            {/* <select value={costumLinesSelectKey} onChange={event => setCostumLinesSelectKey(+event.target.value)}>
                <option value={0}>без линии тренда</option>
                {
                    costumLinesArr.map(line => <option key={line + 'trendSelect'} value={line.key}>{line.name}</option>)
                }
            </select> */}

            {/* <select value={trendLineType} onChange={event => setTrendLineType(event.target.value)}>
                <option value={''}>тип линии тренда</option>
                <option value={'linear'}>линейная</option>
                <option value={'point'}>по точке</option>
            </select> */}

            {/* <span>
                <span> Старт со среднего значения </span>
                <input type="checkbox" value={middleValueStart + ''} onClick={event => setMiddleValueStart(state => !state)} />
            </span> */}





            {/* <div style={{ display: "flex", gap: 10 }} className={styles.test}>
                {trendLine?.records.map((number, index) => <div key={trendLine.key + index}>
                    <span style={{ fontSize: 12, opacity: .4 }}>{index} </span><span>{number}</span>
                </div>)}
            </div>
            <div className={styles.test}>
                <span> среднее значение : {trendLine?.middleValue}</span>
            </div>
            <div className={styles.test}><span>линия вверх {trendLine?.up + ''}</span></div> */}

            <MultiLinesChart chartSchema={currentPattern} records={statisticsArr} costumLines={trendLine ? [...costumLinesArr, trendLine] : costumLinesArr} />
        </>

        )
}