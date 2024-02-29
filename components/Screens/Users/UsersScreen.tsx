import { useAuth } from "@/hooks/useAuth";
import { UserFullI } from "@/types/types"
import { useEffect, useRef, useState } from "react";
import styles from './usersScreen.module.scss';
import useOrg from "@/hooks/useOrg";
import { replaceFio } from "@/utils/funcs";

export default function UsersScreen() {
    const [users, setUsers] = useState<UserFullI[]>([]);
    const { allUsers ,verificateUser, blockUserToggle} = useAuth();
    let { current: init } = useRef(true);
    const [currentUser, setCurrentUser] = useState<UserFullI | null>(null);
    const [addUserField,setAddUserField] = useState(false);

    const {createUser} = useAuth();
   
    const [newUserName,setNewUserName]=useState('');
    const [newUserSurname,setNewUserSurname]=useState('');
    const [newUserPatronymic,setNewUserPatronymic]=useState('');
    const [newUserEmail,setNewUserEmail]=useState('');
    const [newUserPassword,setNewUserPassword]=useState('');
    // const [newUser,setNewUser]=useState('');
    // const [newUser,setNewUser]=useState('');

    const singInHandle=()=>{
        createUser(`${newUserName} ${newUserPatronymic} ${newUserSurname}`,'',newUserEmail,newUserPassword,()=>allUsers(setUsers))
    }


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
                : <>
                <h2>Список всех сотрудников</h2>
                    {
                        addUserField
                            ? <div className={styles.addForm}>

                                <h3>Создание новго пользователя</h3>

                                <span className={styles.addHelp}>Имя</span>
                                <input type="text" value={newUserName} onChange={event => setNewUserName(event.target.value.trim())} placeholder="" />

                                <span className={styles.addHelp}>Фамилия</span>
                                <input type="text" value={newUserSurname} onChange={event => setNewUserSurname(event.target.value.trim())} placeholder="" />

                                <span className={styles.addHelp}>Отчество</span>
                                <input type="text" value={newUserPatronymic} onChange={event => setNewUserPatronymic(event.target.value.trim())} placeholder="" />

                                <span className={styles.addHelp}>Логин</span>
                                <input type="text" value={newUserEmail} onChange={event => setNewUserEmail(event.target.value.trim())} placeholder="Укажите логин для авторизации пользователя" />

                                <span className={styles.addHelp}>Пароль</span>
                                <input type="text" value={newUserPassword} onChange={event => setNewUserPassword(event.target.value.trim())} placeholder="Укажите пароль без пробелов , минимум 5 символов" />


                                <button onClick={singInHandle} className={styles.addBtn} style={{width:250}} disabled={!(newUserName.length&&newUserSurname.length&&newUserPatronymic.length&&newUserEmail.length&&newUserPassword.length>4)}>Добавить пользователя</button>
                                <img src="svg/org/close_field.svg" onClick={()=>setAddUserField(false)} className={styles.close} />
                            </div>
                            : <div className="btn" onClick={() => setAddUserField(true)} style={{width:330,textAlign:'center'}}>Добавить новго пользователя</div>
                    }
                 
                    <table>
                        <thead>
                            <tr>
                                <th>🆔</th>
                                <th>Имя</th>
                                <th>Логин</th>
                               
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
                                    <td>{replaceFio(user.name)}</td>
                                    <td>{user.email}</td>                                    
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