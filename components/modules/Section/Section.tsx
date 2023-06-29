import { AdministratorI, ChartI, OfficeI, SectionI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss';
import useOrg from "@/hooks/useOrg";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import AdministratorsList from "../AdministratorsList/AdministratorsList";

export default function Section({ sectionItem, users, userById, updateOrgScheme, office_id, department_id, charts ,index}: { sectionItem: SectionI, users: Array<UserFullI>, userById: any, updateOrgScheme: any, office_id: number, department_id: number, charts: Array<ChartI> ,index: number}) {

    // const administrators: Array<number> = JSON.parse(sectionItem.administrators);
    const [inputAddAdmin, setInputAddAdmin] = useState<number>(1);
    const [addAdminField, setAddAdminField] = useState(false);
    const [adminsListOpen, setAdminsListOpen] = useState(!!!sectionItem.administrators.length);
    const [inputDescriptionsAddAdmin, setInputDescriptionsAddAdmin] = useState('');
    const [selectAddChart, setSelectAddChart] = useState(1);
    const { addSectionAdministrator, deleteSectionAdministrator, deleteSection } = useOrg();

    const adminsListToggle = () => setAdminsListOpen(state => !state);
    const addAdminFieldToggle = () => setAddAdminField(state => !state);
    const delAdmin = (id: number) => {
        deleteSectionAdministrator(id, updateOrgScheme);
    }

    const addAdministrator = () => {
        addSectionAdministrator(sectionItem.id, office_id, department_id, inputAddAdmin, inputDescriptionsAddAdmin, updateOrgScheme)
            .then(() =>{ 
                setInputDescriptionsAddAdmin('');
                setAddAdminField(false);
            })
    }

    const findChartById = (id: number): ChartI | undefined => {
        if (charts)
            return charts.find(chart => chart.id === id)
    }


    useEffect(() => { console.log('ADMIN SELECT', inputAddAdmin) }, [inputAddAdmin])
    return (

        <div key={sectionItem.id + '_section'} className={styles.sectionItem}>
            <div className={styles.sectionItemHead}>
                <div className={styles.sectionName}>  
                    <span style={{width:20}}>{index+1}</span>             
                    <span style={{width:'100%'}}>{sectionItem.name}</span>                  
                </div>
                <img onClick={()=>confirm(`Вы точно хотите удалить секцию "${sectionItem.name}"`)&&deleteSection(sectionItem.id,updateOrgScheme)} src="svg/org/delete_white.svg"  />
            </div>
            <div className={styles.sectionBody}>
            <div className={styles.propLine}><img src="svg/org/ckp.svg" />{sectionItem.ckp}</div>
            <div className={styles.propLine}><img src="svg/org/description.svg" />{sectionItem.descriptions || 'нет описания'}</div>
            <div className={`${styles.administratorsList}`}>
                <div className={styles.propLine} onClick={adminsListToggle} style={{ cursor: 'pointer',display: 'flex', alignItems: 'center', justifyContent: 'space-between'  }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <img src="svg/org/admins.svg" />
                        <span onClick={adminsListToggle}>сотрудники: {sectionItem.administrators.length}</span>
                    </span>
                    {sectionItem.administrators.length ? <img className="open_list" style={{width:15}} src={`svg/org/${adminsListOpen ? "arrow_dawn" : "arrow_up"}.svg`} /> : <span> </span>}
                    <span>
                    </span>
                </div>

                {
                    addAdminField
                        ? <div className={styles.addAdmin}>
                           
                            <select value={inputAddAdmin} onChange={event => setInputAddAdmin(+event.target.value)}>
                                {
                                    users.map(user => <option key={user.id + '_addAdmins'} value={user.id}>🆔{user.id}👤{user.name}</option>)
                                }
                            </select>
                            <textarea value={inputDescriptionsAddAdmin} onChange={event => setInputDescriptionsAddAdmin(event.target.value)} placeholder="описание администратора" />
                            <div className={styles.addAdminBtns}>
                            <img onClick={addAdministrator} src="svg/org/admin_add.svg" />
                            <img onClick={addAdminFieldToggle} src="svg/org/close_field.svg" />
                            </div>
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

        </div>

    )
}