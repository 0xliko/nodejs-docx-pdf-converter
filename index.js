const path = require('path');
var fs = require("fs");
const express = require('express');
var bodyParser = require('body-parser')
const compression = require('compression')
const http = require("http");
const app = express();
var server = http.createServer(app);
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
const libre = require('libreoffice-convert');
const { promisify } = require('util');
let lib_convert = promisify(libre.convert)

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


async function convertPdf(template,data){
    var result = {success:true,message:"",data:""};
    var content = fs
        .readFileSync(path.resolve(__dirname, 'public/template/'+template+'.docx'), 'binary');
    var zip = new PizZip(content);
    var doc;
    try {
        doc = new Docxtemplater(zip);

    } catch(error) {
        // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
        result.success = false;
        result.message = error.message;
        return result;
    }
    console.log(data);
    doc.setData(data);
    try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render()
    }
    catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
        result.success = false;
        result.message = error.message;
        return result;
    }
    var buf = doc.getZip()
        .generate({type: 'nodebuffer'});

    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    var outputWordPath = path.resolve(__dirname, 'public/temp/output.docx');
    var outputPdfPath = path.resolve(__dirname, 'public/temp/output.pdf');
    fs.writeFileSync(outputWordPath, buf);
    let done = await lib_convert(buf, '.pdf', undefined);
    fs.writeFileSync(outputPdfPath, done);
    result.data = done;
    return result;

}
app.post("/makepdf",async function(req,res){
     var body = req.body;
     var result = await convertPdf("simple-template",body);
     res.writeHead(200, { 'Content-Type': 'application/download'});
     res.end(JSON.stringify(result));
})
var PORT = 8000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`App listening on port ${PORT}.`);
});

