import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import stylesRow from "./aside.module.scss";
import stylesColumn from "./asideColumn.module.scss";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { StateReduxI } from "@/redux/store";

export default function Aside() {
    const { mainStyle } = useSelector((state: StateReduxI) => state.app);
    const { user } = useSelector((state: any) => state.main);
    const { accessedRoutes } = useAccessRoutes();

    const { logout } = useAuth();

    const settingsMenu = accessedRoutes.find((el) => el.id === 777);

    const currentStyle = mainStyle === "row" ? stylesRow : stylesColumn;

    if (mainStyle === "column") {
        return (
            <aside className={currentStyle.menuWrap}>
                <ul>
                    {accessedRoutes
                        .filter((el) => el.id !== 777)
                        .map((el) => (
                            <li key={el.id + "_btn"} className={`${el.active} noselect`} onClick={() => el.clickFunc()}>
                                {el.title}
                            </li>
                        ))}
                    {/* <li className={`${settingsMenu.active} noselect`} onClick={() => settingsMenu.clickFunc()}>
                        {settingsMenu.title}
                    </li> */}
                    {/* <li onClick={logout}>Выход</li> */}
                </ul>
            </aside>
        );
    }
    return (
        <aside className={currentStyle.menuWrap}>
            <ul>
                {accessedRoutes
                    .filter((el) => el.id !== 777)
                    .map((el) => (
                        <li key={el.id + "_btn"} className={`${el.active} noselect`} onClick={() => el.clickFunc()}>
                            {el.title}
                        </li>
                    ))}
            </ul>
            <ul>
                <li className={`${settingsMenu.active} noselect`} onClick={() => settingsMenu.clickFunc()}>
                    {settingsMenu.title}
                </li>
                <li onClick={logout}>Выход</li>
            </ul>
        </aside>
    );
}
