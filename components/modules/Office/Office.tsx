import { OfficeI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss'
import Depatment from "../Depatment/Depatment";
import { useState } from "react";
import useOrg from "@/hooks/useOrg";


export default function Office({ officeItem, updateOrgScheme, users, userById, charts }: { officeItem: OfficeI|undefined, updateOrgScheme: any, users: Array<UserFullI>, userById: any, charts: any[] }) {

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

    if(!officeItem){
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

                <div className={styles.officeHead}>
                    <div className={'org_title_line1'}><img src="svg/org/office.svg" /><span>Отделение: {officeItem.name}</span></div>
                    <img  src="svg/org/delete.svg" onClick={() => deleteOffice(officeItem.id, updateOrgScheme)} />
                </div>

                <div className="org_param_line"> <img src="svg/org/leadership.svg" /><span>{officeItem.leadership ? userById(+officeItem.leadership)?.name : "не установлен"}</span></div>
                <div className="org_param_line"><img src="svg/org/ckp.svg" /><span>{officeItem.ckp}</span></div>
                <div className="org_param_line"> <img src="svg/org/description.svg" /> <span>{officeItem.descriptions || 'нет описания'}</span></div>
                <div className={` ${styles.departmentsList} ${departmentsOpen ? styles.departmentsListOpen : ''}`}>
                    <div className={styles.departmentsListHead} onClick={departmentsOpenToggle}>

                        <div className="org_param_line" ><img src="svg/org/department.svg" />отделы: {officeItem.departments.length}</div>
                        {
                            officeItem.departments.length
                                ? <img className="open_list" src={`svg/org/${departmentsOpen ? "arrow_dawn" : "arrow_up"}.svg`}  />
                                : <span> </span>
                        }
                        {
                            !addDepatment
                                ? <img src="svg/org/add.svg" onClick={addDepartmentToggle} />
                                : <span> </span>
                        }
                    </div>
                    {
                        addDepatment
                        &&
                        <div className="addField">
                            <h3>Новый отдел</h3>
                            <input type="text" value={inputDepatmentName} onChange={event => setInputDepartmentName(event.target.value)} placeholder="название отдела" />
                            <input type="text" value={inputCode} onChange={event => setInputCode(event.target.value)} placeholder="код отдела" />
                            <select value={inputLeadership} onChange={event => setInputLeadership(event.target.value)}>
                                {users.map(user => <option key={user.id + user.name + '_userItem'} value={user.id}>id:{user.id} {user.name}</option>)}
                            </select>
                            <input type="text" value={inputCkp} onChange={event => setInputCkp(event.target.value)} placeholder="ЦКП" />
                            <textarea value={inputDescriptions} onChange={event => setInputDescriptions(event.target.value)} />
                            <button onClick={creaetDepartmentHandle} className="add">Создать отдел✅</button>
                            <img src="svg/org/close_field_white.svg" onClick={addDepartmentToggle} className="close" />
                        </div>
                    }

                    {
                        departmentsOpen && officeItem.departments.map(department => <Depatment key={department.id + '_departmentItem'} departmentItem={department} {...{ charts, users, userById, updateOrgScheme, office_id: officeItem.id }} />)
                    }
                </div>

            </div>

        </>
    )
}