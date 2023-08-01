import useChart from "@/hooks/useChart"
import { ChartPatternI, FieldI, LineI, UserFullI, UserI } from "@/types/types";
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux";
import styles from './allPatterns.module.scss';
import useUsers from "@/hooks/useUsers";



export default function AllPatternsScreen() {
    const init = useRef(true);
    const [allPaterns, setAllPatterns] = useState<Array<ChartPatternI>>([]);
    const { user }: { user: UserI } = useSelector((state: any) => state.main);
    const { users }: { users: UserFullI[] } = useSelector((state: any) => state.users);
    const { getAllPatterns, addAccessToChart, removeAccessToChart } = useChart();
    const [selectedPattern, setSelectedPattern] = useState<number | null>(null);

    const [addAccessField, setAddAccessField] = useState(false);
    const [addAccessUserSelect, setAddAccessUserSelect] = useState('');

    const { userByID } = useUsers();
    const { deleteChartPattern } = useChart();

    //init
    useEffect(() => {
        if (init.current) {
            init.current = false;
            getAllPatterns(setAllPatterns);
        }
    }, []);

    
    //FIELDS
    const Field = ({ field, index }:{field:FieldI,index:number}) =>{
        const [inputLogic,setInputLogic] =useState(field.fieldLogic||'');
        const [inputSelectOptions,setInputSelectOptions] =useState(JSON.stringify(field.fieldOptions||''));
        const [fieldName,setFiledName]=useState(field.name||'');
       return (
       <li className={styles.fieldLine}  >
        {(field.type==='number'||field.type==='select')&&<span className={styles.decorator}>{`@${index+1}`}</span>}
            
            <input className={styles.fieldName} type={"text"} value={fieldName} onChange={event=>setFiledName(event.target.value)}/>            

            {field.type==='select'&&<input type={"text"} className={styles.options}  value={inputSelectOptions}  onChange={event=>setInputSelectOptions(event.target.value)} />}
            {field.type==='view'&&<input className={styles.logic} value={inputLogic} onChange={event=>setInputLogic(event.target.value)}/>}
        </li>
        )
        }

    //LINES
    //((line: LineI) => <li>{line.name}</li>)
    const Line = ({ line, index}:{line:LineI,index:number})=>{
        const [color,setColor] = useState(line.lineColor);
        const [lineName,setLineName]=useState(line.name||'');
        const [inputLogic,setInputLogic] =useState(line.logicString||'');
        return(
            <li className={styles.lineLine} style={{background:color}}>

                <input className={styles.lineName} type={"text"} value={lineName} onChange={event=>setLineName(event.target.value)}/>
                <input className={styles.lineLogic} type={"text"} value={inputLogic} onChange={event=>setInputLogic(event.target.value)}/>
                <input className={styles.lineColor} type={"color"} value={color} onChange={event=>setColor(event.target.value)}/>

                
            </li>
        )
    }

    return (
        <div className={styles.allPatternsWrapper}>
            {selectedPattern === null
                ? <>
                    <div className={styles.allPatterns}>
                        <h3 className={styles.title}> Все шаблоны</h3>
                        <ul>
                            {
                                allPaterns.map((pattern, idx: number) =>
                                    <li key={pattern.id + 'patItem'} onClick={(event: any) => event.target.tagName !== 'IMG' && setSelectedPattern(idx)}>
                                        <img className={styles.close} onClick={() => confirm(`Вы действительно хотите удалить шаблон "${pattern.name}" ?`) && deleteChartPattern(pattern.id, () => getAllPatterns( setAllPatterns))} src="svg/org/close_field_white.svg" />
                                        <div className={styles.patternName}>{pattern.name}</div>
                                        <div className={styles.patternDescriptions}>{pattern.descriptions || 'без описания'}</div>
                                        <div className={styles.patternCreate}>
                                            <img src={'svg/org/user_white.svg'} />
                                            <span>{userByID(pattern.created_by)?.name || 'пользователь удалён'}</span>
                                            <img src={'svg/org/time_white.svg'} />
                                            <span>{new Date(pattern.createdAt + '').toLocaleString()}</span>
                                        </div>

                                    </li>)
                            }
                        </ul>
                    </div>
                </>
                : <div className={styles.selectedPattern}>
                    <img className={styles.close} onClick={() => setSelectedPattern(null)} src="svg/org/close_field_white.svg" />
                    <div className={styles.namePattern}>{allPaterns[selectedPattern].name}</div>
                    <div className={styles.propsWrap}>
                        <div className={styles.prop}><span>ID </span><span> {allPaterns[selectedPattern].id}</span></div>
                        <div className={styles.prop}><span>Описание </span><span>  {allPaterns[selectedPattern].descriptions || 'без описания'}</span></div>
                        <div className={styles.prop}><span>Автор </span><span>  {userByID(allPaterns[selectedPattern].created_by)?.name || "пользователь удалён"} </span></div>
                        <div className={styles.prop}><span>Создан </span><span>  {new Date(allPaterns[selectedPattern].createdAt + '').toLocaleString()}</span></div>
                        <div className={styles.prop}><span>Изменён </span><span>  {allPaterns[selectedPattern].updated_by ? "🆔" + allPaterns[selectedPattern].updated_by + "⌚" + new Date(allPaterns[selectedPattern].updatedAt + '').toLocaleString() : "не изменялся"}</span></div>
                    </div>
                    <div className={styles.accessWrap}>
                        <span className={styles.title}>Доступ к использованию шаблону</span>

                        {
                            addAccessField
                                ? <div className={styles.addAccessField}>
                                    <select value={addAccessUserSelect} onChange={event => setAddAccessUserSelect(event.target.value)} >
                                        <option value={''}>выбор пользователя</option>
                                        {
                                            users.map(user =>
                                                <option value={user.id} key={user.id+'_user'}>{user.name}</option>
                                            )
                                        }
                                    </select>
                                    <button disabled={!!!addAccessUserSelect} onClick={() => addAccessToChart(allPaterns[selectedPattern].id, +addAccessUserSelect, () => getAllPatterns( setAllPatterns))} >добавить доступ</button>
                                    <button onClick={() => setAddAccessField(false)}>отмена</button>
                                </div>
                                : <img className={styles.addBtn} src={'svg/org/user_add.svg'} onClick={() => setAddAccessField(true)} />
                        }

                        <ul className={styles.accessedFor}>
                            {
                                (allPaterns[selectedPattern].access as number[]).map((userId, idx: number) => {
                                    const userIdx = users.findIndex(user => user.id == userId)
                                    if (userIdx < 0) return <li><span>Пользователь удалён</span> <span onClick={() => removeAccessToChart(allPaterns[selectedPattern].id, userId, () => getAllPatterns( setAllPatterns))}>❌</span></li>
                                    return (
                                        <li key={userId+'_userId'}>
                                            <span className={styles.index}>{idx + 1}</span>
                                            <span className={styles.name}>{users[userIdx].name}</span>

                                            <img className={styles.addBtn} src={'svg/org/user_del_white.svg'} onClick={() => removeAccessToChart(allPaterns[selectedPattern].id, userId, () => getAllPatterns( setAllPatterns))} />
                                        </li>)
                                })
                            }
                        </ul>


                    </div>
                    <div>Поля</div>
                    <ul>
                        {allPaterns[selectedPattern].fields.map((field: FieldI, index: number) => <Field key={'_field_'+field.id} field={field} index={index}/>)}
                    </ul>


                    <div>Линии</div>
                    <ul>
                        {allPaterns[selectedPattern].lines.map((line: LineI,index:number) => <Line key={'_line_'+line.id} line={line} index={index} />)}
                    </ul>
                    {/* <pre>
                        {JSON.stringify(allPaterns[selectedPattern], null, 2)}
                    </pre> */}
                </div>
            }

            {/* <pre>
                {JSON.stringify(allPaterns,null,2)}
            </pre> */}
        </div>
    )
}