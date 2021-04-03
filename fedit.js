const {readFile,writeFile,existsSync}=require('fs'),numbers=['0','1','2','3','4','5','6','7','8','9'];
//—————————————————————————————————————————————————————————————————————————————————
const fedit=function fedit(data,args=[],callback=(err,lines)=>{},encoding='utf-8'){
    if(!Array.isArray(args)){
        let msg='fedit(data,args,callback,encoding) -> args must be array of strings';
        if(!module.parent)console.log(msg);
        else callback(msg,args);
    }
    else{
        let filename='';
        let parse=(flines)=>{
            let searchArr=[],write=false,newfile=false,overwrite=false;
            for(let i=0;i<args.length;i++){
                //---filename
                if(args[i][0]==='<'&&args[i][args[i].length-1]==='>'){
                    newfile=true;
                    if(args[i][1]==='!'){
                        overwrite=true;
                        filename=args[i].substring(2,args[i].length-1);
                    }
                    else filename=args[i].substring(1,args[i].length-1);
                    write=true;
                    continue;
                }
                //---encoding
                if(args[i][0]==='('&&args[i][args[i].length-1]===')'){
                    encoding=args[i].substring(1,args[i].length-1);
                    write=true;
                    continue;
                }
                let start='',end='',range=args[i].indexOf('~');
                //---range
                if(range>-1){
                    for(let r=range-1;numbers.indexOf(args[i][r])>-1&&r>=0;r--){start=args[i][r]+start;}
                    if(start!==''){
                        start=parseInt(start);
                        if(start<1)start=1;
                    }
                    else start=flines.length+1;
                    for(let r=range+1;r<args[i].length;r++){
                        if(args[i][r]==='-')continue;
                        if(numbers.indexOf(args[i][r])>-1)end+=args[i][r];
                    }
                    if(end!==''){
                        end=parseInt(end);
                        if(end<1)end=1;
                    }
                    else end=flines.length+1;
                    if(start===end)end++;
                    else if(start>end)end=start+end;
                }
                //---single
                else{
                    for(let r=0;r<args[i].length;r++){
                        if(args[i][r]==='-')continue;
                        if(numbers.indexOf(args[i][r])>-1)start+=args[i][r];
                    }
                    if(start!==''){
                        start=parseInt(start);
                        if(start<1)start=1;
                    }
                    else start=flines.length+1;
                    end=start+1;
                }
                //---search
                if(args[i][args[i].length-1]==='?'){
                    let tempsearch='';
                    let search=(args[i][args[i].length-2]==='?')?true:false;
                    if(i<args.length-1){
                        tempsearch=args[++i];
                        if(tempsearch[0]==='@'&&tempsearch.length>1){//arg is existing line
                            let temp=-1;
                            if(tempsearch[1]==='?'){//from search lines
                                temp=parseInt(tempsearch.substring(2));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<searchArr.length&&searchArr[temp-1]<flines.length)tempsearch=flines[searchArr[temp-1]];
                                }
                            }
                            else if(tempsearch.length>1){//from all lines
                                temp=parseInt(tempsearch.substring(1));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<flines.length)tempsearch=flines[temp-1];
                                }
                            }
                        }
                    }
                    if(tempsearch!==''){
                        if(search){//search in searchArr '??'
                            let temparr=[];
                            for(let s=start-1;searchArr[s]<flines.length&&s<searchArr.length&&s<end-1;s++){
                                if(flines[searchArr[s]].indexOf(tempsearch)>-1)temparr.push(searchArr[s]);
                            }
                            searchArr=temparr;
                        }
                        else{//search in all '?'
                            searchArr.length=0;
                            for(let s=start-1;s<flines.length&&s<end-1;s++){if(flines[s].indexOf(tempsearch)>-1)searchArr.push(s);}
                        }
                    }
                }
                //---join
                else if(args[i][args[i].length-1]===':'){
                    let tempjoin=' ';//default
                    let search=(args[i][args[i].length-2]==='?')?true:false;
                    if(i<args.length-1){
                        tempjoin=args[++i];
                        if(tempjoin[0]==='@'&&tempjoin.length>1){//arg is existing line
                            let temp=-1;
                            if(tempjoin[1]==='?'){//from search lines
                                temp=parseInt(tempjoin.substring(2));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<searchArr.length&&searchArr[temp-1]<flines.length)tempjoin=flines[searchArr[temp-1]];
                                }
                            }
                            else if(tempjoin.length>1){//from all lines
                                temp=parseInt(tempjoin.substring(1));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<flines.length)tempjoin=flines[temp-1];
                                }
                            }
                        }
                    }
                    if(search){//from searchArr
                        let s=Math.min(end-1,searchArr.length-1);
                        if(s<searchArr.length){for(let ss=s+1;ss<searchArr.length;ss++){searchArr[ss]-=s-start+1;}}
                        let temp=flines[searchArr[s]];
                        flines.splice(searchArr[s],1);
                        searchArr.splice(s,1);
                        s--;
                        for(;s>=start;s--){
                            temp=flines[searchArr[s]]+tempjoin+temp;
                            flines.splice(searchArr[s],1);
                            searchArr.splice(s,1);
                        }
                        if(temp!==''){
                            flines[searchArr[start-1]]+=tempjoin+temp;
                            write=true;
                        }
                    }
                    else{//from all
                        let temp='';
                        let j=Math.min(end-1,flines.length-1);
                        for(;j>=start;j--){
                            temp=flines[j]+tempjoin+temp;
                            flines.splice(j,1);
                        }
                        if(temp!==''){
                            flines[j]+=tempjoin+temp;
                            write=true;
                            searchArr.length=0;
                        }
                    }
                }
                //---split
                else if(args[i][args[i].length-1]==='/'){
                    let tempsep=' ';//default
                    let search=(args[i][args[i].length-2]==='?')?true:false;
                    if(i<args.length-1){
                        tempsep=args[++i];
                        if(tempsep[0]==='@'&&tempsep.length>1){//arg is existing line
                            let temp=-1;
                            if(tempsep[1]==='?'){//from search lines
                                temp=parseInt(tempsep.substring(2));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<searchArr.length&&searchArr[temp-1]<flines.length)tempsep=flines[searchArr[temp-1]];
                                }
                            }
                            else if(tempsep.length>1){//from all lines
                                temp=parseInt(tempsep.substring(1));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<flines.length)tempsep=flines[temp-1];
                                }
                            }
                        }
                    }
                    if(search){//from searchArr
                        let s=start-1,cnt=0;
                        for(;s<end-1&&s<searchArr.length&&searchArr[s]<flines.length;s++){
                            searchArr[s]+=cnt;
                            let temp=flines[searchArr[s]].split(tempsep);
                            flines[searchArr[s]]=temp[0];
                            for(let t=1;t<temp.length;t++){
                                flines.splice(searchArr[s]+t,0,temp[t]);
                                searchArr.splice(s+t,0,searchArr[s]+t);
                                cnt++;
                                end++;
                                s++;
                            }
                            write=true;
                        }
                        for(;s<searchArr.length;s++){searchArr[s]+=cnt;}
                    }
                    else{//from all
                        for(let s=start;s-1<flines.length&&s<end;s++){
                            let temp=flines[s-1].split(tempsep);
                            flines[s-1]=temp[0];
                            for(let t=1;t<temp.length;t++){
                                flines.splice(s+t-1,0,temp[t]);
                                end++;
                                s++;
                            }
                            write=true;
                            searchArr.length=0;
                        }
                    }
                }
                //---move
                else if(args[i][args[i].length-1]==='>'){
                    if(i<args.length-1){
                        let search=(args[i][args[i].length-2]==='?')?true:false;
                        let tempmove=args[++i];
                        if(tempmove[0]==='@'&&tempmove.length>1){//arg is existing line
                            let temp=-1;
                            if(args[i][1]==='?'){//from search lines
                                temp=parseInt(tempmove.substring(2));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<searchArr.length&&searchArr[temp-1]<flines.length)tempmove=searchArr[temp-1];
                                }
                            }
                            else if(tempmove.length>1){//from all lines
                                temp=parseInt(tempmove.substring(1));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<flines.length)tempmove=temp;
                                }
                            }
                        }
                        //if(search){//from search lines
                        //}
                        /*else*/{//from all
                            if(end<=tempmove+1){
                                for(let ii=start;ii<end;ii++,tempmove++){flines.splice(tempmove+1,0,flines[ii-1]);}
                                flines.splice(start-1,end-start);
                                write=true;
                                searchArr.length=0;
                            }
                            else if(start>tempmove+1){
                                let tempend=end;
                                if((end-start>2)&&((end-start)%2!==0))tempend++;
                                for(let ii=start;ii<=tempend;ii+=2,tempmove++){flines.splice(tempmove,0,flines[ii-1]);}
                                flines.splice(end-1,end-start);
                                write=true;
                                searchArr.length=0;
                            }
                        }
                    }
                }
                //---insert
                else if(args[i][args[i].length-1]==='+'||args[i][args[i].length-2]==='+'){
                    let temparg='';//default
                    let search=(args[i][args[i].length-2]==='?'||args[i][args[i].length-3]==='?')?true:false;
                    if(args[i][args[i].length-1]==='='){
                        if(i<args.length-1){
                            i++;
                            temparg=args[i];
                            if(temparg[0]==='@'){//arg is existing line
                                let temp=-1;
                                if(temparg[1]==='?'){//from search lines
                                    temp=parseInt(temparg.substring(2));
                                    temparg='';
                                    if(temp<1)temp=1;
                                    if(temp-1<searchArr.length&&searchArr[temp-1]<flines.length)temparg=flines[searchArr[temp-1]];
                                }
                                else{//from all lines
                                    temp=parseInt(temparg.substring(1));
                                    temparg='';
                                    if(temp<1)temp=1;
                                    if(temp-1<flines.length)temparg=flines[temp-1];
                                }
                            }
                        }
                    }
                    if(search){//from searchArr
                        let s=start-1,cnt=0;
                        for(;s<end-1&&s<searchArr.length&&searchArr[s]<flines.length;s++){
                            searchArr[s]+=cnt;
                            flines.splice(searchArr[s],0,temparg);
                            searchArr.splice(s+1,0,searchArr[s]+1);
                            cnt++;
                            s++;
                            end++;
                            write=true;
                        }
                        if(s<searchArr.length){for(;s<searchArr.length;s++){searchArr[s]+=cnt;}}
                    }
                    else{//from all
                        for(let ii=start;ii<=flines.length+1&&ii<end;ii++){
                            flines.splice(ii-1,0,temparg);
                            write=true;
                            searchArr.length=0;
                        }
                    }
                }
                //---equals
                else if(args[i][args[i].length-1]==='='){
                    let tempequals='';
                    let search=(args[i][args[i].length-2]==='?')?true:false;
                    if(i<args.length-1){
                        tempequals=args[++i];
                        if(tempequals[0]==='@'&&tempequals.length>1){//arg is existing line
                            let temp=-1;
                            if(tempequals[1]==='?'){//from search lines
                                temp=parseInt(tempequals.substring(2));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<searchArr.length&&searchArr[temp-1]<flines.length)tempequals=flines[searchArr[temp-1]];
                                }
                            }
                            else if(tempequals.length>1){//from all lines
                                temp=parseInt(tempequals.substring(1));
                                if(temp!==NaN){
                                    if(temp<1)temp=1;
                                    if(temp-1<flines.length)tempequals=flines[temp-1];
                                }
                            }
                        }
                    }
                    if(search){//from searchArr
                        for(let s=start-1;s<end-1&&s<searchArr.length&&searchArr[s]<flines.length;s++){
                            flines[searchArr[s]]=tempequals;
                            write=true;
                        }
                    }
                    else{//from all
                        for(let e=start;e-1<flines.length&&e<end;e++){
                            flines[e-1]=tempequals;
                            write=true;
                            searchArr.length=0;
                        }
                    }
                }
                //---delete
                else if(args[i][args[i].length-1]==='-'){
                    if(args[i][args[i].length-2]==='?'){//from searchArr
                        let s=Math.min(end-2,searchArr.length-1);
                        if(s<searchArr.length){for(let ss=s+1;ss<searchArr.length;ss++){searchArr[ss]-=s-start+1;}}
                        for(;s>=start-1;s--){
                            if(flines.splice(searchArr[s],1).length>0){
                                searchArr.splice(s,1);
                                write=true;
                            }
                        }
                    }
                    else{//from all
                        flines.splice(Math.max(0,start-1),end-start);
                        write=true;
                        searchArr.length=0;
                    }
                }
                //---print
                else{
                    if(args[i][args[i].length-1]==='<'&&args[i][args[i].length-2]==='?'){//from searchArr
                        for(let s=start-1;s<end-1&&s<searchArr.length&&searchArr[s]<flines.length;s++){
                            console.log('%i:%s',searchArr[s]+1,flines[searchArr[s]]);
                        }
                    }
                    else{//from all
                        for(let p=start-1;p<flines.length&&p<end-1;p++){console.log('%i:%s',p+1,flines[p]);}
                    }
                }
            }
            //---write
            if(write&&filename!==''){
                if(!newfile||!existsSync(filename)||overwrite)writeFile(filename,flines.join('\r\n'),{encoding:'utf8',flag:'w'},(err)=>{callback(err,flines);});
                else if(!module.parent)console.log('fedit() -> <%s> exists! Overwrite with <!%s>',filename);
                else callback('fedit() -> <'+filename+'> exists! Overwrite with <!'+filename+'>',flines);
            }
            else callback(undefined,flines);
        };
        if(data==null){data='';parse([data]);}
        else if(Array.isArray(data))parse(data);
        else if(typeof(data)==='string'){
            filename=data;
            if(filename[filename.length-1]===')'){
                filename=filename.replace(/\s+/g,'');
                let encstart=filename.indexOf('(');
                encoding=filename.substring(encstart+1,filename.length-1);
                filename=filename.substring(0,encstart);
            }
            encoding=encoding.replace('(','').replace(')','');
            readFile(filename,{encoding:encoding,flag:'r'},(err,fdata)=>{
                if(err&&err.code!=='ENOENT'){//other err
                    if(!module.parent)console.log(err);
                    else callback(err);
                }
                else{
                    if(err&&err.code==='ENOENT')fdata='';//new file
                    parse(fdata.split(/\r\n|\r|\n/));
                }
            });
        }
        else{
            let msg='fedit(data,args,callback,encoding) -> data must be array of strings or filename string';
            if(!module.parent)console.log(msg);
            else callback(msg,data);
        }
    }
};
//—————————————————————————————————————————————————————————————————————————————————
//command line, non-args [0,1] & data [2]: [ node.exe, fedit.js, data, arg1, arg2...]
if(!module.parent)fedit(process.argv.splice(0,3)[2],process.argv);
else module.exports=fedit;