import { TableStatisticListItemI } from "@/types/types";

export const logicMath = (logic, fields, index, lastFields?) => {
    //logic- string(ИНДЕКС ПОЛЯ @ С 1)  fields []
    let clearData = false;

    const logicWithValue = logic
        .replaceAll("@index", index + 1)
        .replaceAll(/@@\d{1,3}/g, (x, y, z) => {
            return `(${lastFields[x.replace("@@", "") - 1]?.value})`;
        })
        .replaceAll(/@\d{1,3}/g, (x, y, z) => {
            const field = x.replace("@", "") - 1;

            if ((fields[field]?.value as any) === null) {
                clearData = true;
            }

            return `(${fields[field]?.value})`;
        });

    let res: any = null;

    if (clearData) {
        //blank data tetected !
        return "#clear#";
    }

    try {
        res = +eval(logicWithValue);
    } catch {
        console.log("MATH ERROR");
    }

    return res !== null ? res : logicWithValue.replaceAll(/[-|+|*|/]/g, "");
};

//create trade line
export const calcTrendColumn = (array: number[], middleValueStart: boolean = true): number[] => {
    //console.log('SELECTED LINE', line);
    if (!array.length) return [];

    const lineUp: boolean = array[0] < array[array.length - 1];
    let middleValue = 0;
    let startValue = array[0];
    //console.log('START VALUE', startValue);
    let trendArr: number[] = [];

    const records: number[] = [];

    //FIRST
    for (let i = 0; i <= array.length; i++) {
        if (array[i + 1]) {
            records[i] = array[i] - array[i + 1];
        }
    }

    middleValue = Number((records.reduce((acc, number) => acc + number, 0) / (array.length - 2)).toFixed(2)); // --- count??

    if (lineUp) {
        if (middleValue < 0) middleValue = Math.abs(middleValue);
        // console.log('LINE UP', middleValue, startValue, startValue - middleValue / 2);

        startValue -= middleValueStart ? middleValue + middleValue / 2 : middleValue;
        //startValue -= middleValueStart ? middleValue / 2 : middleValue;
    } else {
        startValue += middleValueStart ? middleValue + middleValue / 2 : middleValue;
    }

    trendArr = array.map((number, index) => {
        if (lineUp) {
            //console.log('RES',startValue + Math.abs(middleValue) * (index + 1) )
            return Number((startValue + Math.abs(middleValue) * (index + 1)).toFixed(2));
        } else {
            return Number((startValue - middleValue * (index + 1)).toFixed(2));
        }
    });

    //console.log('MIDDLE', middleValue);
    // console.log('RES TREND ARR', array);

    return trendArr;
};

//time string to number
export const timeStrToNumber = (timeString: string): number => (timeString ? new Date(timeString).getTime() : 0);
//time numer to string (its for inputs)
export const timeNumberToString = (timeNumber: number): string => {
    if (!timeNumber) {
        return "";
    }
    const date = new Date(timeNumber);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    //console.log('date str ',dateString);

    return dateString;
};

//get month info
export const getMonthInfo = ({ year, month }: { year: number; month: number }) => {
    //console.log(`DATE ${year} ${month} :`,new Date(year,month,0))

    const daysCount = 32 - new Date(year, month, 32).getDate();
    let firstDayOnWeek = new Date(year, month, 1).getDay();
    if (!firstDayOnWeek) {
        firstDayOnWeek = 7;
    }
    let lastDayOnWeek = new Date(year, month, daysCount).getDay();
    if (!lastDayOnWeek) {
        lastDayOnWeek = 7;
    }
    // console.log({daysCount,firstDayOnWeek,lastDayOnWeek})

    return {
        daysCount,
        firstDayOnWeek,
        lastDayOnWeek,
    };
};

//UPLOAD CHART IMAGE
export const getChartImage = (name: string, upload: boolean = false) => {
    const imgLink = document.createElement("a");
    const canvas: any = document.querySelector(".myChart");
    if (canvas) {
        imgLink.href = canvas.toDataURL("image/jpg", 1);
        imgLink.download = `${name} ${new Date().toLocaleDateString()}.jpg`;
        upload && imgLink.click();
    }

    // console.log('CHART',imgLink.href)

    return imgLink.href;
};

//calc text size
export const getTextLength = (text: string, charSize: number): number => {
    if (text.length == 0) {
        return 0;
    }
    const el = document.createElement("span");
    el.style.whiteSpace = "nowrap";
    el.style.fontSize = charSize + 1 + "px";
    // el.style.height='auto';
    // el.style.width='auto';
    // el.style.position='absolute';
    // el.style.whiteSpace='no-wrap'
    el.innerText = text;
    document.body.append(el);
    const length = Number(el.offsetWidth);
    el.remove();
    return length;
};
//DATES
export const getDayOfWeek = (date) => Number(String(new Date(date).getDay()).replace("0", "7"));
export const getMonthStr = (date) => new Intl.DateTimeFormat("ru", { month: "long" }).format(new Date(date));

//CLEAR PERIOD STATS
export function celarPeriodStats(initStatsArr: TableStatisticListItemI[]): TableStatisticListItemI[] {
    const namesStat = new Set<string>(initStatsArr.map((stat) => stat.name.split("@")[0].trim()));
    return initStatsArr.filter((stat) => {
        const statName = stat.name.split("@")[0].trim();
        const inArr = namesStat.has(statName);
        namesStat.delete(statName);
        return inArr;
    });
}

//CLEAR PERIOD FROM NAME
export function clearStatName(statName: string) {
    const isPeriodStat = /@/g.test(statName);
    return `${statName.split("@")[0].trimStart()}${isPeriodStat ? "📅" : ""}`;
}

//REPLASE FIO
export const replaceFio = (nameStr: string): string => {
    if (nameStr == "admin@admin.com") return nameStr;
    if (nameStr.length) {
        const names = nameStr.split(" ").filter((str) => !!str);
        const newName = `${names[2]} ${names[0]} ${names[1]}`;
        //console.log(names, newName);
        return newName;
    } else {
        return "unnamed";
    }
};

//CLEAR EMOJIES
export const clearSmiels = (text: string): string => text.replace(/[^А-Яа-яA-Za-z1-90\s.@"']/g, "");
export const clearForInput = (text: string): string => text.replace(/[^А-Яа-яA-Za-z1-90\s-"'.@!?():;#№]/g, "");
//export const clearSmiels = (text: string): string => text.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "");

//COLOR
export function hexToRgba(hex: string, alpha: number): string {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "";
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

export function rgbToHex(RGBstring: string | undefined): string {
    // if (!RGBstring) return "#2eb314";
    if (!RGBstring || !/rgba/.test(RGBstring)) return RGBstring || "#2eb314";
    const [r, g, b] = RGBstring.replace("rgba(", "")
        .replace(")", "")
        .split(",")
        .map((col) => Number(col));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function splitNumberStr(num: string | number): string {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
