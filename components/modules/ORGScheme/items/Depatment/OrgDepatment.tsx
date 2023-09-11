
import { useState } from 'react';
import styles from './orgDepatment.module.scss';
import { OrgDepartmentsI, OrgOfficeI, OrgSectionsI } from '@/types/orgTypes';
import { BlockViewI } from '../Office/OrgOffice';
import { useDispatch } from 'react-redux';
import { addOrgSectionRedux } from '@/redux/orgSlice';
import OrgSection from '../Sections/OrgSection';

export default function OrgDepatment({office, department, officeView}: {office: OrgOfficeI, department: OrgDepartmentsI, officeView:BlockViewI }) {
    //STATE
    const [blockView, setBlockView] = useState<BlockViewI>('min');
    //HOOKS
    const dispatch=useDispatch();
    //FUNCS
    const onAddSection=()=>{
        const section:OrgSectionsI={
            key: Math.random().toString(),
            ckp: 'ЦКП секции',
            colorBlock: '#FF8056',
            name: 'Название секции',
            workers: [],
            descriptions: 'Описание секции',
            leadership: 0,
            status: 'none',

        }
        dispatch(addOrgSectionRedux({section,officeKey:office.key,departmenKey:department.key}))
    }

    return (
        <div className={`${styles.departmentBlock} ${styles[blockView]}`}
            onMouseEnter={() => setBlockView(state => state === 'min' ? 'mouse' : state)}
            onMouseLeave={() => setBlockView(state => state === 'mouse' ? 'min' : state)}
           // onClick={() => setBlockView(state => state === 'mouse' ? 'full' : state)}
        >

            <div className={styles.departmentName}>{department.name}</div>
            {
                //show props
                officeView !== 'min' && <>
                    <div className={styles.departmentCkp}>{department.ckp}</div>
                    <div className={styles.departmentLeadership}>{department.leadership || 'не назначен'}</div>
                    <div className={styles.departmentDescriptions}>{department.descriptions}</div>

                    <button onClick={onAddSection}>Добавить секцию</button>
                    <div className={styles.departmentSectionsList}>
                        {blockView === 'full' && <div className={styles.close} onClick={() => setBlockView('min')}>❌</div>}

                        {department.sections.map(section =><OrgSection key={section.key} {...{office,department,section}}/>
                            
                        )}
                    </div>
                </>
            }


        </div>
    )
}