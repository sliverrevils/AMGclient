import useChart from "@/hooks/useChart"
import { ChartPatternI, FieldI, LineI } from "@/types/types";
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux";
import styles from './allPatterns.module.scss';



export default function AllPatternsScreen() {
    const init = useRef(true);
    const [allPaterns, setAllPatterns] = useState<Array<ChartPatternI>>([]);
    const { user } = useSelector((state: any) => state.main);
    const { getAllPatterns } = useChart();
    const [selectedPattern, setSelectedPattern] = useState<ChartPatternI | null>(null)

    useEffect(() => {
        if (init.current) {
            init.current = false;
            getAllPatterns(user.userId, setAllPatterns);
        }
    }, []);

    return (
        <div className={styles.allPatternsWrapper}>
            {!selectedPattern
                ? <>
                    <h3> Все шаблоны</h3>
                    <ul>
                        {
                            allPaterns.map(pattern =>
                                <li key={pattern.id + 'patItem'} onClick={() => setSelectedPattern(pattern)}>
                                    
                                    {pattern.name}
                                    
                                    {/* <ul>{Object.keys(pattern).map((key, idx) =>
                                        <li key={key + idx}>
                                            <span>{key} :</span>
                                            <span>{pattern[key]}</span>
                                        </li>)}
                                    </ul> */}
                                </li>)
                        }
                    </ul>
                </>
                : <div className={styles.selectedPattern}>
                    <img className={styles.close} onClick={()=>setSelectedPattern(null)} src="svg/org/close_field.svg" />
                    <div>ID : {selectedPattern.id}</div>
                    <div>Название : {selectedPattern.name}</div>
                    <div>Описание : "{selectedPattern.descriptions||'без описания'}"</div>
                    <div>Автор : 🆔 {selectedPattern.created_by}  ⌚{new Date(selectedPattern.createdAt+'').toLocaleString()}</div>
                    <div>Изменён : {selectedPattern.updated_by?"🆔"+selectedPattern.updated_by+"⌚"+new Date(selectedPattern.updatedAt+'').toLocaleString():"не изменялся"}</div>
                    <div>
                        Поля
                        <ul>
                        {JSON.parse(selectedPattern.fields+'').map((field:FieldI)=><li>{field.name}</li>)}
                        </ul>

                    </div>
                    <div>Линии</div>
                    <ul>
                        {JSON.parse(selectedPattern.lines + '').map((line: LineI) => <li>{line.name}</li>)}
                    </ul>
                    {/* <pre>
                        {JSON.stringify(selectedPattern, null, 2)}
                    </pre> */}
                </div>
            }

            {/* <pre>
                {JSON.stringify(allPaterns,null,2)}
            </pre> */}
        </div>
    )
}