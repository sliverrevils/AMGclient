import { DepartmentI, OfficeI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss';
import Section from "../Section/Section";
import { useState } from "react";
import useOrg from "@/hooks/useOrg";


export default function Depatment({ departmentItem, users, userById, updateOrgScheme, office_id, charts }: { departmentItem: DepartmentI, users: Array<UserFullI>, userById: any, updateOrgScheme: any ,office_id:number, charts: any[] }) {

    const [sectionsOpen, setSectionsOpen] = useState(false);
    const sectionsOpenToggle = () => setSectionsOpen(state => !state);
    const { deleteDepartment } = useOrg();
    const [addSection, setAddSection] = useState(false);
    const [inputSectionName, setInputSectionName]=useState('');
    const [inputDescriptions,setInputDescriptions] = useState('');
    const [inputCkp, setInputCkp] = useState('');

    const {createSection} = useOrg();

    const addSectionToggle = () => setAddSection(state => {
        if(state){
            
            setInputSectionName('');
            setInputDescriptions('');
            setSectionsOpen(true);
        }
        return !state
    });

    const creaetDepartmentHandle = () => {
        createSection(inputSectionName,inputDescriptions,office_id,departmentItem.id,inputCkp)
            .then(data => {
                if (data) {
                    updateOrgScheme();
                    setInputSectionName('');
                    setInputDescriptions('');
                    setAddSection(false);
                    setInputCkp('');
                    setInputDescriptions('');
                }
            });
    }

    return (
        <div className={styles.departmentItem}>
            <div className={styles.departmentHead} >
                <div className={'org_title_line2'}> <img src="svg/org/department.svg"/><span> Отдел: {departmentItem.name}</span></div>              
                <div onClick={() => deleteDepartment(departmentItem.id, updateOrgScheme)}><img src="svg/org/delete.svg"/></div>
            </div>

            <div className="org_param_line"> <img src="svg/org/leadership.svg"/>{departmentItem.leadership ? userById(+departmentItem.leadership)?.name : "не установлен"}</div> 
            <div className="org_param_line"><img src="svg/org/ckp.svg"/>{departmentItem.ckp}</div> 
            <div className="org_param_line"><img src="svg/org/code.svg"/>{departmentItem.code}</div> 
            <div className="org_param_line"><img src="svg/org/description.svg"/>{departmentItem.descriptions || 'нет описания'}</div>
            
            <div className={styles.sectionsList}>
                <div className={styles.sectionsListHead} onClick={sectionsOpenToggle}>
                        <div className={`org_param_line`} > <img src="svg/org/section.svg"/><span> секции : {departmentItem.sections.length}</span></div>
                        {departmentItem.sections.length?<img className="open_list" src={`svg/org/${sectionsOpen?"arrow_dawn":"arrow_up"}.svg`}/>:<span> </span> }                                              
                         <img src="svg/org/add.svg" onClick={addSectionToggle}/>
                </div>
                {
                addSection
                    && 
                    <div className="addField">
                        <h3>Новая секция</h3>
                        <input type="text" value={inputSectionName} onChange={event => setInputSectionName(event.target.value)} placeholder="название секции" />
                        <input type="text" value={inputCkp} onChange={event => setInputCkp(event.target.value)} placeholder="ЦКП" />
                        <textarea value={inputDescriptions} onChange={event=>setInputDescriptions(event.target.value)} placeholder="Описание секции"/> 
                        <button onClick={creaetDepartmentHandle}>Добавить секцию</button>
                        <img src="svg/org/close_field_white.svg" onClick={addSectionToggle} className="close"/>
                    </div>                   
            }
                {
                    sectionsOpen && departmentItem.sections.map(section => <Section key={section.id + '_sectionItem'} sectionItem={section} {...{charts, users, userById, updateOrgScheme, office_id, department_id:departmentItem.id }} />)
                }
            </div>
        </div>
    )
}