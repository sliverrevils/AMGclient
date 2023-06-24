export const logicMath=(logic,fields,index)=>{ //logic- string  fields []
    //const logic="@1+2/@3";
    //logic.match(/@\d/g) //['@1', '@3']
    //logic.replaceAll(/@\d/g,(x,y,z)=>{console.log(x,y,z)})
    // @1 0 @1+2/@3
    // @3 5 @1+2/@3
    if(logic){
        const logicWithValue = logic.replaceAll('@index', index).replaceAll(/@\d/g,(x,y,z)=>{
            console.log('INDEX ',x.replace('@','')-1);
            return fields[x.replace('@','')-1]?.value;
        })
    
        console.log('LOGIC/VALUES ', eval(logicWithValue));
    
        return +eval(logicWithValue);

    }else
    return 0;


}

