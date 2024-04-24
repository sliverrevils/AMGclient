import { useSelector } from 'react-redux';
import styles from './settings.module.scss';
import { StateReduxI } from '@/redux/store';
import { UserFullI, UserI } from '@/types/types';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { replaceFio } from '@/utils/funcs';

export default function SettingsScreen() {
    const user = useSelector((state: any) => state.main.user);

    const { updateUser, changeUserPass } = useAuth();

    const [oldPass, setOldPass] = useState('');
    const [newPAss, setNewPass] = useState('');
    const [seePass, setSeePass] = useState<'password' | 'text'>('password');

    const PropLine = ({ title, value }) => (
        <div className={styles.propBlock}>
            <div className={styles.propTitle}>{title}</div>
            <div className={styles.propValue}>{value}</div>
        </div>
    );

    const onChangePass = () => {
        changeUserPass(user.userId, newPAss, () => {}, oldPass);
    };

    return (
        <div className={styles.settingsWrap}>
            <h3>Настройки пользователя</h3>

            <PropLine title={`ID пользователя`} value={user.userId} />
            <PropLine title={`Роль`} value={user.role === 'admin' ? 'Администратор' : 'Пользователь'} />
            <PropLine title={`Имя`} value={replaceFio(user.name)} />
            <PropLine title={`Логин`} value={user.email} />

            <div className={styles.propBlock} style={{ gap: 7 }}>
                <div className={styles.propTitle} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cмена пароля</span>{' '}
                    <span onMouseEnter={() => setSeePass('text')} onMouseLeave={() => setSeePass('password')} style={{ cursor: 'pointer' }}>
                        👁️
                    </span>
                </div>
                <input type={seePass} value={oldPass} onChange={(event) => setOldPass(event.target.value)} placeholder="старый пароль" />
                {oldPass.length > 4 && <input type={seePass} value={newPAss} onChange={(event) => setNewPass(event.target.value)} placeholder="новый пароль" />}
                {oldPass.length > 4 && newPAss.length > 4 && (
                    <div className={styles.chagePassBtn} onClick={onChangePass}>
                        Сменить пароль
                    </div>
                )}
            </div>
        </div>
    );
}
