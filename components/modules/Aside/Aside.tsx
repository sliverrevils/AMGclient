import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import stylesRow from "./aside.module.scss";
import stylesColumn from "./asideColumn.module.scss";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { StateReduxI } from "@/redux/store";
import Icons from "@/components/icons/Icons";

export default function Aside() {
    const { mainStyle } = useSelector((state: StateReduxI) => state.app);
    const { user } = useSelector((state: any) => state.main);
    const { accessedRoutes } = useAccessRoutes();

    const { logout } = useAuth();

    const settingsMenu = accessedRoutes.find((el) => el.id === 777);

    const currentStyle = mainStyle === "row" ? stylesRow : stylesColumn;

    // if (mainStyle === "column") {
    //     return (
    //         <aside className={currentStyle.menuWrap}>
    //             <ul>
    //                 {accessedRoutes
    //                     .filter((el) => el.id !== 777)
    //                     .map((el) => (
    //                         <li
    //                             key={el.id + "_btn"}
    //                             // className={`${el.active} noselect`}
    //                             className={`${currentStyle[`menu_${el.active}`]} noselect`}
    //                             onClick={() => el.clickFunc()}
    //                         >
    //                             <span>{el.title}</span>
    //                         </li>
    //                     ))}
    //                 {/* <li className={`${settingsMenu.active} noselect`} onClick={() => settingsMenu.clickFunc()}>
    //                     {settingsMenu.title}
    //                 </li> */}
    //                 {/* <li onClick={logout}>Выход</li> */}
    //             </ul>
    //         </aside>
    //     );
    // }
    return (
        <aside className={currentStyle.menuWrap}>
            <ul>
                {accessedRoutes
                    .filter((el) => el.id !== 777)
                    .map((el) => (
                        <li key={el.id + "_btn"} className={`${el.active} noselect`} onClick={() => el.clickFunc()}>
                            <div className={currentStyle.menuIco}>{Icons().mainMenu[el.name]}</div>
                            <div className={currentStyle.menuTitle}>{el.title}</div>
                        </li>
                    ))}
            </ul>
            <ul className={currentStyle.exitBlock}>
                <li className={`${settingsMenu.active} noselect`} onClick={() => settingsMenu.clickFunc()}>
                    <div className={currentStyle.menuIco}>{Icons().mainMenu.settings}</div>
                    <div className={currentStyle.menuTitle}>{settingsMenu.title}</div>
                </li>
                <li onClick={logout}>
                    <div className={currentStyle.menuIco}>{Icons().mainMenu.exit}</div>
                    <div className={currentStyle.menuTitle}>Выход</div>
                </li>
            </ul>
        </aside>
    );
}
