var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

var ei = {
    API_KEY: null,
    blinkup_canvas:null,
    API_BASE_URL: 'https://api.electricimp.com',
    get_token:function(api_key, type, cb){
        this.API_KEY = Base64.encode(api_key);
        var url = this.API_BASE_URL;
        data = {};
        if (type === "production"){
            url += "/v1/setup_tokens";
        } else {
            url += "/enrol";
            data.api_key = api_key;
        }
        $.ajax({
            type: 'POST',
            url:url,
            data: data,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization",
                                      "Basic "+ei.API_KEY);
            },
            success:function(token_info){
                if (token_info.valid_token === false){
                    cb("Invalid API key", null);
                    return;
                }
                cb(null, token_info);
            }
        });
    },
    send_blinkup:function(token_info, ssid, password, canvas_el, cb){
        this.blinkup_canvas = canvas_el;
        ei.blinky(token_info, ssid, password, function(){
            cb();
        });
    },
    tobytestring:function(hexstring){
        // Convert a hex string to a byte string (little endian)
        var bytes = [];
        while(hexstring.length) {
          bytes = String.fromCharCode(parseInt(hexstring.slice(0,2), 16)) + bytes;
          hexstring = hexstring.slice(2);
        }
        return bytes;
    },
    blinky:function(token_info, ssid, password, cb){
        var plan_id = token_info.plan_id || token_info.siteids[0];
        var token = token_info.id || token_info.token;
        flasher.start(ei.tobytestring(token), ei.tobytestring(plan_id), ssid, password, function(){
            cb();
        });
    },
    /* our api uses two diffeerent flows/concepts for tokens */
    get_token_status:function(type, token, cb){
        var retries = 0;
        var url = this.API_BASE_URL;
        if (type === "production"){
            url += "/v1/setup_tokens/"+token;
        } else {
            url += "/v2/setup_tokens/developer";
        }
        console.log("get token status: " + url);
        var timer = setInterval(function(){
            if (retries > 30){
                cb("Timeout waiting for device to connect", null);
            } else {
                $.ajax({
                    type:"GET",
                    url:url,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization",
                                              "Basic "+ei.API_KEY);
                    },
                    success:function(data){
                        retries++;
                        /* having two different flows, concepts and return/calling
                           for tokens is confusing */
                        if (type === "developer"){
                            if (!data.result === "unclaimed token"){
                                clearInterval(timer);
                                cb(null, data);
                            }
                        } else {
                            if (data.impee_id !== ""){
                                clearInterval(timer);
                                cb(null, data);
                            }
                        }
                    }
                });
            }
        }, 1000);
    }
}

