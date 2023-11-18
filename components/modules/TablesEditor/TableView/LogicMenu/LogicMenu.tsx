import { MenuI, StatisticDataRowI } from "@/types/types";
import React from "react";
import styles from './logicMenu.module.scss';
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";

const mathArr = [
    {
        name: 'Индекс строки',
        value: '@index'
    },
    {
        name: 'Суммировать данные столбца ',
        value: '@sum'
    },
    {
        name: 'Среднее значение',
        value: '@middle'
    },
    {
        name: 'НД ЧП',
        value: '@ndchp=0'
    },
        
    {
        name: 'Статус ',
        value: '@status'
    },
    {
        name: 'Статус перевернутый',
        value: '@statReverse'
    },

];

export default function LogicMenu({
    //statisticRowsData, 
    setLogicColumn, 
    logicMenu, 
    setlogicMenu}
    :{
        //statisticRowsData:StatisticDataRowI[][],
        setLogicColumn:React.Dispatch<React.SetStateAction<string>>,
        logicMenu:MenuI,
        setlogicMenu:React.Dispatch<React.SetStateAction<MenuI>>
    }
    ){
        //SELECTORS
        const {initStatsRows} = useSelector((state:StateReduxI)=>state.stats);
        //FUNCS
        const onSelectDisable=()=>{
            setlogicMenu(state=>({...state,show:false}));
        }
    return (
        <>
            {
                logicMenu.show &&
                <div className={styles.logicMenuBlock} 
                style={{
                    position:'fixed',
                    top:logicMenu.position.y+'px',
                    left:logicMenu.position.x+'px',
                    }}>
                        <img src="svg/org/close_field.svg" onClick={onSelectDisable} className={styles.close} />
                    {
                        !!initStatsRows.length &&
                        initStatsRows[0].map((statRow, statColumnIndex: number) =>
                            <div key={statRow.name + statColumnIndex} className={styles.fields} >
                                <span onClick={() => {
                                    setLogicColumn(state => state + `@@${statColumnIndex + 1}`);
                                    setlogicMenu(state=>({...state,show:false}));
                                }}>↪️</span>
                                <span onClick={() => {
                                    setLogicColumn(state => state + `@${statColumnIndex + 1}`);
                                    setlogicMenu(state=>({...state,show:false}));                                   
                                }}>▶️{statRow.name}</span>
                            </div>
                        )
                    }

                    {
                        mathArr.map((math, index) => <div key={index + math.value} className={styles.math}
                        onClick={() => {
                             setLogicColumn(state => state + math.value);
                             setlogicMenu(state=>({...state,show:false}));                       

                        }} >
                            <span >{math.name}</span>
                        </div>)
                    }
                </div>
            }
        </>
    )
} 