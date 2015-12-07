// this would be customer bindings to their UI
window.onload = (function () {
    return function () {
        document.getElementById("blinkup").display = "none";
    }
})(window.onload);


function blinkup(type){
    ei.get_token(document.getElementById("api_key").value,
                 type, function(err, token_info){
                     if (err){
                         alert(err);
                         document.getElementById("form").style.display = "block";
                         document.getElementById('blinkup').style.display = "none";
                         return;
                     } else {
                         enrol(token_info, type);
                     }
                 });
}


function enrol(token_info, type){
    var canvas = document.getElementById('blinkup');
    document.getElementById("progress").style.display = "block";
    document.getElementById("form").style.display = "none";
    canvas.style.display = "block";
    ei.send_blinkup(token_info,
                    document.getElementById("ssid").value,
                    document.getElementById("password").value,
                    canvas,function(){
                        canvas.width  = window.innerWidth;
                        canvas.height = window.innerHeight;
                        document.getElementById("form").style.display = "block";
                        document.getElementById("status").style.display = "block";
                        canvas.style.display = "none";
                        // FIXME: Developer token polling endpoint doesn't accept API keys yet.
                        if (type === "developer") return;
                        get_token_status(token_info, type);
                    });
}


function get_token_status(token_info, type){
    document.getElementById("result").innerHTML = "Checking for Device";
    ei.get_token_status(type, token_info.id, function(err, data){
        if (data){
            document.getElementById("result").innerHTML = "Agent <a href='https://agent.electricimp.com/"+data.agent_url+"'>"+data.agent_url+"</a><br>Device: "+data.impee_id;
            document.getElementById("progress").style.display = "none";
        }
        if (err){
            document.getElementById("result").innerHTML = err;
            document.getElementById("progress").style.display = "none";
        }

    });
}
