# **fedit** 

![npm](https://img.shields.io/npm/v/fedit?style=flat-square)
![node](https://img.shields.io/node/v/cau?style=flat-square)
![license](https://img.shields.io/github/license/fooeybar/fedit?style=flat-square)

</br>

Use fedit to edit files or string arrays by line, directly from the command line or import as a module. See a few [examples](#Examples)</br>

</br>

`npm install fedit`</br>

</br>

Command line</br>
- `node fedit.js `[data](#Data)` `[arg1](#Args)` `[arg2](#Args)` `[arg3](#Args)` etc...`</br>

Module</br>
- `fedit=require('fedit')`</br>
- `fedit(`[data](#Data)`,[`[args](#Args)`],`[callback](#Callback)`(err,lines),`[encoding](#Encoding)`)`</br>
</br>

[File writing](#File-writing)</br></br>

---
## Data
</br>

- a file name string: `'myfile.txt'` with line endings `\r\n` or `\n`, [encoding](#Encoding) argument available (file will be read into memory before arguments are parsed)
- an array of strings: `['line 1','line 2','line 3',etc]`
- an empty string: `''`
- `null`
- `undefined`
</br></br>

---

## Args
</br>

fedit arguments are chainable and use an easy syntax.</br>
An argument syntax starts with a [range](#Range) of lines or a [single](#Single) line, 
followed by a possible [modifier](#Search), an [operator](#Operators), and if the operator requires, a second argument.</br>
Additional arguments are provided for changing the destination file name and encoding.</br></br>

### Range
- `integer~integer`</br>
- Enter two integers separated by a tilde, ex: `1~20`
- Range works as 'line to line', so the end line will not be included
- To end at the last line of an unknown line count omit the end line number, ex: `1~`, would include the entire file
- To start from the last line of an unknown line count omit the starting line number, ex: `~15`, **this will change the usage of the end line number to a count** where applicable, see [insert](#Insert)


### Single
- `integer`</br>
- Enter any integer</br>
- If the number is larger than the file line count, the result for that arg will be a noop
- To start from the last line of an unknown line count omit the line number

</br>

### Operators

- [Search](#Search)
- [Join](#Join)
- [Split](#Split)
- [Move](#Move)
- [Insert](#Insert)
- [Equals](#Equals)
- [Delete](#Delete)
- [Print](#Print)</br>

### Additional arguments
- [Line identifier](#Line-identifier)
- [Filename](#Filename)
- [Encoding](#Encoding)

</br>

### Search
- `?`
- Requires a second argument: substring to match or [line identifier](#Line-identifier), ex: `1~? "xyz"` or `1~? "@?3"`
- Search for lines containing a matching substring and store the results, ex: `1~? "xyz"` will search the entire file for any lines containing "xyz" and store the results
- Search can be applied to itself to further narrow the stored results, ex: `1~? "xyz" 1~?? "abc"` will search all the stored results for any lines containing "abc", remove the old results, and store the new results
- In the same way as above, the search operator can be applied as a modifier to all regular operators, **placed immediately after the line number and before the regular operator**. In this case, the argument line numbers, range or single, are instead **applied to the stored search results**, ex: `2~4?-` will delete the second and third results found in the search. Another ex: [print](#Print)
- Any operator called with the search modifier will update the search results. However, any operator called without the search modifier will clear the stored search results


### Join
- `:`
- Join of many-to-one, the lines will be joined into the first line
- The default join string is a single space `' '` or may take a second argument of a substring, ex: `10~13: ","`, or [line identifier](#Line-identifier)
- If any additional chained arguments follow, the second argument is required
- Ex: `5~9: "+"` will join lines 5,6,7,8 with a "+" separator


### Split
- `/`
- Split of one-to-many, the lines will be inserted directly after the first line
- The default split string is a single space `' '` or may take a second optional argument of a substring, ex: `2~7/ ","`, or [line identifier](#Line-identifier)
- If any additional chained arguments follow, the second argument is required
- Ex: `4~10/ ","` will split lines 4 to 10 on any ","


### Equals
- `=`
- Equals assignment, all specified lines will be overwritten with the new value
- The default equals string is an empty string `''` or may take a second optional argument of a substring, ex: `1~10= "abc"`, or [line identifier](#Line-identifier)
- If any additional chained arguments follow, the second argument is required
- Ex: `10~15= "hello"` will set lines 10,11,12,13,14 to "hello"


### Insert
- `+` or `+=`
- Insert lines at the beginning of the line range to the end
- Ex: `10~15+` will insert 4 lines of empty string starting at line 10
- Ex: `~10+` will add 10 lines of empty string to the end of the file
- The default insert line is an empty string `''` or may take a second optional argument of a substring or [line identifier](#Line-identifier)
- When using using the equals assignment modifier `+=` the second argument is required
- Ex: `1~10+= "abc"` will insert 9 lines of "abc" starting from the beginning of line 1
- Ex: `~10+= "abc"` will add 10 lines of "abc" to the end of the file


### Move
- `>`
- Move specified lines to a different row **!search modifier currently unavailable! noop!**
- Simply rearranges the lines, does not resize the file with line insertions
- Requires a second argument of an integer or [line identifier](#Line-identifier)
- Ex: `3~5> 9` will move lines 3,4 to the beginning of line 9


### Delete
- `-`
- Deletes the specified lines
- Ex: `3~8-` will delete lines 3,4,5,6,7


### Print
- n/a or with search `?<`
- Prints the specified lines to the console
- Ex: `1~` will print to the console the entire file line by line
- Ex with search: `1~? "xyz" 12~100?<` will search the file for any lines containing "xyz" and print out any results starting with the 12th result through the 99th if applicable

</br>

### Line identifier
- `@`
- Can be used as a second argument where applicable
- Starting with `@` a line identifier is an integer to a line in the entire file, ex: `@5`, or with search to refer to a search result, ex: `@?5`

### Filename
- `<filename>`
- Change the destination file at anytime by entering a file name wrapped with carets. By default when using this argument, if the destination file exists the write will fail. In order to overwrite an existing file when changing the destination, include a `!` before the file name: `<!filename>`
- The file name may be changed to empty `<>`. When calling from the command line, changing to an empty file name and using a print command allows viewing the call results without writing the file, ex: `args <> args args 1~`


### Encoding
- `(encoding)`
- Change the destination file encoding at anytime by entering a Node supported encoding in parentheses, ex: `(utf-8)`
- The default encoding used is `'utf-8'`
- To change the source and destination file encoding **from the command line** include the encoding argument in the file name string, ex: `myfile.txt(utf16le)`
</br></br>

---

## File writing
</br>

File writing is asynchronous and is called after all arguments are parsed and executed.</br>

As mentioned in [filename](#Filename), when calling from the command line the file name can be changed to empty `<>` at any time and all lines printed as the last argument `1~` in order to view the call results without writing the file
</br></br>

---

## Callback
`callback(err,lines)`
</br>

Callback is applicable only when calling fedit as an imported module. However, file writing will still occur if a file name is given as [data](#Data) or an [argument](#Args), see [filename](#Filename)</br>
Any errors encountered will be assigned to the `err` variable and any work done will be assigned to the `lines` variable
</br></br>

---
## Examples

- `node fedit.js myfile.js 1~? "//" 1~?- <!newfile.js>`
- From the command line searches in 'myfile.js' for lines with line comments, deletes all the returned search lines and, overwriting if neccessary, saves the result to a new file 'newfile.js'

</br>

- `fedit('myfile.txt',['(utf16le)','<mynewfile.txt>'],(err,lines)=>{console.log('file written');});`
- Called as an imported module, reading 'myfile.txt' with utf-8 encoding and saving into a new file 'mynewfile.txt' using utf16le encoding

</br>

- `node fedit.js server.js 1= 'const server=require("http").createServer((req,res)=>{res.writeHead(200).end("Hello!")});' += 'server.listen(7878,"0.0.0.0",()=>{console.log("server on 7878");});'`
- From the command line create a webserver file named server.js, run it with `node server.js`

</br>

---
