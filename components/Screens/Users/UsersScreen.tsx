import { useAuth } from "@/hooks/useAuth";
import { UserFullI, UserI } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import styles from "./usersScreen.module.scss";
import useOrg from "@/hooks/useOrg";
import { clearSmiels, replaceFio } from "@/utils/funcs";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";

export default function UsersScreen() {
    const [users, setUsers] = useState<UserFullI[]>([]);
    const { allUsers, verificateUser, blockUserToggle, adminToggle, userPost } = useAuth();
    const { getOrgFullScheme } = useOrg();
    let { current: init } = useRef(true);
    const [currentUser, setCurrentUser] = useState<UserFullI | null>(null);
    const [addUserField, setAddUserField] = useState(false);

    const { createUser, updateUser, changeUserPass, deleteUser } = useAuth();

    const [newUserName, setNewUserName] = useState("");
    const [newUserSurname, setNewUserSurname] = useState("");
    const [newUserPatronymic, setNewUserPatronymic] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    // const [newUser,setNewUser]=useState('');
    // const [newUser,setNewUser]=useState('');

    const [filterName, setFilterName] = useState("");

    const user = useSelector((state: any) => state.main.user) as UserI;

    //EDIT PROFILE
    const [editUserName, setEditUserName] = useState("");
    const [editUserSurname, setEditUserSurname] = useState("");
    const [editUserPatronymic, setEditUserPatronymic] = useState("");
    const [editUserLogin, setEditUserLogin] = useState("");
    const [editChangePass, setEditChangePass] = useState("");

    const singInHandle = () => {
        createUser(
            `${newUserName} ${newUserPatronymic} ${newUserSurname}`,
            "",
            newUserEmail,
            newUserPassword,
            () => allUsers(setUsers)
        );
    };

    const updateProfile = () => {
        users.filter((user) => user.email === editUserLogin);
        updateUser(
            currentUser!.id,
            [editUserName, editUserPatronymic, editUserSurname].join(" "),
            editUserLogin,
            () => {
                setCurrentUser(null);
                allUsers(setUsers);
            }
        );
    };

    const deleteUserHandle = () => {
        deleteUser(currentUser!?.id, () => {
            setCurrentUser(null);
            allUsers(setUsers);
        });
    };

    const changePassword = () => {
        changeUserPass(currentUser!?.id, editChangePass, () => setEditChangePass(""));
    };

    useEffect(() => {
        if (init) {
            init = false;
            //console.log('INIT');
            allUsers(setUsers);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            const nameArr = currentUser.name.split(" ").filter((str) => !!str);
            //console.log('NAME', nameArr);
            setEditUserName(nameArr[0]);
            setEditUserSurname(nameArr[2]);
            setEditUserPatronymic(nameArr[1]);
            setEditUserLogin(currentUser.email);
        } else {
            setEditUserName("");
            setEditUserSurname("");
            setEditUserPatronymic("");
            setEditUserLogin("");
        }
    }, [currentUser]);

    //ON SELECTED USER
    if (currentUser) {
        return (
            <div className={styles.usersWrapper}>
                <div className={styles.userInfo}>
                    <img
                        src="svg/org/close_field.svg"
                        onClick={() => setCurrentUser(null)}
                        className={styles.close}
                    />
                    <span className={styles.infoLine}>ID : {currentUser.id}</span>
                    {/* <span className={styles.infoLine}>Имя : {currentUser.name}</span> */}

                    <div className={styles.editebleField}>
                        <span>Имя</span>
                        <input
                            value={editUserName}
                            onChange={(event) => setEditUserName(clearSmiels(event.target.value))}
                            placeholder="имя"
                        />
                    </div>

                    <div className={styles.editebleField}>
                        <span>Фамилия</span>
                        <input
                            value={editUserSurname}
                            onChange={(event) =>
                                setEditUserSurname(clearSmiels(event.target.value))
                            }
                            placeholder="фамилия"
                        />
                    </div>
                    <div className={styles.editebleField}>
                        <span>Отчество</span>
                        <input
                            value={editUserPatronymic}
                            onChange={(event) =>
                                setEditUserPatronymic(clearSmiels(event.target.value))
                            }
                            placeholder="отчество"
                        />
                    </div>
                    {currentUser.email !== "admin@admin.com" && (
                        <div className={styles.editebleField}>
                            <span>Логин для авторизации</span>
                            <input
                                value={editUserLogin}
                                onChange={(event) =>
                                    setEditUserLogin(clearSmiels(event.target.value))
                                }
                                placeholder="логин для авторизации"
                            />
                        </div>
                    )}

                    {currentUser.email !== "admin@admin.com" && (
                        <div className={styles.editebleField}>
                            <span>Смена пароля</span>
                            <div className={styles.changePassBlock}>
                                <input
                                    value={editChangePass}
                                    onChange={(event) =>
                                        setEditChangePass(clearSmiels(event.target.value))
                                    }
                                    placeholder="укажиите новый пароль"
                                />
                                {editChangePass.length >= 5 && (
                                    <div className={styles.changePassBtn} onClick={changePassword}>
                                        <span>Сменить пароль</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* <span className={styles.infoLine}>Логин : {currentUser.email}</span> */}
                    {/* <span className={styles.infoLine}>Пост : {currentUser.post}</span> */}
                    <span className={styles.infoLine}>
                        Верификация :{" "}
                        {currentUser.is_verificated ? "верифицирован" : "не верифицирован"}
                    </span>
                    <span className={styles.infoLine}>
                        Блокировка : {currentUser.is_blocked ? "заблокирован" : "не заблокирован"}
                    </span>
                    <span className={styles.infoLine}>
                        Дата регистрации : {new Date(currentUser.createdAt).toLocaleString()}
                    </span>
                    <span className={styles.infoLine}>
                        Дата обновления : {new Date(currentUser.updatedAt).toLocaleString()}
                    </span>
                    <div className={styles.controlBtns}>
                        {currentUser.role !== "admin" && (
                            <>
                                <div
                                    className="btn"
                                    onClick={() => {
                                        blockUserToggle(currentUser.id, setUsers),
                                            setCurrentUser(null);
                                    }}
                                >
                                    {currentUser.is_blocked ? "Разблокировать" : "Заблокировать"}
                                </div>
                                {currentUser.role !== "admin" && (
                                    <div
                                        className="btn"
                                        onClick={() =>
                                            confirm(
                                                `Вы точно хотите удалить пользователя ${currentUser.name} ?`
                                            ) && deleteUserHandle()
                                        }
                                    >
                                        Удалить пользователя
                                    </div>
                                )}
                            </>
                        )}

                        {!currentUser.is_verificated && (
                            <div
                                className="btn"
                                onClick={() => {
                                    verificateUser(currentUser.id, setUsers), setCurrentUser(null);
                                }}
                            >
                                Верифицировать
                            </div>
                        )}

                        {user.email === "admin@admin.com" &&
                            currentUser.email !== "admin@admin.com" && (
                                <div
                                    className="btn"
                                    onClick={() => {
                                        adminToggle(currentUser.id, setUsers), setCurrentUser(null);
                                    }}
                                >
                                    {currentUser.role === "user"
                                        ? "Сделать пользователя администратором"
                                        : "Снять права администратора"}
                                </div>
                            )}

                        <div
                            className="btn"
                            onClick={() => {
                                userPost(currentUser.id, "raports").then(() => {
                                    allUsers(setUsers);
                                });
                            }}
                        >
                            Доступ к отчетам (да/нет)
                        </div>

                        {[editUserName, editUserPatronymic, editUserSurname].join(" ") !==
                            currentUser.name && (
                            <div
                                className="btn"
                                onClick={updateProfile}
                                style={{ background: "#339966" }}
                            >
                                Обновить
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    //USERS LIST & CREATE
    return (
        <div className={styles.usersWrapper}>
            <>
                <h2>Список всех сотрудников</h2>
                {addUserField ? (
                    <div className={styles.addForm}>
                        <h3>Создание нового пользователя</h3>

                        <span className={styles.addHelp}>Имя</span>
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(event) =>
                                setNewUserName(clearSmiels(event.target.value.trim()))
                            }
                            placeholder=""
                        />

                        <span className={styles.addHelp}>Фамилия</span>
                        <input
                            type="text"
                            value={newUserSurname}
                            onChange={(event) =>
                                setNewUserSurname(clearSmiels(event.target.value.trim()))
                            }
                            placeholder=""
                        />

                        <span className={styles.addHelp}>Отчество</span>
                        <input
                            type="text"
                            value={newUserPatronymic}
                            onChange={(event) =>
                                setNewUserPatronymic(clearSmiels(event.target.value.trim()))
                            }
                            placeholder=""
                        />

                        <span className={styles.addHelp}>Логин</span>
                        <input
                            type="text"
                            value={newUserEmail}
                            onChange={(event) =>
                                setNewUserEmail(clearSmiels(event.target.value.trim()))
                            }
                            placeholder="Укажите логин для авторизации пользователя"
                        />

                        <span className={styles.addHelp}>Пароль</span>
                        <input
                            type="text"
                            value={newUserPassword}
                            onChange={(event) =>
                                setNewUserPassword(clearSmiels(event.target.value.trim()))
                            }
                            placeholder="Укажите пароль без пробелов , минимум 5 символов"
                        />

                        <button
                            onClick={singInHandle}
                            className={styles.addBtn}
                            style={{ width: 250 }}
                            disabled={
                                !(
                                    newUserName.length &&
                                    newUserSurname.length &&
                                    newUserPatronymic.length &&
                                    newUserEmail.length &&
                                    newUserPassword.length > 4
                                )
                            }
                        >
                            Добавить пользователя
                        </button>
                        <img
                            src="svg/org/close_field.svg"
                            onClick={() => setAddUserField(false)}
                            className={styles.close}
                        />
                    </div>
                ) : (
                    <div
                        className="btn"
                        onClick={() => setAddUserField(true)}
                        style={{ width: 330, textAlign: "center" }}
                    >
                        Добавить нового пользователя
                    </div>
                )}

                <input
                    className={styles.findInput}
                    type="text"
                    value={filterName}
                    onChange={(event) => setFilterName(event.target.value.trim())}
                    placeholder="поиск"
                />
                {!!filterName.length && <span onClick={() => setFilterName("")}>❌</span>}

                <table>
                    <thead style={{ width: "100%" }}>
                        <tr>
                            <th style={{ color: "tomato" }}>№</th>
                            <th>Роль</th>
                            <th>Имя</th>
                            <th>Логин</th>

                            <th>Регистрация</th>
                            <th>Верификация</th>
                            <th>Блок</th>
                            <th>Доступ к отчетам</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users
                            .toSorted((a, b) =>
                                replaceFio(a.name).localeCompare(replaceFio(b.name))
                            )
                            .filter((user) => user.name !== "admin@admin.com")
                            .filter((user) =>
                                user.name.toLowerCase().includes(filterName.toLowerCase())
                            )
                            .map((user, index) => (
                                <tr
                                    key={user.id + "users_list"}
                                    onClick={() => setCurrentUser(user)}
                                >
                                    <td style={{ color: "tomato", textAlign: "center" }}>
                                        <b>{index + 1}</b>
                                    </td>
                                    <td style={{ textAlign: "center", fontSize: 17 }}>
                                        {user.role === "admin" ? "👑" : "👤"}
                                    </td>
                                    <td>{replaceFio(user.name)}</td>
                                    <td>{user.email}</td>

                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {user.is_verificated ? "✅" : "🆕"}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {user.is_blocked ? "🚫" : "🆗"}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {user.post.includes("raports") ? "✅" : "🚫"}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </>
        </div>
    );
}
