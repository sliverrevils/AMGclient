import { OfficeI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss'
import Depatment from "../Depatment/Depatment";
import { useEffect, useState } from "react";
import useOrg from "@/hooks/useOrg";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import usePatterns from "@/hooks/usePatterns";
import { celarPeriodStats, clearStatName } from "@/utils/funcs";


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
    //const { patterns } = useSelector((state: StateReduxI) => state.patterns);
    const {tableStatisticsList}=useSelector((state:StateReduxI)=>state.stats);

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

    //PATTERNS
    const { patterns } = useSelector((state: StateReduxI) => state.patterns);
    const { addOfficePattern, delOfficePattern, setOfficeMainPattern } = usePatterns();
    const [patternSelect, setPatternSelect] = useState(officeItem.mainPattern || 0);
    const [addPatternSelect, setAddPatternSelect] = useState(0);

    const onSelectPattern = (event) => {
        setPatternSelect(+event.target.value);
        setOfficeMainPattern(officeItem.id, +event.target.value);
    }

    const onAddPattern = () => {
        addOfficePattern(officeItem.id, addPatternSelect);
        setAddPatternSelect(0);
    };


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
                        <div className={`${styles.propLine} ${styles.hideFieldFlex}`}>
                            <img src="svg/org/description.svg" />
                            <textarea value={officeDescriptions} spellCheck="false" onChange={event => setOfficeDescriptions(event.target.value)} disabled={!isAdmin} />
                        </div>

                        <div className={`${styles.patternsBlock} ${styles.hideField}`}>
                            <div className={styles.textInfo}>Главная статистика</div>
                            <select value={patternSelect} onChange={onSelectPattern} disabled={!isAdmin}>
                                <option value={0}>Выберите главную статистику</option>
                                {
                                    celarPeriodStats(tableStatisticsList).map(pattern => <option key={pattern.id + '_patternItem'} value={pattern.id}>{clearStatName(pattern.name)}</option>)
                                }
                            </select>

                            <div>
                                <span className={styles.textInfo} >Дополнительные статистики</span>
                                {
                                    isAdmin && <div>
                                        {/* <span className={styles.textInfo}> Добавление дополнительной статистики </span> */}
                                        <div style={{ display: "flex" }}>
                                            <select value={addPatternSelect} onChange={event => setAddPatternSelect(+event.target.value)}>
                                                <option value={0}>Выберите дополнительные статистики</option>
                                                {
                                                    celarPeriodStats(tableStatisticsList).map(pattern => <option key={pattern.id + '_addpatternItem'} value={pattern.id}>{clearStatName(pattern.name)}</option>)
                                                }
                                            </select>
                                            <span onClick={onAddPattern} style={{ cursor: 'pointer' }}>➕</span>
                                        </div>
                                    </div>
                                }

                                <div className={styles.patternsList}>
                                    {
                                        officeItem.patterns.map(id => {
                                            const pattern = tableStatisticsList.find(pattern => pattern.id == id);
                                            return <div>
                                                📉
                                                {clearStatName(pattern?.name|| 'статистика удалена') }
                                                {isAdmin && <span style={{ cursor: 'pointer' }} onClick={() => delOfficePattern(officeItem.id, id)}>❌</span>}
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className={styles.addItemBtn} onClick={addDepartmentToggle} style={{ background: 'steelblue' }}>
                                    Добавить отдел
                                    <img src="svg/org/add_white.svg" />
                                </div>
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