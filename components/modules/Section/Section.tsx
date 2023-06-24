import { AdministratorI, ChartI, OfficeI, SectionI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss';
import useOrg from "@/hooks/useOrg";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import AdministratorsList from "../AdministratorsList/AdministratorsList";

export default function Section({ sectionItem, users, userById, updateOrgScheme, office_id, department_id, charts }: { sectionItem: SectionI, users: Array<UserFullI>, userById: any, updateOrgScheme: any, office_id: number, department_id: number, charts: Array<ChartI> }) {

    // const administrators: Array<number> = JSON.parse(sectionItem.administrators);
    const [inputAddAdmin, setInputAddAdmin] = useState<number>(1);
    const [addAdminField, setAddAdminField] = useState(false);
    const [adminsListOpen, setAdminsListOpen] = useState(false);
    const [inputDescriptionsAddAdmin, setInputDescriptionsAddAdmin] = useState('');
    const [selectAddChart, setSelectAddChart] = useState(1);
    const { addSectionAdministrator, deleteSectionAdministrator, addChartToAdministrator, deleteChartFromAdministrator } = useOrg();

    const adminsListToggle = () => setAdminsListOpen(state => !state);
    const addAdminFieldToggle = () => setAddAdminField(state => !state);
    const delAdmin = (id: number) => {
        deleteSectionAdministrator(id, updateOrgScheme);
    }

    const addAdministrator = () => {
        addSectionAdministrator(sectionItem.id, office_id, department_id, inputAddAdmin, inputDescriptionsAddAdmin, updateOrgScheme)
            .then(() => setInputDescriptionsAddAdmin(''))
    }

    const findChartById = (id: number): ChartI | undefined => {
        if (charts)
            return charts.find(chart => chart.id === id)
    }


    useEffect(() => { console.log('ADMIN SELECT', inputAddAdmin) }, [inputAddAdmin])
    return (

        <div key={sectionItem.id + '_section'} className={styles.sectionItem}>
            <div className={styles.sectionItemHead}>
                <div className={'org_title_line3'}>
                    <img src="svg/org/section.svg" />
                    <span>Секция: {sectionItem.name}</span>
                </div>

            </div>
            <div className="org_param_line"><img src="svg/org/ckp.svg" />{sectionItem.ckp}</div>
            <div className="org_param_line"><img src="svg/org/description.svg" />{sectionItem.descriptions || 'нет описания'}</div>
            <div className={`${styles.administratorsList}`}>
                <div className={`org_param_line ${styles.administratorsField}`} onClick={adminsListToggle}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="svg/org/admins.svg" />
                        <span onClick={adminsListToggle}>администраторы: {sectionItem.administrators.length}</span>
                    </span>
                    {sectionItem.administrators.length ? <img className="open_list" src={`svg/org/${adminsListOpen ? "arrow_dawn" : "arrow_up"}.svg`} /> : <span> </span>}
                    <span> </span>
                </div>

                {
                    addAdminField
                        ? <div className={styles.addAdmin}>
                            <img src="svg/org/admin_add.svg" />
                            <select value={inputAddAdmin} onChange={event => setInputAddAdmin(+event.target.value)}>
                                {
                                    users.map(user => <option key={user.id + '_addAdmins'} value={user.id}>🆔{user.id}👤{user.name}</option>)
                                }
                            </select>
                            <input value={inputDescriptionsAddAdmin} onChange={event => setInputDescriptionsAddAdmin(event.target.value)} placeholder="описание администратора" />
                            <img onClick={addAdministrator} src="svg/org/add.svg" />
                            <img onClick={addAdminFieldToggle} src="svg/org/close_field.svg" />
                        </div>
                        : adminsListOpen&&<div className={styles.addAdminBtn}> <img src="svg/org/admin_add.svg" onClick={addAdminFieldToggle}/></div>
                }

                {
                    adminsListOpen && sectionItem.administrators.map((admin: AdministratorI, idx) => {
                        return <AdministratorsList key={idx+'adminsList'} {...{admin,charts,findChartById,idx,updateOrgScheme,user_id:admin.user_id,userById}}/>

                    })
                }

            </div>

        </div>

    )
}