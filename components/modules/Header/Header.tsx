import { UserFullI, UserI } from "@/types/types";
import styles from "./header.module.scss";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import { replaceFio } from "@/utils/funcs";
import Icons from "@/components/icons/Icons";

export default function Header() {
    const { user }: { user: UserFullI } = useSelector((state: any) => state.main);

    const roleName = {
        admin: "администратор",
        user: "сотрудник",
    };
    const { logout } = useAuth();
    const { accessedRoutes } = useAccessRoutes();
    const settingsMenu = accessedRoutes.find((el) => el.id === 777);
    return (
        <header className={styles.wrapper}>
            <div className={`${styles.container} container`}>
                <img src="img/logo.svg" />

                <div className={styles.mainText}>
                    <span className={styles.amg}>AMG</span>
                    <span className={styles.stat}>Avtomarket Statistics</span>
                </div>
                <div className={`${styles.userBlock}`}>
                    <div className={styles.firstRow}>
                        <div className={styles.mainInfo}>
                            <span className={styles.roleText}>{roleName[user.role]}</span>
                            <span className={styles.userLogin}>
                                {/* <img src="svg/auth/user.svg" /> */}
                                <span className={styles.key}>🔐</span>
                                <span className={styles.name}>{replaceFio(user.name)}</span>
                            </span>
                        </div>
                        <div className={styles[`settings_${settingsMenu.active}`]} onClick={() => settingsMenu.clickFunc()}>
                            ⚙️
                        </div>
                    </div>

                    <div className={styles.secondRow}>
                        <span className={styles.exit} onClick={() => confirm("Выйти из учётной записи ?") && logout()}>
                            <div className={styles.exitIco}>{Icons().mainMenu.exit}</div>
                            <span>выход из учётной записи</span>
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
