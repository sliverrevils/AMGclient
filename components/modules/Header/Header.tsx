import { UserFullI, UserI } from '@/types/types';
import styles from './header.module.scss';
import { useSelector } from 'react-redux';

export default function Header() {
    const { user }: { user: UserI } = useSelector((state: any) => state.main);

    const roleName = {
        admin: 'администратор',
        user: 'сотрудник'
    }
    return (
        <header className={styles.wrapper}>
            <div className={`${styles.container} container`}>
                <img src='img/logo.svg' />
                <div className={`${styles.userInfo}`} >
                    <div><span className={styles.userID}>{user.userId}</span><img src='svg/auth/id_white.svg'/></div>
                    <div> <span className={styles.userLogin}> {user.email} </span><img src='svg/auth/card_white.svg'/></div>
                    <div><span className={styles.userRole}>{roleName[user.role]}</span><img src='svg/auth/user_white.svg'/></div>
                    
                    
                    
                    
                    

                    

                </div>
            </div>

        </header>
    )
}