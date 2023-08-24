import { ColumnI, RowI, UserI } from '@/types/types';
import * as ExelJs from 'exceljs';


export function createExelFile({columns,rows,fileName,user}
:{
    columns:ColumnI[]
    ,rows:RowI[][],
    fileName:string,
    user:UserI
}){

    console.log('EXEL',columns,rows);

    const workbook= new ExelJs.Workbook();
    const sheet = workbook.addWorksheet(fileName);

    //INIT DATA
    workbook.creator=user.email
    workbook.created=new Date();

    
    //STYLING
    sheet.properties.defaultColWidth=80;

    //border
    sheet.getRow(1).border={
        top:{style:'medium', color:{argb:'FF8056'}},
        left:{style:'medium', color:{argb:'FF8056'}},
        right:{style:'medium', color:{argb:'FF8056'}},
        bottom:{style:'medium', color:{argb:'FF8056'}},
    }

    //fill
    sheet.getRow(1).fill={
        type:'pattern',
        pattern:'darkHorizontal',
        bgColor:{argb:'FF8056'}
    }

    //font
    sheet.getRow(1).font={
        name:'Arial',
        family:4,
        size:12,
        bold:false,
        color:{argb:'FFFFFF'}

    }



    //SET COLUMNS
    sheet.columns =columns.map((column,indexColumn)=>({
        header:column.name,
        key:indexColumn+'_column',
        width:10,    

    }));

    //SET ROWS
    rows.forEach(row=>{
        const rowTemp=row.reduce((acc,field,fieldIndex)=>({...acc,[fieldIndex+'_column']:field.value}),{});
        sheet.addRow(rowTemp)
    })
    console.log('SHEET',sheet);

    workbook.xlsx.writeBuffer().then(data=>{
        const blob = new Blob([data],{
            type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
        });
        const url= window.URL.createObjectURL(blob);
        console.log('URL',url);
        const a=document.createElement('a');
        a.href=url;
        a.download=fileName+'.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    })


}