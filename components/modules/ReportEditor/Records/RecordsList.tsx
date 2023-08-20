import { StatisticWithFieldValuesI } from "@/types/types";
import { timeNumberToString } from "@/utils/funcs";



export default function ReacordsList({rows}:{rows:StatisticWithFieldValuesI[]}){

    return <div>
    {
        rows.map(statRow=><div>
            {timeNumberToString(+statRow.dateStart)} {timeNumberToString(+statRow.dateEnd)}
            </div>)
    }
    </div>
}