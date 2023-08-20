export const logicMath = (logic, fields, index, lastFields?) => { //logic- string(ИНДЕКС ПОЛЯ @ С 1)  fields []
    //const logic="@1+2/@3";
    //logic.match(/@\d/g) //['@1', '@3']
    //logic.replaceAll(/@\d/g,(x,y,z)=>{console.log(x,y,z)})
    // @1 0 @1+2/@3
    // @3 5 @1+2/@3

    //console.log('-------LOGIC------',{logic,fields,index,lastFields})
    if (logic) {
        const logicWithValue = logic
            .replaceAll('@index', index + 1)
            .replaceAll(/@@\d{1,3}/g, (x, y, z) => {
                // if(lastFields){
                //     console.log('INDEX--',x.replace('@@',''));
                //     return lastFields[x.replace('@@','')-1]?.value;
                // }else{
                //     return rowInitialValues[x.replace('@@','')-1];
                // }     
                return lastFields[x.replace('@@', '') - 1]?.value;

            })
            .replaceAll(/@\d{1,3}/g, (x, y, z) => {
                return fields[x.replace('@', '') - 1]?.value;
            })

        // console.log('LOGIC/VALUES ', logicWithValue);
        let res: any;
        try {
            // console.log('MATH STRING ',logicWithValue)
            res = +eval(logicWithValue)

        } catch {
            // console.log('MATH ERROR')
        }
        //console.log('MATH RES ',logicWithValue)
        return res || logicWithValue.replaceAll(/[-|+|*|/]/g, '');

    } else
        return 0;


}

//create trade line
export const calcTrendColumn = (array: number[], middleValueStart: boolean = true): number[] => {
    //console.log('SELECTED LINE', line);
    if (!array.length)
        return []

    const lineUp: boolean = array[0] < array[array.length - 1];
    let middleValue = 0;
    let startValue = array[0];
    console.log('START VALUE', startValue)
    let trendArr: number[] = [];

    const records: number[] = [];

    //FIRST
    for (let i = 0; i <= array.length; i++) {
        if (array[i + 1]) {
            records[i] = (array[i] - array[i + 1]);
        }
    }

    middleValue = Number((records.reduce((acc, number) => acc + number, 0) / (array.length - 2)).toFixed(2)); // --- count??


    if (lineUp) {
        if (middleValue < 0)
            middleValue = Math.abs(middleValue);
        console.log('LINE UP', middleValue, startValue, startValue - middleValue / 2)


        startValue -= middleValueStart ? middleValue + middleValue / 2 : middleValue;
        //startValue -= middleValueStart ? middleValue / 2 : middleValue;
    } else {
        startValue += middleValueStart ? middleValue + middleValue / 2 : middleValue;
    }


    trendArr = array.map((number, index) => {

        if (lineUp) {
            //console.log('RES',startValue + Math.abs(middleValue) * (index + 1) )
            return Number((startValue + Math.abs(middleValue) * (index + 1)).toFixed(2))
        } else {
            return Number((startValue - middleValue * (index + 1)).toFixed(2))
        }

    })

    console.log('MIDDLE', middleValue);
    console.log('RES TREND ARR', array);

    return trendArr

}


//time string to number 
export const timeStrToNumber = (timeString: string): number => timeString ? new Date(timeString).getTime() : 0;
//time numer to string (its for inputs)
export const timeNumberToString = (timeNumber: number): string => {
    if (!timeNumber) {
        return '';
    }
    const date = new Date(timeNumber);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    //console.log('date str ',dateString);

    return dateString;
}

//get month info
export const getMonthInfo=({year,month}:{year:number,month:number})=>{
    //console.log(`DATE ${year} ${month} :`,new Date(year,month,0))

    const daysCount=32-new Date(year,month,32).getDate();
    let firstDayOnWeek=new Date(year,month,1).getDay();
    if(!firstDayOnWeek){
        firstDayOnWeek=7
    }
    let lastDayOnWeek=new Date(year,month,daysCount).getDay();
    if(!lastDayOnWeek){
        lastDayOnWeek=7
    }
   // console.log({daysCount,firstDayOnWeek,lastDayOnWeek})
    
    return {
        daysCount,
        firstDayOnWeek,
        lastDayOnWeek
    }
}

