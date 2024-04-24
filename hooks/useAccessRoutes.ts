import { setCurrentContentRedux } from '@/redux/contentSlice';
import { accessRoutesArray } from '@/routes/contentRouter';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

export const useAccessRoutes = () => {
    const { user } = useSelector((state: any) => state.main);
    const { current: currentAccessRoute } = useSelector((state: any) => state.content);
    const dispatch = useDispatch();

    const accessedRoutes = accessRoutesArray.filter((route) => route.access.some((role) => role === user.role)).map((el: any) => ({ ...el, clickFunc: () => dispatch(setCurrentContentRedux(el.title)), active: el.title === currentAccessRoute ? 'active' : '' }));

    const ActiveScreen = accessedRoutes.find((el) => el.title === currentAccessRoute).Component;
    //useEffect(()=>{console.log('ROUTES',accessedRoutes)},[accessedRoutes])

    return { accessedRoutes, currentAccessRoute, ActiveScreen };
};
