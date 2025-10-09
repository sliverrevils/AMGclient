import useUsers from "@/hooks/useUsers";
import { UserFullI } from "@/types/types";
import { replaceFio } from "@/utils/funcs";
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./filter.module.scss";

export default function FilterUsers({
    setSelectedUserID,
    selectedUserId,
}: {
    selectedUserId: number | null;
    setSelectedUserID: React.Dispatch<React.SetStateAction<number | null>>;
}) {
    //STATE
    const [findUser, setFindUser] = useState("");
    //SELECTORS
    const users: UserFullI[] = useSelector((state: any) => state.users.users);

    //HOOKS
    const { getUserPosts, userByID } = useUsers();

    //VARS
    return (
        <div className={styles.filterWrap}>
            <div className={styles.filterAndSelect}>
                <input
                    type="text"
                    placeholder="поиск по пользователю"
                    value={findUser}
                    onChange={(event) => setFindUser(event.target.value.trimStart())}
                />
                {selectedUserId && !findUser.length && (
                    <div className={styles.selectedUser}>
                        <div className={styles.delete} onClick={() => setSelectedUserID(null)}>
                            ❌
                        </div>
                        <div className={styles.name}>{userByID(selectedUserId)?.name}</div>
                        <div className={styles.postsBlock}>
                            {getUserPosts(selectedUserId).userOffices.map((office) => (
                                <div className={styles.offItem}>{office.name}</div>
                            ))}

                            {getUserPosts(selectedUserId).userDepartments.map((department) => (
                                <div className={styles.depItem}>{department.name}</div>
                            ))}

                            {getUserPosts(selectedUserId).userSections.map((section) => (
                                <div className={styles.secItem}>{section.name}</div>
                            ))}

                            {getUserPosts(selectedUserId).workerOnSections.map((section) => (
                                <div className={styles.secItem}>
                                    сотрудник секции :{section.name}
                                </div>
                            ))}

                            {getUserPosts(selectedUserId).userDivisions.map((division) => (
                                <div className={styles.divItem}>{division.name}</div>
                            ))}

                            {getUserPosts(selectedUserId).workerOnDivisions.map((division) => (
                                <div className={styles.divItem}>
                                    сотрудник подразделения :{division.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {!!findUser.length && (
                <div className={styles.filterList}>
                    {users
                        .filter((user) =>
                            user.name.toLocaleLowerCase().includes(findUser.toLocaleLowerCase())
                        )
                        .map((user) => (
                            <div
                                onClick={() => {
                                    setSelectedUserID(user.id);
                                    setFindUser("");
                                }}
                            >
                                {replaceFio(user.name)}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
