import { OfficeI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss'
import Depatment from "../Depatment/Depatment";
import { useEffect, useState } from "react";
import useOrg from "@/hooks/useOrg";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";


export default function Office({ officeItem, updateOrgScheme, users, userById, charts, isAdmin }: { officeItem: OfficeI | undefined, updateOrgScheme: any, users: Array<UserFullI>, userById: any, charts: any[], isAdmin: boolean }) {
    //STATE
    const [inputDepatmentName, setInputDepartmentName] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [addDepatment, setAddDepartment] = useState(false);
    const [departmentsOpen, setDepartmentsOpen] = useState(false);
    const [inputLeadership, setInputLeadership] = useState('');
    const [inputDescriptions, setInputDescriptions] = useState('');
    const [inputCkp, setInputCkp] = useState('');
    //update
    const [updated, setUpdated] = useState(false);
    const [officeName, setOfficeName] = useState(officeItem?.name || '');
    const [officeLeadership, setOfficeLeadership] = useState(officeItem?.leadership || null);
    const [officeDescriptions, setOfficeDescriptions] = useState(officeItem?.descriptions || '');
    const [officeCkp, setOfficeCkp] = useState(officeItem?.ckp || '');
    //patterns
    const [mainPattern, setMainPattern] = useState(0);
    const [isAddAdditionalPatternBlock, setIsAddAdditionalPatternBlock] = useState(false);
    const [additionalPatternsSelect, setAdditionalPatternsSelect] = useState(0);
    const [additionalPatterns, setAdditionalPatterns] = useState<Array<number>>([]);

    //SELECTORS
    const { patterns } = useSelector((state: StateReduxI) => state.patterns);

    //HOOKS


    //FUNCS
    const updateOfficeHandle = () => {
        updateOffice(officeItem!.id, officeName, officeLeadership, officeDescriptions, officeCkp, () => { updateOrgScheme(), setUpdated(false) });
    }

    useEffect(() => {
        if (
            officeItem!.name !== officeName
            || officeItem!.descriptions !== officeDescriptions
            || officeItem!.ckp !== officeCkp
            || officeItem?.leadership !== officeLeadership
        )
            setUpdated(true);
        else
            setUpdated(false);
    }, [officeName, officeDescriptions, officeCkp, officeLeadership])

    //update/

    const departmentsOpenToggle = () => setDepartmentsOpen(state => !state);
    const { deleteOffice, createDepartment, updateOffice } = useOrg();

    const addDepartmentToggle = () => setAddDepartment(state => !state);

    if (!officeItem) {
        return <>not found</>
    }

    const creaetDepartmentHandle = () => {
        createDepartment(officeItem.id, inputDepatmentName, inputCode, +inputLeadership, inputDescriptions, inputCkp)
            .then(data => {
                if (data) {
                    updateOrgScheme();
                    setInputDepartmentName('');
                    setInputCode('');
                    setAddDepartment(false);
                    setInputCkp('');
                    setInputDescriptions('');
                }
            });
    }


    return (
        <>
            <div key={officeItem.id + '_office'} className={styles.officeItem}>

                <div className={styles.office}>
                    <div className={styles.officeHead}>
                        <div className={styles.help}>отделение</div>
                        {
                            updated && isAdmin
                                ? <div className={styles.update} onClick={updateOfficeHandle}>
                                    <img src="svg/org/update_white.svg" />
                                </div>
                                : <div className={styles.update}></div>
                        }
                        <div className={styles.officeName}>
                            {/* <img src="svg/org/vaadin_office.svg" /> */}
                            <input value={officeName} onChange={event => setOfficeName(event.target.value)} disabled={!isAdmin} />
                        </div>
                        {
                            isAdmin &&
                            <img src="svg/org/delete_white.svg" onClick={() => confirm(`Вы точно хотите удалить оффис "${officeItem.name}" ?`) && deleteOffice(officeItem.id, updateOrgScheme)} />
                        }
                    </div>

                    <div className={styles.officeBody}>
                        <div className={styles.propLine}>
                            <img src="svg/org/leadership.svg" />
                            <select value={officeLeadership || ''} onChange={event => setOfficeLeadership(+event.target.value)} disabled={!isAdmin}>
                                <option value={''}>выбор руководителя</option>
                                {users.map(user => <option key={user.id + user.name} value={user.id}>id:{user.id} {user.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.propLine}>
                            <img src="svg/org/ckp.svg" />
                            <textarea value={officeCkp} spellCheck="false" onChange={event => setOfficeCkp(event.target.value)} disabled={!isAdmin} />
                        </div>
                        <div className={styles.propLine}>
                            <img src="svg/org/description.svg" />
                            <textarea value={officeDescriptions} spellCheck="false" onChange={event => setOfficeDescriptions(event.target.value)} disabled={!isAdmin} />
                        </div>
                        {
                            isAdmin &&
                            <>
                                <div className={styles.patternControlBlock}>
                                    <div className={styles.propLine}>
                                        <img src="svg/org/chart.svg" />
                                        <select value={mainPattern || ''} onChange={event => setMainPattern(+event.target.value)} disabled={!isAdmin}>
                                            <option value={''}>выбор главного шаблона</option>
                                            {
                                                patterns.map(pattern => <option key={pattern.id + pattern.name} value={pattern.id}>{pattern.name}</option>)
                                            }
                                        </select>
                                    </div>

                                    {
                                        // PATTERNS BLOCK
                                        isAddAdditionalPatternBlock
                                            ?
                                            <div className={styles.addPatternBlock}>
                                                <select value={additionalPatternsSelect || ''} onChange={event => setAdditionalPatternsSelect(+event.target.value)} disabled={!isAdmin}>
                                                    <option value={''}>выбор дополнительного шаблона</option>
                                                    {
                                                        patterns.map(pattern => <option key={pattern.id + pattern.name} value={pattern.id}>{pattern.name}</option>)
                                                    }
                                                </select>
                                                <div className={styles.addPatternBtns}>
                                                    <div onClick={()=>setAdditionalPatterns(state=>[...new Set([...state,additionalPatternsSelect])])}>➕</div>
                                                    <div onClick={()=>setAdditionalPatterns(state=>state.filter(patternId=>patternId!==additionalPatternsSelect))}>➖</div>
                                                    <div onClick={() => setIsAddAdditionalPatternBlock(false)}>✖️</div>
                                                </div>
                                            </div>
                                            : <div className={styles.addPatternBtn} onClick={()=>setIsAddAdditionalPatternBlock(true)}>
                                                <img src="svg/org/chart_add.svg" />
                                            </div>
                                    }
                                    <ul className={styles.additionalPatternsList}>
                                    {

                                        additionalPatterns.map(patternID=>{
                                            const pattern=patterns.find(pattern=>pattern.id==patternID);
                                            if(pattern){
                                                return <li>
                                                    <img src="svg/org/chart.svg" />
                                                    <span>{pattern.name}</span></li>
                                            }
                                        })
                                    }
                                    </ul>
                                </div>


                                <div className={styles.addItemBtn} onClick={addDepartmentToggle} style={{ background: 'steelblue' }}>
                                    Добавить отдел
                                    <img src="svg/org/add_white.svg" />
                                </div>

                            </>
                        }
                    </div>

                </div>

                <div className={` ${styles.departmentsList}`} style={{ justifyContent: officeItem.departments.length < 3 ? 'center' : 'left' }}>

                    {
                        addDepatment
                        &&
                        <div className={styles.addDepartmentForm}>
                            <div className={styles.addForm} >
                                <h3>Новый отдел</h3>
                                <span className={styles.addHelp}>Название отдела</span>
                                <input type="text" value={inputDepatmentName} onChange={event => setInputDepartmentName(event.target.value)} placeholder="название отдела" />
                                <span className={styles.addHelp}>код отдела</span>
                                <input type="text" value={inputCode} onChange={event => setInputCode(event.target.value)} placeholder="код отдела" />
                                <span className={styles.addHelp}>Руководитель отдела</span>
                                <select value={inputLeadership} onChange={event => setInputLeadership(event.target.value)} >
                                    {
                                        users.map(user => <option key={user.id + user.name + '_userItem'} value={user.id}>id:{user.id} {user.name}</option>)
                                    }
                                </select>
                                <span className={styles.addHelp}>КЦП отдела</span>
                                <textarea value={inputCkp} onChange={event => setInputCkp(event.target.value)} placeholder="ЦКП" spellCheck={false} />
                                <span className={styles.addHelp}>Описание отдела</span>
                                <textarea value={inputDescriptions} onChange={event => setInputDescriptions(event.target.value)} />
                                <button onClick={creaetDepartmentHandle} className="add">Создать отдел</button>
                                <img src="svg/org/close_field.svg" onClick={addDepartmentToggle} className={styles.close} />
                            </div>
                        </div>
                    }

                    {
                        officeItem.departments.map((department, indexDep: number) => <Depatment key={department.id + '_departmentItem'} departmentItem={department} {...{ charts, users, userById, updateOrgScheme, office_id: officeItem.id, indexDep, isAdmin }} />)
                    }

                </div>


            </div>

        </>
    )
}