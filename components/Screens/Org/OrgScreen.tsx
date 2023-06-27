import useOrg from "@/hooks/useOrg";
import { OfficeI, UserFullI } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import styles from './org.module.scss';
import Office from "@/components/modules/Office/Office";
import Modal from "@/components/elements/Modal/Modal";


export default function OrgScreen() {
    let { current: init } = useRef(true);
    const [org, setOrg] = useState<Array<OfficeI>>([]);
    const [users, setUsers] = useState<Array<UserFullI>>([]);
    const [charts,setCharts]=useState([]);
    const { getOrgFullScheme, createOffice } = useOrg();
    const [inputOfficeName, setinputOfficeName] = useState('');
    const [inputCkp, setInputCkp] = useState('');
    const [addOffice, setAddOffice] = useState(false);
    const [inputLeadership, setInputLeadership] = useState('');
    const [inputDescriptions, setInputDescriptions] = useState('');
    const [currentOfficeId,setCurrentOfficeId]=useState<number|null>(null);

    const addOfficeToggle = () => setAddOffice(state => !state);
    const updateOrgScheme = () => getOrgFullScheme(setOrg, setUsers, setCharts);

    const userById = (id: number) => users.find(el => el.id === id);
    const creaetOfficeHandle = () => {
        createOffice(inputOfficeName, +inputLeadership || null, inputDescriptions, inputCkp)
            .then(data => {
                if (data) {
                    updateOrgScheme();
                    setinputOfficeName('');
                    setAddOffice(false);
                    setInputCkp('');
                    setInputDescriptions('');
                    setInputLeadership('');
                }
            });
    }

    useEffect(() => {
        if (init) {
            init = false;
            updateOrgScheme();
        }
    }, [])

    useEffect(() => {
        console.log('Leader ', inputLeadership)
    }, [inputLeadership])
    return (
        <div className={styles.orgWrap}>
            {
            !!currentOfficeId&&
            <Modal closeModalFunc={()=>setCurrentOfficeId(null)}>
                <div style={{color:'white'}}> dsadas</div>
                <Office officeItem={org.find(office=>office.id==currentOfficeId)} {...{ charts, updateOrgScheme, users, userById, setCurrentOfficeId}}/>
            </Modal>
            }

            <div className={styles.orgHead}>
                
                <h2>Отделения</h2>
                {
                    addOffice
                        ? <div className={`addField`}>
                            <h3>Новое отделение</h3>
                            <input type="text" value={inputOfficeName} onChange={event => setinputOfficeName(event.target.value)} placeholder="Назавние отделения" />
                            <input type="text" value={inputCkp} onChange={event => setInputCkp(event.target.value)} placeholder="ЦКП" />
                            <select value={inputLeadership} onChange={event => setInputLeadership(event.target.value)}>
                                <option value={''}>выбор руководителя</option>
                                {users.map(user => <option key={user.id + user.name} value={user.id}>id:{user.id} {user.name}</option>)}
                            </select>
                            <textarea value={inputDescriptions} onChange={event => setInputDescriptions(event.target.value)} placeholder="Описание отделения"/>
                            <button onClick={creaetOfficeHandle} className="add">Создать офис✅</button>
                            <img src="svg/org/close_field_white.svg" onClick={addOfficeToggle} className="close"/>
                        </div>
                        : <div onClick={addOfficeToggle} className={styles.addOfficeBtn}>
                            <img src="svg/org/vaadin_office.svg" />
                            <span>+</span>
                            </div>

                }
            </div>
            {/* <pre>{JSON.stringify(org, null, 2)}</pre> */}
            <div className={styles.officeList}>
                {
                    org.map((office, idx:number )=> {

                        return<div className={styles.tableItem} onClick={()=>setCurrentOfficeId(office.id)}>
                            <div className={styles.officeHead}>
                                <div className={styles.officeNumber}>
                                    <span>{idx}</span>
                                    <img src="svg/org/vaadin_office.svg" />
                                </div>
                                <div className={styles.officeName} > {office.name}</div>
                            </div>
                            
                            <div className={styles.leadership}>
                                {userById(office.leadership)?.name}
                            </div>
                            <div className={styles.help} >Руководитель отделения</div>

                            <div className={styles.ckp}>
                                {office.ckp}
                            </div>
                            <div className={styles.help} >ЦКП</div>

                        {/* <Office key={office.id + '_officeItem'} officeItem={office} {...{ charts, updateOrgScheme, users, userById, setCurrentOfficeId}}/> */}
                        </div>
                    
                })
                }
            </div>
        </div>
    )
}