var flasher = {
    m_packet:"",
    crc16_table:[
        0x0000, 0xC0C1, 0xC181, 0x0140, 0xC301, 0x03C0, 0x0280, 0xC241,
        0xC601, 0x06C0, 0x0780, 0xC741, 0x0500, 0xC5C1, 0xC481, 0x0440,
        0xCC01, 0x0CC0, 0x0D80, 0xCD41, 0x0F00, 0xCFC1, 0xCE81, 0x0E40,
        0x0A00, 0xCAC1, 0xCB81, 0x0B40, 0xC901, 0x09C0, 0x0880, 0xC841,
        0xD801, 0x18C0, 0x1980, 0xD941, 0x1B00, 0xDBC1, 0xDA81, 0x1A40,
        0x1E00, 0xDEC1, 0xDF81, 0x1F40, 0xDD01, 0x1DC0, 0x1C80, 0xDC41,
        0x1400, 0xD4C1, 0xD581, 0x1540, 0xD701, 0x17C0, 0x1680, 0xD641,
        0xD201, 0x12C0, 0x1380, 0xD341, 0x1100, 0xD1C1, 0xD081, 0x1040,
        0xF001, 0x30C0, 0x3180, 0xF141, 0x3300, 0xF3C1, 0xF281, 0x3240,
        0x3600, 0xF6C1, 0xF781, 0x3740, 0xF501, 0x35C0, 0x3480, 0xF441,
        0x3C00, 0xFCC1, 0xFD81, 0x3D40, 0xFF01, 0x3FC0, 0x3E80, 0xFE41,
        0xFA01, 0x3AC0, 0x3B80, 0xFB41, 0x3900, 0xF9C1, 0xF881, 0x3840,
        0x2800, 0xE8C1, 0xE981, 0x2940, 0xEB01, 0x2BC0, 0x2A80, 0xEA41,
        0xEE01, 0x2EC0, 0x2F80, 0xEF41, 0x2D00, 0xEDC1, 0xEC81, 0x2C40,
        0xE401, 0x24C0, 0x2580, 0xE541, 0x2700, 0xE7C1, 0xE681, 0x2640,
        0x2200, 0xE2C1, 0xE381, 0x2340, 0xE101, 0x21C0, 0x2080, 0xE041,
        0xA001, 0x60C0, 0x6180, 0xA141, 0x6300, 0xA3C1, 0xA281, 0x6240,
        0x6600, 0xA6C1, 0xA781, 0x6740, 0xA501, 0x65C0, 0x6480, 0xA441,
        0x6C00, 0xACC1, 0xAD81, 0x6D40, 0xAF01, 0x6FC0, 0x6E80, 0xAE41,
        0xAA01, 0x6AC0, 0x6B80, 0xAB41, 0x6900, 0xA9C1, 0xA881, 0x6840,
        0x7800, 0xB8C1, 0xB981, 0x7940, 0xBB01, 0x7BC0, 0x7A80, 0xBA41,
        0xBE01, 0x7EC0, 0x7F80, 0xBF41, 0x7D00, 0xBDC1, 0xBC81, 0x7C40,
        0xB401, 0x74C0, 0x7580, 0xB541, 0x7700, 0xB7C1, 0xB681, 0x7640,
        0x7200, 0xB2C1, 0xB381, 0x7340, 0xB101, 0x71C0, 0x7080, 0xB041,
        0x5000, 0x90C1, 0x9181, 0x5140, 0x9301, 0x53C0, 0x5280, 0x9241,
        0x9601, 0x56C0, 0x5780, 0x9741, 0x5500, 0x95C1, 0x9481, 0x5440,
        0x9C01, 0x5CC0, 0x5D80, 0x9D41, 0x5F00, 0x9FC1, 0x9E81, 0x5E40,
        0x5A00, 0x9AC1, 0x9B81, 0x5B40, 0x9901, 0x59C0, 0x5880, 0x9841,
        0x8801, 0x48C0, 0x4980, 0x8941, 0x4B00, 0x8BC1, 0x8A81, 0x4A40,
        0x4E00, 0x8EC1, 0x8F81, 0x4F40, 0x8D01, 0x4DC0, 0x4C80, 0x8C41,
        0x4400, 0x84C1, 0x8581, 0x4540, 0x8701, 0x47C0, 0x4680, 0x8641,
        0x8201, 0x42C0, 0x4380, 0x8341, 0x4100, 0x81C1, 0x8081, 0x4040 ],
    black:'#000000',
    white:'#ffffff',
    grey:'#9f9f9f',
    m_pos:0,
    m_width:0,
    m_height:0,
    cb:null,
    m_animationFrame:null,
    init:function(ssid, password, token, plan){
        // Build a packet
        this.m_crc = 0;
        this.m_packet = "";

        // sync header; as we are going at 30Hz, this only needs to be 32 long
        // to take a second to send
        this.m_packet+="01010101010101010101010101010101";

        // Header
        this.append_byte_nocrc(42);

        // Length of entire packet: 2 byte headers plus fields
        this.append_byte(2+ssid.length+2+password.length+2+16);
        this.append_entry(1, ssid);
        this.append_entry(6, password);

        // Plan & token are converted on the way in from hex strings
        this.append_entry(5, plan + token);

        // Append CRC
        this.append_byte_nocrc(this.m_crc >> 8);
        this.append_byte_nocrc(this.m_crc & 0xff);

        // End with black
        this.m_packet += "0";

        // Get animationFrame at 30fps
        this.m_animationFrame = new AnimationFrame(30);
    },
    get_box:function(){
        // Set stuff up to be hopefully faster
        var box = ei.blinkup_canvas;
        this.m_width = box.width;
        this.m_height = box.height;
        box.style.position = 'absolute';
        box.style.top = '0px';
        box.style.left = '0px';
        box.style.zIndex = 1000;
        var box_c = box.getContext("2d");
        box_c.imageSmoothingEnabled = false;
        return box_c;
    },
    sendbit:function(t) {
        // Draw the flashing box
        if (this.m_packet[this.m_pos] == '2')
            this.m_box.fillStyle = this.white;
        else if (this.m_packet[this.m_pos] == '1')
            this.m_box.fillStyle = this.grey;
        else
            this.m_box.fillStyle = this.black;

        this.m_box.fillRect(0, 0, this.m_width, this.m_height);

        // Reschedule if there's anything left
        var self = this;
        if (++this.m_pos <= this.m_packet.length) {
            this.m_animationFrame.request(function(){
                self.sendbit();
            });
        } else {
            this.cb();
        }
    },

    add_to_crc:function(b) {
        this.m_crc = ((this.m_crc<<8) & 0xffff) ^ this.crc16_table[((this.m_crc>>8)^b)&0xff];
    },
    // Append bit by bit
    append_byte_nocrc:function(b) {
        for(var j=7; j>=0; j--) {
            if (b&(1<<j)) this.m_packet += "02"; else this.m_packet += "01";
        }
    },
    // Append a byte and add it to the CRC
    append_byte:function(b) {
        this.append_byte_nocrc(b);
        this.add_to_crc(b);
    },
    // Append an entry
    append_entry:function(t, s) {
        this.append_byte(t);
        this.append_byte(s.length);
        for(var b=0; b<s.length; b++) this.append_byte(s.charCodeAt(b));
    },

    start:function(token, plan, ssid, password, cb){
        // Cache box
        this.m_box = this.get_box();
        this.cb = cb;
        this.init(ssid, password, token, plan);
        this.sendbit();
    }
};
