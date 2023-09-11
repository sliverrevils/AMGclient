import { MultiLinesChart } from "@/components/elements/Chart/MultilineChart";
import { ChartPatternI, CostumLineI, MenuI, StatisticI } from "@/types/types";

import styles from './chartView.module.scss';
import { useEffect, useState } from "react";
import useUI from "@/hooks/useUI";
import { linearRegression } from "@/utils/trend";

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
    const [colorInput,setColorInput]=useState('#A5A1A1');
    const [colorLine,setColorLine]=useState('#A5A1A1');

    //---HOOKS
    const {createMenu}=useUI();

    //---FUNCS
    //delete costum line
    const deleteCostumLine = (key: number) => setCostumLinesArr(state => state.filter(line => line.key !== key));

    //create trade line
    const lineTrendToggle = (line: CostumLineI|undefined) => {
        console.log('SELECTED LINE', line);
        if(line)
        setCostumLinesArr(state=>state.map(lineState=>lineState.key==line.key?{...lineState,trend:!lineState.trend}:lineState))

    }


    //context menu costum line
    const [lineMenu,onOpenLineMenu,onCloseLineMenu,lineMenuStyle] = createMenu();
    const [selectedLine,setSelectedLine]=useState(0);

    const onContextLineMenu=(event: React.MouseEvent<HTMLDivElement, MouseEvent>,costumLine:CostumLineI)=>{
        onOpenLineMenu(event);
        setSelectedLine(state=>costumLine.key);
    }

    //calc trend line
    const onCalcTrend=()=>{
        const line=costumLinesArr.find(line => line.key == selectedLine);

        const x=line?.records.map((el,index)=>index+1);
        const y=line?.records;
        
        const trend=linearRegression(x,y)
        
        console.log('SELECT',trend)
        setCostumLinesArr(state=>[...state,
            {
                color:colorInput,
                key:Math.random(),
                name:line?.name+'-тренд',
                records:trend.result.map(el=>el.y),
                trend:false
            }
        ]);
        onCloseLineMenu();
        setColorInput('#A5A1A1');

    }

    const lineMenuHtml =
        <div style={lineMenuStyle} className={styles.lineMenu}>

            {/* <div
                onClick={() => {
                    lineTrendToggle(costumLinesArr.find(line => line.key == selectedLine));
                    onCloseLineMenu();
                }}
                className={styles.createTrend}
            >
                Отобразить линию тренда 📉
            </div> */}
            <div className={styles.lineColor}>
                <span>Цвет линии</span>
                <input type="color" value={colorLine} onChange={event => setColorLine(event.target.value)} />
            </div>
            
            {!/-тренд/g.test(costumLinesArr.find(line => line.key == selectedLine)?.name||'')&&
                <div
                    className={styles.createTrend}
                >
                    <span onClick={onCalcTrend}>Просчитать линию тренда</span>
                    <input type="color" value={colorInput} onChange={event => setColorInput(event.target.value)} />
                </div>
            }
            <img src="svg/org/close_field.svg" onClick={onCloseLineMenu} className={styles.close} />

        </div>

    //EFFECT
    useEffect(()=>{
        if(selectedLine){
            const line=costumLinesArr.find(line => line.key == selectedLine);
            if(line?.color){
                setColorLine(line!.color)
            }
            
        }
    },[selectedLine])   

    useEffect(()=>{
        if(selectedLine){
            setCostumLinesArr(state=>state.map(line=>{
                if(line.key==selectedLine){
                    return {...line,color:colorLine}
                }else{
                    return line
                }
            }))
        }
    },[colorLine,selectedLine])

    //---RETURN JSX
    if (currentPattern)
        return (<>

            {lineMenuHtml}

            <div className={styles.costumLineBlock}>
                {
                    costumLinesArr.map((costumLine, lineIndex) =>
                        <div key={costumLine.key}
                            className={`${styles.lineItem} noselect`}
                            style={{ background: costumLine.color || '#ff8056', color: 'white' }}
                            onContextMenu={event=>onContextLineMenu(event,costumLine)}
                            >
                            <span>{costumLine.name}</span>
                            <img src="svg/org/close_field_white.svg" onClick={() => deleteCostumLine(costumLine.key)} className={styles.delLine} />
                        </div>
                    )
                }
            </div>

            <MultiLinesChart chartSchema={currentPattern} records={statisticsArr} costumLines={ costumLinesArr} />
        </>

        )
}