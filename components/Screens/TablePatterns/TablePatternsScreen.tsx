import { StateReduxI } from "@/redux/store";
import { useSelector } from "react-redux";
import styles from './patterns.module.scss';
import { StatHeaderI } from "@/types/types";
import { headers } from "next/dist/client/components/headers";
import useTableStatistics from "@/hooks/useTableStatistics";
import useTablePatterns from "@/hooks/useTablePatterns";

interface LogicParseedI{    
        isSum: boolean;
        isTrend: boolean;
        isRevTrend: boolean;
        calcStr: string;    
}

export default function TablePatternsScreen() {

    //SELECTORS
    const { tablePatterns } = useSelector((state: StateReduxI) => state.patterns);

    //HOOKS
    const {deleteTablePattern} = useTablePatterns()

    const logicParseToText = (headers: StatHeaderI[], logic: string): {parsedResult:LogicParseedI} => {
        const isSum = /@sum/g.test(logic)  ;
        const isTrend = /@trend/g.test(logic) ;
        const isRevTrend = /@revtrend/g.test(logic) ;
        const calcStr = logic
            .replaceAll(/@@\d{1,3}/g, (findStr) => ` [⤴️${headers[+findStr.replaceAll('@', '')-2].name}] `)
            .replaceAll(/@\d{1,3}/g, (findStr) => ` [${headers[+findStr.replaceAll('@', '')-2].name}] `)
            .replaceAll('@sum', '')
            .replaceAll('@trend', '')
            .replaceAll('@revtrend', '')
            .replaceAll('@init', ' нулевое значение');
        
        const result={
            isSum,
            isTrend,
            isRevTrend,
            calcStr
        }

        return {parsedResult:result};
    }

    const onDelPattern=(id:number)=>confirm(`Удалить шаблон ?`)&&deleteTablePattern(id);

    return (
        <div className={styles.patternsMainWrap}>
            <div className={styles.patternsList}>
                {
                    tablePatterns.map((pattern, patternIdx) => (
                        <div key={Math.random()} className={styles.patternsItem}>
                            <div className={styles.patternName}>
                                <span> {pattern.name}</span>
                                <span onClick={()=>onDelPattern(pattern.id)}> ❌</span>
                            </div>
                            <div className={styles.patternColumns}>
                                {
                                    pattern.headers.map((header, headerIdx) => {
                                        const {parsedResult}=logicParseToText(pattern.headers,header.logicStr);

                                        return (
                                            <div key={Math.random()} className={`${styles.column} ${header.logicStr?'':styles.columnForInput}`}>
                                                <div className={styles.columnName}>
                                                    <span className={styles.help}>колонка</span>
                                                    <span className={styles.name}>{header.name}</span> 
                                                </div>
                                                <div className={styles.content}>
                                                    {
                                                        header.logicStr
                                                            ?
                                                            <div className={styles.logic}>
                                                                <div className={styles.logicText}>{parsedResult.calcStr}</div>
                                                                <div className={styles.logicOptionsList}>
                                                                    {parsedResult.isSum&&<div className={styles.sum}>Суммирующая</div>}
                                                                    {parsedResult.isTrend&&<div className={styles.trend}>Тренд 📈</div>}
                                                                    {parsedResult.isRevTrend&&<div className={styles.revtrend}>Перевернутый тренд 📉</div>}
                                                                </div>

                                                            </div>
                                                            :
                                                            <div className={styles.forInput}>
                                                                заполнение
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}