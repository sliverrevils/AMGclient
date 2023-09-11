
import { useDispatch } from 'react-redux';
import styles from './ORGScheme.module.scss';
import { addOrgOfficeRedux } from '@/redux/orgSlice';
import { useSelector } from 'react-redux';
import { OrgI } from '@/types/orgTypes';
import { useEffect } from 'react';
import { StateReduxI } from '@/redux/store';
import OrgOffice from './items/Office/OrgOffice';

export default function ORGScheme() {

    //HOOKS
    const dispatch = useDispatch();

    //SELECTORS
    const offices = useSelector((state: StateReduxI) => state.org.offices);

    //FUNCS
    const onAddOffice = () => {
        dispatch(addOrgOfficeRedux({
            key: Math.random().toString(),
            ckp: 'ЦКП отделения',
            colorBlock: '#FF8056',
            name: 'Назавание отделения',
            departments: [],
            descriptions: 'Описание отделения',
            leadership: 0,
            status: 'none',


        }))
    }

    //EFFECTS
    //test
    useEffect(() => {
        console.log('OFFICEs', offices);
    }, [offices])

    return (
        <div className={styles.orgBlockWrap}>
            <h5>ORG SHCEME</h5>
            <button onClick={onAddOffice}>add office</button>
            <div className={styles.offices}>
                
                {
                    offices.map(office => <OrgOffice key={office.key} {...{ office }} />)
                }
            </div>
        </div>
    )
}