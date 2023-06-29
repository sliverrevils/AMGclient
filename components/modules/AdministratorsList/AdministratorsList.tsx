import { AdministratorI, ChartI, UserFullI } from "@/types/types";
import styles from '../../Screens/Org/org.module.scss';
import useOrg from "@/hooks/useOrg";
import { useState } from "react";



export default function AdministratorsList({ user_id, userById, idx, admin, updateOrgScheme, findChartById, charts }: { user_id: number, userById: any, idx: number, admin: AdministratorI, updateOrgScheme: any, findChartById: any, charts: ChartI[] }) {
    const user: UserFullI | undefined = userById(user_id);
    const { deleteSectionAdministrator, deleteChartFromAdministrator, addChartToAdministrator } = useOrg();
    const [selectAddChart, setSelectAddChart] = useState(1);
    const [addPattern, setAddPattern] = useState(false);
    if (user)
        return (
            <div className={styles.administrator} key={admin.id + '_admins'}>
                <div className={styles.administratorHead}>
                    <span className={styles.userId}>
                        <span>
                            {idx + 1}
                        </span>
                        {/* <img src="svg/org/admin.svg" /> */}
                    </span>
                    <span className={styles.userName}>
                        <img src="svg/org/admin.svg" />
                        <span>{user.name}</span> 
                    </span>
                    <img src="svg/org/admin_del.svg"  className={styles.userDel} onClick={() => deleteSectionAdministrator(admin.id, updateOrgScheme)}/>
                     
                </div>

                <div className={styles.descriptions}>
                    <img src="svg/org/description.svg" />
                    <div>
                    {admin.descriptions}
                    </div>
                </div>

                <div className={styles.chartsList}>

                    {/* <h5>Шаблоны администратора</h5> */}


                    {
                        addPattern
                            ? <div className={styles.addChart}>
                                <select value={selectAddChart} onChange={(event) => setSelectAddChart(+event.target.value)}>
                                    {charts.map(chart => <option value={chart.id} key={chart.id + "_forAdd"}>{chart.id} : {chart.name}</option>)}
                                </select>
                                <img src="svg/org/chart_add.svg" onClick={() => addChartToAdministrator(admin.id, selectAddChart, updateOrgScheme)} />
                                <img src="svg/org/chart_del.svg"  onClick={() => setAddPattern(false)} />
                            </div>
                            : <img className={styles.addChartBtn} src="svg/org/chart_add.svg" onClick={() => setAddPattern(true)} />
                    }

                    {
                        JSON.parse(admin.charts).map((chart_id: number, idx: number) => {
                            const chart = findChartById(chart_id);
                            return (
                                <div className={styles.chartItem} key={chart_id + '_addedCharts'}>
                                    <span className={styles.chartId}>
                                        <span> {idx + 1}</span>
                                        <img src="svg/org/chart.svg" />
                                    </span>
                                    <span className={styles.chartName}>{chart?.name}</span>
                                    <span className={styles.chartDel} onClick={() => deleteChartFromAdministrator(admin.id, chart_id, updateOrgScheme)}><img src="svg/org/chart_del.svg" /></span>
                                </div>
                            )
                        })
                    }



                </div>
            </div>
        )
    else
        return (
            <div className={styles.administrator} key={admin.id + '_admins'}>
                <div className={styles.administratorHead}>
                    <span style={{ display: 'flex', justifyItems: 'center' }}>
                        <span> {idx + 1}</span>
                        <img src="svg/org/user_deleted.svg" />
                    </span>
                    <span>deleted user</span>
                    <span onClick={() => deleteSectionAdministrator(admin.id, updateOrgScheme)}><img src="svg/org/admin_del.svg" /></span>
                </div>
            </div>
        )
}
