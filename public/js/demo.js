$(".note").hide();
$(".btn-save").click(function () {
    var valid = true;
    var data = {};
    $("input,textarea").each(function (index,ele) {
        var val = ele.value;
        if(val.trim() == "") valid = false;
        data[$(ele).attr("for")] = val;
    });
    if(!valid){
        alert("please input all fields");
        return;
    }
    $.post("/makepdf",data,function(res){
        var res = JSON.parse(res);
        if(!res.success){
            alert("Error while make pdf file");
            return;
        }
        var URL = window.URL || window.webkitURL;
        var arr = new Uint8Array(res.data.data);
        var blob = new Blob([arr]);
        var downloadUrl = URL.createObjectURL(blob);
        console.log(downloadUrl)
        var a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "result.pdf";
        document.body.appendChild(a);
        a.click();
        $(".note").show();
        //window.location.href = downloadUrl;
    });
});