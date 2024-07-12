import { setCurrentContentRedux } from "@/redux/contentSlice";
import { accessRoutesArray } from "@/routes/contentRouter";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export const useAccessRoutes = () => {
    const { user } = useSelector((state: any) => state.main);
    const { current: currentAccessRoute } = useSelector((state: any) => state.content);
    const dispatch = useDispatch();

    const accessedRoutes = accessRoutesArray
        //.filter((route) => route.access.some((role) => role === user.role) || user.post.includes(route.name))
        .map((el: any) => ({
            ...el,
            clickFunc: (param = "") => {
                dispatch(setCurrentContentRedux({ current: el.title, param }));
            },
            active: el.title === currentAccessRoute ? "active" : "",
        }));

    const ActiveScreen = accessedRoutes.find((el) => el.title === currentAccessRoute).Component;
    //useEffect(()=>{console.log('ROUTES',accessedRoutes)},[accessedRoutes])

    return { accessedRoutes, currentAccessRoute, ActiveScreen };
};
