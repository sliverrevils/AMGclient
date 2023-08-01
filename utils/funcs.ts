export const logicMath=(logic,fields,index,lastFields?)=>{ //logic- string(ИНДЕКС ПОЛЯ @ С 1)  fields []
    //const logic="@1+2/@3";
    //logic.match(/@\d/g) //['@1', '@3']
    //logic.replaceAll(/@\d/g,(x,y,z)=>{console.log(x,y,z)})
    // @1 0 @1+2/@3
    // @3 5 @1+2/@3

    //console.log('-------LOGIC------',{logic,fields,index,lastFields})
    if(logic){
        const logicWithValue = logic
        .replaceAll('@index', index+1)
        .replaceAll(/@@\d{1,3}/g,(x,y,z)=>{    
            // if(lastFields){
            //     console.log('INDEX--',x.replace('@@',''));
            //     return lastFields[x.replace('@@','')-1]?.value;
            // }else{
            //     return rowInitialValues[x.replace('@@','')-1];
            // }     
            return lastFields[x.replace('@@','')-1]?.value;
           
        })
        .replaceAll(/@\d{1,3}/g,(x,y,z)=>{          
            return fields[x.replace('@','')-1]?.value;
        })
    
     // console.log('LOGIC/VALUES ', logicWithValue);
       let res:any;
       try{
       // console.log('MATH STRING ',logicWithValue)
        res= +eval(logicWithValue)
        
       }catch{
       // console.log('MATH ERROR')
       }
       //console.log('MATH RES ',logicWithValue)
        return res||logicWithValue.replaceAll(/[-|+|*|/]/g,'');

    }else
    return 0;


}

