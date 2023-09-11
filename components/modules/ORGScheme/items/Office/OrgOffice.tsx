
import { OrgOfficeI } from '@/types/orgTypes';
import styles from './orgOffice.module.scss';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addOrgDepatmentRedux } from '@/redux/orgSlice';
import OrgDepatment from '../Depatment/OrgDepatment';

export type BlockViewI='min' | 'full' | 'mouse';

export default function OrgOffice({ office }: { office: OrgOfficeI }) {
    //STATE
    const [blockView, setBlockView] = useState<BlockViewI>('min')

    //SELECTORS

    //HOOKS
    const dispatch = useDispatch();

    //FUNCTIONS
    const onAddDepartment = () => {
        dispatch(addOrgDepatmentRedux({
            officeKey: office.key,
            depatment: {
                key: Math.random().toString(),
                ckp: 'ЦКП отдела',
                colorBlock: '#FF8056',
                name: 'Название отдела',
                sections: [],
                descriptions: 'Описание отдела',
                leadership: 0,
                status: 'none',
                code: 'Код отдела',
            }


        }))
    }

    const onClickOffice=(event:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        event.stopPropagation();
        console.log('TARGET',event.target)
        if(event.target==event.currentTarget)
        setBlockView(state => state === 'mouse' ? 'full' : state)
    }

    const onMouseOffice=(event:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        console.log('MOUSE',event.target)
        setBlockView(state => state === 'min' ? 'mouse' : state)
    }

    //STYLE


    return (
        <div
            className={`${styles.officeBlock} ${styles[blockView]}`}
            onMouseEnter={onMouseOffice}
            onMouseLeave={() => setBlockView(state => state === 'mouse' ? 'min' : state)}
            // onMouseMove={event=>console.log('MOVE',event.target)}
            onClick={onClickOffice}
        >

            <div className={styles.officeName}>{office.name}</div>
            <div className={styles.officeCkp}>{office.ckp}</div>
            <div className={styles.officeLeadership}>{office.leadership || 'не назначен'}</div>
            <div className={styles.officeDescriptions}>{office.descriptions}</div>

            {//add depaetamen
                blockView === 'full' && <>
                
                    <div className={styles.close} onClick={() => setBlockView('min')}>❌</div>
                    <button onClick={onAddDepartment}>➕🏬</button>

                </>
            }

            {   blockView!=='min'&&
                <div className={styles.officeDepatments}>
                <span>Отделения</span>
                <div className={styles.officeDepatmentsList}>
                    {
                        // blockView !== 'min' &&
                        office.departments.map(department => <OrgDepatment key={department.key} office={office} department={department} officeView={blockView} />)
                    }
                </div>
            </div>
            }


        </div>
    )
}