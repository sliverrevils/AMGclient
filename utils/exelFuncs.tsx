import { ColumnI, RowI, StatHeaderI, StatRowI, UserI } from "@/types/types";
import * as ExelJs from "exceljs";
import { getChartImage } from "./funcs";

export function createExelFile2({ columns, rows, fileName, user, columnSizeArr }: { columns: StatHeaderI[]; rows: StatRowI[]; fileName: string; user: UserI; columnSizeArr: number[] }) {
    //console.log("EXEL", columns, rows);

    const workbook = new ExelJs.Workbook();
    const sheet = workbook.addWorksheet(fileName);

    //INIT DATA
    workbook.creator = user.email;
    workbook.created = new Date();
    const img = workbook.addImage({
        base64: getChartImage("", false),
        extension: "jpeg",
    });

    //STYLING
    sheet.properties.defaultColWidth = 80;

    //border
    sheet.getRow(1).border = {
        top: { style: "medium", color: { argb: "FF8056" } },
        left: { style: "medium", color: { argb: "FF8056" } },
        right: { style: "medium", color: { argb: "FF8056" } },
        bottom: { style: "medium", color: { argb: "FF8056" } },
    };

    //fill
    sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "FF8056" },
    };

    //font
    sheet.getRow(1).font = {
        name: "Arial",
        family: 4,
        size: 11,
        bold: false,
        color: { argb: "FFFFFF" },
    };

    sheet.addImage(img, {
        tl: columns.length <= 7 ? { col: columns.length, row: 1 } : { col: 0, row: rows.length + 1 },
        ext: { width: 700, height: 370 },
    });

    //SET COLUMNS
    sheet.columns = columns.map((column, indexColumn) => ({
        header: column.name,
        key: indexColumn + "_column",
        width: 10, //word count
    }));

    //SET ROWS
    rows.forEach((row) => {
        const rowTemp = row.values.reduce((acc, field, fieldIndex) => ({ ...acc, [fieldIndex + "_column"]: field.value }), {});
        sheet.addRow(rowTemp);
    });
    //console.log("SHEET", sheet);

    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        //console.log("URL", url);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

export function createExelFile({ columns, rows, fileName, user, columnSizeArr }: { columns: ColumnI[]; rows: RowI[][]; fileName: string; user: UserI; columnSizeArr: number[] }) {
    //console.log("EXEL", columns, rows);

    const workbook = new ExelJs.Workbook();
    const sheet = workbook.addWorksheet(fileName);

    //INIT DATA
    workbook.creator = user.email;
    workbook.created = new Date();
    const img = workbook.addImage({
        base64: getChartImage("", false),
        extension: "jpeg",
    });

    //STYLING
    sheet.properties.defaultColWidth = 80;

    //border
    sheet.getRow(1).border = {
        top: { style: "medium", color: { argb: "FF8056" } },
        left: { style: "medium", color: { argb: "FF8056" } },
        right: { style: "medium", color: { argb: "FF8056" } },
        bottom: { style: "medium", color: { argb: "FF8056" } },
    };

    //fill
    sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "FF8056" },
    };

    //font
    sheet.getRow(1).font = {
        name: "Arial",
        family: 4,
        size: 11,
        bold: false,
        color: { argb: "FFFFFF" },
    };

    sheet.addImage(img, {
        tl: columns.length <= 7 ? { col: columns.length, row: 1 } : { col: 0, row: rows.length + 1 },
        ext: { width: 700, height: 370 },
    });

    //SET COLUMNS
    sheet.columns = columns.map((column, indexColumn) => ({
        header: column.name,
        key: indexColumn + "_column",
        width: 10, //word count
    }));

    //SET ROWS
    rows.forEach((row) => {
        const rowTemp = row.reduce((acc, field, fieldIndex) => ({ ...acc, [fieldIndex + "_column"]: field.value }), {});
        sheet.addRow(rowTemp);
    });
    //console.log("SHEET", sheet);

    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        //console.log("URL", url);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

export function createExelFileNew({ columns, rows, fileName }: { columns: string[]; rows: (string | number)[][]; fileName: string }) {
    //console.log("EXEL", columns, rows);

    const workbook = new ExelJs.Workbook();
    const sheet = workbook.addWorksheet(fileName);

    //INIT DATA
    //workbook.creator = user.email;
    workbook.created = new Date();
    const img = workbook.addImage({
        base64: getChartImage("", false),
        extension: "jpeg",
    });

    //STYLING
    sheet.properties.defaultColWidth = 80;

    //border
    sheet.getRow(1).border = {
        top: { style: "medium", color: { argb: "FF8056" } },
        left: { style: "medium", color: { argb: "FF8056" } },
        right: { style: "medium", color: { argb: "FF8056" } },
        bottom: { style: "medium", color: { argb: "FF8056" } },
    };

    //fill
    sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "FF8056" },
    };

    //font
    sheet.getRow(1).font = {
        name: "Arial",
        family: 4,
        size: 11,
        bold: false,
        color: { argb: "FFFFFF" },
    };

    sheet.addImage(img, {
        tl: columns.length <= 7 ? { col: columns.length, row: 1 } : { col: 0, row: rows.length + 1 },
        ext: { width: 700, height: 370 },
    });

    //SET COLUMNS
    sheet.columns = columns.map((columnName, indexColumn) => ({
        header: columnName,
        key: indexColumn + "_column",
        width: 10, //word count
    }));

    //SET ROWS
    rows.forEach((row) => {
        const rowTemp = row.reduce((acc, cellValue, fieldIndex) => ({ ...acc, [fieldIndex + "_column"]: cellValue }), {});
        sheet.addRow(rowTemp);
    });
    // console.log("SHEET", sheet);

    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        //console.log("URL", url);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    });
}
