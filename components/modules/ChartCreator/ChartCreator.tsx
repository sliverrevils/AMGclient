import useChart from "@/hooks/useChart";
import { FieldI, LineI } from "@/types/types";
import { useState } from "react"
import { useSelector } from "react-redux";
import styles from './chartCreator.module.scss';

export default function ChartCreatorScreen() {
    const [inputFieledName, setInputFieledName] = useState('');
    const [fields, setFields] = useState<Array<FieldI>>([]);
    const [addFieldsPanel, setAddFieldsPanel] = useState(false);
    const [addLinePanel, setAddLinePanel] = useState(false);
    const [chartName, setChartName] = useState('');
    const [logicString, setLogicString] = useState('');
    const [lineName, setLineName] = useState('');
    const [lineColor, setLineColor] = useState('#32c34a');
    const [lines, setLines] = useState<Array<LineI>>([]);
    const [chartSchema, setChartSchema] = useState({});
    const [inputDescriptions, setInputDescriptions] = useState('');
    const [type,setType] = useState('');
    const [fieldOptions,setFieldOptions] = useState('');


    const { createChartPattern } = useChart();
    const { user } = useSelector((state: any) => state.main);

    //FIELDS
    const addField = () => {
        let replacedOptions='';
        if(fieldOptions){
            replacedOptions=fieldOptions.replaceAll(' ','').split(',').map(el=>{
                const itemArr=el.split('=');
                return `"${itemArr[0]}":${itemArr[1]}`
            }).join();
        }
        
        setFields(state => ([...state, { id: state.length + 1, name: inputFieledName, type, fieldOptions:JSON.parse(`{${replacedOptions}}`) }]));
        setType('');
        setInputFieledName('');
        setAddFieldsPanel(false);
        setFieldOptions('');
    }

    const delField = (id: number) => {
        setFields(state => state.filter(el => el.id !== id));
    }

    const changeField = (id: number, text: string) => {
        setFields(state => state.map(el => {
            if (el.id == id) {
                el.name = text;
                return el;
            } else
                return el
        }))
    }

    //LINES
    const addLine = () => {
        setLines(state => ([...state, { id: state.length + 1, name: lineName, logicString, lineColor }]));
        setLineName('');
        setLogicString('');
        setLineColor('black');
        setAddLinePanel(false);
    }

    const createSchemaChart = () => {
        // alert(JSON.stringify({chartName,fields,logicString},null, 2));
        setChartSchema({ name: chartName, fields, lines });
        createChartPattern(chartName, fields, lines, inputDescriptions, user.userId)
        .then(()=>{
            setFields([]);
            setLines([]);
            setChartName('');
            setInputDescriptions('');
            setInputFieledName('');
            setLineName('');
            setLineColor('black');
        
        });
    }

    return (
        <div className={styles.chartCreatorWrapper}>
            <h3>Создание шаблона</h3>
            <div className={styles.nameWrap}>
                <span className={styles.helpText}>Название шаблона</span>               
                <input className={styles.patternName} placeholder="укажите название шаблна" value={chartName} onChange={event => setChartName(event.target.value)} />  
                <textarea placeholder="описание" value={inputDescriptions} onChange={event => setInputDescriptions(event.target.value)} />             
            </div>
            
            {
                addFieldsPanel
                    ? <div className={styles.addFieldWrap}>
                        <span className={styles.helpText}>Добавление поля</span>
                        <select value={type} onChange={event => setType(event.target.value)}>
                            <option value={''}>выберите тип поля</option>
                            <option value={'number'}>цифровое поле</option>
                            <option value={'select'}>поле выбора</option>
                        </select>
                        <input type="text" value={inputFieledName} onChange={event => setInputFieledName(event.target.value)} placeholder="название поля" />

                        {
                            type === 'select' && <>
                                <span className={styles.help}> пример поля со значениями : " поле1 = 22, поле2 = 33 "</span>
                                <span className={styles.help}> в заполнении шаблона, после выбора полю будет присвоено указанное значение"</span>
                                <input value={fieldOptions} onChange={event => setFieldOptions(event.target.value)} placeholder="опции поля со значениями" />

                            </>
                        }

                        <button className="btn" disabled={!((inputFieledName.length >= 3) && type)} onClick={addField}>Добавить поле</button>
                    </div>
                    : <button className="btn" onClick={() => setAddFieldsPanel(true)} disabled={!chartName.length} style={{width:300}}>Добавить поле в шаблон</button>
            }

            {
            addLinePanel
            ?<div className={styles.addLineWrap}>
            <span className={styles.helpText}>Добавление линии</span>           
                <input type="text" placeholder="название линии" value={lineName} onChange={event => setLineName(event.target.value)} />
                <span className={styles.help}>@index  - порядковый индекс записи в списке, отсчёт с нуля</span>
                <span className={styles.help}>@1 - обращение к первому полю схемы ( обращаться можно ко всем указывая их номер) </span>
                <span className={styles.help}>пример описания логики : " ( @1 + @index ) \ 2 "</span>
                <input type="text" style={{ color: `rgb(224, 4, 224)` }} placeholder="логика линии" value={logicString} onChange={event => setLogicString(event.target.value)} /> 
                <span className={styles.help}>цвет отображения линии на графике ( желательно выбирать не самые светлые оттенки) </span>              
                <input type={'color'} value={lineColor} onChange={event => setLineColor(event.target.value)} style={{ height: 30, borderRadius: 10 }} />
                <button className="btn" disabled={!(lineName.length >= 2 && (/@[1-9]/.test(logicString)||/@index/.test(logicString)) && !/[A-z,А-я]/.test(logicString.replaceAll('@index','')))} onClick={addLine}>Добавить линию</button>
            </div>
            :<button className="btn" onClick={() => setAddLinePanel(true)} disabled={!chartName.length} style={{width:300}}>Добавить линию в шаблон</button>
            }


            
            

            {
            !!chartName.length&&<><h2>Схема шаблона</h2>
            <div className={styles.patternShema}>

                <h3><span>назвние шаблона</span> {chartName}</h3>
                {
                    fields.map((field: any, idx: number) => <div key={field.id + '_field'} className={styles.addedField}>
                        <span><span>поле</span>@{field.id}</span>   

                        {field.type=='number'&&<input value={field.name} onChange={event => changeField(field.id, event.target.value)} />}

                        {field.type == 'select' &&
                            <div>
                                <span>{field.name}</span>
                                <select>
                                    {Object.keys(field.fieldOptions).map((option, idx) => <option key={idx + option} value={field.fieldOptions[option]}>{option}</option>)}
                                </select>
                            </div>
                        }

                        {fields.length - 1 == idx ? <span onClick={() => delField(field.id)}>❌</span> : <span> </span>}
                    </div>)
                }

                {
                    lines.map((line: LineI, idx: number) => <div key={line.id + '_line'} className={styles.addedLine}>

                        <div className={styles.line} style={{ background: line.lineColor }}>
                            <span><span>линия</span> {line.name} </span>
                            <span>{line.logicString}</span>
                        </div>
                    </div>)
                }

                {
                    inputDescriptions.length
                        ? <div className={styles.descriptions}>
                            <span>описание линии</span>
                            <div>{inputDescriptions}</div>
                        </div>
                        : ''
                }
                <button className="btn" onClick={createSchemaChart} disabled={!(chartName.length >= 2)}>Сохранить шаблон</button>
            </div>
            </>
            }

        {false&&<div>
            <h2>Chart scheme</h2>
            <pre>
                {JSON.stringify({
                    "name": "тест выбора",
                    "fields": [
                        {
                            "id": 1,
                            "name": "поле выбора",
                            "type": "select",
                            "fieldOptions": {
                                "меню1": 22,
                                "меню2": 33
                            }
                        }
                    ],
                    "lines": []
                }, null, 2)}
            </pre>

            <pre>{JSON.stringify(chartSchema, null, 2)}</pre>
        </div>}


        </div>
    )
}