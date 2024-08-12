import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useMainSettings() {
    const dispatch = useDispatch();

    const getMainSettings = async (): Promise<string> => {
        try {
            const res: any = await axiosClient.get(`main-settings/get`);
            dispatch(setLoadingRedux(false));

            const mainMessage = res.data.message;
            // console.log("MAIN SETTINGS -", mainMessage);
            return mainMessage;
        } catch (error) {
            dispatch(setLoadingRedux(false));
            axiosError(error);
            return String(error);
        }
    };
    const setMainSettings = async ({ message }: { message: string }): Promise<string> => {
        try {
            const res: any = await axiosClient.post(`main-settings/set`, {
                message,
            });
            dispatch(setLoadingRedux(false));

            const resMsg = res.data;
            // console.log("SET MAIN SETTINGS -", resMsg);
            toast.success(resMsg);
            return resMsg;
        } catch (error) {
            dispatch(setLoadingRedux(false));
            toast.error(String(error));
            axiosError(error);
            return String(error);
        }
    };

    return { getMainSettings, setMainSettings };
}
