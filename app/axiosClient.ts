import axios from "axios";
import {toast} from 'react-toastify'

const axiosClient = axios.create({
    withCredentials:true,
    headers:{"secret-key":'any_secret_string'},
    baseURL:`${process.env.NEXT_PUBLIC_SERVER_URL_DEV3}`,   
})

export const axiosError=(err)=>{
    if(err?.response?.data?.message){   
        err?.response?.data?.statusCode==403&&console.log('403!!!');
        toast.error(err.response.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    }
}

export default axiosClient;