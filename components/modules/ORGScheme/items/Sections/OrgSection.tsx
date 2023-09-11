import { OrgDepartmentsI, OrgOfficeI, OrgSectionsI } from "@/types/orgTypes";
import styles from './orgSection.module.scss';


export default function OrgSection({office,department,section}:{office :OrgOfficeI,department:OrgDepartmentsI,section:OrgSectionsI}){

    return(
        <div className={styles.sectionBlock}>
            <div className={styles.sectionName}>{section.name}</div>
            <div className={styles.sectionCkp}>{section.ckp}</div>
            <div className={styles.sectionCkp}>{section.leadership||'не назначен'}</div>
            <div className={styles.sectionDesciptions}>{section.descriptions}</div>
            <div className={styles.sectionWorkeersList}>{section.workers.map(worker=>worker.user)}</div>
        </div>
    )
}
