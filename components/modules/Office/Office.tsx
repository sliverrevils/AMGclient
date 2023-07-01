import { OfficeI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss'
import Depatment from "../Depatment/Depatment";
import { useState } from "react";
import useOrg from "@/hooks/useOrg";


export default function Office({ officeItem, updateOrgScheme, users, userById, charts }: { officeItem: OfficeI | undefined, updateOrgScheme: any, users: Array<UserFullI>, userById: any, charts: any[] }) {

    const [inputDepatmentName, setInputDepartmentName] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [addDepatment, setAddDepartment] = useState(false);
    const [departmentsOpen, setDepartmentsOpen] = useState(false);
    const [inputLeadership, setInputLeadership] = useState('');
    const [inputDescriptions, setInputDescriptions] = useState('');
    const [inputCkp, setInputCkp] = useState('');

    const departmentsOpenToggle = () => setDepartmentsOpen(state => !state);
    const { deleteOffice, createDepartment } = useOrg();

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
                        <div className={styles.officeName}>
                        <img src="svg/org/vaadin_office.svg" />
                            <span>{officeItem.name}</span>
                        </div>
                        <img src="svg/org/delete_white.svg" onClick={() => confirm(`Вы точно хотите удалить оффис "${officeItem.name}" ?`)&&deleteOffice(officeItem.id, updateOrgScheme)} />
                    </div>
                    <div className={styles.officeBody}>
                    <div className={styles.propLine}> <img src="svg/org/leadership.svg" /><span>{officeItem.leadership ? userById(+officeItem.leadership)?.name : "не установлен"}</span></div>
                    <div className={styles.propLine}><img src="svg/org/ckp.svg" /><span>{officeItem.ckp}</span></div>
                    <div className={styles.propLine}> <img src="svg/org/description.svg" /> <span>{officeItem.descriptions || 'нет описания'}</span></div>
                    <div className={styles.addItemBtn} onClick={addDepartmentToggle} style={{background:'steelblue'}}>
                            Добавить отдел
                            <img src="svg/org/add_white.svg" />
                        </div> 

                    </div>

                </div>

                <div className={` ${styles.departmentsList}`}>
                  
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
                            <select value={inputLeadership} onChange={event => setInputLeadership(event.target.value)}>
                                {users.map(user => <option key={user.id + user.name + '_userItem'} value={user.id}>id:{user.id} {user.name}</option>)}
                            </select>
                            <span className={styles.addHelp}>КЦП отдела</span>
                            <textarea value={inputCkp} onChange={event => setInputCkp(event.target.value)} placeholder="ЦКП" />
                            <span className={styles.addHelp}>Описание отдела</span>
                            <textarea value={inputDescriptions} onChange={event => setInputDescriptions(event.target.value)} />
                            <button onClick={creaetDepartmentHandle} className="add">Создать отдел</button>
                            <img src="svg/org/close_field.svg" onClick={addDepartmentToggle} className={styles.close} />
                            </div>
                        </div>
                    }

                    {
                        officeItem.departments.map((department, indexDep:number) => <Depatment key={department.id + '_departmentItem'} departmentItem={department} {...{ charts, users, userById, updateOrgScheme, office_id: officeItem.id, indexDep }} />)
                    }
                    
                </div>

            </div>

        </>
    )
}