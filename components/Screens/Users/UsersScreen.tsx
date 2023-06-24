import { useAuth } from "@/hooks/useAuth";
import { UserFullI } from "@/types/types"
import { useEffect, useRef, useState } from "react";
import styles from './usersScreen.module.scss';

export default function UsersScreen() {
    const [users, setUsers] = useState<UserFullI[]>([]);
    const { allUsers ,verificateUser, blockUserToggle} = useAuth();
    let { current: init } = useRef(true);
    const [currentUser, setCurrentUser] = useState<UserFullI | null>(null);



    useEffect(() => {
        if (init) {
            init = false;
            console.log('INIT')
            allUsers(setUsers);
        }
    }, [])

    return (
        <div className={styles.usersWrapper}>
            {currentUser 
            ? <div className={styles.userInfo}>
                <img src="svg/org/close_field.svg" onClick={()=>setCurrentUser(null)} className={styles.close} />
                <span className={styles.infoLine}>ID : {currentUser.id}</span>
                <span className={styles.infoLine}>Имя : {currentUser.name}</span>
                <span className={styles.infoLine}>Email : {currentUser.email}</span>
                <span className={styles.infoLine}>Пост  : {currentUser.post}</span>
                <span className={styles.infoLine}>Верификация  : {currentUser.is_verificated?"верифицирован":"не верифицирован"}</span>
                <span className={styles.infoLine}>Блокировка  : {currentUser.is_blocked?"заблокирован":"не заблокирован"}</span>
                <span className={styles.infoLine}>Дата регистрации  : {new Date(currentUser.createdAt).toLocaleString()}</span>
                <span className={styles.infoLine}>Дата обновления  : {new Date(currentUser.updatedAt).toLocaleString()}</span>
                <div className={styles.controlBtns}>
                    {currentUser.role!=='admin'&&<div className="btn" onClick={()=>{blockUserToggle(currentUser.id,setUsers), setCurrentUser(null)}}>{currentUser.is_blocked?"Разблокировать":"Заблокировать"}</div>}
                    {!currentUser.is_verificated&&<div className="btn" onClick={()=>{verificateUser(currentUser.id,setUsers), setCurrentUser(null)}}>Верифицировать</div>}
                </div>
                </div>
                : <><h2>Все сотрудники</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>🆔</th>
                                <th>Имя</th>
                                <th>Пост</th>
                                <th>Структура</th>
                                <th>Права</th>
                                <th>Регистрация</th>
                                <th>Верификация</th>
                                <th>Блок</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id + 'users_list'} onClick={()=>setCurrentUser(user)}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.post}</td>
                                    <td>{user.structure}</td>
                                    <td>{user.role}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>{user.is_verificated ? '✅' : '🆕'}</td>
                                    <td>{user.is_blocked ? '🚫' : '🆗'}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </>
            }
        </div>
    )

}