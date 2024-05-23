import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { ChartI, ChartPatternI, FieldI, LineI, UserFullI } from "@/types/types";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import useOrg from "./useOrg";

export default function usePatterns() {
    const dispatch = useDispatch();
    const { users }: { users: UserFullI[] } = useSelector((state: any) => state.users);
    const userBtId = (id: number): UserFullI | undefined => users.find((user) => user.id == id);

    //HOOKS
    const { getOrgFullScheme } = useOrg();

    //SET SECTION MAIN PATTERN
    const setSectionMainPatter = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`sections/addMainPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                //console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //ADD PATTERN
    const addSectionPatter = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`sections/addPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                // console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //DEL PATTERN
    const delSectionPatter = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`sections/delPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                // console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    //SET DEPARTMENT MAIN PATTERN
    const setDepartmentMainPattern = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`departments/addMainPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                //console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //ADD PATTERN
    const addDepartmentPattern = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`departments/addPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                // console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //DEL PATTERN
    const delDepartmentPattern = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`departments/delPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                // console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    //SET OFFICE MAIN PATTERN
    const setOfficeMainPattern = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`offices/addMainPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                //console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //ADD PATTERN
    const addOfficePattern = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`offices/addPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                // console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //DEL PATTERN
    const delOfficePattern = async (section_id: number, pattern_id: number) => {
        dispatch(setLoadingRedux(true));
        try {
            const res: any = await axiosClient.post(`offices/delPattern`, {
                section_id,
                pattern_id,
            });
            dispatch(setLoadingRedux(false));
            if (res) {
                // console.log('SET SECTION MAIN PATTERN', res);
                !res.data.errorMessage && toast.success(res.data.message);
                toast.warning(res.data.errorMessage);
                getOrgFullScheme({});
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    return { setSectionMainPatter, addSectionPatter, delSectionPatter, setDepartmentMainPattern, addDepartmentPattern, delDepartmentPattern, setOfficeMainPattern, addOfficePattern, delOfficePattern };
}
