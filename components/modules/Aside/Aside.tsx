
import { useAccessRoutes } from '@/hooks/useAccessRoutes';
import styles from './aside.module.scss';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';

export default function Aside() {
    const {user} = useSelector((state:any)=>state.main)
    const {accessedRoutes}=useAccessRoutes();
    const {logout}=useAuth();
    
    return (
        <aside className={styles.menuWrap}>
            <ul>
                {
                    accessedRoutes.map(el=><li key={el.id+'_btn'} className={`${el.active} noselect`} onClick={el.clickFunc}>{el.title}</li>)
                }
            </ul>
            <ul>
                <li>Настройки</li>
                <li onClick={logout}>Выход</li>
            </ul>
        </aside>
    )
}