import { StatHeaderI, StatRowI } from "@/types/types";
import styles from './table.module.scss';
import { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";



export default function TableHeader({ header,  headerIndex, isAdmin, setHeaders, headers, setRows ,setColumnsWidth,colWidth ,selectedHeaderPattern}
    :
    {
        header: StatHeaderI,
        //columnsWidth: number[],
        headerIndex: number,
        isAdmin: boolean,
        headers: StatHeaderI[],
        setHeaders: React.Dispatch<React.SetStateAction<StatHeaderI[]>>,
        setRows: React.Dispatch<React.SetStateAction<StatRowI[]>>,
        setColumnsWidth:React.Dispatch<React.SetStateAction<number[]>>,
        colWidth:number,
        selectedHeaderPattern:boolean,

    }) {

        //ref
        const initRef=useRef(true);

        //hooks
        const {width,height,ref} = useResizeDetector();
        
    
        //funcs

    const onDelHeader = (headerIndex, id: string) => {
        if (!confirm(`Удалть колонку "${headers[headerIndex].name}" со всеми данными ?`)) return;

        setHeaders(state => state.filter((header) => header.id !== id));
        setRows(state => state.map(row => ({ ...row, values: row.values.filter((item, itemIdx) => itemIdx !== headerIndex) })))

    }
    const onChangeHeaderName = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
        setHeaders(state => state.map(header => header.id == id ? { ...header, name: event.target.value } : header));
    }
    //header logic
    const onChangeHeaderLogic = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | null, id: string, value?: string) => {
        setHeaders(state => state.map(header => header.id == id ? { ...header, logicStr: value ? header.logicStr + value : event!.target.value } : header));
    }
    //header initValue
    const onChangeHeaderInitValue = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
        setHeaders(state => state.map(header => header.id == id ? { ...header, initValue: Number(event.target.value) } : header));
    }
    //header on chart
    const onChangeHeaderOnChart = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
        setHeaders(state => state.map(header => header.id == id ? { ...header, onChart: !header.onChart } : header));
    }

    //resize
    useEffect(()=>{
        if(initRef.current)
        initRef.current=false;
        else
        if(width){
            setColumnsWidth(state=>state.map((size,idx)=>idx==headerIndex?width:size))
        }
    },[width,header])




    return (
        <div  className={`${styles.headerItem} ${headerIndex>0&&selectedHeaderPattern?styles.selectPattern:''}`} ref={ref}  >

            <div className={styles.clientHeader} style={{ width: colWidth }}>
                <div>{header.name}</div>
                {
                    isAdmin&&!!!header.logicStr && !/период/g.test(header.name) &&
                    <div className={styles.headerDecor}>{`@${headerIndex+1}`}</div>
                }
            </div>

            {
                header.showControl && isAdmin
                &&
                <div className={styles.adminHeader}>
                        {
                            !!!header.logicStr && !/период/g.test(header.name) &&
                            <div className={styles.headerDecor}>
                                {`@${headerIndex + 1}`}
                            </div>
                        }
                    <input
                        type="text"
                        value={header.name}
                        onChange={event => onChangeHeaderName(event, header.id)}
                        disabled={!isAdmin}
                        placeholder="название колонки"
                    />
                    <div className={styles.logicWrap}>
                        <input type="text" value={header.logicStr} onChange={event => onChangeHeaderLogic(event, header.id)} placeholder="логика" />
                        <div className={styles.logicHelp}>
                            <div className={styles.columnsHelp}>
                                {
                                    headers.map((headerHelp, idx) => !headerHelp.logicStr && headerHelp.showControl && headerIndex != idx
                                        && (
                                            <div key={Math.random()} className={styles.columnHelpItem}>
                                                <div className={styles.columnHelpLast} onClick={() => onChangeHeaderLogic(null, header.id, `@@${idx + 1}`)}>⤴️</div>
                                                <div className={styles.columnHelpCurrent} onClick={() => onChangeHeaderLogic(null, header.id, `@${idx + 1}`)}>{headerHelp.name}</div>
                                            </div>
                                        ))
                                }
                            </div>
                            <div className={styles.mathHelp}>
                            <div className={styles.mathHelpItem} onClick={() => onChangeHeaderLogic(null, header.id, '@sum')}>суммировать</div>
                            <div className={styles.mathHelpItem} onClick={() => onChangeHeaderLogic(null, header.id, '@trend')}>тренд</div>
                                <div className={styles.mathHelpItem} onClick={() => onChangeHeaderLogic(null, header.id, '@revtrend')}>перевернутый тренд</div>
                                <div className={styles.mathHelpItem} onClick={() => onChangeHeaderLogic(null, header.id, '@init')}>нулевое значение</div>
                                
                                

                            </div>
                        </div>
                    </div>
                    <input type="number" onChange={event => onChangeHeaderInitValue(event, header.id)} placeholder="нулевое значене" />
                    <label style={{ display: 'flex' }} className={styles.displayOChart}><span>отобразить на графике</span><input type="checkbox" onChange={event => onChangeHeaderOnChart(event, header.id)} /></label>
                    <div onClick={() => onDelHeader(headerIndex, header.id)}>удалить колонку❌</div>
                </div>

            }
        </div>
    )
}