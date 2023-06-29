import { DepartmentI, OfficeI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss';
import Section from "../Section/Section";
import { useState } from "react";
import useOrg from "@/hooks/useOrg";


export default function Depatment({ departmentItem, users, userById, updateOrgScheme, office_id, charts }: { departmentItem: DepartmentI, users: Array<UserFullI>, userById: any, updateOrgScheme: any, office_id: number, charts: any[] }) {

    const [sectionsOpen, setSectionsOpen] = useState(false);
    const sectionsOpenToggle = () => setSectionsOpen(state => !state);
    const { deleteDepartment } = useOrg();
    const [addSection, setAddSection] = useState(false);
    const [inputSectionName, setInputSectionName] = useState('');
    const [inputDescriptions, setInputDescriptions] = useState('');
    const [inputCkp, setInputCkp] = useState('');

    const { createSection } = useOrg();

    const addSectionToggle = () => setAddSection(state => {
        if (state) {

            setInputSectionName('');
            setInputDescriptions('');
            setSectionsOpen(true);
        }
        return !state
    });

    const creaetDepartmentHandle = () => {
        createSection(inputSectionName, inputDescriptions, office_id, departmentItem.id, inputCkp)
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
        <div className={styles.department}>
            <div className={styles.departmentItem}>
                <div className={styles.departmentHead} >
                    <div className={styles.departmentName}>
                        {/* <img src="svg/org/department.svg" /> */}
                        <span>{departmentItem.name}</span>
                    </div>
                    <img src="svg/org/delete_white.svg" onClick={() => confirm(`Вы точно хотите удалить отдел "${departmentItem.name}" ?`) && deleteDepartment(departmentItem.id, updateOrgScheme)} />

                </div>

                <div className={styles.depatmentBody}>
                    <div className={styles.propLine}> <img src="svg/org/leadership.svg" />{departmentItem.leadership ? userById(+departmentItem.leadership)?.name : "не установлен"}</div>
                    <div className={styles.propLine}><img src="svg/org/ckp.svg" />{departmentItem.ckp}</div>
                    <div className={styles.propLine}><img src="svg/org/code.svg" />{departmentItem.code}</div>
                    <div className={styles.propLine}><img src="svg/org/description.svg" />{departmentItem.descriptions || 'нет описания'}</div>

                    <div className={styles.addItemBtn} onClick={addSectionToggle} style={{background:'#2a9955d7'}}>
                        Добавить секцию
                        <img src="svg/org/add_white.svg" />
                    </div>
                </div>


            </div>

            <div className={styles.sectionsList}>

                {
                    addSection
                    &&
                    <div className={styles.addSectionForm}>
                        <div className={styles.addForm} >
                            <h3>Новая секция</h3>
                            <span className={styles.addHelp}>Название секции</span>
                            <input type="text" value={inputSectionName} onChange={event => setInputSectionName(event.target.value)} placeholder="название секции" />
                            <span className={styles.addHelp}>КПЦ секции</span>
                            <textarea value={inputCkp} onChange={event => setInputCkp(event.target.value)} placeholder="ЦКП" />
                            <span className={styles.addHelp}>Описание секции</span>
                            <textarea value={inputDescriptions} onChange={event => setInputDescriptions(event.target.value)} placeholder="Описание секции" />
                            <button onClick={creaetDepartmentHandle}>Добавить секцию</button>
                            {/* <img src="svg/org/close_field_white.svg" onClick={addSectionToggle} className="close" /> */}
                            <img src="svg/org/close_field.svg" onClick={addSectionToggle} className={styles.close} />
                        </div>
                    </div>
                }
                {
                    departmentItem.sections.map((section, index: number) => <Section key={section.id + '_sectionItem'} sectionItem={section} {...{ charts, users, userById, updateOrgScheme, office_id, department_id: departmentItem.id, index }} />)
                }
            </div>
        </div>
    )
}