import { StateReduxI } from "@/redux/store";
import { RaportTableInfoI, TableStatisticListItemI } from "@/types/types";
import { daySec } from "@/utils/vars";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";



export default function ReportNew(){

    //STATE
    const [filteredOrg,setFilteredOrg]=useState([]);
        //filters
        const [isShowOffices,setIsShowOffices] = useState(true);
        const [isShowDerartments,setIsShowDepartments] = useState(true);
        const [isShowSections,setIsShowSection] = useState(true);

    //SELECTOR
    const officesWithLatestPeriodStatsAndData = useSelector((state: StateReduxI) => state.org.offices.map(office => { // ЗАМЕНЯЕМ ID СТАТИСТИК НА ПОСЛЕДНИЕ
        
        const getLatestTable = (id: number) => {
            const currentStat = state.stats.tableStatisticsList.find(stat => stat.id == id);

            const isCurrentPeriod=(info:RaportTableInfoI|undefined)=>{
                if(!info) return false;
                const currentDateSec = new Date().getTime();
                const isCurrentPeriod = currentDateSec >= info.lastFilledPeriod.start && currentDateSec <= info.lastFilledPeriod.end + (daySec * 2);
                return isCurrentPeriod;
            }

            const createStatInfo=(stat:TableStatisticListItemI)=>{

                return({
                    ...stat,
                    isFilled:isCurrentPeriod(stat.dateColumn.raportInfo),
                    trendStatus:stat.dateColumn.raportInfo?.trendStatus,
                    period:`${new Date(stat.dateColumn.raportInfo!?.lastFilledPeriod.start).toLocaleDateString()} - ${new Date(stat.dateColumn.raportInfo!?.lastFilledPeriod.end).toLocaleDateString()}` 
                })
            }

            if (currentStat && /@/g.test(currentStat.name)) {
                const statName = currentStat.name.split('@')[0].trim();
                const statsArr = state.stats.tableStatisticsList.filter(stat => stat.name.split('@')[0].trim() == statName).toSorted((a, b) => b.id - a.id);

                if (statsArr.length) {

                    return createStatInfo(statsArr[0])
                    
                } else {
                    return currentStat
                }
            }else{
                return currentStat
            }
            

        }

        return {
            item:'Отдел',
            ...office,            
            mainPattern: getLatestTable(office.mainPattern),
            patterns: office.patterns.map(stat => getLatestTable(stat)),
            departments: office.departments.map(dep => ({
                item:'Отделение',
                ...dep,                
                mainPattern: getLatestTable(dep.mainPattern),
                patterns: dep.patterns.map(stat => getLatestTable(stat)),
                sections: dep.sections.map(sec => ({
                    item:'Секция',
                    ...sec,
                    mainPattern: getLatestTable(sec.mainPattern),
                    patterns: sec.patterns.map(stat => getLatestTable(stat)),
                }))
            }))
        }
    }));

    console.log(officesWithLatestPeriodStatsAndData);
    useEffect(()=>{
        let offices=
        officesWithLatestPeriodStatsAndData
        .forEach(office=>{})
    
    
    },[officesWithLatestPeriodStatsAndData,isShowOffices,isShowDerartments,isShowSections])

    return(
        <div>
            
        </div>
    )
}